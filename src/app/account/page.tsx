"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type AccountInfo = { authenticated?: boolean; user?: { id: string; email: string | null } };
type ListingInfo = { id: string; name: string; location: string; price: number | null };

export default function AccountPage() {
  const router = useRouter();
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [items, setItems] = useState<ListingInfo[]>([]);
  const [databaseStatus, setDatabaseStatus] = useState("Belum diperiksa");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        const data: AccountInfo = await response.json();
        if (!active) return;
        setAccount(data);
        if (!response.ok || !data.authenticated) return;
        const listingResponse = await fetch("/api/private/listings", { cache: "no-store" });
        const result: { ok?: boolean; code?: string; listings?: ListingInfo[] } = await listingResponse.json();
        if (!active) return;
        if (listingResponse.ok && result.ok && Array.isArray(result.listings)) {
          setItems(result.listings);
          setDatabaseStatus("Database pribadi terhubung");
        } else {
          setDatabaseStatus("Penyimpanan database belum diaktifkan untuk Codematt.");
        }
      } catch {
        if (active) setDatabaseStatus("Gagal memeriksa koneksi akun atau database.");
      }
    })();
    return () => { active = false; };
  }, []);

  const signOut = async () => {
    setBusy(true);
    try {
      const response = await fetch("/api/auth/sign-out", { method: "POST" });
      if (response.ok) {
        router.replace("/login");
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-6 sm:p-12">
      <section className="max-w-2xl mx-auto bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 space-y-5">
        <h1 className="text-xl font-bold">Akun Codematt Agent</h1>
        {!account && <p role="status">Memeriksa sesi server...</p>}
        {account && !account.authenticated && (
          <p role="alert">Sesi belum aktif atau telah kedaluwarsa. <Link href="/login" className="underline">Masuk kembali</Link>.</p>
        )}
        {account?.authenticated && (
          <>
            <div className="rounded-lg border border-[var(--border)] p-4 text-sm">
              <p className="font-semibold">Login terverifikasi oleh layanan autentikasi</p>
              <p className="text-[var(--muted)] break-all">{account.user?.email || "Pengguna"}</p>
              <p className="text-xs text-[var(--muted)] mt-2">Sesi hanya berlaku sementara. Data demo pada perangkat ini belum dipindahkan ke akun Anda.</p>
            </div>
            <div className="space-y-2">
              <h2 className="font-semibold">Listing tersimpan di server</h2>
              <p className="text-xs text-[var(--muted)]">{databaseStatus}</p>
              {items.map((item) => (
                <div key={item.id} className="text-sm border border-[var(--border)] rounded-lg p-3">
                  <strong>{item.name}</strong> · {item.location}
                </div>
              ))}
            </div>
            <button type="button" disabled={busy} onClick={signOut}
              className="px-4 py-2 rounded-lg border border-[var(--border)] font-semibold text-sm">
              {busy ? "Keluar..." : "Keluar dari Akun"}
            </button>
          </>
        )}
        <div className="border-t border-[var(--border)] pt-4 text-xs">
          <Link href="/dashboard" className="underline">Buka workspace demo</Link>
          <p className="mt-1 text-[var(--muted)]">
            Workspace demo menggunakan penyimpanan browser yang terpisah dari akun, bukan data privat di server.
          </p>
        </div>
      </section>
    </main>
  );
}
