"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { useAgentStore } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const { locale } = useAgentStore();
  const [email, setEmail] = useState("rahmat.agent@codematt.id");
  const [password, setPassword] = useState("••••••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 400);
  };

  const handleDemoLogin = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col justify-center items-center p-4">
      {/* Brand Header */}
      <div className="mb-8 text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-xl bg-[var(--accent)] text-white flex items-center justify-center font-bold text-sm shadow-xs">
            c.
          </span>
          <span className="text-xl font-bold tracking-tight">
            codematt <span className="text-[var(--accent)]">agent</span>
          </span>
        </Link>
        <p className="text-xs text-[var(--muted)]">AI Workspace Khusus Agen Properti</p>
      </div>

      <div className="w-full max-w-md p-6 sm:p-8 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xl space-y-6">
        <div>
          <h1 className="text-xl font-bold text-[var(--text)]">Masuk ke Workspace</h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            Akses portofolio listing, flyer 300 DPI, dan alat follow-up WhatsApp Anda
          </p>
        </div>

        {/* 1-Click Demo Login Button */}
        <button
          type="button"
          onClick={handleDemoLogin}
          className="w-full py-3 px-4 rounded-xl bg-[var(--accent)] text-white text-xs font-bold flex items-center justify-center gap-2 hover:opacity-95 shadow-sm transition-opacity"
        >
          <Sparkles className="w-4 h-4" />
          <span>Masuk Instan (Mode Demo Agen)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[var(--border)]" />
          <span className="text-[11px] text-[var(--muted)] uppercase font-semibold">atau dengan akun</span>
          <div className="flex-1 h-px bg-[var(--border)]" />
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-[var(--text)] block mb-1">Email Agen</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama.agen@kantor.id"
                className="w-full pl-9 pr-3 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-[var(--text)]">Kata Sandi</label>
              <Link href="#" className="text-[11px] text-[var(--accent)] hover:underline">
                Lupa sandi?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--text)]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs font-bold text-[var(--text)] hover:bg-[var(--bg)] transition-colors"
          >
            {loading ? "Memverifikasi..." : "Masuk ke Dashboard"}
          </button>
        </form>

        {/* Phase 1 Honest Note */}
        <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[11px] text-[var(--muted)] leading-relaxed">
          <span className="font-bold text-[var(--text)] block mb-0.5">ℹ️ Status Fase Saat Ini:</span>
          Sesuai roadmap Phase 1, UI login telah aktif untuk pratinjau. Integrasi session Supabase Auth akan diaktifkan penuh pada Phase 2.
        </div>

        <div className="text-center text-xs text-[var(--muted)]">
          Belum punya akun?{" "}
          <Link href="/signup" className="text-[var(--accent)] font-semibold hover:underline">
            Daftar Agen Baru
          </Link>
        </div>
      </div>
    </div>
  );
}
