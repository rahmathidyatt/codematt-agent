export type PlanId = "free" | "starter" | "pro" | "team";
export type UsageMetric = "ai-requests" | "flyer-exports" | "storage-bytes";
export interface UsageReservation {
  id: string;
  state: "reserved" | "committed" | "released" | "uncertain";
}
export interface UsageService {
  // Implementation must be transactional and idempotent across server instances.
  reserve(actorId: string, metric: UsageMetric, amount: number, idempotencyKey: string): Promise<UsageReservation>;
  commit(reservationId: string): Promise<void>;
  release(reservationId: string): Promise<void>;
}
