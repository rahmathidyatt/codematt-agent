"use client";

import { useState, useMemo } from "react";
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  Search,
  SlidersHorizontal,
  Layers,
  ShieldCheck,
  Milestone,
  Check,
  Eye,
  Sparkles,
  Calendar,
  Tag,
  CheckCheck,
} from "lucide-react";

export type PhaseStatus = "completed" | "current" | "next" | "planned";

export interface PhaseFeature {
  nameId: string;
  nameEn: string;
  tag: string;
  descriptionId: string;
  descriptionEn: string;
  spec?: string;
}

export interface PhaseMilestone {
  phase: number;
  titleId: string;
  titleEn: string;
  category: "foundation" | "workspace" | "intelligence" | "production";
  status: PhaseStatus;
  targetDateId: string;
  targetDateEn: string;
  quarter: string;
  sprintDurationId: string;
  sprintDurationEn: string;
  gateId: string;
  gateEn: string;
  features: PhaseFeature[];
  deliverablesId: string[];
  deliverablesEn: string[];
  descriptionId: string;
  descriptionEn: string;
  artifacts?: {
    name: string;
    path: string;
    description: string;
  }[];
}

const ROADMAP_DATA: PhaseMilestone[] = [
  {
    phase: 0,
    titleId: "Fondasi Sistem, Keamanan & Kontrak Domain",
    titleEn: "System Foundation, Security & Domain Contracts",
    category: "foundation",
    status: "completed",
    targetDateId: "28 Oktober 2026",
    targetDateEn: "October 28, 2026",
    quarter: "Q4 2026",
    sprintDurationId: "Selesai · Fondasi Rilis",
    sprintDurationEn: "Shipped · Foundation Release",
    gateId: "Lint, typecheck, test, build lolos dan konfigurasi mandiri tervalidasi",
    gateEn: "Lint, typecheck, test, and build passing with validated standalone config",
    descriptionId:
      "Fase 0 telah tuntas. Fondasi aplikasi, perlindungan open-redirect, schema kontrak tanpa ketergantungan liar, dan verifikasi CI telah aktif.",
    descriptionEn:
      "Phase 0 is complete. Application foundation, open-redirect protection, decoupled contract schemas, and CI verification are fully active.",
    features: [
      {
        nameId: "Runtime Node 22 & Arsitektur Next.js 16 Standalone",
        nameEn: "Node 22 Runtime & Next.js 16 Standalone Output",
        tag: "Architecture",
        descriptionId:
          "Menghapus lockfile pihak ketiga yang tidak kompatibel, mengikat port 3000 pada 0.0.0.0, dan menghasilkan build standalone yang stabil di sandbox cloud.",
        descriptionEn:
          "Removes incompatible foreign lockfiles, binds port 3000 to 0.0.0.0, and produces optimized standalone builds for cloud environments.",
        spec: "Next.js 16.3.8 · Node >=22 · Output standalone · iFrame embeddable",
      },
      {
        nameId: "Pertahanan Open-Redirect Berlapis (safeRedirect)",
        nameEn: "Hardened Open-Redirect Defense (safeRedirect)",
        tag: "Security",
        descriptionId:
          "Parser tujuan pasca-login yang kebal terhadap phishing dan URL manipulatif seperti protocol-relative (//evil.com), karakter null, dan backslash.",
        descriptionEn:
          "Post-login redirect resolver immune to phishing vectors, protocol-relative links (//evil.com), null bytes, and backslashes.",
        spec: "tests/redirect.test.mjs passing with 100% boundary test coverage",
      },
      {
        nameId: "Kontrak Grafis Multi-Format (FlyerDocument)",
        nameEn: "Standardized Graphics Contract (FlyerDocument)",
        tag: "Flyer",
        descriptionId:
          "Definisi skema 5 ukuran aset iklan digital dan cetak: Square (1080x1080), Portrait (1080x1350), Story (1080x1920), Landscape (1200x628), dan A4 300 DPI.",
        descriptionEn:
          "Strict contract schema defining 5 ad dimensions: Square (1080x1080), Portrait (1080x1350), Story (1080x1920), Landscape (1200x628), and Print A4 300 DPI.",
        spec: "FlyerDocument Schema V1 with headline, highlights, QR, and BrandKit bindings",
      },
      {
        nameId: "Kontrak Layanan AI & Ledger Kuota Transaksional",
        nameEn: "Decoupled AI Service & Transactional Ledger Contracts",
        tag: "Intelligence",
        descriptionId:
          "Spesifikasi server-side AI dengan kode kegagalan aman (timeout, quota, auth) dan kontrak reservasi kuota dengan kunci idempotensi anti-double-spend.",
        descriptionEn:
          "Server-side AI specification with safe fault handling (timeout, quota, auth) and transactional usage reservation with idempotency keys.",
        spec: "AiService & UsageService contracts with 4 tier models (Free, Starter, Pro, Team)",
      },
    ],
    deliverablesId: [
      "Arsitektur Next.js 16 standalone, Node 22 runtime, dan skrip dev 0.0.0.0",
      "Halaman foundation dengan kamus multibahasa (ID/EN)",
      "Kontrak tipe FlyerDocument & standar ukuran aset iklan",
      "Kontrak layanan AI (AiRequest, AiResult, kode kegagalan aman)",
      "Kontrak UsageService & ledger reservasi kuota transaksional",
      "Utilitas keamanan safeRedirect beserta node:test suite",
    ],
    deliverablesEn: [
      "Next.js 16 standalone architecture, Node 22 runtime, and 0.0.0.0 dev script",
      "Foundation page with bilingual i18n dictionaries (ID/EN)",
      "FlyerDocument type contracts & standardized ad dimension specifications",
      "AI Service interface (AiRequest, AiResult, fail-safe status handling)",
      "UsageService & transactional quota reservation ledger contract",
      "safeRedirect security utility with verified node:test suite",
    ],
    artifacts: [
      {
        name: "Flyer Contracts",
        path: "src/features/flyer/contracts.ts",
        description: "5 target flyer dimension schemas & FlyerDocument interface",
      },
      {
        name: "AI Contracts",
        path: "src/lib/ai/contracts.ts",
        description: "Server-side AiService, task definitions & failure codes",
      },
      {
        name: "Billing & Ledger",
        path: "src/lib/billing/contracts.ts",
        description: "Idempotent usage reservation & plan tiers",
      },
      {
        name: "Safe Redirect Security",
        path: "src/lib/security/redirect.ts",
        description: "Attack-resistant destination parsing tested in redirect.test.mjs",
      },
    ],
  },
  {
    phase: 1,
    titleId: "Antarmuka Shell, Navigasi & Empty States",
    titleEn: "UI Shell, Responsive Navigation & Empty States",
    category: "workspace",
    status: "completed",
    targetDateId: "15 November 2026",
    targetDateEn: "November 15, 2026",
    quarter: "Q4 2026",
    sprintDurationId: "Selesai · Terverifikasi",
    sprintDurationEn: "Shipped · Verified",
    gateId: "Responsif mobile 360px, navigasi keyboard, state kosong tanpa mock fiktif",
    gateEn: "Mobile 360px responsiveness, keyboard accessibility, honest empty states without fake telemetry",
    descriptionId:
      "Fase 1 tuntas. Ruang kerja agen yang elegan, cepat, responsif mobile 360px, navigasi keyboard lengkap, dan sinkronisasi preferensi tema aktif.",
    descriptionEn:
      "Phase 1 complete. High-performance agent workspace, responsive mobile drawer, accessible keyboard navigation, and theme synchronization fully active.",
    features: [
      {
        nameId: "App Shell Responsif & Drawer Seluler 360px",
        nameEn: "Responsive App Shell & Accessible Mobile Drawer",
        tag: "UI / UX",
        descriptionId:
          "Sidebar tetap untuk desktop dan drawer geser untuk layar sentuh seluler dengan perangkap fokus keyboard dan navigasi 12 modul lengkap.",
        descriptionEn:
          "Desktop persistent sidebar and mobile slide-out drawer with keyboard focus trapping and complete 12-module route navigation.",
        spec: "ARIA-compliant dialog, 44px touch targets, zero content layout shift",
      },
      {
        nameId: "Dasbor dengan Empty States Jujur",
        nameEn: "Dashboard with Non-Fictitious Empty States",
        tag: "Dashboard",
        descriptionId:
          "Menyediakan panduan awal yang jelas bagi agen baru tanpa menampilkan angka analitik palsu atau aktivitas dummy.",
        descriptionEn:
          "Clean visual empty states explaining how each tool works without generating fake analytics or dummy charts.",
        spec: "Covers all 12 modules: Listing, Flyer, WhatsApp follow-up, Leads, Knowledge, Brand",
      },
      {
        nameId: "Sistem Tema Bebas Kedipan (Light / Dark / System)",
        nameEn: "Zero-Flash Theme Engine (Light / Dark / System)",
        tag: "Theme",
        descriptionId:
          "Sinkronisasi preferensi warna pengguna secara instan tanpa kedipan putih pada saat navigasi atau SSR.",
        descriptionEn:
          "Persistent client theme state matching OS dark/light mode with CSS variables and zero flash during SSR.",
        spec: "Tailwind v4 color variables with WCAG AA compliant contrast ratios",
      },
      {
        nameId: "Antarmuka Form Otentikasi Terisolasi",
        nameEn: "Isolated Authentication Form UI",
        tag: "Auth",
        descriptionId:
          "Tampilan halaman masuk, pendaftaran, dan reset sandi yang ramah pengguna dengan pesan status transparan bahwa akun belum terhubung ke backend.",
        descriptionEn:
          "Polished login, register, and password recovery view with transparent disclaimer that database auth is queued for Phase 2.",
        spec: "Accessible form validation with client-side error states",
      },
    ],
    deliverablesId: [
      "Landing page ringkas dan pengenalan alur kerja agen properti",
      "App shell responsif: desktop sidebar & mobile drawer berstandar aksesibilitas",
      "Dasbor dengan empty states jujur untuk seluruh 12 modul",
      "Preferensi tema tersimpan (Light / Dark / System) tanpa flash UI",
      "Antarmuka formulir otentikasi (tampilan login/register awal tanpa klaim aktif)",
    ],
    deliverablesEn: [
      "Concise landing page presenting real estate agent workflow",
      "Responsive app shell: desktop sidebar & mobile drawer with accessible focus trap",
      "Dashboard with honest empty states across all 12 modules",
      "Persistent non-sensitive theme preference (Light / Dark / System) with zero flash",
      "Authentication form UI (initial login/register interface without premature backend claims)",
    ],
  },
  {
    phase: 2,
    titleId: "Autentikasi Supabase, Profil & Brand Kit",
    titleEn: "Supabase Authentication, Profiles & Brand Kit",
    category: "foundation",
    status: "completed",
    targetDateId: "10 Desember 2026",
    targetDateEn: "December 10, 2026",
    quarter: "Q4 2026",
    sprintDurationId: "Selesai · Terverifikasi",
    sprintDurationEn: "Shipped · Verified",
    gateId: "Login, reset kata sandi, logout teruji; kredensial tersanitasi di sisi pengguna",
    gateEn: "Login, password reset, and logout verified; credentials isolated in user configuration",
    descriptionId:
      "Menghubungkan identitas pengguna dan personalisasi materi pemasaran sesuai profil kantor agen properti.",
    descriptionEn:
      "Connects agent identity and automated marketing branding according to individual agency credentials.",
    features: [
      {
        nameId: "Manajemen Sesi Server-Side Supabase Auth",
        nameEn: "Server-Side Supabase Session Management",
        tag: "Security",
        descriptionId:
          "Otentikasi aman berbasis JWT HttpOnly cookie, pencegahan session hijack, dan alur pemulihan kata sandi.",
        descriptionEn:
          "Secure JWT HttpOnly cookie session lifecycle, session revocation, and automated password recovery flows.",
        spec: "Next.js middleware route protection & Supabase SSR package",
      },
      {
        nameId: "Modul Identitas Brand Kit Agensi",
        nameEn: "Agency Brand Kit Identity Studio",
        tag: "Branding",
        descriptionId:
          "Manajer aset identitas kantor agen: unggah logo resolusi tinggi, pengaturan warna utama/sekunder, dan kartu nama digital.",
        descriptionEn:
          "Agency brand manager: high-res logo upload, primary/secondary color palettes, and digital agency badge presets.",
        spec: "Auto-stamped onto flyers, brochures, and generated messages",
      },
      {
        nameId: "Penyimpanan Media Storage Bucket & RLS",
        nameEn: "Media Storage Buckets & Strict Row Level Security",
        tag: "Database",
        descriptionId:
          "Bucket penyimpanan foto properti dengan kompresi otomatis dan aturan RLS agar agen tidak bisa melihat aset agensi lain.",
        descriptionEn:
          "Photo storage bucket with automated image compression and PostgreSQL Row Level Security enforcing tenant isolation.",
        spec: "PostgreSQL migrations + Supabase Storage CDN integration",
      },
    ],
    deliverablesId: [
      "Integrasi Supabase Auth & manajemen sesi server-side",
      "Tabel profil agen dan pengaturan akun",
      "Modul Brand Kit: identitas logo, palet warna, & kontak agensi",
      "Penyimpanan aset grafis mandiri berbasis storage bucket",
      "Migrasi schema database dengan Row Level Security (RLS) ketat",
    ],
    deliverablesEn: [
      "Supabase Auth integration & server-side session management",
      "Agent profile schema and personal workspace configuration",
      "Brand Kit module: agency logo, color palette, & contact badges",
      "Asset storage bucket integration for media uploads",
      "Database schema migration with strict Row Level Security (RLS)",
    ],
  },
  {
    phase: 3,
    titleId: "Integrasi Provider AI & Manajemen Prompt",
    titleEn: "Server-Side AI Provider & Prompt Architecture",
    category: "intelligence",
    status: "completed",
    targetDateId: "12 Januari 2027",
    targetDateEn: "January 12, 2027",
    quarter: "Q1 2027",
    sprintDurationId: "Selesai · Terverifikasi",
    sprintDurationEn: "Shipped · Verified",
    gateId: "Isolasi sesi AI, konkurensi, penanganan timeout/refusal, dan batas biaya operasional",
    gateEn: "AI session isolation, concurrency controls, timeout/refusal handling, and operational cost caps",
    descriptionId:
      "Mesin kecerdasan server-side yang menyusun materi listing dan komunikasi klien tanpa membebani peramban.",
    descriptionEn:
      "Server-side intelligence pipeline that drafts listings and client interactions reliably with zero client-side risk.",
    features: [
      {
        nameId: "Proksi API Server-Side Model AI",
        nameEn: "Protected Server-Side AI Pipeline",
        tag: "AI Architecture",
        descriptionId:
          "Panggilan AI dieksekusi 100% di server melalui Next.js API routes; API key tidak pernah terekspos ke sisi klien.",
        descriptionEn:
          "All LLM generation runs strictly server-side; API secrets never touch the browser DOM or network tab.",
        spec: "AbortSignal timeout guards, circuit breakers, and payload validation with Zod",
      },
      {
        nameId: "Mesin Prompting Khusus Pasar Properti",
        nameEn: "Real Estate Property Prompt Engine",
        tag: "Prompting",
        descriptionId:
          "Koleksi prompt teruji dengan pemahaman istilah sertifikat tanah (SHM, HGB, Strata Title), tipe klaster perumahan, dan fasilitas umum.",
        descriptionEn:
          "Versioned prompts calibrated for real estate terminology (freehold, strata, zoning, cluster amenities, and legal permits).",
        spec: "Structured JSON schema generation for predictable client rendering",
      },
      {
        nameId: "Batas Kuota Dinamis & Token Bucket Rate Limiting",
        nameEn: "Dynamic Quota Gating & Rate Limiting",
        tag: "Quota",
        descriptionId:
          "Mencegah pembengkakan biaya komputasi dengan menghitung pemakaian token input/output dan membatasi panggilan per menit.",
        descriptionEn:
          "Token-aware throttling preventing cost overruns and enforcing equitable monthly quota consumption per agent.",
        spec: "Redis/In-memory rate limiter with 429 Retry-After response headers",
      },
    ],
    deliverablesId: [
      "Panggilan AI model server-side eksklusif (kunci rahasia terlindungi)",
      "Sistem prompt terstruktur & versioning untuk domain properti",
      "Asisten percakapan cerdas & riwayat pesan kontekstual",
      "Batas kuota otomatis & rate-limiting adaptif per agen",
      "Penanganan graceful fallback saat kuota atau layanan sedang padat",
    ],
    deliverablesEn: [
      "Exclusive server-side AI model invocation (zero client credential leakage)",
      "Structured prompt engineering & versioning tailored to property listings",
      "Agent assistant conversational context and history persistence",
      "Automated quota gating & adaptive rate limiting per user tier",
      "Graceful degradation when provider capacity or quota is exhausted",
    ],
  },
  {
    phase: 4,
    titleId: "Studio Konten Properti & Validasi Fakta",
    titleEn: "Real Estate Content Studio & Dual-Sided Fact Validation",
    category: "intelligence",
    status: "completed",
    targetDateId: "08 Februari 2027",
    targetDateEn: "February 08, 2027",
    quarter: "Q1 2027",
    sprintDurationId: "Selesai · Terverifikasi",
    sprintDurationEn: "Shipped · Verified",
    gateId: "Fakta fisik properti (harga, lokasi, kamar) terjaga 100% tanpa halusinasi",
    gateEn: "Physical property facts (price, location, rooms) preserved 100% without hallucination",
    descriptionId:
      "Alat kerja harian agen untuk memproduksi copywriting listing dan pesan tindak lanjut yang akurat.",
    descriptionEn:
      "Day-to-day drafting suite enabling agents to generate listing copy and follow-up sequences with validated facts.",
    features: [
      {
        nameId: "Listing Writer Multi-Sudut Pandang",
        nameEn: "Multi-Angle Listing Description Writer",
        tag: "Copywriting",
        descriptionId:
          "Menghasilkan 3 gaya penulisan listing otomatis: Emosional/Keluarga (fokus kenyamanan), Komersial/Investor (fokus ROI), dan Formal/Portal Properti.",
        descriptionEn:
          "Instant creation of 3 distinct copy angles: Family/Residential (warm & cozy), Investor (yield & capital appreciation), and Formal Portal format.",
        spec: "Preserves property specs: bedrooms, land size, building size, carports, and legal status",
      },
      {
        nameId: "Verifikator Fakta Dua Sisi (Fact-Check Safeguard)",
        nameEn: "Dual-Sided Property Fact Check Safeguard",
        tag: "Validation",
        descriptionId:
          "Algoritma audit yang membandingkan teks draf AI terhadap data input asli; menandai jika ada angka harga atau luas bangunan yang melenceng.",
        descriptionEn:
          "Auditing engine comparing AI text against entered specs, highlighting discrepancies in price, area, or room counts.",
        spec: "Zero-hallucination guarantee with side-by-side spec comparison table",
      },
      {
        nameId: "Generator Pesan WhatsApp & Email Prospek",
        nameEn: "WhatsApp & Email Client Follow-up Generator",
        tag: "CRM",
        descriptionId:
          "Template pesan siap kirim untuk follow-up survei lokasi, pengingat janji temu, penawaran harga spesial, dan update listing baru.",
        descriptionEn:
          "Direct copy-paste messaging sequences for WhatsApp and email: post-viewing check-ins, price reductions, and open house alerts.",
        spec: "One-click copy, WhatsApp deep-link generation, and customizable greeting macros",
      },
    ],
    deliverablesId: [
      "Listing Description Writer (gaya formal, santai, dan investor)",
      "Follow-up Client Message Generator (WhatsApp & Email follow-up)",
      "Content Studio: hook media sosial, caption Instagram/TikTok, & newsletter",
      "Pemeriksaan fakta dua sisi: membandingkan input awal vs draf AI",
      "Aksi cepat satu klik: salin teks, edit inline, simpan ke proyek",
    ],
    deliverablesEn: [
      "Listing Description Writer (formal, conversational, and investor angles)",
      "Follow-up Client Message Generator (WhatsApp & Email cadences)",
      "Social Content Studio: engagement hooks, Instagram/TikTok captions, & newsletters",
      "Dual-sided fact validator: comparing verified specs against AI output",
      "Instant action controls: one-click copy, inline editing, and draft persistence",
    ],
  },
  {
    phase: 5,
    titleId: "Flyer Designer, Generator QR & Ekspor Cetak",
    titleEn: "Flyer Designer, QR Generator & Print-Ready Export",
    category: "workspace",
    status: "completed",
    targetDateId: "05 Maret 2027",
    targetDateEn: "March 05, 2027",
    quarter: "Q1 2027",
    sprintDurationId: "Selesai · Terverifikasi",
    sprintDurationEn: "Shipped · Verified",
    gateId: "Ukuran piksel akurat, tipografi tidak terpotong, QR teruji scan, memori mobile terkontrol",
    gateEn: "Pixel-accurate dimensions, unclipped typography, verified QR scan, bounded mobile memory",
    descriptionId:
      "Studio grafis instan untuk menerbitkan brosur digital siap sebar dan dokumen cetak profesional dalam hitungan detik.",
    descriptionEn:
      "Instant graphic studio for producing broadcast-ready digital brochures and commercial print sheets in seconds.",
    features: [
      {
        nameId: "Studio Kanvas Flyer Multi-Ukuran",
        nameEn: "Multi-Format Real-Time Flyer Canvas",
        tag: "Design Studio",
        descriptionId:
          "Editor WYSIWYG instan yang menyesuaikan tata letak foto, judul, dan spesifikasi ke dalam 5 format media sosial dan cetak secara simultan.",
        descriptionEn:
          "WYSIWYG layout engine formatting photos, headlines, and specifications across 5 social and print ratios simultaneously.",
        spec: "Strict implementation of Phase 0 flyer contract (Square, Portrait, Story, Landscape, A4)",
      },
      {
        nameId: "Generator QR Code Dinamis Terintegrasi",
        nameEn: "Integrated Dynamic QR Code Generator",
        tag: "QR Code",
        descriptionId:
          "Menghasilkan QR code kontras tinggi yang dapat dipindai kamera ponsel langsung menuju Google Maps, chat WhatsApp agen, atau brosur online.",
        descriptionEn:
          "Embeds high-contrast, scannable QR codes linking directly to GPS location pins, agent WhatsApp direct chats, or web landing pages.",
        spec: "Configurable error-correction level (M/Q) ensuring scannability even on wrinkled prints",
      },
      {
        nameId: "Mesin Ekspor Gambar & PDF Cetak 300 DPI",
        nameEn: "High-Resolution Image & 300 DPI Print Exporter",
        tag: "Export",
        descriptionId:
          "Menghasilkan output PNG jernih untuk WhatsApp dan dokumen PDF A4 tajam beresolusi 300 DPI siap bawa ke percetakan profesional.",
        descriptionEn:
          "Renders crisp PNGs for WhatsApp broadcast and vector-sharp 300 DPI A4 PDFs ready for professional commercial offset printing.",
        spec: "Client-side offscreen canvas rasterization with memory leak safety guards",
      },
    ],
    deliverablesId: [
      "Template flyer responsif multi-format (Square, Portrait, Story, Landscape, A4 Cetak)",
      "Formulir data listing interaktif dengan pembaruan pratinjau real-time",
      "Generator QR code dinamis yang mengarah ke link virtual tour / brosur",
      "Ekspor format resolusi tinggi (PNG, JPEG, & PDF cetak 300 DPI)",
      "Pencegahan kebocoran memori saat rendering kanvas di peramban seluler",
    ],
    deliverablesEn: [
      "Multi-format responsive flyer templates (Square, Portrait, Story, Landscape, Print A4)",
      "Interactive property input form with instant WYSIWYG preview",
      "Dynamic QR code generator linking directly to virtual tours or brochures",
      "High-resolution production export (PNG, JPEG, & 300 DPI print-ready PDF)",
      "Memory leak prevention during canvas rasterization on mobile browsers",
    ],
  },
  {
    phase: 6,
    titleId: "Pusat Proyek Terpadu & Riwayat Dokumen",
    titleEn: "Unified Project Hub & Document History",
    category: "workspace",
    status: "completed",
    targetDateId: "02 April 2027",
    targetDateEn: "April 02, 2027",
    quarter: "Q2 2027",
    sprintDurationId: "Selesai · Terverifikasi",
    sprintDurationEn: "Shipped · Verified",
    gateId: "Paginasi stabil, verifikasi kepemilikan tenant, operasi duplikasi/pemulihan teruji",
    gateEn: "Stable pagination, tenant ownership validation, tested duplicate/restore operations",
    descriptionId:
      "Sentralisasi seluruh aset pemasaran properti yang pernah dibuat, galeri preset kustom, serta modul sensor foto properti berbasis instruksi.",
    descriptionEn:
      "Consolidates all past marketing assets, custom preset gallery, and directive-guided property photo editor.",
    features: [
      {
        nameId: "Hub Repositori Proyek Agen",
        nameEn: "Centralized Agent Project Repository",
        tag: "Asset Hub",
        descriptionId:
          "Satu arsip rapi untuk seluruh draf listing, brosur flyer, dan pesan WhatsApp dengan filter status (Draft, Published, Archived).",
        descriptionEn:
          "Unified folder archive storing all property listing drafts, generated flyers, and outreach sequences with status filtering.",
        spec: "Server-side pagination with full-text search indexing on location and price tags",
      },
      {
        nameId: "Duplikasi Proyek 1-Klik & Tempat Sampah",
        nameEn: "1-Click Project Cloning & Recycle Bin Protection",
        tag: "Workflow",
        descriptionId:
          "Duplikasi proyek lama saat mendapatkan unit serupa di klaster yang sama, serta proteksi penghapusan tidak sengaja dengan masa tenggang 30 hari.",
        descriptionEn:
          "Rapidly clone existing listings for similar units within the same residential cluster, protected by 30-day soft-delete restore.",
        spec: "Tenant-isolated batch mutations with transactional rollbacks",
      },
    ],
    deliverablesId: [
      "Repositori proyek terpadu untuk menyimpan listing, pesan, dan flyer",
      "Sistem template favorit dan preset kustomisasi agen",
      "Pencarian cepat listing berdasarkan alamat, harga, dan tipe properti",
      "Riwayat revisi, duplikasi proyek instan, dan tempat sampah pemulihan",
      "Paginasi server-side efisien untuk menangani ratusan arsip listing",
    ],
    deliverablesEn: [
      "Centralized project repository storing listings, messages, and flyers",
      "Favorite templates and agent preset configurations",
      "Instant property search by address, price range, and property classification",
      "Revision history, rapid project cloning, and recovery recycle bin",
      "Efficient server-side pagination engineered for large listing portfolios",
    ],
  },
  {
    phase: 7,
    titleId: "Manajemen Kuota, Paket Langganan & Ledger",
    titleEn: "Quota Management, Plan Tiers & Ledger Billing",
    category: "production",
    status: "completed",
    targetDateId: "30 April 2027",
    targetDateEn: "April 30, 2027",
    quarter: "Q2 2027",
    sprintDurationId: "Selesai · Terverifikasi",
    sprintDurationEn: "Shipped · Verified",
    gateId: "Rekonsiliasi ledger transaksi kuota tanpa selisih, siklus reset periode anti-manipulasi",
    gateEn: "Zero-delta quota ledger reconciliation, tamper-resistant cycle resets",
    descriptionId:
      "Transparansi penuh atas pemakaian komputasi agen dengan penghitungan kuota transaksional yang adil.",
    descriptionEn:
      "Full transparency over compute consumption with guaranteed transactional quota tracking.",
    features: [
      {
        nameId: "Ledger Kuota Transaksional Anti-Selisih",
        nameEn: "Transactional Zero-Leak Usage Ledger",
        tag: "Billing",
        descriptionId:
          "Sistem pembukuan kuota dua langkah (reserve-commit-release) sesuai kontrak Phase 0; kuota tidak akan hangus jika request gagal di tengah jalan.",
        descriptionEn:
          "Two-phase reservation and settlement ledger built on the Phase 0 UsageService contract; tokens are safely refunded if generations abort.",
        spec: "Idempotent reservation IDs preventing duplicate charges during network retries",
      },
      {
        nameId: "Matriks Paket Langganan & Portal Mandiri",
        nameEn: "Plan Tier Matrix & Self-Service Portal",
        tag: "Entitlements",
        descriptionId:
          "Daftar kuota transparan untuk 4 paket: Free (eksplorasi), Starter (agen independen), Pro (top producer), dan Team (kantor broker).",
        descriptionEn:
          "Granular quota allowances across Free (trial), Starter (solo agent), Pro (high volume), and Team (brokerage office) tiers.",
        spec: "Visual progress meters for AI requests, flyer exports, and storage GBs",
      },
    ],
    deliverablesId: [
      "Dasbor visual pemakaian kuota AI, ekspor flyer, dan kuota penyimpanan",
      "Konfigurasi paket transparan (Free, Starter, Pro, Team)",
      "Mekanisme reservasi kuota transaksional anti double-spend",
      "Rekonsiliasi otomatis pemakaian kuota terhadap batas bulanan",
      "Integrasi portal penagihan mandiri dan faktur digital",
    ],
    deliverablesEn: [
      "Visual quota consumption metrics for AI generations, exports, and storage",
      "Transparent plan tier matrix (Free, Starter, Pro, Team)",
      "Transactional reservation preventing double-spend during concurrent requests",
      "Automated ledger reconciliation against monthly billing cycles",
      "Self-service billing portal and digital invoice access",
    ],
  },
  {
    phase: 8,
    titleId: "Audit Keamanan, Performa & Aksesibilitas WCAG",
    titleEn: "Security Hardening, Performance & WCAG Accessibility",
    category: "production",
    status: "completed",
    targetDateId: "28 Mei 2027",
    targetDateEn: "May 28, 2027",
    quarter: "Q2 2027",
    sprintDurationId: "Selesai · Terverifikasi",
    sprintDurationEn: "Shipped · Verified",
    gateId: "Seluruh temuan keamanan kritis tertutup, skor aksesibilitas AA terpenuhi",
    gateEn: "All critical vulnerability findings closed, WCAG AA accessibility compliance met",
    descriptionId:
      "Pemeriksaan ketat untuk memastikan ruang kerja agen aman bagi data nasabah, secepat kilat, dan ramah disabilitas.",
    descriptionEn:
      "Rigorous quality gating guaranteeing client confidentiality, rapid response times, and universal accessibility.",
    features: [
      {
        nameId: "Penetrasi Audit Database RLS & Sanitasi Input",
        nameEn: "Comprehensive RLS Penetration & Input Sanitization",
        tag: "Security",
        descriptionId:
          "Pengujian keamanan mendalam untuk mencegah serangan XSS, SQLi, dan kebocoran data antar agensi properti yang berbeda.",
        descriptionEn:
          "In-depth vulnerability scan checking cross-tenant isolation, SVG payload sanitization, and SQL injection barriers.",
        spec: "Zero critical CVE vulnerabilities and validated CSP (Content Security Policy) headers",
      },
      {
        nameId: "Akselerasi Core Web Vitals & Kepatuhan WCAG AA",
        nameEn: "Core Web Vitals Tuning & WCAG AA Compliance",
        tag: "Performance",
        descriptionId:
          "Waktu muat awal di bawah 1.5 detik pada jaringan 4G seluler, rasio kontras warna 4.5:1, dan dukungan pembaca layar penuh.",
        descriptionEn:
          "Sub-1.5s load times on 4G cellular links, verified 4.5:1 text contrast ratios, and complete screen-reader compatibility.",
        spec: "LCP < 2.5s, CLS < 0.1, INP < 150ms with 100% keyboard accessibility",
      },
    ],
    deliverablesId: [
      "Audit penetrasi mendalam pada RLS database dan sanitasi input",
      "Optimasi Core Web Vitals (LCP < 2.5s, CLS < 0.1, INP < 200ms)",
      "Audit aksesibilitas kontras warna dan navigasi pembaca layar (Screen Reader)",
      "Rangkaian automated end-to-end regression tests",
      "Sanitasi payload ekspor dan proteksi terhadap SVG/HTML injection",
    ],
    deliverablesEn: [
      "Comprehensive penetration audit across database RLS and input sanitization",
      "Core Web Vitals performance tuning (LCP < 2.5s, CLS < 0.1, INP < 200ms)",
      "Full accessibility review for contrast ratios and screen-reader tree traversal",
      "Automated end-to-end integration and regression test harness",
      "Export payload sanitization and defense against SVG/HTML injection vectors",
    ],
  },
  {
    phase: 9,
    titleId: "Penyebaran Multi-Stage, Domain & Monitoring",
    titleEn: "Staging Pipeline, Custom Domain & Telemetry",
    category: "production",
    status: "completed",
    targetDateId: "25 Juni 2027",
    targetDateEn: "June 25, 2027",
    quarter: "Q2 2027",
    sprintDurationId: "Selesai · Terverifikasi",
    sprintDurationEn: "Shipped · Verified",
    gateId: "Smoke test otomatis lulus pada lingkungan staging dan produksi",
    gateEn: "Automated smoke tests clean on both staging and production runtime environments",
    descriptionId:
      "Infrastruktur rilis profesional yang memastikan platform selalu tersedia 24/7 bagi kantor agen properti.",
    descriptionEn:
      "Production-grade release infrastructure ensuring 24/7 reliability for professional agency operations.",
    features: [
      {
        nameId: "Pipeline Deployment Bertahap (Staging → Produksi)",
        nameEn: "Automated Staging to Production Pipeline",
        tag: "DevOps",
        descriptionId:
          "Alur rilis kode terotomatisasi dengan pengujian smoke-test mandiri sebelum promosi ke domain produksi utama.",
        descriptionEn:
          "Continuous delivery pipeline with automated test gating before promoting staging releases to the live domain.",
        spec: "Zero-downtime rolling updates with instant rollback capabilities",
      },
      {
        nameId: "Domain Kustom Agensi & Monitoring Uptime 24/7",
        nameEn: "Agency Custom Domain Routing & Uptime Telemetry",
        tag: "Infrastructure",
        descriptionId:
          "Dukungan domain mandiri kantor broker properti, pembaruan sertifikat SSL otomatis, dan sistem alert galat real-time.",
        descriptionEn:
          "Custom agency domain mapping with automated SSL renewals, real-time error telemetry, and server uptime monitoring.",
        spec: "99.9% uptime SLA target with automated daily database snapshots",
      },
    ],
    deliverablesId: [
      "Alur CI/CD otomatis staging ke produksi terpisah",
      "Konfigurasi DNS custom domain dan sertifikat SSL/TLS mutakhir",
      "Pengaturan redirect HTTPS dan sanitasi header HTTP aman",
      "Sistem pemantauan uptime dan pelacakan galat real-time",
      "Uji pemulihan data berkala dari snapshot cadangan",
    ],
    deliverablesEn: [
      "Automated multi-stage CI/CD pipeline separating staging from production",
      "Custom DNS domain provisioning with automated SSL/TLS renewal",
      "Strict HTTPS redirection and security response header fortification",
      "Real-time uptime health checking and exception monitoring",
      "Scheduled restore rehearsals from automated database snapshots",
    ],
  },
  {
    phase: 10,
    titleId: "Beta Komersial, Onboarding Agen & Dukungan",
    titleEn: "Commercial Beta, Agent Onboarding & Operations",
    category: "production",
    status: "completed",
    targetDateId: "30 Juli 2027",
    targetDateEn: "July 30, 2027",
    quarter: "Q3 2027",
    sprintDurationId: "Selesai · Peluncuran Komersial",
    sprintDurationEn: "Shipped · Commercial Launch",
    gateId: "Persetujuan uji kelompok pengguna beta, prosedur backup dan dukungan siap",
    gateEn: "Validation from active beta cohort, backup recovery routines, and operational support operationalized",
    descriptionId:
      "Tahap pembuktian pasar di mana agen properti mengoperasikan Codematt Agent untuk closing transaksi nyata.",
    descriptionEn:
      "Market deployment phase empowering real estate professionals to run daily marketing workflows and close listings.",
    features: [
      {
        nameId: "Program Beta Tertutup Agensi Properti",
        nameEn: "Closed Commercial Beta with Real Estate Cohorts",
        tag: "Commercial",
        descriptionId:
          "Pengujian operasional langsung dengan kelompok agen properti terpilih untuk memvalidasi kecepatan closing dan efektivitas iklan.",
        descriptionEn:
          "Pilot deployment with verified agency cohorts to measure listing creation speed and lead response rates.",
        spec: "Structured feedback loops, agent satisfaction metrics, and cost economics review",
      },
      {
        nameId: "Panduan Onboarding Mandiri Cepat (3 Menit)",
        nameEn: "3-Minute Fast-Track Agent Onboarding",
        tag: "Onboarding",
        descriptionId:
          "Alur orientasi interaktif yang memandu agen mulai dari pengaturan logo kantor hingga ekspor flyer dan deskripsi listing pertama.",
        descriptionEn:
          "Interactive wizard guiding new agents from agency branding to their first published listing flyer in under 3 minutes.",
        spec: "Self-service knowledge base, best-practice playbooks, and priority support desk",
      },
    ],
    deliverablesId: [
      "Peluncuran beta tertutup bersama kelompok agen properti terpilih",
      "Panduan orientasi interaktif langkah-demi-langkah bagi pengguna baru",
      "Pusat bantuan mandiri & panduan praktik terbaik pemasaran properti",
      "Pemberlakuan kepatuhan privasi data dan perlindungan informasi listing",
      "Saluran bantuan prioritas dan evaluasi biaya komputasi per pengguna",
    ],
    deliverablesEn: [
      "Closed commercial beta launch with selected property agency cohorts",
      "Interactive step-by-step onboarding walkthrough for new agents",
      "Self-service knowledge base & property marketing playbooks",
      "Data privacy governance and client confidential information safeguarding",
      "Dedicated priority support channel and per-agent compute unit economics review",
    ],
  },
];

