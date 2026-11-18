"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Download, ImageUp, Loader2, Sparkles } from "lucide-react";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { RESIZE_PRESETS, planResize } from "@/features/photo-editor/resize";
import {
  SIZE_TARGETS,
  fitToFileSize,
  formatBytes,
  parseTargetSize,
  planDimensions,
  planUpscale,
  unsharpMask,
} from "@/features/photo-tools/photo-math";
import { errorMessage, newIdempotencyKey, useBilling } from "@/lib/billing/use-billing";
import { PLANS } from "@/config/plans";

type Tab = "size" | "dimension" | "hd";
type Format = "image/jpeg" | "image/png" | "image/webp";

interface Source {
  name: string;
  bytes: number;
  type: string;
  width: number;
  height: number;
  image: HTMLImageElement;
  url: string;
}

interface Result {
  blob: Blob;
  url: string;
  width: number;
  height: number;
  note?: string;
}

const EXT: Record<Format, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

function toBlob(canvas: HTMLCanvasElement, type: Format, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("ENCODE_FAILED"))), type, quality));
}

/** Draws with stepwise halving/doubling so large changes stay smooth. */
function drawScaled(img: CanvasImageSource, sw: number, sh: number, tw: number, th: number, crop?: { sx: number; sy: number; sw: number; sh: number }) {
  let canvas = document.createElement("canvas");
  let cw = crop ? crop.sw : sw;
  let ch = crop ? crop.sh : sh;
  canvas.width = cw;
  canvas.height = ch;
  let ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, crop?.sx ?? 0, crop?.sy ?? 0, cw, ch, 0, 0, cw, ch);
  while (cw / tw >= 2 || ch / th >= 2 || tw / cw >= 2 || th / ch >= 2) {
    const nw = tw > cw ? Math.min(tw, cw * 2) : Math.max(tw, Math.round(cw / 2));
    const nh = th > ch ? Math.min(th, ch * 2) : Math.max(th, Math.round(ch / 2));
    const next = document.createElement("canvas");
    next.width = nw;
    next.height = nh;
    const nctx = next.getContext("2d")!;
    nctx.imageSmoothingEnabled = true;
    nctx.imageSmoothingQuality = "high";
    nctx.drawImage(canvas, 0, 0, nw, nh);
    canvas = next;
    ctx = nctx;
    cw = nw;
    ch = nh;
  }
  if (cw !== tw || ch !== th) {
    const last = document.createElement("canvas");
    last.width = tw;
    last.height = th;
    const lctx = last.getContext("2d")!;
    lctx.imageSmoothingEnabled = true;
    lctx.imageSmoothingQuality = "high";
    lctx.drawImage(canvas, 0, 0, tw, th);
    canvas = last;
  }
  return canvas;
}

function withWhiteBackground(canvas: HTMLCanvasElement) {
  const out = document.createElement("canvas");
  out.width = canvas.width;
  out.height = canvas.height;
  const ctx = out.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, out.width, out.height);
  ctx.drawImage(canvas, 0, 0);
  return out;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("LOAD_FAILED"));
    img.src = src;
  });
}

