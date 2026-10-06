# Codematt Agent — keputusan arsitektur Phase 0

Status: fondasi pengembangan, belum siap menerima pelanggan berbayar.
Dokumen ini mendefinisikan desain target; kemampuan yang sudah ada tercatat di README.

## Analisis kebutuhan
Produk berfokus pada pekerjaan agen: input fakta properti → hasil siap diedit → simpan/ekspor.
Form terstruktur, identitas agen, serta template flyer menjadi pembeda dari chat umum.
Bahasa awal Indonesia dan Inggris. Mobile adalah target utama; desktop memakai sidebar.
Jangan mencampur kesiapan arsitektur dengan fitur yang sudah aktif.

## Keputusan stack
Satu repositori Next.js App Router + TypeScript strict + Tailwind. Server Components secara default;
Client Components hanya untuk interaksi. Supabase Auth/PostgreSQL/Storage pada Phase 2.
OpenAI API melalui server pada Phase 3. Netlify pada Phase 9, menggunakan adapter Next.js.
Tidak memakai static export karena autentikasi dan AI membutuhkan server.
Node 24 dipilih untuk lingkungan lokal dan build yang konsisten.
Versi paket aktual dipasang dengan --save-exact dan dikunci package-lock.json.
TypeScript dipilih pada seri 6 karena parser lint yang terpasang belum mendukung seri 7.
ESLint 9 dikunci sementara karena plugin React dalam eslint-config-next belum kompatibel dengan ESLint 10.
Paket ESLint 9 mengeluarkan peringatan deprecated: evaluasi upgrade kompatibel sebelum beta.
SDK Supabase/OpenAI baru ditambahkan ketika integrasinya diimplementasikan.
Tidak ada kebutuhan microservices, Redis, message broker, atau ORM tambahan di Phase 0.

## Batas sistem
Browser → Next.js route/server action → layanan fitur → Supabase atau OpenAI.
UI tidak memperoleh secret provider atau service-role database.
Route handler mengurus HTTP, verifikasi aktor, input, dan pemetaan error.
Layanan fitur mengurus workflow; adapter mengurus provider; komponen mengurus tampilan.
Database RLS tetap berlaku walaupun validasi server gagal.
Identitas pemilik diambil dari sesi terverifikasi, tidak dipercaya dari body request.
Tidak ada akun admin bawaan atau sandi default.

## Struktur folder
| Path | Tanggung jawab |
|---|---|
| src/app | Routing, layout, metadata, route handlers |
| src/components/ui | Komponen kecil bersama, ditambahkan saat dibutuhkan |
| src/components/layout | Sidebar, mobile drawer, app bar (Phase 1) |
| src/features/auth, brand, assistant, listing, followup, content | Workflow masing-masing fitur |
| src/features/flyer | Dokumen flyer, template, preview dan export |
| src/lib/ai | Kontrak, provider server, prompt/version, parsing |
| src/lib/auth, database, storage | Integrasi eksternal (Phase 2+) |
| src/lib/security | Validasi keamanan bersama |
| src/lib/billing | Reservasi penggunaan dan entitlement |
| src/config | Identitas produk, konfigurasi terpusat |
| src/i18n | Kamus bahasa bertipe |
| tests | Pengujian logika kritis |
| supabase/migrations | Migrasi SQL versi waktu |
| docs | Keputusan, model data, risiko, roadmap |

Folder masa depan tidak dibuat sebagai kumpulan kode kosong. Kontrak mendeskripsikan kemampuan,
bukan fungsi dummy yang mengembalikan keberhasilan.

## Route target
Publik: /, /features, /pricing, /privacy, /terms.
Auth: /login, /signup, /forgot-password, /reset-password, /auth/callback.
Privat: /dashboard, /assistant, /flyer, /listing, /followup, /content, /leads,
/knowledge, /templates, /brand, /usage, /settings.
Admin ditambahkan nanti dan memerlukan otorisasi server tersendiri.
Seluruh route privat noindex, data pengguna no-store; HTML atau respons ber-cookie tidak boleh
masuk cache publik. Pada Phase 0 hanya / tersedia dan seluruhnya noindex.

## Autentikasi
Gunakan @supabase/ssr dengan browser client dan server client berbasis cookie.
Proxy menyegarkan sesi; setiap operasi privat tetap melakukan verifikasi server.
Gunakan getClaims untuk verifikasi identitas; getUser bila membutuhkan record pengguna terbaru.
Jangan memakai getSession sebagai otorisasi. Logout harus menghapus sesi melalui mekanisme SDK.
Cookie mengikuti integrasi SSR resmi, Secure pada HTTPS dan SameSite sesuai alur;
jangan mengklaim semua cookie HttpOnly jika browser SDK perlu membacanya.
Reset password memakai callback allowlist dan redirect internal yang tervalidasi.
Role disimpan terpisah dari profil yang bisa diedit; jangan percaya user_metadata untuk admin.
Tidak ada secret autentikasi yang dikelola manual di localStorage.
Uji signup, konfirmasi email, login salah/benar, refresh, logout, expiry dan reset pada Phase 2.

