export type Locale = "id" | "en";
type Dictionary = { phase: string; title: string; description: string; status: string; next: string };
export const dictionaries: Record<Locale, Dictionary> = {
  id: { phase: "PHASE 0 · FONDASI", title: "Ruang kerja yang dimulai dengan fondasi tepat.", description: "Codematt Agent membantu agen properti menyiapkan listing, pesan klien, dan materi pemasaran.", status: "Fondasi aplikasi berhasil dijalankan. Login, AI, dan editor flyer belum diaktifkan.", next: "Berikutnya: Phase 1 — navigasi, dashboard, tema, landing page, dan tampilan login." },
  en: { phase: "PHASE 0 · FOUNDATION", title: "A workspace built on the right foundation.", description: "Codematt Agent helps real estate agents prepare listings, client messages, and marketing materials.", status: "The application foundation is running. Login, AI, and the flyer editor are not enabled yet.", next: "Next: Phase 1 — navigation, dashboard, themes, landing page, and login interface." },
};
