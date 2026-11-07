# Audit Tahap 2 Codematt Agent (2026-11-05)

Basis audit: `main@188c270403494b439349c6eff654363b1a24e74b`.
Perbaikan Tahap 2 ada di branch `feat/codematt-phase2-auth-api-hardening-20261105`.

## Ruang lingkup

### 1. Auth, session dan CSRF
- Autentikasi email/password melalui endpoint **resmi Supabase Auth** tetapi tetap **nonaktif secara bawaan**.
- Login menaruh access token berumur pendek pada cookie HttpOnly, Secure pada HTTPS, SameSite Lax, host-only.
- Tidak ada refresh token tersimpan. Setelah token kedaluwarsa, pengguna harus login ulang.
- Sesi tidak dipercaya dari cookie begitu saja; server melakukan GET /auth/v1/user pada Supabase Auth.
- Sign-up mengharuskan verifikasi sesuai konfigurasi proyek dan tidak otomatis membuat sesi.
- Mutasi sesi memeriksa Origin terhadap `APP_ORIGIN` yang ditetapkan di konfigurasi, **bukan Host/X-Forwarded-Host**; body divalidasi dan ukurannya dibatasi.
- Project Supabase diverifikasi terhadap `CODEMATT_SUPABASE_PROJECT_REF` sebelum autentikasi dapat diaktifkan.
- Cookie sesi tetap Secure pada produksi. Logout memanggil Supabase Auth untuk mencabut refresh session jika dapat dijangkau, kemudian selalu membersihkan cookie; access JWT dapat tetap berlaku hingga kedaluwarsa.
- Pembatasan percobaan login/registrasi per email per instans ditambahkan sebagai defense-in-depth, **bukan** rate limiter terpusat.
- `/account` menampilkan status akun server, terpisah dari `/dashboard` yang masih demo lokal.

**Belum untuk akses publik komersial:** perlu rate limiter persisten, pembatasan percobaan login, kebijakan password/reset, MFA bila diperlukan, audit log, pemulihan/refresh sesi yang ditinjau, dan uji dua akun nyata.

### 2. Model AI nyata, bukan keluaran palsu
- Dalam mode default, `/api/gateway` **tetap DEMO**.
- Dalam mode live yang diaktifkan secara eksplisit di server, akses wajib menggunakan token bearer server minimum 32 karakter.
- **Adapter terbatas:** Gemini 3.8 Flash dan OpenAI GPT-4o. ID lain ditolak dengan `MODEL_ADAPTER_NOT_CONNECTED`; **tidak dialihkan ke provider lain**.
- Panggilan model memakai batas karakter input dan output token; output dari provider digunakan tanpa klaim respons model lain.
- Token usage dari provider dicatat bila tersedia, tetapi nilai biaya dan margin **belum dihitung**. Nilai biaya nol dalam payload berarti **tidak ada perhitungan**, bukan gratis.
- JSON keluaran generator listing, follow-up, assistant dan konten divalidasi bentuknya sebelum ditampilkan.
- Tidak ada kunci provider ditaruh di browser atau GitHub.

**Belum untuk layanan pelanggan:** API pengguna, kuota berkelanjutan, rate limit lintas instans, billing, audit biaya, pemantauan abuse, dan konfigurasi model per pengguna masih membutuhkan implementasi dan pengujian.

### 3. Database
- Endpoint `/api/private/listings` hanya aktif jika Auth dan database diaktifkan.
- Identitas pengguna selalu diverifikasi server ke Supabase Auth; operasi PostgREST memakai token pengguna tersebut, **bukan service-role**.
- API tidak menerima `user_id` dari body untuk menentukan kepemilikan, melainkan memasukkan ID pengguna yang sudah diverifikasi.
- Skema RLS hanya berupa **draft yang belum diterapkan** di `docs/phase2-supabase-schema-review.sql`.
- Tidak ada database Codematt yang terbukti terhubung. Proyek lain (Brighton dan Hybrid Office) **tidak diubah**.
- UI listing lama masih menggunakan localStorage dan tidak otomatis tersinkronisasi ke database.

### 4. Stabilitas
- Tambahan unit test: validasi env auth dan URL, pemeriksaan Origin, durasi cookie, routing provider, parser respons, dan kontrak output.
- Smoke test: auth default fail closed, signup/login tidak aktif tanpa backend, CSRF, database belum aktif, logout dan security header.
- CI: lint nol warning, TypeScript, unit test, build produksi dan HTTP smoke. **Status PASS perlu diperoleh dari GitHub Actions; tidak boleh dinyatakan dari review statis.**

## Gate sebelum deployment backend produksi

1. Tentukan proyek Supabase khusus Codematt dan lakukan backup/test staging lebih dulu.
2. Jalankan review SQL (termasuk advisor RLS), uji policy dua akun A/B, lalu buat migrasi resmi via Supabase CLI.
3. Konfigurasikan domain/callback email confirmation, kebijakan Auth, proteksi brute force, dan dukungan sesi aman.
4. Tambahkan kuota AI persisten dan batas pengeluaran provider sebelum mengaktifkan live mode publik.
5. Uji Netlify preview, HTTPS/cookie, runtime API, isolasi pengguna, regresi UI, dan observabilitas.
6. Hanya aktifkan env live/backend setelah gate dipenuhi dan identitas site deployment terverifikasi.

