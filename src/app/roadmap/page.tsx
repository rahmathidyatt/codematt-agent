"use client";

import React from "react";
import { CheckCircle2, Circle, CircleDashed } from "lucide-react";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";

type Status = "done" | "ready" | "planned";

/** Honest status. "ready" = code exists but needs real keys + testing on the dedicated project. */
const ITEMS: { title: string; status: Status; note: string }[] = [
  { title: "Workspace agen (listing, flyer, follow-up, brand kit)", status: "done", note: "Berjalan di browser, data contoh disimpan di localStorage." },
  { title: "Resize & kompres foto listing", status: "done", note: "Di browser, gratis, tanpa AI." },
  { title: "Login Supabase Auth", status: "ready", note: "Aktif setelah env CODEMATT_AUTH_ENABLED dan kunci Supabase diisi." },
  { title: "Chat multi-AI: Gemini, ChatGPT, Claude", status: "ready", note: "Adapter server sudah ada; butuh API key dan uji dengan akun nyata." },
  { title: "Deteksi & hapus nomor rumah / telepon dengan AI", status: "ready", note: "Gemini/OpenAI image edit; hanya area yang ditandai yang diganti." },
  { title: "Paket langganan + kuota bulanan di database", status: "ready", note: "Migrasi SQL + uji RLS di CI; perlu di-apply ke proyek Supabase Codematt." },
  { title: "Pembayaran Midtrans (Snap)", status: "ready", note: "Perlu uji sandbox end-to-end sebelum mode produksi." },
  { title: "Penyimpanan listing & foto per akun di Supabase", status: "planned", note: "Saat ini masih localStorage." },
  { title: "Perpanjangan otomatis / auto-debit", status: "planned", note: "Sekarang bayar manual per 30 hari." },
  { title: "Paket Team (kuota bersama satu kantor)", status: "planned", note: "Aktivasi manual oleh admin untuk sementara." },
];

const META: Record<Status, { label: string; Icon: typeof CheckCircle2; className: string }> = {
  done: { label: "Selesai", Icon: CheckCircle2, className: "text-emerald-600" },
  ready: { label: "Siap diuji", Icon: CircleDashed, className: "text-amber-600" },
  planned: { label: "Direncanakan", Icon: Circle, className: "text-[var(--muted)]" },
};

export default function RoadmapPage() {
  return (
    <WorkspaceShell title="Roadmap" subtitle="Status nyata setiap fitur. Diperbarui setiap ada rilis.">
      <div className="max-w-3xl mx-auto space-y-2">
        {ITEMS.map((item) => {
          const info = META[item.status];
          return (
            <div key={item.title} className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex gap-3 text-xs">
              <info.Icon className={`w-4 h-4 mt-0.5 shrink-0 ${info.className}`} />
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-[var(--text)]">{item.title}</span>
                  <span className={`font-mono text-[10px] ${info.className}`}>{info.label}</span>
                </div>
                <p className="text-[var(--muted)] mt-0.5">{item.note}</p>
              </div>
            </div>
          );
        })}
      </div>
    </WorkspaceShell>
  );
}
