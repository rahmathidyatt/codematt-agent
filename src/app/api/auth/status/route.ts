import { authJson } from "@/lib/auth/server";
import { getAuthBackendConfig } from "@/lib/auth/core";

export const runtime = "nodejs";
export function GET() {
  return authJson({ enabled: Boolean(getAuthBackendConfig()), storageMode: "demo-local" });
}
