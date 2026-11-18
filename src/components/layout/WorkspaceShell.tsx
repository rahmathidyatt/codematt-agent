"use client";

import React, { useState, useEffect, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Palette,
  MessageSquare,
  Sparkles,
  Bot,
  Layers,
  BarChart3,
  Users,
  Settings,
  Menu,
  X,
  Sun,
  Moon,
  Laptop,
  ShieldCheck,
  Wand2,
  Crop,
  type LucideIcon,
} from "lucide-react";
import { useAgentStore } from "@/lib/store";
import { PLANS } from "@/config/plans";
import { useBilling } from "@/lib/billing/use-billing";

interface WorkspaceShellProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Extra paths that highlight this item (merged sections). */
  also?: string[];
}

const NAV_GROUPS: { label: string | null; items: NavItem[] }[] = [
  { label: null, items: [{ href: "/dashboard", label: "Dasbor", icon: LayoutDashboard }] },
  {
    label: "Foto & Flyer",
    items: [
      { href: "/photo-editor", label: "Edit Foto", icon: Wand2 },
      { href: "/photo-tools", label: "Ukuran & HD", icon: Crop },
      { href: "/flyer", label: "Pembuat Flyer", icon: Palette },
      { href: "/brand", label: "Identitas Brand", icon: ShieldCheck },
    ],
  },
  {
    label: "Tulis dengan AI",
    items: [
      { href: "/assistant", label: "Asisten AI", icon: Bot },
      { href: "/listing", label: "Penulis Listing", icon: FileText },
      { href: "/followup", label: "Follow-up WhatsApp", icon: MessageSquare },
      { href: "/content", label: "Konten Media Sosial", icon: Sparkles },
    ],
  },
  {
    label: "Prospek & Akun",
    items: [
      { href: "/leads", label: "Kontak Prospek", icon: Users },
      { href: "/templates", label: "Arsip & Panduan", icon: Layers, also: ["/knowledge"] },
      { href: "/pricing", label: "Langganan", icon: BarChart3 },
      { href: "/settings", label: "Pengaturan", icon: Settings },
    ],
  },
];

const ALL_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

function isActiveItem(item: NavItem, pathname: string | null) {
  return pathname === item.href || Boolean(pathname && item.also?.includes(pathname));
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-black tracking-tight text-[var(--text)]" aria-label="Codematt Agent, beranda">
      <span className="w-8 h-8 rounded-lg bg-[var(--accent)] text-neutral-950 flex items-center justify-center text-sm">C</span>
      Codematt Agent
    </Link>
  );
}

function NavList({ pathname, onNavigate }: { pathname: string | null; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 p-3 space-y-5" aria-label="Menu utama">
      {NAV_GROUPS.map((group, gi) => (
        <div key={group.label ?? gi} className="space-y-1">
          {group.label && (
            <div className="px-3 pb-1 text-[13px] font-semibold text-[var(--muted)]">{group.label}</div>
          )}
          {group.items.map((item) => {
            const Icon = item.icon;
            const active = isActiveItem(item, pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors ${
                  active
                    ? "bg-[var(--accent)] text-neutral-950 font-bold"
                    : "text-[var(--text)] hover:bg-[var(--bg)]"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? "text-neutral-950" : "text-[var(--muted)]"}`} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

export function WorkspaceShell({ children, title, subtitle }: WorkspaceShellProps) {
  const pathname = usePathname();
  const { agent, locale, setLocale, theme, setTheme } = useAgentStore();
  const billing = useBilling();
  const chatUsed = billing.usage?.chat ?? 0;
  const chatLimit = billing.limits?.chat ?? PLANS[billing.planId].quotas.chat;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // The workspace is Indonesian-only for now; reset older saved "en" choices.
  useEffect(() => {
    if (locale !== "id") setLocale("id");
  }, [locale, setLocale]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const current = ALL_ITEMS.find((m) => isActiveItem(m, pathname));
  const quota = (
    <Link href="/pricing" className="block p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-sm space-y-1.5 hover:border-[var(--accent)]">
      <div className="flex items-center justify-between text-[var(--muted)] text-[13px]">
        <span>{billing.mode === "live" ? `Paket ${PLANS[billing.planId].name}` : "Mode demo"}</span>
        {billing.mode === "live" && (
          <span className="tabular-nums font-bold text-[var(--text)]">{chatUsed}/{chatLimit} pesan</span>
        )}
      </div>
      <div className="w-full bg-[var(--border)] h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-[var(--accent)] h-full rounded-full"
          style={{ width: `${billing.mode === "live" && chatLimit > 0 ? Math.min(100, (chatUsed / chatLimit) * 100) : 0}%` }}
        />
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-[var(--border)] bg-[var(--surface)] shrink-0 h-screen sticky top-0 overflow-y-auto">
        <div className="p-5 border-b border-[var(--border)]">
          <Logo />
        </div>
        <div className="px-5 py-4 border-b border-[var(--border)] flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-950 text-[13px] font-black shrink-0 border border-black/10"
            style={{ backgroundColor: agent.primaryColor || "#f5b800" }}
          >
            {agent.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold truncate">{agent.name}</p>
            <p className="text-[13px] text-[var(--muted)] truncate">{agent.agency}</p>
          </div>
        </div>
        <NavList pathname={pathname} />
        <div className="p-3 border-t border-[var(--border)]">{quota}</div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-[var(--border)] bg-[var(--surface)] px-4 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]"
              aria-label="Buka menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base font-bold truncate">{title || current?.label || "Workspace"}</h1>
              {subtitle && <p className="hidden md:block text-[13px] text-[var(--muted)] truncate">{subtitle}</p>}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (theme === "light") setTheme("dark");
              else if (theme === "dark") setTheme("system");
              else setTheme("light");
            }}
            className="p-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--muted)] hover:text-[var(--text)]"
            title={theme === "light" ? "Tema terang" : theme === "dark" ? "Tema gelap" : "Ikuti sistem"}
            aria-label="Ganti tema"
          >
            {theme === "light" ? <Sun className="w-4 h-4" /> : theme === "dark" ? <Moon className="w-4 h-4" /> : <Laptop className="w-4 h-4" />}
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} aria-hidden="true" />
          <div className="relative w-72 max-w-[85vw] bg-[var(--surface)] h-full flex flex-col z-10 shadow-xl border-r border-[var(--border)] overflow-y-auto">
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
              <Logo />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]"
                aria-label="Tutup menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <NavList pathname={pathname} onNavigate={() => setMobileMenuOpen(false)} />
            <div className="p-3 border-t border-[var(--border)]">{quota}</div>
          </div>
        </div>
      )}
    </div>
  );
}
