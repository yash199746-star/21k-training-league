"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import CountdownPill from "@/components/CountdownPill";

type ActivityType = "run" | "activity" | "rest" | null;

const SUBTYPES = ["Walk", "Cycle", "Gym", "Yoga", "Swim", "Sports", "Other"];

// ── Mock weekly data ────────────────────────────────────────────────────────
const MOCK_STREAK         = 8;
const MOCK_RUNS_USED      = 3;
const MOCK_RUNS_LIMIT     = 4;
const MOCK_ACTIVITY_USED  = 1;
const MOCK_ACTIVITY_LIMIT = 2;
const MOCK_REST_USED      = false;

const RUNS_REMAINING     = MOCK_RUNS_LIMIT     - MOCK_RUNS_USED;
const ACTIVITY_REMAINING = MOCK_ACTIVITY_LIMIT - MOCK_ACTIVITY_USED;

// ── Card icon components ────────────────────────────────────────────────────
function RunIcon({ active }: { active: boolean }) {
  const c = active ? "#C9B87A" : "rgba(212,197,169,0.4)";
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="15" cy="4" r="2" />
      <path d="M12.5 8l-3 5.5 3 2-2 4.5" />
      <path d="M9.5 13.5l-3-1.5" />
      <path d="M12.5 8l3.5-1.5" />
      <path d="M13 15.5l2.5 4" />
    </svg>
  );
}

function ActivityIcon({ active }: { active: boolean }) {
  const c = active ? "#C9B87A" : "rgba(212,197,169,0.4)";
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="9" width="4" height="6" rx="2" />
      <rect x="18" y="9" width="4" height="6" rx="2" />
      <rect x="6" y="7" width="3" height="10" rx="1.5" />
      <rect x="15" y="7" width="3" height="10" rx="1.5" />
      <path d="M9 12h6" />
    </svg>
  );
}

function RestIcon({ active }: { active: boolean }) {
  const c = active ? "#C9B87A" : "rgba(212,197,169,0.4)";
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

const TYPE_CARDS: {
  type: Exclude<ActivityType, null>;
  label: string;
  Icon: React.ComponentType<{ active: boolean }>;
}[] = [
  { type: "run",      label: "Run",      Icon: RunIcon      },
  { type: "activity", label: "Activity", Icon: ActivityIcon  },
  { type: "rest",     label: "Rest Day", Icon: RestIcon      },
];

// ── Helpers ─────────────────────────────────────────────────────────────────
function todayISO() {
  return new Date().toISOString().split("T")[0];
}

function calcPoints(type: ActivityType, distance: string, activityDuration: string): number {
  if (type === "run") {
    const km = parseFloat(distance);
    return !km || km < 2 ? 0 : Math.round(km);
  }
  if (type === "activity") {
    const mins = parseInt(activityDuration, 10);
    return !isNaN(mins) && mins >= 30 ? 2 : 0;
  }
  return 0;
}

// ── Shared input styles ──────────────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  fontFamily: "Montserrat, sans-serif",
  fontSize: "10px",
  fontWeight: 700,
  color: "rgba(212,197,169,0.5)",
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  display: "block",
  marginBottom: "8px",
};

const mmssInputStyle: React.CSSProperties = {
  background: "rgba(212,197,169,0.06)",
  border: "1px solid rgba(212,197,169,0.15)",
  borderRadius: "10px",
  outline: "none",
  fontFamily: "Montserrat, sans-serif",
  fontSize: "26px",
  fontWeight: 700,
  color: "#C9B87A",
  width: "80px",
  padding: "10px 0",
  textAlign: "center",
};

const durationInputStyle: React.CSSProperties = {
  background: "rgba(212,197,169,0.06)",
  border: "1px solid rgba(212,197,169,0.15)",
  borderRadius: "10px",
  outline: "none",
  fontFamily: "Montserrat, sans-serif",
  fontSize: "20px",
  fontWeight: 600,
  color: "#F5F2ED",
  width: "110px",
  padding: "10px 14px",
};

const dateInputStyle: React.CSSProperties = {
  background: "rgba(212,197,169,0.06)",
  border: "1px solid rgba(212,197,169,0.15)",
  borderRadius: "10px",
  outline: "none",
  fontFamily: "Montserrat, sans-serif",
  fontSize: "14px",
  color: "#F5F2ED",
  padding: "10px 14px",
  colorScheme: "dark" as React.CSSProperties["colorScheme"],
};

