"use client";

import React, { useState } from "react";
import {
  Plus,
  Search,
  Check,
  Sliders,
  ArrowUpRight,
} from "lucide-react";
import {
  AIModelConfig,
  ModelProviderId,
  filterModels,
  calculateTokenEconomics,
} from "@/features/platform/model-gateway";

interface ModelRegistryPanelProps {
  models: AIModelConfig[];
  selectedModelId: string;
  onSelectModel: (id: string) => void;
  onToggleModelEnabled: (id: string) => void;
  onUpdateMultiplier: (id: string, multiplier: number) => void;
  onAddCustomModel: (model: AIModelConfig) => void;
}

export function ModelRegistryPanel({
  models,
  selectedModelId,
  onSelectModel,
  onToggleModelEnabled,
  onUpdateMultiplier,
  onAddCustomModel,
}: ModelRegistryPanelProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // New Model Form State
  const [newName, setNewName] = useState("");
  const [newProvider, setNewProvider] = useState("Mistral AI");
  const [newProviderId, setNewProviderId] = useState<ModelProviderId>("custom");
  const [newSlug, setNewSlug] = useState("");
  const [newCategory, setNewCategory] = useState<AIModelConfig["category"]>("Reasoning");
  const [newContext, setNewContext] = useState("128K tokens");
  const [newInputCost, setNewInputCost] = useState("0.40");
  const [newOutputCost, setNewOutputCost] = useState("1.20");
  const [newMultiplier, setNewMultiplier] = useState("2.5");
  const [newSummary, setNewSummary] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const filtered = filterModels(models, categoryFilter, searchQuery);

  const handleCreateModel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newSlug.trim()) {
      setFormError("Model display name and API model slug are required.");
      return;
    }
    const inCost = Number(newInputCost);
    const outCost = Number(newOutputCost);
    const mult = Number(newMultiplier);
    if (Number.isNaN(inCost) || Number.isNaN(outCost) || Number.isNaN(mult) || mult < 1) {
      setFormError("Enter valid positive pricing numbers and a retail multiplier >= 1.0x.");
      return;
    }

    const customModel: AIModelConfig = {
      id: `custom-${Date.now()}`,
      name: newName.trim(),
      provider: newProvider.trim() || "Custom Provider",
      providerId: newProviderId,
      modelSlug: newSlug.trim(),
      category: newCategory,
      contextWindow: newContext.trim() || "128K tokens",
      wholesaleInputPer1M: inCost,
      wholesaleOutputPer1M: outCost,
      retailMarkupMultiplier: mult,
      avgLatencyMs: 510,
      enabled: true,
      commercialTier: "Pro",
      summary:
        newSummary.trim() ||
        "Custom model endpoint integrated into the personal master gateway.",
      strengths: ["Custom endpoint", "Unified billing", "Commercial ready"],
    };

    onAddCustomModel(customModel);
    setNewName("");
    setNewSlug("");
    setNewSummary("");
    setFormError(null);
    setShowAddForm(false);
  };

  const categories = [
    { id: "all", label: "Semua Model" },
    { id: "Multimodal", label: "Multimodal" },
    { id: "Reasoning", label: "Penalaran" },
    { id: "Coding", label: "Koding" },
    { id: "Open-Weights", label: "Open-Weights" },
  ];

  return (
    <section
      id="registry"
      aria-label="Registri Integrasi Model"
      className="py-8 space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-xs font-medium text-[#52525b] mb-1">
            Registri Model & Rute Penyedia
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-[#111113]">
            Daftar Penyedia AI & Pengaturan Markup Komersial
          </h2>
          <p className="text-sm text-[#52525b] mt-1 max-w-2xl">
            Atur model mana yang tampil di pemilih utama, sesuaikan pengali harga ritel, atau tambahkan endpoint model baru di bawah akun utama Anda.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm((prev) => !prev)}
          className="px-4 py-2.5 rounded-lg bg-[#f5b800] hover:bg-[#e5ac00] text-[#111113] text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? "Tutup Formulir" : "Tambah Model Baru"}</span>
        </button>
      </div>

      {/* Add Custom Model Drawer */}
      {showAddForm && (
        <form
          onSubmit={handleCreateModel}
          className="p-6 rounded-xl bg-[#fafafa] border border-[#e4e4e7] space-y-5"
        >
          <div className="flex items-center justify-between border-b border-[#e4e4e7] pb-3">
            <h3 className="text-sm font-bold text-[#111113]">
              Daftarkan Endpoint Model Baru
            </h3>
            <span className="text-xs text-[#52525b] font-mono">
              Terhubung ke amathmrs02@gmail.com
            </span>
          </div>

          {formError && (
            <p role="alert" className="text-xs font-medium text-red-600">
              {formError}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#111113] mb-1.5">
                Nama Tampilan Model
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="cth. Mistral Large 2"
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#e4e4e7] text-[#111113]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#111113] mb-1.5">
                Organisasi Penyedia
              </label>
              <input
                type="text"
                value={newProvider}
                onChange={(e) => setNewProvider(e.target.value)}
                placeholder="cth. Mistral AI"
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#e4e4e7] text-[#111113]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#111113] mb-1.5">
                Slug Model API
              </label>
              <input
                type="text"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                placeholder="cth. mistral-large-latest"
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#e4e4e7] text-[#111113] font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#111113] mb-1.5">
                Kategori Keahlian
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as AIModelConfig["category"])}
                aria-label="Kategori Keahlian"
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#e4e4e7] text-[#111113]"
              >
                <option value="Multimodal">Multimodal</option>
                <option value="Reasoning">Reasoning</option>
                <option value="Coding">Coding</option>
                <option value="Open-Weights">Open-Weights</option>
                <option value="Fast">Fast</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#111113] mb-1.5">
                Tipe Adapter Penyedia
              </label>
              <select
                value={newProviderId}
                onChange={(e) => setNewProviderId(e.target.value as ModelProviderId)}
                aria-label="Tipe Adapter Penyedia"
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#e4e4e7] text-[#111113]"
              >
                <option value="openai">OpenAI-Compatible</option>
                <option value="google">Google GenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="deepseek">DeepSeek</option>
                <option value="meta">Meta Llama</option>
                <option value="custom">Custom REST</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#111113] mb-1.5">
                Biaya Input ($ / 1M)
              </label>
              <input
                type="number"
                step="0.05"
                value={newInputCost}
                onChange={(e) => setNewInputCost(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#e4e4e7] text-[#111113] font-mono tabular-nums"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#111113] mb-1.5">
                Biaya Output ($ / 1M)
              </label>
              <input
                type="number"
                step="0.05"
                value={newOutputCost}
                onChange={(e) => setNewOutputCost(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#e4e4e7] text-[#111113] font-mono tabular-nums"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#111113] mb-1.5">
                Markup Harga Ritel
              </label>
              <input
                type="number"
                step="0.1"
                value={newMultiplier}
                onChange={(e) => setNewMultiplier(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#e4e4e7] text-[#111113] font-mono tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#111113] mb-1.5">
                Kapasitas Konteks
              </label>
              <input
                type="text"
                value={newContext}
                onChange={(e) => setNewContext(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#e4e4e7] text-[#111113]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold text-[#111113] mb-1.5">
                Ringkasan Kemampuan
              </label>
              <input
                type="text"
                value={newSummary}
                onChange={(e) => setNewSummary(e.target.value)}
                placeholder="Jelaskan kegunaan utama model ini..."
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#e4e4e7] text-[#111113]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-lg border border-[#e4e4e7] bg-white text-xs font-medium text-[#52525b] hover:text-[#111113] cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#f5b800] hover:bg-[#e5ac00] text-xs font-semibold text-[#111113] cursor-pointer"
            >
              Simpan & Aktifkan Model
            </button>
          </div>
        </form>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-[#fafafa] border border-[#e4e4e7] rounded-lg overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                categoryFilter === cat.id
                  ? "bg-[#f5b800] text-[#111113] font-semibold"
                  : "text-[#52525b] hover:text-[#111113]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#52525b]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama model atau penyedia..."
            aria-label="Cari model berdasarkan nama atau penyedia"
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#e4e4e7] rounded-lg text-[#111113] placeholder:text-[#52525b]"
          />
        </div>
      </div>

      {/* High-Density Registry Table */}
      <div className="overflow-x-auto rounded-xl border border-[#e4e4e7] bg-white">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#e4e4e7] bg-[#fafafa] text-[#52525b] font-semibold">
              <th className="py-3 px-4">Model & Penyedia</th>
              <th className="py-3 px-4">Kategori & Konteks</th>
              <th className="py-3 px-4 text-right">Biaya Modal (1M In / Out)</th>
              <th className="py-3 px-4 text-right">Markup Komersial</th>
              <th className="py-3 px-4 text-right">Est. Margin</th>
              <th className="py-3 px-4 text-right">Status & Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e4e4e7]">
            {filtered.map((m) => {
              const sampleEcon = calculateTokenEconomics(m, 500_000, 500_000);
              const isSelected = m.id === selectedModelId;

              return (
                <tr
                  key={m.id}
                  className={`transition-colors ${
                    isSelected ? "bg-[#fef9c3]/40" : "hover:bg-[#fafafa]"
                  }`}
                >
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-[#111113] text-sm">{m.name}</div>
                    <div className="text-[#52525b] mt-0.5 flex items-center gap-1.5">
                      <span>{m.provider}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{m.modelSlug}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-medium text-[#111113]">
                      {m.category} <span aria-hidden="true">·</span> {m.contextWindow}
                    </div>
                    <div className="text-[#52525b] mt-0.5">
                      Paket: {m.commercialTier} <span aria-hidden="true">·</span> ~{m.avgLatencyMs}ms
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-[#111113]">
                    ${m.wholesaleInputPer1M.toFixed(2)} / ${m.wholesaleOutputPer1M.toFixed(2)}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <Sliders className="w-3 h-3 text-[#52525b]" />
                      <select
                        value={m.retailMarkupMultiplier.toString()}
                        onChange={(e) =>
                          onUpdateMultiplier(m.id, Number(e.target.value))
                        }
                        aria-label={`Markup ritel untuk ${m.name}`}
                        className="px-2 py-1 rounded border border-[#e4e4e7] bg-white font-mono tabular-nums text-xs text-[#111113]"
                      >
                        <option value="1.5">1.5x</option>
                        <option value="2">2.0x</option>
                        <option value="2.2">2.2x</option>
                        <option value="2.5">2.5x</option>
                        <option value="3">3.0x</option>
                        <option value="3.5">3.5x</option>
                      </select>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono tabular-nums font-semibold text-[#111113]">
                    {sampleEcon.grossMarginPercent}%
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onToggleModelEnabled(m.id)}
                        className={`px-2.5 py-1 rounded border text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                          m.enabled
                            ? "border-[#e4e4e7] bg-white text-[#111113] hover:bg-[#fafafa]"
                            : "border-[#e4e4e7] bg-[#fafafa] text-[#52525b]"
                        }`}
                      >
                        {m.enabled ? "Aktif" : "Nonaktif"}
                      </button>

                      <button
                        type="button"
                        onClick={() => onSelectModel(m.id)}
                        className={`px-3 py-1 rounded text-xs font-semibold inline-flex items-center gap-1 transition-colors whitespace-nowrap cursor-pointer ${
                          isSelected
                            ? "bg-[#111113] text-white"
                            : "bg-[#f5b800] hover:bg-[#e5ac00] text-[#111113]"
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Buka Tab</span>
                          </>
                        ) : (
                          <>
                            <span>Pakai Model</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
