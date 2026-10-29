"use client";

import React, { useState } from "react";
import {
  Check,
  Sparkles,
  Database,
  Layers,
  CheckCircle2,
  RefreshCw,
  Hash,
  X,
  CreditCard,
} from "lucide-react";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { useAgentStore } from "@/lib/store";
import { PLAN_CONFIGS } from "@/features/ledger/contracts";
import type { PlanTierId } from "@/features/ledger/contracts";
import { reconcileLedgerDelta, calculateUsagePercentage } from "@/features/ledger/ledger-utils";

const PLAN_LIST: {
  id: PlanTierId;
  name: string;
  price: string;
  period: string;
  desc: string;
  aiLimit: number;
  flyerLimit: number;
  storage: string;
  features: string[];
}[] = [
  {
    id: "free",
    name: "Free Trial",
    price: "Rp 0",
    period: "selamanya",
    desc: "Untuk eksplorasi fitur dasar agen pemula",
    aiLimit: 25,
    flyerLimit: 5,
    storage: "250 MB",
    features: [
      "Listing Description Writer",
      "Flyer Watermark Standar",
      "Follow-up WhatsApp",
      "Support Komunitas",
    ],
  },
  {
    id: "starter",
    name: "Starter Pro",
    price: "Rp 149.000",
    period: "/ bulan",
    desc: "Paket ideal untuk agen properti aktif mandiri",
    aiLimit: 150,
    flyerLimit: 50,
    storage: "1 GB",
    features: [
      "Semua fitur Free Trial",
      "Ekspor Flyer 300 DPI Bebas Watermark",
      "Stempel Logo Brand Kit Brighton Kustom",
      "Generator QR WhatsApp Otomatis",
      "Dukungan WhatsApp Prioritas",
    ],
  },
  {
    id: "pro",
    name: "Top Producer",
    price: "Rp 349.000",
    period: "/ bulan",
    desc: "Untuk agen dengan volume listing & promosi harian tinggi",
    aiLimit: 500,
    flyerLimit: 200,
    storage: "5 GB",
    features: [
      "Semua fitur Starter",
      "Unlimited Listing Variations",
      "A4 Cetak PDF Vektor Resolusi Penuh",
      "Prioritas Jalur Server Cepat",
      "Export Aset Portofolio Sekaligus",
    ],
  },
  {
    id: "team",
    name: "Brokerage Team",
    price: "Rp 899.000",
    period: "/ bulan",
    desc: "Untuk kantor cabang broker (5-10 agen)",
    aiLimit: 2500,
    flyerLimit: 1000,
    storage: "25 GB",
    features: [
      "Semua fitur Top Producer",
      "Multi-Akun Tim Terpusat",
      "Shared Brand Kit Kantor Cabang",
      "Manajemen Kuota Anggota Tim",
      "Dedicated Account Manager",
    ],
  },
];

