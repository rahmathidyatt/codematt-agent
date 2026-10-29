"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Copy,
  Check,
  Share2,
  FileText,
  Video,
  Send,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { useAgentStore } from "@/lib/store";

export default function ContentStudioPage() {
  const { listings, agent, locale, recordAiUsage } = useAgentStore();

  const [selectedListingId, setSelectedListingId] = useState(listings[0]?.id || "");
  const [platform, setPlatform] = useState<"instagram" | "tiktok" | "newsletter">("instagram");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const activeListing = listings.find((l) => l.id === selectedListingId) || listings[0];

  const [contentOutput, setContentOutput] = useState<{
    hook: string;
    body: string;
    hashtags: string[];
  }>({
    hook: `Rumah impian di ${activeListing?.location} cuma Rp ${(activeListing?.price / 1000000000).toFixed(2)} M? Ini 3 alasan kenapa unit ini bakal cepat sold out! 👇`,
    body: `1. Lokasi super strategis bebas banjir dan dekat akses gerbang tol.\n2. Bangunan 2 lantai seluas ${activeListing?.buildingSize}m² dengan ${activeListing?.bedrooms} kamar tidur.\n3. Legalitas sudah ${activeListing?.certificate} aman 100% dan bisa KPR dibantu sampai approved.\n\nJangan tunggu harga naik! Jadwalkan survei privat minggu ini sebelum keduluan pembeli lain.`,
    hashtags: ["#RumahDijual", `#Properti${activeListing?.location.split(" ")[0]}`, "#InspirasiRumah", "#RumahMinimalis", "#AgenProperti"],
  });

  const handleGenerate = async () => {
    setLoading(true);
    recordAiUsage();

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "content",
          locale,
          instructions: `Social media property content generator for platform ${platform} regarding property ${activeListing?.name}.`,
          facts: {
            property_name: activeListing?.name,
            location: activeListing?.location,
            price: activeListing?.price,
            specs: `${activeListing?.bedrooms} KT, ${activeListing?.bathrooms} KM, LT ${activeListing?.landSize}m², LB ${activeListing?.buildingSize}m²`,
            platform,
          },
        }),
      });

      const json = await response.json();
      if (json.ok && json.data) {
        if (json.data.hook) setContentOutput(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const text = `${contentOutput.hook}\n\n${contentOutput.body}\n\n${contentOutput.hashtags.join(" ")}\n\nInfo & Survei Hubungi: ${agent.name} (${agent.whatsapp})`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <WorkspaceShell
      title={locale === "id" ? "Social Content Studio" : "Social Content Studio"}
      subtitle={locale === "id" ? "Hook carousel Instagram, skrip video TikTok, dan newsletter pasar properti" : "Instagram hooks, TikTok scripts, and market update newsletters"}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Platform & Content Settings */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-5">
            <h2 className="text-base font-bold text-[var(--text)] pb-3 border-b border-[var(--border)]">
              Pilihan Format Konten
            </h2>

            {/* Platform Selector */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { id: "instagram", label: "Instagram Carousel", icon: Share2 },
                { id: "tiktok", label: "TikTok Video Script", icon: Video },
                { id: "newsletter", label: "Market Newsletter", icon: FileText },
              ].map((p) => {
                const Icon = p.icon;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlatform(p.id as "instagram" | "tiktok" | "newsletter")}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      platform === p.id
                        ? "bg-[var(--accent)] text-white border-[var(--accent)] font-semibold shadow-xs"
                        : "bg-[var(--bg)] text-[var(--text)] border-[var(--border)]"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-3 text-xs pt-2 border-t border-[var(--border)]">
              <div>
                <label className="font-semibold text-[var(--text)] block mb-1">Pilih Properti:</label>
                <select
                  value={selectedListingId}
                  onChange={(e) => setSelectedListingId(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)]"
                >
                  {listings.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} — Rp {(l.price / 1000000000).toFixed(1)} M
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-3 bg-[var(--accent)] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-xs disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{loading ? "Menyusun Konten..." : "Generate Konten Media Sosial"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Output Card */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 md:p-8 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <span className="text-xs font-mono font-bold uppercase text-[var(--accent)]">
                {platform.toUpperCase()} POST DRAFT
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-xs font-semibold text-[var(--text)] flex items-center gap-1.5 hover:bg-[var(--surface)]"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Tersalin!" : "Salin Caption"}</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-1.5">
                <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">
                  Hook Pembuka (Attention Grabber)
                </span>
                <p className="text-sm font-bold text-[var(--text)] leading-snug">
                  {contentOutput.hook}
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">
                  Isi Caption / Skrip
                </span>
                <p className="text-xs md:text-sm text-[var(--text)] leading-relaxed whitespace-pre-line">
                  {contentOutput.body}
                </p>
              </div>

              <div className="pt-2 flex flex-wrap gap-1.5 text-xs font-mono text-[var(--accent)]">
                {contentOutput.hashtags.map((h, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-[var(--bg)] border border-[var(--border)]">
                    {h}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}
