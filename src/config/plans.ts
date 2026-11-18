/**
 * Single source of truth for subscription plans.
 * Pure module (no "@/..." imports) so it can be unit-tested with `node --test`.
 *
 * Prices are in whole Rupiah. Quotas reset on the first day of each calendar
 * month (Asia/Jakarta). Server code is the only place that enforces them.
 */

export type PlanId = "free" | "starter" | "pro" | "team";
export type ProviderId = "google" | "openai" | "anthropic";
export type QuotaMetric = "chat" | "ai_photo";

export interface PlanDefinition {
  id: PlanId;
  name: string;
  priceIdr: number;
  /** false = cannot be bought through self-serve checkout. */
  purchasable: boolean;
  quotas: Record<QuotaMetric, number>;
  providers: readonly ProviderId[];
  highlights: readonly string[];
}

export const PLANS: Record<PlanId, PlanDefinition> = {
  free: {
    id: "free",
    name: "Free",
    priceIdr: 0,
    purchasable: false,
    quotas: { chat: 30, ai_photo: 3 },
    providers: ["google"],
    highlights: [
      "Chat AI dengan Gemini",
      "Ubah ukuran & HD standar tanpa batas",
      "3 edit foto AI per bulan",
    ],
  },
  starter: {
    id: "starter",
    name: "Starter",
    priceIdr: 49_000,
    purchasable: true,
    quotas: { chat: 300, ai_photo: 30 },
    providers: ["google", "openai"],
    highlights: [
      "Chat AI dengan Gemini dan ChatGPT",
      "300 pesan AI per bulan",
      "30 edit foto AI per bulan",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceIdr: 149_000,
    purchasable: true,
    quotas: { chat: 1_500, ai_photo: 150 },
    providers: ["google", "openai", "anthropic"],
    highlights: [
      "Chat AI dengan Gemini, ChatGPT dan Claude",
      "1.500 pesan AI per bulan",
      "150 edit foto AI per bulan",
    ],
  },
  team: {
    id: "team",
    name: "Team",
    priceIdr: 0,
    purchasable: false,
    quotas: { chat: 10_000, ai_photo: 1_000 },
    providers: ["google", "openai", "anthropic"],
    highlights: [
      "Untuk kantor atau tim agen",
      "Kuota bersama, harga sesuai kesepakatan",
      "Hubungi admin untuk aktivasi",
    ],
  },
};

export const PLAN_ORDER: readonly PlanId[] = ["free", "starter", "pro", "team"];

export const PROVIDER_LABELS: Record<ProviderId, string> = {
  google: "Gemini",
  openai: "ChatGPT",
  anthropic: "Claude",
};

export function isPlanId(value: unknown): value is PlanId {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(PLANS, value);
}

export function isProviderId(value: unknown): value is ProviderId {
  return value === "google" || value === "openai" || value === "anthropic";
}

export function getPlan(id: unknown): PlanDefinition {
  return isPlanId(id) ? PLANS[id] : PLANS.free;
}

export function planAllowsProvider(planId: PlanId, provider: ProviderId): boolean {
  return PLANS[planId].providers.includes(provider);
}

/** Cheapest purchasable plan that unlocks a provider, for upgrade hints. */
export function cheapestPlanFor(provider: ProviderId): PlanDefinition | null {
  for (const id of PLAN_ORDER) {
    const plan = PLANS[id];
    if (plan.purchasable && plan.providers.includes(provider)) return plan;
  }
  return null;
}

export function formatRupiah(amount: number): string {
  return "Rp" + Math.round(amount).toLocaleString("id-ID");
}
