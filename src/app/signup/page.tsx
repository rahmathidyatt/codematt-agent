"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
} from "lucide-react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [agency, setAgency] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [authEnabled, setAuthEnabled] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/auth/status", { signal: controller.signal, cache: "no-store" })
      .then((res) => res.json())
      .then((data: { enabled?: boolean }) => setAuthEnabled(data.enabled === true))
      .catch(() => { /* stay in demo mode */ });
    return () => controller.abort();
  }, []);

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
      const result: { ok?: boolean; code?: string; message?: string } = await response.json();
      if (!response.ok || !result.ok) {
        setFormError("Pendaftaran belum dapat diproses. Periksa input dan coba lagi.");
        return;
      }
      setPassword("");
      setSuccessMessage(result.message || "Pendaftaran diterima. Periksa email Anda, lalu masuk.");
    } catch {
      setFormError("Koneksi pendaftaran gagal. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col justify-center items-center p-4">
      <div className="mb-8 text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-xl bg-[var(--accent)] text-white flex items-center justify-center font-bold text-sm shadow-xs">
            c.
          </span>
          <span className="text-xl font-bold tracking-tight">
            codematt <span className="text-[var(--accent)]">agent</span>
          </span>
        </Link>
        <p className="text-xs text-[var(--muted)]">Registrasi Akun Agen Properti</p>
      </div>

      <div className="w-full max-w-md p-6 sm:p-8 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xl space-y-6">
        <div>
          <h1 className="text-xl font-bold text-[var(--text)]">Buat Akun Agen</h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            Mulai susun deskripsi listing AI dan cetak flyer 300 DPI dengan Brand Kit Anda
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4 text-xs">
          <p className="text-amber-700">{authEnabled ? "Pendaftaran menggunakan Supabase Auth. Verifikasi email mungkin diperlukan." : "Pendaftaran belum dikonfigurasi. Jangan masukkan kata sandi akun asli."}</p>
          <div>
            <label className="font-semibold text-[var(--text)] block mb-1">Nama Lengkap</label>
            <input
              type="text"
              required
              disabled={!authEnabled}
              disabled={!authEnabled}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Rahmat Hidayat"
              className="w-full px-3 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)]"
            />
          </div>

          <div>
            <label className="font-semibold text-[var(--text)] block mb-1">Agensi / Kantor Broker</label>
            <input
              type="text"
              required
              value={agency}
              onChange={(e) => setAgency(e.target.value)}
              placeholder="Contoh: ERA Indonesia / Ray White / Independen"
              className="w-full px-3 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)]"
            />
          </div>

          <div>
            <label className="font-semibold text-[var(--text)] block mb-1">Email Agen</label>
            <input
              type="email"
              required
              disabled={!authEnabled}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@agenproperti.id"
              className="w-full px-3 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)]"
            />
          </div>

          <div>
            <label className="font-semibold text-[var(--text)] block mb-1">Kata Sandi</label>
            <input
              type="password"
              required
              disabled={!authEnabled}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 8 karakter"
              className="w-full px-3 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)]"
            />
          </div>

          {formError && <p role="alert" className="text-red-700">{formError}</p>}
          {successMessage && <p role="status" className="text-green-700">{successMessage}</p>}
          <button
            type="submit"
            disabled={loading || !authEnabled}
            className="w-full py-3 bg-[var(--accent)] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-95 shadow-sm transition-opacity"
          >
            <span>{loading ? "Mendaftarkan..." : "Daftar Akun"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-[var(--muted)]">
          Sudah memiliki akun?{" "}
          <Link href="/login" className="text-[var(--accent)] font-semibold hover:underline">
            Masuk Sekarang
          </Link>
        </div>
      </div>
    </div>
  );
}
