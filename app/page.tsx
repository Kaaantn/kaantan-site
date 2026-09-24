import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  Clock,
  Cpu,
  Globe,
  LayoutTemplate,
  Megaphone,
  MessageCircle,
  Monitor,
  Plug,
  Puzzle,
  Search,
  ShoppingBag,
  Wrench,
  Zap,
} from "lucide-react";
import SiteHeader from "./_components/SiteHeader";
import SiteFooter from "./_components/SiteFooter";
import HeroWorkbench from "./_components/HeroWorkbench";
import StatementScrub from "./_components/StatementScrub";
import ProjectWizard from "./_components/ProjectWizard";
import { getAllPosts } from "@/lib/posts";
import { tarih } from "@/lib/dates";
import "./home.css";

export const metadata: Metadata = {
  title: "Kaan Tan — Web, Otomasyon & İkas İş Ortağı",
  description:
    "Kaan Tan — solopreneur dijital çözüm ortağı. Profesyonel web sitesi, süreç otomasyonu, yapay zeka entegrasyonu ve İkas e-ticaret altyapısında iş ortaklığı. Ortalama 30 dakikada dönüş.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Kaan Tan — Dijital Çözüm Ortağınız",
    description: "Web sitesi, otomasyon, yapay zeka ve İkas e-ticaret çözümleri. Tek elden, hızlı ve profesyonel.",
    type: "website",
  },
  other: {
    "google-site-verification": "VMhd9jIgzwx_419BiOH-2dOZIMNJtBFqGHhvunORR64",
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Kaan Tan",
  url: "https://kaantan.com.tr",
  jobTitle: "Yazılım Geliştirici, İçerik Üreticisi (Influencer) & Meta Reklam Yöneticisi",
  image: "https://kaantan.com.tr/bio/profil.jpg",
  description:
    "10 yılı aşkın deneyime sahip, İstanbul merkezli yazılım geliştiricisi. Aynı zamanda sosyal medyada içerik üreticisi (influencer) ve özellikle butik ayakkabı ve giyim mağazalarına Meta (Instagram/Facebook) reklam yöneticiliği hizmeti veren bir dijital çözüm ortağı. ikas ve Shopify partneri, e-ticaret altyapıları ve özel yazılım çözümleri üzerine çalışıyor.",
  knowsAbout: [
    "Web Geliştirme",
    "İkas E-Ticaret Altyapısı",
    "Shopify",
    "Süreç Otomasyonu",
    "Yapay Zeka Entegrasyonu",
    "Meta Reklam Yönetimi",
    "Butik Giyim ve Ayakkabı Mağazaları için Dijital Pazarlama",
    "Sosyal Medya İçerik Üretimi",
    "SEO",
  ],
  worksFor: { "@type": "Organization", name: "KT.", url: "https://kaantan.com.tr" },
  address: { "@type": "PostalAddress", addressLocality: "İstanbul", addressCountry: "TR" },
  email: "mailto:kaantanpr@gmail.com",
  telephone: "+905422979212",
  sameAs: [
    "https://instagram.com/qkaantan",
    "https://tiktok.com/@qkaantan",
    "https://linkedin.com/in/vekaantan",
    "https://youtube.com/@qkaantan",
    "https://www.behance.net/kaantan2",
    "https://github.com/Kaaantn",
  ],
};

const MARQUEE = [
  "Web Tasarımı",
  "Meta Reklam Yönetimi",
  "TikTok Ads Yönetimi",
  "Süreç Otomasyonu",
  "Yapay Zeka Entegrasyonu",
  "İkas E-Ticaret",
  "Chrome Eklentisi",
  "Masaüstü Uygulama",
  "SEO Optimizasyonu",
  "UI/UX Tasarım",
];

