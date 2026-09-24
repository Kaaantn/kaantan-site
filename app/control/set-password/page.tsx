"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

// Password reset via a typed OTP code rather than a clickable magic link.
// Magic links get silently pre-fetched/consumed by email security scanners
// (Gmail etc.) before the real user ever clicks them, single-use PKCE codes
// included — confirmed here via auth.users.last_sign_in_at updating within
// ~20s of the email being sent, well before the human read it. A typed code
// has nothing for a scanner to click, so it survives until actually used.
export default function SetPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"code" | "password" | "done">("code");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [sent, setSent] = useState(false);

  async function handleSendCode() {
    setError(null);
    if (!email.trim()) {
      setError("Önce e-posta adresini yaz.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    setLoading(false);
    if (error) {
      setError("Kod gönderilemedi: " + error.message);
      return;
    }
    setSent(true);
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: "recovery",
    });
    setLoading(false);
    if (error) {
      setError("Kod geçersiz veya süresi dolmuş: " + error.message);
      return;
    }
    setStep("password");
  }

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Şifre en az 8 karakter olmalı.");
      return;
    }
    if (password !== confirm) {
      setError("Şifreler eşleşmiyor.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError("Şifre kaydedilemedi: " + error.message);
      return;
    }
    setStep("done");
    setTimeout(() => {
      router.push("/control");
      router.refresh();
    }, 1200);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050409] px-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0b0a10] p-8">
        <div className="mb-8 text-center">
          <div className="text-lg font-semibold text-[#f5f3f8]">
            Kaan Tan<span className="text-[#7c3aed]">.</span>
          </div>
          <p className="mt-1 text-sm text-[#8a8494]">Şifre Belirle</p>
        </div>

        {step === "code" && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <p className="text-sm text-[#8a8494]">
              Mailine gelen 6 haneli doğrulama kodunu gir.
            </p>
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
            <button
              type="button"
              onClick={handleSendCode}
              disabled={loading}
              className="w-full rounded-lg border border-white/10 px-4 py-2 text-sm text-[#dad6e3] transition hover:bg-white/5 disabled:opacity-60"
            >
              {sent ? "Kod gönderildi, tekrar gönder" : "Kod gönder"}
            </button>
            <div>
              <label htmlFor="code" className="mb-1.5 block text-xs font-medium text-[#dad6e3]">
                Doğrulama kodu
              </label>
              <input
                id="code"
                type="text"
                inputMode="numeric"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#16131e] px-3.5 py-2.5 text-center text-lg tracking-widest text-[#f5f3f8] outline-none focus:border-[#8b5cf6]"
                placeholder="000000"
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#a78bfa] px-4 py-2.5 text-sm font-semibold text-[#0b0a10] transition hover:bg-[#c4b5fd] disabled:opacity-60"
            >
              {loading ? "Kontrol ediliyor…" : "Devam Et"}
            </button>
          </form>
        )}

        {step === "password" && (
          <form onSubmit={handleSetPassword} className="space-y-4">
            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-[#dad6e3]">
                Yeni şifre
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#16131e] px-3.5 py-2.5 text-sm text-[#f5f3f8] outline-none focus:border-[#8b5cf6]"
                autoComplete="new-password"
              />
            </div>
            <div>
              <label htmlFor="confirm" className="mb-1.5 block text-xs font-medium text-[#dad6e3]">
                Şifre (tekrar)
              </label>
              <input
                id="confirm"
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#16131e] px-3.5 py-2.5 text-sm text-[#f5f3f8] outline-none focus:border-[#8b5cf6]"
                autoComplete="new-password"
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#a78bfa] px-4 py-2.5 text-sm font-semibold text-[#0b0a10] transition hover:bg-[#c4b5fd] disabled:opacity-60"
            >
              {loading ? "Kaydediliyor…" : "Şifreyi Kaydet"}
            </button>
          </form>
        )}

        {step === "done" && (
          <p className="text-center text-sm text-[#a78bfa]">Şifre kaydedildi, yönlendiriliyorsun…</p>
        )}
      </div>
    </div>
  );
}
