"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { Bot, Lock, RefreshCw, Send, Sparkles } from "lucide-react";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { useAgentStore } from "@/lib/store";
import { PLANS, PROVIDER_LABELS, cheapestPlanFor, type ProviderId } from "@/config/plans";
import { errorMessage, newIdempotencyKey, useBilling } from "@/lib/billing/use-billing";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  provider?: ProviderId;
  model?: string;
  failed?: boolean;
}

const QUICK_PROMPTS = [
  "Bagaimana menanggapi pembeli yang menawar terlalu rendah?",
  "Jelaskan beda SHM dan HGB dengan bahasa sederhana untuk pembeli keluarga",
  "Buat pesan follow-up untuk klien yang 3 hari tidak membalas",
  "Pertanyaan untuk mengecek budget pembeli sebelum survei",
];

const PROVIDERS: ProviderId[] = ["google", "openai", "anthropic"];
const HISTORY_LIMIT = 12;

export default function AssistantPage() {
  const { agent } = useAgentStore();
  const billing = useBilling();
  const counter = useRef(0);
  const [provider, setProvider] = useState<ProviderId>("google");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const isLocked = (p: ProviderId) => billing.mode === "live" && !billing.providers.includes(p);

  const send = async (custom?: string) => {
    const text = (custom ?? input).trim();
    if (!text || loading) return;
    if (isLocked(provider)) return;
    counter.current += 1;
    const userMsg: ChatMessage = { id: `u${counter.current}`, role: "user", text };
    const history = [...messages.filter((m) => !m.failed), userMsg].slice(-HISTORY_LIMIT);
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          idempotencyKey: newIdempotencyKey("chat"),
          messages: history.map((m) => ({ role: m.role, content: m.text.slice(0, 4_000) })),
        }),
      });
      const data = await res.json();
      counter.current += 1;
      setMessages((prev) => [...prev, data?.ok
        ? { id: `a${counter.current}`, role: "assistant", text: String(data.reply), provider, model: data.model }
        : { id: `a${counter.current}`, role: "assistant", text: errorMessage(data?.code), provider, failed: true }]);
      if (data?.ok && data.mode === "live") void billing.refresh();
    } catch {
      counter.current += 1;
      setMessages((prev) => [...prev, { id: `a${counter.current}`, role: "assistant", text: errorMessage(null), failed: true }]);
    } finally {
      setLoading(false);
    }
  };

  const chatUsed = billing.usage?.chat ?? 0;
  const chatLimit = billing.limits?.chat ?? PLANS[billing.planId].quotas.chat;

  return (
    <WorkspaceShell
      title="AI Assistant"
      subtitle="Satu tempat untuk bertanya ke Gemini, ChatGPT, atau Claude"
    >
      <div className="max-w-4xl mx-auto space-y-5">
        {billing.mode === "demo" && !billing.loading && (
          <div className="p-3 rounded-xl border border-amber-500/40 bg-amber-500/10 text-xs text-[var(--text)]">
            <strong>Mode demo.</strong> Server belum mengaktifkan AI live, jadi jawaban di bawah hanya contoh dan tidak memotong kuota.
          </div>
        )}
        {billing.mode === "signed-out" && (
          <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs">
            Silakan <Link href="/login" className="underline font-bold">login</Link> untuk memakai AI.
          </div>
        )}

        {/* Provider selector */}
        <div className="flex flex-wrap items-center gap-2">
          {PROVIDERS.map((p) => {
            const locked = isLocked(p);
            const needed = cheapestPlanFor(p);
            return (
              <button
                key={p}
                type="button"
                onClick={() => setProvider(p)}
                aria-pressed={provider === p}
                className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  provider === p
                    ? "bg-[var(--accent)] text-neutral-950 border-[var(--accent)]"
                    : "bg-[var(--surface)] border-[var(--border)] text-[var(--text)] hover:border-[var(--muted)]"
                }`}
              >
                {locked && <Lock className="w-3.5 h-3.5" />}
                <span>{PROVIDER_LABELS[p]}</span>
                {locked && needed && <span className="font-normal opacity-80">· {needed.name}</span>}
              </button>
            );
          })}
          {billing.mode === "live" && (
            <span className="ml-auto text-[11px] font-mono text-[var(--muted)]">
              Paket {PLANS[billing.planId].name} · {chatUsed}/{chatLimit} pesan bulan ini
            </span>
          )}
        </div>

        {isLocked(provider) && (
          <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs flex items-center justify-between gap-3">
            <span>{PROVIDER_LABELS[provider]} tersedia mulai paket {cheapestPlanFor(provider)?.name}.</span>
            <Link href="/pricing" className="px-3 py-1.5 rounded-lg bg-[var(--accent)] text-neutral-950 font-bold">Upgrade</Link>
          </div>
        )}

        <div className="space-y-2">
          <span className="text-xs font-semibold text-[var(--muted)] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" /> Contoh pertanyaan
          </span>
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => send(q)}
                disabled={loading || isLocked(provider)}
                className="text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)] text-[var(--text)] text-left disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] min-h-[440px] flex flex-col justify-between gap-4">
          <div className="space-y-4 overflow-y-auto max-h-[520px] pr-1" aria-live="polite">
            {messages.length === 0 && (
              <p className="text-xs text-[var(--muted)]">
                Halo {agent.name.split(" ")[0]}, pilih model di atas lalu tanyakan apa saja soal listing, negosiasi, atau follow-up klien.
              </p>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`flex gap-3 text-xs ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" && (
                  <div className="w-8 h-8 rounded-lg bg-[var(--accent)] text-neutral-950 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div className={`p-3.5 rounded-2xl max-w-xl leading-relaxed whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-[var(--accent)] text-neutral-950"
                    : m.failed
                      ? "bg-rose-500/10 border border-rose-500/30 text-[var(--text)]"
                      : "bg-[var(--bg)] border border-[var(--border)] text-[var(--text)]"
                }`}>
                  <p>{m.text}</p>
                  {m.role === "assistant" && m.provider && !m.failed && (
                    <div className="mt-1.5 text-[10px] font-mono text-[var(--muted)]">
                      {PROVIDER_LABELS[m.provider]}{m.model && m.model !== "demo" ? ` · ${m.model}` : " · demo"}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[var(--accent)]" />
                <span>{PROVIDER_LABELS[provider]} sedang menjawab...</span>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); void send(); }}
            className="flex gap-2 pt-4 border-t border-[var(--border)]"
          >
            <input
              type="text"
              value={input}
              maxLength={4000}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Tanya ${PROVIDER_LABELS[provider]}...`}
              className="flex-1 px-4 py-3 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-xs text-[var(--text)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            />
            <button
              type="submit"
              disabled={loading || !input.trim() || isLocked(provider)}
              className="px-5 py-3 bg-[var(--accent)] text-neutral-950 rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Kirim</span>
            </button>
          </form>
        </div>
        <p className="text-[11px] text-[var(--muted)]">
          Jawaban AI bisa keliru. Cek ulang data harga, legalitas, dan perhitungan KPR sebelum dikirim ke klien.
        </p>
      </div>
    </WorkspaceShell>
  );
}
