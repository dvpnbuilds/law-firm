"use client";

import { useState } from "react";

type ChatMessage = { role: "user" | "assistant"; content: string };

const GREETING = "Hi, I'm the Alden & Cross intake assistant. To get started, could you briefly describe what's going on?";

export default function WidgetPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: "assistant", content: GREETING }]);
  const [input, setInput] = useState("");
  const [intakeId, setIntakeId] = useState<string | null>(null);
  const [complete, setComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading || complete) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/intake/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intakeId, message: text }),
      });
      if (!res.ok) throw new Error("Something went wrong. Please try again.");
      const data = await res.json();
      setIntakeId(data.intakeId);
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      setComplete(data.complete);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col p-4">
      <h1 className="mb-1 text-lg font-semibold">Alden & Cross Legal — Intake</h1>
      <p className="mb-4 text-xs text-gray-500">
        This assistant collects general intake info and answers firm/process questions. It never gives legal advice
        — questions about your specific case are flagged for an attorney to follow up personally.
      </p>
      <div className="flex-1 space-y-3 overflow-y-auto rounded-lg border p-4">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <span
              className={`inline-block max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm ${
                m.role === "user" ? "bg-black text-white" : "bg-gray-100 text-black"
              }`}
            >
              {m.content}
            </span>
          </div>
        ))}
        {loading && <p className="text-xs text-gray-400">Thinking…</p>}
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {complete ? (
        <p className="mt-4 rounded-lg border border-dashed p-4 text-center text-sm text-gray-500">
          Intake complete. Thanks for reaching out to Alden & Cross Legal.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message…"
            className="flex-1 rounded border px-3 py-2 text-sm"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            Send
          </button>
        </form>
      )}
    </main>
  );
}
