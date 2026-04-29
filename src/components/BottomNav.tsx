"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const sideTabs = [
  {
    label: "Home",
    href: "/",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
        <path d="M9 21V12h6v9" />
      </svg>
    ),
  },
  {
    label: "My Stats",
    href: "/stats",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="12" width="4" height="9" rx="1" />
        <rect x="10" y="7" width="4" height="14" rx="1" />
        <rect x="17" y="3" width="4" height="18" rx="1" />
      </svg>
    ),
  },
  {
    label: "Challenge",
    href: "/challenge",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 21h8M12 17v4" />
        <path d="M7 4H4v5c0 3 2 5 5 6" />
        <path d="M17 4h3v5c0 3-2 5-5 6" />
        <path d="M6 4h12v8a6 6 0 0 1-12 0V4z" />
      </svg>
    ),
  },
  {
    label: "Profile",
    href: "/profile",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  const addActive = pathname === "/add-activity";

  return (
    <nav style={{
      position: "fixed",
      bottom: 0,
      left: "50%",
      transform: "translateX(-50%)",
      width: "100%",
      maxWidth: "430px",
      backgroundColor: "#0D1829",
      borderTop: "1px solid rgba(212,197,169,0.1)",
      zIndex: 50,
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        height: "64px",
        padding: "0 8px",
        position: "relative",
      }}>
        {/* Left two tabs: Home, My Stats */}
        {sideTabs.slice(0, 2).map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "2px",
                flex: 1,
                padding: "8px 0",
                color: active ? "#C9B87A" : "rgba(212,197,169,0.4)",
                textDecoration: "none",
              }}
            >
              {tab.icon(active)}
              <span style={{
                fontSize: "9px",
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 700,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                color: active ? "#C9B87A" : "rgba(212,197,169,0.4)",
              }}>
                {tab.label}
              </span>
            </Link>
          );
        })}

        {/* Center FAB: Add Activity */}
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", position: "relative" }}>
          <Link
            href="/add-activity"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              textDecoration: "none",
              position: "relative",
              top: "-14px",
            }}
          >
            <div style={{
              width: "52px",
              height: "52px",
              borderRadius: "50%",
              backgroundColor: addActive ? "#E8D898" : "#C9B87A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: addActive
                ? "0 4px 20px rgba(201,184,122,0.55), 0 0 0 4px rgba(201,184,122,0.15)"
                : "0 4px 16px rgba(201,184,122,0.35), 0 0 0 3px rgba(201,184,122,0.1)",
              flexShrink: 0,
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0D1829" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <span style={{
              fontSize: "9px",
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 700,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              color: addActive ? "#C9B87A" : "rgba(212,197,169,0.5)",
              marginTop: "2px",
            }}>
              Add
            </span>
          </Link>
        </div>

        {/* Right two tabs: Challenge, Profile */}
        {sideTabs.slice(2).map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "2px",
                flex: 1,
                padding: "8px 0",
                color: active ? "#C9B87A" : "rgba(212,197,169,0.4)",
                textDecoration: "none",
              }}
            >
              {tab.icon(active)}
              <span style={{
                fontSize: "9px",
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 700,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                color: active ? "#C9B87A" : "rgba(212,197,169,0.4)",
              }}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
