import Link from "next/link";
import { MessageCircle, Link2, FileText } from "lucide-react";

const MODULES = [
  {
    href: "/control/instagram",
    icon: MessageCircle,
    title: "Instagram",
    desc: "Yorum tetikleyicileri, otomatik DM ve genel ayarlar.",
  },
  {
    href: "/control/bio",
    icon: Link2,
    title: "Bio Sayfası",
    desc: "Profil, sosyal medya ve link listesini düzenle.",
  },
  {
    href: "/control/blog",
    icon: FileText,
    title: "Blog",
    desc: "Yazı ekle, düzenle, sil — canlıya ~30-60 sn içinde çıkar.",
  },
];

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#f5f3f8]">Genel Bakış</h1>
      <p className="mt-1 text-sm text-[#8a8494]">Hoş geldin. Bir modül seç.</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODULES.map(({ href, icon: Icon, title, desc }) => (
          <Link
            key={href}
            href={href}
            className="rounded-xl border border-white/10 bg-[#0b0a10] p-6 transition hover:border-[#a78bfa]/50"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#8b5cf6]/10">
              <Icon size={20} className="text-[#c9bbfc]" />
            </div>
            <h2 className="font-semibold text-[#f5f3f8]">{title}</h2>
            <p className="mt-1 text-sm text-[#8a8494]">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
