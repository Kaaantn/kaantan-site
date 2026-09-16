import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body>
        {children}
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
