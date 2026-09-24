"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Sayfadaki [data-reveal] öğelerini görünür olunca .is-in ile açar,
// [data-count] öğelerindeki sayıları 0'dan hedefe saydırır.
// İçerik SSR ile HTML'de zaten var; gizleme yalnızca JS çalışınca (reveal-ready) başlar.
export default function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const counters = Array.from(document.querySelectorAll<HTMLElement>("[data-count]"));

    const runCounter = (el: HTMLElement) => {
      if (el.dataset.done) return;
      el.dataset.done = "1";
      const to = parseFloat(el.dataset.count || "0");
      if (reduced) {
        el.textContent = String(to);
        return;
      }
      const dur = 1400;
      const t0 = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = String(Math.round(to * eased));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const vh = window.innerHeight;
    els.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < vh * 0.95) el.classList.add("is-in");
    });
    root.classList.add("reveal-ready");

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          el.classList.add("is-in");
          if (el.hasAttribute("data-count")) runCounter(el);
          io.unobserve(el);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    els.forEach((el) => !el.classList.contains("is-in") && io.observe(el));
    counters.forEach((el) => io.observe(el));

    return () => io.disconnect();
  }, [pathname]);

  return null;
}
