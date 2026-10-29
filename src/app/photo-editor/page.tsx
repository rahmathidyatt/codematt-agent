"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Wand2,
  Undo2,
  RotateCcw,
  Download,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Eye,
  EyeOff,
  Upload,
  ArrowRight,
  FileCheck,
  Check,
  Building2,
  Car,
  Phone,
  Zap,
} from "lucide-react";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { useAgentStore } from "@/lib/store";
import {
  PhotoDirectiveType,
  RedactionPatchMethod,
  TargetRegion,
  AppliedDirective,
  PRESET_DIRECTIVES,
} from "@/features/photo-editor/contracts";
import {
  validateDirectiveInstruction,
  applyPixelate,
  applyBlur,
  applySmartInpaint,
  formatRegionCoordinates,
  getDirectiveMethodLabel,
} from "@/features/photo-editor/photo-utils";

interface SamplePhoto {
  id: string;
  title: string;
  description: string;
  width: number;
  height: number;
  defaultDirectiveType: PhotoDirectiveType;
  suggestedRegion: TargetRegion;
  presetInstruction: string;
  render: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
}

const SAMPLE_PHOTOS: SamplePhoto[] = [
  {
    id: "sample-house-sentul",
    title: "Rumah Modern Sentul Hills (No. 42 & Plat Mobil)",
    description: "Tampak depan hunian dengan plat nomor rumah 'No. 42' di pagar dan plat mobil 'B 8829 ERI' di carport.",
    width: 900,
    height: 600,
    defaultDirectiveType: "remove_house_number",
    suggestedRegion: { x: 135, y: 350, width: 85, height: 48 },
    presetInstruction: "Sensor dan hapus plat nomor rumah 'No. 42' pada pilar pagar, ratakan warna batu alam tanpa merusak dinding.",
    render: (ctx, w, h) => {
      // Sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.4);
      skyGrad.addColorStop(0, "#bfdbfe");
      skyGrad.addColorStop(1, "#eff6ff");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h * 0.4);

      // Distant mountain
      ctx.fillStyle = "#93c5fd";
      ctx.beginPath();
      ctx.moveTo(0, h * 0.35);
      ctx.lineTo(w * 0.3, h * 0.22);
      ctx.lineTo(w * 0.65, h * 0.32);
      ctx.lineTo(w, h * 0.25);
      ctx.lineTo(w, h * 0.4);
      ctx.lineTo(0, h * 0.4);
      ctx.fill();

      // House main building
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(w * 0.2, h * 0.18, w * 0.65, h * 0.55);

      // Dark roof
      ctx.fillStyle = "#1e293b";
      ctx.beginPath();
      ctx.moveTo(w * 0.15, h * 0.18);
      ctx.lineTo(w * 0.55, h * 0.08);
      ctx.lineTo(w * 0.9, h * 0.18);
      ctx.fill();

      // Modern wood slat panel accent
      ctx.fillStyle = "#b45309";
      ctx.fillRect(w * 0.55, h * 0.2, w * 0.25, h * 0.3);
      ctx.strokeStyle = "#78350f";
      ctx.lineWidth = 2;
      for (let x = w * 0.55; x < w * 0.8; x += 12) {
        ctx.beginPath();
        ctx.moveTo(x, h * 0.2);
        ctx.lineTo(x, h * 0.5);
        ctx.stroke();
      }

      // Large glass balcony / windows
      ctx.fillStyle = "#0284c7";
      ctx.fillRect(w * 0.25, h * 0.24, w * 0.22, h * 0.22);
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 4;
      ctx.strokeRect(w * 0.25, h * 0.24, w * 0.22, h * 0.22);

      // Ground / Driveway
      ctx.fillStyle = "#e2e8f0";
      ctx.fillRect(0, h * 0.65, w, h * 0.35);
      ctx.fillStyle = "#94a3b8";
      ctx.fillRect(w * 0.45, h * 0.65, w * 0.5, h * 0.35);

      // Garden lawn
      ctx.fillStyle = "#22c55e";
      ctx.fillRect(0, h * 0.72, w * 0.45, h * 0.28);

      // Front Stone Fence Pillar (Holds the House Number Plate)
      ctx.fillStyle = "#475569";
      ctx.fillRect(w * 0.12, h * 0.52, w * 0.15, h * 0.3);
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 2;
      ctx.strokeRect(w * 0.12, h * 0.52, w * 0.15, h * 0.3);

      // HOUSE NUMBER PLAQUE (The exact redaction target: "No. 42")
      const numX = 135;
      const numY = 350;
      const numW = 85;
      const numH = 48;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(numX, numY, numW, numH);
      ctx.strokeStyle = "#f5b800"; // Brighton golden border
      ctx.lineWidth = 3;
      ctx.strokeRect(numX, numY, numW, numH);
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 20px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("No. 42", numX + numW / 2, numY + numH / 2);

      // Car parked in carport
      const carX = w * 0.55;
      const carY = h * 0.6;
      ctx.fillStyle = "#334155";
      ctx.beginPath();
      ctx.roundRect(carX, carY + 30, 200, 75, 12);
      ctx.fill();
      ctx.fillStyle = "#475569";
      ctx.beginPath();
      ctx.roundRect(carX + 35, carY, 130, 45, 16);
      ctx.fill();

      // Car license plate ("B 8829 ERI")
      const plateX = carX + 65;
      const plateY = carY + 70;
      const plateW = 75;
      const plateH = 26;
      ctx.fillStyle = "#000000";
      ctx.fillRect(plateX, plateY, plateW, plateH);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(plateX, plateY, plateW, plateH);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 10px monospace";
      ctx.fillText("B 8829 ERI", plateX + plateW / 2, plateY + plateH / 2);
    },
  },
  {
    id: "sample-villa-banner",
    title: "Villa Puncak (Dengan Spanduk DIJUAL 0812-9988-7766)",
    description: "Villa bernuansa asri namun memiliki spanduk kontak agen lama yang harus dibersihkan untuk listing baru.",
    width: 900,
    height: 600,
    defaultDirectiveType: "remove_phone_banner",
    suggestedRegion: { x: 300, y: 390, width: 300, height: 60 },
    presetInstruction: "Hilangkan teks spanduk 'DIJUAL' dan nomor telepon di pagar villa, ganti dengan warna pagar kayu alami.",
    render: (ctx, w, h) => {
      // Tropical sky & trees
      ctx.fillStyle = "#e0f2fe";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#15803d";
      ctx.beginPath();
      ctx.arc(150, 180, 120, 0, Math.PI * 2);
      ctx.arc(750, 180, 140, 0, Math.PI * 2);
      ctx.fill();

      // Villa roof & walls
      ctx.fillStyle = "#78350f";
      ctx.beginPath();
      ctx.moveTo(w * 0.2, h * 0.35);
      ctx.lineTo(w * 0.5, h * 0.15);
      ctx.lineTo(w * 0.8, h * 0.35);
      ctx.fill();

      ctx.fillStyle = "#fef3c7";
      ctx.fillRect(w * 0.24, h * 0.35, w * 0.52, h * 0.35);

      // Wooden front gate
      ctx.fillStyle = "#92400e";
      ctx.fillRect(w * 0.15, h * 0.6, w * 0.7, h * 0.28);
      ctx.strokeStyle = "#451a03";
      ctx.lineWidth = 3;
      for (let x = w * 0.15; x < w * 0.85; x += 35) {
        ctx.beginPath();
        ctx.moveTo(x, h * 0.6);
        ctx.lineTo(x, h * 0.88);
        ctx.stroke();
      }

      // Yellow banner with phone number ("DIJUAL 0812-9988-7766")
      const bx = 300;
      const by = 390;
      const bw = 300;
      const bh = 60;
      ctx.fillStyle = "#dc2626"; // Red eye-catching banner
      ctx.fillRect(bx, by, bw, bh);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.strokeRect(bx, by, bw, bh);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 16px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("DIJUAL: 0812-9988-7766", bx + bw / 2, by + bh / 2);
    },
  },
  {
    id: "sample-ruko-clutter",
    title: "Ruko Komersial (Kabel Melintang & Plat Motor)",
    description: "Ruko tepi jalan dengan kabel listrik melintang di atas dan plat nomor motor depan ruko.",
    width: 900,
    height: 600,
    defaultDirectiveType: "remove_wires",
    suggestedRegion: { x: 100, y: 80, width: 700, height: 60 },
    presetInstruction: "Bersihkan kabel listrik hitam yang melintang di depan fasad ruko agar tampak bersih dan modern.",
    render: (ctx, w, h) => {
      ctx.fillStyle = "#f1f5f9";
      ctx.fillRect(0, 0, w, h);

      // Commercial 3-story building
      ctx.fillStyle = "#334155";
      ctx.fillRect(w * 0.2, h * 0.15, w * 0.6, h * 0.75);

      // Large glass shopfronts
      ctx.fillStyle = "#38bdf8";
      ctx.fillRect(w * 0.25, h * 0.25, w * 0.5, h * 0.18);
      ctx.fillRect(w * 0.25, h * 0.5, w * 0.5, h * 0.18);

      // Pavement
      ctx.fillStyle = "#64748b";
      ctx.fillRect(0, h * 0.85, w, h * 0.15);

      // Overhead dangling wire clutter
      ctx.strokeStyle = "#09090b";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(50, 100);
      ctx.quadraticCurveTo(w * 0.5, 140, w - 50, 95);
      ctx.stroke();

      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(50, 115);
      ctx.quadraticCurveTo(w * 0.45, 155, w - 50, 110);
      ctx.stroke();
    },
  },
];

