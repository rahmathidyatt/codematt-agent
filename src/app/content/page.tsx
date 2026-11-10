"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Copy,
  Check,
  Share2,
  FileText,
  Video,
  RefreshCw,
} from "lucide-react";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { useAgentStore } from "@/lib/store";

export default function ContentStudioPage() {
  const { listings, agent, locale, recordAiUsage } = useAgentStore();

  const [selectedListingId, setSelectedListingId] = useState(listings[0]?.id || "");
  const [platform, setPlatform] = useState<"instagram" | "tiktok" | "newsletter">("instagram");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [variationCount, setVariationCount] = useState(0);

  const activeListing = listings.find((l) => l.id === selectedListingId) || listings[0];

  const buildDraftForPlatform = (
    targetListing: typeof activeListing,
    targetPlatform: "instagram" | "tiktok" | "newsletter",
    variationIdx = 0,
    aiExtraText?: string
  ) => {
    const priceM = ((targetListing?.price || 1850000000) / 1000000000).toFixed(2);
    const locShort = (targetListing?.location || "Sentul").split(",")[0].trim();
    const locTag = locShort.replace(/\s+/g, "");
    const highlightsList = targetListing?.highlights?.slice(0, 3).join(", ") || "Lokasi strategis, bebas banjir, bisa KPR";

    if (targetPlatform === "tiktok") {
      const hooks = [
        `[POV 0-3s] Jangan beli rumah di ${locShort} sebelum lihat unit ${targetListing?.name} seharga Rp ${priceM} M ini! 🎥✨`,
        `[HOOK VISUAL] Spill rumah ${targetListing?.bedrooms} kamar tidur di ${locShort} yang cicilannya ramah dan legalitas ${targetListing?.certificate}! 🏡🔥`,
      ];
      return {
        hook: hooks[variationIdx % hooks.length],
        body: `[Scene 1 - Fasad & Carport (3-8s)]\nLihat sendiri lebar jalannya lega banget, lokasi di ${targetListing?.location}.\n\n[Scene 2 - Living Room & Kamar (8-18s)]\nLuas tanah ${targetListing?.landSize}m² dan bangunan ${targetListing?.buildingSize}m² dengan ${targetListing?.bedrooms} KT & ${targetListing?.bathrooms} KM. Keunggulan utama: ${highlightsList}.\n\n[Scene 3 - Call to Action (18-25s)]\nLegalitas sudah ${targetListing?.certificate} aman 100%. Klik link bio atau WA ${agent.name} (${agent.phone}) buat jadwal private viewing minggu ini!${aiExtraText ? `\n\nCatatan AI: ${aiExtraText}` : ""}`,
        hashtags: ["#TikTokProperti", `#Rumah${locTag}`, "#HomeTourIndonesia", "#SpillRumah", "#BrightonRealEstate"],
      };
    }

    if (targetPlatform === "newsletter") {
      const hooks = [
        `Subject: [Hot Listing ${locShort}] ${targetListing?.name} — Valuasi Rp ${priceM} Milyar (${targetListing?.certificate})`,
        `Subject: Peluang Akuisisi Properti Pilihan di ${targetListing?.location} — ${targetListing?.name}`,
      ];
      return {
        hook: hooks[variationIdx % hooks.length],
        body: `Halo Bapak/Ibu Investor & Pencari Hunian,\n\nMinggu ini kami menghadirkan unit kurasi terbaik di koridor ${targetListing?.location}: ${targetListing?.name} (${targetListing?.type} · ${targetListing?.transactionType}).\n\n• Harga Penawaran: Rp ${priceM} Milyar\n• Dimensi: LT ${targetListing?.landSize} m² / LB ${targetListing?.buildingSize} m² (${targetListing?.bedrooms} KT, ${targetListing?.bathrooms} KM)\n• Legalitas: ${targetListing?.certificate}\n• Daya Tarik Utama: ${highlightsList}\n\nUnit ini sangat direkomendasikan baik untuk hunian keluarga maupun instrumen capital gain jangka menengah. Balas email/pesan ini untuk menerima brosur PDF 300 DPI dan jadwal kunjungan lokasi bersama ${agent.name}.${aiExtraText ? `\n\nRingkasan Analis: ${aiExtraText}` : ""}`,
        hashtags: ["#MarketUpdate", `#Investasi${locTag}`, "#NewsletterProperti", "#PortofolioProperti"],
      };
    }

    const igHooks = [
      `Rumah impian di ${targetListing?.location} cuma Rp ${priceM} M? Ini 3 alasan kenapa unit ${targetListing?.name} bakal cepat sold out! 👇`,
      `Cari ${targetListing?.type.toLowerCase()} siap huni di ${locShort} dengan legalitas ${targetListing?.certificate}? Cek spesifikasi lengkap ${targetListing?.name} di slide berikut! ✨`,
    ];
    return {
      hook: igHooks[variationIdx % igHooks.length],
      body: `1. Lokasi super strategis di ${targetListing?.location} (${highlightsList}).\n2. Bangunan seluas ${targetListing?.buildingSize}m² (LT ${targetListing?.landSize}m²) dengan ${targetListing?.bedrooms} kamar tidur & ${targetListing?.bathrooms} kamar mandi.\n3. Legalitas sudah ${targetListing?.certificate} aman 100% dan bisa KPR dibantu sampai approved.\n\nJangan tunggu harga naik! Jadwalkan survei privat minggu ini sebelum keduluan pembeli lain.${aiExtraText ? `\n\nHighlight Tambahan: ${aiExtraText}` : ""}`,
      hashtags: ["#RumahDijual", `#Properti${locTag}`, "#InspirasiRumah", "#RumahMinimalis", "#AgenProperti"],
    };
  };

  const [contentOutput, setContentOutput] = useState<{
    hook: string;
    body: string;
    hashtags: string[];
  }>(() => buildDraftForPlatform(activeListing, "instagram", 0));

  const handleSelectPlatform = (nextPlatform: "instagram" | "tiktok" | "newsletter") => {
    setPlatform(nextPlatform);
    setContentOutput(buildDraftForPlatform(activeListing, nextPlatform, variationCount));
  };

  const handleSelectListingChange = (nextListingId: string) => {
    setSelectedListingId(nextListingId);
    const nextListing = listings.find((l) => l.id === nextListingId) || listings[0];
    setContentOutput(buildDraftForPlatform(nextListing, platform, variationCount));
  };

  const handleGenerate = async () => {
    setLoading(true);
    recordAiUsage();
    const nextVariation = variationCount + 1;
    setVariationCount(nextVariation);

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
        if (json.data.hook) {
          setContentOutput(json.data);
        } else {
          setContentOutput(
            buildDraftForPlatform(activeListing, platform, nextVariation, json.data.text)
          );
        }
      } else {
        setContentOutput(buildDraftForPlatform(activeListing, platform, nextVariation));
      }
    } catch (e) {
      console.error(e);
      setContentOutput(buildDraftForPlatform(activeListing, platform, nextVariation));
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
                    data-testid={`platform-tab-${p.id}`}
                    onClick={() => handleSelectPlatform(p.id as "instagram" | "tiktok" | "newsletter")}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
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
                  onChange={(e) => handleSelectListingChange(e.target.value)}
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
                className="w-full py-3 bg-[var(--accent)] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-xs disabled:opacity-50 cursor-pointer"
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
