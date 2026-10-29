"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Palette,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Check,
  Building2,
  Layers,
  Milestone,
  Home,
  QrCode,
  Download,
  Users,
} from "lucide-react";
import { Roadmap } from "@/components/Roadmap";
import { useAgentStore } from "@/lib/store";

export default function LandingPage() {
  const { listings, agent, locale } = useAgentStore();
  const [activeDemoTab, setActiveDemoTab] = useState<"writer" | "flyer" | "whatsapp">("writer");

  const sample = listings[0];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col">
      {/* Top Bar (Follows Top Bar Contract: Brand — 4-5 Links — 1 Primary Action) */}
      <header className="border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <Link href="/" className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
            <span className="w-8 h-8 rounded-lg bg-[var(--accent)] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              c.
            </span>
            <span className="text-base font-bold tracking-tight">
              codematt <span className="text-[var(--accent)]">agent</span>
            </span>
          </Link>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[var(--muted)]">
            <a href="#fitur" className="hover:text-[var(--text)] transition-colors whitespace-nowrap">
              Fitur Utama
            </a>
            <Link href="/listing" className="hover:text-[var(--text)] transition-colors whitespace-nowrap">
              Listing Writer
            </Link>
            <Link href="/flyer" className="hover:text-[var(--text)] transition-colors whitespace-nowrap">
              Flyer Studio
            </Link>
            <a href="#pricing" className="hover:text-[var(--text)] transition-colors whitespace-nowrap">
              Paket Harga
            </a>
            <a href="#roadmap" className="hover:text-[var(--text)] transition-colors whitespace-nowrap">
              Roadmap (Phase 0–10)
            </a>
          </nav>

          {/* Zone 3: Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/login"
              className="text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)] px-3 py-2 transition-colors hidden sm:block"
            >
              Masuk
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 text-xs font-bold text-white bg-[var(--accent)] rounded-xl hover:opacity-95 shadow-xs transition-opacity whitespace-nowrap"
            >
              Buka Workspace
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-12 sm:pt-24 sm:pb-20 border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--accent)] font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Workspace Khusus Agen Properti Indonesia</span>
            <span aria-hidden="true">·</span>
            <span className="text-[var(--muted)]">Phase 0 Shipped · Phase 1 Live</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[var(--text)] max-w-4xl mx-auto leading-[1.12]">
            Input Fakta Properti Sekali. Hasilkan Listing & Flyer 300 DPI Siap Closing.
          </h1>

          <p className="text-base sm:text-lg text-[var(--muted)] max-w-2xl mx-auto leading-relaxed">
            Codematt Agent membantu agen properti menyusun copywriting 3 gaya (Keluarga, Investor, Formal), mendesain flyer cetak ber-QR WhatsApp, dan merangkai pesan tindak lanjut tanpa resiko halusinasi fakta.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[var(--accent)] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 hover:opacity-95 shadow-md transition-all"
            >
              <span>Eksplorasi Workspace Demo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#roadmap"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs sm:text-sm font-bold text-[var(--text)] hover:bg-[var(--bg)] transition-colors"
            >
              Lihat Progress Roadmap
            </a>
          </div>

          {/* Social Proof & Guarantees */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--muted)]">
            <div className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Verifikasi Fakta 100% Cocok</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Ekspor Flyer Standar Percetakan 300 DPI</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Stempel Brand Kit Agensi Otomatis</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Live Property Demo Showcase */}
      <section className="py-16 sm:py-20 border-b border-[var(--border)] bg-[var(--bg)]" id="fitur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
              Alur Kerja Terintegrasi
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text)]">
              Dari Lembar Spesifikasi Menjadi Aset Siap Sebar
            </h2>
            <p className="text-xs sm:text-sm text-[var(--muted)]">
              Klik tab di bawah untuk melihat bagaimana fakta properti diterjemahkan ke setiap format pemasaran
            </p>
          </div>

          {/* Demo Tabs */}
          <div className="flex justify-center">
            <div className="p-1 bg-[var(--surface)] border border-[var(--border)] rounded-xl inline-flex gap-1">
              <button
                type="button"
                onClick={() => setActiveDemoTab("writer")}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
                  activeDemoTab === "writer"
                    ? "bg-[var(--accent)] text-white shadow-xs"
                    : "text-[var(--muted)] hover:text-[var(--text)]"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>1. Listing Description</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveDemoTab("flyer")}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
                  activeDemoTab === "flyer"
                    ? "bg-[var(--accent)] text-white shadow-xs"
                    : "text-[var(--muted)] hover:text-[var(--text)]"
                }`}
              >
                <Palette className="w-4 h-4" />
                <span>2. Flyer 300 DPI & QR</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveDemoTab("whatsapp")}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
                  activeDemoTab === "whatsapp"
                    ? "bg-[var(--accent)] text-white shadow-xs"
                    : "text-[var(--muted)] hover:text-[var(--text)]"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>3. Follow-up WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Demo Content Card */}
          <div className="p-6 md:p-8 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-md">
            {activeDemoTab === "writer" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-[var(--accent)] uppercase">
                    <span>Input Fakta Properti</span>
                    <span aria-hidden="true">→</span>
                    <span>3 Gaya Copywriting AI</span>
                  </div>
                  <h3 className="text-xl font-bold text-[var(--text)]">
                    Tempat Pulang Ternyaman: {sample.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                    Dirancang dengan luas bangunan {sample.buildingSize} m² di atas tanah {sample.landSize} m² ({sample.bedrooms} KT / {sample.bathrooms} KM) dengan legalitas {sample.certificate}. Berada di lokasi premium {sample.location}.
                  </p>
                  <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-1.5 text-xs">
                    <span className="font-bold text-[var(--text)]">🛡️ Fact-Check Safeguard:</span>
                    <p className="text-[var(--muted)]">Harga Rp {(sample.price / 1000000000).toFixed(2)} M teruji 100% akurat tanpa karangan angka.</p>
                  </div>
                  <Link
                    href="/listing"
                    className="inline-flex items-center gap-2 text-xs font-bold text-[var(--accent)] hover:underline"
                  >
                    <span>Coba di Listing Writer Studio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="p-5 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-3 font-mono text-xs">
                  <div className="text-[11px] text-[var(--accent)] font-bold">VARIASI 1: EMOSIONAL / KELUARGA</div>
                  <div className="text-[var(--text)] text-[12px] leading-relaxed">
                    &ldquo;Bayangkan memulai hari dengan pemandangan pegunungan asri dan udara sejuk bersama keluarga di {sample.name}...&rdquo;
                  </div>
                  <div className="pt-2 border-t border-[var(--border)] text-[11px] text-[var(--accent)] font-bold">
                    VARIASI 2: INVESTOR / ROI
                  </div>
                  <div className="text-[var(--text)] text-[12px] leading-relaxed">
                    &ldquo;Peluang capital gain tinggi di koridor berkembang {sample.location}. Estimasi rental yield 7-9% per tahun...&rdquo;
                  </div>
                </div>
              </div>
            )}

            {activeDemoTab === "flyer" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="text-xs font-mono font-bold text-[var(--accent)] uppercase">
                    Grafis Siap Cetak
                  </span>
                  <h3 className="text-xl font-bold text-[var(--text)]">
                    Flyer Multi-Ukuran dengan QR WhatsApp Dinamis
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                    Mendukung 5 standar dimensi: Instagram Square (1080×1080), Portrait (1080×1350), Story Reels (1080×1920), Landscape Ads (1200×628), dan Dokumen Cetak A4 (300 DPI). Dilengkapi QR code otomatis yang langsung membuka chat WhatsApp agen.
                  </p>
                  <Link
                    href="/flyer"
                    className="inline-flex items-center gap-2 text-xs font-bold text-[var(--accent)] hover:underline"
                  >
                    <span>Buka Flyer Studio Interaktif</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="p-6 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-center space-y-3">
                  <div className="w-24 h-24 mx-auto bg-white p-2 rounded-xl shadow-sm border border-[var(--border)] flex items-center justify-center">
                    <QrCode className="w-20 h-20 text-[var(--accent)]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[var(--text)] block">Scan untuk Chat WhatsApp</span>
                    <span className="text-[11px] text-[var(--muted)]">{agent.name} · {agent.agency}</span>
                  </div>
                </div>
              </div>
            )}

            {activeDemoTab === "whatsapp" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="text-xs font-mono font-bold text-emerald-600 uppercase">
                    Pesan Closing Cepat
                  </span>
                  <h3 className="text-xl font-bold text-[var(--text)]">
                    Follow-up WhatsApp Berbasis 5 Skenario
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                    Tindak lanjuti prospek pasca survei lokasi, penurunan harga, konsultasi simulasi KPR, atau pengingat booking fee dengan 1-klik buka WhatsApp Web.
                  </p>
                  <Link
                    href="/followup"
                    className="inline-flex items-center gap-2 text-xs font-bold text-[var(--accent)] hover:underline"
                  >
                    <span>Coba Fitur Follow-up WhatsApp</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-xs text-[var(--text)] space-y-2 leading-relaxed">
                  <p className="font-sans">
                    &ldquo;Halo Ibu Maria, terima kasih atas waktunya kemarin saat survei di *{sample.name}* ({sample.location}). Sebagai pengingat, properti ini berstatus *{sample.certificate}* di harga spesial *Rp {(sample.price / 1000000000).toFixed(2)} M*...&rdquo;
                  </p>
                  <div className="text-[10px] text-[var(--muted)] text-right font-mono">
                    Siap kirim via WhatsApp
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4 Feature Value Pillars */}
      <section className="py-16 sm:py-20 border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
              Kelebihan Platform
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text)]">
              Mengapa Agen Memilih Codematt Agent?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-[var(--bg)] border border-[var(--border)] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="text-sm font-bold text-[var(--text)]">Verifikasi Fakta Anti-Halusinasi</h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Algoritma audit dua sisi memastikan angka harga, luas tanah, dan legalitas sertifikat tetap persis seperti fakta fisik unit.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--bg)] border border-[var(--border)] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="text-sm font-bold text-[var(--text)]">Flyer 300 DPI Standar Percetakan</h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Resolusi tinggi vektor dan CMYK-safe, tajam saat disebar di WhatsApp maupun saat dicetak selebaran A4 di percetakan.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--bg)] border border-[var(--border)] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="text-sm font-bold text-[var(--text)]">Dynamic QR WhatsApp Link</h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Calon pembeli yang memindai flyer brosur langsung diarahkan ke chat WhatsApp agen tanpa perlu mengetik ulang nomor telepon.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--bg)] border border-[var(--border)] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center font-bold">
                4
              </div>
              <h3 className="text-sm font-bold text-[var(--text)]">Brand Kit Agensi Otomatis</h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Logo kantor, lisensi AREBI, nomor telepon, dan warna brand agen otomatis terstempel di setiap materi pemasaran yang dihasilkan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 sm:py-20 border-b border-[var(--border)] bg-[var(--bg)]" id="pricing">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
              Paket Transparan
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text)]">
              Investasi Terjangkau untuk Hasil Closing Berlipat
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                name: "Free Trial",
                price: "Rp 0",
                period: "selamanya",
                desc: "Untuk eksplorasi fitur dasar",
                ai: "25 request / bln",
                flyer: "5 flyer / bln",
                current: false,
              },
              {
                name: "Starter Pro",
                price: "Rp 149.000",
                period: "/ bulan",
                desc: "Paling populer untuk agen aktif",
                ai: "150 request / bln",
                flyer: "50 flyer 300 DPI / bln",
                current: true,
              },
              {
                name: "Top Producer",
                price: "Rp 349.000",
                period: "/ bulan",
                desc: "Untuk volume listing tinggi",
                ai: "500 request / bln",
                flyer: "200 flyer 300 DPI / bln",
                current: false,
              },
              {
                name: "Brokerage Team",
                price: "Rp 899.000",
                period: "/ bulan",
                desc: "Untuk kantor cabang (5-10 agen)",
                ai: "2.500 request / bln",
                flyer: "1.000 flyer 300 DPI / bln",
                current: false,
              },
            ].map((p, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-2xl border transition-all flex flex-col justify-between ${
                  p.current
                    ? "bg-[var(--surface)] border-[var(--accent)] ring-2 ring-[var(--accent)] shadow-md"
                    : "bg-[var(--surface)] border-[var(--border)]"
                }`}
              >
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-[var(--text)]">{p.name}</h3>
                    <p className="text-[11px] text-[var(--muted)]">{p.desc}</p>
                  </div>
                  <div>
                    <span className="text-2xl font-bold font-mono text-[var(--text)]">{p.price}</span>
                    <span className="text-xs text-[var(--muted)]"> {p.period}</span>
                  </div>
                  <div className="space-y-1.5 pt-3 border-t border-[var(--border)] text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-[var(--muted)]">AI Generasi:</span>
                      <span className="font-bold text-[var(--text)]">{p.ai}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--muted)]">Flyer 300 DPI:</span>
                      <span className="font-bold text-[var(--text)]">{p.flyer}</span>
                    </div>
                  </div>
                </div>
                <div className="pt-5 mt-5 border-t border-[var(--border)]">
                  <Link
                    href="/dashboard"
                    className={`w-full py-2.5 rounded-xl text-xs font-bold block text-center transition-all ${
                      p.current
                        ? "bg-[var(--accent)] text-white shadow-xs hover:opacity-95"
                        : "bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface)]"
                    }`}
                  >
                    {p.current ? "Mulai Sekarang" : "Pilih Paket"}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Embedded Roadmap Section */}
      <section className="py-16 sm:py-20 border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <Roadmap />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[var(--surface)] border-t border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-[var(--muted)]">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-[var(--accent)] text-white flex items-center justify-center font-bold text-xs">
              c.
            </span>
            <span className="font-semibold text-[var(--text)]">Codematt Agent</span>
            <span>· AI Workspace for Real Estate Agents</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="hover:text-[var(--text)]">
              Workspace
            </Link>
            <Link href="/listing" className="hover:text-[var(--text)]">
              Listing Writer
            </Link>
            <Link href="/flyer" className="hover:text-[var(--text)]">
              Flyer Studio
            </Link>
            <Link href="/roadmap" className="hover:text-[var(--text)]">
              Roadmap
            </Link>
          </div>

          <div>© 2026 Codematt Agent. Built for real estate excellence.</div>
        </div>
      </footer>
    </div>
  );
}
