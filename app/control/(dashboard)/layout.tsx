import Link from "next/link";
import { LayoutDashboard, MessageCircle, Link2, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "../SignOutButton";

const NAV = [
  { href: "/control", label: "Genel Bakış", icon: LayoutDashboard },
  { href: "/control/instagram", label: "Instagram", icon: MessageCircle },
  { href: "/control/bio", label: "Bio Sayfası", icon: Link2 },
  { href: "/control/blog", label: "Blog", icon: FileText },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen bg-[#050409] text-[#b7b2c4]">
      <aside className="flex w-64 flex-col border-r border-white/10 bg-[#0b0a10] p-4">
        <div className="mb-8 px-2 pt-2">
          <Link href="/control" className="font-semibold text-[#f5f3f8]">
            Kaan Tan<span className="text-[#7c3aed]">.</span>
          </Link>
          <p className="mt-0.5 text-xs text-[#8a8494]">Kontrol Paneli</p>
        </div>

        <nav className="flex-1 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#dad6e3] transition hover:bg-white/5 hover:text-[#f5f3f8]"
            >
              <Icon size={17} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-white/10 pt-3">
          {data.user?.email && (
            <p className="mb-1 truncate px-3 text-xs text-[#8a8494]">{data.user.email}</p>
          )}
          <SignOutButton />
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
