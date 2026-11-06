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
CODEMATT_AUTH_ENABLED=false
CODEMATT_DATABASE_ENABLED=false
CODEMATT_ENABLE_LIVE_AI=false
CODEMATT_LIVE_AI_TOKEN=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
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
