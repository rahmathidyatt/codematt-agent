"use client";

import React, { useState } from "react";
import {
  Star,
  Send,
  X,
  Check,
} from "lucide-react";
import { useAgentStore, BetaFeedback } from "@/lib/store";

interface BetaFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BetaFeedbackModal({ isOpen, onClose }: BetaFeedbackModalProps) {
  const { agent, betaFeedbackList, addBetaFeedback, locale } = useAgentStore();

  const [rating, setRating] = useState<number>(5);
  const [category, setCategory] = useState<BetaFeedback["category"]>("accuracy");
  const [feedbackText, setFeedbackText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    addBetaFeedback({
      rating,
      category,
      feedback: feedbackText.trim(),
      agentName: agent.name,
      agencyOffice: agent.office,
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFeedbackText("");
      onClose();
    }, 1800);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="beta-feedback-title"
    >
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-[var(--border)] bg-[var(--bg)]/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-[#f5b800] text-neutral-950 font-black flex items-center justify-center text-sm shadow-xs">
              B.
            </span>
            <div>
              <h2
                id="beta-feedback-title"
                className="text-base font-bold text-[var(--text)] tracking-tight"
              >
                {locale === "id"
                  ? "Program Beta Komersial · Brighton Real Estate"
                  : "Commercial Beta Program · Brighton Cohort"}
              </h2>
              <p className="text-xs text-[var(--muted)]">
                {locale === "id"
                  ? "Evaluasi operasional harian & masukan fitur fase akhir"
                  : "Daily operational evaluation & concluding stage feedback"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup masukan beta"
            className="p-2 text-[var(--muted)] hover:text-[var(--text)] rounded-lg hover:bg-[var(--surface)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          {submitted ? (
            <div className="py-8 text-center space-y-3 animate-in fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 mx-auto flex items-center justify-center">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[var(--text)]">
                Terima Kasih atas Masukan Anda!
              </h3>
              <p className="text-xs text-[var(--muted)] max-w-xs mx-auto">
                Masukan operasional Anda telah dicatat dalam ledger cohort beta komersial Brighton.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              {/* Star Rating */}
              <div>
                <label className="block font-semibold text-[var(--text)] mb-2">
                  Tingkat Kepuasan & Efektivitas Kerja Agen:
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`p-2 rounded-xl transition-all ${
                        rating >= star
                          ? "text-[#f5b800] scale-105"
                          : "text-[var(--muted)]/40 hover:text-[var(--muted)]"
                      }`}
                    >
                      <Star className="w-6 h-6 fill-current" />
                    </button>
                  ))}
                  <span className="text-xs font-bold font-mono ml-2 text-[var(--text)]">
                    {rating} / 5 Bintang
                  </span>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block font-semibold text-[var(--text)] mb-2">
                  Kategori Masukan:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: "accuracy", label: "Akurasi Fakta" },
                    { id: "feature", label: "Fitur / Alat Baru" },
                    { id: "performance", label: "Kecepatan / Kinerja" },
                    { id: "ux", label: "Kemudahan Antarmuka" },
                    { id: "pricing", label: "Kapasitas & Kuota" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id as BetaFeedback["category"])}
                      className={`p-2.5 rounded-xl border text-center font-medium transition-all ${
                        category === cat.id
                          ? "bg-[#f5b800]/15 border-[#f5b800] text-neutral-950 dark:text-[#f5b800] font-bold"
                          : "bg-[var(--bg)] border-[var(--border)] text-[var(--muted)]"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea */}
              <div>
                <label className="block font-semibold text-[var(--text)] mb-1">
                  Detail Masukan & Hasil Closing Lapangan:
                </label>
                <textarea
                  rows={3}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Ceritakan bagaimana materi listing atau flyer ini membantu closing atau tanggapan calon pembeli..."
                  className="w-full p-3 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)] focus-visible:ring-2 focus-visible:ring-[#f5b800]"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                <span className="text-[11px] text-[var(--muted)]">
                  Dikirim sebagai: <strong>{agent.name}</strong> ({agent.office})
                </span>

                <button
                  type="submit"
                  disabled={!feedbackText.trim()}
                  className="px-5 py-2.5 rounded-xl font-bold bg-[#f5b800] text-neutral-950 hover:bg-[#e5ac00] disabled:opacity-50 flex items-center gap-2 shadow-xs transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Masukan Beta</span>
                </button>
              </div>
            </form>
          )}

          {/* Recent Cohort Feedback Snapshot */}
          <div className="pt-4 border-t border-[var(--border)] space-y-3">
            <span className="text-[10px] font-bold uppercase text-[var(--muted)] tracking-wider">
              Catatan Terkini Cohort Beta:
            </span>
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {betaFeedbackList.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-[var(--text)]">{item.agentName}</span>
                    <div className="flex items-center text-[#f5b800]">
                      {Array.from({ length: item.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-[var(--muted)] line-clamp-2">
                    &ldquo;{item.feedback}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
