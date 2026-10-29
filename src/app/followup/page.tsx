"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  Sparkles,
  Copy,
  Check,
  Send,
  User,
  Building,
  ArrowRight,
  RefreshCw,
  Phone,
  Mail,
} from "lucide-react";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { useAgentStore } from "@/lib/store";

const SCENARIOS = [
  {
    id: "post_viewing",
    labelId: "1. Pasca Survei Lokasi",
    labelEn: "1. Post-Viewing Check-in",
    descId: "Menanyakan impresi calon pembeli setelah melihat unit kemarin",
    descEn: "Check in with prospective buyer 24h after property inspection",
  },
  {
    id: "price_drop",
    labelId: "2. Penurunan Harga / Promo",
    labelEn: "2. Price Reduction Alert",
    descId: "Memberitahu owner setuju turun harga atau ada diskon cash khusus",
    descEn: "Alert buyers that the seller approved a price drop or cash discount",
  },
  {
    id: "kpr_checkin",
    labelId: "3. Simulasi KPR & Bank",
    labelEn: "3. Mortgage Assistance",
    descId: "Menawarkan simulasi cicilan bulanan dan rekomendasi bank rekanan",
    descEn: "Offer monthly installment calculations and preferred bank rates",
  },
  {
    id: "new_listing",
    labelId: "4. Listing Baru Cocok Budget",
    labelEn: "4. New Matching Listing",
    descId: "Menawarkan unit baru yang pas dengan preferensi lokasi klien",
    descEn: "Present a fresh listing that matches client location and budget criteria",
  },
  {
    id: "dp_reminder",
    labelId: "5. Pengingat Booking Fee / UTJ",
    labelEn: "5. Booking Fee Reminder",
    descId: "Mengingatkan batas waktu penguncian unit agar tidak diambil pembeli lain",
    descEn: "Gentle reminder regarding unit hold deadline before another buyer reserves",
  },
];

