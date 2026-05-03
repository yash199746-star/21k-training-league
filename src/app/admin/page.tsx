"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";

// ── CM rotation ───────────────────────────────────────────────────────────────
const CM_ORDER = ["Yash", "Hardik", "Devansh"];
const LEAGUE_START = new Date(Date.UTC(2026, 3, 6)); // Monday April 6 2026

function getChallengeMasterForWeek(weekOffset: number): string {
  const now = new Date();
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const day = monday.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  monday.setUTCDate(monday.getUTCDate() + diff);
  const targetMonday = new Date(monday);
  targetMonday.setUTCDate(targetMonday.getUTCDate() + (weekOffset * 7));
  const weekNum = Math.floor((targetMonday.getTime() - LEAGUE_START.getTime()) / (7 * 24 * 60 * 60 * 1000));
  return CM_ORDER[((weekNum % 3) + 3) % 3];
}

function getCurrentWeekNumber(): number {
  const now = new Date();
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const day = monday.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  monday.setUTCDate(monday.getUTCDate() + diff);
  return Math.max(1, Math.floor((monday.getTime() - LEAGUE_START.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1);
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  points: number;
  streak: number;
}

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

const card: React.CSSProperties = {
  backgroundColor: "rgba(13,24,41,0.55)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  border: "1px solid rgba(212,197,169,0.1)",
  borderRadius: "16px",
  padding: "18px",
  marginBottom: "10px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(212,197,169,0.05)",
  border: "1px solid rgba(212,197,169,0.15)",
  borderRadius: "10px",
  outline: "none",
  fontFamily: "Montserrat, sans-serif",
  fontSize: "14px",
  color: "#F5F2ED",
  padding: "11px 14px",
  boxSizing: "border-box",
  colorScheme: "dark" as React.CSSProperties["colorScheme"],
};

const labelStyle: React.CSSProperties = {
  fontFamily: "Montserrat, sans-serif",
  fontSize: "10px",
  fontWeight: 700,
  color: "rgba(212,197,169,0.45)",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  display: "block",
  marginBottom: "6px",
};

const goldBtn: React.CSSProperties = {
  backgroundColor: "#C9B87A",
  color: "#0D1829",
  fontFamily: "Montserrat, sans-serif",
  fontWeight: 700,
  fontSize: "12px",
  letterSpacing: "0.15em",
  padding: "13px 16px",
  borderRadius: "12px",
  border: "none",
  cursor: "pointer",
  width: "100%",
};

const outlineGoldBtn: React.CSSProperties = {
  backgroundColor: "transparent",
  color: "#C9B87A",
  fontFamily: "Montserrat, sans-serif",
  fontWeight: 700,
  fontSize: "11px",
  letterSpacing: "0.1em",
  padding: "7px 12px",
  borderRadius: "8px",
  border: "1px solid rgba(201,184,122,0.3)",
  cursor: "pointer",
};

const outlineRedBtn: React.CSSProperties = {
  backgroundColor: "transparent",
  color: "rgba(210,70,70,0.85)",
  fontFamily: "Montserrat, sans-serif",
  fontWeight: 700,
  fontSize: "11px",
  letterSpacing: "0.1em",
  padding: "7px 12px",
  borderRadius: "8px",
  border: "1px solid rgba(210,70,70,0.3)",
  cursor: "pointer",
};

function ChevronLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(212,197,169,0.6)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function CrownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="#C9B87A" stroke="none">
      <path d="M2 19h20v2H2zM2 8l5 6.5L12 7l5 7.5L22 8v10H2z" />
    </svg>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  // Real data
  const [users,         setUsers]         = useState<UserProfile[]>([]);
  const [activityCount, setActivityCount] = useState<number>(0);
  const [loadingUsers,  setLoadingUsers]  = useState(true);

  async function fetchUsers(): Promise<UserProfile[]> {
    const supabase = createClient();
    const [
      { data: profiles },
      { data: allStreaks },
      { data: allWeeklyStats },
      { count },
    ] = await Promise.all([
      supabase.from("profiles").select("id, name, email").order("name"),
      supabase.from("streaks").select("user_id, current_streak"),
      supabase.from("weekly_stats").select("user_id, total_points"),
      supabase.from("activities").select("id", { count: "exact", head: true }),
    ]);

    const pointsMap: Record<string, number> = {};
    for (const s of allWeeklyStats ?? []) {
      pointsMap[s.user_id] = (pointsMap[s.user_id] || 0) + (s.total_points || 0);
    }

    const built: UserProfile[] = (profiles ?? []).map(p => ({
      id:     p.id,
      name:   p.name  || "Unknown",
      email:  p.email || "",
      points: pointsMap[p.id] || 0,
      streak: allStreaks?.find(s => s.user_id === p.id)?.current_streak || 0,
    }));

    setUsers(built);
    setActivityCount(count ?? 0);
    return built;
  }

  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const isAllowed = user?.email === "yash199746@gmail.com";
      setAllowed(isAllowed);
      if (!isAllowed) return;

      const built = await fetchUsers();
      if (built.length > 0) {
        setCUser(built[0].name);
        setNewCM(built[0].name);
      }
      setLoadingUsers(false);

      // Load league settings
      const { data: settings } = await supabase
        .from("league_settings")
        .select("league_name, race_date, season_start_date")
        .eq("id", 1)
        .single();
      if (settings) {
        if (settings.league_name)       setLeagueName(settings.league_name);
        if (settings.season_start_date) setSeasonStart(settings.season_start_date);
        if (settings.race_date)         setRaceDate(settings.race_date);
      }
    }
    init();
  }, []);

  // Correction form
  const [cUser,     setCUser]     = useState("");
  const [cDate,     setCDate]     = useState(new Date().toISOString().split("T")[0]);
  const [cType,     setCType]     = useState<"run"|"activity"|"rest">("run");
  const [cDistance, setCDistance] = useState("");
  const [cDuration, setCDuration] = useState("");
  const [cPoints,   setCPoints]   = useState("");
  const [cReason,   setCReason]   = useState("");
  const [cDone,       setCDone]       = useState(false);
  const [cSubmitting, setCSubmitting] = useState(false);
  const [cErrors,     setCErrors]     = useState<string[]>([]);

  // User management
  const [resetFor,       setResetFor]       = useState<string | null>(null);
  const [editPointsFor,  setEditPointsFor]  = useState<string | null>(null);
  const [editPointsVal,  setEditPointsVal]  = useState("");

  // Challenge Master override
  const [showCMForm, setShowCMForm] = useState(false);
  const [newCM,      setNewCM]      = useState("");
  const [cmDone,     setCMDone]     = useState(false);

  // League settings
  const [raceDate,      setRaceDate]      = useState("2026-09-13");
  const [leagueName,    setLeagueName]    = useState("21K Training League");
  const [seasonStart,   setSeasonStart]   = useState("2026-04-06");
  const [settingsDone,    setSettingsDone]    = useState(false);
  const [settingsSaving,  setSettingsSaving]  = useState(false);

  // Danger zone
  const [resetText,    setResetText]    = useState("");
  const [resetDone,    setResetDone]    = useState(false);
  const [resetRunning, setResetRunning] = useState(false);

  async function handleCorrection() {
    const errs: string[] = [];
    if (!cReason.trim()) errs.push("Please provide a reason for the correction.");
    if (cType === "run" && !cDistance) errs.push("Please enter a distance.");
    if (errs.length) { setCErrors(errs); return; }
    setCErrors([]);
    setCSubmitting(true);

    const targetUser = users.find(u => u.name === cUser);
    if (!targetUser) { setCErrors(["User not found."]); setCSubmitting(false); return; }

    const pointsVal = cPoints ? parseInt(cPoints, 10) : 0;
    const res = await fetch("/api/admin/correct-activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId:       targetUser.id,
        date:         cDate,
        activityType: cType,
        distanceKm:   cType === "run" ? parseFloat(cDistance) || null : null,
        durationMins: cDuration ? parseInt(cDuration, 10) : null,
        points:       pointsVal,
        reason:       cReason.trim(),
      }),
    });
    const json = await res.json();
    setCSubmitting(false);
    if (!res.ok) { setCErrors([json.error ?? "Failed to apply correction."]); return; }
    setCDone(true);
    await fetchUsers();
  }

  async function handleResetStreak(userId: string) {
    const res = await fetch("/api/admin/reset-streak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (res.ok) {
      setResetFor(null);
      await fetchUsers();
    }
  }

  async function handleSavePoints(userId: string, newPoints: number) {
    if (isNaN(newPoints) || newPoints < 0) return;
    const res = await fetch("/api/admin/update-points", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, points: newPoints }),
    });
    if (res.ok) {
      setEditPointsFor(null);
      setEditPointsVal("");
      await fetchUsers();
    }
  }

  async function handleSaveSettings() {
    setSettingsSaving(true);
    const res = await fetch("/api/admin/save-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leagueName, raceDate, seasonStartDate: seasonStart }),
    });
    setSettingsSaving(false);
    if (res.ok) setSettingsDone(true);
  }

  async function handleResetLeague() {
    setResetRunning(true);
    const res = await fetch("/api/admin/reset-league", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm: "RESET" }),
    });
    setResetRunning(false);
    if (res.ok) setResetDone(true);
  }

  if (allowed === null) return null;

  if (!allowed) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0D1829" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "14px", color: "#D4C5A9" }}>Access restricted</p>
        </div>
      </div>
    );
  }

  const currentWeekNum = getCurrentWeekNumber();
  const cmCurrent      = getChallengeMasterForWeek(0);
  const cmNext         = getChallengeMasterForWeek(1);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0D1829", padding: "52px 20px 60px", position: "relative" }}>
      <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0, backgroundImage: "url(/ladakh.png)", backgroundSize: "cover", backgroundPosition: "center 40%", backgroundRepeat: "no-repeat", backgroundAttachment: "scroll", pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(13,24,41,0.88)" }} />
      </div>
      <div style={{ position: "relative", zIndex: 1 }}>

      {/* Back button */}
      <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "4px", textDecoration: "none", marginBottom: "20px" }}>
        <ChevronLeft />
        <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: "12px", fontWeight: 600, color: "rgba(212,197,169,0.6)" }}>
          Home
        </span>
      </Link>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "30px", fontWeight: 700, color: "#F5F2ED", margin: "0 0 12px" }}>
          Admin Panel
        </h1>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <span style={{
            fontFamily: "Montserrat, sans-serif", fontSize: "10px", fontWeight: 700,
            color: "rgba(210,70,70,0.9)", letterSpacing: "0.2em",
            backgroundColor: "rgba(210,70,70,0.1)", border: "1px solid rgba(210,70,70,0.25)",
            borderRadius: "999px", padding: "5px 14px",
          }}>
            RESTRICTED ACCESS
          </span>
        </div>
      </div>

      {/* ── Section 1: League Overview ── */}
      <p style={sectionTitle}>League Overview</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", marginBottom: "28px" }}>
        {[
          { label: "League Start",      value: "6 Apr 2026"                              },
          { label: "Activities Logged", value: loadingUsers ? "—" : String(activityCount) },
          { label: "Current Week",      value: `Week ${currentWeekNum}`                  },
          { label: "Race Date",         value: "13 Sept 2026"                            },
        ].map(({ label, value }) => (
          <div key={label} style={{
            backgroundColor: "rgba(13,24,41,0.55)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
            border: "1px solid rgba(212,197,169,0.08)", borderRadius: "14px", padding: "14px",
          }}>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "9px", fontWeight: 700, color: "rgba(212,197,169,0.4)", letterSpacing: "0.15em", textTransform: "uppercase", margin: "0 0 6px" }}>
              {label}
            </p>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "15px", fontWeight: 700, color: "#C9B87A", margin: 0 }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Section 2: Manual Activity Correction ── */}
      <p style={sectionTitle}>Manual Activity Correction</p>
      <div style={{ ...card, marginBottom: "28px" }}>
        {cDone ? (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", backgroundColor: "rgba(74,124,89,0.1)", border: "1px solid rgba(74,124,89,0.3)", borderRadius: "12px", padding: "14px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4A7C59" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
            <div>
              <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "13px", fontWeight: 700, color: "#4A7C59", margin: 0 }}>Correction Applied</p>
              <button onClick={() => { setCDone(false); setCReason(""); setCPoints(""); setCDistance(""); setCDuration(""); }} style={{ ...outlineGoldBtn, padding: "5px 10px", fontSize: "10px", marginTop: "8px" }}>
                APPLY ANOTHER
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* User */}
            <div>
              <label style={labelStyle}>User</label>
              <select value={cUser} onChange={e => setCUser(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                {users.map(u => <option key={u.id} value={u.name} style={{ backgroundColor: "#0D1829" }}>{u.name}</option>)}
              </select>
            </div>

            {/* Date */}
            <div>
              <label style={labelStyle}>Date</label>
              <input type="date" value={cDate} max={new Date().toISOString().split("T")[0]} onChange={e => setCDate(e.target.value)} style={inputStyle} />
            </div>

            {/* Activity type */}
            <div>
              <label style={labelStyle}>Activity Type</label>
              <div style={{ display: "flex", gap: "8px" }}>
                {(["run", "activity", "rest"] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setCType(t)}
                    style={{
                      flex: 1, padding: "10px 0", borderRadius: "10px",
                      border: cType === t ? "1.5px solid #C9B87A" : "1px solid rgba(212,197,169,0.15)",
                      backgroundColor: cType === t ? "rgba(201,184,122,0.1)" : "transparent",
                      fontFamily: "Montserrat, sans-serif", fontSize: "10px", fontWeight: 700,
                      color: cType === t ? "#C9B87A" : "rgba(212,197,169,0.4)",
                      letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer",
                    }}
                  >
                    {t === "run" ? "Run" : t === "activity" ? "Activity" : "Rest"}
                  </button>
                ))}
              </div>
            </div>

            {/* Distance + Duration (run only) */}
            {cType === "run" && (
              <div style={{ display: "flex", gap: "10px" }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Distance (km)</label>
                  <input type="number" value={cDistance} onChange={e => setCDistance(e.target.value)} placeholder="0.0" min="0" step="0.1" style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Duration (min)</label>
                  <input type="number" value={cDuration} onChange={e => setCDuration(e.target.value)} placeholder="0" min="0" style={inputStyle} />
                </div>
              </div>
            )}

            {/* Points override */}
            <div>
              <label style={labelStyle}>Points Override</label>
              <input type="number" value={cPoints} onChange={e => setCPoints(e.target.value)} placeholder="Leave blank to use calculated" min="0" style={inputStyle} />
            </div>

            {/* Reason */}
            <div>
              <label style={labelStyle}>Reason for Correction</label>
              <textarea
                value={cReason} onChange={e => setCReason(e.target.value)}
                placeholder="Describe why this correction is needed..." rows={3}
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
              />
            </div>

            {/* Errors */}
            {cErrors.length > 0 && (
              <div style={{ backgroundColor: "rgba(220,90,90,0.08)", border: "1px solid rgba(220,90,90,0.25)", borderRadius: "10px", padding: "12px 14px" }}>
                {cErrors.map((e, i) => (
                  <p key={i} style={{ fontFamily: "Montserrat, sans-serif", fontSize: "12px", color: "rgba(220,90,90,0.9)", margin: i === 0 ? 0 : "4px 0 0" }}>{e}</p>
                ))}
              </div>
            )}

            <button
              onClick={handleCorrection}
              disabled={cSubmitting}
              style={{ ...goldBtn, opacity: cSubmitting ? 0.6 : 1, cursor: cSubmitting ? "not-allowed" : "pointer" }}
            >
              {cSubmitting ? "APPLYING…" : "APPLY CORRECTION"}
            </button>
          </div>
        )}
      </div>

      {/* ── Section 3: User Management ── */}
      <p style={sectionTitle}>User Management</p>
      <div style={{ marginBottom: "28px" }}>
        {loadingUsers ? (
          <div style={{ ...card, textAlign: "center" }}>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "12px", color: "rgba(212,197,169,0.4)", margin: 0 }}>Loading users…</p>
          </div>
        ) : users.map(user => (
          <div key={user.id} style={card}>
            {/* User info row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "38px", height: "38px", borderRadius: "50%",
                  backgroundColor: "rgba(201,184,122,0.1)", border: "1px solid rgba(201,184,122,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "Montserrat, sans-serif", fontSize: "14px", fontWeight: 700, color: "#C9B87A", flexShrink: 0,
                }}>
                  {user.name[0].toUpperCase()}
                </div>
                <div>
                  <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "14px", fontWeight: 600, color: "#F5F2ED", margin: 0 }}>{user.name}</p>
                  <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "10px", color: "rgba(212,197,169,0.4)", margin: "2px 0 0" }}>{user.email}</p>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "16px", fontWeight: 700, color: "#C9B87A", margin: 0 }}>{user.points} pts</p>
                <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "10px", color: "rgba(212,197,169,0.4)", margin: "2px 0 0" }}>{user.streak}d streak</p>
              </div>
            </div>

            {/* Edit Points inline */}
            {editPointsFor === user.id && (
              <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                <input
                  type="number" value={editPointsVal} onChange={e => setEditPointsVal(e.target.value)}
                  placeholder={String(user.points)}
                  style={{ ...inputStyle, flex: 1, padding: "9px 12px", fontSize: "13px" }}
                  autoFocus
                />
                <button
                  onClick={() => handleSavePoints(user.id, parseFloat(editPointsVal))}
                  style={{ ...outlineGoldBtn, flexShrink: 0 }}
                >
                  SAVE
                </button>
                <button
                  onClick={() => { setEditPointsFor(null); setEditPointsVal(""); }}
                  style={{ ...outlineRedBtn, flexShrink: 0, borderColor: "rgba(212,197,169,0.2)", color: "rgba(212,197,169,0.4)" }}
                >
                  ✕
                </button>
              </div>
            )}

            {/* Reset Streak confirmation */}
            {resetFor === user.id && (
              <div style={{
                backgroundColor: "rgba(210,70,70,0.08)", border: "1px solid rgba(210,70,70,0.2)",
                borderRadius: "10px", padding: "12px", marginBottom: "8px",
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px",
              }}>
                <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "12px", color: "rgba(210,70,70,0.85)", margin: 0 }}>
                  Reset {user.name}&apos;s streak to 0?
                </p>
                <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                  <button onClick={() => handleResetStreak(user.id)} style={{ ...outlineRedBtn, padding: "6px 10px" }}>YES</button>
                  <button onClick={() => setResetFor(null)} style={{ ...outlineGoldBtn, padding: "6px 10px" }}>NO</button>
                </div>
              </div>
            )}

            {/* Action buttons */}
            {editPointsFor !== user.id && resetFor !== user.id && (
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => { setEditPointsFor(user.id); setEditPointsVal(String(user.points)); setResetFor(null); }} style={{ ...outlineGoldBtn, flex: 1 }}>
                  EDIT POINTS
                </button>
                <button onClick={() => { setResetFor(user.id); setEditPointsFor(null); }} style={{ ...outlineRedBtn, flex: 1 }}>
                  RESET STREAK
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Section 4: Challenge Master Override ── */}
      <p style={sectionTitle}>Challenge Master Override</p>
      <div style={{ ...card, marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
          <CrownIcon />
          <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: "12px", fontWeight: 700, color: "#C9B87A" }}>
            Current: {cmCurrent} · Week {currentWeekNum}
          </span>
        </div>
        <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "12px", color: "rgba(212,197,169,0.45)", margin: "0 0 16px" }}>
          Next: {cmNext} · Week {currentWeekNum + 1}
        </p>

        {cmDone ? (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "rgba(74,124,89,0.1)", border: "1px solid rgba(74,124,89,0.3)", borderRadius: "10px", padding: "12px 14px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4A7C59" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
            <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: "12px", fontWeight: 600, color: "#4A7C59" }}>
              Challenge Master updated to {newCM}
            </span>
          </div>
        ) : (
          <>
            {!showCMForm ? (
              <button onClick={() => setShowCMForm(true)} style={goldBtn}>CHANGE CHALLENGE MASTER</button>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>New Challenge Master</label>
                  <select value={newCM} onChange={e => setNewCM(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                    {users.map(u => <option key={u.id} value={u.name} style={{ backgroundColor: "#0D1829" }}>{u.name}</option>)}
                  </select>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => { console.log("CM Override:", newCM); setCMDone(true); setShowCMForm(false); }} style={{ ...goldBtn, flex: 1 }}>
                    CONFIRM
                  </button>
                  <button onClick={() => setShowCMForm(false)} style={{ ...outlineRedBtn, flex: 1, padding: "13px" }}>
                    CANCEL
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Section 5: League Settings ── */}
      <p style={sectionTitle}>League Settings</p>
      <div style={{ ...card, marginBottom: "16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={labelStyle}>League Name</label>
            <input type="text" value={leagueName} onChange={e => { setLeagueName(e.target.value); setSettingsDone(false); }} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Season Start Date</label>
            <input type="date" value={seasonStart} onChange={e => { setSeasonStart(e.target.value); setSettingsDone(false); }} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Race Date</label>
            <input type="date" value={raceDate} onChange={e => { setRaceDate(e.target.value); setSettingsDone(false); }} style={inputStyle} />
          </div>
          <button
            onClick={handleSaveSettings}
            disabled={settingsSaving}
            style={{ ...goldBtn, opacity: settingsSaving ? 0.6 : 1, cursor: settingsSaving ? "not-allowed" : "pointer" }}
          >
            {settingsSaving ? "SAVING…" : "SAVE SETTINGS"}
          </button>
          {settingsDone && (
            <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "12px", fontWeight: 600, color: "#4A7C59", textAlign: "center", margin: 0 }}>
              Settings saved
            </p>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div style={{ backgroundColor: "rgba(210,70,70,0.06)", border: "1px solid rgba(210,70,70,0.2)", borderRadius: "16px", padding: "18px" }}>
        <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "10px", fontWeight: 700, color: "rgba(210,70,70,0.7)", letterSpacing: "0.25em", textTransform: "uppercase", margin: "0 0 10px" }}>
          Danger Zone
        </p>

        {resetDone ? (
          <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "13px", fontWeight: 600, color: "#4A7C59", margin: 0 }}>
            League reset complete.
          </p>
        ) : (
          <>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "12px", color: "rgba(212,197,169,0.45)", margin: "0 0 14px", lineHeight: 1.5 }}>
              This will erase all activities, points, and streaks. Type <span style={{ color: "rgba(210,70,70,0.8)", fontWeight: 700 }}>RESET</span> to confirm.
            </p>
            <input
              type="text" value={resetText} onChange={e => setResetText(e.target.value)}
              placeholder="Type RESET to unlock"
              style={{ ...inputStyle, border: "1px solid rgba(210,70,70,0.2)", marginBottom: "12px", color: "rgba(210,70,70,0.85)" }}
            />
            <button
              onClick={handleResetLeague}
              disabled={resetText !== "RESET" || resetRunning}
              style={{
                width: "100%",
                backgroundColor: resetText === "RESET" ? "rgba(210,70,70,0.85)" : "rgba(210,70,70,0.15)",
                color: resetText === "RESET" ? "#fff" : "rgba(210,70,70,0.3)",
                fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: "12px",
                letterSpacing: "0.15em", padding: "13px", borderRadius: "12px", border: "none",
                cursor: resetText === "RESET" && !resetRunning ? "pointer" : "not-allowed",
                opacity: resetRunning ? 0.6 : 1,
              }}
            >
              {resetRunning ? "RESETTING…" : "RESET ENTIRE LEAGUE"}
            </button>
          </>
        )}
      </div>

      </div>{/* /zIndex wrapper */}
    </div>
  );
}
