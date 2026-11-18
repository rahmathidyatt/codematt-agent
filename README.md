# Codematt Agent

**Status: beta tertutup. Fitur berbayar sudah ada kodenya, tetapi belum diuji dengan akun produksi.**

Ruang kerja AI untuk agen properti: chat dengan Gemini, ChatGPT, dan Claude; edit foto listing (resize, hapus nomor rumah/telepon); penulis listing, flyer, dan follow-up WhatsApp; paket langganan dengan pembayaran Midtrans. Jangan memasukkan data klien sensitif ke mode demo.

## Yang tersedia dan yang belum tersedia

| Fitur | Status | Keterangan |
|---|---|---|
| Workspace agen (listing, flyer, follow-up, brand kit) | Jalan | Data contoh disimpan di localStorage browser |
| Resize & kompres foto (portal, Instagram, story, WhatsApp) | Jalan | Di browser, gratis, tanpa AI |
| Chat multi-AI: Gemini, ChatGPT, Claude (`/assistant`) | Siap diuji | `/api/chat`; model dikunci sesuai paket |
| Deteksi & hapus nomor rumah / telepon / plat (`/photo-editor`) | Siap diuji | Gemini vision + Gemini/OpenAI image edit; hanya area yang ditandai yang diganti |
| Paket Free / Starter / Pro / Team + kuota bulanan (`/pricing`) | Siap diuji | Kuota di Postgres lewat RPC atomik |
| Pembayaran Midtrans Snap | Siap diuji | Prabayar 30 hari, tanpa auto-debit |
| Login Supabase Auth | Siap diuji | Opt-in lewat env |
| Katalog model & dashboard biaya (`/api/gateway`) | Demo | Angka perkiraan, bukan tagihan |

"Siap diuji" = kode dan test sudah ada, tetapi belum dicoba dengan API key, proyek Supabase, dan akun Midtrans sungguhan. Tanpa env, semua fitur AI otomatis berjalan sebagai **mode demo** (tidak ada panggilan berbayar). Detail alur dan langkah aktivasi: [docs/BILLING.md](docs/BILLING.md).

## Persyaratan

- Node.js 24
- Bun versi terbaru yang mendukung `bun.lock`

Repositori ini memakai **`bun.lock`**, bukan `package-lock.json`; gunakan Bun agar instalasi dapat diulang dengan konsisten.

```bash
bun install --frozen-lockfile
bun run dev
```

Buka `http://localhost:3000`.

## Pengujian sebelum deployment

```bash
bun run check
bun run build
bun run start
```

`check` menjalankan ESLint, TypeScript, dan unit test. Workflow `.github/workflows/quality.yml` menjalankan pemeriksaan yang sama untuk pull request dan `main`. Tidak ada hasil pengujian yang diklaim PASS sebelum GitHub Actions benar-benar melaporkannya.

## Konfigurasi environment

Lihat `.env.example`. Simpan nilai asli hanya di variabel environment server/hosting, tidak di Git.

- `CODEMATT_ENABLE_LIVE_AI=false` secara default. Untuk `/api/chat` dan `/api/photo/*`, mode live juga butuh Supabase Auth + `CODEMATT_SUPABASE_SECRET_KEY` (kuota). Tanpa itu server menolak (fail closed).
- `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`: isi yang dipakai saja. Model bisa diganti lewat `CODEMATT_*_MODEL`.
- `MIDTRANS_SERVER_KEY` dan `MIDTRANS_IS_PRODUCTION` untuk pembayaran.
- `CODEMATT_LIVE_AI_TOKEN` (khusus endpoint lama `/api/gateway` dan `/api/ai/generate`) adalah token server-to-server minimum 32 karakter, tidak boleh dikirim ke browser. Pengaktifannya saja **tidak menggantikan autentikasi, rate limit persisten, ataupun perhitungan biaya riil**.
- `GEMINI_API_KEY` hanya untuk jalur Gemini yang sudah diberi izin server.
- `APP_ORIGIN` harus alamat asal HTTPS aplikasi yang sebenarnya saat hosting, bukan domain internal Netlify. `CODEMATT_SUPABASE_PROJECT_REF` harus identik dengan subdomain proyek Supabase khusus Codematt. Gunakan `CODEMATT_SUPABASE_URL` dan `CODEMATT_SUPABASE_PUBLISHABLE_KEY` khusus di server, bukan prefiks `NEXT_PUBLIC_`, untuk menghindari ketergantungan konfigurasi runtime pada nilai build browser.
- Panggilan Auth memiliki pembatasan percobaan per instans sebagai pertahanan tambahan. Sistem produksi masih memerlukan rate limit terpusat dan uji dua akun.

