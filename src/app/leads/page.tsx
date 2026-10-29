"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Plus,
  Phone,
  Mail,
  Building,
  CheckCircle2,
  Clock,
  ArrowRight,
  MessageSquare,
} from "lucide-react";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { useAgentStore } from "@/lib/store";

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
  const { locale } = useAgentStore();
  const [leads, setLeads] = useState<Lead[]>(SAMPLE_LEADS);

  return (
    <WorkspaceShell
      title={locale === "id" ? "Kontak & Prospek Klien" : "Leads & Prospects"}
      subtitle={locale === "id" ? "Pantau calon pembeli, preferensi unit, dan jadwal survei" : "Track prospective buyers, unit interests, and inspection schedules"}
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
          <div>
            <h2 className="text-base font-bold text-[var(--text)]">Pipeline Calon Pembeli Aktif</h2>
            <p className="text-xs text-[var(--muted)]">3 prospek berkualifikasi tinggi dalam tindak lanjut minggu ini</p>
          </div>
          <Link
            href="/followup"
            className="px-3.5 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto hover:opacity-90 shadow-xs"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Kirim Pesan Follow-up</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--accent)] bg-[var(--bg)] px-2.5 py-1 rounded-md border border-[var(--border)]">
                  {lead.stage}
                </span>
                <span className="text-[11px] font-mono text-[var(--muted)] font-semibold">
                  Budget: {lead.budget}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-[var(--text)]">{lead.name}</h3>
                <p className="text-xs text-[var(--muted)] mt-0.5">{lead.phone}</p>
              </div>

              <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-xs space-y-1">
                <span className="font-semibold text-[var(--text)] block">Minat Properti:</span>
                <p className="text-[var(--muted)]">{lead.propertyInterest}</p>
              </div>

              <p className="text-xs text-[var(--muted)] italic">
                &ldquo;{lead.notes}&rdquo;
              </p>

              <div className="pt-3 border-t border-[var(--border)] flex justify-between items-center">
                <Link
                  href="/followup"
                  className="text-xs font-semibold text-[var(--accent)] hover:underline flex items-center gap-1"
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