const SERVICES = [
  {
    icon: Globe,
    title: "Profesyonel Web Sitesi",
    desc: "Kurumsal, portföy veya e-ticaret — markanıza özel, hızlı, mobil uyumlu ve arama motorlarına hazır web siteleri tasarlıyor ve geliştiriyorum.",
    tag: "Kurumsal · Portföy · E-Ticaret",
  },
  {
    icon: ShoppingBag,
    title: "İkas E-Ticaret Kurulumu",
    desc: "İkas altyapısında mağaza kurulumu, tema özelleştirme ve entegrasyonlar — iş ortağı desteğiyle uçtan uca.",
    tag: "İkas İş Ortağı",
  },
  {
    icon: Megaphone,
    title: "Meta & TikTok Ads Yönetimi",
    desc: "Butik ayakkabı ve giyim mağazaları başta olmak üzere, Instagram, Facebook ve TikTok reklamlarınızı uçtan uca yönetiyorum — hedef kitle, bütçe optimizasyonu ve dönüşüm takibiyle satışa odaklı kampanyalar.",
    tag: "Butik Mağazalara Özel",
  },
  {
    icon: Zap,
    title: "Süreç Otomasyonu",
    desc: "Form, e-posta, bildirim, veri aktarımı — elle yapılan her şey otomatikleşebilir.",
    tag: "Zaman Kazandırır",
  },
  {
    icon: Cpu,
    title: "Yapay Zeka Entegrasyonu",
    desc: "Müşteri hizmetleri botu, içerik üretimi, veri analizi veya akıllı öneri sistemleri.",
    tag: "Rekabet Avantajı",
  },
  {
    icon: Puzzle,
    title: "Chrome Eklentisi",
    desc: "Ekibinizin kullandığı araçlara entegre, markanıza özel tarayıcı eklentisi geliştirme.",
    tag: "Prodüktivite",
  },
  {
    icon: Monitor,
    title: "Masaüstü Uygulama",
    desc: "Windows veya Mac için özel iş uygulamaları — muhasebe, stok takip, iç araçlar.",
    tag: "Özel Yazılım",
  },
  {
    icon: Wrench,
    title: "Bakım & Destek",
    desc: "Siteniz ve araçlarınız sürekli güncel, güvende ve takipte. WhatsApp üzerinden anlık destek.",
    tag: "Sürekli Destek",
  },
];

const PROJECTS = [
  {
    name: "Kartio",
    logo: "/icon-1024.png",
    desc: "ikas App Store'da yayınlanan sipariş ve hediye kartı uygulaması. Mağaza sahibi isim, tip, süsleme ve renk seçiyor; A4 sayfaya dizilmiş, kesime hazır PDF çıktısı otomatik oluşuyor.",
    stack: ["Next.js", "ikas OAuth2", "Prisma", "jsPDF"],
    href: "https://apps.ikas.com/tr/uygulama/87c77f53-71b6-45fa-9b23-fb0d3d109878",
  },
  {
    name: "Takiplio",
    logo: "/takiplio.png",
    desc: "ikas App Store'da yayınlanan sipariş ve kargo takip uygulaması. Müşteriler sipariş numarası ve e-posta/telefon ile kargo durumunu anlık sorgular; destek yükü azalır, mağaza sahibine günlük/haftalık sorgu istatistikleri sunulur.",
    stack: ["Next.js", "ikas OAuth2", "Kargo API Entegrasyonu"],
    href: "https://apps.ikas.com/tr/uygulama/9bf35a46-9994-47e9-9e55-97e636660a8b",
  },
  {
    name: "Barlio",
    logo: "/barlio.png",
    desc: "ikas App Store'da yayınlanan ücretsiz kargo ilerleme çubuğu uygulaması. Sepet tutarı arttıkça bar gerçek zamanlı güncellenir, müşteriyi eşiğe ulaşmaya teşvik ederek sepet ortalamasını ve tamamlama oranını yükseltir.",
    stack: ["Next.js", "ikas OAuth2", "Gerçek Zamanlı Widget"],
    href: "https://apps.ikas.com/tr/uygulama/f11c28a4-db00-4fb5-8835-1c9bd381529a",
  },
];

const STEPS = [
  ["01", "İletişime Geç", "WhatsApp'tan mesaj atın, ihtiyaçlarınızı anlatın. Ortalama 30 dakikada dönüş yapıyorum."],
  ["02", "Planlama", "İçerik ve tasarım tercihlerinizi alıyorum. Size özel bir plan hazırlıyorum."],
  ["03", "Geliştirme", "Sitenizi veya çözümünüzü hızla hayata geçiriyorum. Sizi süreçte bilgilendiriyorum."],
  ["04", "Teslim & Destek", "Projeyi teslim ediyorum. Revizyon ve sorularınız için her zaman buradayım."],
];

