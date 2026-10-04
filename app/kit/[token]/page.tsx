import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowUpRight, Mail, MapPin, MessageCircle } from "lucide-react";
import { PLATFORMS, getKit, tokenMatches, type MediaKit } from "@/lib/mediaKit";
import styles from "../kit.module.css";
import PrintButton from "./PrintButton";

export const dynamic = "force-dynamic";

// Özel sayfa: arama motorlarına kapalı, bağlantı gizli kodla açılır, dışarı Referer sızdırmaz
// (aksi halde sosyal hesap linklerine tıklayınca gizli adres o sitelere gönderilirdi).
export const metadata: Metadata = {
  title: "Kaan Tan — Medya Kiti",
  description: "Kaan Tan'ın iş birliği medya kiti.",
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
  referrer: "no-referrer",
  openGraph: {
    title: "Kaan Tan — Medya Kiti",
    description: "İş birliği için güncel medya kiti.",
    type: "website",
  },
};

async function load(token: string): Promise<MediaKit | null> {
  try {
    const kit = await getKit();
    if (!kit || !kit.published || !tokenMatches(token, kit.shareToken)) return null;
    return kit;
  } catch {
    return null;
  }
}

const dateLabel = (iso: string) =>
  iso ? new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso + "T00:00:00")) : "";

export default async function MediaKitPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const kit = await load(token);
  if (!kit) notFound();

  const platforms = kit.stats.filter((s) => s.enabled && (s.followers || s.avgViews || s.engagement || s.handle));
  const audience = [
    ["Ülkeler", kit.audience.countries],
    ["Yaş aralığı", kit.audience.age],
    ["Cinsiyet", kit.audience.gender],
  ].filter(([, v]) => v);
  const wa = kit.whatsapp ? `https://wa.me/${kit.whatsapp}?text=${encodeURIComponent("Merhaba Kaan, medya kitini inceledim, iş birliği hakkında konuşmak istiyorum.")}` : "";

  return (
    <main className={styles.page}>
      <div className={styles.sheet}>
        <header className={styles.top}>
          <div className={styles.brand}>
            Kaan Tan<i />
          </div>
          <div className={styles.topRight}>
            <span>Medya Kiti</span>
            {kit.updatedAt && <span>Güncelleme: {dateLabel(kit.updatedAt)}</span>}
          </div>
        </header>

        <section className={styles.hero}>
          <div className={styles.photo}>
            <Image src={kit.photo} alt={kit.name} width={400} height={400} sizes="200px" priority />
          </div>
          <div>
            <h1>{kit.name}</h1>
            {kit.title && <p className={styles.sub}>{kit.title}</p>}
            {kit.location && (
              <p className={styles.loc}>
                <MapPin size={14} /> {kit.location}
              </p>
            )}
            {kit.about && <p className={styles.about}>{kit.about}</p>}
          </div>
        </section>

        {platforms.length > 0 && (
          <section className={styles.block}>
            <h2>Platformlar</h2>
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
                    {s.followers && (
                      <div className={styles.big}>
                        {s.followers}
                        <small>takipçi</small>
                      </div>
                    )}
                    <dl>
                      {s.avgViews && (
                        <>
                          <dt>Ort. izlenme</dt>
                          <dd>{s.avgViews}</dd>
                        </>
                      )}
                      {s.engagement && (
                        <>
                          <dt>Etkileşim oranı</dt>
                          <dd>{s.engagement}</dd>
                        </>
                      )}
                    </dl>
                    {s.note && <p className={styles.note}>{s.note}</p>}
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {audience.length > 0 && (
          <section className={styles.block}>
            <h2>Kitle</h2>
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
          {kit.topics.length > 0 && (
            <section className={styles.block}>
              <h2>İçerik konuları</h2>
              <ul className={styles.chips}>
                {kit.topics.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </section>
          )}
          {kit.formats.length > 0 && (
            <section className={styles.block}>
              <h2>İş birliği formatları</h2>
              <ul className={styles.list}>
                {kit.formats.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {kit.brands.length > 0 && (
          <section className={styles.block}>
            <h2>Çalıştığım markalar</h2>
            <ul className={styles.chips}>
              {kit.brands.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </section>
        )}

        {kit.rates && (
          <section className={styles.block}>
            <h2>Paketler</h2>
            <p className={styles.pre}>{kit.rates}</p>
          </section>
        )}

        <section className={styles.contact}>
          <div>
            <h2>İş birliği için</h2>
            <p>Bu kit güncel rakamlarla hazırlandı. Detayları konuşalım.</p>
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
          <PrintButton />
        </footer>
      </div>
    </main>
  );
}
