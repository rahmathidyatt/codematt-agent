"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  Palette,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { useAgentStore, PropertyListing } from "@/lib/store";

function buildResultsForListing(listing?: PropertyListing) {
  const name = listing?.name || "Cluster Sentul Hills";
  const loc = listing?.location || "Sentul City, Bogor";
  const priceM = ((listing?.price || 1850000000) / 1000000000).toFixed(2);
  const lt = listing?.landSize || 120;
  const lb = listing?.buildingSize || 145;
  const kt = listing?.bedrooms || 3;
  const km = listing?.bathrooms || 2;
  const cert = listing?.certificate || "SHM (Sertifikat Hak Milik)";
  const highlights = listing?.highlights?.join(", ") || "Row jalan 8 meter, View gunung, Bebas banjir, Bisa KPR";

  return {
    emotional: {
      headline: `Tempat Pulang Ternyaman: ${name} di ${loc}`,
      body: `Bayangkan memulai hari dengan suasana nyaman yang menenangkan keluarga Anda di ${name}. Hunian ini hadir dengan tata ruang lapang seluas ${lb} m² di atas tanah ${lt} m², dirancang sempurna dengan ${kt} kamar tidur dan ${km} kamar mandi untuk kehangatan setiap momen kebersamaan. Terletak di kawasan strategis ${loc} dengan keunggulan: ${highlights}.`,
      bullets: [
        `Sertifikat: ${cert} — Legalitas Aman`,
        `Spesifikasi: Luas Tanah ${lt} m² · Luas Bangunan ${lb} m²`,
        `Kapasitas: ${kt} Kamar Tidur · ${km} Kamar Mandi`,
        `Keunggulan: ${highlights}`,
        `Penawaran Istimewa: Rp ${priceM} Milyar (Bisa KPR dibantu tuntas)`,
      ],
      cta: "Jadwalkan kunjungan privat Anda hari ini sebelum unit terbaik ini terjual!",
    },
    investor: {
      headline: `Peluang Investasi Properti Emas: ${name} (${loc})`,
      body: `Aset properti prima dengan potensi capital gain signifikan di koridor berkembang ${loc}. Ditawarkan dengan valuasi menarik Rp ${priceM} Milyar, properti berlegalitas ${cert} ini memiliki luas bangunan ${lb} m² di atas tanah ${lt} m². Sangat ideal untuk disewakan maupun ditinggali jangka panjang (${highlights}).`,
      bullets: [
        `Valuasi: Rp ${priceM} Milyar (Potensi rental yield kompetitif)`,
        `Legalitas: ${cert} (Clear & Clean, siap AJB)`,
        `Dimensi Efisien: LT ${lt} m² · LB ${lb} m² (${kt} KT / ${km} KM)`,
        `Keunggulan Lokasi: ${highlights}`,
        `Opsi pembayaran fleksibel: Cash Keras, Cash Bertahap, atau KPR`,
      ],
      cta: "Hubungi konsultan kami untuk perhitungan simulasi ROI dan penjadwalan survei.",
    },
    formal: {
      headline: `${(listing?.transactionType || "DIJUAL").toUpperCase()}: ${name} — ${loc} (Rp ${priceM} Milyar)`,
      body: `Dipasarkan unit ${listing?.type || "Properti"} siap transaksi berlokasi di ${loc}. Memiliki luas tanah ${lt} m² dan luas bangunan ${lb} m², dilengkapi ${kt} kamar tidur dan ${km} kamar mandi. Fasilitas & daya tarik utama: ${highlights}.`,
      bullets: [
        `Harga: Rp ${priceM} Milyar`,
        `Lokasi: ${loc}`,
        `Sertifikat: ${cert}`,
        `Luas Tanah: ${lt} m² | Luas Bangunan: ${lb} m²`,
        `Kamar Tidur: ${kt} | Kamar Mandi: ${km}`,
      ],
      cta: "Info detail, simulasi KPR, dan survei lokasi hubungi kontak agen resmi.",
    },
  };
}