export default function UsageBillingPage() {
  const { usage, updatePlanTier, resetUsage, ledgerEntries, locale } = useAgentStore();

  const [selectedPlanToUpgrade, setSelectedPlanToUpgrade] = useState<PlanTierId | null>(null);
  const [resetting, setResetting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const activePlanId = usage.planId || "starter";
  const activePlanConfig = PLAN_CONFIGS[activePlanId] || PLAN_CONFIGS.starter;

  const aiPercent = calculateUsagePercentage(usage.aiRequestsUsed, usage.aiRequestsLimit);
  const flyerPercent = calculateUsagePercentage(usage.flyerExportsUsed, usage.flyerExportsLimit);
  const storageMbUsed = (usage.storageBytesUsed / 1048576).toFixed(1);
  const storageMbLimit = Math.round(usage.storageBytesLimit / 1048576);

  const delta = reconcileLedgerDelta(ledgerEntries);

  const handleConfirmUpgrade = () => {
    if (!selectedPlanToUpgrade) return;
    updatePlanTier(selectedPlanToUpgrade);
    setSuccessToast(
      locale === "id"
        ? `Berhasil memperbarui paket ke ${PLAN_CONFIGS[selectedPlanToUpgrade].name}!`
        : `Successfully switched to ${PLAN_CONFIGS[selectedPlanToUpgrade].name}!`
    );
    setSelectedPlanToUpgrade(null);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleResetCycle = () => {
    setResetting(true);
    resetUsage();
    setTimeout(() => {
      setResetting(false);
      setSuccessToast(
        locale === "id"
          ? "Siklus kuota bulanan telah direset ke 0 pemakaian."
          : "Monthly quota cycle reset to 0."
      );
      setTimeout(() => setSuccessToast(null), 3000);
    }, 600);
  };

  return (
    <WorkspaceShell
      title={locale === "id" ? "Pemakaian Kuota & Ledger" : "Usage Quota & Ledger"}
      subtitle={
        locale === "id"
          ? "Pemantauan kuota transaksional anti-selisih dan manajemen paket langganan"
          : "Zero-leak transactional compute ledger and subscription plan management"
      }
    >
      <div className="space-y-8">
        {/* Toast Notification */}
        {successToast && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successToast}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessToast(null)}
              className="text-emerald-600 hover:text-emerald-800"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Top Summary Banner */}
        <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#f5b800]">
                Fase 7 · Ledger Kuota Transaksional
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-500/20">
                Anti Double-Spend Active
              </span>
            </div>
            <h2 className="text-xl font-bold text-[var(--text)]">
              Status Paket: {activePlanConfig.name} ({activePlanConfig.price} {activePlanConfig.period})
            </h2>
            <p className="text-xs text-[var(--muted)]">
              Periode aktif sampai dengan {usage.periodEnd}. Rekonsiliasi ledger: {delta.netUnitsUsed} unit komputasi terverifikasi.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleResetCycle}
              disabled={resetting}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--surface)] text-[var(--text)] flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resetting ? "animate-spin" : ""}`} />
              <span>{locale === "id" ? "Simulasi Reset Kuota" : "Simulate Cycle Reset"}</span>
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--muted)]">Pemakaian Kuota AI</span>
              <Sparkles className="w-4 h-4 text-[#f5b800]" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold font-mono text-[var(--text)]">
                {usage.aiRequestsUsed}
                <span className="text-sm font-normal text-[var(--muted)]">
                  {" "}
                  / {usage.aiRequestsLimit}
                </span>
              </span>
              <span className="text-xs font-bold text-[#f5b800]">{aiPercent}%</span>
            </div>
            <div className="w-full bg-[var(--border)] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#f5b800] h-full rounded-full transition-all duration-300"
                style={{ width: `${aiPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-[var(--muted)]">
              {Math.max(0, usage.aiRequestsLimit - usage.aiRequestsUsed)} request tersisa periode ini
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--muted)]">Ekspor Flyer 300 DPI</span>
              <Layers className="w-4 h-4 text-amber-600" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold font-mono text-[var(--text)]">
                {usage.flyerExportsUsed}
                <span className="text-sm font-normal text-[var(--muted)]">
                  {" "}
                  / {usage.flyerExportsLimit}
                </span>
              </span>
              <span className="text-xs font-bold text-amber-600">{flyerPercent}%</span>
            </div>
            <div className="w-full bg-[var(--border)] h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${flyerPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-[var(--muted)]">
              {Math.max(0, usage.flyerExportsLimit - usage.flyerExportsUsed)} ekspor resolusi tinggi tersisa
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--muted)]">Penyimpanan Media</span>
              <Database className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold font-mono text-[var(--text)]">
                {storageMbUsed}
                <span className="text-sm font-normal text-[var(--muted)]">
                  {" "}
                  MB / {storageMbLimit} MB
                </span>
              </span>
              <span className="text-xs font-bold text-emerald-600 font-mono">OK</span>
            </div>
            <div className="w-full bg-[var(--border)] h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full"
                style={{
                  width: `${Math.min(100, Math.round((usage.storageBytesUsed / usage.storageBytesLimit) * 100))}%`,
                }}
              />
            </div>
            <p className="text-[11px] text-[var(--muted)]">
              Kompresi foto otomatis untuk format web & cetak
            </p>
          </div>
        </div>

        {/* Plan Tiers Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[var(--text)]">Pilihan Paket Langganan Agen</h2>
              <p className="text-xs text-[var(--muted)]">
                Tingkatkan kuota komputasi dan resolusi ekspor untuk mendukung transaksi Anda
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[#f5b800] border border-[#f5b800]/30 bg-[#f5b800]/10 px-3 py-1 rounded-lg">
              Paket Aktif: {activePlanConfig.name}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PLAN_LIST.map((tier) => {
              const isCurrent = tier.id === activePlanId;
              return (
                <div
                  key={tier.id}
                  className={`p-6 rounded-2xl border transition-all flex flex-col justify-between ${
                    isCurrent
                      ? "bg-[var(--surface)] border-[#f5b800] ring-2 ring-[#f5b800] shadow-md"
                      : "bg-[var(--surface)] border-[var(--border)] hover:border-[var(--muted)]"
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-[var(--text)]">{tier.name}</h3>
                      {isCurrent && (
                        <span className="text-[10px] bg-[#f5b800] text-neutral-950 font-black px-2 py-0.5 rounded-full">
                          Aktif
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-2xl font-bold font-mono text-[var(--text)]">
                        {tier.price}
                      </span>
                      <span className="text-xs text-[var(--muted)] font-medium"> {tier.period}</span>
                    </div>

                    <p className="text-xs text-[var(--muted)] leading-relaxed">{tier.desc}</p>

                    <div className="pt-3 border-t border-[var(--border)] space-y-2 text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-[var(--muted)]">AI Request:</span>
                        <span className="font-bold text-[var(--text)]">{tier.aiLimit} / bln</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--muted)]">Flyer 300 DPI:</span>
                        <span className="font-bold text-[var(--text)]">{tier.flyerLimit} / bln</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--muted)]">Storage Media:</span>
                        <span className="font-bold text-[var(--text)]">{tier.storage}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[var(--border)] space-y-1.5">
                      {tier.features.map((feat, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-[var(--text)]/90">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="text-[11px]">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-5 mt-5 border-t border-[var(--border)]">
                    <button
                      type="button"
                      disabled={isCurrent}
                      onClick={() => setSelectedPlanToUpgrade(tier.id)}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isCurrent
                          ? "bg-[var(--bg)] text-[var(--muted)] border border-[var(--border)] cursor-default"
                          : "bg-[#f5b800] text-neutral-950 hover:bg-[#e5ac00] shadow-xs cursor-pointer"
                      }`}
                    >
                      {isCurrent ? "Paket Anda Saat Ini" : "Pilih Paket Ini"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Idempotent Transactional Ledger History Table */}
        <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--border)]">
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-[var(--text)] flex items-center gap-2">
                <Hash className="w-4 h-4 text-[#f5b800]" />
                <span>Buku Besar Transaksi Kuota (Idempotent Ledger)</span>
              </h3>
              <p className="text-xs text-[var(--muted)]">
                Setiap request AI dan ekspor flyer tercatat dengan kunci idempotensi anti-selisih dua langkah
              </p>
            </div>

            <span className="text-xs font-mono text-[var(--muted)]">
              {ledgerEntries.length} Catatan Transaksi
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--muted)] font-semibold">
                  <th className="py-2.5 px-3">Waktu</th>
                  <th className="py-2.5 px-3">Idempotency Key</th>
                  <th className="py-2.5 px-3">Layanan</th>
                  <th className="py-2.5 px-3">Aksi</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Keterangan</th>
                  <th className="py-2.5 px-3 text-right">Sisa Saldo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {ledgerEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-[var(--bg)]/50 transition-colors">
                    <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px] text-[var(--muted)]">
                      {entry.timestamp ? new Date(entry.timestamp).toLocaleTimeString() : "Baru saja"}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px] text-[var(--text)]">
                      {entry.idempotencyKey.slice(0, 18)}...
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap font-semibold">
                      <span className="px-2 py-0.5 rounded bg-[var(--bg)] border border-[var(--border)] text-[10px]">
                        {entry.service}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px]">
                      {entry.action}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          entry.status === "COMMITTED"
                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                        }`}
                      >
                        {entry.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-[var(--muted)] max-w-xs truncate">
                      {entry.note}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-[var(--text)]">
                      {entry.balanceAfter}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upgrade Confirmation Modal */}
        {selectedPlanToUpgrade && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
          >
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#f5b800]" />
                  <h3 className="font-bold text-sm text-[var(--text)]">
                    Konfirmasi Perubahan Paket
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPlanToUpgrade(null)}
                  className="text-[var(--muted)] hover:text-[var(--text)]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <p className="text-[var(--muted)]">
                  Anda akan beralih ke paket{" "}
                  <strong className="text-[var(--text)]">
                    {PLAN_CONFIGS[selectedPlanToUpgrade].name}
                  </strong>{" "}
                  dengan biaya{" "}
                  <strong className="text-[var(--text)]">
                    {PLAN_CONFIGS[selectedPlanToUpgrade].price}{" "}
                    {PLAN_CONFIGS[selectedPlanToUpgrade].period}
                  </strong>
                  .
                </p>

                <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)]">AI Request Baru:</span>
                    <span className="font-bold text-[var(--text)]">
                      {PLAN_CONFIGS[selectedPlanToUpgrade].aiLimit} / bulan
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)]">Flyer 300 DPI:</span>
                    <span className="font-bold text-[var(--text)]">
                      {PLAN_CONFIGS[selectedPlanToUpgrade].flyerLimit} / bulan
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)]">Prosedur Ledger:</span>
                    <span className="text-emerald-600 font-bold">Reserve & Commit Otomatis</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPlanToUpgrade(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-[var(--border)] text-[var(--text)] hover:bg-[var(--bg)]"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmUpgrade}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#f5b800] text-neutral-950 hover:bg-[#e5ac00]"
                >
                  Konfirmasi Upgrade
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </WorkspaceShell>
  );
}
