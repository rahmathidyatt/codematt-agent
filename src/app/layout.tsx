import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { AgentProvider } from "@/lib/store";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Codematt Agent | Demo Workspace AI Multi-Model",
  description:
    "Prototipe workspace agen AI multi-model untuk demonstrasi fitur, perbandingan model, dan konten properti. Koneksi AI live, akun, dan penyimpanan cloud nonaktif secara default.",
  openGraph: {
    title: "Codematt Agent | Demo Workspace AI Multi-Model",
    description:
      "Prototipe workspace AI multi-model. Simulasi katalog dan pemakaian AI, tanpa pemrosesan pembayaran atau layanan produksi.",
    type: "website",
  },
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased bg-[#ffffff] text-[#111113] selection:bg-[#fef08a] selection:text-[#111113]">
        <AgentProvider>{children}</AgentProvider>
      </body>
    </html>
  );
}
