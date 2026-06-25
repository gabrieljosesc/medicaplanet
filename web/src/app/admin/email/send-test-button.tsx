"use client";

import { useState } from "react";
import { sendTestEmailAction } from "@/app/actions/admin";

export function SendTestEmailButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleClick() {
    setStatus("loading");
    setMessage("");
    const res = await sendTestEmailAction();
    setStatus(res.ok ? "ok" : "error");
    setMessage(res.message);
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={status === "loading"}
        className="rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-50"
      >
        {status === "loading" ? "Sending…" : "Send test email to myself"}
      </button>
      {message && (
        <p
          className={`mt-3 text-sm ${status === "ok" ? "text-teal-700" : "text-red-600"}`}
        >
          {status === "ok" ? "✓ " : "✗ "}
          {message}
        </p>
      )}
    </div>
  );
}
