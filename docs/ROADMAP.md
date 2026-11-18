# Roadmap Codematt Agent

Status per 18 November 2026. Versi sebelumnya mengklaim "100% selesai / beta komersial live"; klaim itu tidak sesuai kondisi kode dan sudah dihapus.

| Fitur | Status | Catatan |
|---|---|---|
| Workspace agen (listing, flyer, follow-up, brand kit) | Selesai | Data contoh di localStorage |
| Resize & kompres foto | Selesai | Di browser, gratis |
| Login Supabase Auth | Siap diuji | Opt-in lewat env |
| Chat multi-AI (Gemini, ChatGPT, Claude) | Siap diuji | `/api/chat`, butuh API key |
| Deteksi & hapus nomor rumah/telepon (AI) | Siap diuji | `/api/photo/detect`, `/api/photo/edit` |
| Paket + kuota bulanan | Siap diuji | Migrasi `supabase/migrations/20261118000000_codematt_billing_quota.sql`, uji SQL di CI |
| Pembayaran Midtrans Snap | Siap diuji | Uji sandbox end-to-end dulu |
| Listing & foto tersimpan per akun | Direncanakan | |
| Auto-debit / perpanjangan otomatis | Direncanakan | |
| Paket Team | Direncanakan | Aktivasi manual |

"Siap diuji" berarti kodenya ada dan unit/SQL test lulus, tetapi belum dicoba dengan API key, proyek Supabase, dan akun Midtrans yang nyata.
