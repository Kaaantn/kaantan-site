"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, Check } from "lucide-react";

const SERVICES = [
  "Web sitesi",
  "E-ticaret (ikas / Shopify)",
  "Süreç otomasyonu",
  "Yapay zeka entegrasyonu",
  "Meta & TikTok reklam",
  "Chrome eklentisi / uygulama",
];
const TIMES = ["Acil (1-2 hafta)", "Bu ay içinde", "Acelem yok"];

// İletişim bölümündeki "projeni anlat" sihirbazı: seçimlerden hazır bir WhatsApp mesajı üretir.
export default function ProjectWizard() {
  const [picked, setPicked] = useState<string[]>([]);
  const [time, setTime] = useState<string>("");
  const [name, setName] = useState("");
  const [note, setNote] = useState("");

  const message = useMemo(() => {
    const lines = [`Merhaba Kaan, ben ${name.trim() || "[adım]"}.`];
    lines.push(
      picked.length
        ? `Şu konuda bir projem var: ${picked.join(", ")}.`
        : "Bir proje hakkında konuşmak istiyorum."
    );
    if (time) lines.push(`Zamanlama: ${time}.`);
    if (note.trim()) lines.push(`Detay: ${note.trim()}`);
    return lines.join("\n");
  }, [picked, time, name, note]);

  const toggle = (s: string) =>
    setPicked((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  const href = `https://wa.me/905422979212?text=${encodeURIComponent(message)}`;

  return (
    <div className="pw">
      <div className="pw-step">
        <div className="pw-label">
          <span>1</span> Ne lazım?
        </div>
        <div className="pw-chips">
          {SERVICES.map((s) => (
            <button
              key={s}
              type="button"
              className={picked.includes(s) ? "is-on" : ""}
              aria-pressed={picked.includes(s)}
              onClick={() => toggle(s)}
            >
              {picked.includes(s) && <Check size={14} />}
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="pw-step">
        <div className="pw-label">
          <span>2</span> Ne zaman?
        </div>
        <div className="pw-chips">
          {TIMES.map((t) => (
            <button
              key={t}
              type="button"
              className={time === t ? "is-on" : ""}
              aria-pressed={time === t}
              onClick={() => setTime(time === t ? "" : t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="pw-step pw-fields">
        <div className="pw-label">
          <span>3</span> Kısaca anlat <em>(isteğe bağlı)</em>
        </div>
        <input
          type="text"
          placeholder="Adın"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-label="Adın"
          maxLength={60}
        />
        <textarea
          placeholder="Ne yapmak istiyorsun? Örn. butik mağazam için e-ticaret sitesi"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          aria-label="Proje detayı"
          rows={3}
          maxLength={400}
        />
      </div>

      <div className="pw-preview" aria-live="polite">
        <div className="pw-preview-head">Gidecek mesaj</div>
        <pre>{message}</pre>
      </div>

      <a href={href} target="_blank" rel="noopener" className="sx-btn sx-btn-accent pw-send">
        WhatsApp&apos;tan gönder <ArrowUpRight size={17} />
      </a>
    </div>
  );
}