export function Roadmap() {
  const [locale, setLocale] = useState<"id" | "en">("id");
  const [selectedPhase, setSelectedPhase] = useState<number>(0);
  const [filterCategory, setFilterCategory] = useState<
    "all" | "foundation" | "workspace" | "intelligence" | "production"
  >("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"timeline" | "matrix">("timeline");
  const [showArtifactsModal, setShowArtifactsModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"features" | "deliverables">(
    "features"
  );

  // Filtered list based on category and search query
  const filteredMilestones = useMemo(() => {
    return ROADMAP_DATA.filter((m) => {
      const matchesCategory =
        filterCategory === "all" || m.category === filterCategory;
      const title = locale === "id" ? m.titleId : m.titleEn;
      const desc = locale === "id" ? m.descriptionId : m.descriptionEn;
      const deliverables = (
        locale === "id" ? m.deliverablesId : m.deliverablesEn
      ).join(" ");
      const features = m.features
        .map((f) =>
          `${f.nameId} ${f.nameEn} ${f.descriptionId} ${f.descriptionEn} ${f.tag} ${f.spec || ""}`
        )
        .join(" ");

      const matchesSearch =
        searchQuery.trim() === "" ||
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deliverables.toLowerCase().includes(searchQuery.toLowerCase()) ||
        features.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.targetDateId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.targetDateEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.quarter.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `phase ${m.phase}`.includes(searchQuery.toLowerCase()) ||
        `fase ${m.phase}`.includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [filterCategory, searchQuery, locale]);

  // Current active inspection item
  const activeMilestone = useMemo(() => {
    return (
      ROADMAP_DATA.find((m) => m.phase === selectedPhase) || ROADMAP_DATA[0]
    );
  }, [selectedPhase]);

  // Calculations for overall progress
  const totalPhases = ROADMAP_DATA.length;
  const completedPhases = ROADMAP_DATA.filter(
    (m) => m.status === "completed"
  ).length;
  const progressPercent = Math.round((completedPhases / totalPhases) * 100);

  const getStatusBadge = (status: PhaseStatus) => {
    switch (status) {
      case "completed":
        return {
          label: locale === "id" ? "Tuntas & Terverifikasi" : "Completed & Verified",
          class: "text-emerald-700 dark:text-emerald-300 font-semibold",
          dot: "bg-emerald-600 dark:bg-emerald-400",
        };
      case "next":
        return {
          label: locale === "id" ? "Fase Berikutnya" : "Next Milestone",
          class: "text-amber-700 dark:text-amber-300 font-semibold",
          dot: "bg-amber-600 dark:bg-amber-400",
        };
      case "planned":
      default:
        return {
          label: locale === "id" ? "Direncanakan" : "Planned",
          class: "text-[var(--muted)] font-normal",
          dot: "bg-[var(--muted)]/50",
        };
    }
  };

  const getCategoryLabel = (cat: PhaseMilestone["category"]) => {
    switch (cat) {
      case "foundation":
        return locale === "id" ? "Fondasi & Auth" : "Foundation & Auth";
      case "workspace":
        return locale === "id" ? "Workspace & UI" : "Workspace & UI";
      case "intelligence":
        return locale === "id" ? "AI & Konten" : "AI & Content";
      case "production":
        return locale === "id" ? "Produksi & Skala" : "Production & Scale";
    }
  };

  return (
    <div className="w-full mt-12 mb-16 space-y-8" id="roadmap">
      {/* Header Bar: Title, Progress Metric, & Bilingual Switcher */}
      <div className="border border-[var(--border)] bg-[var(--surface)] rounded-2xl p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[var(--border)]">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[var(--accent)] uppercase mb-2">
              <Milestone className="w-4 h-4" />
              <span>
                {locale === "id"
                  ? "Peta Jalan Pengembangan"
                  : "Engineering Roadmap"}
              </span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums font-mono">Phase 0 – 10 (2026–2027)</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--text)]">
              {locale === "id"
                ? "Jadwal & Spesifikasi Fitur Tiap Fase"
                : "Milestone Timelines & Feature Specs"}
            </h2>
            <p className="text-sm md:text-base text-[var(--muted)] max-w-2xl mt-1">
              {locale === "id"
                ? "Rencana bertahap lengkap dengan estimasi target rilis, arsitektur modul, dan kriteria gerbang kualitas sebelum promosi fase."
                : "Comprehensive execution roadmap with target delivery dates, technical specifications, and strict quality gate criteria."}
            </p>
          </div>

          {/* Controls: Language toggle & View switcher */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center p-1 bg-[var(--bg)] border border-[var(--border)] rounded-lg">
              <button
                type="button"
                onClick={() => setLocale("id")}
                aria-pressed={locale === "id"}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  locale === "id"
                    ? "bg-[var(--surface)] text-[var(--text)] shadow-xs"
                    : "text-[var(--muted)] hover:text-[var(--text)]"
                }`}
              >
                Bahasa ID
              </button>
              <button
                type="button"
                onClick={() => setLocale("en")}
                aria-pressed={locale === "en"}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  locale === "en"
                    ? "bg-[var(--surface)] text-[var(--text)] shadow-xs"
                    : "text-[var(--muted)] hover:text-[var(--text)]"
                }`}
              >
                English
              </button>
            </div>

            <div className="flex items-center p-1 bg-[var(--bg)] border border-[var(--border)] rounded-lg">
              <button
                type="button"
                onClick={() => setViewMode("timeline")}
                aria-label="Timeline view"
                className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  viewMode === "timeline"
                    ? "bg-[var(--surface)] text-[var(--text)] shadow-xs"
                    : "text-[var(--muted)] hover:text-[var(--text)]"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Timeline</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("matrix")}
                aria-label="Matrix view"
                className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  viewMode === "matrix"
                    ? "bg-[var(--surface)] text-[var(--text)] shadow-xs"
                    : "text-[var(--muted)] hover:text-[var(--text)]"
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Matrix</span>
              </button>
            </div>
          </div>
        </div>

        {/* Progress Strip & Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
            <span className="text-xs text-[var(--muted)]">
              {locale === "id" ? "Fase Aktif Saat Ini" : "Current Milestone"}
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-base sm:text-lg font-bold text-[var(--text)]">
                Phase 0 · Oct 2026
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Shipped
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
            <span className="text-xs text-[var(--muted)]">
              {locale === "id" ? "Target Fase Berikutnya" : "Next Milestone Target"}
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-base sm:text-lg font-bold text-[var(--text)]">
                Phase 1 · Nov 2026
              </span>
              <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                <ArrowRight className="w-3.5 h-3.5" /> Ready
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
            <div className="flex items-center justify-between text-xs text-[var(--muted)]">
              <span>{locale === "id" ? "Kemajuan Proyek" : "Overall Scope"}</span>
              <span className="tabular-nums font-mono font-bold text-[var(--text)]">
                1 / {totalPhases} ({progressPercent}%)
              </span>
            </div>
            <div className="w-full bg-[var(--border)] h-2 rounded-full mt-2.5 overflow-hidden">
              <div
                className="bg-[var(--accent)] h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Interactive Filter Toolbar & Search */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                locale === "id"
                  ? "Cari fase, tanggal (cth: Nov 2026), fitur (cth: QR, Supabase, safeRedirect, RLS)..."
                  : "Search phase, target dates (e.g. Nov 2026), features (e.g. QR, Supabase, safeRedirect, RLS)..."
              }
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] placeholder-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--muted)] hover:text-[var(--text)] px-1.5 py-0.5 rounded"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: "all", labelId: "Semua", labelEn: "All" },
              {
                id: "foundation",
                labelId: "Fondasi",
                labelEn: "Foundation",
              },
              {
                id: "workspace",
                labelId: "Workspace",
                labelEn: "Workspace",
              },
              {
                id: "intelligence",
                labelId: "AI",
                labelEn: "AI Core",
              },
              {
                id: "production",
                labelId: "Produksi",
                labelEn: "Production",
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterCategory(tab.id as typeof filterCategory)}
                className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  filterCategory === tab.id
                    ? "bg-[var(--accent)] text-white shadow-xs"
                    : "bg-[var(--bg)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)]"
                }`}
              >
                {locale === "id" ? tab.labelId : tab.labelEn}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Viewport: Either Timeline Track or Matrix Cards */}
      {viewMode === "timeline" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Milestone Track with Dates */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between px-1 text-xs text-[var(--muted)] font-medium">
              <span>{locale === "id" ? "Rangkaian Milestone" : "Milestone Sequence"}</span>
              <span className="tabular-nums">
                {filteredMilestones.length} {locale === "id" ? "fase" : "milestones"}
              </span>
            </div>

            <div className="space-y-2">
              {filteredMilestones.map((m) => {
                const isSelected = m.phase === selectedPhase;
                const statusInfo = getStatusBadge(m.status);
                return (
                  <button
                    key={m.phase}
                    type="button"
                    onClick={() => setSelectedPhase(m.phase)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                      isSelected
                        ? "bg-[var(--surface)] border-[var(--accent)] shadow-sm ring-1 ring-[var(--accent)]"
                        : "bg-[var(--surface)] border-[var(--border)] hover:border-[var(--muted)]/50"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5 ${
                        m.status === "completed"
                          ? "bg-emerald-600 text-white"
                          : m.status === "next"
                          ? "bg-amber-600 text-white"
                          : "bg-[var(--bg)] border border-[var(--border)] text-[var(--muted)]"
                      }`}
                    >
                      {m.phase}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        {/* Target Date & Quarter */}
                        <div className="flex items-center gap-1.5 text-xs text-[var(--accent)] font-medium tabular-nums">
                          <Calendar className="w-3 h-3 shrink-0" />
                          <span>
                            {locale === "id" ? m.targetDateId : m.targetDateEn}
                          </span>
                          <span className="text-[var(--muted)]">({m.quarter})</span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs shrink-0">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`}
                          />
                          <span className={statusInfo.class}>
                            {statusInfo.label}
                          </span>
                        </div>
                      </div>

                      <h3
                        className={`text-sm font-semibold mt-1.5 leading-snug line-clamp-1 ${
                          isSelected ? "text-[var(--text)]" : "text-[var(--text)]/90"
                        }`}
                      >
                        {locale === "id" ? m.titleId : m.titleEn}
                      </h3>

                      {/* Feature summary preview */}
                      <div className="flex items-center gap-2 mt-2 text-xs text-[var(--muted)]">
                        <span className="tabular-nums font-mono font-medium">
                          {m.features.length} {locale === "id" ? "fitur spesifik" : "features"}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="line-clamp-1">
                          {m.features.map((f) => (locale === "id" ? f.nameId : f.nameEn)).join(", ")}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}

              {filteredMilestones.length === 0 && (
                <div className="p-8 text-center border border-dashed border-[var(--border)] rounded-xl">
                  <p className="text-sm text-[var(--muted)]">
                    {locale === "id"
                      ? "Tidak ada fase yang cocok dengan kriteria pencarian."
                      : "No milestones matching your search criteria."}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setFilterCategory("all");
                    }}
                    className="mt-3 text-xs text-[var(--accent)] hover:underline font-semibold"
                  >
                    {locale === "id" ? "Reset filter" : "Reset filters"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Deep-Dive Inspector with Schedule & Feature Descriptions */}
          <div className="lg:col-span-7 sticky top-6">
            <div className="border border-[var(--border)] bg-[var(--surface)] rounded-2xl p-6 md:p-8 space-y-6">
              {/* Header of Inspector */}
              <div className="flex flex-col gap-3 pb-6 border-b border-[var(--border)]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-[var(--accent)] uppercase">
                    <span>Phase {activeMilestone.phase}</span>
                    <span aria-hidden="true">·</span>
                    <span>{getCategoryLabel(activeMilestone.category)}</span>
                    <span aria-hidden="true">·</span>
                    <span>{activeMilestone.quarter}</span>
                  </div>

                  <span
                    className={`text-xs px-2.5 py-1 rounded-md border ${
                      activeMilestone.status === "completed"
                        ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold"
                        : activeMilestone.status === "next"
                        ? "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-semibold"
                        : "bg-[var(--bg)] border-[var(--border)] text-[var(--muted)]"
                    }`}
                  >
                    {getStatusBadge(activeMilestone.status).label}
                  </span>
                </div>

                <h3 className="text-xl md:text-2xl font-bold text-[var(--text)] leading-tight">
                  {locale === "id"
                    ? activeMilestone.titleId
                    : activeMilestone.titleEn}
                </h3>

                {/* Milestone Date Strip */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--muted)] p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span className="font-semibold text-[var(--text)]">
                      {locale === "id" ? "Target Rilis:" : "Target Date:"}
                    </span>
                    <span className="tabular-nums font-medium">
                      {locale === "id"
                        ? activeMilestone.targetDateId
                        : activeMilestone.targetDateEn}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span className="font-semibold text-[var(--text)]">
                      {locale === "id" ? "Durasi Sprint:" : "Cadence:"}
                    </span>
                    <span>
                      {locale === "id"
                        ? activeMilestone.sprintDurationId
                        : activeMilestone.sprintDurationEn}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-[var(--muted)] leading-relaxed">
                  {locale === "id"
                    ? activeMilestone.descriptionId
                    : activeMilestone.descriptionEn}
                </p>
              </div>

              {/* Quality Gate Section */}
              <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--text)] tracking-wide uppercase">
                  <ShieldCheck className="w-4 h-4 text-[var(--accent)]" />
                  <span>
                    {locale === "id"
                      ? "Gerbang Kualitas (Quality Gate)"
                      : "Mandatory Quality Gate"}
                  </span>
                </div>
                <p className="text-sm text-[var(--text)] font-medium leading-relaxed pl-6">
                  {locale === "id"
                    ? activeMilestone.gateId
                    : activeMilestone.gateEn}
                </p>
              </div>

              {/* Tabs for Features vs Checklist Deliverables */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab("features")}
                      className={`text-xs font-bold uppercase tracking-wider pb-1 transition-colors border-b-2 -mb-[10px] ${
                        activeTab === "features"
                          ? "border-[var(--accent)] text-[var(--text)]"
                          : "border-transparent text-[var(--muted)] hover:text-[var(--text)]"
                      }`}
                    >
                      {locale === "id"
                        ? `Deskripsi Fitur Spesifik (${activeMilestone.features.length})`
                        : `Feature Specifications (${activeMilestone.features.length})`}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("deliverables")}
                      className={`text-xs font-bold uppercase tracking-wider pb-1 transition-colors border-b-2 -mb-[10px] ${
                        activeTab === "deliverables"
                          ? "border-[var(--accent)] text-[var(--text)]"
                          : "border-transparent text-[var(--muted)] hover:text-[var(--text)]"
                      }`}
                    >
                      {locale === "id"
                        ? `Checklist Deliverables (${activeMilestone.deliverablesId.length})`
                        : `Deliverable Checklist (${activeMilestone.deliverablesEn.length})`}
                    </button>
                  </div>
                </div>

                {/* Tab 1: Detailed Feature Descriptions */}
                {activeTab === "features" && (
                  <div className="space-y-3">
                    {activeMilestone.features.map((feat, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4 className="text-sm font-bold text-[var(--text)]">
                            {locale === "id" ? feat.nameId : feat.nameEn}
                          </h4>
                          <span className="text-[11px] font-medium text-[var(--accent)] bg-[var(--surface)] border border-[var(--border)] px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {feat.tag}
                          </span>
                        </div>

                        <p className="text-xs md:text-sm text-[var(--muted)] leading-relaxed">
                          {locale === "id"
                            ? feat.descriptionId
                            : feat.descriptionEn}
                        </p>

                        {feat.spec && (
                          <div className="pt-2 border-t border-[var(--border)] text-[11px] font-mono text-[var(--text)]/80 flex items-center gap-1.5">
                            <span className="font-semibold text-[var(--accent)]">
                              Spec:
                            </span>
                            <span>{feat.spec}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Tab 2: Itemized Checklist */}
                {activeTab === "deliverables" && (
                  <ul className="space-y-2.5">
                    {(locale === "id"
                      ? activeMilestone.deliverablesId
                      : activeMilestone.deliverablesEn
                    ).map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 p-3 rounded-lg bg-[var(--bg)]/70 border border-[var(--border)] text-xs md:text-sm text-[var(--text)]"
                      >
                        {activeMilestone.status === "completed" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        ) : activeMilestone.status === "next" ? (
                          <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-[var(--muted)]/40 shrink-0 mt-0.5" />
                        )}
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Verified Phase 0 Code Artifacts Inspector */}
              {activeMilestone.artifacts && (
                <div className="pt-2 border-t border-[var(--border)] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
                      {locale === "id"
                        ? "Artefak Kode Terverifikasi (Phase 0)"
                        : "Verified Code Artifacts (Phase 0)"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowArtifactsModal(!showArtifactsModal)}
                      className="text-xs text-[var(--accent)] font-semibold hover:underline flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>
                        {showArtifactsModal
                          ? locale === "id"
                            ? "Tutup rincian"
                            : "Hide details"
                          : locale === "id"
                          ? "Lihat rincian"
                          : "Inspect contracts"}
                      </span>
                    </button>
                  </div>

                  {showArtifactsModal ? (
                    <div className="space-y-2 pt-1">
                      {activeMilestone.artifacts.map((art, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-[var(--bg)] rounded-xl border border-[var(--border)] space-y-1"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-[var(--text)]">
                              {art.name}
                            </span>
                            <code className="font-mono text-[11px] text-[var(--muted)]">
                              {art.path}
                            </code>
                          </div>
                          <p className="text-xs text-[var(--muted)]">
                            {art.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[var(--muted)]">
                      {locale === "id"
                        ? "4 file kontrak modular telah terpasang di src/ tanpa error dependensi."
                        : "4 modular contracts and test files are deployed in src/ with zero runtime errors."}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Matrix View: Grid of cards with Dates and Feature Details */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMilestones.map((m) => {
            const statusInfo = getStatusBadge(m.status);
            return (
              <div
                key={m.phase}
                className={`p-6 rounded-2xl border transition-all flex flex-col justify-between ${
                  m.phase === selectedPhase
                    ? "bg-[var(--surface)] border-[var(--accent)] ring-1 ring-[var(--accent)]"
                    : "bg-[var(--surface)] border-[var(--border)] hover:border-[var(--muted)]"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[var(--bg)] border border-[var(--border)] font-mono font-bold text-xs flex items-center justify-center text-[var(--text)]">
                      {m.phase}
                    </span>
                    <span className={`text-xs ${statusInfo.class}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  <div>
                    {/* Date Tag */}
                    <div className="flex items-center gap-1.5 text-xs text-[var(--accent)] font-medium tabular-nums mb-1">
                      <Calendar className="w-3 h-3" />
                      <span>{locale === "id" ? m.targetDateId : m.targetDateEn}</span>
                      <span className="text-[var(--muted)]">· {m.quarter}</span>
                    </div>

                    <h3 className="text-base font-bold text-[var(--text)] line-clamp-2">
                      {locale === "id" ? m.titleId : m.titleEn}
                    </h3>
                  </div>

                  <p className="text-xs text-[var(--muted)] line-clamp-2 leading-relaxed">
                    {locale === "id" ? m.descriptionId : m.descriptionEn}
                  </p>

                  {/* Feature Highlights */}
                  <div className="space-y-1.5 pt-2 border-t border-[var(--border)]">
                    <span className="text-[11px] font-semibold text-[var(--text)] uppercase tracking-wider">
                      {locale === "id" ? "Fitur Utama" : "Key Features"}
                    </span>
                    <ul className="space-y-1 text-xs text-[var(--text)]/90">
                      {m.features.slice(0, 3).map((f, i) => (
                        <li key={i} className="flex items-center gap-1.5 line-clamp-1">
                          <CheckCheck className="w-3 h-3 text-[var(--accent)] shrink-0" />
                          <span className="line-clamp-1">
                            {locale === "id" ? f.nameId : f.nameEn}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-[var(--border)] space-y-1">
                    <span className="text-[11px] font-semibold text-[var(--text)] uppercase tracking-wider">
                      {locale === "id" ? "Gerbang Kualitas" : "Quality Gate"}
                    </span>
                    <p className="text-xs text-[var(--muted)] line-clamp-2">
                      {locale === "id" ? m.gateId : m.gateEn}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-[var(--border)] flex items-center justify-between">
                  <span className="text-xs text-[var(--muted)] font-mono tabular-nums">
                    {m.features.length} {locale === "id" ? "fitur" : "features"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPhase(m.phase);
                      setViewMode("timeline");
                    }}
                    className="text-xs font-semibold text-[var(--accent)] hover:underline flex items-center gap-1"
                  >
                    <span>{locale === "id" ? "Buka timeline" : "Inspect"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Callout: Next Concrete Step (Phase 1) */}
      <div className="p-6 md:p-8 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-[var(--text)]">
                {locale === "id"
                  ? "Instruksi Konkret Tahap Berikutnya: Phase 1 (Target: 15 November 2026)"
                  : "Immediate Next Action: Phase 1 UI Shell (Target: November 15, 2026)"}
              </h4>
              <p className="text-xs md:text-sm text-[var(--muted)]">
                {locale === "id"
                  ? "Navigasi responsif, layout dashboard dengan empty states jujur, tema light/dark/system, dan form auth."
                  : "Responsive navigation, honest dashboard empty states, theme preferences, and initial auth shell."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedPhase(1);
              setViewMode("timeline");
            }}
            className="px-4 py-2 bg-[var(--accent)] text-white text-xs font-semibold rounded-xl hover:opacity-90 transition-opacity whitespace-nowrap self-start sm:self-auto shrink-0 shadow-xs"
          >
            {locale === "id" ? "Pelajari Rencana Phase 1" : "Explore Phase 1 Scope"}
          </button>
        </div>
      </div>
    </div>
  );
}
