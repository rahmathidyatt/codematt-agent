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
  BookOpen,
  Settings,
  Menu,
  X,
  Globe,
  Sun,
  Moon,
  Laptop,
  ExternalLink,
  Milestone,
  ShieldCheck,
  Wand2,
} from "lucide-react";
import { useAgentStore } from "@/lib/store";
import { PLANS } from "@/config/plans";
import { useBilling } from "@/lib/billing/use-billing";

interface WorkspaceShellProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

const MODULE_NAV = [
  { href: "/dashboard", labelId: "Dasbor", labelEn: "Dashboard", icon: LayoutDashboard },
  { href: "/photo-editor", labelId: "Edit Foto Properti", labelEn: "Property Photo Editor", icon: Wand2, badge: "AI" },
  { href: "/flyer", labelId: "Flyer Studio", labelEn: "Flyer Studio", icon: Palette, badge: "300 DPI" },
  { href: "/listing", labelId: "Listing Writer", labelEn: "Listing Writer", icon: FileText, badge: "AI" },
  { href: "/followup", labelId: "Follow-up WhatsApp", labelEn: "WhatsApp Follow-up", icon: MessageSquare },
  { href: "/content", labelId: "Content Studio", labelEn: "Content Studio", icon: Sparkles },
  { href: "/assistant", labelId: "AI Assistant", labelEn: "AI Assistant", icon: Bot },
  { href: "/brand", labelId: "Brand Kit", labelEn: "Brand Kit", icon: ShieldCheck },
  { href: "/templates", labelId: "Arsip & Template", labelEn: "Saved & Templates", icon: Layers },
  { href: "/pricing", labelId: "Langganan & Kuota", labelEn: "Plans & Usage", icon: BarChart3 },
  { href: "/leads", labelId: "Kontak Prospek", labelEn: "Leads CRM", icon: Users },
  { href: "/knowledge", labelId: "Basis Pengetahuan", labelEn: "Knowledge Base", icon: BookOpen },
  { href: "/settings", labelId: "Pengaturan", labelEn: "Settings", icon: Settings },
];

