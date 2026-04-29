"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#0D1829",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
    }}>
      <h1 style={{
        fontFamily: "Georgia, serif",
        fontSize: "80px",
        fontWeight: 700,
        color: "#C9B87A",
        lineHeight: 1,
        marginBottom: "8px",
      }}>
        21K
      </h1>

      <p style={{ color: "#F5F2ED", fontSize: "11px", letterSpacing: "0.3em", marginBottom: "4px" }}>
        TRAINING LEAGUE
      </p>
      <p style={{ color: "#D4C5A9", fontSize: "10px", letterSpacing: "0.2em", marginBottom: "32px" }}>
        LEH HALF MARATHON · 13 SEPT 2026
      </p>

      {!sent ? (
        <div style={{
          width: "100%",
          maxWidth: "380px",
          backgroundColor: "#1A2744",
          borderRadius: "16px",
          padding: "24px",
          border: "1px solid rgba(212,197,169,0.1)",
        }}>
          <h2 style={{ color: "#F5F2ED", fontFamily: "Georgia, serif", fontSize: "22px", marginBottom: "8px" }}>
            Welcome Back
          </h2>
          <p style={{ color: "#D4C5A9", fontSize: "14px", marginBottom: "20px" }}>
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
          <p style={{ color: "rgba(212,197,169,0.4)", fontSize: "11px", textAlign: "center", marginTop: "16px" }}>
            Access restricted to league members only
          </p>
        </div>
      ) : (
        <div style={{
          width: "100%",
          maxWidth: "380px",
          backgroundColor: "#1A2744",
          borderRadius: "16px",
          padding: "32px 24px",
          border: "1px solid rgba(212,197,169,0.1)",
          textAlign: "center",
        }}>
          <p style={{ color: "#F5F2ED", fontFamily: "Georgia, serif", fontSize: "22px", marginBottom: "8px" }}>
            Check your email
          </p>
          <p style={{ color: "#D4C5A9", fontSize: "14px" }}>Magic link sent to</p>
          <p style={{ color: "#C9B87A", fontSize: "14px", fontWeight: 600, marginTop: "4px" }}>{email}</p>
        </div>
      )}
    </div>
  );
}
