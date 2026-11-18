import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Check,
  Crop,
  FileText,
  MessageSquare,
  Palette,
  Scan,
  ShieldCheck,
  Wand2,
} from "lucide-react";
import { PLAN_ORDER, PLANS, PROVIDER_LABELS, formatRupiah } from "@/config/plans";

const FEATURES = [
  {
    icon: Bot,
    title: "Tanya tiga AI di satu tempat",
    body: "Gemini, ChatGPT, dan Claude dalam satu jendela chat. Pilih yang paling cocok untuk skrip negosiasi, jawaban keberatan klien, atau penjelasan SHM dan HGB.",
  },
  {
    icon: Scan,
    title: "Hapus nomor rumah & telepon",
    body: "AI menandai nomor rumah, nomor HP di spanduk lama, dan plat kendaraan. Satu klik untuk membersihkannya; bagian foto lain tidak ikut berubah.",
  },
  {
    icon: Crop,
    title: "Resize sekali klik",
    body: "Ukuran siap pakai untuk portal listing, feed dan story Instagram, atau versi hemat untuk WhatsApp. Gratis, tanpa kuota.",
  },
  {
    icon: FileText,
    title: "Listing, flyer, follow-up",
    body: "Draf deskripsi listing dari data yang Anda isi, flyer dengan QR, dan pesan follow-up WhatsApp. AI tidak menambahkan fakta yang tidak Anda berikan.",
  },
];

const STEPS = [
  { title: "Daftar gratis", body: "Akun baru langsung dapat paket Free: chat Gemini dan 3 edit foto AI per bulan." },
  { title: "Kerjakan listing", body: "Unggah foto, bersihkan, ubah ukuran, lalu tulis deskripsi dan flyer dari data properti." },
  { title: "Upgrade kalau perlu", body: "Butuh ChatGPT, Claude, atau kuota lebih besar? Bayar per 30 hari lewat Midtrans." },
];

const FAQ = [
  {
    q: "Apakah jawaban AI selalu benar?",
    a: "Tidak. AI bisa keliru, terutama soal harga, legalitas, pajak, dan hitungan KPR. Cek ulang sebelum dikirim ke klien.",
  },
  {
    q: "Foto saya dipakai untuk apa?",
    a: "Foto dikirim ke penyedia AI hanya saat Anda menekan deteksi atau hapus. Pakai hanya foto milik Anda atau kantor Anda, bukan foto listing agen lain.",
  },
  {
    q: "Bagaimana cara bayarnya?",
    a: "Lewat Midtrans: QRIS, transfer virtual account, e-wallet, atau kartu. Satu pembayaran berlaku 30 hari dan tidak ada potong otomatis.",
  },
  {
    q: "Kalau kuota habis?",
    a: "Kuota direset setiap tanggal 1 (WIB). Kalau penyedia AI gagal menjawab, kuota Anda tidak dipotong.",
  },
];

function Logo() {
  return (
    <span className="flex items-center gap-2 font-black tracking-tight text-[var(--text)]">
      <span className="w-8 h-8 rounded-lg bg-[var(--accent)] text-neutral-950 flex items-center justify-center text-sm">C</span>
      Codematt Agent
    </span>
  );
}

