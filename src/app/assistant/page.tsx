"use client";

import React, { useState } from "react";
import {
  Bot,
  Send,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { useAgentStore } from "@/lib/store";

interface ChatMessage {
  id: string;
  sender: "agent" | "ai";
  text: string;
  time: string;
}

const QUICK_PROMPTS = [
  "Bagaimana cara menangani pembeli yang menawar terlalu sadis?",
  "Jelaskan kelebihan SHM vs HGB untuk meyakinkan pembeli keluarga",
  "Pesan follow-up untuk klien yang sudah 3 hari tidak balas chat",
  "Pertanyaan kualifikasi budget pembeli agar tidak buang waktu survei",
];

export default function AssistantPage() {
  const { agent, listings, locale, recordAiUsage } = useAgentStore();
  const msgCounter = React.useRef(100);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      sender: "ai",
      text: `Halo ${agent.name}! Saya Codematt Agent Copilot. Saya siap membantu Anda menyusun skrip negosiasi harga, menangani keberatan klien, atau menganalisis strategi listing di portofolio Anda. Apa yang ingin kita diskusikan hari ini?`,
      time: "Baru saja",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || loading) return;

    msgCounter.current += 1;
    const userMsg: ChatMessage = {
      id: `usr-${msgCounter.current}`,
      sender: "agent",
      text: textToSend,
      time: "Sekarang",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    recordAiUsage();

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "assistant",
          locale,
          instructions: `Real estate negotiation assistant answering: ${textToSend}`,
          facts: {
            agent_name: agent.name,
            agent_agency: agent.agency,
            portfolio_count: listings.length,
          },
        }),
      });

      const json = await response.json();
      let replyText = "";
      if (json.ok && json.data) {
        if (typeof json.data === "string") replyText = json.data;
        else if (json.data.response) replyText = json.data.response;
        else replyText = JSON.stringify(json.data);
      } else {
        replyText = "Maaf, terjadi kendala saat memproses permintaan. Silakan coba kembali.";
      }

      msgCounter.current += 1;
      const aiMsg: ChatMessage = {
        id: `ai-${msgCounter.current}`,
        sender: "ai",
        text: replyText,
        time: "Sekarang",
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <WorkspaceShell
      title={locale === "id" ? "AI Property Assistant" : "AI Property Assistant"}
      subtitle={locale === "id" ? "Copilot negosiasi, skrip closing, dan konsultasi legalitas properti" : "Negotiation copilot, closing scripts, and legal guidance"}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Quick Suggestion Chips */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-[var(--muted)] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Topik Diskusi Cepat:</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(q)}
                className="text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)] text-[var(--text)] transition-colors text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Feed */}
        <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] min-h-[460px] flex flex-col justify-between space-y-4">
          <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 text-xs ${m.sender === "agent" ? "justify-end" : "justify-start"}`}
              >
                {m.sender === "ai" && (
                  <div className="w-8 h-8 rounded-lg bg-[var(--accent)] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`p-4 rounded-2xl max-w-xl space-y-1.5 leading-relaxed whitespace-pre-wrap ${
                    m.sender === "agent"
                      ? "bg-[var(--accent)] text-white"
                      : "bg-[var(--bg)] border border-[var(--border)] text-[var(--text)]"
                  }`}
                >
                  <p>{m.text}</p>
                  <div
                    className={`text-[10px] text-right font-mono ${
                      m.sender === "agent" ? "text-white/70" : "text-[var(--muted)]"
                    }`}
                  >
                    {m.time}
                  </div>
                </div>

                {m.sender === "agent" && (
                  <div className="w-8 h-8 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    {agent.name.split(" ")[0][0]}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 items-center text-xs text-[var(--muted)]">
                <div className="w-8 h-8 rounded-lg bg-[var(--accent)] text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-[var(--bg)] border border-[var(--border)]">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[var(--accent)]" />
                  <span>Codematt Copilot sedang menganalisis strategi...</span>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <div className="pt-4 border-t border-[var(--border)]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tanyakan skrip closing, cara tangani komplain, atau simulasi KPR..."
                className="flex-1 px-4 py-3 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-xs text-[var(--text)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-5 py-3 bg-[var(--accent)] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:opacity-90 disabled:opacity-50 transition-opacity shadow-xs"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Kirim</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}
