"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  MessageSquare,
} from "lucide-react";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";

interface Lead {
  id: string;
  name: string;
  phone: string;
  budget: string;
  propertyInterest: string;
  stage: "Baru" | "Survei Dijadwalkan" | "Negosiasi" | "Won / Closing";
  notes: string;
}

const SAMPLE_LEADS: Lead[] = [
  {
    id: "lead-1",
    name: "Bpk. Hendra Gunawan",
    phone: "0812-9988-7766",
    budget: "Rp 1.5 - 2 Milyar",
    propertyInterest: "Rumah Cluster Sentul Hills",
    stage: "Survei Dijadwalkan",
    notes: "Rencana survei Sabtu jam 10 pagi bersama istri, butuh KPR BCA.",
  },
  {
    id: "lead-2",
    name: "Ibu Maria Kusuma",
    phone: "0811-2233-4455",
    budget: "Rp 3 - 3.5 Milyar",
    propertyInterest: "Apartemen Sudirman Suites 2BR",
    stage: "Negosiasi",
    notes: "Nawar di Rp 3.05 M cash keras, sedang dibicarakan dengan owner.",
  },
  {
    id: "lead-3",
    name: "Dr. Budi Santoso",
    phone: "0813-5566-7788",
    budget: "Rp 1.8 Milyar",
    propertyInterest: "Rumah Sentul City / BSD",
    stage: "Baru",
    notes: "Kontak dari iklan Instagram flyer kemarin sore.",
  },
];

export default function LeadsPage() {
  const [leads] = useState<Lead[]>(SAMPLE_LEADS);

  return (
    <WorkspaceShell
      title="Kontak Prospek"
      subtitle="Calon pembeli, unit yang diminati, dan jadwal survei"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
          <div>
            <h2 className="text-base font-bold text-[var(--text)]">Calon pembeli</h2>
          </div>
          <Link
            href="/followup"
            className="px-3.5 py-2 rounded-xl bg-[var(--accent)] text-neutral-950 text-[13px] font-semibold flex items-center gap-1.5 self-start sm:self-auto hover:opacity-90 shadow-xs"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Tulis follow-up</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-[var(--accent-text)] bg-[var(--bg)] px-2.5 py-1 rounded-md border border-[var(--border)]">
                  {lead.stage}
                </span>
                <span className="text-[13px] font-mono text-[var(--muted)] font-semibold">
                  Budget: {lead.budget}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-[var(--text)]">{lead.name}</h3>
                <p className="text-[13px] text-[var(--muted)] mt-0.5">{lead.phone}</p>
              </div>

              <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[13px] space-y-1">
                <span className="font-semibold text-[var(--text)] block">Minat</span>
                <p className="text-[var(--muted)]">{lead.propertyInterest}</p>
              </div>

              <p className="text-[13px] text-[var(--muted)] italic">
                &ldquo;{lead.notes}&rdquo;
              </p>

              <div className="pt-3 border-t border-[var(--border)] flex justify-between items-center">
                <Link
                  href="/followup"
                  className="text-[13px] font-semibold text-[var(--accent-text)] hover:underline flex items-center gap-1"
                >
                  <span>Chat WhatsApp</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </WorkspaceShell>
  );
}