/** Before/after illustration. Drawn in SVG so no stock photo is needed. */
function PhotoIllustration() {
  return (
    <svg viewBox="0 0 520 330" className="w-full h-auto block" role="img" aria-label="Contoh foto rumah sebelum dan sesudah nomor rumah serta nomor telepon dihapus">
      <defs>
        <clipPath id="left"><rect width="260" height="330" /></clipPath>
        <clipPath id="right"><rect x="260" width="260" height="330" /></clipPath>
      </defs>
      {[
        { clip: "url(#left)", clean: false },
        { clip: "url(#right)", clean: true },
      ].map(({ clip, clean }) => (
        <g key={String(clean)} clipPath={clip}>
          <rect width="520" height="330" fill="#a9d3ee" />
          <rect y="250" width="520" height="80" fill="#9a9d94" />
          <polygon points="120,120 260,50 400,120" fill="#7b3f2b" />
          <rect x="140" y="120" width="240" height="130" fill="#f1e8d8" />
          <rect x="235" y="170" width="50" height="80" fill="#5b4636" />
          <rect x="165" y="145" width="48" height="40" fill="#d3e6f1" />
          <rect x="307" y="145" width="48" height="40" fill="#d3e6f1" />
          <rect x="40" y="195" width="70" height="55" fill="#d9d3c7" />
          {!clean && <text x="56" y="231" fontSize="22" fontWeight="700" fill="#333">42</text>}
          {!clean && (
            <g>
              <rect x="405" y="165" width="100" height="55" rx="3" fill="#d32f2f" />
              <text x="415" y="188" fontSize="13" fontWeight="700" fill="#fff">DIJUAL</text>
              <text x="415" y="207" fontSize="10.5" fill="#fff">0812-xxxx-xxxx</text>
            </g>
          )}
        </g>
      ))}
      <line x1="260" y1="0" x2="260" y2="330" stroke="#fff" strokeWidth="3" />
      <rect x="10" y="10" width="78" height="22" rx="11" fill="rgba(0,0,0,.6)" />
      <text x="49" y="25" fontSize="11" fill="#fff" textAnchor="middle" fontWeight="700">Sebelum</text>
      <rect x="432" y="10" width="78" height="22" rx="11" fill="#f5b800" />
      <text x="471" y="25" fontSize="11" fill="#111" textAnchor="middle" fontWeight="700">Sesudah</text>
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
          <Link href="/" aria-label="Codematt Agent, beranda"><Logo /></Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-[var(--muted)]">
            <a href="#fitur" className="hover:text-[var(--text)]">Fitur</a>
            <a href="#harga" className="hover:text-[var(--text)]">Harga</a>
            <a href="#faq" className="hover:text-[var(--text)]">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="px-3.5 py-2 rounded-xl text-sm font-semibold hover:bg-[var(--surface)]">Masuk</Link>
            <Link href="/signup" className="px-3.5 py-2 rounded-xl text-sm font-bold bg-[var(--accent)] text-neutral-950 hover:bg-[var(--accent-hover)]">Daftar gratis</Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-5 pt-14 pb-16 grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full bg-[var(--accent-soft)] text-[var(--text)]">
              Untuk agen properti di Indonesia
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-[1.08]">
              Foto listing bersih dan pesan klien siap kirim, dalam hitungan menit.
            </h1>
            <p className="text-base text-[var(--muted)] max-w-xl leading-relaxed">
              Hapus nomor rumah dan nomor telepon dari foto, ubah ukuran untuk portal dan Instagram,
              lalu minta Gemini, ChatGPT, atau Claude membantu menulis listing dan follow-up.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/signup" className="px-5 py-3 rounded-xl bg-[var(--accent)] text-neutral-950 font-bold text-sm flex items-center gap-2 hover:bg-[var(--accent-hover)]">
                Mulai gratis <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/dashboard" className="px-5 py-3 rounded-xl border border-[var(--border)] font-semibold text-sm hover:bg-[var(--surface)]">
                Lihat workspace demo
              </Link>
            </div>
            <p className="text-xs text-[var(--muted)]">Tanpa kartu kredit. Paket Free tidak kedaluwarsa.</p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm space-y-3">
            <div className="rounded-xl overflow-hidden border border-[var(--border)]">
              <PhotoIllustration />
            </div>
            <div className="rounded-xl bg-[var(--bg)] border border-[var(--border)] p-3 space-y-2 text-xs">
              <div className="flex gap-1.5">
                {(["google", "openai", "anthropic"] as const).map((p, i) => (
                  <span key={p} className={`px-2.5 py-1 rounded-lg font-bold border ${i === 1 ? "bg-[var(--accent)] border-[var(--accent)] text-neutral-950" : "border-[var(--border)]"}`}>
                    {PROVIDER_LABELS[p]}
                  </span>
                ))}
              </div>
              <p className="p-2.5 rounded-lg bg-[var(--accent)] text-neutral-950 ml-auto max-w-[85%] w-fit">
                Buat pesan follow-up untuk klien yang 3 hari belum membalas
              </p>
              <p className="p-2.5 rounded-lg border border-[var(--border)] max-w-[90%]">
                Halo Pak Andi, saya mau menanyakan lagi soal rumah yang kemarin Bapak lihat. Kalau berkenan, saya bisa atur survei ulang akhir pekan ini.
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="fitur" className="border-t border-[var(--border)] bg-[var(--surface)]">
          <div className="max-w-6xl mx-auto px-5 py-16 space-y-10">
            <div className="max-w-2xl">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Pekerjaan harian agen, lebih cepat</h2>
              <p className="mt-2 text-[var(--muted)]">Semua yang biasanya dikerjakan di empat aplikasi berbeda.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {FEATURES.map(({ icon: Icon, title, body }) => (
                <div key={title} className="p-6 rounded-2xl bg-[var(--bg)] border border-[var(--border)]">
                  <Icon className="w-6 h-6 text-[var(--accent)]" />
                  <h3 className="mt-4 font-bold">{title}</h3>
                  <p className="mt-1.5 text-sm text-[var(--muted)] leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--muted)]">
              <span className="flex items-center gap-2"><Wand2 className="w-4 h-4" /> Editor foto</span>
              <span className="flex items-center gap-2"><Palette className="w-4 h-4" /> Flyer studio</span>
              <span className="flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Follow-up WhatsApp</span>
              <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Brand kit</span>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="max-w-6xl mx-auto px-5 py-16">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Cara mulai</h2>
          <ol className="mt-8 grid md:grid-cols-3 gap-6">
            {STEPS.map((s, i) => (
              <li key={s.title} className="flex gap-4">
                <span className="w-9 h-9 shrink-0 rounded-full bg-[var(--accent)] text-neutral-950 font-black flex items-center justify-center">{i + 1}</span>
                <div>
                  <h3 className="font-bold">{s.title}</h3>
                  <p className="mt-1 text-sm text-[var(--muted)] leading-relaxed">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Pricing teaser */}
        <section id="harga" className="border-t border-[var(--border)] bg-[var(--surface)]">
          <div className="max-w-6xl mx-auto px-5 py-16 space-y-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Harga</h2>
                <p className="mt-2 text-[var(--muted)]">Bayar per 30 hari. Tidak ada kontrak.</p>
              </div>
              <Link href="/pricing" className="text-sm font-bold flex items-center gap-1 hover:underline">Detail paket <ArrowRight className="w-4 h-4" /></Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PLAN_ORDER.map((id) => {
                const plan = PLANS[id];
                const featured = id === "pro";
                return (
                  <div key={id} className={`p-5 rounded-2xl border flex flex-col ${featured ? "border-[var(--accent)] bg-[var(--bg)] ring-2 ring-[var(--accent)]/30" : "border-[var(--border)] bg-[var(--bg)]"}`}>
                    <h3 className="font-black">{plan.name}</h3>
                    <p className="mt-2 text-2xl font-black">
                      {plan.purchasable ? formatRupiah(plan.priceIdr) : id === "free" ? "Gratis" : "Hubungi kami"}
                      {plan.purchasable && <span className="text-xs font-medium text-[var(--muted)]"> per 30 hari</span>}
                    </p>
                    <ul className="mt-4 space-y-1.5 text-sm flex-1">
                      {plan.highlights.map((h) => (
                        <li key={h} className="flex gap-2"><Check className="w-4 h-4 mt-0.5 text-[var(--accent)] shrink-0" />{h}</li>
                      ))}
                    </ul>
                    <Link
                      href={id === "free" ? "/signup" : "/pricing"}
                      className={`mt-5 py-2.5 rounded-xl text-sm font-bold text-center ${featured ? "bg-[var(--accent)] text-neutral-950" : "border border-[var(--border)] hover:bg-[var(--surface)]"}`}
                    >
                      {id === "free" ? "Daftar gratis" : id === "team" ? "Tanya admin" : `Pilih ${plan.name}`}
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="max-w-3xl mx-auto px-5 py-16">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Pertanyaan umum</h2>
          <div className="mt-6 divide-y divide-[var(--border)] border-y border-[var(--border)]">
            {FAQ.map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="cursor-pointer font-semibold list-none flex justify-between gap-4">
                  {f.q}
                  <span className="text-[var(--muted)] group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="max-w-6xl mx-auto px-5 pb-16">
          <div className="rounded-3xl bg-[var(--accent)] text-neutral-950 p-8 sm:p-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Coba di listing berikutnya.</h2>
              <p className="mt-2 text-neutral-800">Paket Free cukup untuk mencoba semua fitur dasar.</p>
            </div>
            <Link href="/signup" className="px-6 py-3 rounded-xl bg-neutral-950 text-white font-bold text-sm flex items-center gap-2 w-fit">
              Daftar gratis <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-5 py-8 flex flex-col sm:flex-row justify-between gap-4 text-sm text-[var(--muted)]">
          <Logo />
          <div className="flex flex-wrap gap-5">
            <Link href="/pricing" className="hover:text-[var(--text)]">Harga</Link>
            <Link href="/roadmap" className="hover:text-[var(--text)]">Status fitur</Link>
            <Link href="/login" className="hover:text-[var(--text)]">Masuk</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
