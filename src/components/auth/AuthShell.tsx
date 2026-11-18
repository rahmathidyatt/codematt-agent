"use client";

import React, { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

/** null = still checking, true/false = whether real accounts are switched on. */
export function useAuthEnabled(): boolean | null {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/auth/status", { signal: controller.signal, cache: "no-store" })
      .then((res) => res.json())
      .then((data: { enabled?: boolean }) => setEnabled(data.enabled === true))
      .catch(() => setEnabled(false));
    return () => controller.abort();
  }, []);
  return enabled;
}

export function AuthShell({ title, subtitle, children, footer }: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col items-center justify-center p-4">
      <Link href="/" className="mb-8 flex items-center gap-2 font-black tracking-tight" aria-label="Kembali ke beranda">
        <span className="w-8 h-8 rounded-lg bg-[var(--accent)] text-neutral-950 flex items-center justify-center text-sm">C</span>
        Codematt Agent
      </Link>
      <div className="w-full max-w-md p-6 sm:p-8 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm space-y-6">
        <div>
          <h1 className="text-xl font-bold">{title}</h1>
          <p className="text-sm text-[var(--muted)] mt-1">{subtitle}</p>
        </div>
        {children}
      </div>
      <p className="mt-6 text-sm text-[var(--muted)]">{footer}</p>
    </div>
  );
}

/** Shown instead of a greyed-out form while accounts are not open yet. */
export function AccountsClosed() {
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-[var(--accent-soft)] text-sm leading-relaxed">
        Pendaftaran akun belum dibuka. Sementara itu, semua alat bisa dicoba di workspace demo.
        Data demo hanya tersimpan di browser ini.
      </div>
      <Link
        href="/dashboard"
        className="w-full py-3 rounded-xl bg-[var(--accent)] text-neutral-950 text-sm font-bold flex items-center justify-center gap-2 hover:bg-[var(--accent-hover)]"
      >
        Coba workspace demo <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

export function LoadingBlock() {
  return <div className="h-40 rounded-xl bg-[var(--bg)] animate-pulse" aria-label="Memuat" />;
}

export const inputClass =
  "w-full px-3 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]";
export const primaryButtonClass =
  "w-full py-3 rounded-xl bg-[var(--accent)] text-neutral-950 text-sm font-bold flex items-center justify-center gap-2 hover:bg-[var(--accent-hover)] disabled:opacity-60";
