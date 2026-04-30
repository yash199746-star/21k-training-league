"use client";

import AppLayout from "@/components/AppLayout";
import CountdownPill from "@/components/CountdownPill";

// ── Mock data ────────────────────────────────────────────────────────────────
const USER = {
  name:                "Yash",
  initials:            "Y",
  email:               "yash@example.com",
  isChallengeMaster:   true,
  challengeMasterWeek: 12,
};

const SEASON = {
  totalPoints: 142,
  totalRuns:   23,
  totalKm:     67.5,
  bestStreak:  12,
};

const EARNED = new Set(["First Run", "Century", "Challenge Master", "Altitude Ready"]);

const ACTIVITIES = [
  { date: "Apr 29", type: "run",      desc: "Run · 6 km in 34:20",   pts: 12 },
  { date: "Apr 28", type: "activity", desc: "Gym · 45 min",           pts: 2  },
  { date: "Apr 27", type: "run",      desc: "Run · 5.2 km in 29:45",  pts: 5  },
  { date: "Apr 26", type: "rest",     desc: "Rest Day",                pts: 0  },
  { date: "Apr 25", type: "run",      desc: "Run · 7.3 km in 42:10",  pts: 7  },
  { date: "Apr 24", type: "activity", desc: "Yoga · 60 min",           pts: 2  },
  { date: "Apr 23", type: "run",      desc: "Run · 5 km in 28:30",    pts: 5  },
];

// ── Badge icon components ─────────────────────────────────────────────────────
function RunBadgeIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="15.5" cy="3.5" r="1.8" />
      <path d="M13.5 6.5L10 12" />
      <path d="M13.5 6.5L17 5" />
      <path d="M11.5 9.5L8 11.5" />
      <path d="M10 12L7.5 16.5 5 20" />
      <path d="M10 12L12.5 16 15.5 19.5" />
    </svg>
  );
}

function FlameIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2c0 5-5 7-5 13a5 5 0 0 0 10 0c0-6-5-8-5-13z" />
      <path d="M12 12c0 3-2 4-2 6a2 2 0 0 0 4 0c0-2-2-3-2-6z" />
    </svg>
  );
}

function MountainIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 20l6-10 4 5 3-4 5 9H3z" />
    </svg>
  );
}

function CrownBadgeIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={color} stroke="none">
      <path d="M2 19h20v2H2zM2 8l5 6.5L12 7l5 7.5L22 8v10H2z" />
    </svg>
  );
}

function DumbbellIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="9" width="4" height="6" rx="2" />
      <rect x="18" y="9" width="4" height="6" rx="2" />
      <rect x="6" y="7" width="3" height="10" rx="1.5" />
      <rect x="15" y="7" width="3" height="10" rx="1.5" />
      <path d="M9 12h6" />
    </svg>
  );
}

function TargetIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill={color} stroke="none" />
    </svg>
  );
}

function HimalayaIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 20l7-13 4 6 3-5 6 12H2z" />
      <path d="M9 7l2-4 2 4" />
    </svg>
  );
}

function LightningIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L4 14h8l-1 8 9-12h-8l1-8z" />
    </svg>
  );
}

// ── Activity type icons ───────────────────────────────────────────────────────
function ActivityRunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9B87A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="15.5" cy="3.5" r="1.8" />
      <path d="M13.5 6.5L10 12M13.5 6.5L17 5M11.5 9.5L8 11.5M10 12L7.5 16.5 5 20M10 12L12.5 16 15.5 19.5" />
    </svg>
  );
}

function ActivityGymIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4A7C59" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="9" width="4" height="6" rx="2" />
      <rect x="18" y="9" width="4" height="6" rx="2" />
      <rect x="6" y="7" width="3" height="10" rx="1.5" />
      <rect x="15" y="7" width="3" height="10" rx="1.5" />
      <path d="M9 12h6" />
    </svg>
  );
}

function ActivityRestIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(212,197,169,0.5)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

