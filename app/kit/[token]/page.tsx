import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowUpRight, Mail, MapPin, MessageCircle } from "lucide-react";
import { PLATFORMS, getKit, tokenMatches, type Lang, type MediaKit } from "@/lib/mediaKit";
import styles from "../kit.module.css";
import PrintButton from "./PrintButton";

export const dynamic = "force-dynamic";

// Sayfanın sabit etiketleri iki dilde.
const T = {
  tr: {
    kit: "Medya Kiti",
    updated: "Güncelleme",
    platforms: "Platformlar",
    followers: "takipçi",
    views: "Son 28 gün izlenme",
    audience: "Kitle",
    countries: "Ülkeler",
    age: "Yaş aralığı",
    gender: "Cinsiyet",
    topics: "İçerik konuları",
    formats: "İş birliği formatları",
    brands: "Çalıştığım markalar",
    rates: "Paketler",
    contactTitle: "İş birliği için",
    contactText: "Bu kit güncel rakamlarla hazırlandı. Detayları konuşalım.",
    print: "PDF olarak kaydet",
    wa: "Merhaba Kaan, medya kitini inceledim, iş birliği hakkında konuşmak istiyorum.",
    title: "Kaan Tan — Medya Kiti",
    desc: "Kaan Tan'ın iş birliği medya kiti.",
    locale: "tr-TR",
  },
  en: {
    kit: "Media Kit",
    updated: "Updated",
    platforms: "Platforms",
    followers: "followers",
    views: "Views, last 28 days",
    audience: "Audience",
    countries: "Countries",
    age: "Age range",
    gender: "Gender",
    topics: "Content topics",
    formats: "Collaboration formats",
    brands: "Brands I've worked with",
    rates: "Packages",
    contactTitle: "Let's work together",
    contactText: "This kit is built with current numbers. Let's talk details.",
    print: "Save as PDF",
    wa: "Hi Kaan, I've seen your media kit and would like to talk about a collaboration.",
    title: "Kaan Tan — Media Kit",
    desc: "Kaan Tan's collaboration media kit.",
    locale: "en-GB",
  },
} as const;

const pickLang = (v: string | string[] | undefined): Lang => (v === "en" ? "en" : "tr");

// Özel sayfa: arama motorlarına kapalı, bağlantı gizli kodla açılır, dışarı Referer sızdırmaz
// (aksi halde sosyal hesap linklerine tıklayınca gizli adres o sitelere gönderilirdi).
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string | string[] }>;
}): Promise<Metadata> {
  const t = T[pickLang((await searchParams).lang)];
  return {
    title: t.title,
    description: t.desc,
    robots: { index: false, follow: false, noarchive: true, nosnippet: true },
    referrer: "no-referrer",
    openGraph: { title: t.title, description: t.desc, type: "website" },
  };
}

async function load(token: string): Promise<MediaKit | null> {
  try {
    const kit = await getKit();
    if (!kit || !kit.published || !tokenMatches(token, kit.shareToken)) return null;
    return kit;
  } catch {
    return null;
  }
}