const delay = (ms: number) => ({ ["--reveal-delay" as string]: `${ms}ms` }) as React.CSSProperties;

export default function HomePage() {
  const latestPosts = getAllPosts().slice(0, 3);

  return (
    <>
      <Script
        id="person-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <SiteHeader />

      <main className="hp">
        {/* ══ HERO ══ */}
        <section id="hero" className="hp-hero">
          <div className="sx-wrap hp-hero-grid">
            <div className="hp-hero-copy">
              <div className="hp-eyebrow" data-reveal>
                <span className="hp-pulse" />
                Yeni: Meta &amp; TikTok Ads Yönetimi
              </div>

              <h1 className="hp-h1" data-reveal style={delay(80)}>
                <span>Kaan Tan</span>
                <span className="hp-h1-sub">
                  Dijital{" "}
                  <span className="hp-squiggle">
                    Çözüm
                    <svg viewBox="0 0 200 14" preserveAspectRatio="none" aria-hidden="true">
                      <path d="M2 9 C 22 1, 42 13, 62 6 S 102 2, 122 8 S 162 12, 198 4" />
                    </svg>
                  </span>{" "}
                  Ortağınız
                </span>
              </h1>

              <p className="hp-lead" data-reveal style={delay(160)}>
                Web sitesi, otomasyon, yapay zeka ve İkas e-ticaret altyapısı —{" "}
                <strong>işinizi büyütecek dijital çözümleri</strong> tek elden, hızlı ve profesyonelce hayata geçiriyorum.
              </p>

              <div className="hp-cta" data-reveal style={delay(240)}>
                <a href="https://wa.me/905422979212" target="_blank" rel="noopener" className="sx-btn sx-btn-ink">
                  Hemen Başlayalım <ArrowRight size={18} />
                </a>
                <a href="#services" className="sx-btn sx-btn-line">
                  Ne Yapabiliriz?
                </a>
              </div>

              <ul className="hp-trust" data-reveal style={delay(320)}>
                <li>İkas İş Ortağı</li>
                <li>Shopify İş Ortağı</li>
                <li>Meta &amp; TikTok Ads</li>
                <li>10+ Yıl Deneyim</li>
                <li>30 Dakika Yanıt</li>
              </ul>
            </div>

            <div className="hp-hero-visual" data-reveal style={delay(200)}>
              <HeroWorkbench />
            </div>
          </div>
        </section>

        {/* ══ KAYAN BANT ══ */}
        <div className="hp-marquee" aria-hidden="true">
          <div className="hp-marquee-track">
            {[0, 1].map((k) => (
              <div className="hp-marquee-set" key={k}>
                {MARQUEE.map((m) => (
                  <span key={m}>
                    {m}
                    <i />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ══ RAKAMLAR ══ */}
        <section className="hp-stats">
          <div className="sx-wrap hp-stats-grid">
            {[
              { n: 10, pre: "", suf: "+", label: "Yıl Deneyim" },
              { n: 100, pre: "%", suf: "", label: "Müşteri Memnuniyeti" },
              { n: 30, pre: "", suf: "dk", label: "Yanıt Süresi" },
              { n: 0, pre: "", suf: "∞", label: "Revizyon Hakkı", inf: true },
            ].map((s, i) => (
              <div key={s.label} className="hp-stat" data-reveal style={delay(i * 70)}>
                <div className="hp-stat-num">
                  {s.pre}
                  {s.inf ? null : <span data-count={s.n}>{s.n}</span>}
                  {s.suf}
                </div>
                <div className="hp-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ══ HAKKIMDA ══ */}
        <section id="about" className="hp-section">
          <div className="sx-wrap">
            <div className="hp-head" data-reveal>
              <div className="hp-kicker">01 — Hakkımda</div>
              <h2 className="hp-h2">
                Bir kişi,
                <br />
                sınırsız çözüm.
              </h2>
            </div>

            <div className="hp-about-grid">
              <div className="hp-about-photo" data-reveal>
                <Image
                  src="/about3.png"
                  alt="Kaan Tan"
                  width={900}
                  height={1100}
                  sizes="(max-width: 900px) 90vw, 440px"
                  quality={78}
                  priority={false}
                />
                <div className="hp-about-badge">
                  <strong>Solopreneur</strong>
                  <span>Tek elden, hızlı teslimat</span>
                </div>
              </div>

              <div className="hp-about-text" data-reveal style={delay(100)}>
                <p className="hp-body-lg">
                  Merhaba, ben <strong>Kaan Tan.</strong> Tek başıma çalışan, büyük ajans maliyeti olmayan bir dijital çözüm üreticisiyim.
                </p>
                <p className="hp-body-lg">
                  Web tasarımından otomasyon sistemlerine, tarayıcı eklentilerinden İkas altyapılı e-ticaret sitelerine kadar —{" "}
                  <strong>işinizi büyütecek her şeyi</strong> hızla hayata geçiriyorum.
                </p>
                <div className="hp-tags">
                  {[
                    "Web Tasarım",
                    "İkas E-Ticaret",
                    "Otomasyon",
                    "Yapay Zeka",
                    "Chrome Extension",
                    "Masaüstü Uygulama",
                    "SEO",
                    "Meta Reklam Yönetimi",
                    "İçerik Üretimi",
                  ].map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="hp-bio-grid">
              <div className="hp-bio" data-reveal>
                <p>2015&apos;ten beri yazılım geliştiriyorum. 10 yılı aşkın süredir kod yazan, web siteleri ve e-ticaret sistemleri kuran, İstanbul merkezli bir yazılım geliştiricisiyim. KT. markası altında hem kendi ürünlerimi geliştiriyorum hem de işletmelere özel projeler üretiyorum.</p>
                <p>ikas partneri ve Shopify partneri olarak, Türkiye&apos;nin ve dünyanın en çok kullanılan e-ticaret altyapılarında hem uygulama geliştiriyor hem de bu platformlar üzerinde mağaza kurulumu, entegrasyon ve özel çözüm ihtiyaçlarına destek oluyorum.</p>
                <p>Yaptığım işler geniş bir yelpazede: e-ticaret altyapıları için mağaza içi uygulamalar (şu an ikas App Store&apos;da Kartio, Takiplio ve Barlio uygulamalarım yayında), kurumsal ve bireysel işletmeler için özel web siteleri, yönetim panelleri, bayi/dağıtıcı sistemleri gibi B2B2C platformları, ve ihtiyaca göre uçtan uca özel yazılım çözümleri geliştiriyorum. Kısacası, bir fikri alıp çalışan bir ürüne dönüştürme sürecinin her aşamasında yer alıyorum — tasarımdan geliştirmeye, entegrasyondan yayına kadar.</p>
                <p>Yazılım geliştirmenin yanı sıra aynı anda birden fazla rolü bir arada yürütüyorum: sosyal medyada içerik üreticisi (influencer) olarak Instagram, TikTok ve YouTube&apos;da teknoloji ve yapay zeka içerikleri paylaşıyorum; özellikle <strong>butik ayakkabı ve giyim mağazalarına</strong> Meta (Instagram/Facebook) reklam yöneticiliği hizmeti veriyorum; ve tüm bunları yazılım/e-ticaret işimle eş zamanlı yürütüyorum.</p>
                <p>Küçük bir işletmenin ilk web sitesinden, büyüyen bir e-ticaret markasının özel yazılım altyapısına kadar geniş bir yelpazede çalışıyorum. Eğer bir projeniz varsa veya e-ticaret tarafında yardıma ihtiyacınız varsa, benimle iletişime geçebilirsiniz.</p>
              </div>

              <aside className="hp-side" data-reveal style={delay(100)}>
                <h3>İletişim</h3>
                <a href="tel:+905422979212">
                  <small>Telefon</small>
                  +90 542 297 9212
                </a>
                <a href="mailto:kaantanpr@gmail.com">
                  <small>E-posta</small>
                  kaantanpr@gmail.com
                </a>
                <a href="https://kaantan.com.tr">
                  <small>Web</small>
                  kaantan.com.tr
                </a>

                <h3>Sosyal Medya &amp; Platformlar</h3>
                <div className="hp-social">
                  <a href="https://instagram.com/qkaantan" target="_blank" rel="noopener">Instagram <small>@qkaantan</small></a>
                  <a href="https://tiktok.com/@qkaantan" target="_blank" rel="noopener">TikTok <small>@qkaantan</small></a>
                  <a href="https://linkedin.com/in/vekaantan" target="_blank" rel="noopener">LinkedIn <small>/in/vekaantan</small></a>
                  <a href="https://youtube.com/@qkaantan" target="_blank" rel="noopener">YouTube <small>@qkaantan</small></a>
                  <a href="https://www.behance.net/kaantan2" target="_blank" rel="noopener">Behance <small>kaantan2</small></a>
                  <a href="https://github.com/Kaaantn" target="_blank" rel="noopener">GitHub <small>Kaaantn</small></a>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* ══ MANİFESTO ══ */}
        <section className="hp-statement">
          <div className="sx-wrap">
            <StatementScrub text="Web sitesinden otomasyona, yapay zekadan İkas altyapılı e-ticarete işinizi büyütecek her şeyi tek elden hayata geçiriyorum." />
          </div>
        </section>

        {/* ══ İKAS & SHOPIFY ══ */}
        <section id="ikas" className="hp-section">
          <div className="sx-wrap">
            <div className="hp-head" data-reveal>
              <div className="hp-kicker">02 — İkas &amp; Shopify İş Ortaklığı</div>
              <h2 className="hp-h2">
                E-ticaret sitenizi
                <br />
                büyütüyoruz.
              </h2>
            </div>

            <div className="hp-ikas-grid">
              <div data-reveal>
                <p className="hp-body-lg">
                  Türkiye&apos;nin hızla büyüyen e-ticaret altyapısı <strong>İkas</strong>&apos;ın ve global e-ticaret devi <strong>Shopify</strong>&apos;ın iş ortağıyım. Mağaza kurulumundan tema özelleştirmeye, entegrasyonlardan otomasyona kadar İkas ve Shopify tabanlı projelerinizi uçtan uca hayata geçiriyorum.
                </p>
                <ul className="hp-checks">
                  <li><ShoppingBag size={18} /> Mağaza kurulumu ve platform taşıma</li>
                  <li><LayoutTemplate size={18} /> Markanıza özel tema tasarımı ve özelleştirme</li>
                  <li><Plug size={18} /> Ödeme, kargo ve pazaryeri entegrasyonları</li>
                  <li><Bell size={18} /> Sipariş ve stok otomasyonu, bildirim sistemleri</li>
                  <li><Search size={18} /> Hız ve SEO optimizasyonu</li>
                </ul>
                <a
                  href="https://wa.me/905422979212?text=Merhaba%20Kaan%2C%20e-ticaret%20projem%20hakk%C4%B1nda%20konu%C5%9Fmak%20istiyorum."
                  target="_blank"
                  rel="noopener"
                  className="sx-btn sx-btn-ink"
                >
                  E-Ticaret Projemi Konuşalım <ArrowRight size={18} />
                </a>
              </div>

              <div className="hp-partner" data-reveal style={delay(120)}>
                <div className="hp-partner-mark">
                  ikas<i>.</i> <span>+ Shopify</span>
                </div>
                <div className="hp-partner-role">E-ticaret altyapı platformları</div>
                <div className="hp-partner-cert">İkas &amp; Shopify İş Ortağı</div>
                <div className="hp-partner-name">
                  Kaan Tan
                  <small>Solopreneur · Türkiye</small>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ HİZMETLER ══ */}
        <section id="services" className="hp-section hp-services">
          <div className="sx-wrap">
            <div className="hp-head hp-head-split" data-reveal>
              <div>
                <div className="hp-kicker">03 — Hizmetler</div>
                <h2 className="hp-h2">Ne yapabilirim?</h2>
              </div>
              <p className="hp-note">Tek seferlik proje veya uzun vadeli iş birliği — her ikisi de mümkün.</p>
            </div>

            <div className="hp-svc-grid" data-reveal>
              {SERVICES.map((s, i) => (
                <article key={s.title} className="hp-svc">
                  <div className="hp-svc-top">
                    <span className="hp-svc-no">{String(i + 1).padStart(2, "0")}</span>
                    <s.icon size={22} strokeWidth={1.6} />
                  </div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                  <span className="hp-svc-tag">{s.tag}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ══ PROJELER ══ */}
        <section id="projects" className="hp-section">
          <div className="sx-wrap">
            <div className="hp-head" data-reveal>
              <div className="hp-kicker">04 — Yaptıklarım</div>
              <h2 className="hp-h2">
                Canlıda çalışan
                <br />
                projeler.
              </h2>
            </div>

            <div className="hp-proj-grid">
              {PROJECTS.map((p, i) => (
                <a
                  key={p.name}
                  href={p.href}
                  target="_blank"
                  rel="noopener"
                  className="hp-proj"
                  data-reveal
                  style={delay(i * 90)}
                >
                  <div className="hp-proj-top">
                    <Image src={p.logo} alt={`${p.name} logosu`} width={64} height={64} className="hp-proj-logo" />
                    <span className="hp-live">
                      <i /> Canlı
                    </span>
                  </div>
                  <h3>{p.name}</h3>
                  <p>{p.desc}</p>
                  <div className="hp-proj-stack">
                    {p.stack.map((s) => (
                      <span key={s}>{s}</span>
                    ))}
                  </div>
                  <span className="hp-proj-link">
                    Uygulamaya Git <ArrowUpRight size={16} />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ══ BLOG ══ */}
        <section id="blog" className="hp-section hp-blog">
          <div className="sx-wrap">
            <div className="hp-head hp-head-split" data-reveal>
              <div>
                <div className="hp-kicker">05 — Blog</div>
                <h2 className="hp-h2">Son yazılar.</h2>
              </div>
              <Link href="/blog" className="sx-btn sx-btn-line sx-btn-sm">
                Tüm yazılar <ArrowUpRight size={15} />
              </Link>
            </div>

            <div className="hp-post-grid">
              {latestPosts.map((post, i) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="hp-post" data-reveal style={delay(i * 90)}>
                  <div className="hp-post-date">{tarih(post.date)}</div>
                  <h3>{post.title}</h3>
                  <p>{post.description}</p>
                  <span className="hp-post-more">
                    Yazıyı oku <ArrowUpRight size={15} />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ══ SÜREÇ ══ */}
        <section id="process" className="hp-section">
          <div className="sx-wrap">
            <div className="hp-head" data-reveal>
              <div className="hp-kicker">06 — Nasıl Çalışırız</div>
              <h2 className="hp-h2">
                Basit süreç,
                <br />
                hızlı sonuç.
              </h2>
            </div>

            <ol className="hp-steps">
              {STEPS.map(([no, title, desc], i) => (
                <li key={no} className="hp-step" data-reveal style={delay(i * 90)}>
                  <span className="hp-step-no">{no}</span>
                  <h4>{title}</h4>
                  <p>{desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ══ İLETİŞİM ══ */}
        <section id="contact" className="hp-contact">
          <div className="sx-wrap hp-contact-grid">
            <div data-reveal>
              <div className="hp-kicker hp-kicker-light">07 — İletişim</div>
              <h2 className="hp-h2 hp-h2-light">Konuşalım.</h2>
              <p className="hp-contact-lead">
                Projeniz büyük ya da küçük olsun fark etmez. Ne yapmak istediğinizi anlatın, birlikte en iyi çözümü bulalım.
              </p>

              <ul className="hp-contact-list">
                <li>
                  <MessageCircle size={20} />
                  <div>
                    <small>WhatsApp</small>
                    +90 542 297 92 12
                  </div>
                </li>
                <li>
                  <Globe size={20} />
                  <div>
                    <small>Konum</small>
                    Türkiye · Remote çalışıyorum
                  </div>
                </li>
                <li>
                  <Clock size={20} />
                  <div>
                    <small>Yanıt Süresi</small>
                    Genellikle 30 dakika içinde
                  </div>
                </li>
              </ul>
            </div>

            <div className="hp-wizard" data-reveal style={delay(120)}>
              <h3>Projeni anlat, mesajı hazır edelim</h3>
              <ProjectWizard />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
