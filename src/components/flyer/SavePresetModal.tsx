"use client";

import React, { useState } from "react";
import { X, BookmarkPlus, Check } from "lucide-react";
import { FlyerPreset, FlyerSize } from "@/features/flyer/contracts";
import { validatePresetName, autoDetectCategory, formatAspectDisplay } from "@/features/flyer/preset-utils";

interface SavePresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (presetData: Omit<FlyerPreset, "id" | "createdAt">) => void;
  currentConfig: {
    size: FlyerSize;
    template: "modern" | "luxury" | "minimal";
    showBranding: boolean;
    headline: string;
    priceLabel: string;
    locationLabel: string;
    highlights: string[];
    qrDestination: string;
  };
  locale: "id" | "en";
}

export function SavePresetModal({
  isOpen,
  onClose,
  onSave,
  currentConfig,
  locale,
}: SavePresetModalProps) {
  const defaultCategory = autoDetectCategory(currentConfig.size);
  const [name, setName] = useState<string>(
    `${currentConfig.headline} (${formatAspectDisplay(currentConfig.size)})`
  );
  const [category, setCategory] = useState<"feed" | "story" | "print" | "landscape" | "custom">(
    defaultCategory
  );
  const [description, setDescription] = useState<string>(
    `Preset flyer ${currentConfig.template} ${
      currentConfig.showBranding ? "dengan branding agen & QR" : "mode bersih co-broke"
    } untuk ${currentConfig.locationLabel}.`
  );
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validatePresetName(name);
    if (!validation.valid) {
      setError(validation.error || "Nama preset tidak valid");
      return;
    }

    onSave({
      name: name.trim(),
      description: description.trim(),
      category,
      size: currentConfig.size,
      template: currentConfig.template,
      showBranding: currentConfig.showBranding,
      headline: currentConfig.headline,
      priceLabel: currentConfig.priceLabel,
      locationLabel: currentConfig.locationLabel,
      highlights: currentConfig.highlights,
      qrDestination: currentConfig.qrDestination,
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
    >
      <div className="w-full max-w-lg bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center">
              <BookmarkPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text)]">
                {locale === "id" ? "Simpan Layout Sebagai Preset" : "Save Layout As Preset"}
              </h3>
              <p className="text-xs text-[var(--muted)]">
                {locale === "id"
                  ? "Simpan konfigurasi flyer saat ini agar dapat digunakan kembali kapan saja."
                  : "Save current flyer setup to recall anytime with one click."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--bg)] text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Config Snapshot Card */}
        <div className="p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-2 text-xs">
          <span className="font-semibold text-[var(--muted)] text-[11px] block uppercase tracking-wider">
            {locale === "id" ? "Konfigurasi yang Disimpan:" : "Configuration Snapshot:"}
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div className="p-2 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
              <span className="text-[10px] text-[var(--muted)] block">Ukuran / Format</span>
              <span className="font-bold text-[var(--text)]">{formatAspectDisplay(currentConfig.size)}</span>
            </div>
            <div className="p-2 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
              <span className="text-[10px] text-[var(--muted)] block">Tema Visual</span>
              <span className="font-bold text-[var(--text)] capitalize">{currentConfig.template}</span>
            </div>
            <div className="p-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] col-span-2 sm:col-span-1">
              <span className="text-[10px] text-[var(--muted)] block">Mode Branding</span>
              <span
                className={`font-bold ${
                  currentConfig.showBranding ? "text-emerald-600" : "text-amber-600"
                }`}
              >
                {currentConfig.showBranding ? "Branded (Agency + QR)" : "Clean (Co-Broke)"}
              </span>
            </div>
          </div>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          <div>
            <label className="font-semibold text-[var(--text)] block mb-1">
              {locale === "id" ? "Nama Preset Layout *" : "Preset Name *"}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Contoh: Story Promo Sentul Hills Luxury"
              className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)] font-medium focus:border-[var(--accent)]"
            />
          </div>

          <div>
            <label className="font-semibold text-[var(--text)] block mb-1">
              {locale === "id" ? "Kategori Preset" : "Preset Category"}
            </label>
            <select
              value={category}
              onChange={(e) =>
                setCategory(
                  e.target.value as "feed" | "story" | "print" | "landscape" | "custom"
                )
              }
              className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)]"
            >
              <option value="feed">Instagram Feed (1:1 / 4:5)</option>
              <option value="story">Story & Reels (9:16)</option>
              <option value="print">Brosur Cetak A4 (300 DPI)</option>
              <option value="landscape">Banner Landscape Ads (16:9)</option>
              <option value="custom">Preset Kustom Khusus</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-[var(--text)] block mb-1">
              {locale === "id" ? "Deskripsi / Catatan Singkat" : "Description / Notes"}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tambahkan catatan tujuan flyer atau panduan penggunaan..."
              className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)] resize-none focus:border-[var(--accent)]"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[var(--border)] hover:bg-[var(--bg)] text-[var(--text)] text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              {locale === "id" ? "Batal" : "Cancel"}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[var(--accent)] text-white text-xs font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{locale === "id" ? "Simpan Preset" : "Save Preset"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
