"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [agency, setAgency] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading] = useState(false);
  const [formError, setFormError] = useState("");

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("Pendaftaran akun belum diaktifkan. Data tidak disimpan. Gunakan akses Mode Demo.");
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
          <p className="text-amber-700">Pendaftaran hanya pratinjau. Jangan masukkan kata sandi yang digunakan di layanan lain.</p>
          <div>
            <label className="font-semibold text-[var(--text)] block mb-1">Nama Lengkap</label>
            <input
              type="text"
              required
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 8 karakter"
              className="w-full px-3 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)]"
            />
          </div>

          {formError && <p role="alert" className="text-red-700">{formError}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[var(--accent)] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-95 shadow-sm transition-opacity"
          >
            <span>{loading ? "Mendaftarkan..." : "Daftar & Masuk ke Workspace"}</span>
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
