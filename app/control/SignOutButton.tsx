"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";

export default function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/control/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#8a8494] transition hover:bg-white/5 hover:text-[#f5f3f8]"
    >
      <LogOut size={16} />
      Çıkış Yap
    </button>
  );
}
