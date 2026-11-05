import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Liveness only: HTTP 200 does not imply that paid AI adapters or auth are ready. */
export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "codematt-agent",
      stage: "prototype",
      timestamp: new Date().toISOString(),
    },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}
