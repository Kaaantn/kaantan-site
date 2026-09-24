"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("E-posta veya şifre hatalı.");
      return;
    }
    router.push("/control");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050409] px-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0b0a10] p-8">
        <div className="mb-8 text-center">
          <div className="font-semibold text-lg text-[#f5f3f8]">
            Kaan Tan<span className="text-[#7c3aed]">.</span>
          </div>
          <p className="mt-1 text-sm text-[#8a8494]">Kontrol Paneli</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-[#dad6e3]">
              E-posta
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#16131e] px-3.5 py-2.5 text-sm text-[#f5f3f8] outline-none focus:border-[#8b5cf6]"
              autoComplete="username"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-[#dad6e3]">
              Şifre
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#16131e] px-3.5 py-2.5 text-sm text-[#f5f3f8] outline-none focus:border-[#8b5cf6]"
              autoComplete="current-password"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#a78bfa] px-4 py-2.5 text-sm font-semibold text-[#0b0a10] transition hover:bg-[#c4b5fd] disabled:opacity-60"
          >
            {loading ? "Giriş yapılıyor…" : "Giriş Yap"}
          </button>
        </form>
        <a href="/control/set-password" className="mt-4 block text-center text-xs text-[#8a8494] hover:text-[#dad6e3]">
          Şifremi unuttum
        </a>
      </div>
    </div>
  );
}
