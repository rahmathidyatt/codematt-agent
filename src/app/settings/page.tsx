"use client";

import React, { useState } from "react";
import {
  Settings,
  Save,
  Check,
  Globe,
  Sun,
  Moon,
  Laptop,
  Database,
  Trash2,
  RefreshCw,
  Bell,
  Lock,
} from "lucide-react";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { useAgentStore } from "@/lib/store";

export default function SettingsPage() {
  const { locale, setLocale, theme, setTheme } = useAgentStore();
  const [currency, setCurrency] = useState("IDR");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [waNotifications, setWaNotifications] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleResetData = () => {
    if (confirm("Reset seluruh data lokal ke setelan awal?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <WorkspaceShell
      title={locale === "id" ? "Pengaturan Workspace" : "Workspace Settings"}
      subtitle={locale === "id" ? "Preferensi bahasa, tema, notifikasi, dan pengelolaan data" : "Language, theme, notifications, and local data preferences"}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="p-6 md:p-8 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-6">
          <h2 className="text-base font-bold text-[var(--text)] pb-3 border-b border-[var(--border)]">
            Preferensi Tampilan & Regional
          </h2>

          <div className="space-y-4 text-xs">
            {/* Language */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-semibold text-[var(--text)] block">Bahasa Antarmuka</span>
                <span className="text-[var(--muted)]">Pilih bahasa kerja yang Anda gunakan di sistem</span>
              </div>
              <div className="flex items-center gap-1 p-1 bg-[var(--bg)] border border-[var(--border)] rounded-lg">
                <button
                  type="button"
                  onClick={() => setLocale("id")}
                  className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                    locale === "id" ? "bg-[var(--surface)] text-[var(--text)] shadow-xs" : "text-[var(--muted)]"
                  }`}
                >
                  Bahasa Indonesia
                </button>
                <button
                  type="button"
                  onClick={() => setLocale("en")}
                  className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                    locale === "en" ? "bg-[var(--surface)] text-[var(--text)] shadow-xs" : "text-[var(--muted)]"
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {/* Theme */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-[var(--border)]">
              <div>
                <span className="font-semibold text-[var(--text)] block">Tema Tampilan</span>
                <span className="text-[var(--muted)]">Mode terang, gelap, atau ikuti preferensi sistem</span>
              </div>
              <div className="flex items-center gap-1 p-1 bg-[var(--bg)] border border-[var(--border)] rounded-lg">
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-colors ${
                    theme === "light" ? "bg-[var(--surface)] text-[var(--text)] shadow-xs" : "text-[var(--muted)]"
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-colors ${
                    theme === "dark" ? "bg-[var(--surface)] text-[var(--text)] shadow-xs" : "text-[var(--muted)]"
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Dark</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("system")}
                  className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-colors ${
                    theme === "system" ? "bg-[var(--surface)] text-[var(--text)] shadow-xs" : "text-[var(--muted)]"
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5" />
                  <span>Auto</span>
                </button>
              </div>
            </div>

            {/* Currency */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-[var(--border)]">
              <div>
                <span className="font-semibold text-[var(--text)] block">Mata Uang Default</span>
                <span className="text-[var(--muted)]">Format penulisan harga pada listing dan flyer</span>
              </div>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="px-3 py-1.5 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-xs text-[var(--text)]"
              >
                <option value="IDR">Rupiah (IDR - Rp)</option>
                <option value="USD">US Dollar (USD - $)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data & Security Card */}
        <div className="p-6 md:p-8 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-4">
          <h2 className="text-base font-bold text-[var(--text)] pb-3 border-b border-[var(--border)]">
            Pengelolaan Data Workspace
          </h2>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div>
              <span className="font-semibold text-[var(--text)] block">Reset Database Lokal</span>
              <p className="text-[var(--muted)] mt-0.5">
                Menghapus seluruh listing tersimpan dan mengembalikan profil agen ke setelan demo awal.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetData}
              className="px-3 py-2 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 font-bold hover:bg-rose-100 transition-colors whitespace-nowrap self-start sm:self-auto"
            >
              Reset Data
            </button>
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}