export default function FollowupPage() {
  const { agent, listings, locale, recordAiUsage } = useAgentStore();

  const [selectedScenario, setSelectedScenario] = useState("post_viewing");
  const [selectedListingId, setSelectedListingId] = useState(listings[0]?.id || "");
  const [clientName, setClientName] = useState("Ibu Maria");
  const [clientPhone, setClientPhone] = useState("081298765432");
  const [tone, setTone] = useState<"polite" | "casual" | "urgent">("polite");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const activeListing = listings.find((l) => l.id === selectedListingId) || listings[0];

  const [generatedMessage, setGeneratedMessage] = useState<string>(
    `Halo Ibu Maria, selamat pagi. Terima kasih banyak atas waktunya kemarin saat survei di *${activeListing?.name}*.\n\nSebagai pengingat, properti ini berstatus *${activeListing?.certificate}* dengan luas tanah ${activeListing?.landSize}m² dan bangunan ${activeListing?.buildingSize}m² di harga *Rp ${(activeListing?.price / 1000000000).toFixed(2)} Milyar*.\n\nBagaimana impresi dari keluarga setelah berdiskusi kemarin? Apakah ada simulasi KPR atau penawaran harga yang ingin saya bantu ajukan ke pemilik? 🙏\n\nSalam hangat,\n*${agent.name}* — ${agent.agency}`
  );

  const handleGenerate = async () => {
    setLoading(true);
    recordAiUsage();

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "followup",
          locale,
          instructions: `Write a high-converting real estate WhatsApp follow-up message for Indonesian client '${clientName}' regarding property '${activeListing?.name}'. Scenario: ${selectedScenario}. Tone: ${tone}. Agent: ${agent.name} (${agent.agency}).`,
          facts: {
            property_name: activeListing?.name,
            location: activeListing?.location,
            price: activeListing?.price,
            certificate: activeListing?.certificate,
            client_name: clientName,
            scenario: selectedScenario,
          },
        }),
      });

      const json = await response.json();
      if (json.ok && json.data) {
        if (typeof json.data === "string") {
          setGeneratedMessage(json.data);
        } else if (json.data.whatsapp) {
          setGeneratedMessage(json.data.whatsapp);
        } else {
          setGeneratedMessage(JSON.stringify(json.data));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedPhone = clientPhone.replace(/^0/, "62").replace(/[- ]/g, "");
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(generatedMessage)}`;

  return (
    <WorkspaceShell
      title={locale === "id" ? "WhatsApp Client Follow-up" : "WhatsApp Client Follow-up"}
      subtitle={locale === "id" ? "Template pesan tindak lanjut berbasis skenario closing" : "Scenario-based client follow-up sequence builder"}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Scenario & Client Configuration */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <h2 className="text-base font-bold text-[var(--text)] flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>{locale === "id" ? "Konfigurasi Follow-up" : "Follow-up Setup"}</span>
              </h2>
              <span className="text-xs text-[var(--muted)]">WhatsApp Direct</span>
            </div>

            {/* Scenario Picker */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--text)] block">
                {locale === "id" ? "Pilih Skenario Interaksi:" : "Select Scenario:"}
              </label>
              <div className="space-y-1.5">
                {SCENARIOS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedScenario(s.id)}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all ${
                      selectedScenario === s.id
                        ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-xs"
                        : "bg-[var(--bg)] text-[var(--text)] border-[var(--border)] hover:border-[var(--muted)]"
                    }`}
                  >
                    <div className="text-xs font-bold">{locale === "id" ? s.labelId : s.labelEn}</div>
                    <div className={`text-[11px] ${selectedScenario === s.id ? "text-white/80" : "text-[var(--muted)]"}`}>
                      {locale === "id" ? s.descId : s.descEn}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-3 text-xs pt-2 border-t border-[var(--border)]">
              <div>
                <label className="font-semibold text-[var(--text)] block mb-1">
                  {locale === "id" ? "Pilih Properti:" : "Target Property:"}
                </label>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[var(--text)] block mb-1">
                    {locale === "id" ? "Nama Klien / Prospek" : "Client Name"}
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[var(--text)] block mb-1">
                    {locale === "id" ? "Nomor WhatsApp" : "WhatsApp Number"}
                  </label>
                  <input
                    type="text"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[var(--text)] block mb-1">
                  {locale === "id" ? "Gaya Bahasa / Tone" : "Tone Style"}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "polite", label: "Sopan & Hangat" },
                    { id: "casual", label: "Santai & Akrab" },
                    { id: "urgent", label: "Peluang Terbatas" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTone(t.id as "polite" | "casual" | "urgent")}
                      className={`py-1.5 text-xs rounded-lg border text-center transition-colors ${
                        tone === t.id
                          ? "bg-[var(--accent)] text-white border-[var(--accent)] font-semibold"
                          : "bg-[var(--bg)] text-[var(--text)] border-[var(--border)]"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
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
                <span>{loading ? "Menyusun Pesan..." : "Generate Pesan WhatsApp"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: WhatsApp Message Preview & 1-Click Launch */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 md:p-8 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
                  Pratinjau Pesan WhatsApp
                </span>
                <span className="text-xs text-[var(--muted)]">· Siap Kirim</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-xs font-semibold text-[var(--text)] flex items-center gap-1.5 hover:bg-[var(--surface)] transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Tersalin!" : "Salin Pesan"}</span>
                </button>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-emerald-700 shadow-xs transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Buka WhatsApp Web</span>
                </a>
              </div>
            </div>

            {/* Chat Bubble Simulation */}
            <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 relative">
              <div className="text-xs text-[var(--text)] leading-relaxed whitespace-pre-wrap font-sans">
                {generatedMessage}
              </div>
              <div className="text-[10px] text-[var(--muted)] text-right mt-3 font-mono">
                {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · Terenkripsi
              </div>
            </div>

            {/* Practical Advice for Agent */}
            <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-1.5 text-xs">
              <span className="font-bold text-[var(--text)] block">
                💡 Tips Closing Praktis:
              </span>
              <p className="text-[var(--muted)] leading-relaxed">
                Kirim pesan ini antara jam 09:30 – 11:30 atau 16:30 – 18:30 (jam luang prospek). Lampirkan pula link flyer dari Flyer Studio untuk meningkatkan daya tarik visual!
              </p>
            </div>
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}
