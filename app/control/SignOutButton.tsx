"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";

export default function SignOutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/control/login");
    router.refresh();
  }

  if (compact) {
    return (
      <button onClick={handleSignOut} className="cp-icon-btn" aria-label="Çıkış yap" title="Çıkış yap">
        <LogOut size={18} />
      </button>
    );
  }

  return (
    <button
      onClick={handleSignOut}
      className="cp-btn cp-btn-ghost cp-block"
      style={{ justifyContent: "flex-start" }}
    >
      <LogOut size={16} />
      Çıkış Yap
    </button>
  );
}
