"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CountdownPill from "@/components/CountdownPill";

const quotes = [
  { quote: "No human is ever limited.", author: "Eliud Kipchoge" },
  { quote: "Stay hard.", author: "David Goggins" },
  { quote: "The mountains are calling and I must go.", author: "John Muir" },
  { quote: "It never always gets worse.", author: "Kilian Jornet" },
  { quote: "Your body can withstand almost anything. It's your mind you have to convince.", author: "Unknown" },
  { quote: "Run when you can, walk when you have to, crawl if you must. Just never give up.", author: "Dean Karnazes" },
  { quote: "The altitude is not your enemy. Your doubt is.", author: "Unknown" },
  { quote: "Leh is not the finish line. It is the proof.", author: "Unknown" },
  { quote: "Pain is temporary. Leh is forever.", author: "Unknown" },
  { quote: "Every kilometre at altitude is worth three at sea level.", author: "Milind Soman" },
];

function MountainSilhouette() {
  return (
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, pointerEvents: "none", userSelect: "none" }}>
      <svg
        viewBox="0 0 430 280"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        style={{ width: "100%", height: "38vh", display: "block" }}
      >
        <path d="M0 280 L0 175 L18 158 L32 140 L44 118 L54 94 L61 68 L67 42 L72 18 L76 4 L80 16 L84 6 L88 22 L93 10 L98 28 L104 14 L109 34 L115 20 L121 42 L128 28 L136 50 L145 35 L156 58 L167 43 L180 64 L193 50 L206 70 L220 56 L235 74 L251 60 L267 80 L283 66 L300 85 L317 72 L334 90 L352 78 L369 96 L387 84 L406 100 L430 95 L430 280 Z" fill="#162033" />
        <path d="M0 280 L0 200 L16 188 L30 174 L44 160 L56 144 L67 128 L76 112 L84 98 L90 86 L96 98 L101 86 L106 74 L112 86 L117 74 L124 90 L130 77 L139 94 L147 80 L158 98 L168 84 L180 103 L192 88 L206 107 L220 92 L236 111 L252 97 L268 115 L285 101 L303 118 L320 104 L338 122 L356 108 L374 125 L393 112 L412 128 L430 122 L430 280 Z" fill="#1A2744" />
        <path d="M0 280 L0 222 L18 212 L34 200 L48 187 L61 173 L72 159 L81 146 L89 134 L96 146 L102 134 L108 122 L115 134 L121 123 L130 138 L137 126 L147 143 L156 130 L167 148 L178 134 L191 152 L204 138 L218 157 L233 143 L249 161 L265 147 L282 165 L298 151 L316 168 L333 154 L350 172 L368 158 L386 174 L404 161 L430 168 L430 280 Z" fill="#1E2E50" />
        <path d="M0 280 L0 242 L20 233 L36 222 L50 211 L63 199 L74 188 L83 177 L91 167 L99 177 L106 167 L113 157 L121 168 L128 157 L137 171 L145 159 L155 174 L164 162 L175 178 L185 165 L197 181 L209 168 L223 184 L237 172 L252 188 L267 175 L283 191 L299 178 L316 194 L333 181 L350 197 L368 184 L385 200 L403 187 L420 202 L430 197 L430 280 Z" fill="#243358" />
        <path d="M0 280 L0 258 L22 250 L38 240 L52 230 L64 220 L75 211 L84 203 L93 213 L100 203 L108 194 L116 204 L124 195 L133 208 L142 197 L152 210 L162 200 L172 214 L183 203 L194 218 L206 206 L219 221 L232 209 L246 224 L260 212 L275 228 L290 215 L305 230 L321 218 L337 233 L353 221 L369 236 L386 223 L402 238 L418 226 L430 230 L430 280 Z" fill="#1A2744" />
      </svg>
    </div>
  );
}

export default function SplashPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<{ quote: string; author: string } | null>(null);

  useEffect(() => {
    setSelected(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  return (
    <>
      <style>{`
        @keyframes gentlePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>

      <div
        onClick={() => router.push("/")}
        style={{
          position: "relative",
          minHeight: "100vh",
          backgroundColor: "#0D1829",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          overflow: "hidden",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <MountainSilhouette />

        {/* Countdown pill */}
        <div style={{ paddingTop: "52px", position: "relative", zIndex: 10 }}>
          <CountdownPill />
        </div>

        {/* Quote area — empty on server, filled on client */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 10%",
          position: "relative",
          zIndex: 10,
          textAlign: "center",
        }}>
          {selected && (
            <>
              <p style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontStyle: "italic",
                fontSize: "clamp(20px, 5.5vw, 28px)",
                fontWeight: 600,
                color: "#F5F2ED",
                lineHeight: 1.6,
                marginBottom: "22px",
              }}>
                &ldquo;{selected.quote}&rdquo;
              </p>
              <p style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: "13px",
                fontWeight: 500,
                color: "#C9B87A",
                letterSpacing: "0.06em",
              }}>
                &mdash; {selected.author}
              </p>
            </>
          )}
        </div>

        {/* Tap to continue */}
        <div style={{
          paddingBottom: "calc(38vh + 28px)",
          position: "relative",
          zIndex: 10,
        }}>
          <p style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: "10px",
            fontWeight: 700,
            color: "#C9B87A",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            animation: "gentlePulse 2.4s ease-in-out infinite",
          }}>
            Tap Anywhere to Continue
          </p>
        </div>
      </div>
    </>
  );
}
