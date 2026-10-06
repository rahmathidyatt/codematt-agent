# Codematt Agent — Phase 0
AI Workspace for Real Estate Agents · by codematt

Fondasi untuk aplikasi komersial agen properti. **Ini belum MVP atau aplikasi siap produksi.**
Phase 0 berhenti pada arsitektur, konfigurasi, halaman pemeriksaan dan kontrak layanan.
Belum ada akun/login aktif, API AI, database, upload, dashboard, atau editor flyer.
Tidak ada email/sandi bawaan. Tidak perlu API key untuk menjalankan fase ini.

## Mulai di VS Code (Windows)
1. Ekstrak ZIP terlebih dahulu, misalnya ke `D:\Projects\codematt-agent`.
2. Buka VS Code → File → Open Folder → pilih folder **codematt-agent** yang berisi `package.json`.
   Jangan memilih folder induk atau menjalankan proyek langsung dari ZIP.
3. Pilih Terminal → New Terminal. Semua perintah berikut dijalankan di terminal VS Code tersebut.
4. Pastikan Node.js 24 terpasang. Cek `node --version` dan `npm --version`.
   Jika npm tidak dikenali, pasang Node 24 lalu tutup dan buka kembali VS Code.
5. Jalankan:

```bash
npm ci
npm run dev
```

Buka http://localhost:3000 pada browser. Jika port dipakai, gunakan URL yang dicetak terminal.
Hasil: halaman “Ruang kerja yang dimulai dengan fondasi tepat.” dengan status Phase 0.
Tekan Ctrl+C pada terminal untuk menghentikan server.
Jika PowerShell memblokir npm.ps1, gunakan `npm.cmd ci` dan `npm.cmd run dev`, atau pilih terminal
Command Prompt di dalam VS Code. Tidak perlu mengubah execution policy sistem.

## Pemeriksaan
```bash
npm run check
npm run build
npm start
```
`check` menjalankan ESLint, Next typegen + TypeScript strict, serta unit test redirect.
`build` membangun produksi; `start` membuka hasil build lokal.
Jangan menjalankan dev dan start bersamaan pada port yang sama.
Unit test memeriksa pencegahan open redirect. Auth/RLS/AI belum dapat diuji karena belum diimplementasikan.
Hasil pemeriksaan saat pembuatan paket dicatat pada docs/VERIFICATION.md.

## File yang dibuat
- Root: package.json, package-lock.json, tsconfig.json, next-env.d.ts, next.config.ts,
  eslint.config.mjs, postcss.config.mjs, netlify.toml, .nvmrc, .gitignore, .env.example.
- src/app: layout.tsx, page.tsx, globals.css.
- src/config/product.ts dan src/i18n/dictionaries.ts.
- src/lib: server-env.ts, ai/contracts.ts, billing/contracts.ts, security/redirect.ts.
- src/features/flyer/contracts.ts; tests/redirect.test.mjs.
- docs: ARCHITECTURE.md, DATABASE.md, RISKS.md, ROADMAP.md, VERIFICATION.md.
- supabase/migrations/README.md dan README ini.
Semua file baru; tidak ada kode lama yang ditimpa.

## Environment
.env.example hanya berisi nama variabel. Phase 0 tidak membutuhkannya.
Pada fase integrasi, salin ke .env.local dan isi lewat editor lokal; jangan kirim secret ke chat atau GitHub.
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY merupakan key publik untuk client, tetap membutuhkan RLS.
OPENAI_API_KEY dan OPENAI_MODEL hanya server. APP_ORIGIN untuk origin/callback yang diizinkan.
Service-role key tidak disediakan karena belum ada operasi administratif yang memerlukannya.
File .env.local tidak masuk Git; .env.example boleh. Jangan menyimpan password pengguna sendiri.

## Membaca desain
1. docs/ARCHITECTURE.md: kebutuhan, struktur, auth, AI, flyer dan batas MVP.
2. docs/DATABASE.md: tabel, constraint, RLS, storage, migration dan gate A/B.
3. docs/RISKS.md: keamanan/performance dan bukti sebelum rilis.
4. docs/ROADMAP.md: Phase 0–10 dan tugas Phase 1 yang konkret.

## Git (opsional setelah pengujian)
Untuk folder baru yang belum menjadi repositori:
```bash
git init
git add .
git commit -m "chore: initialize Codematt Agent phase 0 foundation"
```
Jangan jalankan git init bila sudah di dalam repositori proyek. Remote GitHub tidak dibuat otomatis.
Pastikan .env.local dan node_modules tidak ikut staging sebelum commit.

## Langkah berikutnya
Setelah halaman lokal tampil dan pemeriksaan lolos, lanjut **Phase 1** berdasarkan docs/ROADMAP.md:
landing page, shell aplikasi, navigasi responsif, pilihan tema, dashboard empty states, dan UI autentikasi.
Tetap gunakan folder ini. Supabase/login aktif baru di Phase 2; AI baru di Phase 3.
Deployment Netlify baru Phase 9. netlify.toml saat ini hanya persiapan konfigurasi.
