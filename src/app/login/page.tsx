"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

function PhotoBackground() {
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      zIndex: 0,
      backgroundImage: "url(/ladakh.png)",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    }}>
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "linear-gradient(to bottom, rgba(13,24,41,0.75) 0%, rgba(13,24,41,0.85) 60%, rgba(13,24,41,0.95) 100%)",
      }} />
    </div>
  );
}

function LoginForm() {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const searchParams          = useSearchParams();
  const callbackError         = searchParams.get("error");

  async function handleSend() {
    if (!email || loading) return;
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (otpError) {
      setError("Failed to send magic link. Please try again.");
    } else {
      setSent(true);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#0D1829",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      position: "relative",
    }}>
      <PhotoBackground />

      <div style={{ position: "relative", zIndex: 10, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>

      {/* Logo */}
      <div style={{ textAlign: "center" }}>
        <p style={{
          fontFamily: "Montserrat, sans-serif",
          fontWeight: 800,
          color: "#C9B87A",
          fontSize: "52px",
          letterSpacing: "0.2em",
          lineHeight: 1,
          marginBottom: "10px",
        }}>
          21K
        </p>
        <p style={{
          fontFamily: "Montserrat, sans-serif",
          fontWeight: 600,
          color: "#F5F2ED",
          fontSize: "11px",
          letterSpacing: "0.3em",
          marginBottom: "4px",
        }}>
          TRAINING LEAGUE
        </p>
        <p style={{
          fontFamily: "Montserrat, sans-serif",
          fontWeight: 400,
          color: "#D4C5A9",
          fontSize: "10px",
          letterSpacing: "0.2em",
          marginBottom: "32px",
        }}>
          LEH HALF MARATHON · 13 SEPT 2026
        </p>
      </div>

      {/* Callback error banner */}
      {callbackError && (
        <div style={{
          width: "100%",
          maxWidth: "380px",
          backgroundColor: "rgba(210,70,70,0.15)",
          border: "1px solid rgba(210,70,70,0.35)",
          borderRadius: "10px",
          padding: "10px 14px",
          marginBottom: "12px",
          fontFamily: "Montserrat, sans-serif",
          fontSize: "12px",
          color: "#E07070",
          textAlign: "center",
        }}>
          Link expired or invalid. Please request a new one.
        </div>
      )}

      {/* Form */}
      {!sent ? (
        <div style={{
          width: "100%",
          maxWidth: "380px",
          backgroundColor: "rgba(13,24,41,0.85)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderRadius: "16px",
          padding: "24px",
          border: "1px solid rgba(212,197,169,0.12)",
        }}>
          <h2 style={{
            color: "#F5F2ED",
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "22px",
            marginBottom: "8px",
          }}>
            Welcome Back
          </h2>
          <p style={{
            color: "#D4C5A9",
            fontFamily: "Montserrat, sans-serif",
            fontSize: "14px",
            marginBottom: "20px",
          }}>
            Enter your email to receive a magic link
          </p>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder="your@email.com"
            disabled={loading}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(212,197,169,0.25)",
              borderRadius: "12px",
              padding: "14px 16px",
              color: "#F5F2ED",
              fontFamily: "Montserrat, sans-serif",
              fontSize: "14px",
              boxSizing: "border-box",
              marginBottom: "12px",
              outline: "none",
              opacity: loading ? 0.5 : 1,
            }}
          />
          {error && (
            <p style={{
              color: "#E07070",
              fontFamily: "Montserrat, sans-serif",
              fontSize: "12px",
              marginBottom: "10px",
              textAlign: "center",
            }}>
              {error}
            </p>
          )}
          <button
            onClick={handleSend}
            disabled={!email || loading}
            style={{
              width: "100%",
              backgroundColor: "#C9B87A",
              color: "#0D1829",
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 700,
              fontSize: "13px",
              letterSpacing: "0.15em",
              padding: "14px",
              borderRadius: "12px",
              border: "none",
              cursor: email && !loading ? "pointer" : "not-allowed",
              opacity: email && !loading ? 1 : 0.4,
            }}
          >
            {loading ? "SENDING…" : "SEND MAGIC LINK"}
          </button>
          <p style={{
            color: "rgba(212,197,169,0.4)",
            fontFamily: "Montserrat, sans-serif",
            fontSize: "11px",
            textAlign: "center",
            marginTop: "16px",
          }}>
            Access restricted to league members only
          </p>
        </div>
      ) : (
        <div style={{
          width: "100%",
          maxWidth: "380px",
          backgroundColor: "rgba(13,24,41,0.85)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderRadius: "16px",
          padding: "32px 24px",
          border: "1px solid rgba(212,197,169,0.12)",
          textAlign: "center",
        }}>
          <p style={{
            color: "#F5F2ED",
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "22px",
            marginBottom: "8px",
          }}>
            Check your email
          </p>
          <p style={{ color: "#D4C5A9", fontFamily: "Montserrat, sans-serif", fontSize: "14px" }}>
            Magic link sent to
          </p>
          <p style={{
            color: "#C9B87A",
            fontFamily: "Montserrat, sans-serif",
            fontSize: "14px",
            fontWeight: 600,
            marginTop: "4px",
          }}>
            {email}
          </p>
          <button
            onClick={() => { setSent(false); setEmail(""); }}
            style={{
              marginTop: "20px",
              background: "none",
              border: "none",
              color: "rgba(212,197,169,0.5)",
              fontFamily: "Montserrat, sans-serif",
              fontSize: "12px",
              cursor: "pointer",
              letterSpacing: "0.05em",
            }}
          >
            Wrong email? Go back
          </button>
        </div>
      )}

      </div>{/* end content wrapper */}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
