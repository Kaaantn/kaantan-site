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
    <div className="cp-auth">
      <div className="cp-auth-card">
        <div className="cp-auth-brand">
          <strong>
            Kaan Tan<i />
          </strong>
          <p>Şifre Belirle</p>
        </div>

        {step === "code" && (
          <form onSubmit={handleVerifyCode}>
            <p className="cp-hint">Önce e-postanı yaz, &quot;Kod gönder&quot;e bas, sonra mailine gelen 6 haneli kodu gir.</p>
            <div className="cp-field">
              <label htmlFor="email" className="cp-label">
                E-posta
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="cp-input"
                autoComplete="username"
              />
            </div>
            <button
              type="button"
              onClick={handleSendCode}
              disabled={loading}
              className="cp-btn cp-btn-ghost cp-block"
              style={{ marginBottom: 16 }}
            >
              {sent ? "Kod gönderildi, tekrar gönder" : "Kod gönder"}
            </button>
            {sent && <p className="cp-auth-ok">Kod e-postana gönderildi. Spam klasörüne de bak.</p>}
            <div className="cp-field">
              <label htmlFor="code" className="cp-label">
                Doğrulama kodu
              </label>
              <input
                id="code"
                type="text"
                inputMode="numeric"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="cp-input cp-code"
                placeholder="000000"
              />
            </div>

            {error && <p className="cp-auth-err">{error}</p>}

            <button type="submit" disabled={loading} className="cp-btn cp-btn-primary cp-block" style={{ padding: 15 }}>
              {loading ? "Kontrol ediliyor…" : "Devam Et"}
            </button>
          </form>
        )}

        {step === "password" && (
          <form onSubmit={handleSetPassword}>
            <div className="cp-field">
              <label htmlFor="password" className="cp-label">
                Yeni şifre
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="cp-input"
                autoComplete="new-password"
              />
            </div>
            <div className="cp-field">
              <label htmlFor="confirm" className="cp-label">
                Şifre (tekrar)
              </label>
              <input
                id="confirm"
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="cp-input"
                autoComplete="new-password"
              />
            </div>

            {error && <p className="cp-auth-err">{error}</p>}

            <button type="submit" disabled={loading} className="cp-btn cp-btn-primary cp-block" style={{ padding: 15 }}>
              {loading ? "Kaydediliyor…" : "Şifreyi Kaydet"}
            </button>
          </form>
        )}

        {step === "done" && <p className="cp-auth-ok">Şifre kaydedildi, yönlendiriliyorsun…</p>}

        <a href="/control/login" className="cp-auth-link">
          ← Girişe dön
        </a>
      </div>
    </div>
  );
}
