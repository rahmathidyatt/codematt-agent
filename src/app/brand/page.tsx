"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Save,
  Check,
  Phone,
  Mail,
} from "lucide-react";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { useAgentStore } from "@/lib/store";

export default function BrandKitPage() {
  const { agent, updateAgent } = useAgentStore();
  const [form, setForm] = useState(agent);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateAgent(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <WorkspaceShell
      title="Identitas Brand"
      subtitle="Logo, warna, dan kontak yang muncul di flyer"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Brand Kit Editor Form */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <h2 className="text-base font-bold text-[var(--text)] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[var(--accent-text)]" />
                <span>Profil</span>
              </h2>
              <span className="text-[13px] text-emerald-600 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Terverifikasi
              </span>
            </div>

            <div className="space-y-4 text-[13px]">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[var(--text)] block mb-1">
                    Nama lengkap
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[var(--text)] block mb-1">
                    Jabatan
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[var(--text)] block mb-1">
                    Kantor
                  </label>
                  <input
                    type="text"
                    value={form.agency}
                    onChange={(e) => setForm({ ...form, agency: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[var(--text)] block mb-1">
                    Nomor lisensi
                  </label>
                  <input
                    type="text"
                    value={form.license}
                    onChange={(e) => setForm({ ...form, license: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[var(--text)] block mb-1">
                    Nomor WhatsApp
                  </label>
                  <input
                    type="text"
                    value={form.whatsapp}
                    onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)] font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[var(--text)] block mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)]"
                  />
                </div>
              </div>

              {/* Color Palette Picker */}
              <div className="pt-2 border-t border-[var(--border)] space-y-3">
                <label className="font-semibold text-[var(--text)] block">
                  Warna utama
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.primaryColor}
                    onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-[var(--border)] p-1 bg-[var(--bg)]"
                  />
                  <input
                    type="text"
                    value={form.primaryColor}
                    onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                    className="w-32 px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl font-mono text-[13px] uppercase"
                  />
                  <div className="flex items-center gap-1.5">
                    {["#186759", "#1e3a8a", "#b45309", "#7c2d12", "#0f172a"].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setForm({ ...form, primaryColor: c })}
                        style={{ backgroundColor: c }}
                        className="w-6 h-6 rounded-md border border-white/20 shadow-xs hover:scale-110 transition-transform"
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="font-semibold text-[var(--text)] block mb-1">
                  Ajakan di flyer
                </label>
                <textarea
                  rows={2}
                  value={form.defaultCta}
                  onChange={(e) => setForm({ ...form, defaultCta: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)]"
                />
              </div>

              <button
                type="button"
                onClick={handleSave}
                className="w-full py-3 bg-[var(--accent)] text-neutral-950 text-[13px] font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 shadow-xs transition-opacity"
              >
                {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                <span>{saved ? "Tersimpan" : "Simpan"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Business Card & Badge Preview */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 md:p-8 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] text-[13px] text-[var(--muted)]">
              <span className="font-bold text-[var(--text)] uppercase tracking-wider">
                Pratinjau kartu nama
              </span>
            </div>

            {/* Visual Digital Business Card */}
            <div
              className="p-6 rounded-2xl text-white shadow-xl relative overflow-hidden transition-all duration-300"
              style={{ backgroundColor: form.primaryColor }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[13px] font-mono tracking-wider uppercase opacity-80">
                    {form.agency}
                  </span>
                  <h3 className="text-xl font-bold mt-1 tracking-tight">{form.name}</h3>
                  <p className="text-[13px] opacity-90 mt-0.5">{form.title}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold text-lg border border-white/20">
                  {form.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-white/20 flex flex-wrap justify-between items-end gap-2 text-[13px]">
                <div className="space-y-1 opacity-90">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    <span className="font-mono">{form.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{form.email}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs uppercase tracking-wider block opacity-75">Lisensi AREBI</span>
                  <span className="font-mono font-bold text-[13px]">{form.license}</span>
                </div>
              </div>
            </div>

            <p className="text-[13px] text-[var(--muted)] leading-relaxed">
              Data ini otomatis dipakai di flyer dan deskripsi listing.
            </p>
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}
