"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import {
  AccountsClosed,
  AuthShell,
  LoadingBlock,
  inputClass,
  primaryButtonClass,
  useAuthEnabled,
} from "@/components/auth/AuthShell";

export default function LoginPage() {
  const router = useRouter();
  const authEnabled = useAuthEnabled();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEnabled || loading) return;
    setLoading(true);
    setFormError("");
    try {
      const response = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result: { ok?: boolean; code?: string } = await response.json();
      if (!response.ok || !result.ok) {
        setFormError(result.code === "INVALID_CREDENTIALS"
          ? "Email atau kata sandi salah."
          : "Belum bisa masuk. Coba lagi sebentar.");
        return;
      }
      setPassword("");
      router.push("/dashboard");
      router.refresh();
    } catch {
      setFormError("Koneksi terputus. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Masuk"
      subtitle="Lanjutkan pekerjaan listing Anda."
      footer={<>Belum punya akun? <Link href="/signup" className="font-semibold text-[var(--text)] hover:underline">Daftar</Link></>}
    >
      {authEnabled === null && <LoadingBlock />}
      {authEnabled === false && <AccountsClosed />}
      {authEnabled && (
        <form onSubmit={handleLogin} className="space-y-4 text-sm">
          <label className="block">
            <span className="font-semibold block mb-1">Email</span>
            <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </label>
          <label className="block">
            <span className="font-semibold block mb-1">Kata sandi</span>
            <span className="relative block">
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass + " pr-10"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--text)]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </span>
          </label>
          {formError && <p role="alert" className="text-red-600">{formError}</p>}
          <button type="submit" disabled={loading} className={primaryButtonClass}>
            {loading ? "Memeriksa..." : "Masuk"}
          </button>
          <Link href="/dashboard" className="block text-center text-[var(--muted)] hover:text-[var(--text)]">
            Atau coba workspace demo
          </Link>
        </form>
      )}
    </AuthShell>
  );
}
