"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

/**
 * 1:1 port of the original index.html's inline <script> block: custom cursor,
 * magnetic buttons, Lenis smooth scroll, GSAP ScrollTrigger reveals, animated
 * counters, marquee/statement scrub, dot-nav active state, mobile menu,
 * smooth anchor scrolling, floating hero particles. Same DOM ids/classes as
 * app/page.tsx so this attaches to the server-rendered markup after mount.
 */
export default function HomeAnimations() {
  useEffect(() => {
    document.body.classList.add("cursor-none");
    gsap.registerPlugin(ScrollTrigger);
    const IS_TOUCH = window.matchMedia("(pointer: coarse)").matches;
    const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ── LENIS ── */
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
    });
    lenis.on("scroll", ScrollTrigger.update);
    const lenisTick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(lenisTick);
    gsap.ticker.lagSmoothing(0);

    const cleanupFns: Array<() => void> = [];

    /* ── CURSOR + MAGNETIC ── */
    if (!IS_TOUCH) {
      const dot = document.getElementById("c-dot");
      const ring = document.getElementById("c-ring");
      const glow = document.getElementById("cursorGlow");
      let mx = -200,
        my = -200,
        rx = -200,
        ry = -200;
      const onMouseMove = (e: MouseEvent) => {
        mx = e.clientX;
        my = e.clientY;
        if (dot) {
          dot.style.left = mx + "px";
          dot.style.top = my + "px";
        }
        if (glow) {
          glow.style.left = mx + "px";
          glow.style.top = my + "px";
        }
      };
      document.addEventListener("mousemove", onMouseMove);
      cleanupFns.push(() => document.removeEventListener("mousemove", onMouseMove));

      let ringRaf = 0;
      (function rafRing() {
        rx += (mx - rx) * 0.1;
        ry += (my - ry) * 0.1;
        if (ring) {
          ring.style.left = rx + "px";
          ring.style.top = ry + "px";
        }
        ringRaf = requestAnimationFrame(rafRing);
      })();
      cleanupFns.push(() => cancelAnimationFrame(ringRaf));

      document
        .querySelectorAll("a, button, .tag, .step, .service-card, .project-card, .dot-link")
        .forEach((el) => {
          const enter = () => document.body.classList.add("cur-hover");
          const leave = () => document.body.classList.remove("cur-hover");
          el.addEventListener("mouseenter", enter);
          el.addEventListener("mouseleave", leave);
          cleanupFns.push(() => {
            el.removeEventListener("mouseenter", enter);
            el.removeEventListener("mouseleave", leave);
          });
        });

      document.querySelectorAll("#contact a, #contact button, footer a").forEach((el) => {
        const enter = () => document.body.classList.add("cur-dark");
        const leave = () => document.body.classList.remove("cur-dark");
        el.addEventListener("mouseenter", enter);
        el.addEventListener("mouseleave", leave);
        cleanupFns.push(() => {
          el.removeEventListener("mouseenter", enter);
          el.removeEventListener("mouseleave", leave);
        });
      });

      document
        .querySelectorAll(".btn-primary, .btn-secondary, .btn-whatsapp, .nav-cta, .project-link")
        .forEach((btn) => {
          const enter = () => {
            document.body.classList.remove("cur-hover");
            document.body.classList.add("cur-btn");
          };
          const leave = () => {
            document.body.classList.remove("cur-btn");
            gsap.to(btn, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.35)" });
          };
          const move = (e: Event) => {
            const me = e as MouseEvent;
            const r = (btn as HTMLElement).getBoundingClientRect();
            const x = me.clientX - r.left - r.width * 0.5;
            const y = me.clientY - r.top - r.height * 0.5;
            gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.4, ease: "power2.out" });
          };
          btn.addEventListener("mouseenter", enter);
          btn.addEventListener("mouseleave", leave);
          btn.addEventListener("mousemove", move);
          cleanupFns.push(() => {
            btn.removeEventListener("mouseenter", enter);
            btn.removeEventListener("mouseleave", leave);
            btn.removeEventListener("mousemove", move);
          });
        });
    }

    /* ── CHAR SPLIT (headings) ── */
    function splitHeadingChars(el: Element) {
      el.setAttribute("aria-label", el.textContent || "");
      const parts = el.innerHTML.split(/<br\s*\/?>/i);
      el.innerHTML = "";
      const inners: HTMLSpanElement[] = [];
      parts.forEach((part, li) => {
        const tmp = document.createElement("span");
        tmp.innerHTML = part;
        const text = tmp.textContent || "";
        text.split("").forEach((char) => {
          const wrap = document.createElement("span");
          const inner = document.createElement("span");
          wrap.className = "char-wrap";
          inner.className = "char-inner";
          inner.textContent = char === " " ? " " : char;
          wrap.appendChild(inner);
          el.appendChild(wrap);
          inners.push(inner);
        });
        if (li < parts.length - 1) el.appendChild(document.createElement("br"));
      });
      return inners;
    }

    /* ── WORD SPLIT (statement scrub) ── */
    function splitWords(el: Element) {
      const text = (el.textContent || "").trim();
      el.innerHTML = text
        .split(/\s+/)
        .map((w) => `<span class="word">${w}</span>`)
        .join(" ");
      return el.querySelectorAll(".word");
    }

    /* ── HERO (instant, no intro animation) ── */
    gsap.set(
      [".hero-eyebrow", ".hero-name .line-2", ".hero-sub", ".hero-actions", ".trust-row", ".scroll-hint", ".float-card"],
      { opacity: 1, y: 0 }
    );

    /* ── HERO PARALLAX ── */
    gsap.to(".blob-1", {
      scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: 2 },
      y: -130,
      x: 40,
      ease: "none",
    });
    gsap.to(".blob-2", {
      scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: 1.5 },
      y: -80,
      ease: "none",
    });
    gsap.to(".hero-content", {
      scrollTrigger: { trigger: "#hero", start: "top top", end: "65% top", scrub: 1.2 },
      y: -80,
      opacity: 0,
      ease: "none",
    });

    /* ── SECTION HEADINGS ── */
    document.querySelectorAll(".section-title").forEach((el) => {
      const chars = splitHeadingChars(el);
      gsap.set(chars, { yPercent: 115, opacity: 0 });
      ScrollTrigger.create({
        trigger: el,
        start: "top 88%",
        once: true,
        onEnter: () => gsap.to(chars, { yPercent: 0, opacity: 1, duration: 0.75, stagger: 0.018, ease: "power4.out" }),
      });
    });
    document.querySelectorAll(".section-eyebrow").forEach((el) => {
      gsap.from(el, { scrollTrigger: { trigger: el, start: "top 90%", once: true }, opacity: 0, y: 12, duration: 0.6, ease: "power2.out" });
    });

    /* ── ANIMATED COUNTERS ── */
    function animateCounters(container: Element) {
      container.querySelectorAll<HTMLElement>(".count").forEach((el) => {
        const to = parseFloat(el.dataset.to || "0");
        const obj = { val: 0 };
        gsap.to(obj, {
          val: to,
          duration: 1.7,
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = String(Math.round(obj.val));
          },
        });
      });
    }
    const statsBar = document.querySelector(".stats-bar");
    const heroVisual = document.querySelector(".hero-visual");
    if (statsBar) {
      ScrollTrigger.create({ trigger: statsBar, start: "top 85%", once: true, onEnter: () => animateCounters(statsBar) });
      gsap.from(".stat-item", { scrollTrigger: { trigger: statsBar, start: "top 88%", once: true }, y: 36, opacity: 0, duration: 0.85, stagger: 0.12, ease: "power3.out" });
    }
    if (heroVisual) {
      ScrollTrigger.create({ trigger: heroVisual, start: "top 90%", once: true, onEnter: () => animateCounters(heroVisual) });
    }

    /* ── STATEMENT SCRUB ── */
    const statementEl = document.getElementById("statementText");
    if (statementEl) {
      const statementWords = splitWords(statementEl);
      gsap.to(statementWords, {
        color: "#F5F3F8",
        stagger: 0.04,
        ease: "none",
        scrollTrigger: { trigger: ".statement", start: "top 75%", end: "bottom 60%", scrub: 0.6 },
      });
    }

    /* ── DOT NAV ACTIVE STATE ── */
    const dotLinks = document.querySelectorAll(".dot-link");
    ["about", "ikas", "services", "projects", "process", "contact"].forEach((id) => {
      const sec = document.getElementById(id);
      if (!sec) return;
      ScrollTrigger.create({
        trigger: sec,
        start: "top 55%",
        end: "bottom 55%",
        onToggle: (self) => {
          if (self.isActive) dotLinks.forEach((l) => l.classList.toggle("active", (l as HTMLElement).dataset.target === id));
        },
      });
    });

    /* ── ABOUT ── */
    gsap.from(".about-visual", { scrollTrigger: { trigger: ".about-grid", start: "top 80%", once: true }, x: -60, opacity: 0, duration: 1.05, ease: "power4.out" });
    gsap.from(".about-body", { scrollTrigger: { trigger: ".about-text", start: "top 82%", once: true }, x: 60, opacity: 0, duration: 1.05, ease: "power4.out" });
    gsap.from(".tag", { scrollTrigger: { trigger: ".skill-tags", start: "top 88%", once: true }, y: 20, opacity: 0, duration: 0.5, stagger: 0.05, ease: "power3.out" });

    /* ── HAKKINDA ── */
    gsap.from(".hk-bio-p", { scrollTrigger: { trigger: ".hk-bio", start: "top 82%", once: true }, y: 24, opacity: 0, duration: 0.6, ease: "power3.out" });
    gsap.from(".hk-contact-item", { scrollTrigger: { trigger: ".hk-side", start: "top 82%", once: true }, x: 24, opacity: 0, duration: 0.5, ease: "power3.out" });
    gsap.from(".hk-social-link", { scrollTrigger: { trigger: ".hk-social-grid", start: "top 88%", once: true }, y: 16, opacity: 0, duration: 0.45, ease: "power3.out" });

    /* ── IKAS ── */
    gsap.from(".ikas-item", { scrollTrigger: { trigger: ".ikas-list", start: "top 85%", once: true }, x: -30, opacity: 0, duration: 0.6, stagger: 0.09, ease: "power3.out" });
    gsap.from(".ikas-card", { scrollTrigger: { trigger: ".ikas-card", start: "top 82%", once: true }, x: 50, opacity: 0, duration: 0.9, ease: "power4.out" });

    /* ── SERVICES ── */
    gsap.from(".services-header .section-desc", { scrollTrigger: { trigger: ".services-header", start: "top 82%", once: true }, x: 36, opacity: 0, duration: 0.75, ease: "power3.out" });
    gsap.from(".service-card", { scrollTrigger: { trigger: ".services-grid", start: "top 82%", once: true }, y: 60, opacity: 0, duration: 0.8, stagger: 0.08, ease: "power3.out" });

    /* ── PROJECTS ── */
    gsap.from(".project-card", { scrollTrigger: { trigger: ".projects-grid", start: "top 82%", once: true }, y: 60, opacity: 0, duration: 0.8, stagger: 0.11, ease: "power3.out" });

    if (!IS_TOUCH) {
      document.querySelectorAll<HTMLElement>(".project-card, .service-card").forEach((card) => {
        const move = (e: Event) => {
          const me = e as MouseEvent;
          const r = card.getBoundingClientRect();
          const nx = (me.clientX - r.left) / r.width - 0.5;
          const ny = (me.clientY - r.top) / r.height - 0.5;
          gsap.to(card, { rotateY: nx * 8, rotateX: -ny * 8, transformPerspective: 900, duration: 0.45, ease: "power2.out" });
        };
        const leave = () => gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.9, ease: "elastic.out(1, 0.38)" });
        card.addEventListener("mousemove", move);
        card.addEventListener("mouseleave", leave);
        cleanupFns.push(() => {
          card.removeEventListener("mousemove", move);
          card.removeEventListener("mouseleave", leave);
        });
      });
    }

    /* ── PROCESS ── */
    gsap.from(".step", { scrollTrigger: { trigger: ".process-steps", start: "top 82%", once: true }, y: 50, opacity: 0, duration: 0.7, stagger: 0.13, ease: "power3.out" });

    /* ── CONTACT ── */
    gsap.from(".contact-text", { scrollTrigger: { trigger: ".contact-grid", start: "top 80%", once: true }, x: -60, opacity: 0, duration: 1.05, ease: "power4.out" });
    gsap.from(".contact-cta-box", { scrollTrigger: { trigger: ".contact-grid", start: "top 80%", once: true }, x: 60, opacity: 0, duration: 1.05, ease: "power4.out", delay: 0.08 });
    gsap.from(".contact-detail", { scrollTrigger: { trigger: ".contact-text", start: "top 78%", once: true }, x: -28, opacity: 0, duration: 0.55, stagger: 0.11, ease: "power3.out", delay: 0.28 });

    /* ── NAV SCROLL SHRINK ── */
    const navbar = document.getElementById("navbar");
    const onScroll = () => navbar?.classList.toggle("scrolled", window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    cleanupFns.push(() => window.removeEventListener("scroll", onScroll));

    /* ── MOBILE MENU ── */
    const burgerBtn = document.getElementById("burgerBtn");
    function toggleMenu(open?: boolean) {
      const isOpen = open !== undefined ? open : !document.body.classList.contains("menu-open");
      document.body.classList.toggle("menu-open", isOpen);
      burgerBtn?.setAttribute("aria-expanded", String(isOpen));
      if (isOpen) lenis.stop();
      else lenis.start();
    }
    const onBurgerClick = () => toggleMenu();
    burgerBtn?.addEventListener("click", onBurgerClick);
    cleanupFns.push(() => burgerBtn?.removeEventListener("click", onBurgerClick));

    const mobileMenuLinks = document.querySelectorAll("#mobileMenu a");
    const onMobileLinkClick = () => toggleMenu(false);
    mobileMenuLinks.forEach((a) => a.addEventListener("click", onMobileLinkClick));
    cleanupFns.push(() => mobileMenuLinks.forEach((a) => a.removeEventListener("click", onMobileLinkClick)));

    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === "Escape") toggleMenu(false);
    };
    document.addEventListener("keydown", onKeydown);
    cleanupFns.push(() => document.removeEventListener("keydown", onKeydown));

    /* ── SMOOTH ANCHOR LINKS ── */
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    const anchorHandlers: Array<[Element, (e: Event) => void]> = [];
    anchorLinks.forEach((a) => {
      const handler = (e: Event) => {
        const href = a.getAttribute("href");
        if (!href || href === "#") return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          lenis.scrollTo(target as HTMLElement, { offset: -80, duration: 1.5 });
        }
      };
      a.addEventListener("click", handler);
      anchorHandlers.push([a, handler]);
    });
    cleanupFns.push(() => anchorHandlers.forEach(([a, h]) => a.removeEventListener("click", h)));

    /* ── FLOATING PARTICLES ── */
    let particleInterval: ReturnType<typeof setInterval> | undefined;
    if (!REDUCED_MOTION) {
      const heroEl = document.getElementById("hero");
      function spawnParticle() {
        if (!heroEl) return;
        const p = document.createElement("div");
        Object.assign(p.style, {
          position: "absolute",
          left: Math.random() * 100 + "%",
          bottom: "80px",
          width: 2 + Math.random() * 2 + "px",
          height: 2 + Math.random() * 2 + "px",
          borderRadius: "50%",
          background: "var(--lime-400)",
          opacity: "0",
          zIndex: "1",
          pointerEvents: "none",
        });
        const dur = 3 + Math.random() * 4;
        p.animate(
          [
            { transform: "translateY(0) translateX(0)", opacity: 0 },
            { opacity: 0.55, offset: 0.12 },
            { opacity: 0.25, offset: 0.88 },
            { transform: "translateY(-130px) translateX(18px)", opacity: 0 },
          ],
          { duration: dur * 1000, easing: "linear" }
        );
        heroEl.appendChild(p);
        setTimeout(() => p.remove(), (dur + 0.2) * 1000);
      }
      particleInterval = setInterval(spawnParticle, 650);
      for (let i = 0; i < 5; i++) spawnParticle();
    }

    /* ── REFRESH AFTER IMAGES LOAD ──
       Images (about photo, project logos) load asynchronously and shift
       layout after ScrollTrigger has already measured trigger positions,
       which otherwise leaves elements like .about-visual stuck at their
       animated-out "from" state. Re-measure once everything has painted. */
    const images = Array.from(document.querySelectorAll("img"));
    const pending = images.filter((img) => !img.complete);
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;
    const scheduleRefresh = () => {
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 50);
    };
    pending.forEach((img) => img.addEventListener("load", scheduleRefresh, { once: true }));
    scheduleRefresh();
    cleanupFns.push(() => {
      clearTimeout(refreshTimer);
      pending.forEach((img) => img.removeEventListener("load", scheduleRefresh));
    });

    return () => {
      document.body.classList.remove("cursor-none");
      cleanupFns.forEach((fn) => fn());
      if (particleInterval) clearInterval(particleInterval);
      gsap.ticker.remove(lenisTick);
      ScrollTrigger.getAll().forEach((t) => t.kill());
      lenis.destroy();
    };
  }, []);

  return null;
}
