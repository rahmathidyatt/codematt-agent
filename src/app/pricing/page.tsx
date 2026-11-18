"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, CreditCard, Loader2 } from "lucide-react";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { PLAN_ORDER, PLANS, PROVIDER_LABELS, formatRupiah, type PlanId } from "@/config/plans";
import { errorMessage, useBilling } from "@/lib/billing/use-billing";

export default function PricingPage() {
  const billing = useBilling();
  const [busy, setBusy] = useState<PlanId | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkout = async (planId: PlanId) => {
    setBusy(planId);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (data?.ok && typeof data.redirectUrl === "string" && data.redirectUrl.startsWith("https://")) {
        window.location.assign(data.redirectUrl);
        return;
      }
      setError(errorMessage(data?.code));
    } catch {
      setError(errorMessage(null));
    } finally {
      setBusy(null);
    }
  };

  const canCheckout = billing.flags.checkout && billing.mode === "live";

  return (
    <WorkspaceShell title="Langganan" subtitle="Pilih paket sesuai kebutuhan. Bayar per 30 hari, tanpa potong otomatis.">
      <div className="max-w-5xl mx-auto space-y-6">
        {billing.mode === "live" && (
          <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-xs flex flex-wrap gap-4 items-center">
            <span>Paket aktif: <strong>{PLANS[billing.planId].name}</strong></span>
            {billing.periodEnd && (
              <span>Berlaku sampai {new Date(billing.periodEnd).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
            )}
            {billing.usage && billing.limits && (
              <span className="font-mono text-[var(--muted)]">
                Chat {billing.usage.chat}/{billing.limits.chat} · Edit foto AI {billing.usage.ai_photo}/{billing.limits.ai_photo}
              </span>
            )}
          </div>
        )}
        {!billing.loading && !canCheckout && (
          <div className="p-3 rounded-xl border border-amber-500/40 bg-amber-500/10 text-xs">
            {billing.mode === "signed-out"
              ? <>Silakan <Link href="/login" className="underline font-bold">login</Link> untuk berlangganan.</>
              : "Pembayaran belum aktif di server ini (mode demo). Tombol beli akan aktif setelah Supabase dan Midtrans dikonfigurasi."}
          </div>
        )}
        {error && <div role="alert" className="p-3 rounded-xl border border-rose-500/40 bg-rose-500/10 text-xs">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {PLAN_ORDER.map((id) => {
            const plan = PLANS[id];
            const current = billing.mode === "live" && billing.planId === id;
            return (
              <div
                key={id}
                className={`p-5 rounded-2xl border flex flex-col gap-4 ${
                  id === "pro" ? "border-[var(--accent)] bg-[var(--accent)]/5" : "border-[var(--border)] bg-[var(--surface)]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-black text-[var(--text)]">{plan.name}</h2>
                    {id === "pro" && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent)] text-neutral-950">Paling lengkap</span>}
                  </div>
                  <p className="mt-2 text-2xl font-black text-[var(--text)]">
                    {plan.purchasable ? formatRupiah(plan.priceIdr) : id === "free" ? "Gratis" : "Hubungi kami"}
                    {plan.purchasable && <span className="text-xs font-medium text-[var(--muted)]"> / 30 hari</span>}
                  </p>
                </div>
                <ul className="space-y-1.5 text-xs text-[var(--text)] flex-1">
                  {plan.highlights.map((h) => (
                    <li key={h} className="flex gap-2"><Check className="w-3.5 h-3.5 mt-0.5 text-[var(--accent)] shrink-0" />{h}</li>
                  ))}
                  <li className="flex gap-2 text-[var(--muted)]">
                    <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" />Model: {plan.providers.map((p) => PROVIDER_LABELS[p]).join(", ")}
                  </li>
                </ul>
                {plan.purchasable ? (
                  <button
                    type="button"
                    disabled={!canCheckout || busy !== null}
                    onClick={() => checkout(id)}
                    className="w-full py-2.5 rounded-xl bg-[var(--accent)] text-neutral-950 text-xs font-black flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {busy === id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                    {current ? "Perpanjang 30 hari" : "Bayar dengan Midtrans"}
                  </button>
                ) : (
                  <div className="w-full py-2.5 rounded-xl border border-[var(--border)] text-xs text-center text-[var(--muted)]">
                    {current ? "Paket aktif" : id === "free" ? "Otomatis untuk akun baru" : "Aktivasi oleh admin"}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-[11px] text-[var(--muted)] space-y-1">
          <p>Pembayaran diproses Midtrans (QRIS, transfer VA, e-wallet, kartu). Paket aktif otomatis setelah Midtrans mengonfirmasi pembayaran.</p>
          <p>Kuota direset setiap tanggal 1 (WIB). Gagal dari penyedia AI tidak memotong kuota. Resize foto gratis tanpa batas di semua paket.</p>
        </div>
      </div>
    </WorkspaceShell>
  );
}