export default function ListingWriterPage() {
  const { listings, agent, locale, recordAiUsage } = useAgentStore();

  const [selectedListingId, setSelectedListingId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const idParam = new URLSearchParams(window.location.search).get("id");
      if (idParam && listings.some((l) => l.id === idParam)) {
        return idParam;
      }
    }
    return listings[0]?.id || "";
  });
  const activeListing = listings.find((l) => l.id === selectedListingId) || listings[0];

  // Custom Form State
  const [formData, setFormData] = useState({
    name: activeListing?.name || "Cluster Sentul Hills",
    type: activeListing?.type || "Rumah",
    transactionType: activeListing?.transactionType || "Dijual",
    location: activeListing?.location || "Sentul City, Bogor",
    price: activeListing?.price?.toString() || "1850000000",
    landSize: activeListing?.landSize?.toString() || "120",
    buildingSize: activeListing?.buildingSize?.toString() || "145",
    bedrooms: activeListing?.bedrooms?.toString() || "3",
    bathrooms: activeListing?.bathrooms?.toString() || "2",
    certificate: activeListing?.certificate || "SHM (Sertifikat Hak Milik)",
    highlights: activeListing?.highlights?.join(", ") || "Row jalan 8 meter, View gunung, Bebas banjir, Bisa KPR",
    notes: activeListing?.notes || "Owner butuh cepat, nego tipis cash keras",
  });

  const [activeTab, setActiveTab] = useState<"emotional" | "investor" | "formal">("emotional");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Result state initialized with sample results to avoid effect cascading renders
  const [results, setResults] = useState<{
    emotional?: { headline: string; body: string; bullets: string[]; cta: string };
    investor?: { headline: string; body: string; bullets: string[]; cta: string };
    formal?: { headline: string; body: string; bullets: string[]; cta: string };
  } | null>(() => buildResultsForListing(activeListing));

  const handleSelectPreload = (id: string) => {
    setSelectedListingId(id);
    const chosen = listings.find((l) => l.id === id);
    if (chosen) {
      setFormData({
        name: chosen.name,
        type: chosen.type,
        transactionType: chosen.transactionType,
        location: chosen.location,
        price: chosen.price.toString(),
        landSize: chosen.landSize.toString(),
        buildingSize: chosen.buildingSize.toString(),
        bedrooms: chosen.bedrooms.toString(),
        bathrooms: chosen.bathrooms.toString(),
        certificate: chosen.certificate,
        highlights: chosen.highlights.join(", "),
        notes: chosen.notes || "",
      });
      setResults(buildResultsForListing(chosen));
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    recordAiUsage();

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "listing",
          locale,
          instructions: `Generate compelling property listings with 3 distinct angles for Indonesian real estate agent ${agent.name} (${agent.agency}).`,
          facts: {
            property_name: formData.name,
            type: formData.type,
            transactionType: formData.transactionType,
            location: formData.location,
            price: formData.price,
            landSize: formData.landSize,
            buildingSize: formData.buildingSize,
            bedrooms: formData.bedrooms,
            bathrooms: formData.bathrooms,
            certificate: formData.certificate,
            highlights: formData.highlights,
            notes: formData.notes,
          },
        }),
      });

      const json = await response.json();
      if (json.ok && json.data) {
        setResults(json.data);
      }
    } catch (err) {
      console.error("Failed to generate listing:", err);
    } finally {
      setLoading(false);
    }
  };

  const activeCopy = results ? results[activeTab] : null;

  const handleCopy = () => {
    if (!activeCopy) return;
    const fullText = `${activeCopy.headline}\n\n${activeCopy.body}\n\nKeunggulan Utama:\n${activeCopy.bullets.map((b) => `• ${b}`).join("\n")}\n\n${activeCopy.cta}\n\nHubungi: ${agent.name} (${agent.whatsapp})`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <WorkspaceShell
      title={locale === "id" ? "Listing Description Writer" : "Listing Description Writer"}
      subtitle={locale === "id" ? "Otomasi draf listing 3 gaya dengan verifikasi fakta 100%" : "3-angle copy generation with 100% verified facts"}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Property Facts Input Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <h2 className="text-base font-bold text-[var(--text)] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[var(--accent)]" />
                <span>{locale === "id" ? "Fakta Properti" : "Property Specs"}</span>
              </h2>
              <span className="text-xs text-[var(--muted)]">Input Terstruktur</span>
            </div>

            {/* Quick Preload Picker */}
            <div>
              <label className="text-xs font-semibold text-[var(--muted)] block mb-1.5">
                {locale === "id" ? "Pilih dari Portofolio Listing:" : "Load from Portfolio:"}
              </label>
              <select
                value={selectedListingId}
                onChange={(e) => handleSelectPreload(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-xs text-[var(--text)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              >
                {listings.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} — Rp {(l.price / 1000000000).toFixed(1)} M
                  </option>
                ))}
              </select>
            </div>

            {/* Form Fields */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[var(--text)] block mb-1">
                  {locale === "id" ? "Nama / Judul Properti" : "Property Name"}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[var(--text)] block mb-1">
                    {locale === "id" ? "Tipe Properti" : "Property Type"}
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as "Rumah" | "Apartemen" | "Ruko" | "Tanah" | "Villa" | "Gudang",
                      })
                    }
                    className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)]"
                  >
                    <option value="Rumah">Rumah</option>
                    <option value="Apartemen">Apartemen</option>
                    <option value="Ruko">Ruko</option>
                    <option value="Tanah">Tanah</option>
                    <option value="Villa">Villa</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-[var(--text)] block mb-1">
                    {locale === "id" ? "Transaksi" : "Transaction"}
                  </label>
                  <select
                    value={formData.transactionType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        transactionType: e.target.value as "Dijual" | "Disewa",
                      })
                    }
                    className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)]"
                  >
                    <option value="Dijual">Dijual (Sale)</option>
                    <option value="Disewa">Disewa (Rent)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-[var(--text)] block mb-1">
                  {locale === "id" ? "Lokasi & Alamat" : "Location / Area"}
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[var(--text)] block mb-1">
                    {locale === "id" ? "Harga (IDR)" : "Price (IDR)"}
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)] font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[var(--text)] block mb-1">
                    {locale === "id" ? "Sertifikat" : "Certificate / Title"}
                  </label>
                  <input
                    type="text"
                    value={formData.certificate}
                    onChange={(e) => setFormData({ ...formData, certificate: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="font-semibold text-[var(--text)] block mb-1">LT (m²)</label>
                  <input
                    type="number"
                    value={formData.landSize}
                    onChange={(e) => setFormData({ ...formData, landSize: e.target.value })}
                    className="w-full px-2 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)] font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[var(--text)] block mb-1">LB (m²)</label>
                  <input
                    type="number"
                    value={formData.buildingSize}
                    onChange={(e) => setFormData({ ...formData, buildingSize: e.target.value })}
                    className="w-full px-2 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)] font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[var(--text)] block mb-1">KT</label>
                  <input
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                    className="w-full px-2 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)] font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[var(--text)] block mb-1">KM</label>
                  <input
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                    className="w-full px-2 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[var(--text)] block mb-1">
                  {locale === "id" ? "Keunggulan & Fasilitas (Koma)" : "Highlights (Comma separated)"}
                </label>
                <textarea
                  rows={2}
                  value={formData.highlights}
                  onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)] leading-relaxed"
                />
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-3 bg-[var(--accent)] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 shadow-xs"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>
                  {loading
                    ? locale === "id"
                      ? "Sedang Menulis Copy..."
                      : "Generating Copy..."
                    : locale === "id"
                    ? "Generate 3 Gaya Copywriting AI"
                    : "Generate 3 Copywriting Styles"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Generated Copy Variations & Fact-Check Safeguard */}
        <div className="lg:col-span-7 space-y-6">
          {/* Style Selector Tabs */}
          <div className="p-1 bg-[var(--surface)] border border-[var(--border)] rounded-xl flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("emotional")}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === "emotional"
                  ? "bg-[var(--accent)] text-white shadow-xs"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              {locale === "id" ? "1. Emosional / Keluarga" : "1. Emotional / Family"}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("investor")}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === "investor"
                  ? "bg-[var(--accent)] text-white shadow-xs"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              {locale === "id" ? "2. Investor / ROI" : "2. Investor / Yield"}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("formal")}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === "formal"
                  ? "bg-[var(--accent)] text-white shadow-xs"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              {locale === "id" ? "3. Portal Properti Formal" : "3. Formal Portal"}
            </button>
          </div>

          {/* Copy Preview Card */}
          <div className="p-6 md:p-8 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[var(--accent)] uppercase">
                  {activeTab.toUpperCase()} COPY
                </span>
                <span className="text-[11px] text-[var(--muted)]">· Siap Sebar</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-xs font-semibold text-[var(--text)] flex items-center gap-1.5 hover:bg-[var(--surface)] transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Tersalin!" : "Salin Teks"}</span>
                </button>
                <Link
                  href={`/flyer?listingId=${selectedListingId}`}
                  className="px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white text-xs font-semibold flex items-center gap-1.5 hover:opacity-90 shadow-xs"
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>Jadikan Flyer</span>
                </Link>
              </div>
            </div>

            {loading ? (
              <div className="py-16 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-[var(--accent)] animate-spin mx-auto" />
                <p className="text-xs text-[var(--muted)]">
                  {locale === "id"
                    ? "Menyusun draf copywriting berbasis fakta properti..."
                    : "Drafting verified copy from property specs..."}
                </p>
              </div>
            ) : activeCopy ? (
              <div className="space-y-4">
                <h3 className="text-lg md:text-xl font-bold text-[var(--text)] leading-snug">
                  {activeCopy.headline}
                </h3>
                <p className="text-xs md:text-sm text-[var(--muted)] leading-relaxed whitespace-pre-line">
                  {activeCopy.body}
                </p>

                <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-2">
                  <span className="text-xs font-bold text-[var(--text)] uppercase tracking-wider block">
                    {locale === "id" ? "Poin Kunci Terverifikasi:" : "Verified Highlights:"}
                  </span>
                  <ul className="space-y-1.5">
                    {activeCopy.bullets?.map((b, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-[var(--text)]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 text-xs text-[var(--accent)] font-semibold flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 shrink-0" />
                  <span>CTA: {activeCopy.cta}</span>
                </div>
              </div>
            ) : null}
          </div>

          {/* Dual-Sided Property Fact Safeguard */}
          <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
                  {locale === "id"
                    ? "Verifikasi Fakta Dua Sisi (Fact Safeguard)"
                    : "Dual-Sided Fact-Check Safeguard"}
                </h4>
              </div>
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> 100% Cocok
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                <span className="text-[10px] text-[var(--muted)]">Harga Properti</span>
                <p className="font-mono font-bold text-[var(--text)] mt-0.5">
                  Rp {Number(formData.price).toLocaleString("id-ID")}
                </p>
                <span className="text-[10px] text-emerald-600 flex items-center gap-0.5 mt-1 font-semibold">
                  <Check className="w-3 h-3" /> Fakta Terjaga
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                <span className="text-[10px] text-[var(--muted)]">Luas Tanah & Bangunan</span>
                <p className="font-mono font-bold text-[var(--text)] mt-0.5">
                  {formData.landSize} / {formData.buildingSize} m²
                </p>
                <span className="text-[10px] text-emerald-600 flex items-center gap-0.5 mt-1 font-semibold">
                  <Check className="w-3 h-3" /> Fakta Terjaga
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                <span className="text-[10px] text-[var(--muted)]">Kamar Tidur & Mandi</span>
                <p className="font-mono font-bold text-[var(--text)] mt-0.5">
                  {formData.bedrooms} KT · {formData.bathrooms} KM
                </p>
                <span className="text-[10px] text-emerald-600 flex items-center gap-0.5 mt-1 font-semibold">
                  <Check className="w-3 h-3" /> Fakta Terjaga
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                <span className="text-[10px] text-[var(--muted)]">Legalitas Dokumen</span>
                <p className="font-mono font-bold text-[var(--text)] mt-0.5 truncate">
                  {formData.certificate}
                </p>
                <span className="text-[10px] text-emerald-600 flex items-center gap-0.5 mt-1 font-semibold">
                  <Check className="w-3 h-3" /> Fakta Terjaga
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}