// ── Chevron ───────────────────────────────────────────────────────────────────
function ChevronRight({ color = "rgba(212,197,169,0.3)" }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

// ── Badge data ────────────────────────────────────────────────────────────────
const BADGES = [
  { id: "First Run",         label: "First Run",         sub: "Logged your first run",       Icon: RunBadgeIcon     },
  { id: "Week Warrior",      label: "Week Warrior",       sub: "7 day streak",                Icon: FlameIcon        },
  { id: "Altitude Ready",    label: "Altitude Ready",     sub: "50 km total",                 Icon: MountainIcon     },
  { id: "Challenge Master",  label: "Challenge Master",   sub: "Set a weekly challenge",      Icon: CrownBadgeIcon   },
  { id: "Century",           label: "Century",            sub: "100 points",                  Icon: DumbbellIcon     },
  { id: "Consistent",        label: "Consistent",         sub: "4 week streak",               Icon: TargetIcon       },
  { id: "Himalayan",         label: "Himalayan",          sub: "100 km total",                Icon: HimalayaIcon     },
  { id: "Speed Week",        label: "Speed Week",         sub: "4 runs in one week",          Icon: LightningIcon    },
];

// ── Shared styles ─────────────────────────────────────────────────────────────
const sectionTitle: React.CSSProperties = {
  fontFamily: "Montserrat, sans-serif",
  fontSize: "10px",
  fontWeight: 700,
  color: "rgba(212,197,169,0.5)",
  letterSpacing: "0.25em",
  textTransform: "uppercase",
  marginBottom: "12px",
};

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  return (
    <AppLayout>
      <div style={{ minHeight: "100vh", backgroundColor: "#1A2744", padding: "52px 20px 100px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "30px",
            fontWeight: 700,
            color: "#F5F2ED",
            margin: "0 0 14px",
          }}>
            Profile
          </h1>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <CountdownPill />
          </div>
        </div>

        {/* ── Section 1: Profile Hero ── */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "32px" }}>

          {/* Avatar */}
          <div style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            backgroundColor: "#C9B87A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "32px",
            fontWeight: 700,
            color: "#0D1829",
            marginBottom: "14px",
            boxShadow: "0 4px 20px rgba(201,184,122,0.3)",
          }}>
            {USER.initials}
          </div>

          {/* Name */}
          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "26px",
            fontWeight: 700,
            color: "#F5F2ED",
            margin: "0 0 4px",
          }}>
            {USER.name}
          </h2>

          {/* Email */}
          <p style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: "12px",
            color: "rgba(212,197,169,0.5)",
            margin: "0 0 14px",
          }}>
            {USER.email}
          </p>

          {/* Challenge Master badge */}
          {USER.isChallengeMaster && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "rgba(201,184,122,0.1)",
              border: "1px solid rgba(201,184,122,0.28)",
              borderRadius: "999px",
              padding: "5px 14px",
              marginBottom: "16px",
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#C9B87A" stroke="none">
                <path d="M2 19h20v2H2zM2 8l5 6.5L12 7l5 7.5L22 8v10H2z" />
              </svg>
              <span style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: "11px",
                fontWeight: 700,
                color: "#C9B87A",
                letterSpacing: "0.05em",
              }}>
                Challenge Master · Week {USER.challengeMasterWeek}
              </span>
            </div>
          )}

          {/* Edit Profile */}
          <button
            onClick={() => console.log("edit profile")}
            style={{
              backgroundColor: "transparent",
              border: "1px solid rgba(212,197,169,0.25)",
              borderRadius: "999px",
              padding: "8px 20px",
              fontFamily: "Montserrat, sans-serif",
              fontSize: "11px",
              fontWeight: 700,
              color: "rgba(212,197,169,0.6)",
              letterSpacing: "0.12em",
              cursor: "pointer",
              textTransform: "uppercase",
            }}
          >
            Edit Profile
          </button>
        </div>

        {/* ── Section 2: Season Summary ── */}
        <p style={sectionTitle}>Season Summary</p>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "8px",
          marginBottom: "28px",
        }}>
          {[
            { label: "Points",   value: SEASON.totalPoints, unit: ""    },
            { label: "Runs",     value: SEASON.totalRuns,   unit: ""    },
            { label: "KM",       value: SEASON.totalKm,     unit: ""    },
            { label: "Streak",   value: SEASON.bestStreak,  unit: "d"   },
          ].map(({ label, value, unit }) => (
            <div key={label} style={{
              backgroundColor: "#0D1829",
              border: "1px solid rgba(212,197,169,0.08)",
              borderRadius: "14px",
              padding: "14px 8px",
              textAlign: "center",
            }}>
              <div style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "22px",
                fontWeight: 700,
                color: "#C9B87A",
                lineHeight: 1,
              }}>
                {value}{unit}
              </div>
              <div style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: "9px",
                fontWeight: 700,
                color: "rgba(212,197,169,0.4)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginTop: "6px",
              }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* ── Section 3: Badges ── */}
        <p style={sectionTitle}>Badges & Achievements</p>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "10px",
          marginBottom: "28px",
        }}>
          {BADGES.map(({ id, label, sub, Icon }) => {
            const earned = EARNED.has(id);
            return (
              <div key={id} style={{
                backgroundColor: "#0D1829",
                border: `1px solid ${earned ? "rgba(201,184,122,0.25)" : "rgba(212,197,169,0.06)"}`,
                borderRadius: "14px",
                padding: "14px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                opacity: earned ? 1 : 0.45,
              }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: earned ? "rgba(201,184,122,0.12)" : "rgba(212,197,169,0.05)",
                  border: `1px solid ${earned ? "rgba(201,184,122,0.3)" : "rgba(212,197,169,0.1)"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <Icon color={earned ? "#C9B87A" : "rgba(212,197,169,0.35)"} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: earned ? "#F5F2ED" : "rgba(212,197,169,0.4)",
                    margin: "0 0 2px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}>
                    {label}
                  </p>
                  <p style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: "9px",
                    color: earned ? "rgba(212,197,169,0.45)" : "rgba(212,197,169,0.25)",
                    margin: 0,
                    lineHeight: 1.3,
                  }}>
                    {sub}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Section 4: Recent Activity Feed ── */}
        <p style={sectionTitle}>Recent Activity</p>
        <div style={{
          backgroundColor: "#0D1829",
          border: "1px solid rgba(212,197,169,0.08)",
          borderRadius: "16px",
          overflow: "hidden",
          marginBottom: "28px",
        }}>
          {ACTIVITIES.map(({ date, type, desc, pts }, i) => {
            const isRun      = type === "run";
            const isActivity = type === "activity";
            const color = isRun ? "#C9B87A" : isActivity ? "#4A7C59" : "rgba(212,197,169,0.4)";
            const IconEl = isRun ? <ActivityRunIcon /> : isActivity ? <ActivityGymIcon /> : <ActivityRestIcon />;
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "13px 16px",
                  borderBottom: i < ACTIVITIES.length - 1 ? "1px solid rgba(212,197,169,0.06)" : "none",
                }}
              >
                {/* Icon dot */}
                <div style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  backgroundColor: isRun
                    ? "rgba(201,184,122,0.1)"
                    : isActivity
                    ? "rgba(74,124,89,0.1)"
                    : "rgba(212,197,169,0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {IconEl}
                </div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#F5F2ED",
                    margin: 0,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}>
                    {desc}
                  </p>
                  <p style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: "10px",
                    color: "rgba(212,197,169,0.4)",
                    margin: "2px 0 0",
                  }}>
                    {date}
                  </p>
                </div>

                {/* Points */}
                {pts > 0 && (
                  <span style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: "12px",
                    fontWeight: 700,
                    color,
                    flexShrink: 0,
                  }}>
                    +{pts} pts
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Section 5: Settings ── */}
        <p style={sectionTitle}>Settings</p>
        <div style={{
          backgroundColor: "#0D1829",
          border: "1px solid rgba(212,197,169,0.08)",
          borderRadius: "16px",
          overflow: "hidden",
        }}>
          {/* Notification Preferences */}
          <button
            onClick={() => console.log("notifications")}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 18px",
              background: "none",
              border: "none",
              borderBottom: "1px solid rgba(212,197,169,0.06)",
              cursor: "pointer",
            }}
          >
            <span style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: "13px",
              fontWeight: 500,
              color: "#F5F2ED",
            }}>
              Notification Preferences
            </span>
            <ChevronRight />
          </button>

          {/* League Settings (admin only) */}
          <button
            onClick={() => console.log("league settings")}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 18px",
              background: "none",
              border: "none",
              borderBottom: "1px solid rgba(212,197,169,0.06)",
              cursor: "pointer",
            }}
          >
            <div>
              <span style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: "13px",
                fontWeight: 500,
                color: "#F5F2ED",
                display: "block",
              }}>
                League Settings
              </span>
              <span style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: "10px",
                color: "rgba(212,197,169,0.35)",
                letterSpacing: "0.05em",
              }}>
                Admin only
              </span>
            </div>
            <ChevronRight />
          </button>

          {/* Sign Out */}
          <button
            onClick={() => console.log("sign out")}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 18px",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <span style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: "13px",
              fontWeight: 600,
              color: "rgba(210,70,70,0.85)",
            }}>
              Sign Out
            </span>
            <ChevronRight color="rgba(210,70,70,0.3)" />
          </button>
        </div>

      </div>
    </AppLayout>
  );
}
