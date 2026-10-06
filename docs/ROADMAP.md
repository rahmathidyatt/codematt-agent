# Roadmap implementasi

| Phase | Hasil | Gate sebelum lanjut |
|---|---|---|
| 0 | Arsitektur, schema target, konfigurasi, halaman foundation, kontrak | Lint/typecheck/test/build dan panduan lokal |
| 1 | Landing ringkas, shell, sidebar/drawer, dashboard empty states, theme light/dark/system, UI auth | Mobile 360px, keyboard, navigasi; auth belum diklaim aktif |
| 2 | Supabase auth, profiles, settings, Brand Kit, storage, migration RLS | Login/reset/logout dan uji A/B; secret dikonfigurasi pengguna |
| 3 | Provider AI, prompt versioning, assistant/history dasar, kuota & rate limit minimum | Sesi + concurrency + timeout/refusal + cost cap |
| 4 | Listing Writer, Follow-up, Content Studio, validasi dua sisi | Fakta properti terjaga; hasil bisa edit/copy/save |
| 5 | Flyer template, form, preview, ukuran, PNG/JPEG/PDF, QR | Output dimensi benar, teks utuh, QR scan, mobile memory |
| 6 | Saved projects terpadu, custom/favorite templates, recent/history | Pagination, ownership, duplicate/delete/restore editing |
| 7 | Usage UI, entitlement dan plan configuration lengkap | Rekonsiliasi ledger, reset periode, tamper protection |
| 8 | Audit keamanan, performance, aksesibilitas, integrasi/E2E | Seluruh temuan kritis ditutup |
| 9 | Netlify staging → produksi, env, domain/callback, monitoring | Smoke test end-to-end pada runtime deployment |
| 10 | Beta komersial terbatas, onboarding, support, kebijakan data, evaluasi biaya | Pengujian pengguna, backup/recovery, harga dan limit terkonfirmasi |

Pembayaran dan Team bukan prasyarat Phase 0 dan tidak dibuat diam-diam.
Fitur dasar penyimpanan mengikuti modulnya; Phase 6 menyatukan pengelolaan, bukan menunda semua persistence.

## Phase 1 berikutnya — instruksi konkret
Gunakan folder codematt-agent dari ZIP ini sebagai basis. Baca README dan dokumen arsitektur.
Pertahankan konfigurasi dan kontrak yang lolos pemeriksaan. Jangan menjalankan seluruh roadmap sekaligus.
Buat komponen layout/UI, kamus lengkap ID/EN untuk halaman baru, navigation config, serta grup route
marketing/auth/workspace. Pindahkan halaman foundation ke dokumentasi, ganti / dengan landing page.
Dashboard menggunakan empty states tanpa angka atau aktivitas fiktif. CTA modul yang belum tersedia
harus menjelaskan statusnya. UI auth harus jelas belum terhubung sampai Phase 2.
Tema pilihan pengguna disimpan sebagai preferensi non-sensitif; default system, hindari flash tema.
Desktop sidebar; mobile drawer dengan focus management dan tombol tutup yang dapat diakses keyboard.
Jalankan lint, typecheck, test, build; cek layout pada mobile/tablet/desktop.
Akhiri dengan daftar file, perintah, hasil yang diharapkan, commit dan rencana Phase 2.
