"use client";

import { Suspense } from "react";
import { createClient } from "@/lib/supabase-browser";
import CountdownPill from "@/components/CountdownPill";

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
      backgroundPosition: "center 40%",
      backgroundRepeat: "no-repeat",
      backgroundAttachment: "scroll",
    }}>
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "linear-gradient(to bottom, rgba(13,24,41,0.5) 0%, rgba(13,24,41,0.65) 50%, rgba(13,24,41,0.85) 100%)",
      }} />
    </div>
  );
}

function LoginForm() {
  async function handleGoogleLogin() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#0D1829",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      padding: "10vh 24px 40px",
      position: "relative",
    }}>
      <PhotoBackground />

      <div style={{ position: "relative", zIndex: 10, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>

      {/* Logo */}
      <div style={{ textAlign: "center" }}>
        <p style={{
          fontFamily: "var(--font-cinzel), 'Cinzel', serif",
          fontWeight: 700,
          color: "#C9B87A",
          fontSize: "56px",
          letterSpacing: "0.08em",
          lineHeight: 1,
          margin: "0 0 8px 0",
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
          marginBottom: "16px",
        }}>
          LADAKH HALF MARATHON · 13 SEPT 2026
        </p>
        <div style={{ marginBottom: "32px" }}>
          <CountdownPill />
        </div>
      </div>

      {/* Card */}
      <div style={{
        width: "100%",
        maxWidth: "380px",
        backgroundColor: "rgba(13,24,41,0.75)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderRadius: "16px",
        padding: "24px",
        border: "1px solid rgba(212,197,169,0.12)",
      }}>
        <h2 style={{
          color: "#F5F2ED",
          fontFamily: "'Playfair Display', Georgia, serif",
          fontStyle: "normal",
          fontWeight: 700,
          fontSize: "22px",
          marginBottom: "4px",
        }}>
          Welcome Back
        </h2>
        <p style={{
          color: "#D4C5A9",
          fontFamily: "Montserrat, sans-serif",
          fontSize: "13px",
          marginBottom: "20px",
        }}>
          Sign in to continue your training
        </p>

        <button
          onClick={handleGoogleLogin}
          style={{
            background: "white",
            color: "#1a1a1a",
            border: "none",
            borderRadius: "8px",
            padding: "12px 20px",
            fontFamily: "Montserrat, sans-serif",
            fontWeight: 600,
            fontSize: "14px",
            letterSpacing: "0.02em",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            cursor: "pointer",
            marginBottom: "0",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1.94-1.86 2.95-4.3 2.95-2.61 0-4.73-2.12-4.73-4.73s2.12-4.73 4.73-4.73c1.19 0 2.27.41 3.11 1.09l2.21-2.21C12.9 2.38 11.05 1.5 8.98 1.5 4.89 1.5 1.5 4.89 1.5 8.98s3.39 7.48 7.48 7.48c4.32 0 7.18-3.04 7.18-7.18 0-.49-.05-.96-.15-1.28z"/>
          </svg>
          Continue with Google
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
