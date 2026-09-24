"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

// Masaüstünde ortada pencere, mobilde alttan açılan sayfa. Esc ve arka plana tıklayınca kapanır.
export default function Modal({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="cp-modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`cp-modal${wide ? " is-wide" : ""}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="cp-modal-head">
          <h2>{title}</h2>
          <button className="cp-icon-btn" onClick={onClose} aria-label="Kapat">
            <X size={18} />
          </button>
        </div>
        <div className="cp-modal-body">{children}</div>
      </div>
    </div>
  );
}
