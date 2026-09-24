"use client";

// Alt ortada beliren kısa bildirim. msg boşsa gizlenir.
export default function Toast({ msg, bad = false }: { msg: string; bad?: boolean }) {
  return (
    <div className={`cp-toast${msg ? " is-on" : ""}${bad ? " is-bad" : ""}`} role="status" aria-live="polite">
      {msg}
    </div>
  );
}