## AI
Pipeline: verifikasi sesi → validasi Zod/batas payload → rate limit → entitlement → reservasi
kuota atomik → kompilasi prompt versi → provider → validasi hasil → pencatatan → finalisasi kuota.
Prompt berada di modul server-only; percakapan dan dokumen diperlakukan sebagai data tidak tepercaya.
Kontrak AiService tidak mengunci UI pada nama model. Model wajib dikonfigurasi server dan diuji
sebelum rilis; jangan menerima model/cost/owner pilihan klien.
Gunakan Responses API dengan output schema ketika hasil terstruktur diperlukan; implementasi
mengikuti dokumentasi resmi saat Phase 3. Streaming assistant dapat ditambahkan tanpa mengubah
kontrak hasil listing. Tangani refusal, output terpotong, JSON invalid, timeout dan disconnect.
Simpan fakta input terpisah dari copy. Nilai yang kosong tetap kosong; jangan membuat harga,
sertifikat, alamat, promo, availability, atau jaminan pengembang. Ingatkan verifikasi sebelum publikasi.
Retry hanya terbatas untuk kegagalan sementara; tidak retry membabi buta pada timeout ambigu.
Catat request ID dan provider usage bila tersedia. Jangan mengasumsikan token nol saat tidak diketahui.

## Penggunaan dan paket
Plan Free/Starter/Pro/Team didefinisikan terpusat nanti; nominal harga dan kuota belum diputuskan.
Team hanya identitas rencana masa depan, belum dijual atau diaktifkan.
Counter memori serverless dan localStorage tidak cukup. Gunakan transaksi Postgres + penguncian
baris bucket pengguna/periode. Reserve memeriksa used + reserved + requested <= limit.
Kunci idempotensi unik (user_id, request_key) mencegah satu permintaan dibukukan dua kali.
State: reserved → committed/released; timeout setelah provider mungkin memproses → uncertain.
Rekonsiliasi uncertain sebelum melepaskan reservasi. Batasi jumlah permintaan bersamaan.
Periode awal bulan UTC, tampilan dikonversi ke zona pengguna; perubahan periode tidak menghapus log.
Pembatasan dasar wajib Phase 3. Phase 7 menambahkan halaman pemakaian dan manajemen paket.

## Flyer Studio
Template programatik; foto properti milik pengguna. FlyerDocument versi 1 disimpan sebagai JSON
layout yang tervalidasi, bukan HTML bebas. Template diberi ID dan versi agar proyek lama stabil.
Ukuran: 1080×1080, 1080×1350, 1080×1920, 1200×628; A4 PDF 210×297 mm,
pratinjau raster A4 2480×3508 piksel pada sekitar 300 DPI.
Satu spesifikasi layout dipakai preview dan export; teks dapat diedit dan diukur agar tidak terpotong.
Phase 5 mulai dengan template Minimal, kemudian Modern/Luxury/Corporate dan variasi pemasaran.
Editor pertama: teks, foto utama, warna, alignment, bidang tampil, CTA dan ukuran; tanpa drag-and-drop.
PNG/JPEG serta PDF menggunakan renderer yang di-load hanya pada editor. QR memakai URL tervalidasi
https/wa.me; hasil harus diuji scan. Tunggu font dan decode gambar sebelum export.
Render di browser untuk mengurangi biaya; cap megapiksel, ekspor satu per satu, lepaskan object URL.
Jika A4 melebihi memori perangkat, tampilkan error yang jelas; worker/server export dapat menyusul.
Tidak menerima arbitrary remote URL: unggahan aman atau signed URL aset pengguna saja.
Brand Kit dipakai sebagai default; snapshot konten merekam identitas yang dipakai saat proyek disimpan.

## MVP dan penundaan
MVP: auth, profil/settings, brand kit, dashboard, assistant, listing/followup/content,
flyer dasar, template pribadi, penyimpanan riwayat, kuota dan pengaturan.
Tunda: pembayaran, CRM penuh/kanban, tim, admin lengkap, RAG, generative image,
drag-and-drop, kampanye otomatis, WhatsApp Business Platform.
Knowledge/Leads dapat menampilkan status belum tersedia; jangan mengunggah dokumen ke indeks palsu.
WhatsApp awal hanya salin atau tautan pesan dengan tindakan eksplisit pengguna.

## Sumber teknis
Diperiksa saat penyusunan; periksa kembali sebelum setiap integrasi.
- https://nextjs.org/docs/app/getting-started/installation
- https://supabase.com/docs/guides/auth/server-side/creating-a-client
- https://supabase.com/docs/reference/javascript/auth-getclaims
- https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/
