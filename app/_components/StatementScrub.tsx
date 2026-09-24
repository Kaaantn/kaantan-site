"use client";

import { useEffect, useRef, useState } from "react";

// Kaydırdıkça kelime kelime koyulaşan manifesto metni.
export default function StatementScrub({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [progress, setProgress] = useState(0);
  const words = text.split(" ");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Hareket azaltma açıksa metin baştan tam koyu kalır (is-ready eklenmez).
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.classList.add("is-ready");
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.85;
      const end = vh * 0.3;
      const p = (start - r.top) / (start - end + r.height * 0.6);
      setProgress(Math.max(0, Math.min(1, p)));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const lit = Math.round(progress * words.length);

  return (
    <p ref={ref} className="ss">
      {words.map((w, i) => (
        <span key={i} className={i < lit ? "on" : ""}>
          {w}{" "}
        </span>
      ))}
    </p>
  );
}
