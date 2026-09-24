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
    <div className="cp-auth">
      <div className="cp-auth-card">
        <div className="cp-auth-brand">
          <strong>
            Kaan Tan<i />
          </strong>
          <p>Kontrol Paneli</p>
        </div>

        <form onSubmit={handleSubmit}>
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
          <div className="cp-field">
            <label htmlFor="password" className="cp-label">
              Şifre
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="cp-input"
              autoComplete="current-password"
            />
          </div>

          {error && <p className="cp-auth-err">{error}</p>}

          <button type="submit" disabled={loading} className="cp-btn cp-btn-primary cp-block" style={{ padding: 15 }}>
            {loading ? "Giriş yapılıyor…" : "Giriş Yap"}
          </button>
        </form>
        <a href="/control/set-password" className="cp-auth-link">
          Şifremi unuttum
        </a>
      </div>
    </div>
  );
}
