"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SendReminderButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    setLoading(true);
    try {
      await fetch(`/api/dashboard/reminders/${id}/send`, { method: "POST" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleSend}
      disabled={loading}
      className="rounded border px-2 py-1 text-xs disabled:opacity-50"
    >
      Send
    </button>
  );
}
