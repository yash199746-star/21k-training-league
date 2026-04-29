"use client";

export default function LoginError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#0D1829",
      color: "#F5F2ED",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      fontFamily: "monospace",
    }}>
      <p style={{ color: "#E8A020", fontWeight: "bold", marginBottom: "12px" }}>
        Runtime error — paste this into Claude:
      </p>
      <pre style={{
        backgroundColor: "#1A2744",
        padding: "16px",
        borderRadius: "8px",
        fontSize: "12px",
        overflowX: "auto",
        maxWidth: "100%",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        color: "#ff6b6b",
        marginBottom: "20px",
      }}>
        {error.message}
        {"\n\n"}
        {error.stack}
      </pre>
      <button
        onClick={reset}
        style={{
          backgroundColor: "#E8A020",
          color: "#0D1829",
          border: "none",
          padding: "10px 24px",
          borderRadius: "8px",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        Try again
      </button>
    </div>
  );
}
