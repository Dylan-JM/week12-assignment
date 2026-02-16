"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProposalForm({ jobId }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/chat/proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, message: message.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed to send proposal");
        return;
      }
      setOpen(false);
      setMessage("");
      if (data.channelSlug) router.push(`/chat/${data.channelSlug}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md bg-[rgb(0,153,255)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
      >
        Create proposal
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-lg">
            <h3 className="mb-3 text-lg font-semibold">Send a proposal</h3>
            <form onSubmit={handleSubmit}>
              <label className="mb-1 block text-sm text-gray-600">Your message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={4}
                className="mb-3 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="Introduce yourself and describe your approach..."
              />
              {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setOpen(false); setError(null); }}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-md bg-[rgb(0,153,255)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                >
                  {submitting ? "Sending…" : "Send proposal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
