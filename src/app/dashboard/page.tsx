"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Wand2,
  Palette,
  FileText,
  MessageSquare,
  Share2,
  Bot,
  FolderKanban,
  Users,
  BookOpen,
  CreditCard,
  Sparkles,
  ArrowRight,
  Building2,
  CheckCircle2,
  Layers,
  MapPin,
  Phone,
  MessageSquarePlus,
} from "lucide-react";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { useAgentStore } from "@/lib/store";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { BetaFeedbackModal } from "@/components/beta/BetaFeedbackModal";

type DashboardTab = "overview" | "portfolio" | "presets";

export default function DashboardPage() {
  const { agent, listings, flyerPresets, flyerExports, usage, locale, onboardingCompleted } =
    useAgentStore();
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [listingFilter, setListingFilter] = useState<"all" | "Dijual" | "Disewa">("all");

  const filteredListings = listings.filter((l) =>
    listingFilter === "all" ? true : l.transactionType === listingFilter
  );

  const quickTools = [
    {
      href: "/photo-editor",
      title: "Edit Foto Properti",
      desc: "Pencahayaan HDR, langit biru cerah, dan watermark lisensi otomatis.",
      badge: "Studio Foto AI",
      icon: Wand2,
    },
    {
      href: "/flyer",
      title: "Flyer Studio 300 DPI",
      desc: "Desain flyer IG Feed, Story, & A4 siap cetak dengan QR WhatsApp & mode Co-Broke.",
      badge: `${usage.flyerExportsUsed}/${usage.flyerExportsLimit} flyer`,
      icon: Palette,
    },
    {
      href: "/listing",
      title: "Listing Description Writer",
      desc: "Otomasi draf listing 3 gaya (Emosional, Investor, Formal) dengan verifikasi fakta 100%.",
      badge: "Fact Safeguard",
      icon: FileText,
    },
    {
      href: "/followup",
      title: "Follow-up WhatsApp",
      desc: "Skrip balasan prospek cepat berdasarkan konteks survei, negosiasi, dan KPR.",
      badge: "5 Skenario WA",
      icon: MessageSquare,
    },
    {
      href: "/content",
      title: "Content Studio",
      desc: "Hook Instagram Carousel, skrip video TikTok, dan buletin pasar properti.",
      badge: "3 Format",
      icon: Share2,
    },
    {
      href: "/assistant",
      title: "AI Property Assistant",
      desc: "Konsultasi perhitungan KPR, pajak BPHTB/PPh, AJB, dan strategi closing.",
      badge: `${usage.aiRequestsUsed}/${usage.aiRequestsLimit} kredit`,
      icon: Bot,
    },
  ];

  return (
    <WorkspaceShell
      title={locale === "id" ? "Dasbor Agen Properti" : "Property Agent Dashboard"}
      subtitle={
        locale === "id"
          ? `Selamat datang kembali, ${agent.name} (${agent.agency}) — pusat kendali pemasaran & prospek`
          : `Welcome back, ${agent.name} (${agent.agency}) — marketing & lead command center`
      }
    >
      <div className="space-y-8">
        {/* Top Action Banner & Multi-Model Gateway Switcher */}
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[var(--accent)]">
              <Sparkles className="w-4 h-4" />
              <span>Ekosistem Brighton Real Estate AI & Multi-Model Gateway</span>
            </div>
            <h2 className="text-lg font-bold text-[var(--text)]">
              Kelola Portofolio Properti, Automasi Konten & Uji Performa Model AI
            </h2>
            <p className="text-xs text-[var(--muted)] max-w-2xl">
              Gunakan menu di samping untuk membuka setiap modul spesialis properti, atau beralih ke tab di bawah untuk meninjau listing dan preset aktif.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setWizardOpen(true)}
              data-testid="open-onboarding-wizard-btn"
              className="px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--surface)] text-xs font-semibold text-[var(--text)] inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>{onboardingCompleted ? "Ubah Setup Agen" : "Setup Cepat Agen"}</span>
            </button>
            <button
              type="button"
              onClick={() => setFeedbackOpen(true)}
              data-testid="open-beta-feedback-btn"
              className="px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--surface)] text-xs font-semibold text-[var(--text)] inline-flex items-center gap-1.5 cursor-pointer"
            >
              <MessageSquarePlus className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>Masukan Beta</span>
            </button>
            <Link
              href="/"
              data-testid="open-multimodel-gateway-link"
              className="px-4 py-2 rounded-xl bg-[#f5b800] hover:bg-[#e5ac00] text-[#111113] text-xs font-bold inline-flex items-center gap-1.5 shadow-xs"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Buka Multi-Model AI Gateway</span>
            </Link>
          </div>
        </div>

        {/* 4-Column Portfolio & Quota KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
            <span className="text-xs text-[var(--muted)] block">Listing Properti Aktif</span>
            <div className="text-2xl font-bold font-mono text-[var(--text)] mt-1">
              {listings.length} <span className="text-xs font-normal text-[var(--muted)]">unit</span>
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-2 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Semua fakta terverifikasi
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
            <span className="text-xs text-[var(--muted)] block">Preset & Arsip Flyer</span>
            <div className="text-2xl font-bold font-mono text-[var(--text)] mt-1">
              {flyerPresets.length} <span className="text-xs font-normal text-[var(--muted)]">preset</span>
            </div>
            <p className="text-[11px] text-[var(--muted)] mt-2">
              {flyerExports.length} berkas diekspor 300 DPI
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
            <span className="text-xs text-[var(--muted)] block">Pemakaian Kredit AI</span>
            <div className="text-2xl font-bold font-mono text-[var(--text)] mt-1">
              {usage.aiRequestsUsed} <span className="text-xs font-normal text-[var(--muted)]">/ {usage.aiRequestsLimit}</span>
            </div>
            <p className="text-[11px] text-[var(--muted)] mt-2">
              Paket {usage.planId.toUpperCase()} · Kuota bulanan aman
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
            <span className="text-xs text-[var(--muted)] block">Ekspor Flyer 300 DPI</span>
            <div className="text-2xl font-bold font-mono text-[var(--text)] mt-1">
              {usage.flyerExportsUsed} <span className="text-xs font-normal text-[var(--muted)]">/ {usage.flyerExportsLimit}</span>
            </div>
            <p className="text-[11px] text-[var(--muted)] mt-2">
              Siap cetak & bagikan ke portal
            </p>
          </div>
        </div>

        {/* Dashboard View Tabs */}
        <div
          role="tablist"
          aria-label="Tab Dasbor Studio Properti"
          className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] overflow-x-auto"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "overview"}
            data-testid="dashboard-tab-overview"
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "overview"
                ? "bg-[var(--accent)] text-white shadow-xs"
                : "text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            Ringkasan & Modul AI (6)
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "portfolio"}
            data-testid="dashboard-tab-portfolio"
            onClick={() => setActiveTab("portfolio")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "portfolio"
                ? "bg-[var(--accent)] text-white shadow-xs"
                : "text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            Portofolio Listing ({listings.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "presets"}
            data-testid="dashboard-tab-presets"
            onClick={() => setActiveTab("presets")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "presets"
                ? "bg-[var(--accent)] text-white shadow-xs"
                : "text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            Preset Flyer ({flyerPresets.length})
          </button>
        </div>

        {/* TAB 1: OVERVIEW & AI MODULES */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {quickTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className="group p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] transition-all flex flex-col justify-between gap-5 shadow-xs"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[var(--bg)] border border-[var(--border)] text-[var(--muted)]">
                          {tool.badge}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-[var(--text)]">{tool.title}</h3>
                      <p className="text-xs text-[var(--muted)] leading-relaxed">{tool.desc}</p>
                    </div>
                    <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs font-semibold text-[var(--accent)]">
                      <span>Buka Modul</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Secondary Workspace Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <Link
                href="/templates"
                className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5 font-semibold text-[var(--text)]">
                  <FolderKanban className="w-4 h-4 text-[var(--accent)]" />
                  <span>Arsip & Template</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[var(--muted)]" />
              </Link>
              <Link
                href="/leads"
                className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5 font-semibold text-[var(--text)]">
                  <Users className="w-4 h-4 text-[var(--accent)]" />
                  <span>CRM Prospek</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[var(--muted)]" />
              </Link>
              <Link
                href="/knowledge"
                className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5 font-semibold text-[var(--text)]">
                  <BookOpen className="w-4 h-4 text-[var(--accent)]" />
                  <span>Basis Pengetahuan</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[var(--muted)]" />
              </Link>
              <Link
                href="/usage"
                className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5 font-semibold text-[var(--text)]">
                  <CreditCard className="w-4 h-4 text-[var(--accent)]" />
                  <span>Kuota & Billing</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[var(--muted)]" />
              </Link>
            </div>
          </div>
        )}

        {/* TAB 2: PORTFOLIO LISTINGS */}
        {activeTab === "portfolio" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-xs">
                {(["all", "Dijual", "Disewa"] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setListingFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer ${
                      listingFilter === filter
                        ? "bg-[var(--accent)] text-white"
                        : "bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)]"
                    }`}
                  >
                    {filter === "all" ? "Semua Transaksi" : filter}
                  </button>
                ))}
              </div>
              <Link
                href="/templates"
                className="text-xs font-semibold text-[var(--accent)] hover:underline"
              >
                Kelola Semua Listing →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {filteredListings.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2 py-0.5 rounded bg-[var(--accent)]/10 text-[var(--accent)] font-bold">
                        {item.type} · {item.transactionType}
                      </span>
                      <span className="font-mono font-bold text-[var(--text)]">
                        Rp {(item.price / 1000000000).toFixed(2)} M
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[var(--text)]">{item.name}</h3>
                    <p className="text-xs text-[var(--muted)] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span>{item.location}</span>
                    </p>
                    <div className="text-xs text-[var(--muted)] font-mono pt-1">
                      LT {item.landSize}m² · LB {item.buildingSize}m² · {item.bedrooms} KT · {item.bathrooms} KM
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[var(--border)] flex items-center gap-2 text-xs">
                    <Link
                      href={`/listing?id=${item.id}`}
                      className="flex-1 py-2 px-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-center font-semibold text-[var(--text)] hover:border-[var(--accent)]"
                    >
                      Buka Copywriter
                    </Link>
                    <Link
                      href={`/flyer?listingId=${item.id}`}
                      className="flex-1 py-2 px-3 rounded-xl bg-[var(--accent)] text-white text-center font-semibold hover:opacity-90"
                    >
                      Buat Flyer
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: FLYER PRESETS */}
        {activeTab === "presets" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {flyerPresets.map((preset) => (
                <div
                  key={preset.id}
                  className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-[var(--text)]">{preset.name}</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--accent)]/10 text-[var(--accent)] uppercase">
                        {preset.size}
                      </span>
                    </div>
                    <div className="text-xs text-[var(--muted)] flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-[var(--accent)]" />
                      <span>Tema: {preset.template}</span>
                      <span>·</span>
                      <span className="font-mono font-semibold text-[var(--text)]">
                        {preset.showBranding ? "Branded & QR" : "Clean Co-Broke"}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--muted)]">{preset.description}</p>
                  </div>

                  <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
                    <span className="text-[var(--muted)] flex items-center gap-1 font-mono">
                      <Phone className="w-3.5 h-3.5" /> {agent.phone}
                    </span>
                    <Link
                      href="/flyer"
                      className="px-3 py-1.5 rounded-xl bg-[var(--accent)] text-white font-semibold hover:opacity-90"
                    >
                      Buka di Flyer Studio
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <OnboardingWizard isOpen={wizardOpen} onClose={() => setWizardOpen(false)} />
      <BetaFeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </WorkspaceShell>
  );
}
