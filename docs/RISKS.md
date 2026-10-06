# Risiko dan gate rilis

| Risiko | Mitigasi desain | Bukti yang wajib sebelum rilis |
|---|---|---|
| IDOR/data antar akun | RLS, verified actor, composite FK | Uji A/B melalui API langsung |
| Eskalasi admin/paket | Tabel role/paket server-write only | Upaya manipulasi ditolak |
| Biaya AI/abuse | Rate limit persisten, reserve atomik, token/input cap, timeout | Uji concurrency/idempotency; limit biaya provider |
| Prompt injection/hallucination | Dokumen sebagai data, tools tidak diberi otoritas tak perlu, output schema, fakta terpisah | Kasus adversarial; harga kosong tidak diisi rekaan |
| XSS | React escaping, tanpa arbitrary HTML; sanitasi bila markdown ditambahkan | Payload HTML/URL berbahaya |
| CSRF/session | Origin/Host check untuk mutasi cookie, token CSRF jika lintas situs diperlukan; SSR SDK | POST cross-origin ditolak; expiry/logout |
| Open redirect | Allowlist callback, safeRedirect | Unit test + callback integration |
| Secret exposure | server-only, env non-public, redaksi log | Periksa bundle dan secret scan |
| Upload/SSRF | Magic bytes, cap piksel/byte, private assets; jangan fetch URL bebas | File palsu/berlebih/antar akun ditolak |
| Privasi leads | Minimisasi data, private cache, deletion workflow | Audit cache/log dan hapus akun/storage |
| SQL injection | Query parameterized, tidak membangun SQL dari input | Review RPC/query |
| Cold start/serverless | Server component, timeout terbatas, modul berat lazy | Ukur latency di deployment staging |
| Editor boros RAM | Downsample preview, export satu per satu, cap piksel | Uji Android kelas menengah dan Safari |
| Bundle besar | System font awal, no animation library, import renderer dinamis | Ukur bundle tiap route |
| CDN membocorkan sesi | no-store pada route privat dan respons Set-Cookie | Dua sesi lewat deployment staging |

Header dasar tersedia di Phase 0. CSP perlu dirancang dan diuji dengan rendering Next.js pada
Phase 8, termasuk nonce bila diperlukan; jangan mengklaim CSP lengkap sudah ada.
Target performa: LCP <=2.5 detik, INP <=200 ms, CLS <=0.1 pada persentil 75 bila data lapangan tersedia.
Target tersebut belum diukur pada Phase 0. Ukur mobile nyata sebelum beta; hindari janji skor sempurna.
Accessibility: keyboard, fokus, kontras, reduced motion, label dan error form, screen-reader smoke test.
Keamanan bukan satu pekerjaan terakhir: RLS Phase 2; pembatasan AI Phase 3; audit menyeluruh Phase 8.