## Environment baru
```text
APP_ORIGIN=https://codematt.example
CODEMATT_SUPABASE_PROJECT_REF=
CODEMATT_AUTH_ENABLED=false
CODEMATT_DATABASE_ENABLED=false
CODEMATT_ENABLE_LIVE_AI=false
CODEMATT_LIVE_AI_TOKEN=
CODEMATT_SUPABASE_URL=
CODEMATT_SUPABASE_PUBLISHABLE_KEY=
GEMINI_API_KEY=
OPENAI_API_KEY=
```

Tidak ada kredensial asli dalam repositori. Simpan hanya di pengaturan hosting/secret manager.

## Bukti referensi pengembangan
- Supabase SSR/auth https://supabase.com/docs/guides/auth/server-side/creating-a-client
- Supabase JavaScript getUser https://supabase.com/docs/reference/javascript/auth-getuser
- Supabase RLS https://supabase.com/docs/guides/database/postgres/row-level-security
- OpenAI Responses API https://developers.openai.com/api/reference/resources/responses/methods/create
- Google Gemini model docs https://ai.google.dev/gemini-api/docs/models

**Catatan arsitektur:** Implementasi sementara memakai REST dan cookie akses pendek tanpa refresh agar tidak menambah dependency atau mengubah lockfile dalam tahapan ini. Untuk sistem multi-pengguna yang stabil, migrasikan ke `@supabase/ssr` dengan cookie refresh rotation, review keamanan, versi yang dipin, dan lockfile terverifikasi sebelum aktivasi produksi.

## Pemeriksaan lanjutan (2026-11-06)

- Konfirmasi koneksi Supabase yang tersedia: hanya proyek Brighton dan Hybrid Office. **Tidak ditemukan proyek Codematt khusus; tidak ada SQL yang dijalankan.**
- Pengamanan live AI: `CODEMATT_LIVE_AI_MAX_CALLS_PER_INSTANCE` wajib 1 sampai 100, menghitung pemanggilan per provider (dua model pembanding dihitung dua), fail-closed jika belum disetel. Penghitungan ini hanya per proses, **bukan** persistent billing atau rate limit lintas instans. Tidak mengesahkan produksi.
- Helper `buildOwnedListingsUrl` dan `buildOwnedListingInsert` dipakai oleh endpoint dan diuji unit test supaya `user_id` tidak bisa diganti lewat body klien. **Hasil unit test bukan bukti RLS pada database live.**
- Harga simulasi Gemini 3.8 Flash dikoreksi sesuai tarif standar berbayar resmi per 6 November 2026 (input $0.75 dan output $3.75 per juta token; tarif berubah 1 Januari 2027). Sumber: https://ai.google.dev/gemini-api/docs/pricing.
- GPT-4o ditandai sebagai deprecated dalam katalog tanpa menghapus opsi demo lama. Sumber: https://developers.openai.com/api/docs/deprecations (penghentian terjadwal 14 Januari 2027).
- CI wajib kembali lulus pada SHA terbaru sebelum mengubah status PR atau mempertimbangkan merge. Tidak ada klaim pengujian integrasi eksternal karena belum tersedia lingkungan khusus.

## Verifikasi kebijakan RLS melalui PostgreSQL lokal (2026-11-07)

- GitHub Actions menjalankan PostgreSQL 17 sementara dengan role anon, authenticated, dan fixture auth.uid() uji, tanpa memakai kredensial Supabase.
- Draft docs/phase2-supabase-schema-review.sql diterapkan apa adanya pada database CI. Skrip tests/sql/01-rls-integration.sql menguji ENABLE/FORCE RLS, delapan policy, isolasi dua tenant, penolakan spoofing pemilik, akses silang, CRUD sendiri, anonim, dan subject JWT kosong.
- **Batas bukti:** pengujian ini membuktikan perilaku policy pada PostgreSQL lokal. Ini tidak menguji tanda tangan JWT, konfigurasi PostgREST/Data API di Supabase hidup, Auth produksi, atau provider spending limits.
- Uji kontrak REST dengan upstream Supabase tiruan terpisah dari uji SQL PostgreSQL. Keduanya tidak menggantikan uji A/B dua akun nyata pada proyek Codematt khusus.
- Tidak ada migrasi yang dijalankan ke proyek Brighton atau Hybrid Office. SQL tetap draft dan PR tetap draft sampai seluruh gate produksi dipenuhi.

## Audit lanjutan: live AI fail-closed contract (2026-11-07)

- Endpoint `/api/gateway` dan `/api/ai/generate` diuji ulang pada server Next.js CI dalam mode `CODEMATT_ENABLE_LIVE_AI=true`, memakai token dan kunci provider **dummy**.
- Tes HTTP baru `tests/live-ai-gates-smoke.mjs` memverifikasi: akses tanpa token/secret salah ditolak 401; provider yang belum memiliki adapter ditolak 501; model pembanding yang tidak didukung ditolak sebelum memanggil primary; seluruh model yang didukung ditolak 503 jika batas pemanggilan AI belum diatur.
- Kegagalan otorisasi dan provider setup untuk generator sekarang secara eksplisit mengirim `Cache-Control: no-store`.
- Tidak ada panggilan provider berbayar atau kredensial nyata dalam CI. Pengujian belum membuktikan kinerja model live, billing atau pengendalian penggunaan secara global di serverless.
- Batas penggunaan yang tersedia tetap **per proses** dan bukan substitusi distributed quota/rate limiting; jangan mengaktifkan live AI publik sampai batas global, pelacakan biaya dan kontrol penyalahgunaan terverifikasi.
