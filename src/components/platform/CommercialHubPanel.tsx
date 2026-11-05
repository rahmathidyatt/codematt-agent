"use client";

import React, { useState } from "react";
import {
  Key,
  Plus,
  Copy,
  Check,
  Calculator,
  Trash2,
} from "lucide-react";
import {
  ClientApiKey,
  simulateCommercialProjection,
} from "@/features/platform/model-gateway";

interface CommercialHubPanelProps {
  ownerEmail: string;
  sessionTokens: number;
  sessionWholesaleUsd: number;
  sessionRetailUsd: number;
  clientKeys: ClientApiKey[];
  onCreateKey: (label: string, tier: ClientApiKey["tier"], quotaUsd: number) => void;
  onToggleKeyStatus: (id: string) => void;
  onRevokeKey: (id: string) => void;
}

export function CommercialHubPanel({
  ownerEmail,
  sessionTokens,
  sessionWholesaleUsd,
  sessionRetailUsd,
  clientKeys,
  onCreateKey,
  onToggleKeyStatus,
  onRevokeKey,
}: CommercialHubPanelProps) {
  // Interactive Commercial Margin Simulator state
  const [subscribers, setSubscribers] = useState<number>(250);
  const [planPrice, setPlanPrice] = useState<number>(29);
  const [tokensPerUserM, setTokensPerUserM] = useState<number>(3.5);
  const [blendedCostPerM, setBlendedCostPerM] = useState<number>(0.95);

  // New Client API Key state
  const [keyLabel, setKeyLabel] = useState("");
  const [keyTier, setKeyTier] = useState<ClientApiKey["tier"]>("Pro");
  const [keyQuota, setKeyQuota] = useState("100");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const projection = simulateCommercialProjection({
    activeSubscribers: subscribers,
    monthlySubscriptionPriceUsd: planPrice,
    avgTokensPerUserMillions: tokensPerUserM,
    blendedWholesalePer1MUsd: blendedCostPerM,
  });

  const handleIssueKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyLabel.trim()) return;
    const quota = Math.max(5, Number(keyQuota) || 50);
    onCreateKey(keyLabel.trim(), keyTier, quota);
    setKeyLabel("");
  };

  const handleCopyKey = (id: string, preview: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(preview);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    }
  };

  return (
    <section
      id="commercial"
      aria-label="Akun Utama dan Rencana Komersialisasi"
      className="py-8 border-t border-[#e4e4e7] space-y-10"
    >
      {/* Part 1: Concept Analysis & Commercialization Blueprint */}
      <div>
        <div className="mb-6">
          <p className="text-xs font-medium text-[#52525b] mb-1">
            Arsitektur Platform & Rencana Komersialisasi
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-[#111113]">
            Rancangan Gateway Multi-Model (Demo)
          </h2>
          <p className="text-sm text-[#52525b] mt-1 max-w-2xl">
            Ini adalah prototipe untuk {ownerEmail}. Adapter AI berbayar, akun pelanggan, dan tagihan belum terhubung. Semua perhitungan pendapatan merupakan simulasi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-white border border-[#e4e4e7]">
            <p className="text-xs font-mono font-semibold text-[#111113] mb-2">
              01. Integrasi Multi-Model
            </p>
            <h3 className="text-base font-bold text-[#111113] mb-2">
              Satu Antarmuka, Berbagai Model AI
            </h3>
            <p className="text-xs text-[#52525b] leading-relaxed">
              Tanpa perlu membuka banyak tab untuk ChatGPT, Gemini, Claude, dan DeepSeek, katalog model ditampilkan untuk demonstrasi antarmuka. Belum semua provider terhubung.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white border border-[#e4e4e7]">
            <p className="text-xs font-mono font-semibold text-[#111113] mb-2">
              02. Kendali Akun Utama
            </p>
            <h3 className="text-base font-bold text-[#111113] mb-2">
              Terpusat di {ownerEmail}
            </h3>
            <p className="text-xs text-[#52525b] leading-relaxed">
              Kredensial API penyedia tersimpan aman di sisi server di bawah akun utama Anda. Pengguna atau klien mengakses melalui kunci API terukur dengan batas kuota.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-[#fef9c3]/50 border border-[#f5b800]">
            <p className="text-xs font-mono font-semibold text-[#111113] mb-2">
              03. Mesin Monetisasi SaaS
            </p>
            <h3 className="text-base font-bold text-[#111113] mb-2">
              Margin Ritel yang Dapat Diatur
            </h3>
            <p className="text-xs text-[#111113]/80 leading-relaxed">
              Komersialisasikan melalui paket langganan bulanan atau kredit API terukur dengan markup 2.0x–3.5x di atas harga modal token penyedia.
            </p>
          </div>
        </div>
      </div>

      {/* Part 2: Live Personal Account Session Ledger & SaaS Margin Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 7 Cols: Interactive Commercial Unit Economics Simulator */}
        <div className="lg:col-span-7 p-6 rounded-xl bg-white border border-[#e4e4e7] space-y-6">
          <div className="flex items-center justify-between border-b border-[#e4e4e7] pb-4">
            <div>
              <h3 className="text-base font-bold text-[#111113] flex items-center gap-2">
                <Calculator className="w-4 h-4 text-[#f5b800]" />
                <span>Simulator Pendapatan & Margin SaaS</span>
              </h3>
              <p className="text-xs text-[#52525b] mt-0.5">
                Simulasikan proyeksi pendapatan bulanan dan biaya token sebelum membuka akses publik
              </p>
            </div>
            <span className="text-xs font-mono font-semibold text-[#111113]">
              Margin Bersih: {projection.profitMarginPercent}%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div>
              <div className="flex justify-between font-semibold text-[#111113] mb-1.5">
                <label htmlFor="sim-subs">Pelanggan Aktif Berbayar</label>
                <span className="font-mono tabular-nums">{subscribers} pengguna</span>
              </div>
              <input
                id="sim-subs"
                type="range"
                min={10}
                max={2000}
                step={10}
                value={subscribers}
                onChange={(e) => setSubscribers(Number(e.target.value))}
                className="w-full accent-[#f5b800] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between font-semibold text-[#111113] mb-1.5">
                <label htmlFor="sim-price">Harga Langganan / Bulan (USD)</label>
                <span className="font-mono tabular-nums">${planPrice}/bln</span>
              </div>
              <input
                id="sim-price"
                type="range"
                min={9}
                max={99}
                step={5}
                value={planPrice}
                onChange={(e) => setPlanPrice(Number(e.target.value))}
                className="w-full accent-[#f5b800] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between font-semibold text-[#111113] mb-1.5">
                <label htmlFor="sim-tokens">Rata-Rata Token / Pengguna</label>
                <span className="font-mono tabular-nums">{tokensPerUserM.toFixed(1)}M token</span>
              </div>
              <input
                id="sim-tokens"
                type="range"
                min={0.5}
                max={15}
                step={0.5}
                value={tokensPerUserM}
                onChange={(e) => setTokensPerUserM(Number(e.target.value))}
                className="w-full accent-[#f5b800] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between font-semibold text-[#111113] mb-1.5">
                <label htmlFor="sim-cost">Biaya Modal Rata-Rata / 1M</label>
                <span className="font-mono tabular-nums">${blendedCostPerM.toFixed(2)}</span>
              </div>
              <input
                id="sim-cost"
                type="range"
                min={0.2}
                max={5.0}
                step={0.05}
                value={blendedCostPerM}
                onChange={(e) => setBlendedCostPerM(Number(e.target.value))}
                className="w-full accent-[#f5b800] cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#e4e4e7]">
            <div>
              <span className="text-xs text-[#52525b] block">Pendapatan Kotor (MRR)</span>
              <span className="text-xl font-bold font-mono tabular-nums text-[#111113] mt-1 block">
                ${projection.grossMonthlyRevenueUsd.toLocaleString("en-US")}
              </span>
            </div>
            <div>
              <span className="text-xs text-[#52525b] block">Biaya Komputasi API</span>
              <span className="text-xl font-bold font-mono tabular-nums text-[#52525b] mt-1 block">
                -${projection.totalWholesaleComputeUsd.toLocaleString("en-US")}
              </span>
            </div>
            <div>
              <span className="text-xs text-[#111113] font-semibold block">Laba Bersih Bulanan</span>
              <span className="text-xl font-bold font-mono tabular-nums text-[#111113] bg-[#fef9c3] px-2 py-0.5 rounded inline-block mt-1">
                ${projection.netMonthlyProfitUsd.toLocaleString("en-US")}
              </span>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Personal Master Account Live Telemetry */}
        <div className="lg:col-span-5 p-6 rounded-xl bg-[#fafafa] border border-[#e4e4e7] space-y-5">
          <div className="border-b border-[#e4e4e7] pb-4">
            <span className="text-xs font-medium text-[#52525b] block">
              Pemilik Akun Utama
            </span>
            <h3 className="text-base font-bold text-[#111113] font-mono mt-0.5">
              {ownerEmail}
            </h3>
            <p className="text-xs text-[#52525b] mt-1">
              Pusat tagihan & kredensial API untuk seluruh model terintegrasi
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-[#e4e4e7]">
              <span className="text-[#52525b]">Total Token Sesi Ini</span>
              <span className="font-mono tabular-nums font-bold text-[#111113]">
                {sessionTokens.toLocaleString("id-ID")} token
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#e4e4e7]">
              <span className="text-[#52525b]">Biaya Modal Penyedia</span>
              <span className="font-mono tabular-nums font-semibold text-[#111113]">
                ${sessionWholesaleUsd.toFixed(5)}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#e4e4e7]">
              <span className="text-[#52525b]">Nilai Jual Ritel</span>
              <span className="font-mono tabular-nums font-bold text-[#111113]">
                ${sessionRetailUsd.toFixed(5)}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-[#52525b]">Mode Gateway</span>
              <span className="font-semibold text-[#111113]">
                Akun Pribadi + Kunci Klien
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Part 3: Commercial Client API Keys & Tenant Access */}
      <div className="p-6 rounded-xl bg-white border border-[#e4e4e7] space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e4e4e7] pb-4">
          <div>
            <h3 className="text-base font-bold text-[#111113] flex items-center gap-2">
              <Key className="w-4 h-4 text-[#f5b800]" />
              <span>Kunci API Klien & Akses Pelanggan</span>
            </h3>
            <p className="text-xs text-[#52525b] mt-0.5">
              Buat contoh kunci dalam antarmuka saja. Ini bukan kredensial API asli dan tidak dapat mengakses server.
            </p>
          </div>

          <form onSubmit={handleIssueKey} className="flex flex-wrap items-center gap-2 text-xs">
            <input
              type="text"
              value={keyLabel}
              onChange={(e) => setKeyLabel(e.target.value)}
              placeholder="Nama klien atau proyek..."
              aria-label="Nama klien atau proyek"
              className="px-3 py-2 rounded-lg bg-[#fafafa] border border-[#e4e4e7] text-[#111113] w-48"
            />
            <select
              value={keyTier}
              onChange={(e) => setKeyTier(e.target.value as ClientApiKey["tier"])}
              aria-label="Paket Komersial"
              className="px-3 py-2 rounded-lg bg-[#fafafa] border border-[#e4e4e7] text-[#111113]"
            >
              <option value="Free">Paket Free</option>
              <option value="Pro">Paket Pro</option>
              <option value="Enterprise">Enterprise</option>
            </select>
            <input
              type="number"
              value={keyQuota}
              onChange={(e) => setKeyQuota(e.target.value)}
              aria-label="Kuota Bulanan USD"
              className="px-3 py-2 rounded-lg bg-[#fafafa] border border-[#e4e4e7] text-[#111113] font-mono tabular-nums w-24"
            />
            <button
              type="submit"
              className="px-3.5 py-2 rounded-lg bg-[#f5b800] hover:bg-[#e5ac00] text-[#111113] font-semibold flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Buat Kunci</span>
            </button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#e4e4e7] text-[#52525b] font-semibold">
                <th className="py-2.5 px-3">Label Klien / Kunci</th>
                <th className="py-2.5 px-3">Pratinjau Kunci</th>
                <th className="py-2.5 px-3">Paket</th>
                <th className="py-2.5 px-3 text-right">Pemakaian / Kuota</th>
                <th className="py-2.5 px-3 text-right">Status & Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e4e4e7]">
              {clientKeys.map((k) => (
                <tr key={k.id} className="hover:bg-[#fafafa]">
                  <td className="py-3 px-3 font-semibold text-[#111113]">
                    {k.label}
                  </td>
                  <td className="py-3 px-3 font-mono text-[#52525b]">
                    <div className="inline-flex items-center gap-2">
                      <span>{k.keyPreview}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyKey(k.id, k.keyPreview)}
                        aria-label={`Salin kunci ${k.label}`}
                        className="text-[#52525b] hover:text-[#111113] cursor-pointer"
                      >
                        {copiedId === k.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-[#111113]">
                    {k.tier} <span aria-hidden="true">·</span> Dibuat {k.createdAt}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-[#111113]">
                    ${k.usedUsd.toFixed(2)} / ${k.monthlyQuotaUsd.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onToggleKeyStatus(k.id)}
                        className="px-2.5 py-1 rounded border border-[#e4e4e7] bg-white hover:bg-[#fafafa] text-[#111113] font-medium cursor-pointer"
                      >
                        {k.active ? "Aktif" : "Nonaktif"}
                      </button>
                      {k.id !== "key-owner-master" && (
                        <button
                          type="button"
                          onClick={() => onRevokeKey(k.id)}
                          aria-label={`Hapus kunci ${k.label}`}
                          className="p-1.5 rounded border border-[#e4e4e7] text-[#52525b] hover:text-red-600 hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
