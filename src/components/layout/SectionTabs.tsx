"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Tabs for sections that share one menu entry (e.g. Arsip & Panduan). */
export function SectionTabs({ tabs }: { tabs: { href: string; label: string }[] }) {
  const pathname = usePathname();
  return (
    <div role="tablist" className="inline-flex p-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] mb-6">
      {tabs.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            role="tab"
            aria-selected={active}
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${active ? "bg-[var(--accent)] text-neutral-950" : "text-[var(--muted)] hover:text-[var(--text)]"}`}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}

export const ARCHIVE_TABS = [
  { href: "/templates", label: "Arsip" },
  { href: "/knowledge", label: "Panduan" },
];
