import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import "./_components/site.css";
import RevealObserver from "./_components/RevealObserver";

const display = Bricolage_Grotesque({
  variable: "--f-display",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const body = Instrument_Sans({
  variable: "--f-body",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--f-mono",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kaantan.com.tr"),
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f5f2eb",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        {children}
        <RevealObserver />
        <Script
          id="cf-web-analytics"
          strategy="afterInteractive"
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "f78c1fa189fa4a7f909bcf7e69f7b930"}'
        />
      </body>
    </html>
  );
}
