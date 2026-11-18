"use client";

import { useCallback, useEffect, useState } from "react";
import { isPlanId, type PlanId, type ProviderId, type QuotaMetric } from "@/config/plans";

export interface BillingState {
  loading: boolean;
  /** "demo" = live AI / billing not configured on the server. */
  mode: "demo" | "live" | "signed-out" | "error";
  planId: PlanId;
  periodEnd: string | null;
  usage: Record<QuotaMetric, number> | null;
  limits: Record<QuotaMetric, number> | null;
  providers: ProviderId[];
  flags: { liveAi: boolean; billing: boolean; checkout: boolean };
}

const INITIAL: BillingState = {
  loading: true,
  mode: "demo",
  planId: "free",
  periodEnd: null,
  usage: null,
  limits: null,
  providers: ["google"],
  flags: { liveAi: false, billing: false, checkout: false },
};

export function useBilling() {
  const [state, setState] = useState<BillingState>(INITIAL);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/billing/me", { cache: "no-store" });
      const data = await res.json();
      const flags = data?.flags ?? INITIAL.flags;
      if (res.status === 401) {
        setState({ ...INITIAL, loading: false, mode: "signed-out", flags });
        return;
      }
      if (!data?.ok) {
        setState({ ...INITIAL, loading: false, mode: "error", flags });
        return;
      }
      setState({
        loading: false,
        mode: data.mode === "live" ? "live" : "demo",
        planId: isPlanId(data.planId) ? data.planId : "free",
        periodEnd: typeof data.periodEnd === "string" ? data.periodEnd : null,
        usage: data.usage ?? null,
        limits: data.limits ?? null,
        providers: Array.isArray(data.providers) ? data.providers : ["google"],
        flags,
      });
    } catch {
      setState({ ...INITIAL, loading: false, mode: "error" });
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { void refresh(); }, 0);
    return () => clearTimeout(t);
  }, [refresh]);

  return { ...state, refresh };
}

export function newIdempotencyKey(prefix: string): string {
  const random = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().replace(/-/g, "")
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
  return `${prefix}_${random}`.slice(0, 80);
}

export const ERROR_MESSAGES: Record<string, string> = {
  PLAN_UPGRADE_REQUIRED: "Model ini butuh paket yang lebih tinggi. Buka halaman Langganan untuk upgrade.",
  QUOTA_EXHAUSTED: "Kuota bulan ini sudah habis. Kuota direset tanggal 1, atau upgrade paket.",
  UNAUTHENTICATED: "Silakan login dulu.",
  AUTH_NOT_CONFIGURED: "Login belum diaktifkan di server.",
  BILLING_NOT_CONFIGURED: "Sistem kuota belum dikonfigurasi di server.",
  BILLING_UNAVAILABLE: "Sistem kuota sedang tidak bisa dihubungi. Coba lagi sebentar.",
  PROVIDER_NOT_CONFIGURED: "API key untuk model ini belum dipasang di server.",
  PROVIDER_FAILED: "Penyedia AI gagal merespons. Kuota tidak dipotong, silakan coba lagi.",
  PROVIDER_REFUSED: "AI tidak mengembalikan hasil (mungkin ditolak oleh filter keamanan). Kuota tidak dipotong.",
  LIVE_AI_DISABLED: "Mode demo: AI belum diaktifkan di server.",
  ORIGIN_REJECTED: "Permintaan ditolak (origin tidak cocok).",
  IMAGE_TOO_LARGE: "Ukuran foto terlalu besar (maks 7 MB). Resize dulu.",
  IMAGE_TYPE_NOT_SUPPORTED: "Format foto harus JPG, PNG, atau WebP.",
  CHECKOUT_NOT_CONFIGURED: "Pembayaran belum dikonfigurasi di server.",
  PAYMENT_GATEWAY_FAILED: "Midtrans gagal membuat transaksi. Coba lagi.",
};

export function errorMessage(code: unknown): string {
  return (typeof code === "string" && ERROR_MESSAGES[code]) || "Terjadi kendala. Silakan coba lagi.";
}
