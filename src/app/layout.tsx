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
  title: "Codematt Agent | Workspace AI untuk agen properti",
  description:
    "Hapus nomor rumah dan telepon dari foto listing, resize untuk portal dan Instagram, dan tulis listing serta follow-up dengan Gemini, ChatGPT, atau Claude.",
  openGraph: {
    title: "Codematt Agent | Workspace AI untuk agen properti",
    description:
      "Edit foto listing dengan AI dan tulis pesan klien dengan Gemini, ChatGPT, atau Claude. Beta tertutup.",
    type: "website",
  },
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" className={`${plusJakarta.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased bg-[#ffffff] text-[#111113] selection:bg-[#fef08a] selection:text-[#111113]">
        <AgentProvider>{children}</AgentProvider>
      </body>
    </html>
  );
}
