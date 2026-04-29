"use client";

import { useState } from "react";
import CountdownPill from "@/components/CountdownPill";
import { createClient } from "@/lib/supabase-browser";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function MountainSilhouette() {
  return (
    <div className="absolute bottom-0 left-0 right-0 pointer-events-none select-none">
      <svg
        viewBox="0 0 430 220"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="w-full"
      >
        {/* Back range — barely lighter than navy-deep */}
        <path
          d="M0 220 L0 135 L25 118 L55 130 L80 100 L110 115 L140 82 L165 98 L195 68 L220 86 L248 70 L275 90 L305 74 L330 93 L358 78 L385 96 L410 84 L430 90 L430 220 Z"
          fill="#162033"
        />
        {/* Mid range */}
        <path
          d="M0 220 L0 158 L35 142 L65 152 L95 132 L125 146 L155 122 L180 138 L210 126 L240 143 L268 130 L298 144 L328 132 L358 146 L390 136 L430 140 L430 220 Z"
          fill="#1A2744"
        />
        {/* Front range — closest, shortest */}
        <path
          d="M0 220 L0 178 L45 165 L80 174 L112 160 L145 170 L172 158 L205 172 L235 162 L268 174 L300 165 L332 175 L368 166 L400 176 L430 170 L430 220 Z"
          fill="#1E2E50"
        />
      </svg>
    </div>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);

    if (authError) {
      setError(authError.message);
    } else {
      setSuccess(true);
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center overflow-hidden bg-[#0D1829]">
      <MountainSilhouette />

      <div className="relative z-10 flex flex-col items-center w-full px-5 pt-14 pb-10">

        {/* Logo */}
        <div className="flex flex-col items-center mb-5">
          <h1 className="font-playfair text-[80px] font-bold text-saffron leading-none tracking-tight">
            21K
          </h1>
          <p className="font-sans text-xs font-bold tracking-[0.35em] text-stone uppercase mt-2">
            Training League
          </p>
          <p className="font-sans text-[10px] tracking-[0.2em] text-sand uppercase mt-1.5">
            Leh Half Marathon · 13 Sept 2026
          </p>
        </div>

        {/* Countdown pill */}
        <div className="mb-10">
          <CountdownPill />
        </div>

        {/* Auth card */}
        <div className="w-full bg-navy rounded-2xl p-6 border border-sand/10 shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
          {!success ? (
            <>
              <h2 className="font-playfair text-2xl font-semibold text-stone mb-1">
                Welcome Back
              </h2>
              <p className="font-sans text-sm text-sand mb-6 leading-relaxed">
                Enter your email to receive a magic link
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="your@email.com"
                  autoComplete="email"
                  className="w-full bg-transparent border border-sand/30 rounded-xl px-4 py-3.5 text-stone font-sans text-sm placeholder:text-sand/35 focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron/30 transition-all"
                  disabled={loading}
                />

                {error && (
                  <p className="font-sans text-xs text-red-400 -mt-1">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full bg-saffron text-navy-deep font-sans font-bold text-sm tracking-[0.2em] uppercase py-4 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-opacity active:scale-[0.98]"
                >
                  {loading ? "Sending…" : "Send Magic Link"}
                </button>
              </form>

              <p className="font-sans text-[11px] text-sand/40 text-center mt-5 tracking-wide">
                Access restricted to league members only
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center py-4 text-center">
              <div className="w-14 h-14 rounded-full bg-himalayan/20 flex items-center justify-center mb-5 border border-himalayan/30">
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#4A7C59"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <h2 className="font-playfair text-2xl font-semibold text-stone mb-3">
                Check your email
              </h2>
              <p className="font-sans text-sm text-sand leading-relaxed">
                Magic link sent to
              </p>
              <p className="font-sans text-sm font-semibold text-saffron mt-1 break-all">
                {email}
              </p>
              <p className="font-sans text-xs text-sand/40 mt-5 leading-relaxed">
                Click the link in your inbox to sign in.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