export default function PropertyPhotoEditorPage() {
  const { locale } = useAgentStore();

  const originalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [selectedSample, setSelectedSample] = useState<SamplePhoto>(SAMPLE_PHOTOS[0]);
  const [selectedDirectiveType, setSelectedDirectiveType] = useState<PhotoDirectiveType>(
    "remove_house_number"
  );
  const [patchMethod, setPatchMethod] = useState<RedactionPatchMethod>("inpaint");
  const [instructionText, setInstructionText] = useState<string>(
    SAMPLE_PHOTOS[0].presetInstruction
  );
  const [instructionError, setInstructionError] = useState<string | null>(null);

  // Target selection state
  const [targetRegion, setTargetRegion] = useState<TargetRegion | null>(
    SAMPLE_PHOTOS[0].suggestedRegion
  );
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);

  // History & Applied Directives
  const [appliedDirectives, setAppliedDirectives] = useState<AppliedDirective[]>([]);
  const [canvasHistory, setCanvasHistory] = useState<ImageData[]>([]);

  // View Mode: side-by-side or comparison toggle
  const [viewOriginal, setViewOriginal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Redraw base image whenever sample changes
  const loadSample = useCallback(
    (sample: SamplePhoto) => {
      setSelectedSample(sample);
      setSelectedDirectiveType(sample.defaultDirectiveType);
      setInstructionText(sample.presetInstruction);
      setTargetRegion(sample.suggestedRegion);
      setAppliedDirectives([]);
      setCanvasHistory([]);

      const origCanvas = originalCanvasRef.current;
      const actCanvas = activeCanvasRef.current;
      if (!origCanvas || !actCanvas) return;

      origCanvas.width = sample.width;
      origCanvas.height = sample.height;
      actCanvas.width = sample.width;
      actCanvas.height = sample.height;

      const origCtx = origCanvas.getContext("2d");
      const actCtx = actCanvas.getContext("2d");
      if (!origCtx || !actCtx) return;

      sample.render(origCtx, sample.width, sample.height);
      sample.render(actCtx, sample.width, sample.height);

      // Save base state
      const initialSnapshot = actCtx.getImageData(0, 0, sample.width, sample.height);
      setCanvasHistory([initialSnapshot]);
    },
    []
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      loadSample(SAMPLE_PHOTOS[0]);
    }, 0);
    return () => clearTimeout(timer);
  }, [loadSample]);

  // Handle preset directive click
  const handleSelectPresetDirective = (preset: (typeof PRESET_DIRECTIVES)[0]) => {
    setSelectedDirectiveType(preset.type);
    setPatchMethod(preset.defaultMethod);
    setInstructionText(preset.suggestedInstruction);
    setInstructionError(null);

    // If on current sample photo, map default region
    if (preset.type === "remove_house_number" && selectedSample.id === "sample-house-sentul") {
      setTargetRegion({ x: 135, y: 350, width: 85, height: 48 });
    } else if (
      preset.type === "remove_license_plate" &&
      selectedSample.id === "sample-house-sentul"
    ) {
      setTargetRegion({ x: 560, y: 430, width: 75, height: 26 });
    } else if (
      preset.type === "remove_phone_banner" &&
      selectedSample.id === "sample-villa-banner"
    ) {
      setTargetRegion({ x: 300, y: 390, width: 300, height: 60 });
    } else if (
      preset.type === "remove_wires" &&
      selectedSample.id === "sample-ruko-clutter"
    ) {
      setTargetRegion({ x: 100, y: 80, width: 700, height: 60 });
    }
  };

  // Canvas Mouse Events for Interactive Drag-to-Target Selection
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = activeCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setIsDrawing(true);
    setStartPoint({ x, y });
    setTargetRegion({ x, y, width: 4, height: 4 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint) return;
    const canvas = activeCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const curX = (e.clientX - rect.left) * scaleX;
    const curY = (e.clientY - rect.top) * scaleY;

    const x = Math.min(startPoint.x, curX);
    const y = Math.min(startPoint.y, curY);
    const width = Math.max(10, Math.abs(curX - startPoint.x));
    const height = Math.max(10, Math.abs(curY - startPoint.y));

    setTargetRegion({ x, y, width, height });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setStartPoint(null);
  };

  // Apply the directive with strict pixel adherence
  const handleExecuteDirective = () => {
    const validation = validateDirectiveInstruction(instructionText);
    if (!validation.valid) {
      setInstructionError(validation.error || "Instruksi tidak valid");
      return;
    }
    setInstructionError(null);

    const canvas = activeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (!targetRegion || targetRegion.width <= 2 || targetRegion.height <= 2) {
      setInstructionError(
        locale === "id"
          ? "Silakan tentukan area target (klik & drag pada kanvas foto)"
          : "Please specify target area by dragging on the photo"
      );
      return;
    }

    // Save previous state to history stack for undo
    const preSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setCanvasHistory((prev) => [...prev, preSnapshot]);

    // Apply the specific patch method ONLY to the designated target region!
    if (patchMethod === "inpaint") {
      applySmartInpaint(ctx, targetRegion);
    } else if (patchMethod === "blur") {
      applyBlur(ctx, targetRegion, 12);
    } else if (patchMethod === "pixelate") {
      applyPixelate(ctx, targetRegion, 8);
    }

    // Record the applied directive in the audit trail
    const directiveTemplate = PRESET_DIRECTIVES.find((d) => d.type === selectedDirectiveType);
    const newDirective: AppliedDirective = {
      id: `dir-${Date.now()}`,
      type: selectedDirectiveType,
      label: directiveTemplate?.title || "Instruksi Khusus",
      method: patchMethod,
      region: { ...targetRegion },
      instruction: instructionText,
      timestamp: new Date().toLocaleTimeString(locale === "id" ? "id-ID" : "en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    };

    setAppliedDirectives((prev) => [newDirective, ...prev]);
    showToast(
      locale === "id"
        ? `Instruksi "${newDirective.label}" berhasil diterapkan!`
        : `Directive "${newDirective.label}" applied successfully!`
    );
  };

  // Undo Last Applied Directive
  const handleUndo = () => {
    if (canvasHistory.length <= 1) return;
    const canvas = activeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const previousState = canvasHistory[canvasHistory.length - 1];
    ctx.putImageData(previousState, 0, 0);

    setCanvasHistory((prev) => prev.slice(0, prev.length - 1));
    setAppliedDirectives((prev) => prev.slice(1));
    showToast(locale === "id" ? "Pengeditan terakhir dibatalkan." : "Last edit undone.");
  };

  // Revert all edits back to pristine original
  const handleReset = () => {
    const origCanvas = originalCanvasRef.current;
    const actCanvas = activeCanvasRef.current;
    if (!origCanvas || !actCanvas) return;
    const origCtx = origCanvas.getContext("2d");
    const actCtx = actCanvas.getContext("2d");
    if (!origCtx || !actCtx) return;

    selectedSample.render(actCtx, selectedSample.width, selectedSample.height);
    setAppliedDirectives([]);
    setCanvasHistory([actCtx.getImageData(0, 0, actCanvas.width, actCanvas.height)]);
    showToast(locale === "id" ? "Foto dikembalikan ke kondisi asli." : "Photo reset to original.");
  };

  // Handle local user upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const customSample: SamplePhoto = {
          id: `custom-${Date.now()}`,
          title: file.name,
          description: "Foto properti kustom diunggah oleh agen.",
          width: img.width > 1200 ? 1200 : img.width,
          height:
            img.width > 1200 ? Math.round((img.height * 1200) / img.width) : img.height,
          defaultDirectiveType: "custom",
          suggestedRegion: {
            x: Math.round(img.width * 0.2),
            y: Math.round(img.height * 0.3),
            width: 140,
            height: 70,
          },
          presetInstruction: "Sensor area yang dipilih sesuai arahan agen.",
          render: (ctx, w, h) => {
            ctx.drawImage(img, 0, 0, w, h);
          },
        };
        loadSample(customSample);
        showToast(
          locale === "id" ? "Foto berhasil dimuat ke editor." : "Photo loaded to editor."
        );
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Export clean PNG
  const handleDownloadCleanPhoto = () => {
    const canvas = activeCanvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `Brighton-Clean-${selectedSample.title.replace(/\s+/g, "-")}.png`;
    a.click();
    showToast(locale === "id" ? "Foto bersih berhasil diunduh!" : "Clean photo downloaded!");
  };

  return (
    <WorkspaceShell
      title={locale === "id" ? "Editor Foto Properti" : "Property Photo Editor"}
      subtitle={
        locale === "id"
          ? "Pengeditan foto terarah: sensor nomor rumah, plat nomor polisi, & nomor kontak"
          : "Directive-guided photo editing: redact house numbers, license plates, & contact details"
      }
    >
      {/* Toast Alert */}
      {toastMessage && (
        <div
          role="status"
          className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-amber-500 text-neutral-950 font-bold shadow-2xl border border-amber-600 animate-in slide-in-from-top duration-200 text-xs"
        >
          <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Brighton Brand & Assurance Banner */}
      <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent)] text-neutral-950 flex items-center justify-center font-black text-lg shrink-0 shadow-xs">
            B.
          </div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-tight text-[var(--text)] flex items-center gap-2">
              <span>Brighton Photo Clean Studio</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[var(--accent)]/15 border border-[var(--accent)]/30 text-amber-800 dark:text-amber-300">
                100% Pixel Preserved
              </span>
            </h1>
            <p className="text-xs text-[var(--muted)]">
              {locale === "id"
                ? "Dikhususkan untuk agen Brighton Real Estate: Menghapus elemen privat secara ketat mengikuti instruksi tanpa mengubah sisa foto asli."
                : "Strictly executes privacy directives while preserving 100% of the original photo pixels outside the directive mask."}
            </p>
          </div>
        </div>

        {/* Action CTAs: Upload custom photo */}
        <div className="flex items-center gap-2">
          <label className="px-3.5 py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--bg)] text-xs font-bold text-[var(--text)] flex items-center gap-2 transition-colors cursor-pointer shadow-xs">
            <Upload className="w-4 h-4 text-[var(--accent)]" />
            <span>{locale === "id" ? "Unggah Foto Sendiri" : "Upload Photo"}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Directives, Instructions, & Patch Methods */}
        <div className="lg:col-span-5 space-y-6">
          {/* Directive Selection Card */}
          <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <h2 className="text-sm font-bold text-[var(--text)] flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-[var(--accent)]" />
                <span>{locale === "id" ? "Pilih Arahan Instruksi" : "Select Directives"}</span>
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[var(--bg)] border border-[var(--border)] text-[var(--muted)]">
                Instruksi Terpandu
              </span>
            </div>

            {/* Directive Preset Pills */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--text)] block">
                {locale === "id"
                  ? "Instruksi Standar Agen Brighton:"
                  : "Brighton Standard Directives:"}
              </label>
              <div className="grid grid-cols-1 gap-2 text-xs">
                {PRESET_DIRECTIVES.map((d) => {
                  const isSelected = selectedDirectiveType === d.type;
                  const Icon =
                    d.type === "remove_house_number"
                      ? Building2
                      : d.type === "remove_license_plate"
                      ? Car
                      : d.type === "remove_phone_banner"
                      ? Phone
                      : Zap;

                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => handleSelectPresetDirective(d)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? "bg-[var(--accent)] text-neutral-950 border-[var(--accent)] shadow-xs font-bold"
                          : "bg-[var(--bg)] text-[var(--text)] border-[var(--border)] hover:border-[var(--muted)]"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg shrink-0 ${
                          isSelected ? "bg-black/10 text-neutral-950" : "bg-[var(--surface)] text-[var(--accent)]"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs">{d.title}</span>
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                              isSelected
                                ? "bg-black/20 text-neutral-950"
                                : "bg-[var(--surface)] text-[var(--muted)]"
                            }`}
                          >
                            {d.badge}
                          </span>
                        </div>
                        <p
                          className={`text-[11px] mt-0.5 leading-relaxed ${
                            isSelected ? "text-neutral-900" : "text-[var(--muted)]"
                          }`}
                        >
                          {d.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Detailed Text Instruction Input */}
            <div className="space-y-2 pt-2 border-t border-[var(--border)]">
              <label className="text-xs font-bold text-[var(--text)] flex items-center justify-between">
                <span>{locale === "id" ? "Spesifikasi Instruksi *" : "Directive Details *"}</span>
                <span className="text-[10px] text-[var(--muted)] font-normal">
                  Ketetapan area & tekstur
                </span>
              </label>
              <textarea
                rows={3}
                value={instructionText}
                onChange={(e) => {
                  setInstructionText(e.target.value);
                  if (instructionError) setInstructionError(null);
                }}
                placeholder="Contoh: Sensor plat nomor rumah 42 pada pilar, jangan ubah dinding lain..."
                className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-xs text-[var(--text)] font-medium resize-none focus:border-[var(--accent)]"
              />
              {instructionError && (
                <p className="text-[11px] text-rose-600 font-medium">{instructionError}</p>
              )}
            </div>

            {/* Redaction / Patch Method Selection */}
            <div className="space-y-2 pt-2 border-t border-[var(--border)]">
              <label className="text-xs font-bold text-[var(--text)] block">
                {locale === "id" ? "Metode Penyamaran / Sensor:" : "Redaction Technique:"}
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {(
                  [
                    { id: "inpaint", label: "Smart Inpaint", desc: "Tekstur Alami" },
                    { id: "blur", label: "Privacy Blur", desc: "Frosted Halus" },
                    { id: "pixelate", label: "Pixelate", desc: "Mosaic Klasik" },
                  ] as const
                ).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPatchMethod(m.id)}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      patchMethod === m.id
                        ? "bg-[var(--accent)] text-neutral-950 border-[var(--accent)] font-bold shadow-xs"
                        : "bg-[var(--bg)] text-[var(--text)] border-[var(--border)]"
                    }`}
                  >
                    <div className="font-bold text-[11px]">{m.label}</div>
                    <div
                      className={`text-[9px] ${
                        patchMethod === m.id ? "text-neutral-900" : "text-[var(--muted)]"
                      }`}
                    >
                      {m.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Target Coordinate Indicator */}
            <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-xs flex items-center justify-between">
              <span className="text-[var(--muted)] text-[11px]">Koordinat Target Terpilih:</span>
              <span className="font-mono font-bold text-[var(--text)]">
                {targetRegion
                  ? formatRegionCoordinates(targetRegion)
                  : "Belum Ditandai"}
              </span>
            </div>

            {/* Execute Directive Button */}
            <button
              type="button"
              onClick={handleExecuteDirective}
              className="w-full py-3 rounded-xl bg-[var(--accent)] text-neutral-950 text-xs font-black hover:opacity-95 transition-opacity flex items-center justify-center gap-2 shadow-xs cursor-pointer uppercase tracking-wider"
            >
              <Sparkles className="w-4 h-4 text-neutral-950" />
              <span>
                {locale === "id"
                  ? "Jalankan Instruksi (Terapkan Edit)"
                  : "Execute Privacy Directive"}
              </span>
            </button>
          </div>

          {/* Sample Property Photos Picker */}
          <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
            <h3 className="text-xs font-bold text-[var(--text)] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[var(--accent)]" />
              <span>{locale === "id" ? "Coba Contoh Foto Properti:" : "Try Sample Photos:"}</span>
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {SAMPLE_PHOTOS.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => loadSample(sample)}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-colors cursor-pointer ${
                    selectedSample.id === sample.id
                      ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--text)] font-semibold"
                      : "border-[var(--border)] bg-[var(--bg)] hover:border-[var(--muted)] text-[var(--muted)]"
                  }`}
                >
                  <div className="font-bold text-[var(--text)]">{sample.title}</div>
                  <div className="text-[11px] text-[var(--muted)] line-clamp-1">
                    {sample.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Canvas & Comparison */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-4">
            {/* Header Toolbar: Undo, Reset, View Mode Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[var(--border)] gap-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-[var(--text)]">Kanvas Foto Properti</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg)] border border-[var(--border)] text-[var(--muted)]">
                  {selectedSample.width} × {selectedSample.height} px
                </span>
              </div>

              {/* View Original vs Clean Toggle & Undo */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onMouseDown={() => setViewOriginal(true)}
                  onMouseUp={() => setViewOriginal(false)}
                  onMouseLeave={() => setViewOriginal(false)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                    viewOriginal
                      ? "bg-amber-100 text-amber-900 border-amber-300"
                      : "bg-[var(--bg)] text-[var(--text)] border-[var(--border)]"
                  }`}
                  title="Tahan untuk melihat foto asli sebelum diedit"
                >
                  {viewOriginal ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{viewOriginal ? "Melihat Foto Asli" : "Tahan: Lihat Asli"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={canvasHistory.length <= 1}
                  className="px-2.5 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--surface)] disabled:opacity-40 text-xs font-semibold text-[var(--text)] flex items-center gap-1 cursor-pointer"
                  title="Batalkan pengeditan terakhir"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  <span>Undo</span>
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="px-2.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/40 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  title="Kembalikan ke foto awal"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Instruction Guidance Box */}
            <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[var(--text)] font-medium">
                  {locale === "id"
                    ? "💡 Klik dan drag pada kanvas untuk menentukan kotak area target yang ingin disensor."
                    : "💡 Click and drag directly on the canvas to designate target redaction box."}
                </span>
              </div>
              <span className="text-[10px] text-[var(--muted)] font-mono">
                {appliedDirectives.length} Arahan Diterapkan
              </span>
            </div>

            {/* Canvas Viewport Container */}
            <div className="relative border border-[var(--border)] rounded-xl overflow-hidden shadow-inner flex items-center justify-center bg-black/5 dark:bg-white/5 p-2">
              {/* Dual canvases: Untouched original reference and live edited canvas */}
              <div className="relative inline-block max-w-full">
                <canvas
                  ref={originalCanvasRef}
                  style={{
                    display: viewOriginal ? "block" : "none",
                    maxWidth: "100%",
                    height: "auto",
                  }}
                  className="rounded-lg shadow-xs"
                />
                <canvas
                  ref={activeCanvasRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  style={{
                    display: viewOriginal ? "none" : "block",
                    maxWidth: "100%",
                    height: "auto",
                    cursor: "crosshair",
                  }}
                  className="rounded-lg shadow-xs"
                />

                {/* Interactive Target Bounding Box Visual Overlay */}
                {targetRegion && !viewOriginal && (
                  <div
                    style={{
                      position: "absolute",
                      left: `${(targetRegion.x / selectedSample.width) * 100}%`,
                      top: `${(targetRegion.y / selectedSample.height) * 100}%`,
                      width: `${(targetRegion.width / selectedSample.width) * 100}%`,
                      height: `${(targetRegion.height / selectedSample.height) * 100}%`,
                      border: "2px dashed #f5b800",
                      backgroundColor: "rgba(245, 184, 0, 0.2)",
                      pointerEvents: "none",
                    }}
                    className="rounded-xs transition-all flex items-start justify-end p-0.5"
                  >
                    <span className="text-[8px] font-mono font-bold bg-neutral-950 text-white px-1 py-0.2 rounded shadow-xs">
                      Target Area
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Export Bar */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-[var(--muted)] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Bagian Lain Foto Tidak Tersentuh & Utuh</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleDownloadCleanPhoto}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--bg)] text-xs font-bold text-[var(--text)] flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4 text-[var(--accent)]" />
                  <span>Unduh Foto Bersih (PNG)</span>
                </button>

                <Link
                  href="/flyer"
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[var(--accent)] text-neutral-950 text-xs font-black hover:opacity-95 transition-opacity flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <span>Gunakan di Flyer Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Applied Directives Audit Trail Table */}
          <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[var(--accent)]" />
                <h3 className="text-sm font-bold text-[var(--text)]">
                  {locale === "id"
                    ? "Daftar Audit Arahan yang Diterapkan"
                    : "Applied Directives Audit Log"}
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-[var(--accent)]/15 text-amber-800 dark:text-amber-300">
                {appliedDirectives.length} Eksekusi
              </span>
            </div>

            {appliedDirectives.length === 0 ? (
              <div className="py-6 text-center text-[var(--muted)] text-xs space-y-1">
                <p>Belum ada instruksi yang diterapkan pada foto ini.</p>
                <p className="text-[11px] text-[var(--muted)]">
                  Pilih instruksi di panel kiri dan klik <strong>Jalankan Instruksi</strong> untuk
                  mencatat riwayat audit.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {appliedDirectives.map((d, index) => (
                  <div
                    key={d.id}
                    className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[var(--accent)] text-neutral-950 font-black text-[10px] flex items-center justify-center">
                          {appliedDirectives.length - index}
                        </span>
                        <span className="font-bold text-[var(--text)]">{d.label}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)]">
                          {getDirectiveMethodLabel(d.method)}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--muted)] pl-7">
                        &ldquo;{d.instruction}&rdquo;
                      </p>
                      <div className="text-[10px] text-[var(--muted)] font-mono pl-7">
                        Area: {formatRegionCoordinates(d.region)} · Pukul {d.timestamp}
                      </div>
                    </div>

                    <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px] flex items-center gap-1 shrink-0">
                      <Check className="w-3.5 h-3.5" />
                      Berhasil
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}
