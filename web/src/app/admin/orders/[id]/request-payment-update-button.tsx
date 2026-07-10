"use client";

import { useState } from "react";
import { requestPaymentUpdateAction } from "@/app/actions/admin";

export function RequestPaymentUpdateButton({ orderId }: { orderId: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleClick() {
    if (!confirm("Email the customer a link to update the payment card for this order?")) return;
    setStatus("loading");
    const res = await requestPaymentUpdateAction(orderId);
    setStatus(res.ok ? "ok" : "error");
    setMessage(res.message);
  }

  if (status === "ok") {
    return <p className="mt-2 text-xs font-medium text-teal-700">✓ {message}</p>;
  }

  return (
    <div className="mt-2">
      <button
        onClick={handleClick}
        disabled={status === "loading"}
        className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium text-teal-800 hover:bg-teal-50 disabled:opacity-50"
      >
        {status === "loading" ? "Sending…" : "Request updated payment"}
      </button>
      {status === "error" && message ? (
        <p className="mt-1 text-xs text-red-600">{message}</p>
      ) : null}
    </div>
  );
}
