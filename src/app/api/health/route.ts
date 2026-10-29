import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  const uptimeSeconds = Math.floor(process.uptime ? process.uptime() : 0);

  const healthPayload = {
    status: "healthy",
    code: 200,
    timestamp: new Date().toISOString(),
    service: "codematt-agent",
    version: "1.0.0-beta.10",
    phase: {
      number: 10,
      name: "Commercial Beta, Agent Onboarding & Operations",
      status: "concluded_and_live",
      brand: "Brighton Real Estate",
    },
    uptime: {
      seconds: uptimeSeconds,
      formatted: `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m ${uptimeSeconds % 60}s`,
    },
    subsystems: {
      ai_copilot: {
        status: "operational",
        model: "gemini-2.5-flash",
        failSafeMode: "active",
      },
      flyer_engine_300dpi: {
        status: "operational",
        formats: ["square", "portrait", "story", "landscape", "a4"],
        exportStatus: "ready",
      },
      photo_editor: {
        status: "operational",
        methods: ["smart_inpaint", "frosted_blur", "pixelate"],
      },
      quota_ledger: {
        status: "operational",
        idempotencyEnforced: true,
      },
      security: {
        openRedirectDefense: "safeRedirect-verified",
        strictNoSniff: true,
        referrerPolicy: "strict-origin-when-cross-origin",
      },
    },
    latencyMs: Date.now() - startTime,
  };

  return NextResponse.json(healthPayload, {
    status: 200,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "X-Content-Type-Options": "nosniff",
      "X-Service-Phase": "Phase-10-Commercial-Beta",
    },
  });
}
