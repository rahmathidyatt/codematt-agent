"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AccountsClosed,
  AuthShell,
  LoadingBlock,
  inputClass,
  primaryButtonClass,
  useAuthEnabled,
} from "@/components/auth/AuthShell";

export default function SignupPage() {
  const authEnabled = useAuthEnabled();
  const [name, setName] = useState("");
  const [agency, setAgency] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [formError, setFormError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEnabled || loading) return;
    setLoading(true);
    setFormError("");
    setSuccessMessage("");
    try {
      const response = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, agency, email, password }),
      });
      const result: { ok?: boolean; message?: string } = await response.json();
      if (!response.ok || !result.ok) {
        setFormError("Pendaftaran gagal. Periksa data Anda lalu coba lagi.");
        return;
      }
      setPassword("");
      setSuccessMessage(result.message || "Cek email Anda untuk konfirmasi, lalu masuk.");
    } catch {
      setFormError("Koneksi terputus. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Buat akun"
      subtitle="Gratis untuk mulai. Upgrade kapan saja."
      footer={<>Sudah punya akun? <Link href="/login" className="font-semibold text-[var(--text)] hover:underline">Masuk</Link></>}
    >
      {authEnabled === null && <LoadingBlock />}
      {authEnabled === false && <AccountsClosed />}
      {authEnabled && (
        <form onSubmit={handleSignup} className="space-y-4 text-sm">
          <label className="block">
            <span className="font-semibold block mb-1">Nama lengkap</span>
            <input type="text" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </label>
          <label className="block">
            <span className="font-semibold block mb-1">Kantor</span>
            <input type="text" required autoComplete="organization" value={agency} onChange={(e) => setAgency(e.target.value)} placeholder="Nama kantor atau independen" className={inputClass} />
          </label>
          <label className="block">
            <span className="font-semibold block mb-1">Email</span>
            <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </label>
          <label className="block">
            <span className="font-semibold block mb-1">Kata sandi</span>
            <input type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 8 karakter" className={inputClass} />
          </label>
          {formError && <p role="alert" className="text-red-600">{formError}</p>}
          {successMessage && <p role="status" className="text-green-700">{successMessage}</p>}
          <button type="submit" disabled={loading} className={primaryButtonClass}>
            {loading ? "Mendaftarkan..." : "Daftar"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
