"use client";

import { useEffect, useRef, useState } from "react";

// Hero'daki etkileşimli "atölye" penceresi: 4 sekme, otomatik döner, fareyle hafifçe eğilir.
const TABS = [
  {
    id: "web",
    label: "Web sitesi",
    title: "Hızlı, mobil uyumlu, aramada bulunur",
    tag: "Kurumsal · Portföy",
  },
  {
    id: "shop",
    label: "E-ticaret",
    title: "ikas ve Shopify mağaza kurulumu",
    tag: "İş ortağı desteğiyle",
  },
  {
    id: "flow",
    label: "Otomasyon",
    title: "Elle yapılan işler kendiliğinden döner",
    tag: "Zaman kazandırır",
  },
  {
    id: "ads",
    label: "Reklam",
    title: "Meta ve TikTok kampanya yönetimi",
    tag: "Satışa odaklı",
  },
] as const;

const DURATION = 5200;
const URLS: Record<string, string> = { web: "web-sitesi", shop: "e-ticaret", flow: "otomasyon", ads: "reklam" };

export default function HeroWorkbench() {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setIdx((i) => (i + 1) % TABS.length), DURATION);
    return () => clearTimeout(t);
  }, [idx, paused]);

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return;
    const el = boxRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--ry", `${x * 6}deg`);
    el.style.setProperty("--rx", `${-y * 5}deg`);
  }
  function onLeave() {
    const el = boxRef.current;
    if (!el) return;
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--rx", "0deg");
    setPaused(false);
  }

  const tab = TABS[idx];

  return (
    <div
      className="hw"
      ref={boxRef}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      onPointerEnter={() => setPaused(true)}
    >
      <div className="hw-window">
        <div className="hw-bar">
          <span className="hw-dots">
            <i />
            <i />
            <i />
          </span>
          <span className="hw-url">kaantan.com.tr/{URLS[tab.id]}</span>
        </div>

        <div className="hw-tabs" role="tablist" aria-label="Neler yapıyorum">
          {TABS.map((t, i) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={i === idx}
              className={i === idx ? "is-on" : ""}
              onClick={() => setIdx(i)}
            >
              {t.label}
              {i === idx && !paused && <span className="hw-progress" style={{ animationDuration: `${DURATION}ms` }} />}
            </button>
          ))}
        </div>

        <div className="hw-stage" key={tab.id}>
          {tab.id === "web" && (
            <div className="hw-pane hw-web">
              <div className="hw-web-nav">
                <b />
                <span />
                <span />
                <span />
              </div>
              <div className="hw-web-hero">
                <i className="w70" />
                <i className="w50" />
                <em />
              </div>
              <div className="hw-web-cards">
                <div />
                <div />
                <div />
              </div>
            </div>
          )}

          {tab.id === "shop" && (
            <div className="hw-pane hw-shop">
              {[
                ["Deri ceket", "2.490 ₺"],
                ["Sneaker", "1.850 ₺"],
                ["Kaşe kaban", "3.290 ₺"],
                ["Çanta", "1.190 ₺"],
              ].map(([name, price], i) => (
                <div key={name} className="hw-prod" style={{ animationDelay: `${i * 90}ms` }}>
                  <div className="hw-prod-img" />
                  <span>{name}</span>
                  <b>{price}</b>
                </div>
              ))}
              <div className="hw-cart">Sepete eklendi ✓</div>
            </div>
          )}

          {tab.id === "flow" && (
            <div className="hw-pane hw-flow">
              {[
                ["Yeni sipariş", "Mağazadan"],
                ["Stok güncelle", "Otomatik"],
                ["Müşteriye bildir", "WhatsApp / e-posta"],
              ].map(([a, b], i) => (
                <div key={a} className="hw-node" style={{ animationDelay: `${i * 380}ms` }}>
                  <em>{i + 1}</em>
                  <div>
                    <strong>{a}</strong>
                    <span>{b}</span>
                  </div>
                  <u style={{ animationDelay: `${i * 380 + 420}ms` }}>✓</u>
                </div>
              ))}
            </div>
          )}

          {tab.id === "ads" && (
            <div className="hw-pane hw-ads">
              <div className="hw-bars">
                {[34, 52, 44, 68, 60, 86].map((h, i) => (
                  <i key={i} style={{ height: `${h}%`, animationDelay: `${i * 90}ms` }} />
                ))}
              </div>
              <div className="hw-ads-legend">
                <span>Gösterim</span>
                <span>Tıklama</span>
                <span>Satış</span>
              </div>
            </div>
          )}
        </div>

        <div className="hw-caption">
          <strong>{tab.title}</strong>
          <span>{tab.tag}</span>
        </div>
      </div>

      <div className="hw-stamp hw-stamp-a">
        ikas
        <small>İş Ortağı</small>
      </div>
      <div className="hw-stamp hw-stamp-b">
        Shopify
        <small>İş Ortağı</small>
      </div>
    </div>
  );
}
