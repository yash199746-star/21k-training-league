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
        viewBox="0 0 430 280"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        style={{ width: "100%", height: "38vh", display: "block" }}
      >
        {/* Layer 1 — furthest back, tallest dramatic peaks */}
        <path
          d="M0 280 L0 175 L18 158 L32 140 L44 118 L54 94 L61 68 L67 42 L72 18 L76 4 L80 16 L84 6 L88 22 L93 10 L98 28 L104 14 L109 34 L115 20 L121 42 L128 28 L136 50 L145 35 L156 58 L167 43 L180 64 L193 50 L206 70 L220 56 L235 74 L251 60 L267 80 L283 66 L300 85 L317 72 L334 90 L352 78 L369 96 L387 84 L406 100 L430 95 L430 280 Z"
          fill="#162033"
        />
        {/* Layer 2 */}
        <path
          d="M0 280 L0 200 L16 188 L30 174 L44 160 L56 144 L67 128 L76 112 L84 98 L90 86 L96 98 L101 86 L106 74 L112 86 L117 74 L124 90 L130 77 L139 94 L147 80 L158 98 L168 84 L180 103 L192 88 L206 107 L220 92 L236 111 L252 97 L268 115 L285 101 L303 118 L320 104 L338 122 L356 108 L374 125 L393 112 L412 128 L430 122 L430 280 Z"
          fill="#1A2744"
        />
        {/* Layer 3 — mid range */}
        <path
          d="M0 280 L0 222 L18 212 L34 200 L48 187 L61 173 L72 159 L81 146 L89 134 L96 146 L102 134 L108 122 L115 134 L121 123 L130 138 L137 126 L147 143 L156 130 L167 148 L178 134 L191 152 L204 138 L218 157 L233 143 L249 161 L265 147 L282 165 L298 151 L316 168 L333 154 L350 172 L368 158 L386 174 L404 161 L430 168 L430 280 Z"
          fill="#1E2E50"
        />
        {/* Layer 4 — closer range */}
        <path
          d="M0 280 L0 242 L20 233 L36 222 L50 211 L63 199 L74 188 L83 177 L91 167 L99 177 L106 167 L113 157 L121 168 L128 157 L137 171 L145 159 L155 174 L164 162 L175 178 L185 165 L197 181 L209 168 L223 184 L237 172 L252 188 L267 175 L283 191 L299 178 L316 194 L333 181 L350 197 L368 184 L385 200 L403 187 L420 202 L430 197 L430 280 Z"
          fill="#243358"
        />
        {/* Layer 5 — foreground, closest, shortest but jagged */}
        <path
          d="M0 280 L0 258 L22 250 L38 240 L52 230 L64 220 L75 211 L84 203 L93 213 L100 203 L108 194 L116 204 L124 195 L133 208 L142 197 L152 210 L162 200 L172 214 L183 203 L194 218 L206 206 L219 221 L232 209 L246 224 L260 212 L275 228 L290 215 L305 230 L321 218 L337 233 L353 221 L369 236 L386 223 L402 238 L418 226 L430 230 L430 280 Z"
          fill="#1A2744"
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
    <div suppressHydrationWarning className="relative min-h-screen flex flex-col items-center overflow-hidden bg-[#0D1829]">
      <MountainSilhouette />

      <div className="relative z-10 flex flex-col items-center w-full px-5 pt-14 pb-10">

        {/* Logo */}
        <div className="flex flex-col items-center mb-5">
          <h1
            className="font-playfair italic font-bold leading-none tracking-tight"
            style={{ fontSize: "88px", color: "#C9B87A" }}
          >
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
                  className="w-full bg-transparent border border-sand/30 rounded-xl px-4 py-3.5 text-stone font-sans text-sm placeholder:text-sand/35 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all"
                  disabled={loading}
                />

                {error && (
                  <p className="font-sans text-xs text-red-400 -mt-1">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full bg-gold text-navy-deep font-sans font-bold text-sm tracking-[0.2em] uppercase py-4 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-opacity active:scale-[0.98]"
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
              <p className="font-sans text-sm font-semibold text-gold mt-1 break-all">
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
