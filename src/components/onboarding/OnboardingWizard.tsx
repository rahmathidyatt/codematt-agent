"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  CheckCircle2,
  Palette,
  ArrowRight,
  ArrowLeft,
  X,
  ShieldCheck,
  Zap,
  Wand2,
  FileText,
} from "lucide-react";
import { useAgentStore } from "@/lib/store";
import {
  validateStep1,
  validateStep2,
  calculateOnboardingProgress,
  getRecommendedStarterPreset,
} from "@/features/onboarding/onboarding-utils";
import { BRIGHTON_OFFICES } from "@/features/onboarding/contracts";
import type { OnboardingState } from "@/features/onboarding/contracts";

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OnboardingWizard({ isOpen, onClose }: OnboardingWizardProps) {
  const router = useRouter();
  const { agent, updateAgent, setOnboardingCompleted, locale } = useAgentStore();

  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<OnboardingState>({
    currentStep: 1,
    totalSteps: 3,
    agentName: agent.name || "Rahmat Hidayat",
    agencyOffice: agent.office || "Brighton Grand",
    licenseNumber: agent.license || "AREBI-BRIGHTON-88291",
    whatsappNumber: agent.whatsapp || "6281234567890",
    primaryColor: agent.primaryColor || "#f5b800",
    preferredFirstTool: "flyer",
    isCompleted: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [completedCelebration, setCompletedCelebration] = useState(false);

  if (!isOpen) return null;

  const handleNextStep = () => {
    if (step === 1) {
      const val = validateStep1({
        agentName: formData.agentName,
        agencyOffice: formData.agencyOffice,
        whatsappNumber: formData.whatsappNumber,
      });
      if (!val.isValid) {
        setErrors(val.errors);
        return;
      }
      setErrors({});
      // Update store agent profile partially
      updateAgent({
        name: formData.agentName,
        office: formData.agencyOffice,
        whatsapp: formData.whatsappNumber,
        license: formData.licenseNumber,
      });
      setStep(2);
    } else if (step === 2) {
      const val = validateStep2({
        primaryColor: formData.primaryColor,
      });
      if (!val.isValid) {
        setErrors(val.errors);
        return;
      }
      setErrors({});
      updateAgent({
        primaryColor: formData.primaryColor,
      });
      setStep(3);
    } else if (step === 3) {
      setOnboardingCompleted(true);
      setCompletedCelebration(true);
    }
  };

  const handleFinishAndNavigate = () => {
    setOnboardingCompleted(true);
    onClose();
    const preset = getRecommendedStarterPreset(formData.preferredFirstTool);
    router.push(preset.path);
  };

  const progress = calculateOnboardingProgress(step, 3);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-modal-title"
    >
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        {/* Top Progress Header */}
        <div className="p-6 border-b border-[var(--border)] bg-[var(--bg)]/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-[#f5b800] text-neutral-950 font-black flex items-center justify-center text-sm shadow-xs">
              B.
            </span>
            <div>
              <h2
                id="onboarding-modal-title"
                className="text-base font-bold text-[var(--text)] tracking-tight"
              >
                {locale === "id"
                  ? "Panduan Onboarding Mandiri Agen Brighton"
                  : "Brighton Agent Fast-Track Onboarding"}
              </h2>
              <p className="text-xs text-[var(--muted)]">
                {locale === "id"
                  ? `Langkah ${step} dari 3: Siap menerbitkan materi pemasaran dalam 3 menit`
                  : `Step ${step} of 3: Ready your marketing workspace in 3 minutes`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup panduan"
            className="p-2 text-[var(--muted)] hover:text-[var(--text)] rounded-lg hover:bg-[var(--surface)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[var(--border)] h-1.5">
          <div
            className="bg-[#f5b800] h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step Contents */}
        <div className="p-6 md:p-8">
          {!completedCelebration ? (
            <div>
              {step === 1 && (
                <div className="space-y-5">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Langkah 1 · Profil & Kantor Cabang Brighton</span>
                  </div>

                  <p className="text-xs text-[var(--muted)] leading-relaxed">
                    Identitas agen akan tersemat secara otomatis pada flyer 300 DPI, draf listing, dan kartu nama digital tanpa perlu input ulang.
                  </p>

                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block font-semibold text-[var(--text)] mb-1">
                        Nama Lengkap Agen
                      </label>
                      <input
                        type="text"
                        value={formData.agentName}
                        onChange={(e) =>
                          setFormData({ ...formData, agentName: e.target.value })
                        }
                        placeholder="Contoh: Rahmat Hidayat"
                        className="w-full px-3.5 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)] focus-visible:ring-2 focus-visible:ring-[#f5b800]"
                      />
                      {errors.agentName && (
                        <p className="text-[11px] text-rose-500 mt-1 font-medium">
                          {errors.agentName}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-[var(--text)] mb-1">
                          Cabang Kantor Brighton
                        </label>
                        <select
                          value={formData.agencyOffice}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              agencyOffice: e.target.value,
                            })
                          }
                          className="w-full px-3.5 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)] focus-visible:ring-2 focus-visible:ring-[#f5b800]"
                        >
                          {BRIGHTON_OFFICES.map((off) => (
                            <option key={off} value={off}>
                              {off}
                            </option>
                          ))}
                        </select>
                        {errors.agencyOffice && (
                          <p className="text-[11px] text-rose-500 mt-1 font-medium">
                            {errors.agencyOffice}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block font-semibold text-[var(--text)] mb-1">
                          Nomor Lisensi AREBI / NIP
                        </label>
                        <input
                          type="text"
                          value={formData.licenseNumber}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              licenseNumber: e.target.value,
                            })
                          }
                          placeholder="AREBI-BRIGHTON-XXXXX"
                          className="w-full px-3.5 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)] font-mono focus-visible:ring-2 focus-visible:ring-[#f5b800]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-[var(--text)] mb-1">
                        Nomor WhatsApp Resmi (untuk QR Code & Chat Langsung)
                      </label>
                      <input
                        type="text"
                        value={formData.whatsappNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            whatsappNumber: e.target.value,
                          })
                        }
                        placeholder="6281234567890"
                        className="w-full px-3.5 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)] font-mono focus-visible:ring-2 focus-visible:ring-[#f5b800]"
                      />
                      {errors.whatsappNumber && (
                        <p className="text-[11px] text-rose-500 mt-1 font-medium">
                          {errors.whatsappNumber}
                        </p>
                      )}
                      <p className="text-[10px] text-[var(--muted)] mt-1">
                        Gunakan awalan 62 atau 08 untuk pembuatan link wa.me dan QR scan otomatis.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    <Palette className="w-4 h-4" />
                    <span>Langkah 2 · Brand Kit Standar Brighton Real Estate</span>
                  </div>

                  <p className="text-xs text-[var(--muted)] leading-relaxed">
                    Setelan warna korporat Brighton Real Estate (Kuning Terang #f5b800 dan Hitam Pekat Kontras) memberikan keterbacaan tertinggi di layar maupun cetak brosur.
                  </p>

                  {/* Brand Lockup Preview */}
                  <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--bg)]/50 space-y-3">
                    <span className="text-[10px] font-bold uppercase text-[var(--muted)] tracking-wider">
                      Pratinjau Stempel Identitas Agen:
                    </span>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white text-neutral-900 border border-neutral-200 shadow-xs">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-neutral-950 shadow-xs"
                          style={{ backgroundColor: formData.primaryColor }}
                        >
                          B.
                        </div>
                        <div>
                          <div className="font-extrabold text-sm tracking-tight leading-none text-neutral-950 uppercase">
                            BRIGHTON REAL ESTATE
                          </div>
                          <div className="text-[11px] font-semibold text-neutral-600 mt-1">
                            {formData.agentName} · {formData.agencyOffice}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#f5b800] text-neutral-950">
                          AGEN RESMI
                        </span>
                        <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                          {formData.licenseNumber}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    <label className="block font-semibold text-[var(--text)]">
                      Warna Utama Korporat (Hex Code)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) =>
                          setFormData({ ...formData, primaryColor: e.target.value })
                        }
                        className="w-10 h-10 rounded-lg cursor-pointer border border-[var(--border)] p-0.5 bg-transparent"
                      />
                      <input
                        type="text"
                        value={formData.primaryColor}
                        onChange={(e) =>
                          setFormData({ ...formData, primaryColor: e.target.value })
                        }
                        className="w-36 px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)] font-mono"
                      />
                      <span className="text-[11px] text-[var(--muted)]">
                        (Standar Brighton: #f5b800)
                      </span>
                    </div>
                    {errors.primaryColor && (
                      <p className="text-[11px] text-rose-500 font-medium">
                        {errors.primaryColor}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    <Zap className="w-4 h-4" />
                    <span>Langkah 3 · Pilih Fitur Perdana untuk Diluncurkan</span>
                  </div>

                  <p className="text-xs text-[var(--muted)] leading-relaxed">
                    Semua konfigurasi profil telah siap! Pilih alat pertama yang ingin Anda operasikan hari ini:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      {
                        id: "flyer",
                        title: "Flyer Studio 300 DPI",
                        desc: "Desain brosur multi-format siap cetak & medsos dengan stempel logo Brighton.",
                        icon: Palette,
                        badge: "Paling Populer",
                      },
                      {
                        id: "photo-editor",
                        title: "Sensor Foto Properti",
                        desc: "Hapus plat nomor rumah dan plat kendaraan dengan instruksi AI inpainting.",
                        icon: Wand2,
                        badge: "Privasi Listing",
                      },
                      {
                        id: "listing",
                        title: "Listing Description Writer",
                        desc: "Tulis draf copywriting emosional, investor, dan portal dengan verifikasi fakta 100%.",
                        icon: FileText,
                        badge: "Bebas Halusinasi",
                      },
                      {
                        id: "assistant",
                        title: "AI Real Estate Copilot",
                        desc: "Asisten tanya jawab negosiasi harga dan hukum pertanahan (SHM/HGB).",
                        icon: Sparkles,
                        badge: "24/7 Support",
                      },
                    ].map((tool) => {
                      const Icon = tool.icon;
                      const isSelected = formData.preferredFirstTool === tool.id;
                      return (
                        <button
                          key={tool.id}
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              preferredFirstTool: tool.id as OnboardingState["preferredFirstTool"],
                            })
                          }
                          className={`p-4 rounded-xl border text-left transition-all ${
                            isSelected
                              ? "bg-[var(--accent)]/10 border-[var(--accent)] ring-2 ring-[var(--accent)] shadow-xs"
                              : "bg-[var(--bg)] border-[var(--border)] hover:border-[var(--muted)]"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="p-2 rounded-lg bg-[var(--surface)] text-[var(--accent)] shadow-2xs">
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)]">
                              {tool.badge}
                            </span>
                          </div>
                          <div className="font-bold text-xs text-[var(--text)] mb-1">
                            {tool.title}
                          </div>
                          <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                            {tool.desc}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Navigation Button Bar */}
              <div className="flex items-center justify-between pt-6 mt-6 border-t border-[var(--border)]">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep((s) => s - 1)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text)] border border-[var(--border)] hover:bg-[var(--bg)] transition-colors flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali</span>
                  </button>
                ) : (
                  <div />
                )}

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#f5b800] text-neutral-950 hover:bg-[#e5ac00] shadow-sm flex items-center gap-2 transition-all"
                >
                  <span>{step === 3 ? "Selesaikan & Buka Fitur" : "Lanjutkan"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Celebration Screen */
            <div className="py-6 text-center space-y-5 animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-2xl bg-[#f5b800] text-neutral-950 mx-auto flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Onboarding Selesai · Brighton Agent Ready
                </span>
                <h3 className="text-xl md:text-2xl font-bold text-[var(--text)]">
                  Selamat Datang, {formData.agentName}!
                </h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  Ruang kerja agen properti Anda telah siap dengan lisensi terverifikasi dan brand kit korporat Brighton Real Estate.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)] max-w-sm mx-auto text-left text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Kantor:</span>
                  <span className="font-semibold text-[var(--text)]">{formData.agencyOffice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Lisensi:</span>
                  <span className="font-mono font-semibold text-[var(--text)]">{formData.licenseNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">WhatsApp:</span>
                  <span className="font-mono font-semibold text-emerald-600">{formData.whatsappNumber}</span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleFinishAndNavigate}
                  className="px-6 py-3 rounded-xl text-xs font-bold bg-[#f5b800] text-neutral-950 hover:bg-[#e5ac00] shadow-md inline-flex items-center gap-2 transition-transform hover:scale-[1.02]"
                >
                  <span>Mulai Operasikan {getRecommendedStarterPreset(formData.preferredFirstTool).title}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
