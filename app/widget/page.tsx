"use client";

import { useState } from "react";

type ChatMessage = { role: "user" | "assistant"; content: string };
type ChecklistItem = { id: string; label: string; received: boolean };

const GREETING = "Hi, I'm the Alden & Cross intake assistant. To get started, could you briefly describe what's going on?";
const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL || "https://calendly.com/lexintake-demo/consultation";

export default function WidgetPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: "assistant", content: GREETING }]);
  const [input, setInput] = useState("");
  const [intakeId, setIntakeId] = useState<string | null>(null);
  const [complete, setComplete] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
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
      setStatus(data.status);
      if (data.summary) setSummary(data.summary);
      if (data.checklist) setChecklist(data.checklist);
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
        <div className="mt-4 space-y-4 rounded-lg border border-dashed p-4 text-sm">
          <p className="text-center text-gray-500">Intake complete. Thanks for reaching out to Alden & Cross Legal.</p>
          {summary && (
            <div>
              <h2 className="mb-1 font-semibold">Summary</h2>
              <p className="text-gray-700">{summary}</p>
            </div>
          )}
          {checklist.length > 0 && (
            <div>
              <h2 className="mb-1 font-semibold">Documents to gather</h2>
              <ul className="list-inside list-disc text-gray-700">
                {checklist.map((item) => (
                  <li key={item.id}>{item.label}</li>
                ))}
              </ul>
            </div>
          )}
          {status === "completed" && (
            <div>
              <h2 className="mb-1 font-semibold">Book a free consultation</h2>
              <iframe src={CALENDLY_URL} className="h-[600px] w-full rounded border" title="Book a consultation" />
            </div>
          )}
        </div>
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
