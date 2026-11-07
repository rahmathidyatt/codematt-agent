# Codematt Agent: gerbang rilis demo Netlify

Status 7 November 2026: PR Phase 2 sudah merged ke main; Quality Gate lulus. **Publikasi Netlify belum diverifikasi.** Jangan mengklaim produk komersial sudah siap.

## Tujuan

Menyiapkan preview aman di Netlify sebelum menerbitkan website demo. Ini **bukan** aktivasi login pengguna sungguhan, penyimpanan database Supabase, atau pemanggilan AI berbayar.

## Satu kali konfigurasi oleh pemilik akun

1. Buka https://app.netlify.com dan temukan project **Codematt Agent**. Jika belum ada, pilih **Add new project → Import an existing project**, hubungkan GitHub **rahmathidyatt/codematt-agent**, dan pilih branch **main**. Jangan menghubungkan ke site milik proyek lain.
2. Di **Project configuration → General → Project information**, salin **Project ID** (UUID). Pastikan Git repository dan production branch menunjuk ke Codematt/main, bukan Brighton atau Hybrid Office.
3. Di pengaturan **Environment variables** Netlify, periksa semua context yang berlaku. Ketiga variabel berikut **harus tidak ada atau bernilai string `false`**: `CODEMATT_AUTH_ENABLED`, `CODEMATT_DATABASE_ENABLED`, `CODEMATT_ENABLE_LIVE_AI`. Jangan masukkan provider API keys atau Supabase secrets sebelum gate backend terpisah selesai.
4. Buat **personal access token Netlify** dengan izin cukup untuk site ini dari akun Anda. **Jangan** memasukkan token di chat, commit, screenshot, atau issue publik.
5. Buka GitHub repository → **Settings → Secrets and variables → Actions** dan buat dua repository secrets:
   - `CODEMATT_NETLIFY_SITE_ID`: Project ID dari langkah 2.
   - `CODEMATT_NETLIFY_AUTH_TOKEN`: token dari langkah 4.

## Menjalankan gerbang preview

1. Pastikan PR yang menambah workflow `.github/workflows/netlify-preview.yml` sudah di-merge dan Quality Gate main lulus.
2. GitHub → **Actions → Netlify Codematt Demo Preview (manual) → Run workflow** pada branch **main**.
3. Pilih `preflight` lebih dulu. Ini **hanya membaca** metadata project Netlify dan daftar nama/nilai boolean tiga feature flags; kode tidak mencetak env secrets ke log.
4. Jika lulus, jalankan ulang dengan opsi `preview`. Ini menjalankan `netlify-cli@27.16.2 deploy --remote` (tanpa `--prod`), memakai kredensial dari GitHub Secrets. Remote build dapat memakai build minutes/credits sesuai paket Netlify Anda.
5. Catat **preview HTTPS URL dari log CLI**. Uji dengan perintah:

```bash
DEPLOY_BASE_URL=https://preview-benar-anda.netlify.app node tests/deployment-smoke.mjs
```

Skrip harus memastikan homepage 200, health endpoint bekerja, respons AI tetap DEMO, Auth disabled, database disabled, dan header keamanan tersedia. Periksa juga tampilan desktop dan mobile secara manual.

## Syarat sebelum produksi

- Preview lulus HTTP dan pemeriksaan desktop/mobile, tidak ada provider AI live atau data klien.
- Pastikan runtime/Functions pada Netlify benar-benar menggunakan flags demo-only.
- Pastikan build Netlify (adapter OpenNext) berhasil, bukan hanya `next build` lokal di CI.
- Verifikasi identitas site, URL final, build commit main, dan status publishing/lock di dashboard Netlify.
- Publikasi produksi harus mengikuti kontrol dan approval akun Netlify. **Workflow ini tidak mempunyai opsi deploy produksi**, sehingga penekanan tombol preview tidak akan mengganti situs produksi.

## Catatan keamanan

Preflight menolak site yang tidak tertaut ke GitHub Codematt/main, build yang dihentikan, atau salah satu feature flag yang aktif/tidak dapat diverifikasi. Kunci/token Netlify hanya tersimpan pada GitHub Actions secrets. Pemanggilan API preflight hanya `GET` dan tidak mengubah setting site.

Jika preflight gagal, jangan menonaktifkan proteksi agar tes terlihat hijau. Periksa alasan kesalahan di log, selesaikan pada Netlify, kemudian jalankan ulang. Jangan menggunakan database proyek lain untuk Codematt.
