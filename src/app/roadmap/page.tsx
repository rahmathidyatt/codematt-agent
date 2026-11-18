"use client";

import React from "react";
import { CheckCircle2, Circle, CircleDashed } from "lucide-react";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";

type Status = "done" | "ready" | "planned";

/** Honest status. "ready" = code exists but needs real keys + testing on the dedicated project. */
const ITEMS: { title: string; status: Status; note: string }[] = [
  { title: "Workspace agen (listing, flyer, follow-up, brand kit)", status: "done", note: "Sudah bisa dipakai. Data masih tersimpan di browser masing-masing." },
  { title: "Resize & kompres foto listing", status: "done", note: "Gratis untuk semua paket." },
  { title: "Daftar & login akun", status: "ready", note: "Menunggu diaktifkan oleh admin." },
  { title: "Chat multi-AI: Gemini, ChatGPT, Claude", status: "ready", note: "Sedang diuji sebelum dibuka untuk semua pengguna." },
  { title: "Deteksi & hapus nomor rumah / telepon dengan AI", status: "ready", note: "Sedang diuji. Hanya area yang ditandai yang diubah." },
  { title: "Paket langganan + kuota bulanan di database", status: "ready", note: "Sedang diuji." },
  { title: "Pembayaran lewat Midtrans", status: "ready", note: "Sedang diuji dengan transaksi percobaan." },
  { title: "Listing & foto tersimpan di akun", status: "planned", note: "Supaya bisa dibuka dari perangkat lain." },
  { title: "Perpanjangan otomatis / auto-debit", status: "planned", note: "Untuk sementara bayar per 30 hari." },
  { title: "Paket Team (kuota bersama satu kantor)", status: "planned", note: "Untuk sementara diaktifkan oleh admin." },
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