export function WorkspaceShell({ children, title, subtitle }: WorkspaceShellProps) {
  const pathname = usePathname();
  const { agent, locale, setLocale, theme, setTheme } = useAgentStore();
  const billing = useBilling();
  const chatUsed = billing.usage?.chat ?? 0;
  const chatLimit = billing.limits?.chat ?? PLANS[billing.planId].quotas.chat;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle ESC key for mobile drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const currentModule = MODULE_NAV.find((m) => m.href === pathname) || {
    labelId: title || "Workspace",
    labelEn: title || "Workspace",
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex">
      {/* Desktop Sidebar (Fixed 260px) */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-[var(--border)] bg-[var(--surface)] shrink-0 h-screen sticky top-0 overflow-y-auto">
        {/* Brand Lockup */}
        <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-[var(--accent)] text-neutral-950 flex items-center justify-center font-black text-sm shadow-xs">
              B.
            </span>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-tight text-[var(--text)] uppercase leading-none">
                BRIGHTON
              </span>
              <span className="text-[10px] font-semibold text-[var(--muted)] tracking-wider uppercase leading-none mt-0.5">
                Real Estate Agent
              </span>
            </div>
          </Link>
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[var(--accent)]/15 border border-[var(--accent)]/30 text-amber-800 dark:text-amber-300">
            PRO
          </span>
        </div>

        {/* Agent Profile Capsule */}
        <div className="p-4 border-b border-[var(--border)] bg-[var(--bg)]/50">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-950 text-xs font-black shrink-0 shadow-xs border border-black/10"
              style={{ backgroundColor: agent.primaryColor || "#f5b800" }}
            >
              {agent.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[var(--text)] truncate">{agent.name}</p>
              <p className="text-[11px] text-[var(--muted)] truncate">{agent.agency}</p>
            </div>
          </div>
        </div>

        {/* Navigation Modules */}
        <nav className="flex-1 p-3 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
            {locale === "id" ? "Modul Kerja" : "Agent Modules"}
          </div>
          {MODULE_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-[var(--accent)] text-neutral-950 shadow-xs font-bold"
                    : "text-[var(--text)] hover:bg-[var(--bg)] hover:text-[var(--text)]"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-neutral-950" : "text-[var(--muted)]"}`} />
                  <span className="truncate">{locale === "id" ? item.labelId : item.labelEn}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                      isActive
                        ? "bg-black/15 text-neutral-950"
                        : "bg-[var(--bg)] text-amber-800 dark:text-amber-300 border border-[var(--border)]"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Quota & Roadmap Link */}
        <div className="p-3 border-t border-[var(--border)] space-y-2">
          <Link
            href="/roadmap"
            className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] hover:border-[var(--accent)] transition-colors"
          >
            <div className="flex items-center gap-2">
              <Milestone className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span className="font-semibold">{locale === "id" ? "Peta Jalan" : "Roadmap"}</span>
            </div>
            <span className="text-[10px] text-[var(--muted)] font-bold">Status fitur</span>
          </Link>

          <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-xs space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-[var(--muted)]">
              <span>
                {billing.mode === "live"
                  ? `${PLANS[billing.planId].name} · ${locale === "id" ? "pesan AI" : "AI messages"}`
                  : locale === "id" ? "Mode demo" : "Demo mode"}
              </span>
              <span className="tabular-nums font-mono font-bold text-[var(--text)]">
                {billing.mode === "live" ? `${chatUsed} / ${chatLimit}` : "–"}
              </span>
            </div>
            <div className="w-full bg-[var(--border)] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[var(--accent)] h-full rounded-full"
                style={{ width: `${billing.mode === "live" && chatLimit > 0 ? Math.min(100, (chatUsed / chatLimit) * 100) : 0}%` }}
              />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top App Bar */}
        <header className="h-16 border-b border-[var(--border)] bg-[var(--surface)] px-4 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]"
              aria-label="Open mobile menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Page title (one heading per page; no breadcrumb separators) */}
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-[var(--text)] truncate">
                {title || (locale === "id" ? currentModule.labelId : currentModule.labelEn)}
              </h1>
              {subtitle && (
                <p className="hidden md:block text-[11px] text-[var(--muted)] truncate">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Right Action Icons: Locale, Theme, Public Landing */}
          <div className="flex items-center gap-2">
            {/* Locale Toggle */}
            <button
              type="button"
              onClick={() => setLocale(locale === "id" ? "en" : "id")}
              className="px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-xs font-semibold text-[var(--text)] flex items-center gap-1.5 hover:bg-[var(--surface)] transition-colors"
              title="Toggle Language"
            >
              <Globe className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span className="uppercase">{locale}</span>
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={() => {
                if (theme === "light") setTheme("dark");
                else if (theme === "dark") setTheme("system");
                else setTheme("light");
              }}
              className="p-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--muted)] hover:text-[var(--text)] transition-colors"
              title={`Current Theme: ${theme}`}
              aria-label="Toggle Theme"
            >
              {theme === "light" ? (
                <Sun className="w-4 h-4 text-amber-500" />
              ) : theme === "dark" ? (
                <Moon className="w-4 h-4 text-indigo-400" />
              ) : (
                <Laptop className="w-4 h-4 text-[var(--muted)]" />
              )}
            </button>

            {/* Return to Public Landing Page */}
            <Link
              href="/"
              className="hidden sm:flex items-center gap-1 text-xs text-[var(--muted)] hover:text-[var(--text)] px-3 py-1.5 rounded-lg border border-transparent hover:border-[var(--border)] transition-colors"
            >
              <span>Landing</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Drawer (with backdrop and focus management) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          <div className="relative w-72 max-w-[85vw] bg-[var(--surface)] h-full flex flex-col z-10 shadow-xl border-r border-[var(--border)] animate-in slide-in-from-left duration-200">
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[var(--accent)] text-neutral-950 flex items-center justify-center font-black text-xs shadow-xs">
                  B.
                </span>
                <span className="font-extrabold text-sm uppercase tracking-tight text-[var(--text)]">
                  BRIGHTON <span className="text-[var(--accent)]">AGENT</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {MODULE_NAV.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium ${
                      isActive
                        ? "bg-[var(--accent)] text-neutral-950 font-bold shadow-xs"
                        : "text-[var(--text)] hover:bg-[var(--bg)]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? "text-neutral-950" : "text-[var(--muted)]"}`} />
                      <span>{locale === "id" ? item.labelId : item.labelEn}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                        isActive ? "bg-black/15 text-neutral-950" : "bg-[var(--bg)] text-amber-800 dark:text-amber-300 border border-[var(--border)]"
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-[var(--border)] space-y-2">
              <Link
                href="/roadmap"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg)] text-xs text-[var(--text)] font-semibold"
              >
                <span className="flex items-center gap-1.5">
                  <Milestone className="w-3.5 h-3.5 text-[var(--accent)]" />
                  Roadmap
                </span>
                <span className="text-[var(--muted)] text-[11px]">Status fitur</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
