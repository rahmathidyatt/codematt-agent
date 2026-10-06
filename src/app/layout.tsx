import type { Metadata } from "next";
import type { ReactNode } from "react";
import { product } from "@/config/product";
import "./globals.css";
export const metadata: Metadata = {
  title: `${product.name} — Foundation`,
  description: product.tagline,
  robots: { index: false, follow: false },
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="id"><body>{children}</body></html>;
}
