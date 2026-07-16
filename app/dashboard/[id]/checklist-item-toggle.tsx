"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ChecklistItemToggle({ id, label, received }: { id: string; label: string; received: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    try {
      await fetch(`/api/dashboard/checklist-items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ received: !received }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" checked={received} disabled={loading} onChange={handleToggle} />
      {label}
    </label>
  );
}
