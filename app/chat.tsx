'use client'

import { useState } from "react";
import { askRAG } from "./rag-action";

type Msg = { role: "user" | "bot"; text: string };

export default function Chat() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  async function send() {
    const q = input.trim();
    if (!q || busy) return;
    setInput("");
    setBusy(true);
    setMsgs(m => [...m, { role: "user", text: q }]);
    try {
      const answer = await askRAG(q);
      setMsgs(m => [...m, { role: "bot", text: answer }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: 16 }}>
      <div style={{ minHeight: 240, border: "1px solid #ddd", borderRadius: 8, padding: 12, overflowY: "auto" }}>
        {msgs.map((m, i) => (
          <p key={i} style={{ textAlign: m.role === "user" ? "right" : "left" }}>
            <span style={{ background: m.role === "user" ? "#e8f0fe" : "#f1f1f1", padding: "6px 10px", borderRadius: 8, display: "inline-block" }}>
              {m.text}
            </span>
          </p>
        ))}
        {busy && <p>...</p>}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Apna sawal likhein..."
          style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
        />
        <button onClick={send} disabled={busy} style={{ padding: "10px 16px", borderRadius: 8 }}>
          Send
        </button>
      </div>
    </div>
  );
}
