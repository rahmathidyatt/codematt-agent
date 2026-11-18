"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Copy,
  Trash2,
  Palette,
  FileText,
} from "lucide-react";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { SectionTabs, ARCHIVE_TABS } from "@/components/layout/SectionTabs";
import { useAgentStore } from "@/lib/store";

export default function TemplatesPage() {
  const { listings, deleteListing, addListing } = useAgentStore();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");

  const filtered = listings.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.location.toLowerCase().includes(search.toLowerCase()) ||
      l.certificate.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "all" || l.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleDuplicate = (l: (typeof listings)[0]) => {
    addListing({
      ...l,
      name: `${l.name} (Copy)`,
    });
  };

  return (
    <WorkspaceShell
      title="Arsip & Panduan"
      subtitle="Listing tersimpan, draf flyer, dan panduan properti"
    >
      <SectionTabs tabs={ARCHIVE_TABS} />
      <div className="space-y-6">
        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama properti atau lokasi"
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[13px] text-[var(--text)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {["all", "Rumah", "Apartemen", "Ruko"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFilterType(t)}
                className={`px-3 py-2 text-[13px] rounded-xl font-medium whitespace-nowrap transition-colors ${
                  filterType === t
                    ? "bg-[var(--accent)] text-neutral-950 shadow-xs"
                    : "bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]"
                }`}
              >
                {t === "all" ? "Semua Tipe" : t}
              </button>
            ))}
          </div>
        </div>

        {/* Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((l) => (
            <div
              key={l.id}
              className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold text-[var(--accent-text)] uppercase">
                    {l.transactionType} · {l.type}
                  </span>
                  <span className="text-[13px] font-mono text-[var(--muted)]">
                    {new Date(l.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[var(--text)] leading-snug line-clamp-1">
                  {l.name}
                </h3>

                <p className="text-[13px] text-[var(--muted)] line-clamp-2">
                  {l.location} · {l.bedrooms} KT · {l.bathrooms} KM · LT {l.landSize}m²
                </p>

                <div className="text-sm font-bold font-mono text-[var(--text)] pt-1">
                  Rp {l.price.toLocaleString("id-ID")}
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/listing?id=${l.id}`}
                    className="p-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] hover:text-[var(--accent-text)]"
                    title="Tulis deskripsi"
                  >
                    <FileText className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href={`/flyer?listingId=${l.id}`}
                    className="p-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] hover:text-[var(--accent-text)]"
                    title="Buat flyer"
                  >
                    <Palette className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDuplicate(l)}
                    className="p-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] hover:text-[var(--accent-text)]"
                    title="Duplikat"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => deleteListing(l.id)}
                  className="text-rose-600 hover:text-rose-700 p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20"
                  title="Hapus"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </WorkspaceShell>
  );
}
