# Arsitektur database — desain target, belum dimigrasikan

UUID untuk primary key; timestamptz created_at/updated_at, trigger updated_at pada baris mutable.
Semua FK user mengarah auth.users(id) dengan ON DELETE CASCADE untuk data pribadi.
Uang memakai numeric(18,2) + currency, bukan float. Ukuran properti numeric positif;
telepon string. Tanggal kontak timestamptz. Nilai tidak diketahui NULL, bukan angka nol rekaan.

| Entitas | Kolom inti dan relasi | Phase |
|---|---|---|
| profiles | id PK/FK auth.users, display_name, avatar_asset_id | 2 |
| user_settings | user_id PK, locale CHECK id/en, theme CHECK light/dark/system, timezone | 2 |
| brand_kits | id, user_id UNIQUE, agent_name, phone, whatsapp, email, instagram, office_name, company, photo_asset_id, logo_asset_id, primary_color, secondary_color, default_cta | 2 |
| assets | id, user_id, bucket, object_path UNIQUE, mime_type, byte_size, width, height, status | 2 |
| user_roles | user_id, role CHECK agent/admin; UNIQUE(user_id, role); hanya sistem | 2 |
| conversations | id, user_id, title, locale, tone | 3 |
| messages | id, user_id, conversation_id, role, content, generation_id, sequence; UNIQUE(conversation_id,sequence) | 3 |
| ai_generations | id, user_id, request_key, task, prompt_version, model, status, input_tokens nullable, output_tokens nullable, provider_request_id | 3 |
| subscriptions | id, user_id UNIQUE, plan_id, status, period_start, period_end; writer sistem | 3 dasar, 7 lengkap |
| usage_buckets | user_id, metric, period_start, used, reserved; composite PK | 3 |
| usage_reservations | id, user_id, request_key, metric, amount, state, expires_at; UNIQUE(user_id, request_key) | 3 |
| usage_records | id, user_id, reservation_id, metric, quantity, generation_id; ledger append-only | 3 |
| listings | id, user_id, name, type, transaction_type, location, price, currency, land_size, building_size, bedrooms, bathrooms, floors, parking, certificate, furnishing, condition, facilities, highlights, notes | 4 |
| followups | id, user_id, lead_id nullable, lead_type, scenario, tone, locale, input_context, result, generation_id | 4 |
| content_projects | id, user_id, platform, goal, audience, tone, locale, result, generation_id | 4 |
| listing_outputs | id, user_id, listing_id, variant, headline, description, key_features, cta, generation_id | 4 |
| flyer_templates | id, version, name, layout_spec JSONB, status; UNIQUE(id,version), writer sistem | 5 |
| flyer_projects | id, user_id, listing_id nullable, template_id, template_version, document JSONB, export_asset_id nullable | 5 |
| templates | id, user_id, category, title, content, is_favorite, source_template_id nullable | 6 |
| leads | id, user_id, name, phone, email, source, property_interest, budget_min, budget_max, preferred_location, status, notes, last_contact, next_followup | nanti |
| knowledge_sources | id, user_id, asset_id, title, ingestion_status, verification_status, checksum | nanti |

JSONB hanya untuk layout berversi dan payload fleksibel; bukan menggantikan seluruh relasi.
Daftar fasilitas/highlight bisa text[]; data yang butuh pengelolaan mandiri dipisah kemudian.
System templates terpisah dari templates pribadi agar kolom pemilik tidak ambigu.
Database generated types dibuat dari schema nyata, bukan manual cast yang menutupi ketidaksesuaian.

## Isolasi tenant dan FK
Setiap tabel privat memiliki RLS sebelum grant diberikan. SELECT/DELETE USING auth.uid() = user_id;
INSERT WITH CHECK sama; UPDATE membutuhkan USING dan WITH CHECK. profiles memakai id = auth.uid().
Tidak memberikan akses anon ke data privat. Jangan menggunakan service-role untuk request CRUD biasa.
Child record harus memakai composite FK (parent_id,user_id) REFERENCES parent(id,user_id),
dengan UNIQUE(id,user_id) pada parent. Ini mencegah pesan/listing output/flyer menunjuk record akun lain.
Berlaku juga untuk asset/brand/lead references milik pengguna. Template sistem tidak membutuhkan tenant FK.
Jangan mengandalkan RLS child saja untuk menjamin parent milik user yang sama.

user_roles: pengguna dapat membaca role sendiri bila dibutuhkan; tidak ada INSERT/UPDATE/DELETE client.
subscriptions, usage_* dan ai_generations: read milik sendiri, semua penulisan sistem terkontrol.
Profil tidak memiliki kolom plan/admin yang dapat dimodifikasi pengguna.
RPC SECURITY DEFINER jika diperlukan harus menetapkan search_path eksplisit, memverifikasi auth.uid,
menolak aktor mismatch, serta mencabut EXECUTE dari public/anon. Audit sebelum production.
Admin lintas akun harus melalui endpoint khusus dengan pemeriksaan role dan audit trail.

## Indeks dan constraint
Index (user_id,created_at DESC) untuk daftar proyek/riwayat; (user_id,updated_at DESC) untuk recent.
messages(conversation_id,sequence); leads(user_id,next_followup); usage_records(user_id,created_at).
CHECK byte_size >= 0, token >= 0 bila tidak NULL, amount > 0, periode akhir > awal.
Lead status enum/check: new, contacted, interested, viewing, negotiation, won, lost.
Role message dibatasi; pengguna tidak boleh menyisipkan system message melalui API.
Pagination cursor (created_at,id) untuk list besar; jangan mengambil semua dataset dashboard.

## Storage
Bucket privat per kategori atau satu bucket privat dengan prefix user_id/category/UUID.ext.
Kebijakan storage.objects memeriksa bucket dan segmen pemilik auth.uid().
Gunakan signed URL berumur pendek. Jangan menyimpan signed URL permanen di database; simpan object path.
Validasi ekstensi, ukuran, MIME dan magic bytes. Decode/re-encode JPEG/PNG/WebP;
tolak SVG/HTML untuk gambar, cap dimensi dan jumlah piksel. Abaikan nama asli sebagai nama object.
Gunakan status pending/ready untuk upload. Rekonsiliasi upload yatim dan usage storage.
Knowledge PDF nanti membutuhkan pipeline ekstraksi terisolasi; bukan membuka file sebagai kode.

## Migrasi dan penghapusan
Phase 2 membuat migration awal untuk entitas akun, assets dan RLS saja. Tabel fitur muncul pada phasenya.
Gunakan staging + backup sebelum migration produksi; rollback melalui migration kompensasi yang ditinjau.
Penghapusan akun memerlukan job penghapusan object storage, bukan mengandalkan FK database.
Tetapkan retention percakapan, log, backup, dan ledger sebelum beta; jangan menjanjikan penghapusan
backup seketika. Billing record minimum yang wajib dipertahankan diputuskan saat pembayaran ditambahkan.

## Gate pengujian Phase 2/3
Dua pengguna A/B: B tidak dapat list/read/update/delete data A, tidak dapat insert child ke parent A,
tidak dapat memindah user_id, tidak dapat mengangkat role atau plan, dan tidak bisa membaca object A.
Anon ditolak. Uji jalur REST/RPC langsung, bukan hanya UI. Uji signup trigger rollback dan hapus akun.
Phase 3: banyak reserve simultan tidak boleh melewati kuota; retry idempotent tidak menduplikasi ledger;
reserve uncertain tidak dilepas tanpa rekonsiliasi.
