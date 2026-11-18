# Langganan, kuota, dan multi-AI

## Alur singkat

1. Agen login (Supabase Auth, cookie httpOnly).
2. Browser memanggil `/api/chat`, `/api/photo/detect`, atau `/api/photo/edit`.
3. Server memverifikasi user ke Supabase, membaca paket aktif (`codematt_subscriptions`), lalu:
   - menolak model yang tidak termasuk paket (HTTP 402, `PLAN_UPGRADE_REQUIRED`);
   - memotong 1 kuota lewat RPC `codematt_consume_quota` (atomik, idempoten);
   - memanggil Gemini / OpenAI / Anthropic;
   - mengembalikan kuota (`codematt_refund_quota`) jika penyedia AI gagal.
4. Halaman `/pricing` membuat order (`/api/billing/checkout`) dan mengarahkan ke Midtrans Snap.
5. Midtrans memanggil `/api/billing/midtrans/notification`. Server memverifikasi signature SHA512,
   mengecek ulang ke Status API Midtrans, lalu `codematt_mark_order_paid` mengaktifkan paket 30 hari.
   Nominal dibandingkan dengan order yang tersimpan; jika beda, order ditandai `review`.

## Paket (ubah di `src/config/plans.ts`)

| Paket | Harga / 30 hari | Model | Chat / bulan | Edit foto AI / bulan |
|---|---|---|---|---|
| Free | Gratis | Gemini | 30 | 3 |
| Starter | Rp49.000 | Gemini, ChatGPT | 300 | 30 |
| Pro | Rp149.000 | Gemini, ChatGPT, Claude | 1.500 | 150 |
| Team | Manual | Semua | 10.000 | 1.000 |

Harga ini placeholder. Hitung ulang dari biaya API per pengguna sebelum dipakai.
Deteksi otomatis memakai 1 kuota chat. Resize foto tidak memakai kuota.

## Langkah aktivasi

1. Buat proyek Supabase khusus Codematt. Jangan pakai proyek kantor yang sudah ada.
2. Jalankan `supabase/migrations/20261118000000_codematt_billing_quota.sql` di proyek itu.
3. Isi env (lihat `.env.example`): Auth, `CODEMATT_SUPABASE_SECRET_KEY`, API key AI, `CODEMATT_ENABLE_LIVE_AI=true`.
4. Di dashboard Midtrans (sandbox): isi Payment Notification URL `https://<domain>/api/billing/midtrans/notification`,
   lalu isi `MIDTRANS_SERVER_KEY`.
5. Pasang batas pengeluaran (spending limit) di dashboard Google AI Studio, OpenAI, dan Anthropic.
6. Uji: daftar 2 akun, bayar Starter di sandbox, cek Claude masih terkunci, habiskan kuota, cek reset.
7. Baru setelah itu set `MIDTRANS_IS_PRODUCTION=true` dengan server key produksi.

Paket Team diaktifkan manual oleh admin lewat SQL editor (insert ke `codematt_subscriptions`).

## Keamanan

- Browser hanya bisa membaca baris miliknya; semua penulisan lewat fungsi `SECURITY DEFINER`
  yang hanya bisa dieksekusi `service_role` (diuji di `tests/sql/02-billing-quota.sql`).
- Harga diambil dari konfigurasi server, bukan dari browser.
- Webhook tidak dipercaya mentah-mentah: signature + Status API + cek nominal.
- Foto dicek ukuran (maks 7 MB) dan magic bytes sebelum dikirim ke AI.
- Hanya area yang ditandai yang ditempel dari hasil AI; bagian lain foto tetap piksel asli.