export default function PhotoToolsPage() {
  const billing = useBilling();
  const [source, setSource] = useState<Source | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [tab, setTab] = useState<Tab>("size");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Ukuran file
  const [targetBytes, setTargetBytes] = useState<number>(SIZE_TARGETS[2].bytes);
  const [customSize, setCustomSize] = useState("");
  const [customUnit, setCustomUnit] = useState<"KB" | "MB">("KB");

  // Dimensi
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [keepAspect, setKeepAspect] = useState(true);
  const [format, setFormat] = useState<Format>("image/jpeg");
  const [quality, setQuality] = useState(90);

  // HD
  const [factor, setFactor] = useState<2 | 4>(2);
  const [hdMode, setHdMode] = useState<"standard" | "ai">("standard");

  const resultRef = useRef<Result | null>(null);
  useEffect(() => {
    resultRef.current = result;
  }, [result]);
  useEffect(() => () => {
    if (resultRef.current) URL.revokeObjectURL(resultRef.current.url);
  }, []);

  const setNewResult = useCallback((next: Result | null) => {
    setResult((prev) => {
      if (prev) URL.revokeObjectURL(prev.url);
      return next;
    });
  }, []);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      setError("Format harus JPG, PNG, atau WebP.");
      return;
    }
    if (file.size > 40 * 1024 * 1024) {
      setError("File terlalu besar (maks 40 MB).");
      return;
    }
    const url = URL.createObjectURL(file);
    try {
      const image = await loadImage(url);
      if (source) URL.revokeObjectURL(source.url);
      setSource({ name: file.name, bytes: file.size, type: file.type, width: image.naturalWidth, height: image.naturalHeight, image, url });
      setWidth(String(image.naturalWidth));
      setHeight(String(image.naturalHeight));
      setNewResult(null);
    } catch {
      URL.revokeObjectURL(url);
      setError("Foto tidak bisa dibuka.");
    }
  };

  const run = async (job: () => Promise<Result>) => {
    if (!source || busy) return;
    setBusy(true);
    setError(null);
    try {
      setNewResult(await job());
    } catch (e) {
      setError(e instanceof Error && e.message.startsWith("MSG:") ? e.message.slice(4) : "Proses gagal. Coba foto lain atau ukuran lebih kecil.");
    } finally {
      setBusy(false);
    }
  };

  const compressToSize = () => run(async () => {
    const s = source!;
    const cache = new Map<string, HTMLCanvasElement>();
    const canvasFor = (w: number, h: number) => {
      const key = `${w}x${h}`;
      if (!cache.has(key)) cache.set(key, withWhiteBackground(drawScaled(s.image, s.width, s.height, w, h)));
      return cache.get(key)!;
    };
    const plan = await fitToFileSize(s.width, s.height, targetBytes, async (w, h, q) => (await toBlob(canvasFor(w, h), "image/jpeg", q)).size);
    const blob = await toBlob(canvasFor(plan.width, plan.height), "image/jpeg", plan.quality);
    return {
      blob,
      url: URL.createObjectURL(blob),
      width: plan.width,
      height: plan.height,
      note: plan.reached
        ? `Kualitas JPEG ${Math.round(plan.quality * 100)}%${plan.width !== s.width ? ", dimensi ikut diperkecil" : ""}.`
        : "Target terlalu kecil untuk foto ini; ini hasil terkecil yang masih layak.",
    };
  });

  const resizeDimensions = () => run(async () => {
    const s = source!;
    const dims = planDimensions(s.width, s.height, { width: Number(width) || null, height: Number(height) || null, keepAspect });
    if (!dims) throw new Error("MSG:Isi lebar atau tinggi (maks 6000 px).");
    let canvas = drawScaled(s.image, s.width, s.height, dims.width, dims.height);
    if (format === "image/jpeg") canvas = withWhiteBackground(canvas);
    const blob = await toBlob(canvas, format, format === "image/png" ? undefined : quality / 100);
    return { blob, url: URL.createObjectURL(blob), width: dims.width, height: dims.height };
  });

  const applyPreset = (id: string) => run(async () => {
    const s = source!;
    const preset = RESIZE_PRESETS.find((p) => p.id === id)!;
    const plan = planResize(s.width, s.height, preset);
    const canvas = withWhiteBackground(drawScaled(s.image, s.width, s.height, plan.outWidth, plan.outHeight, { sx: plan.sx, sy: plan.sy, sw: plan.sw, sh: plan.sh }));
    const blob = await toBlob(canvas, preset.format, preset.quality);
    return { blob, url: URL.createObjectURL(blob), width: plan.outWidth, height: plan.outHeight, note: preset.label };
  });

  const makeHd = () => run(async () => {
    const s = source!;
    let base: CanvasImageSource = s.image;
    let bw = s.width;
    let bh = s.height;
    if (hdMode === "ai") {
      // Send a manageable copy; the AI result is then scaled to the HD size.
      const longest = Math.max(s.width, s.height);
      const scale = Math.min(1, 2048 / longest);
      const send = withWhiteBackground(drawScaled(s.image, s.width, s.height, Math.round(s.width * scale), Math.round(s.height * scale)));
      const form = new FormData();
      form.append("image", await toBlob(send, "image/jpeg", 0.92), "photo.jpg");
      form.append("idempotencyKey", newIdempotencyKey("hd"));
      const res = await fetch("/api/photo/enhance", { method: "POST", body: form });
      const data = await res.json();
      if (!data?.ok || typeof data.imageBase64 !== "string") throw new Error("MSG:" + errorMessage(data?.code));
      const img = await loadImage(`data:${data.mimeType || "image/png"};base64,${data.imageBase64}`);
      base = img;
      bw = img.naturalWidth;
      bh = img.naturalHeight;
      void billing.refresh();
    }
    const target = planUpscale(s.width, s.height, factor);
    const canvas = drawScaled(base, bw, bh, target.width, target.height);
    const ctx = canvas.getContext("2d")!;
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    unsharpMask(pixels.data, canvas.width, canvas.height, hdMode === "ai" ? 0.3 : factor === 4 ? 0.8 : 0.6);
    ctx.putImageData(pixels, 0, 0);
    const outType: Format = s.type === "image/png" ? "image/png" : "image/jpeg";
    const blob = await toBlob(outType === "image/jpeg" ? withWhiteBackground(canvas) : canvas, outType, 0.92);
    return {
      blob,
      url: URL.createObjectURL(blob),
      width: target.width,
      height: target.height,
      note: target.factor < factor ? `Diperbesar ${target.factor}× (batas 6000 px).` : `Diperbesar ${factor}×.`,
    };
  });

  const download = () => {
    if (!result || !source) return;
    const a = document.createElement("a");
    const base = source.name.replace(/\.[a-z0-9]+$/i, "");
    const ext = EXT[(result.blob.type as Format)] ?? "jpg";
    a.href = result.url;
    a.download = `${base}-${result.width}x${result.height}.${ext}`;
    a.click();
  };

  const change = result && source ? Math.round(((result.blob.size - source.bytes) / source.bytes) * 100) : 0;
  const aiLocked = billing.mode !== "live";

  return (
    <WorkspaceShell title="Ukuran & HD" subtitle="Perkecil ukuran file, ubah dimensi, atau perjelas foto">
      <div className="space-y-6">
        {/* Upload */}
        <label
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); void handleFile(e.dataTransfer.files?.[0]); }}
          className={`block p-6 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-colors ${
            dragOver ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]"
          }`}
        >
          <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => void handleFile(e.target.files?.[0])} />
          <ImageUp className="w-7 h-7 mx-auto text-[var(--accent-text)]" />
          {source ? (
            <p className="mt-2 text-sm">
              <span className="font-semibold">{source.name}</span>
              <span className="text-[var(--muted)]"> · {source.width} × {source.height} px · {formatBytes(source.bytes)} · ganti foto</span>
            </p>
          ) : (
            <p className="mt-2 text-sm"><span className="font-semibold">Pilih foto</span> <span className="text-[var(--muted)]">atau tarik ke sini (JPG, PNG, WebP)</span></p>
          )}
        </label>

        {error && <div role="alert" className="p-3 rounded-xl border border-red-500/40 bg-red-500/10 text-sm">{error}</div>}

        <div className="grid lg:grid-cols-5 gap-6 items-start">
          {/* Controls */}
          <div className="lg:col-span-2 p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-5">
            <div role="tablist" className="grid grid-cols-3 p-1 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-sm">
              {([
                ["size", "Ukuran file"],
                ["dimension", "Dimensi"],
                ["hd", "Jadikan HD"],
              ] as const).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={tab === id}
                  onClick={() => setTab(id)}
                  className={`py-2 rounded-lg font-semibold ${tab === id ? "bg-[var(--accent)] text-neutral-950" : "text-[var(--muted)] hover:text-[var(--text)]"}`}
                >
                  {label}
                </button>
              ))}
            </div>

            {tab === "size" && (
              <div className="space-y-4 text-sm">
                <p className="text-[var(--muted)]">Perkecil file sampai di bawah batas tertentu, misalnya untuk upload ke portal atau WhatsApp.</p>
                <div className="flex flex-wrap gap-2">
                  {SIZE_TARGETS.map((t) => (
                    <button
                      key={t.label}
                      type="button"
                      onClick={() => { setTargetBytes(t.bytes); setCustomSize(""); }}
                      className={`px-3 py-1.5 rounded-lg border font-semibold ${targetBytes === t.bytes && !customSize ? "bg-[var(--accent)] border-[var(--accent)] text-neutral-950" : "border-[var(--border)] bg-[var(--bg)]"}`}
                    >
                      Maks {t.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 items-center">
                  <span className="text-[var(--muted)] shrink-0">Atau isi sendiri</span>
                  <input
                    inputMode="decimal"
                    value={customSize}
                    onChange={(e) => {
                      setCustomSize(e.target.value);
                      const b = parseTargetSize(e.target.value, customUnit);
                      if (b) setTargetBytes(b);
                    }}
                    placeholder="300"
                    className="w-24 px-3 py-2 rounded-xl bg-[var(--bg)] border border-[var(--border)]"
                  />
                  <select
                    value={customUnit}
                    onChange={(e) => {
                      const unit = e.target.value as "KB" | "MB";
                      setCustomUnit(unit);
                      const b = parseTargetSize(customSize, unit);
                      if (b) setTargetBytes(b);
                    }}
                    className="px-3 py-2 rounded-xl bg-[var(--bg)] border border-[var(--border)]"
                  >
                    <option>KB</option>
                    <option>MB</option>
                  </select>
                </div>
                <button type="button" disabled={!source || busy} onClick={compressToSize} className="w-full py-3 rounded-xl bg-[var(--accent)] text-neutral-950 font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                  {busy && <Loader2 className="w-4 h-4 animate-spin" />}Perkecil ke maks {formatBytes(targetBytes)}
                </button>
                {source && source.bytes <= targetBytes && (
                  <p className="text-[var(--muted)]">Foto ini sudah lebih kecil dari target. Hasilnya tetap dibuat ulang sebagai JPG.</p>
                )}
              </div>
            )}

            {tab === "dimension" && (
              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-semibold mb-2">Ukuran siap pakai</p>
                  <div className="flex flex-wrap gap-2">
                    {RESIZE_PRESETS.map((p) => (
                      <button key={p.id} type="button" disabled={!source || busy} onClick={() => applyPreset(p.id)} className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg)] hover:border-[var(--accent)] disabled:opacity-50">
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="pt-4 border-t border-[var(--border)] space-y-3">
                  <p className="font-semibold">Ukuran sendiri</p>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="text-[var(--muted)]">Lebar (px)</span>
                      <input
                        inputMode="numeric"
                        value={width}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, "");
                          setWidth(v);
                          if (keepAspect && source && v) setHeight(String(Math.round((source.height * Number(v)) / source.width)));
                        }}
                        className="mt-1 w-full px-3 py-2 rounded-xl bg-[var(--bg)] border border-[var(--border)]"
                      />
                    </label>
                    <label className="block">
                      <span className="text-[var(--muted)]">Tinggi (px)</span>
                      <input
                        inputMode="numeric"
                        value={height}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, "");
                          setHeight(v);
                          if (keepAspect && source && v) setWidth(String(Math.round((source.width * Number(v)) / source.height)));
                        }}
                        className="mt-1 w-full px-3 py-2 rounded-xl bg-[var(--bg)] border border-[var(--border)]"
                      />
                    </label>
                  </div>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={keepAspect} onChange={(e) => setKeepAspect(e.target.checked)} className="w-4 h-4 accent-[var(--accent)]" />
                    Kunci perbandingan (foto tidak gepeng)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="text-[var(--muted)]">Format</span>
                      <select value={format} onChange={(e) => setFormat(e.target.value as Format)} className="mt-1 w-full px-3 py-2 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
                        <option value="image/jpeg">JPG</option>
                        <option value="image/png">PNG</option>
                        <option value="image/webp">WebP</option>
                      </select>
                    </label>
                    {format !== "image/png" && (
                      <label className="block">
                        <span className="text-[var(--muted)]">Kualitas {quality}%</span>
                        <input type="range" min={40} max={100} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="mt-3 w-full accent-[var(--accent)]" />
                      </label>
                    )}
                  </div>
                  <button type="button" disabled={!source || busy} onClick={resizeDimensions} className="w-full py-3 rounded-xl bg-[var(--accent)] text-neutral-950 font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                    {busy && <Loader2 className="w-4 h-4 animate-spin" />}Ubah ukuran
                  </button>
                </div>
              </div>
            )}

            {tab === "hd" && (
              <div className="space-y-4 text-sm">
                <p className="text-[var(--muted)]">Perbesar resolusi dan pertajam foto yang buram atau kecil.</p>
                <div>
                  <p className="font-semibold mb-2">Perbesar</p>
                  <div className="flex gap-2">
                    {([2, 4] as const).map((f) => (
                      <button key={f} type="button" onClick={() => setFactor(f)} className={`flex-1 py-2 rounded-lg border font-semibold ${factor === f ? "bg-[var(--accent)] border-[var(--accent)] text-neutral-950" : "border-[var(--border)] bg-[var(--bg)]"}`}>
                        {f}×{source ? ` · ${planUpscale(source.width, source.height, f).width} px` : ""}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold">Cara</p>
                  <label className={`flex gap-3 p-3 rounded-xl border cursor-pointer ${hdMode === "standard" ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[var(--border)] bg-[var(--bg)]"}`}>
                    <input type="radio" name="hd" checked={hdMode === "standard"} onChange={() => setHdMode("standard")} className="mt-1 accent-[var(--accent)]" />
                    <span><span className="font-semibold block">Standar · gratis</span><span className="text-[var(--muted)]">Diperbesar dan dipertajam di perangkat Anda. Isi foto tidak berubah.</span></span>
                  </label>
                  <label className={`flex gap-3 p-3 rounded-xl border cursor-pointer ${hdMode === "ai" ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[var(--border)] bg-[var(--bg)]"}`}>
                    <input type="radio" name="hd" checked={hdMode === "ai"} onChange={() => setHdMode("ai")} className="mt-1 accent-[var(--accent)]" />
                    <span>
                      <span className="font-semibold block">Dengan AI · 1 kuota edit foto</span>
                      <span className="text-[var(--muted)]">Lebih tajam untuk foto yang sangat buram. AI bisa sedikit mengubah detail kecil, jadi bandingkan hasilnya.</span>
                      {billing.mode === "live" && billing.usage && (
                        <span className="block mt-1 text-[var(--muted)]">Sisa bulan ini: {Math.max(0, (billing.limits?.ai_photo ?? PLANS[billing.planId].quotas.ai_photo) - billing.usage.ai_photo)}</span>
                      )}
                      {aiLocked && <span className="block mt-1 text-[var(--muted)]">{billing.mode === "signed-out" ? "Perlu login." : "Belum diaktifkan oleh admin."}</span>}
                    </span>
                  </label>
                </div>
                <button
                  type="button"
                  disabled={!source || busy || (hdMode === "ai" && aiLocked)}
                  onClick={makeHd}
                  className="w-full py-3 rounded-xl bg-[var(--accent)] text-neutral-950 font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Jadikan HD
                </button>
              </div>
            )}
          </div>

          {/* Before / after */}
          <div className="lg:col-span-3 p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-4">
            {!source ? (
              <p className="py-16 text-center text-sm text-[var(--muted)]">Pilih foto untuk mulai.</p>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 gap-4">
                  <figure className="space-y-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={source.url} alt="Foto asli" className="w-full h-56 object-contain rounded-xl bg-[var(--bg)] border border-[var(--border)]" />
                    <figcaption className="text-sm">
                      <span className="font-semibold">Asli</span>
                      <span className="text-[var(--muted)]"> · {source.width} × {source.height} px · {formatBytes(source.bytes)}</span>
                    </figcaption>
                  </figure>
                  <figure className="space-y-2">
                    {result ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={result.url} alt="Hasil" className="w-full h-56 object-contain rounded-xl bg-[var(--bg)] border border-[var(--border)]" />
                    ) : (
                      <div className="w-full h-56 rounded-xl border border-dashed border-[var(--border)] flex items-center justify-center text-sm text-[var(--muted)]">
                        {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : "Hasil muncul di sini"}
                      </div>
                    )}
                    {result && (
                      <figcaption className="text-sm">
                        <span className="font-semibold">Hasil</span>
                        <span className="text-[var(--muted)]"> · {result.width} × {result.height} px · {formatBytes(result.blob.size)}</span>
                        <span className={change <= 0 ? " text-green-700" : " text-[var(--muted)]"}> ({change > 0 ? "+" : ""}{change}%)</span>
                      </figcaption>
                    )}
                  </figure>
                </div>
                {result?.note && <p className="text-sm text-[var(--muted)]">{result.note}</p>}
                <button
                  type="button"
                  disabled={!result}
                  onClick={download}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[var(--accent)] text-neutral-950 font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Unduh hasil
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}
