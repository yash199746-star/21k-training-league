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
    preserveAspectRatio="xMidYMax slice"
  >
    <rect width="430" height="932" fill="#0D1829" />
    <path d="M0 620 Q50 560 100 580 Q150 530 200 545 Q240 510 280 528 Q320 500 360 518 Q395 505 430 515 L430 932 L0 932 Z" fill="#162033" />
    <path d="M0 680 Q40 630 90 648 Q130 610 175 625 Q205 595 235 608 Q265 595 295 610 Q335 625 375 612 Q405 620 430 615 L430 932 L0 932 Z" fill="#1A2744" />
    <path d="M0 750 Q30 710 70 725 Q100 695 130 710 Q155 678 180 692 L215 620 L250 692 Q275 678 300 710 Q330 695 360 725 Q395 710 430 728 L430 932 L0 932 Z" fill="#1E2E50" />
    <path d="M0 932 L0 800 Q50 775 100 788 Q140 765 175 778 Q195 755 215 620 Q235 755 255 778 Q290 765 330 788 Q375 775 430 795 L430 932 Z" fill="#243358" />
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