## Deployment

`netlify.toml` menyediakan konfigurasi build Next.js untuk Netlify. Hubungkan repositori ini ke site Netlify yang dipilih, periksa build log dan URL preview dahulu. Jangan menjadikan situs demo sebagai platform pelanggan yang menerima login, data klien, atau tagihan hingga gate keamanan, auth, RLS, rate limit, dan pemeriksaan end-to-end selesai.

## Dokumentasi

Lihat `docs/BILLING.md`, `docs/ARCHITECTURE.md`, `docs/DATABASE.md`, `docs/RISKS.md`, `docs/ROADMAP.md`, dan `docs/VERIFICATION.md`. Sebagian berisi rancangan fase terdahulu, bukan bukti bahwa seluruh fitur kini benar-benar berfungsi.

## Tahap 2: verifikasi tambahan

- Mode live membutuhkan `CODEMATT_LIVE_AI_MAX_CALLS_PER_INSTANCE` sebesar 1 sampai 100. Tanpa itu, panggilan berbayar ditolak. Batas ini **per proses** dan tidak menggantikan kontrol biaya/provider spending limit maupun kuota persisten untuk serverless.
- Query listing privat dibatasi ke `user_id` pengguna yang diverifikasi lewat Supabase Auth. **Uji RLS dua akun secara nyata belum tersedia** dan harus dilakukan sebelum aktivasi database.
- Katalog Gemini 3.8 Flash menggunakan **tarif referensi standar per 6 November 2026**, bukan invoice dan bukan harga permanen. Tarif berbayar resmi berubah pada 1 Januari 2027: https://ai.google.dev/gemini-api/docs/pricing.
- GPT-4o masih ada demi kompatibilitas UI lama, tetapi sudah deprecated dengan rencana penghentian API 14 Januari 2027: https://developers.openai.com/api/docs/deprecations. Sebelum go-live, pilih model pengganti yang terverifikasi.

### Uji RLS otomatis (PostgreSQL runner saja)

Workflow CI menjalankan tests/sql/00-bootstrap.sql, draft docs/phase2-supabase-schema-review.sql, dan tests/sql/01-rls-integration.sql pada PostgreSQL 17 sementara di GitHub Actions. Uji ini memeriksa regresi policy menggunakan dua pengguna uji, CRUD sendiri, akses tenant lain dan anonim. **Tidak** memakai atau memodifikasi proyek Supabase nyata dan **tidak** membuktikan konfigurasi Auth/Data API produksi. Sebelum deployment, lakukan uji dua akun sungguhan pada proyek Codematt khusus, advisor RLS dan review migrasi.

## Netlify preview deployment (manual)

Rilis demo dipersiapkan melalui GitHub Actions `Netlify Codematt Demo Preview (manual)`. Workflow ini secara default hanya memeriksa metadata site Netlify. Opsi `preview` baru dapat digunakan setelah pemilik menghubungkan site ke repo Codematt/main dan menyimpan `CODEMATT_NETLIFY_SITE_ID` serta `CODEMATT_NETLIFY_AUTH_TOKEN` sebagai GitHub Actions secrets. Preflight menolak jika feature flags Auth, Database, atau Live AI terkonfigurasi aktif. **Tidak ada deployment otomatis atau `--prod` di workflow ini.** Petunjuk: [docs/NETLIFY_DEMO_RELEASE.md](docs/NETLIFY_DEMO_RELEASE.md).
