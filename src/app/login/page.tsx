"use client";

import { useState } from "react";

const MountainSVG = (
  <svg
    viewBox="0 0 430 300"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      width: "100%",
      height: "38vh",
      zIndex: 0,
    }}
    preserveAspectRatio="xMidYMax slice"
  >
    <path
      d="M0 220 L30 180 L60 195 L90 160 L120 175 L150 145 L180 165 L210 140 L240 158 L270 142 L300 160 L330 148 L360 168 L390 152 L420 170 L430 165 L430 300 L0 300 Z"
      fill="#162033"
    />
    <path
      d="M0 240 L25 200 L55 215 L80 185 L110 200 L135 170 L160 188 L185 172 L210 155 L235 170 L255 158 L275 172 L300 185 L325 165 L355 182 L380 168 L410 185 L430 178 L430 300 L0 300 Z"
      fill="#1A2744"
    />
    <path
      d="M0 260 L20 230 L45 242 L70 215 L95 228 L115 205 L135 218 L155 195 L175 210 L195 188 L215 172 L235 188 L255 195 L275 210 L300 220 L325 205 L350 218 L375 208 L400 222 L430 210 L430 300 L0 300 Z"
      fill="#1E2E50"
    />
    <path
      d="M0 300 L0 275 L40 260 L80 270 L110 250 L140 265 L160 245 L180 258 L200 235 L215 172 L230 235 L250 258 L270 245 L300 265 L330 250 L360 270 L390 260 L430 270 L430 300 Z"
      fill="#243358"
    />
    <path d="M175 258 L215 172 L255 258 Z" fill="#1E2E50" />
    <rect x="203" y="155" width="24" height="18" rx="1" fill="#C9B87A" />
    <rect x="197" y="161" width="8" height="12" rx="1" fill="#C9B87A" />
    <rect x="225" y="161" width="8" height="12" rx="1" fill="#C9B87A" />
    <rect x="209" y="148" width="12" height="10" rx="1" fill="#C9B87A" />
    <path d="M213 148 L215 142 L217 148 Z" fill="#C9B87A" />
    <path d="M199 161 L201 157 L203 161 Z" fill="#C9B87A" />
    <path d="M227 161 L229 157 L231 161 Z" fill="#C9B87A" />
    <rect x="207" y="158" width="3" height="4" rx="0.5" fill="#0D1829" />
    <rect x="220" y="158" width="3" height="4" rx="0.5" fill="#0D1829" />
    <rect x="199" y="164" width="2" height="3" rx="0.5" fill="#0D1829" />
    <rect x="229" y="164" width="2" height="3" rx="0.5" fill="#0D1829" />
    <path d="M205 175 L215 172 L225 175 L220 178 L215 176 L210 178 Z" fill="#F5F2ED" opacity="0.3" />
  </svg>
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent,  setSent]  = useState(false);

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#0D1829",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      paddingBottom: "calc(38vh + 32px)",
      position: "relative",
    }}>
      {MountainSVG}

      {/* Logo */}
      <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        <h1 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "72px",
          fontWeight: 700,
          fontStyle: "normal",
          color: "#C9B87A",
          lineHeight: 1,
          marginBottom: "8px",
          letterSpacing: "0.05em",
        }}>
          21K
        </h1>
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

      {/* Form */}
      {!sent ? (
        <div style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "380px",
          backgroundColor: "#1A2744",
          borderRadius: "16px",
          padding: "24px",
          border: "1px solid rgba(212,197,169,0.1)",
        }}>
          <h2 style={{ color: "#F5F2ED", fontFamily: "'Playfair Display', Georgia, serif", fontSize: "22px", marginBottom: "8px" }}>
            Welcome Back
          </h2>
          <p style={{ color: "#D4C5A9", fontFamily: "Montserrat, sans-serif", fontSize: "14px", marginBottom: "20px" }}>
            Enter your email to receive a magic link
          </p>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            style={{
              width: "100%",
              background: "transparent",
              border: "1px solid rgba(212,197,169,0.3)",
              borderRadius: "12px",
              padding: "14px 16px",
              color: "#F5F2ED",
              fontFamily: "Montserrat, sans-serif",
              fontSize: "14px",
              boxSizing: "border-box",
              marginBottom: "12px",
              outline: "none",
            }}
          />
          <button
            onClick={() => email && setSent(true)}
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
              cursor: email ? "pointer" : "not-allowed",
              opacity: email ? 1 : 0.4,
            }}
          >
            SEND MAGIC LINK
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
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "380px",
          backgroundColor: "#1A2744",
          borderRadius: "16px",
          padding: "32px 24px",
          border: "1px solid rgba(212,197,169,0.1)",
          textAlign: "center",
        }}>
          <p style={{ color: "#F5F2ED", fontFamily: "'Playfair Display', Georgia, serif", fontSize: "22px", marginBottom: "8px" }}>
            Check your email
          </p>
          <p style={{ color: "#D4C5A9", fontFamily: "Montserrat, sans-serif", fontSize: "14px" }}>Magic link sent to</p>
          <p style={{ color: "#C9B87A", fontFamily: "Montserrat, sans-serif", fontSize: "14px", fontWeight: 600, marginTop: "4px" }}>{email}</p>
        </div>
      )}
    </div>
  );
}
