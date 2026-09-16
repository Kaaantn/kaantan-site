import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import shopData from "@/content/shop.json";
import styles from "../marketing.module.css";

export const metadata: Metadata = {
  title: "Shop — Kaan Tan Blog",
  description: "Kaan Tan'ın Shopier mağazasındaki dijital ürünler ve yapay zeka rehberleri.",
};

interface Product {
  title: string;
  subtitle?: string;
  image: string;
  price: string;
  oldPrice?: string;
  badge?: string;
  type?: string;
  url: string;
}

export default function ShopPage() {
  const shop = shopData as { intro: string; storeUrl: string; products: Product[] };

  return (
    <div className={`${styles.wrap} ${styles.shopWrap}`}>
      <div className={styles.postEyebrow}>Shop</div>
      <h1 className={styles.postTitle}>Dijital Ürünler</h1>
      <p style={{ color: "var(--muted)", marginBottom: "40px", maxWidth: "600px" }}>{shop.intro}</p>

      <div className={styles.shopGrid}>
        {shop.products.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>Şu anda listelenen ürün yok, yakında burada olacak.</p>
        ) : (
          shop.products.map((p) => (
            <a key={p.url} href={p.url} target="_blank" rel="noopener" className={styles.shopCard}>
              <div className={styles.shopCardImg}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image} alt={p.title} loading="lazy" />
                {p.badge && <span className={styles.shopBadge}>{p.badge}</span>}
              </div>
              <div className={styles.shopCardBody}>
                {p.type && <div className={styles.shopType}>{p.type}</div>}
                <div className={styles.shopName}>{p.title}</div>
                {p.subtitle && <div className={styles.shopSub}>{p.subtitle}</div>}
                <div className={styles.shopPriceRow}>
                  <span className={styles.shopPrice}>{p.price}</span>
                  {p.oldPrice && <span className={styles.shopOldPrice}>{p.oldPrice}</span>}
                </div>
                <div className={styles.shopCta}>
                  Shopier&apos;da İncele <ArrowUpRight />
                </div>
              </div>
            </a>
          ))
        )}
      </div>

      <p style={{ marginTop: "48px", color: "var(--muted)", fontSize: "0.88rem" }}>
        Tüm ödemeler Shopier&apos;ın güvenli altyapısı üzerinden gerçekleştirilir. Sorularınız için{" "}
        <a href="/#contact" style={{ color: "var(--lime-700)", fontWeight: 600 }}>
          iletişime geçebilirsiniz
        </a>
        .
      </p>
    </div>
  );
}
