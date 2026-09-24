import type { Metadata } from "next";
import "./panel.css";

// Kontrol paneli hiçbir zaman indekslenmez.
export const metadata: Metadata = {
  title: "Kontrol Paneli — Kaan Tan",
  robots: { index: false, follow: false },
};

export default function ControlRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="cp">{children}</div>;
}
