"use client";

import React, { useState } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Search,
  ShieldCheck,
  FileCheck,
  Scale,
  Sparkles,
} from "lucide-react";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { useAgentStore } from "@/lib/store";

interface Article {
  id: string;
  category: string;
  title: string;
  content: string;
  bulletPoints: string[];
}

const ARTICLES: Article[] = [
  {
    id: "legal-1",
    category: "Legalitas & Sertifikat",
    title: "Panduan Sertifikat Tanah: SHM vs HGB vs Strata Title",
    content:
      "Memahami perbedaan dasar status hak atas tanah sangat penting untuk meyakinkan calon pembeli yang ragu mengenai kepemilikan jangka panjang.",
    bulletPoints: [
      "SHM (Sertifikat Hak Milik): Tingkatan hak terkuat dan terpenuh, berlaku seumur hidup dan dapat diwariskan. Hanya untuk WNI.",
      "HGB (Hak Guna Bangunan): Hak mendirikan dan mempunyai bangunan atas tanah yang bukan miliknya, dengan jangka waktu maksimal 30 tahun dan dapat diperpanjang 20 tahun.",
      "Strata Title (SHM Sarusun): Hak milik atas satuan rumah susun/apartemen yang meliputi hak milik bersama atas tanah bersama dan benda bersama.",
    ],
  },
  {
    id: "tax-2",
    category: "Pajak & Biaya Transaksi",
    title: "Kalkulasi Biaya Jual Beli Properti (BPHTB, PPh & Notaris PPAT)",
    content:
      "Dalam transaksi jual-beli properti di Indonesia, ada komponen biaya resmi yang dibagi antara penjual dan pembeli:",
    bulletPoints: [
      "PPh Final Penjual: 2.5% dari Nilai Pengalihan/Transaksi (dibayar oleh penjual).",
      "BPHTB Pembeli: 5% × (Nilai Transaksi - NPOPTKP) (dibayar oleh pembeli).",
      "Jasa Akta Notaris / PPAT: Rata-rata 0.5% - 1% dari nilai transaksi (biasanya dibagi dua atau ditanggung pembeli).",
      "Biaya Balik Nama (BBN) & Cek Sertifikat BPN: Sesuai tarif PNBP resmi kantor pertanahan.",
    ],
  },
  {
    id: "nego-3",
    category: "Strategi Negosiasi",
    title: "Menghadapi Tawaran Rendah (Lowball Offer) Secara Profesional",
    content:
      "Jangan tersinggung ketika pembeli menawar jauh di bawah harga pasar. Tawaran rendah menandakan ketertarikan tinggi namun pembeli sedang menguji fleksibilitas penjual.",
    bulletPoints: [
      "Validasi minat pembeli terlebih dahulu: 'Terima kasih atas penawarannya, kami senang Bapak/Ibu menyukai unit ini.'",
      "Gunakan data pembanding (CMA): Tunjukkan bukti transaksi unit sejenis di klaster yang sama dalam 6 bulan terakhir.",
      "Tawarkan konsesi non-harga: Misalnya bonus perabotan (semi-furnished), subsidi biaya notaris, atau kemudahan termin pembayaran bertahap.",
    ],
  },
];

export default function KnowledgeBasePage() {
  const { locale } = useAgentStore();
  const [expandedId, setExpandedId] = useState<string>("legal-1");

  return (
    <WorkspaceShell
      title={locale === "id" ? "Basis Pengetahuan Properti" : "Real Estate Knowledge Base"}
      subtitle={locale === "id" ? "Panduan legalitas tanah, perpajakan properti, dan skrip negosiasi closing" : "Legal certificates, property taxes, and closing negotiation playbooks"}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-4">
          {ARTICLES.map((art) => {
            const isExpanded = expandedId === art.id;
            return (
              <div
                key={art.id}
                className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-4 transition-all"
              >
                <div
                  className="flex items-start justify-between cursor-pointer select-none"
                  onClick={() => setExpandedId(isExpanded ? "" : art.id)}
                >
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent)]">
                      {art.category}
                    </span>
                    <h3 className="text-base font-bold text-[var(--text)]">{art.title}</h3>
                  </div>
                  <button
                    type="button"
                    className="p-1 rounded-lg text-[var(--muted)] hover:text-[var(--text)]"
                    aria-label="Toggle article"
                  >
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="pt-3 border-t border-[var(--border)] space-y-3 text-xs md:text-sm text-[var(--muted)] leading-relaxed">
                    <p>{art.content}</p>
                    <ul className="space-y-2 pt-1">
                      {art.bulletPoints.map((pt, i) => (
                        <li key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)]">
                          <ShieldCheck className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </WorkspaceShell>
  );
}
