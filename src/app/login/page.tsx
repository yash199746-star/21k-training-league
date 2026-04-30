"use client";

import { useState } from "react";

const MountainSVG = (
  <svg
    viewBox="0 0 430 932"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      zIndex: 0,
    }}
    preserveAspectRatio="xMidYMid slice"
  >
    {/* Layer 1 — distant mountains */}
    <path d="M0 500 L50 420 L100 445 L150 390 L200 410 L250 375 L280 395 L310 370 L350 388 L390 405 L430 385 L430 932 L0 932 Z" fill="#162033" />
    {/* Layer 2 — mid mountains */}
    <path d="M0 560 L40 490 L90 510 L130 470 L170 488 L200 455 L230 440 L260 455 L290 470 L330 488 L370 468 L410 482 L430 470 L430 932 L0 932 Z" fill="#1A2744" />
    {/* Layer 3 — nearer mountains */}
    <path d="M0 620 L30 565 L70 580 L100 545 L130 562 L155 530 L175 518 L215 480 L255 518 L275 530 L300 562 L330 545 L360 580 L400 565 L430 575 L430 932 L0 932 Z" fill="#1E2E50" />
    {/* Layer 4 — foreground slopes */}
    <path d="M0 932 L0 680 L50 650 L100 665 L140 640 L170 655 L190 630 L215 480 L240 630 L260 655 L290 640 L330 665 L380 650 L430 665 L430 932 Z" fill="#243358" />
    {/* Main center peak */}
    <path d="M185 650 L215 480 L245 650 Z" fill="#1E2E50" />
    {/* Monastery — main structure */}
    <rect x="203" y="462" width="24" height="18" rx="1" fill="#C9B87A" />
    {/* Monastery — left wing */}
    <rect x="197" y="468" width="8" height="12" rx="1" fill="#C9B87A" />
    {/* Monastery — right wing */}
    <rect x="225" y="468" width="8" height="12" rx="1" fill="#C9B87A" />
    {/* Monastery — center tower */}
    <rect x="209" y="454" width="12" height="10" rx="1" fill="#C9B87A" />
    {/* Monastery — top spire */}
    <path d="M213 454 L215 448 L217 454 Z" fill="#C9B87A" />
    {/* Monastery — left dome */}
    <path d="M199 468 L201 464 L203 468 Z" fill="#C9B87A" />
    {/* Monastery — right dome */}
    <path d="M227 468 L229 464 L231 468 Z" fill="#C9B87A" />
    {/* Monastery windows */}
    <rect x="207" y="464" width="3" height="4" rx="0.5" fill="#0D1829" />
    <rect x="220" y="464" width="3" height="4" rx="0.5" fill="#0D1829" />
    <rect x="199" y="470" width="2" height="3" rx="0.5" fill="#0D1829" />
    <rect x="229" y="470" width="2" height="3" rx="0.5" fill="#0D1829" />
    {/* Snow on peak */}
    <path d="M205 495 L215 480 L225 495 L220 498 L215 496 L210 498 Z" fill="#F5F2ED" opacity="0.25" />
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
      position: "relative",
    }}>
      {MountainSVG}

      {/* Logo */}
      <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
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

      {/* Form */}
      {!sent ? (
        <div style={{
          position: "relative",
          zIndex: 1,
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
            placeholder="your@email.com"
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
        </div>
      )}
    </div>
  );
}
