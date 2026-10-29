"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Palette,
  MessageSquare,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Plus,
  Home,
  CheckCircle2,
  Clock,
  ExternalLink,
  Layers,
  ShieldCheck,
  Building2,
  MapPin,
  Wand2,
  Compass,
  Star,
  Activity,
} from "lucide-react";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { useAgentStore } from "@/lib/store";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { BetaFeedbackModal } from "@/components/beta/BetaFeedbackModal";

export default function DashboardPage() {
  const { agent, listings, usage, locale, onboardingCompleted } = useAgentStore();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showBetaFeedback, setShowBetaFeedback] = useState(false);

  const totalValue = listings.reduce((sum, l) => sum + l.price, 0);

  return (
    <WorkspaceShell
      title={locale === "id" ? "Dasbor Agen" : "Agent Dashboard"}
      subtitle={locale === "id" ? "Ringkasan listing aktif dan alat kerja harian" : "Active listings & daily workflow suite"}
    >
      <div className="space-y-8">
        {/* Fast-Track Onboarding Callout Banner if not completed */}
        {!onboardingCompleted && (
          <div className="p-4 rounded-2xl bg-[#f5b800]/10 border border-[#f5b800]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-[#f5b800] text-neutral-950 flex items-center justify-center font-bold shrink-0 shadow-xs">
                <Compass className="w-5 h-5" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-[var(--text)]">
                  {locale === "id"
                    ? "Panduan Cepat Agen Brighton (3 Menit)"
                    : "Brighton Agent 3-Minute Fast-Track Guide"}
                </h4>
                <p className="text-[11px] text-[var(--muted)]">
                  {locale === "id"
                    ? "Atur cabang kantor, lisensi AREBI, dan stempel Brand Kit resmi Brighton."
                    : "Configure branch office, AREBI license, and Brighton corporate brand kit."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowOnboarding(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#f5b800] text-neutral-950 hover:bg-[#e5ac00] shrink-0 shadow-xs transition-colors"
            >
              {locale === "id" ? "Mulai Onboarding" : "Start Onboarding"}
            </button>
          </div>
        )}

        {/* Welcome Banner */}
        <div className="p-6 md:p-8 rounded-2xl bg-[var(--surface)] border border-[var(--border)] relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="max-w-2xl space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#f5b800]">
                  {locale === "id" ? "Selamat Datang," : "Welcome back,"}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-500/20">
                  Phase 10 Beta Live
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--text)]">
                {agent.name}
              </h1>
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                {locale === "id"
                  ? `Siap menyusun materi pemasaran hari ini? Kelola listing di ${agent.office} atau buat flyer 300 DPI siap cetak dalam hitungan menit.`
                  : `Ready to market your properties today? Manage your listings in ${agent.office} or generate 300 DPI print flyers in minutes.`}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowBetaFeedback(true)}
                className="px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--surface)] text-xs font-semibold text-[var(--text)] flex items-center gap-1.5 transition-colors"
              >
                <Star className="w-3.5 h-3.5 text-[#f5b800] fill-current" />
                <span>{locale === "id" ? "Masukan Beta" : "Beta Feedback"}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowOnboarding(true)}
                className="px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--surface)] text-xs font-semibold text-[var(--text)] flex items-center gap-1.5 transition-colors"
              >
                <Compass className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>{locale === "id" ? "Tur Fitur" : "Tour Guide"}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <Link
              href="/listing"
              className="px-4 py-2.5 rounded-xl bg-[#f5b800] text-neutral-950 font-bold text-xs flex items-center gap-2 hover:bg-[#e5ac00] transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>{locale === "id" ? "Tulis Listing Baru" : "Draft New Listing"}</span>
            </Link>
            <Link
              href="/flyer"
              className="px-4 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs font-semibold text-[var(--text)] flex items-center gap-2 hover:bg-[var(--bg)] transition-colors"
            >
              <Palette className="w-4 h-4 text-[#f5b800]" />
              <span>{locale === "id" ? "Buka Flyer Studio" : "Open Flyer Studio"}</span>
            </Link>
            <Link
              href="/photo-editor"
              className="px-4 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs font-semibold text-[var(--text)] flex items-center gap-2 hover:bg-[var(--bg)] transition-colors"
            >
              <Wand2 className="w-4 h-4 text-purple-500" />
              <span>{locale === "id" ? "Sensor Foto Properti" : "Property Photo Editor"}</span>
            </Link>
            <Link
              href="/followup"
              className="px-4 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs font-semibold text-[var(--text)] flex items-center gap-2 hover:bg-[var(--bg)] transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>{locale === "id" ? "Kirim Follow-up WA" : "WhatsApp Follow-up"}</span>
            </Link>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
            <span className="text-xs text-[var(--muted)]">
              {locale === "id" ? "Listing Aktif" : "Active Portfolio"}
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-bold font-mono text-[var(--text)]">
                {listings.length}
              </span>
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ready
              </span>
            </div>
            <p className="text-[11px] text-[var(--muted)] mt-1">
              {locale === "id" ? "Semua spesifikasi tervalidasi" : "All property specs verified"}
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
            <span className="text-xs text-[var(--muted)]">
              {locale === "id" ? "Total Nilai Portofolio" : "Portfolio Valuation"}
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-xl font-bold font-mono text-[var(--text)] truncate">
                Rp {(totalValue / 1000000000).toFixed(2)} M
              </span>
              <Building2 className="w-4 h-4 text-[var(--accent)] shrink-0" />
            </div>
            <p className="text-[11px] text-[var(--muted)] mt-1">
              {locale === "id" ? "Berdasarkan harga listing aktif" : "Sum of asking prices"}
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
            <span className="text-xs text-[var(--muted)]">
              {locale === "id" ? "Kuota AI Terpakai" : "AI Compute Quota"}
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-bold font-mono text-[var(--text)]">
                {usage.aiRequestsUsed}
                <span className="text-xs text-[var(--muted)] font-normal"> / {usage.aiRequestsLimit}</span>
              </span>
              <span className="text-xs text-[var(--accent)] font-semibold">
                {Math.round((usage.aiRequestsUsed / usage.aiRequestsLimit) * 100)}%
              </span>
            </div>
            <div className="w-full bg-[var(--border)] h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-[var(--accent)] h-full rounded-full"
                style={{ width: `${(usage.aiRequestsUsed / usage.aiRequestsLimit) * 100}%` }}
              />
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
            <span className="text-xs text-[var(--muted)]">
              {locale === "id" ? "Ekspor Flyer 300 DPI" : "Print Flyer Exports"}
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-bold font-mono text-[var(--text)]">
                {usage.flyerExportsUsed}
                <span className="text-xs text-[var(--muted)] font-normal"> / {usage.flyerExportsLimit}</span>
              </span>
              <span className="text-xs text-amber-600 font-semibold font-mono">
                {usage.flyerExportsLimit - usage.flyerExportsUsed} sisa
              </span>
            </div>
            <p className="text-[11px] text-[var(--muted)] mt-1">
              {locale === "id" ? "Reset periode 30 Nov 2026" : "Cycle resets Nov 30, 2026"}
            </p>
          </div>
        </div>

        {/* Core Workflow Tools Strip */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[var(--text)]">
              {locale === "id" ? "Alat Pemasaran Cepat" : "Core Agent Workflows"}
            </h2>
            <span className="text-xs text-[var(--muted)] font-medium">
              {locale === "id" ? "Pilih alur kerja untuk memulai" : "Select workflow to begin"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/listing"
              className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] transition-all group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
                  {locale === "id" ? "Listing Description Writer" : "Listing Description Writer"}
                </h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  {locale === "id"
                    ? "Input fakta properti sekali, dapatkan 3 gaya copywriting (Keluarga, Investor, Formal) dengan verifikasi fakta dua sisi."
                    : "Enter property specs once, get 3 copy styles (Emotional, Investor, Formal) with zero hallucination guarantee."}
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-[var(--border)] flex items-center justify-between text-xs font-semibold text-[var(--accent)]">
                <span>{locale === "id" ? "Buka Writer" : "Open Studio"}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/flyer"
              className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] transition-all group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Palette className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
                  {locale === "id" ? "300 DPI Flyer Studio" : "300 DPI Flyer Studio"}
                </h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  {locale === "id"
                    ? "Desain brosur instan dalam 5 ukuran (Instagram, Story, Cetak A4) dengan generator QR WhatsApp otomatis."
                    : "Instant graphic design across 5 ratios (Instagram, Story, Print A4) with dynamic QR WhatsApp codes."}
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-[var(--border)] flex items-center justify-between text-xs font-semibold text-[var(--accent)]">
                <span>{locale === "id" ? "Buka Desain" : "Design Flyer"}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/followup"
              className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] transition-all group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
                  {locale === "id" ? "Follow-up WhatsApp Klien" : "WhatsApp Client Follow-up"}
                </h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  {locale === "id"
                    ? "Susun pesan tindak lanjut pasca-survei lokasi, pengingat DP, dan penawaran khusus dengan link chat WhatsApp langsung."
                    : "Draft post-viewing check-ins, price reduction alerts, and down-payment reminders with direct WhatsApp links."}
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-[var(--border)] flex items-center justify-between text-xs font-semibold text-[var(--accent)]">
                <span>{locale === "id" ? "Susun Pesan" : "Draft Messages"}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>

        {/* Active Listings Table */}
        <div className="border border-[var(--border)] bg-[var(--surface)] rounded-2xl p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
            <div>
              <h2 className="text-lg font-bold text-[var(--text)]">
                {locale === "id" ? "Portofolio Listing Properti" : "Active Property Listings"}
              </h2>
              <p className="text-xs text-[var(--muted)]">
                {locale === "id"
                  ? "Daftar properti yang siap dibuatkan copywriting, flyer, atau pesan follow-up."
                  : "List of properties ready for copy generation, flyer printing, or client follow-ups."}
              </p>
            </div>
            <Link
              href="/listing"
              className="px-3 py-2 rounded-lg bg-[var(--accent)] text-white text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto hover:opacity-90"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{locale === "id" ? "Tambah Properti" : "New Property"}</span>
            </Link>
          </div>

          <div className="divide-y divide-[var(--border)]">
            {listings.map((l) => (
              <div
                key={l.id}
                className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 first:pt-0 last:pb-0"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)] shrink-0 mt-0.5">
                    <Home className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[var(--accent)] uppercase">
                        {l.transactionType} · {l.type}
                      </span>
                      <span aria-hidden="true" className="text-[var(--muted)]">·</span>
                      <span className="text-xs text-[var(--muted)]">{l.certificate}</span>
                    </div>
                    <h3 className="text-sm font-bold text-[var(--text)] mt-0.5">{l.name}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--muted)] mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[var(--muted)]" />
                        {l.location}
                      </span>
                      <span>LT {l.landSize}m² / LB {l.buildingSize}m²</span>
                      <span>{l.bedrooms} KT · {l.bathrooms} KM</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end md:self-auto">
                  <div className="text-right">
                    <span className="text-sm font-bold font-mono text-[var(--text)]">
                      Rp {l.price.toLocaleString("id-ID")}
                    </span>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      {l.condition}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/listing?id=${l.id}`}
                      className="px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface)] transition-colors"
                    >
                      Writer
                    </Link>
                    <Link
                      href={`/flyer?listingId=${l.id}`}
                      className="px-2.5 py-1.5 rounded-lg border border-[var(--accent)] text-xs font-semibold text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition-colors"
                    >
                      Flyer
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Phase 9 & 10 System Telemetry & Commercial Release Status */}
        <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-[var(--text)]">
              Status Sistem & Telemetry:
            </span>
            <span className="text-emerald-600 font-mono font-bold">
              100% Operational · Phase 10 Concluded
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-[var(--muted)]">
            <span>Uptime: 99.98%</span>
            <span aria-hidden="true">·</span>
            <a
              href="/api/health"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#f5b800] hover:underline flex items-center gap-1 font-semibold"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Cek API Health Telemetry</span>
            </a>
          </div>
        </div>

        {/* Modals */}
        <OnboardingWizard
          isOpen={showOnboarding}
          onClose={() => setShowOnboarding(false)}
        />
        <BetaFeedbackModal
          isOpen={showBetaFeedback}
          onClose={() => setShowBetaFeedback(false)}
        />
      </div>
    </WorkspaceShell>
  );
}
