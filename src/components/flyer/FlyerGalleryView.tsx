"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Sparkles,
  Bookmark,
  Plus,
  Trash2,
  Copy,
  RotateCcw,
  QrCode,
  MapPin,
  Building2,
} from "lucide-react";
import { FlyerPreset } from "@/features/flyer/contracts";
import { filterPresets, formatAspectDisplay } from "@/features/flyer/preset-utils";

interface FlyerGalleryViewProps {
  presets: FlyerPreset[];
  onApplyPreset: (preset: FlyerPreset) => void;
  onOpenSaveModal: () => void;
  onDeletePreset: (id: string) => void;
  onDuplicatePreset: (preset: FlyerPreset) => void;
  onResetDefaults: () => void;
  locale: "id" | "en";
  activePresetId?: string | null;
}

export function FlyerGalleryView({
  presets,
  onApplyPreset,
  onOpenSaveModal,
  onDeletePreset,
  onDuplicatePreset,
  onResetDefaults,
  locale,
  activePresetId,
}: FlyerGalleryViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredPresets = useMemo(() => {
    return filterPresets(presets, searchQuery, selectedCategory);
  }, [presets, searchQuery, selectedCategory]);

  const categories = [
    { id: "all", label: locale === "id" ? "Semua Preset" : "All Presets" },
    { id: "feed", label: "Feed Instagram (1:1)" },
    { id: "story", label: "Story & Reels (9:16)" },
    { id: "print", label: "Brosur Cetak (A4)" },
    { id: "landscape", label: "Landscape Ads (16:9)" },
    { id: "custom", label: locale === "id" ? "Preset Saya" : "My Custom" },
  ];

  return (
    <div className="space-y-6" data-testid="flyer-gallery-view">
      {/* Top Gallery Header Bar */}
      <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <Bookmark className="w-5 h-5 text-[var(--accent)]" />
              <h2 className="text-base font-bold text-[var(--text)]">
                {locale === "id" ? "Galeri Layout & Preset Flyer" : "Flyer Layout & Preset Gallery"}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[var(--accent)]/10 text-[var(--accent)]">
                {presets.length} {locale === "id" ? "Preset" : "Presets"}
              </span>
            </div>
            <p className="text-xs text-[var(--muted)]">
              {locale === "id"
                ? "Pilih dari koleksi layout siap pakai atau panggil kembali preset kustom yang telah Anda simpan."
                : "Browse curated flyer designs or instantly recall your custom saved layouts."}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onResetDefaults}
              className="px-3 py-1.5 rounded-xl border border-[var(--border)] hover:bg-[var(--bg)] text-xs text-[var(--muted)] hover:text-[var(--text)] flex items-center gap-1.5 transition-colors cursor-pointer"
              title={locale === "id" ? "Pulihkan preset bawaan" : "Reset default presets"}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{locale === "id" ? "Reset Bawaan" : "Reset Defaults"}</span>
            </button>
            <button
              type="button"
              onClick={onOpenSaveModal}
              data-testid="save-preset-button"
              className="px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>{locale === "id" ? "Simpan Layout Saat Ini" : "Save Current Layout"}</span>
            </button>
          </div>
        </div>

        {/* Search & Category Filter Pills */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <input
              type="text"
              placeholder={locale === "id" ? "Cari preset, judul, kota..." : "Search presets by name or topic..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-xs text-[var(--text)] focus:border-[var(--accent)]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1.5 rounded-xl border text-xs whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === c.id
                    ? "bg-[var(--accent)] text-white border-[var(--accent)] font-semibold shadow-xs"
                    : "bg-[var(--bg)] text-[var(--muted)] border-[var(--border)] hover:text-[var(--text)] hover:border-[var(--muted)]"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Preset Cards Grid */}
      {filteredPresets.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
          <Bookmark className="w-10 h-10 mx-auto text-[var(--muted)] opacity-40" />
          <h3 className="text-sm font-bold text-[var(--text)]">
            {locale === "id" ? "Tidak ada preset yang sesuai" : "No presets match your search"}
          </h3>
          <p className="text-xs text-[var(--muted)] max-w-sm mx-auto">
            {locale === "id"
              ? "Coba ubah kata kunci pencarian atau ganti filter kategori preset di atas."
              : "Try adjusting your search terms or filter criteria."}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
            }}
            className="px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{locale === "id" ? "Tampilkan Semua Preset" : "Clear Filters"}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPresets.map((preset) => {
            const isLuxury = preset.template === "luxury";
            const isMinimal = preset.template === "minimal";
            const isCurrentActive = activePresetId === preset.id;

            return (
              <div
                key={preset.id}
                data-testid={`preset-card-${preset.id}`}
                className={`flex flex-col rounded-2xl bg-[var(--surface)] border transition-all hover:shadow-md ${
                  isCurrentActive
                    ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/30"
                    : "border-[var(--border)] hover:border-[var(--muted)]"
                }`}
              >
                {/* Visual Flyer Thumbnail Mockup */}
                <div className="p-3.5 bg-[var(--bg)] rounded-t-2xl border-b border-[var(--border)] flex items-center justify-center min-h-[220px]">
                  <div
                    className={`relative w-full max-w-[210px] rounded-lg shadow-md border overflow-hidden p-2.5 flex flex-col justify-between transition-transform hover:scale-[1.02] ${
                      preset.size === "story"
                        ? "aspect-[9/16] max-h-[260px]"
                        : preset.size === "landscape"
                        ? "aspect-[16/9] max-h-[160px]"
                        : preset.size === "a4"
                        ? "aspect-[1/1.41] max-h-[260px]"
                        : "aspect-square max-h-[210px]"
                    } ${
                      isLuxury
                        ? "bg-[#0f1715] text-[#f0f6f4] border-[#2e453e]"
                        : isMinimal
                        ? "bg-white text-[#172a27] border-gray-300"
                        : "bg-[#f7f9f8] text-[#172a27] border-[#d7e1dd]"
                    }`}
                  >
                    {/* Mockup Header */}
                    {preset.showBranding ? (
                      <div className="flex items-center justify-between border-b pb-1 mb-1 border-current/15 text-[8px] font-bold">
                        <span className="truncate max-w-[100px] uppercase tracking-wider text-[var(--accent)]">
                          ERA Codematt
                        </span>
                        <span className="text-[7px] opacity-75 font-mono">AREBI</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between border-b pb-1 mb-1 border-current/15 text-[7px] font-bold">
                        <span className="text-amber-500 font-mono tracking-wider">CO-BROKE MLS</span>
                        <span className="opacity-60 text-[6px]">PASSPORT</span>
                      </div>
                    )}

                    {/* Mockup Hero Photo Frame */}
                    <div
                      className={`relative w-full rounded flex items-center justify-center p-2 mb-1.5 overflow-hidden border ${
                        preset.size === "landscape" ? "h-14" : "flex-1"
                      } ${
                        isLuxury
                          ? "bg-gradient-to-b from-[#22332e] to-[#121a18] border-[#2e453e]"
                          : isMinimal
                          ? "bg-gradient-to-b from-gray-100 to-gray-200 border-gray-200"
                          : "bg-gradient-to-b from-[#e2ece8] to-[#c5d7d0] border-[#d7e1dd]"
                      }`}
                    >
                      <Building2 className="w-5 h-5 opacity-40" />
                      <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[6px] font-bold bg-[var(--accent)] text-white">
                        {preset.showBranding ? "EKSKLUSIF" : "VERIFIED"}
                      </div>
                    </div>

                    {/* Mockup Content */}
                    <div className="space-y-0.5">
                      <div
                        className={`text-[9px] font-black leading-tight truncate ${
                          isLuxury ? "text-[#d4af37]" : "text-[var(--accent)]"
                        }`}
                      >
                        {preset.priceLabel}
                      </div>
                      <div className="text-[8px] font-bold leading-tight truncate opacity-90">
                        {preset.headline}
                      </div>
                      <div className="text-[7px] opacity-70 leading-none truncate flex items-center gap-0.5">
                        <MapPin className="w-2 h-2 shrink-0" />
                        <span>{preset.locationLabel}</span>
                      </div>
                    </div>

                    {/* Mockup Footer */}
                    {preset.showBranding ? (
                      <div className="mt-1 pt-1 border-t border-current/15 flex items-center justify-between text-[6px]">
                        <div className="truncate max-w-[90px]">
                          <span className="font-bold block truncate">Rahmat Hidayat</span>
                          <span className="opacity-70 block truncate text-[5px]">Consultant</span>
                        </div>
                        <div className="w-4 h-4 rounded bg-current/20 flex items-center justify-center">
                          <QrCode className="w-3 h-3 opacity-80" />
                        </div>
                      </div>
                    ) : (
                      <div className="mt-1 pt-1 border-t border-current/15 grid grid-cols-3 gap-0.5 text-[5px] text-center font-mono opacity-80">
                        <span className="bg-current/10 rounded py-0.5">SHM</span>
                        <span className="bg-current/10 rounded py-0.5">120m²</span>
                        <span className="bg-current/10 rounded py-0.5">3 KT</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Content & Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    {/* Tags row */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                      <span className="font-semibold px-2 py-0.5 rounded-md bg-[var(--bg)] border border-[var(--border)] text-[var(--text)]">
                        {formatAspectDisplay(preset.size)}
                      </span>
                      <span className="capitalize px-2 py-0.5 rounded-md bg-[var(--bg)] border border-[var(--border)] text-[var(--muted)]">
                        {preset.template}
                      </span>
                      <span
                        className={`font-semibold px-2 py-0.5 rounded-md ${
                          preset.showBranding
                            ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                            : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                        }`}
                      >
                        {preset.showBranding ? "Branded" : "Clean Co-Broke"}
                      </span>
                      {preset.isCurated ? (
                        <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-bold text-[9px]">
                          Bawaan
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 font-bold text-[9px]">
                          Kustom
                        </span>
                      )}
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="font-bold text-sm text-[var(--text)] leading-snug">
                        {preset.name}
                      </h3>
                      <p className="text-xs text-[var(--muted)] line-clamp-2 mt-1 leading-relaxed">
                        {preset.description}
                      </p>
                    </div>

                    {/* Highlights Pills */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {preset.highlights.slice(0, 3).map((h, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 rounded text-[10px] bg-[var(--bg)] border border-[var(--border)] text-[var(--muted)]"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onApplyPreset(preset)}
                      data-testid={`apply-preset-${preset.id}`}
                      className="flex-1 py-2 px-3 rounded-xl bg-[var(--accent)] text-white text-xs font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{locale === "id" ? "Terapkan ke Kanvas" : "Apply to Canvas"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onDuplicatePreset(preset)}
                      className="p-2 rounded-xl border border-[var(--border)] hover:bg-[var(--bg)] text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
                      title={locale === "id" ? "Duplikasi layout ini" : "Duplicate preset"}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    {!preset.isCurated && (
                      <button
                        type="button"
                        onClick={() => onDeletePreset(preset.id)}
                        className="p-2 rounded-xl border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
                        title={locale === "id" ? "Hapus preset kustom" : "Delete custom preset"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