// ── Component ────────────────────────────────────────────────────────────────
export default function AddActivityPage() {
  const router = useRouter();

  const [activityType, setActivityType] = useState<ActivityType>(null);
  const [distance,     setDistance]     = useState("");
  const [durationMins, setDurationMins] = useState("");  // run MM
  const [durationSecs, setDurationSecs] = useState("");  // run SS
  const [duration,     setDuration]     = useState("");  // activity minutes
  const [date,         setDate]         = useState(todayISO);
  const [subtype,      setSubtype]      = useState("Gym");
  const [submitted,    setSubmitted]    = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [errors,       setErrors]       = useState<string[]>([]);

  const points = calcPoints(activityType, distance, duration);
  const today  = todayISO();

  const submitDisabled =
    (activityType === "run"      && RUNS_REMAINING     <= 0) ||
    (activityType === "activity" && ACTIVITY_REMAINING <= 0) ||
    (activityType === "rest"     && MOCK_REST_USED);

  function getDisabledReason(): string | null {
    if (activityType === "run"      && RUNS_REMAINING     <= 0) return "No run days remaining this week.";
    if (activityType === "activity" && ACTIVITY_REMAINING <= 0) return "No activity days remaining this week.";
    if (activityType === "rest"     && MOCK_REST_USED)          return "You have already taken your rest day this week.";
    return null;
  }

  function validate(): string[] {
    const errs: string[] = [];
    if (!activityType) { errs.push("Please select an activity type."); return errs; }
    if (activityType === "run") {
      if (!distance || parseFloat(distance) <= 0)  errs.push("Please enter a valid distance.");
      const totalSecs = (parseInt(durationMins, 10) || 0) * 60 + (parseInt(durationSecs, 10) || 0);
      if (totalSecs <= 0) errs.push("Please enter a valid duration.");
      const secs = parseInt(durationSecs, 10) || 0;
      if (secs > 59) errs.push("Seconds must be 0–59.");
    }
    if (activityType === "activity") {
      if (!duration || parseInt(duration, 10) <= 0) errs.push("Please enter a valid duration.");
    }
    if (date > today) errs.push("Date cannot be in the future.");
    if (activityType === "run"      && RUNS_REMAINING     <= 0) errs.push("No run days remaining this week.");
    if (activityType === "activity" && ACTIVITY_REMAINING <= 0) errs.push("No activity days remaining this week.");
    if (activityType === "rest"     && MOCK_REST_USED)          errs.push("You have already taken your rest day this week.");
    return errs;
  }

  function handleSubmit() {
    const errs = validate();
    if (errs.length) { setErrors(errs); return; }
    setErrors([]);
    const payload = {
      activityType, date, points,
      ...(activityType === "run" && {
        distance:    parseFloat(distance),
        durationMins: parseInt(durationMins, 10) || 0,
        durationSecs: parseInt(durationSecs, 10) || 0,
      }),
      ...(activityType === "activity" && {
        subtype,
        duration: parseInt(duration, 10),
      }),
    };
    console.log("Activity logged:", payload);
    setEarnedPoints(points);
    setSubmitted(true);
  }

  function handleReset() {
    setActivityType(null);
    setDistance("");
    setDurationMins("");
    setDurationSecs("");
    setDuration("");
    setDate(todayISO());
    setSubtype("Gym");
    setSubmitted(false);
    setEarnedPoints(0);
    setErrors([]);
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <AppLayout>
        <style>{`
          @keyframes popIn {
            0%   { transform: scale(0.4); opacity: 0; }
            70%  { transform: scale(1.12); opacity: 1; }
            100% { transform: scale(1);   opacity: 1; }
          }
          .check-pop { animation: popIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275) both; }
        `}</style>
        <div style={{
          minHeight: "100vh",
          backgroundColor: "#1A2744",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px 100px",
          textAlign: "center",
        }}>
          <div className="check-pop" style={{
            width: "84px",
            height: "84px",
            borderRadius: "50%",
            backgroundColor: "rgba(201,184,122,0.12)",
            border: "2px solid #C9B87A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "28px",
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C9B87A" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12l5 5L20 7" />
            </svg>
          </div>

          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "30px",
            fontWeight: 700,
            color: "#F5F2ED",
            margin: "0 0 20px",
          }}>
            Activity Logged!
          </h1>

          {earnedPoints > 0 ? (
            <div style={{ marginBottom: "12px" }}>
              <div style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: "64px",
                fontWeight: 700,
                color: "#C9B87A",
                lineHeight: 1,
              }}>
                +{earnedPoints}
              </div>
              <div style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: "11px",
                fontWeight: 700,
                color: "rgba(201,184,122,0.55)",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                marginTop: "6px",
              }}>
                points earned
              </div>
            </div>
          ) : (
            <p style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: "14px",
              color: "rgba(212,197,169,0.55)",
              marginBottom: "12px",
            }}>
              Streak preserved
            </p>
          )}

          <p style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: "12px",
            color: "rgba(212,197,169,0.45)",
            marginTop: "6px",
            marginBottom: "44px",
          }}>
            {MOCK_STREAK}-day streak maintained
          </p>

          <button onClick={handleReset} style={{
            width: "100%",
            maxWidth: "320px",
            backgroundColor: "#C9B87A",
            color: "#0D1829",
            fontFamily: "Montserrat, sans-serif",
            fontWeight: 700,
            fontSize: "13px",
            letterSpacing: "0.15em",
            padding: "16px",
            borderRadius: "14px",
            border: "none",
            cursor: "pointer",
            marginBottom: "12px",
          }}>
            LOG ANOTHER
          </button>
          <button onClick={() => router.push("/")} style={{
            width: "100%",
            maxWidth: "320px",
            backgroundColor: "transparent",
            color: "#C9B87A",
            fontFamily: "Montserrat, sans-serif",
            fontWeight: 700,
            fontSize: "13px",
            letterSpacing: "0.15em",
            padding: "16px",
            borderRadius: "14px",
            border: "1px solid rgba(201,184,122,0.28)",
            cursor: "pointer",
          }}>
            VIEW LEADERBOARD
          </button>
        </div>
      </AppLayout>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  const disabledReason = getDisabledReason();

  return (
    <AppLayout>
      <div style={{ minHeight: "100vh", backgroundColor: "#1A2744", padding: "52px 20px 110px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "30px",
            fontWeight: 700,
            color: "#F5F2ED",
            margin: "0 0 14px",
          }}>
            Log Activity
          </h1>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <CountdownPill />
          </div>
        </div>

        {/* Step 1: Activity type selector */}
        <div style={{ marginBottom: "8px" }}>
          <p style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: "10px",
            fontWeight: 700,
            color: "rgba(212,197,169,0.5)",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            marginBottom: "12px",
          }}>
            Activity Type
          </p>
          <div style={{ display: "flex", gap: "10px" }}>
            {TYPE_CARDS.map(({ type, label, Icon }) => {
              const active = activityType === type;
              return (
                <button
                  key={type}
                  onClick={() => { setActivityType(type); setErrors([]); }}
                  style={{
                    flex: 1,
                    padding: "18px 8px",
                    borderRadius: "14px",
                    border: active ? "1.5px solid #C9B87A" : "1px solid rgba(212,197,169,0.1)",
                    backgroundColor: active ? "rgba(201,184,122,0.1)" : "rgba(13,24,41,0.4)",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "10px",
                    boxShadow: active ? "0 0 0 1px rgba(201,184,122,0.08)" : "none",
                  }}
                >
                  <Icon active={active} />
                  <span style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: "10px",
                    fontWeight: 700,
                    color: active ? "#C9B87A" : "rgba(212,197,169,0.45)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Weekly limits info line */}
        {activityType === "run" && (
          <p style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: "11px",
            color: RUNS_REMAINING > 0 ? "rgba(212,197,169,0.5)" : "rgba(220,90,90,0.8)",
            marginTop: "10px",
            marginBottom: "16px",
          }}>
            {RUNS_REMAINING > 0
              ? `${RUNS_REMAINING} run day${RUNS_REMAINING !== 1 ? "s" : ""} remaining this week`
              : "No run days remaining this week"}
          </p>
        )}
        {activityType === "activity" && (
          <p style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: "11px",
            color: ACTIVITY_REMAINING > 0 ? "rgba(212,197,169,0.5)" : "rgba(220,90,90,0.8)",
            marginTop: "10px",
            marginBottom: "16px",
          }}>
            {ACTIVITY_REMAINING > 0
              ? `${ACTIVITY_REMAINING} of ${MOCK_ACTIVITY_LIMIT} activity day${ACTIVITY_REMAINING !== 1 ? "s" : ""} remaining this week`
              : "No activity days remaining this week"}
          </p>
        )}
        {activityType === "rest" && (
          <p style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: "11px",
            color: MOCK_REST_USED ? "rgba(220,90,90,0.8)" : "#4A7C59",
            marginTop: "10px",
            marginBottom: "16px",
            fontWeight: 600,
          }}>
            {MOCK_REST_USED ? "Rest day already used this week" : "Rest day available this week"}
          </p>
        )}
        {activityType === null && <div style={{ marginBottom: "20px" }} />}

        {/* Step 2: Details */}
        {activityType && (
          <div style={{
            backgroundColor: "rgba(13,24,41,0.45)",
            border: "1px solid rgba(212,197,169,0.1)",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "20px",
          }}>

            {/* ── RUN ── */}
            {activityType === "run" && (
              <>
                {/* Distance */}
                <div style={{ marginBottom: "24px" }}>
                  <label style={labelStyle}>Distance</label>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                    <input
                      type="number"
                      value={distance}
                      onChange={e => setDistance(e.target.value)}
                      placeholder="0.0"
                      min="0"
                      step="0.1"
                      style={{
                        background: "transparent",
                        border: "none",
                        borderBottom: "2px solid rgba(201,184,122,0.3)",
                        outline: "none",
                        fontFamily: "Montserrat, sans-serif",
                        fontSize: "52px",
                        fontWeight: 700,
                        color: "#C9B87A",
                        width: "160px",
                        padding: "0 0 4px",
                      }}
                    />
                    <span style={{
                      fontFamily: "Montserrat, sans-serif",
                      fontSize: "20px",
                      fontWeight: 600,
                      color: "rgba(201,184,122,0.45)",
                    }}>km</span>
                  </div>
                  {distance && parseFloat(distance) > 0 && parseFloat(distance) < 2 && (
                    <p style={{
                      fontFamily: "Montserrat, sans-serif",
                      fontSize: "11px",
                      color: "rgba(220,90,90,0.85)",
                      marginTop: "6px",
                    }}>
                      Minimum 2 km for points
                    </p>
                  )}
                </div>

                {/* Duration MM:SS */}
                <div style={{ marginBottom: "24px" }}>
                  <label style={labelStyle}>Duration</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {/* Minutes */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "5px" }}>
                      <input
                        type="number"
                        value={durationMins}
                        onChange={e => setDurationMins(e.target.value)}
                        placeholder="00"
                        min="0"
                        style={mmssInputStyle}
                      />
                      <span style={{
                        fontFamily: "Montserrat, sans-serif",
                        fontSize: "9px",
                        fontWeight: 700,
                        letterSpacing: "0.15em",
                        color: "rgba(212,197,169,0.4)",
                        textTransform: "uppercase",
                      }}>Min</span>
                    </div>

                    {/* Separator */}
                    <span style={{
                      fontFamily: "Montserrat, sans-serif",
                      fontSize: "28px",
                      fontWeight: 700,
                      color: "rgba(201,184,122,0.35)",
                      lineHeight: 1,
                      marginBottom: "18px",
                    }}>:</span>

                    {/* Seconds */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "5px" }}>
                      <input
                        type="number"
                        value={durationSecs}
                        onChange={e => setDurationSecs(e.target.value)}
                        placeholder="00"
                        min="0"
                        max="59"
                        style={mmssInputStyle}
                      />
                      <span style={{
                        fontFamily: "Montserrat, sans-serif",
                        fontSize: "9px",
                        fontWeight: 700,
                        letterSpacing: "0.15em",
                        color: "rgba(212,197,169,0.4)",
                        textTransform: "uppercase",
                      }}>Sec</span>
                    </div>
                  </div>
                </div>

                {/* Date */}
                <div style={{ marginBottom: "20px" }}>
                  <label style={labelStyle}>Date</label>
                  <input type="date" value={date} max={today} onChange={e => setDate(e.target.value)} style={dateInputStyle} />
                </div>

                {/* Points preview */}
                <div style={{
                  backgroundColor: points > 0 ? "rgba(74,124,89,0.1)" : "rgba(212,197,169,0.04)",
                  border: `1px solid ${points > 0 ? "rgba(74,124,89,0.3)" : "rgba(212,197,169,0.1)"}`,
                  borderRadius: "10px",
                  padding: "12px 14px",
                }}>
                  <p style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: "12px",
                    color: points > 0 ? "#4A7C59" : "rgba(212,197,169,0.4)",
                    fontWeight: 600,
                    margin: 0,
                  }}>
                    {distance && parseFloat(distance) >= 2
                      ? `This run will earn ${points} pt${points !== 1 ? "s" : ""}`
                      : "Enter distance to see points preview"}
                  </p>
                  {MOCK_STREAK > 0 && points > 0 && (
                    <p style={{
                      fontFamily: "Montserrat, sans-serif",
                      fontSize: "11px",
                      color: "rgba(212,197,169,0.5)",
                      margin: "5px 0 0",
                    }}>
                      +1 streak bonus · {MOCK_STREAK}-day streak
                    </p>
                  )}
                </div>
              </>
            )}

            {/* ── ACTIVITY ── */}
            {activityType === "activity" && (
              <>
                {/* Subtype chips */}
                <div style={{ marginBottom: "20px" }}>
                  <label style={labelStyle}>Type</label>
                  <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px", scrollbarWidth: "none" }}>
                    {SUBTYPES.map(s => {
                      const sel = subtype === s;
                      return (
                        <button
                          key={s}
                          onClick={() => setSubtype(s)}
                          style={{
                            flexShrink: 0,
                            padding: "8px 16px",
                            borderRadius: "999px",
                            border: sel ? "1.5px solid #C9B87A" : "1px solid rgba(212,197,169,0.18)",
                            backgroundColor: sel ? "rgba(201,184,122,0.12)" : "transparent",
                            fontFamily: "Montserrat, sans-serif",
                            fontSize: "11px",
                            fontWeight: 700,
                            color: sel ? "#C9B87A" : "rgba(212,197,169,0.5)",
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Duration (minutes only) */}
                <div style={{ marginBottom: "20px" }}>
                  <label style={labelStyle}>Duration</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <input
                      type="number"
                      value={duration}
                      onChange={e => setDuration(e.target.value)}
                      placeholder="0"
                      min="0"
                      style={durationInputStyle}
                    />
                    <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: "13px", color: "rgba(212,197,169,0.5)" }}>
                      minutes
                    </span>
                  </div>
                </div>

                {/* Date */}
                <div style={{ marginBottom: "20px" }}>
                  <label style={labelStyle}>Date</label>
                  <input type="date" value={date} max={today} onChange={e => setDate(e.target.value)} style={dateInputStyle} />
                </div>

                {/* Note */}
                <div style={{
                  backgroundColor: "rgba(201,184,122,0.05)",
                  border: "1px solid rgba(201,184,122,0.12)",
                  borderRadius: "10px",
                  padding: "12px 14px",
                }}>
                  <p style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: "12px",
                    color: "rgba(201,184,122,0.65)",
                    fontWeight: 600,
                    margin: 0,
                  }}>
                    30+ minutes earns 2 base points
                  </p>
                  {MOCK_STREAK > 0 && (
                    <p style={{
                      fontFamily: "Montserrat, sans-serif",
                      fontSize: "11px",
                      color: "rgba(212,197,169,0.45)",
                      margin: "5px 0 0",
                    }}>
                      +1 streak bonus · {MOCK_STREAK}-day streak
                    </p>
                  )}
                </div>
              </>
            )}

            {/* ── REST DAY ── */}
            {activityType === "rest" && (
              <>
                <div style={{ marginBottom: "20px" }}>
                  <label style={labelStyle}>Date</label>
                  <input type="date" value={date} max={today} onChange={e => setDate(e.target.value)} style={dateInputStyle} />
                </div>
                <div style={{
                  backgroundColor: "rgba(212,197,169,0.04)",
                  border: "1px solid rgba(212,197,169,0.1)",
                  borderRadius: "10px",
                  padding: "12px 14px",
                }}>
                  <p style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: "12px",
                    color: "rgba(212,197,169,0.5)",
                    fontWeight: 600,
                    margin: 0,
                  }}>
                    Rest days preserve your streak
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Validation errors */}
        {errors.length > 0 && (
          <div style={{
            backgroundColor: "rgba(220,90,90,0.08)",
            border: "1px solid rgba(220,90,90,0.25)",
            borderRadius: "12px",
            padding: "14px 16px",
            marginBottom: "16px",
          }}>
            {errors.map((e, i) => (
              <p key={i} style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: "12px",
                color: "rgba(220,90,90,0.9)",
                margin: i === 0 ? 0 : "4px 0 0",
              }}>
                {e}
              </p>
            ))}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={submitDisabled ? undefined : handleSubmit}
          style={{
            width: "100%",
            backgroundColor: submitDisabled ? "rgba(212,197,169,0.15)" : "#C9B87A",
            color: submitDisabled ? "rgba(212,197,169,0.35)" : "#0D1829",
            fontFamily: "Montserrat, sans-serif",
            fontWeight: 700,
            fontSize: "13px",
            letterSpacing: "0.18em",
            padding: "18px",
            borderRadius: "14px",
            border: "none",
            cursor: submitDisabled ? "not-allowed" : "pointer",
          }}
        >
          LOG ACTIVITY
        </button>

        {/* Disabled reason */}
        {disabledReason && (
          <p style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: "11px",
            color: "rgba(220,90,90,0.7)",
            textAlign: "center",
            marginTop: "10px",
          }}>
            {disabledReason}
          </p>
        )}
      </div>
    </AppLayout>
  );
}
