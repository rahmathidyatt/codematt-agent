export type PlanTierId = "free" | "starter" | "pro" | "team";

export interface PlanConfig {
  id: PlanTierId;
  name: string;
  price: string;
  priceAmount: number;
  period: string;
  aiLimit: number;
  flyerLimit: number;
  storageMb: number;
  badge?: string;
  description: string;
}

export interface LedgerEntry {
  id: string;
  idempotencyKey: string;
  timestamp: string;
  action: "RESERVE" | "COMMIT" | "REFUND" | "TIER_CHANGE" | "RESET";
  service: "AI_GENERATION" | "FLYER_EXPORT" | "PLAN_UPGRADE" | "ADMIN_RESET";
  units: number;
  status: "COMMITTED" | "REFUNDED" | "RESERVED";
  balanceAfter: number;
  note: string;
}

export const PLAN_CONFIGS: Record<PlanTierId, PlanConfig> = {
  free: {
    id: "free",
    name: "Free Trial",
    price: "Rp 0",
    priceAmount: 0,
    period: "selamanya",
    aiLimit: 25,
    flyerLimit: 5,
    storageMb: 250,
    description: "Untuk eksplorasi fitur dasar agen pemula",
  },
  starter: {
    id: "starter",
    name: "Starter Pro",
    price: "Rp 149.000",
    priceAmount: 149000,
    period: "/ bulan",
    aiLimit: 150,
    flyerLimit: 50,
    storageMb: 1024,
    badge: "Populer",
    description: "Paket ideal untuk agen properti aktif mandiri",
  },
  pro: {
    id: "pro",
    name: "Top Producer",
    price: "Rp 349.000",
    priceAmount: 349000,
    period: "/ bulan",
    aiLimit: 500,
    flyerLimit: 200,
    storageMb: 5120,
    badge: "Best Value",
    description: "Untuk agen dengan volume listing & promosi harian tinggi",
  },
  team: {
    id: "team",
    name: "Brokerage Team",
    price: "Rp 899.000",
    priceAmount: 899000,
    period: "/ bulan",
    aiLimit: 2500,
    flyerLimit: 1000,
    storageMb: 25600,
    badge: "Kantor Cabang",
    description: "Untuk kantor cabang broker (5-10 agen)",
  },
};