export default async function MediaKitPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ lang?: string | string[] }>;
}) {
  const { token } = await params;
  const lang = pickLang((await searchParams).lang);
  const t = T[lang];
  const kit = await load(token);
  if (!kit) notFound();

  const c = kit[lang];
  const dateLabel = kit.updatedAt
    ? new Intl.DateTimeFormat(t.locale, { day: "numeric", month: "long", year: "numeric" }).format(new Date(kit.updatedAt + "T00:00:00"))
    : "";
  const platforms = kit.stats.filter((s) => s.enabled && (s.followers || s.views30 || s.handle));
  const audience = [
    [t.countries, c.audience.countries],
    [t.age, c.audience.age],
    [t.gender, c.audience.gender],
  ].filter(([, v]) => v);
  const wa = kit.whatsapp ? `https://wa.me/${kit.whatsapp}?text=${encodeURIComponent(t.wa)}` : "";

  return (
    <main className={styles.page} lang={lang}>
      <div className={styles.sheet}>
        <header className={styles.top}>
          <div className={styles.brand}>
            Kaan Tan<i />
          </div>
          <div className={styles.topRight}>
            <nav className={styles.langs} aria-label="Language">
              <a href="?lang=tr" className={lang === "tr" ? styles.langOn : ""} hrefLang="tr">
                TR
              </a>
              <a href="?lang=en" className={lang === "en" ? styles.langOn : ""} hrefLang="en">
                EN
              </a>
            </nav>
            <span>{t.kit}</span>
            {dateLabel && (
              <span>
                {t.updated}: {dateLabel}
              </span>
            )}
          </div>
        </header>

        <section className={styles.hero}>
          <div className={styles.photo}>
            <Image src={kit.photo} alt={kit.name} width={400} height={400} sizes="200px" priority />
          </div>
          <div>
            <h1>{kit.name}</h1>
            {c.title && <p className={styles.sub}>{c.title}</p>}
            {c.location && (
              <p className={styles.loc}>
                <MapPin size={14} /> {c.location}
              </p>
            )}
            {c.about && <p className={styles.about}>{c.about}</p>}
          </div>
        </section>

        {platforms.length > 0 && (
          <section className={styles.block}>
            <h2>{t.platforms}</h2>
            <div className={styles.stats}>
              {platforms.map((s) => {
                const label = PLATFORMS.find((p) => p.id === s.id)?.label || s.id;
                const hasUrl = /^https?:\/\//.test(s.url);
                return (
                  <article key={s.id} className={styles.stat}>
                    <div className={styles.statHead}>
                      <strong>{label}</strong>
                      {s.handle &&
                        (hasUrl ? (
                          <a href={s.url} target="_blank" rel="noopener noreferrer">
                            {s.handle} <ArrowUpRight size={12} />
                          </a>
                        ) : (
                          <span>{s.handle}</span>
                        ))}
                    </div>
                    <div className={styles.nums}>
                      {s.followers && (
                        <div>
                          <div className={styles.big}>{s.followers}</div>
                          <small>{t.followers}</small>
                        </div>
                      )}
                      {s.views30 && (
                        <div>
                          <div className={styles.big}>{s.views30}</div>
                          <small>{t.views}</small>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {audience.length > 0 && (
          <section className={styles.block}>
            <h2>{t.audience}</h2>
            <dl className={styles.rows}>
              {audience.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        <div className={styles.two}>
          {c.topics.length > 0 && (
            <section className={styles.block}>
              <h2>{t.topics}</h2>
              <ul className={styles.chips}>
                {c.topics.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </section>
          )}
          {c.formats.length > 0 && (
            <section className={styles.block}>
              <h2>{t.formats}</h2>
              <ul className={styles.list}>
                {c.formats.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {kit.brands.length > 0 && (
          <section className={styles.block}>
            <h2>{t.brands}</h2>
            <ul className={styles.chips}>
              {kit.brands.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </section>
        )}

        {c.rates && (
          <section className={styles.block}>
            <h2>{t.rates}</h2>
            <p className={styles.pre}>{c.rates}</p>
          </section>
        )}

        <section className={styles.contact}>
          <div>
            <h2>{t.contactTitle}</h2>
            <p>{t.contactText}</p>
          </div>
          <div className={styles.contactBtns}>
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer" className={styles.cta}>
                <MessageCircle size={16} /> WhatsApp
              </a>
            )}
            {kit.email && (
              <a href={`mailto:${kit.email}`} className={styles.ctaLine}>
                <Mail size={16} /> {kit.email}
              </a>
            )}
          </div>
        </section>

        <footer className={styles.foot}>
          <span>kaantan.com.tr</span>
          <PrintButton label={t.print} />
        </footer>
      </div>
    </main>
  );
}
