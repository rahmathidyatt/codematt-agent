import type { Metadata } from "next";
import type { ReactNode } from "react";
import { product } from "@/config/product";
import { AgentProvider } from "@/lib/store";
import "./globals.css";

export const metadata: Metadata = {
  title: "Codematt Agent — AI Workspace for Real Estate Agents",
  description: "Bantu agen properti menyusun listing, follow-up klien WhatsApp, dan desain flyer cetak 300 DPI dengan verifikasi fakta akurat.",
  openGraph: {
    title: "Codematt Agent — AI Workspace for Real Estate Agents",
    description: "AI Workspace for Real Estate Agents: Listing Writer, 300 DPI Flyer Studio, and Client WhatsApp Follow-up.",
    type: "website",
  },
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body className="antialiased">
        <AgentProvider>{children}</AgentProvider>
      </body>
    </html>
  );
}
