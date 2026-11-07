# Codematt Agent

**Status: prototipe / demonstrasi, belum siap dipakai sebagai sistem produksi komersial.**

Proyek Next.js ini berisi katalog model AI, antarmuka ruang kerja multi-model, alat konten dan flyer properti, dashboard telemetri, serta UI login dan pendaftaran. Sebagian fitur menggunakan data contoh atau penyimpanan lokal browser. Jangan memasukkan data klien sensitif ke mode demo.

## Yang tersedia dan yang belum tersedia

- **UI katalog dan perbandingan model:** dapat dicoba sebagai DEMO. Endpoint `/api/gateway` tidak berpura-pura memanggil OpenAI/Anthropic/DeepSeek/Meta; outputnya secara eksplisit diberi label demonstrasi, dengan pemakaian dan biaya token nol.
- **Generator konten properti:** mode bawaan hanya menyusun draf berdasarkan fakta yang diberikan. Tidak menambahkan detail properti yang tidak tersedia. Draf harus diverifikasi sebelum publikasi.
- **Live Gemini:** jalur server telah disiapkan untuk `/api/ai/generate`, tetapi **dinonaktifkan secara bawaan**. Belum ada autentikasi pengguna, kuota persisten, billing, maupun perlindungan komersial secara menyeluruh. Jangan aktifkan live API pada situs publik sebelum backend pengamanan selesai.
- **Login dan registrasi:** adapter server ke Supabase Auth tersedia secara **opt-in** dan secara default nonaktif. Tanpa konfigurasi `CODEMATT_AUTH_ENABLED`, `APP_ORIGIN`, project ref, dan publishable key yang sesuai, formulir akun tetap nonaktif; akses Mode Demo terpisah. Belum diuji terhadap proyek Codematt yang nyata.
- **API key klien, dashboard biaya, dan donasi:** hanya contoh UI / perkiraan, tidak menerbitkan credential, menagih pengguna, atau memproses pembayaran.
- **Data listing, ledger dan profil:** sebagian diisi contoh dan tersimpan di localStorage, bukan database multi-tenant yang aman.

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

- `CODEMATT_ENABLE_LIVE_AI=false` secara default
- `CODEMATT_LIVE_AI_TOKEN` adalah token server-to-server minimum 32 karakter, tidak boleh dikirim ke browser. Pengaktifannya saja **tidak menggantikan autentikasi, rate limit persisten, ataupun perhitungan biaya riil**.
- `GEMINI_API_KEY` hanya untuk jalur Gemini yang sudah diberi izin server.
- `APP_ORIGIN` harus alamat asal HTTPS aplikasi yang sebenarnya saat hosting, bukan domain internal Netlify. `CODEMATT_SUPABASE_PROJECT_REF` harus identik dengan subdomain proyek Supabase khusus Codematt. Gunakan `CODEMATT_SUPABASE_URL` dan `CODEMATT_SUPABASE_PUBLISHABLE_KEY` khusus di server, bukan prefiks `NEXT_PUBLIC_`, untuk menghindari ketergantungan konfigurasi runtime pada nilai build browser.
- Panggilan Auth memiliki pembatasan percobaan per instans sebagai pertahanan tambahan. Sistem produksi masih memerlukan rate limit terpusat dan uji dua akun.

## Deployment

`netlify.toml` menyediakan konfigurasi build Next.js untuk Netlify. Hubungkan repositori ini ke site Netlify yang dipilih, periksa build log dan URL preview dahulu. Jangan menjadikan situs demo sebagai platform pelanggan yang menerima login, data klien, atau tagihan hingga gate keamanan, auth, RLS, rate limit, dan pemeriksaan end-to-end selesai.

## Dokumentasi

Lihat `docs/ARCHITECTURE.md`, `docs/DATABASE.md`, `docs/RISKS.md`, `docs/ROADMAP.md`, dan `docs/VERIFICATION.md`. Sebagian berisi rancangan fase terdahulu, bukan bukti bahwa seluruh fitur kini benar-benar berfungsi.

## Tahap 2: verifikasi tambahan

- Mode live membutuhkan `CODEMATT_LIVE_AI_MAX_CALLS_PER_INSTANCE` sebesar 1 sampai 100. Tanpa itu, panggilan berbayar ditolak. Batas ini **per proses** dan tidak menggantikan kontrol biaya/provider spending limit maupun kuota persisten untuk serverless.
- Query listing privat dibatasi ke `user_id` pengguna yang diverifikasi lewat Supabase Auth. **Uji RLS dua akun secara nyata belum tersedia** dan harus dilakukan sebelum aktivasi database.
- Katalog Gemini 3.8 Flash menggunakan **tarif referensi standar per 6 November 2026**, bukan invoice dan bukan harga permanen. Tarif berbayar resmi berubah pada 1 Januari 2027: https://ai.google.dev/gemini-api/docs/pricing.
- GPT-4o masih ada demi kompatibilitas UI lama, tetapi sudah deprecated dengan rencana penghentian API 14 Januari 2027: https://developers.openai.com/api/docs/deprecations. Sebelum go-live, pilih model pengganti yang terverifikasi.

### Uji RLS otomatis (PostgreSQL runner saja)

Workflow CI menjalankan tests/sql/00-bootstrap.sql, draft docs/phase2-supabase-schema-review.sql, dan tests/sql/01-rls-integration.sql pada PostgreSQL 17 sementara di GitHub Actions. Uji ini memeriksa regresi policy menggunakan dua pengguna uji, CRUD sendiri, akses tenant lain dan anonim. **Tidak** memakai atau memodifikasi proyek Supabase nyata dan **tidak** membuktikan konfigurasi Auth/Data API produksi. Sebelum deployment, lakukan uji dua akun sungguhan pada proyek Codematt khusus, advisor RLS dan review migrasi.
