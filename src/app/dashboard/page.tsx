"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Bot, MapPin, Wand2 } from "lucide-react";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { useAgentStore } from "@/lib/store";
import { PLANS } from "@/config/plans";
import { useBilling } from "@/lib/billing/use-billing";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { BetaFeedbackModal } from "@/components/beta/BetaFeedbackModal";

function formatPrice(price: number) {
  if (price >= 1_000_000_000) return `Rp${(price / 1_000_000_000).toLocaleString("id-ID", { maximumFractionDigits: 2 })} M`;
  return `Rp${Math.round(price / 1_000_000).toLocaleString("id-ID")} jt`;
}

function QuotaCard({ label, used, limit }: { label: string; used: number | null; limit: number }) {
  const pct = used === null || limit <= 0 ? 0 : Math.min(100, (used / limit) * 100);
  return (
    <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
      <span className="text-sm text-[var(--muted)]">{label}</span>
      <div className="text-2xl font-bold tabular-nums mt-1">
        {used === null ? "–" : used}
        <span className="text-sm font-normal text-[var(--muted)]"> / {limit}</span>
      </div>
      <div className="mt-3 h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
        <div className="h-full bg-[var(--accent)]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { agent, listings, onboardingCompleted } = useAgentStore();
  const billing = useBilling();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);

  const plan = PLANS[billing.planId];
  const live = billing.mode === "live";
  const recent = [...listings]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 3);

  return (
    <WorkspaceShell title="Dasbor" subtitle={`Halo, ${agent.name}`}>
      <div className="space-y-8">
        {/* Main actions */}
        <div className="grid md:grid-cols-2 gap-4">
          <Link
            href="/photo-editor"
            className="group p-6 rounded-2xl bg-[var(--accent)] text-neutral-950 flex items-center justify-between gap-4"
          >
            <div>
              <Wand2 className="w-6 h-6" />
              <h2 className="mt-3 text-lg font-black">Edit foto baru</h2>
              <p className="text-sm text-neutral-800">Hapus nomor rumah atau telepon, lalu resize.</p>
            </div>
            <ArrowRight className="w-6 h-6 shrink-0 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/assistant"
            className="group p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] flex items-center justify-between gap-4"
          >
            <div>
              <Bot className="w-6 h-6 text-[var(--accent-text)]" />
              <h2 className="mt-3 text-lg font-black">Tanya Asisten AI</h2>
              <p className="text-sm text-[var(--muted)]">Pesan klien, skrip negosiasi, legalitas.</p>
            </div>
            <ArrowRight className="w-6 h-6 shrink-0 text-[var(--muted)] transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Quota */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold">{live ? `Kuota bulan ini · Paket ${plan.name}` : "Kuota bulan ini"}</h2>
            <Link href="/pricing" className="text-sm font-semibold hover:underline">Lihat paket</Link>
          </div>
          {!live && (
            <p className="text-sm text-[var(--muted)]">Mode demo: kuota mulai dihitung setelah akun dan AI diaktifkan.</p>
          )}
          <div className="grid sm:grid-cols-2 gap-4">
            <QuotaCard label="Pesan AI" used={live ? billing.usage?.chat ?? 0 : null} limit={billing.limits?.chat ?? plan.quotas.chat} />
            <QuotaCard label="Edit foto AI" used={live ? billing.usage?.ai_photo ?? 0 : null} limit={billing.limits?.ai_photo ?? plan.quotas.ai_photo} />
          </div>
        </section>

        {/* Recent listings */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold">Listing terakhir</h2>
            <Link href="/templates" className="text-sm font-semibold hover:underline">Lihat semua ({listings.length})</Link>
          </div>
          {recent.length === 0 ? (
            <div className="p-6 rounded-2xl border border-dashed border-[var(--border)] text-sm text-[var(--muted)] text-center">
              Belum ada listing. <Link href="/listing" className="font-semibold text-[var(--text)] underline">Tulis listing pertama</Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {recent.map((item) => (
                <div key={item.id} className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex flex-col gap-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--muted)]">{item.type} · {item.transactionType}</span>
                    <span className="font-bold">{formatPrice(item.price)}</span>
                  </div>
                  <h3 className="font-bold">{item.name}</h3>
                  <p className="text-sm text-[var(--muted)] flex items-center gap-1">
                    <MapPin className="w-4 h-4 shrink-0" />{item.location}
                  </p>
                  <p className="text-sm text-[var(--muted)]">
                    LT {item.landSize} m² · LB {item.buildingSize} m² · {item.bedrooms} KT · {item.bathrooms} KM
                  </p>
                  <div className="mt-auto pt-3 border-t border-[var(--border)] flex gap-2 text-sm">
                    <Link href={`/listing?id=${item.id}`} className="flex-1 py-2 rounded-xl border border-[var(--border)] text-center font-semibold hover:border-[var(--accent)]">
                      Tulis deskripsi
                    </Link>
                    <Link href={`/flyer?listingId=${item.id}`} className="flex-1 py-2 rounded-xl bg-[var(--accent)] text-neutral-950 text-center font-semibold">
                      Buat flyer
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="flex flex-wrap gap-4 text-sm text-[var(--muted)]">
          <button type="button" onClick={() => setWizardOpen(true)} className="hover:text-[var(--text)] underline-offset-4 hover:underline">
            {onboardingCompleted ? "Ubah data agen" : "Isi data agen"}
          </button>
          <button type="button" onClick={() => setFeedbackOpen(true)} className="hover:text-[var(--text)] underline-offset-4 hover:underline">
            Kirim masukan
          </button>
        </div>
      </div>

      <OnboardingWizard isOpen={wizardOpen} onClose={() => setWizardOpen(false)} />
      <BetaFeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </WorkspaceShell>
  );
}
