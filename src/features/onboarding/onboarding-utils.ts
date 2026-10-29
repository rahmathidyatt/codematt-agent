import type { OnboardingState, OnboardingValidationResult } from "./contracts.ts";
import { BRIGHTON_OFFICES } from "./contracts.ts";

export { BRIGHTON_OFFICES };

export function validateStep1(data: {
  agentName: string;
  agencyOffice: string;
  whatsappNumber: string;
}): OnboardingValidationResult {
  const errors: Record<string, string> = {};

  if (!data.agentName || data.agentName.trim().length < 3) {
    errors.agentName = "Nama agen minimal 3 karakter";
  }

  if (!data.agencyOffice || data.agencyOffice.trim().length < 3) {
    errors.agencyOffice = "Pilih atau isi cabang kantor Brighton";
  }

  const cleanPhone = (data.whatsappNumber || "").replace(/[^0-9]/g, "");
  if (!cleanPhone || cleanPhone.length < 9) {
    errors.whatsappNumber = "Nomor WhatsApp tidak valid (minimal 9 digit)";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateStep2(data: {
  primaryColor: string;
}): OnboardingValidationResult {
  const errors: Record<string, string> = {};
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

  if (!data.primaryColor || !hexRegex.test(data.primaryColor)) {
    errors.primaryColor = "Format kode warna HEX tidak valid (contoh: #f5b800)";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function calculateOnboardingProgress(currentStep: number, totalSteps: number): number {
  if (totalSteps <= 0) return 0;
  const clampedStep = Math.max(1, Math.min(currentStep, totalSteps));
  return Math.round((clampedStep / totalSteps) * 100);
}

export function formatWhatsAppLink(phone: string, agentName: string): string {
  const digits = phone.replace(/[^0-9]/g, "");
  const normalized = digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
  const message = encodeURIComponent(`Halo ${agentName}, saya tertarik dengan listing properti Anda.`);
  return `https://wa.me/${normalized}?text=${message}`;
}

export function getRecommendedStarterPreset(tool: OnboardingState["preferredFirstTool"]) {
  switch (tool) {
    case "flyer":
      return {
        path: "/flyer",
        title: "Flyer Studio 300 DPI",
        badge: "Cetak & Medsos",
        desc: "Buat materi promosi Square atau Brosur A4 cetak dalam hitungan detik.",
      };
    case "photo-editor":
      return {
        path: "/photo-editor",
        title: "Sensor & Edit Foto Properti",
        badge: "AI Inpainting",
        desc: "Sensor plat nomor rumah dan kendaraan sesuai aturan privasi iklan.",
      };
    case "listing":
      return {
        path: "/listing",
        title: "Listing Description Writer",
        badge: "Validasi Fakta",
        desc: "Susun copywriting emosional, investor, dan formal tanpa halusinasi fakta.",
      };
    case "assistant":
    default:
      return {
        path: "/assistant",
        title: "AI Real Estate Copilot",
        badge: "Tanya Jawab 24/7",
        desc: "Konsultasi negosiasi harga, kualifikasi prospek, dan hukum sertifikat tanah.",
      };
  }
}
