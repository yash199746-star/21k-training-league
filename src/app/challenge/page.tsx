"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AppLayout from "@/components/AppLayout";
import CountdownPill from "@/components/CountdownPill";
import { createClient } from "@/lib/supabase-browser";
import { getWeekStart } from "@/lib/scoring";

// ── CM rotation ────────────────────────────────────────────────────────────
const CM_ORDER = ["Yash", "Hardik", "Devansh"];
const LEAGUE_START = new Date(Date.UTC(2026, 3, 6)); // Monday April 6, 2026

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
function weekStartToNumber(weekStart: string): number {
  const d = new Date(weekStart + "T00:00:00").getTime();
  return Math.max(1, Math.floor((d - LEAGUE_START.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1);
}
function getNextMonday(): string {
  const d = new Date();
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? 1 : 8 - day));
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split("T")[0];
}

// ── Challenge helpers ──────────────────────────────────────────────────────
const CHALLENGE_TYPE_MAP: Record<string, string> = {
  "Total Distance":      "total_distance",
  "Number of Runs":      "number_of_runs",
  "Single Run Distance": "single_run_distance",
  "Activity Streak":     "activity_streak",
  "Activity Type":       "activity_type",
};

const CHALLENGE_TYPES = Object.keys(CHALLENGE_TYPE_MAP);

const TARGET_UNITS: Record<string, string> = {
  "Total Distance":      "km",
  "Number of Runs":      "runs",
  "Single Run Distance": "km",
  "Activity Streak":     "days",
  "Activity Type":       "sessions",
};

function getBadgeText(type: string, target: number): string {
  switch (type) {
    case "total_distance":      return `${target} KM TOTAL`;
    case "number_of_runs":      return `${target} RUNS`;
    case "single_run_distance": return `${target}+ KM RUN`;
    case "activity_streak":     return `${target} DAY STREAK`;
    case "activity_type":       return `${target} SESSIONS`;
    default:                    return `TARGET: ${target}`;
  }
}

function buildProgressLabel(type: string, progress: number, target: number): string {
  switch (type) {
    case "total_distance":      return `${progress.toFixed(1)} of ${target} km`;
    case "number_of_runs":      return `${Math.floor(progress)} of ${target} runs`;
    case "single_run_distance": return `Best: ${progress.toFixed(1)} km · need ${target} km`;
    case "activity_streak":     return `${Math.floor(progress)} day streak · need ${target}`;
    case "activity_type":       return `${Math.floor(progress)} of ${target} sessions`;
    default:                    return `${progress} of ${target}`;
  }
}

function computeProgress(
  type: string,
  weekActs: { activity_type: string; distance_km: number | null }[],
  currentStreak: number
): number {
  const runs = weekActs.filter(a => a.activity_type === "run");
  switch (type) {
    case "total_distance":
      return runs.reduce((s, a) => s + (a.distance_km || 0), 0);
    case "number_of_runs":
      return runs.length;
    case "single_run_distance":
      return runs.reduce((max, a) => Math.max(max, a.distance_km || 0), 0);
    case "activity_streak":
      return currentStreak;
    case "activity_type":
      return weekActs.filter(a => a.activity_type === "activity").length;
    default:
      return 0;
  }
}

function formatDeadline(weekStart: string): string {
  const d = new Date(weekStart + "T00:00:00");
  d.setDate(d.getDate() + 6);
  return `Ends ${d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })} · 11:59 PM`;
}

// ── Interfaces ─────────────────────────────────────────────────────────────
interface ChallengeData {
  id:            string;
  title:         string;
  description:   string;
  challenge_type: string;
  target_value:  number;
  week_start:    string;
  created_by:    string;
  createdByName: string;
  weekNum:       number;
  badge:         string;
  deadline:      string;
  bonus_points:  number;
}

interface ParticipantData {
  name:          string;
  initials:      string;
  avatarUrl:     string | null;
  progress:      number;
  target:        number;
  completed:     boolean;
  points:        number;
  progressLabel: string;
}

interface PastChallengeData {
  weekNum:     number;
  title:       string;
  completedOf: number;
  total:       number;
}

// ── Icons ──────────────────────────────────────────────────────────────────
function CrownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="#C9B87A" stroke="none">
      <path d="M2 19h20v2H2zM2 7l5 7 5-7 5 7 5-7v10H2z" />
    </svg>
  );
}
function CheckIcon({ color = "#4A7C59" }: { color?: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}

// ── Shared styles ──────────────────────────────────────────────────────────
const sectionTitle: React.CSSProperties = {
  fontFamily: "Montserrat, sans-serif",
  fontSize: "10px",
  fontWeight: 700,
  color: "rgba(212,197,169,0.5)",
  letterSpacing: "0.25em",
  textTransform: "uppercase",
  marginBottom: "12px",
};
const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(212,197,169,0.05)",
  border: "1px solid rgba(212,197,169,0.18)",
  borderRadius: "10px",
  outline: "none",
  fontFamily: "Montserrat, sans-serif",
  fontSize: "14px",
  color: "#F5F2ED",
  padding: "12px 14px",
  boxSizing: "border-box",
};
const formLabelStyle: React.CSSProperties = {
  fontFamily: "Montserrat, sans-serif",
  fontSize: "10px",
  fontWeight: 700,
  color: "rgba(212,197,169,0.5)",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  display: "block",
  marginBottom: "6px",
};

// ── Progress row ───────────────────────────────────────────────────────────
function ProgressRow({ name, initials, avatarUrl, progress, target, completed, points, progressLabel }: {
  name: string; initials: string; avatarUrl: string | null; progress: number;
  target: number; completed: boolean; points: number; progressLabel: string;
}) {
  const pct = Math.min((progress / Math.max(target, 0.01)) * 100, 100);
  return (
    <div style={{
      backgroundColor: "rgba(13,24,41,0.55)",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      border: `1px solid ${completed ? "rgba(74,124,89,0.3)" : "rgba(212,197,169,0.08)"}`,
      borderRadius: "14px", padding: "14px 16px", marginBottom: "10px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
        <div style={{
          width: "38px", height: "38px", borderRadius: "50%",
          backgroundColor: "rgba(201,184,122,0.1)",
          border: `1.5px solid ${completed ? "rgba(74,124,89,0.5)" : "rgba(201,184,122,0.25)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "Montserrat, sans-serif", fontSize: "14px", fontWeight: 700, color: "#C9B87A", flexShrink: 0,
          overflow: "hidden",
        }}>
          {avatarUrl ? (
            <Image src={avatarUrl} alt={name} width={38} height={38} style={{ borderRadius: "50%", objectFit: "cover" }} />
          ) : (
            initials
          )}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "14px", fontWeight: 600, color: "#F5F2ED", margin: 0 }}>
            {name}
          </p>
          <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "11px", color: "rgba(212,197,169,0.45)", margin: "2px 0 0" }}>
            {progressLabel}
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
          {completed && (
            <div style={{
              display: "flex", alignItems: "center", gap: "4px",
              backgroundColor: "rgba(74,124,89,0.15)", border: "1px solid rgba(74,124,89,0.35)",
              borderRadius: "999px", padding: "3px 9px",
            }}>
              <CheckIcon />
              <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: "10px", fontWeight: 700, color: "#4A7C59", letterSpacing: "0.06em" }}>
                COMPLETED
              </span>
            </div>
          )}
          {points > 0 && (
            <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: "11px", fontWeight: 700, color: "#C9B87A" }}>
              +{points} pts
            </span>
          )}
        </div>
      </div>
      <div style={{ height: "6px", backgroundColor: "rgba(212,197,169,0.1)", borderRadius: "999px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, backgroundColor: completed ? "#4A7C59" : "#C9B87A", borderRadius: "999px", transition: "width 0.4s ease" }} />
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function ChallengePage() {
  const router = useRouter();

  const [loading,       setLoading]       = useState(true);
  const [userId,        setUserId]        = useState("");
  const [isCM,          setIsCM]          = useState(false);
  const [myName,        setMyName]        = useState("");
  const [currentWeekNum, setCurrentWeekNum] = useState(1);
  const [challenge,     setChallenge]     = useState<ChallengeData | null>(null);
  const [participants,  setParticipants]  = useState<ParticipantData[]>([]);
  const [pastList,      setPastList]      = useState<PastChallengeData[]>([]);

  // Form state
  const [showForm,       setShowForm]       = useState(false);
  const [formTitle,      setFormTitle]      = useState("");
  const [formDesc,       setFormDesc]       = useState("");
  const [formType,       setFormType]       = useState("Total Distance");
  const [formTarget,     setFormTarget]     = useState("");
  const [formSubmitted,  setFormSubmitted]  = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formErrors,     setFormErrors]     = useState<string[]>([]);
  const formRef = useRef<HTMLDivElement>(null);

  // Open form automatically if URL has ?openForm=true
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("openForm") === "true") {
      setShowForm(true);
    }
  }, []);

  // Scroll to top whenever the form opens so it's always visible
  useEffect(() => {
    if (showForm) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [showForm]);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/login"); return; }

      setUserId(user.id);
      const weekStart    = getWeekStart(new Date());
      const weekNum      = getCurrentWeekNumber();
      const cmName       = getChallengeMasterForWeek(0);
      setCurrentWeekNum(weekNum);

      // Fetch profile name, all profiles, my week activities, my streak, active challenge, past challenges — all in parallel
      const [
        { data: myProfile },
        { data: allProfiles },
        { data: weekActs },
        { data: streakRow },
        { data: activeChallenges },
        { data: pastChallenges },
      ] = await Promise.all([
        supabase.from("profiles").select("name").eq("id", user.id).single(),
        supabase.from("profiles").select("id, name, avatar_url"),
        supabase.from("activities")
          .select("activity_type, distance_km")
          .eq("user_id", user.id)
          .gte("date", weekStart),
        supabase.from("streaks").select("current_streak").eq("user_id", user.id).single(),
        supabase.from("challenges").select("*").eq("is_active", true),
        supabase.from("challenges")
          .select("id, title, week_start")
          .eq("is_active", false)
          .order("week_start", { ascending: false })
          .limit(3),
      ]);

      const myName = myProfile?.name || "";
      const isCMNow = myName.trim().toLowerCase() === cmName.trim().toLowerCase();
      setMyName(myName);
      setIsCM(isCMNow);

      // ── Active challenge ───────────────────────────────────────────────
      const active = activeChallenges?.[0] ?? null;

      if (active) {
        // Fetch creator name + all progress rows in parallel
        const [{ data: creatorProfile }, { data: progressRows }] = await Promise.all([
          supabase.from("profiles").select("name").eq("id", active.created_by).single(),
          supabase.from("challenge_progress")
            .select("user_id, current_value, is_completed")
            .eq("challenge_id", active.id),
        ]);

        // Compute my fresh progress
        const myProgress = computeProgress(active.challenge_type, weekActs ?? [], streakRow?.current_streak || 0);
        const myCompleted = myProgress >= active.target_value;
        const bonusPts = active.bonus_points || 10;

        // Fire-and-forget progress upsert
        supabase.from("challenge_progress").upsert({
          challenge_id: active.id,
          user_id: user.id,
          current_value: myProgress,
          is_completed: myCompleted,
          updated_at: new Date().toISOString(),
        }, { onConflict: "challenge_id,user_id" });

        setChallenge({
          id:            active.id,
          title:         active.title,
          description:   active.description,
          challenge_type: active.challenge_type,
          target_value:  active.target_value,
          week_start:    active.week_start,
          created_by:    active.created_by,
          createdByName: creatorProfile?.name || "Unknown",
          weekNum:       weekStartToNumber(active.week_start),
          badge:         getBadgeText(active.challenge_type, active.target_value),
          deadline:      formatDeadline(active.week_start),
          bonus_points:  bonusPts,
        });

        // Build participants from all profiles
        const parts: ParticipantData[] = (allProfiles ?? []).map(p => {
          const isMe   = p.id === user.id;
          const row    = progressRows?.find(pr => pr.user_id === p.id);
          const val    = isMe ? myProgress : (row?.current_value || 0);
          const done   = val >= active.target_value;
          const name   = p.name || "Unknown";
          return {
            name,
            initials:      name.charAt(0).toUpperCase(),
            avatarUrl:     p.avatar_url || null,
            progress:      val,
            target:        active.target_value,
            completed:     done,
            points:        done ? bonusPts : 0,
            progressLabel: buildProgressLabel(active.challenge_type, val, active.target_value),
          };
        });
        // Sort: completed first, then by progress desc
        parts.sort((a, b) => (b.completed ? 1 : 0) - (a.completed ? 1 : 0) || b.progress - a.progress);
        setParticipants(parts);
      }

      // ── Past challenges ────────────────────────────────────────────────
      if (pastChallenges && pastChallenges.length > 0) {
        const pastIds = pastChallenges.map(c => c.id);
        const { data: pastProgress } = await supabase
          .from("challenge_progress")
          .select("challenge_id, completed")
          .in("challenge_id", pastIds);

        const totalUsers = (allProfiles ?? []).length;
        setPastList(pastChallenges.map(c => ({
          weekNum:     weekStartToNumber(c.week_start),
          title:       c.title,
          completedOf: (pastProgress ?? []).filter(p => p.challenge_id === c.id && p.completed).length,
          total:       totalUsers,
        })));
      }

      setLoading(false);
    }
    fetchData();
  }, [router]);

  async function handleSubmitChallenge() {
    const errs: string[] = [];
    if (!formTitle.trim())                          errs.push("Please enter a challenge title.");
    if (!formDesc.trim())                           errs.push("Please enter a description.");
    if (!formTarget || parseFloat(formTarget) <= 0) errs.push("Please enter a valid target.");
    if (errs.length) { setFormErrors(errs); return; }
    setFormErrors([]);
    setFormSubmitting(true);

    const supabase = createClient();
    const { error } = await supabase.from("challenges").insert({
      created_by:     userId,
      week_start:     getNextMonday(),
      title:          formTitle.trim(),
      description:    formDesc.trim(),
      challenge_type: CHALLENGE_TYPE_MAP[formType],
      target_value:   parseFloat(formTarget),
      is_active:      false,
    });

    setFormSubmitting(false);
    if (error) { setFormErrors([error.message]); return; }
    setFormSubmitted(true);
  }

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <AppLayout>
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}.sp{animation:pulse 1.6s ease-in-out infinite}`}</style>
        <div style={{ minHeight: "100vh", padding: "52px 20px 100px", position: "relative" }}>
          <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0, backgroundImage: "url(/ladakh.png)", backgroundSize: "cover", backgroundPosition: "center 40%", backgroundRepeat: "no-repeat", backgroundAttachment: "scroll", pointerEvents: "none" }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(13,24,41,0.88)" }} />
          </div>
          <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div className="sp" style={{ height: "36px", width: "180px", borderRadius: "8px", backgroundColor: "rgba(212,197,169,0.07)", margin: "0 auto 14px" }} />
            <div style={{ display: "flex", justifyContent: "center" }}><CountdownPill /></div>
          </div>
          <div className="sp" style={{ backgroundColor: "rgba(13,24,41,0.55)", borderRadius: "20px", padding: "22px", marginBottom: "28px", height: "180px" }} />
          {[1, 2, 3].map(i => (
            <div key={i} className="sp" style={{ backgroundColor: "rgba(13,24,41,0.55)", borderRadius: "14px", padding: "14px 16px", marginBottom: "10px", height: "88px" }} />
          ))}
          </div>{/* /zIndex wrapper */}
        </div>
      </AppLayout>
    );
  }

  const nextWeekNum = currentWeekNum + 1;
  const nextWeekCM = getChallengeMasterForWeek(1);
  const isThursdayToSunday = [0, 4, 5, 6].includes(new Date().getUTCDay());
  const bannerCondition = isThursdayToSunday && myName.trim().toLowerCase() === nextWeekCM.trim().toLowerCase();
  console.log("[CM Banner Debug] nextWeekCM:", nextWeekCM, "| myName:", myName, "| isThurSun:", isThursdayToSunday, "| show:", bannerCondition);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <AppLayout>
      <div style={{ minHeight: "100vh", padding: "52px 20px 100px", position: "relative" }}>
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0, backgroundImage: "url(/ladakh.png)", backgroundSize: "cover", backgroundPosition: "center 40%", backgroundRepeat: "no-repeat", backgroundAttachment: "scroll", pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(13,24,41,0.88)" }} />
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "28px", position: "relative" }}>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "30px", fontWeight: 700, color: "#F5F2ED", margin: "0 0 14px" }}>
            Weekly Challenge
          </h1>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <CountdownPill />
          </div>
        </div>

        {/* ── "You're up next" banner ── */}
        {bannerCondition && (
          <div
            onClick={() => { setShowForm(true); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            style={{
              backgroundColor: "rgba(201,184,122,0.08)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              border: "1px solid rgba(201,184,122,0.3)",
              borderRadius: "16px",
              padding: "16px 18px",
              marginBottom: "24px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <CrownIcon />
            <div>
              <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "12px", fontWeight: 700, color: "#C9B87A", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 3px" }}>
                You&apos;re up next
              </p>
              <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "12px", color: "rgba(212,197,169,0.55)", margin: 0 }}>
                You&apos;re Challenge Master for Week {nextWeekNum}. Tap to create the challenge.
              </p>
            </div>
          </div>
        )}

        {/* ── Challenge creation form ── */}
        {showForm && !formSubmitted && (
          <div ref={formRef} style={{
            backgroundColor: "rgba(13,24,41,0.55)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
            border: "1px solid rgba(212,197,169,0.12)",
            borderRadius: "16px", padding: "20px", marginBottom: "28px",
          }}>
            <p style={{ ...sectionTitle, marginBottom: "18px" }}>New Challenge — Week {nextWeekNum}</p>

            <div style={{ marginBottom: "16px" }}>
              <label style={formLabelStyle}>Challenge Title</label>
              <input type="text" value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="e.g. The Summit Push" style={inputStyle} />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={formLabelStyle}>Description</label>
              <textarea
                value={formDesc} onChange={e => setFormDesc(e.target.value)}
                placeholder="Describe the challenge..." rows={3}
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5, fontFamily: "Montserrat, sans-serif" }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={formLabelStyle}>Challenge Type</label>
              <select
                value={formType} onChange={e => setFormType(e.target.value)}
                style={{
                  ...inputStyle, appearance: "none",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(212,197,169,0.5)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center",
                  cursor: "pointer", colorScheme: "dark" as React.CSSProperties["colorScheme"],
                }}
              >
                {CHALLENGE_TYPES.map(t => <option key={t} value={t} style={{ backgroundColor: "rgba(13,24,41,0.55)" }}>{t}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={formLabelStyle}>Target ({TARGET_UNITS[formType]})</label>
              <input
                type="number" value={formTarget} onChange={e => setFormTarget(e.target.value)}
                placeholder={formType === "Total Distance" ? "30" : formType === "Number of Runs" ? "4" : "5"}
                min="0" step={formType.includes("Distance") ? "0.5" : "1"}
                style={inputStyle}
              />
            </div>

            {formErrors.length > 0 && (
              <div style={{ backgroundColor: "rgba(220,90,90,0.08)", border: "1px solid rgba(220,90,90,0.25)", borderRadius: "10px", padding: "12px 14px", marginBottom: "16px" }}>
                {formErrors.map((e, i) => (
                  <p key={i} style={{ fontFamily: "Montserrat, sans-serif", fontSize: "12px", color: "rgba(220,90,90,0.9)", margin: i === 0 ? 0 : "4px 0 0" }}>{e}</p>
                ))}
              </div>
            )}

            <button
              onClick={handleSubmitChallenge}
              disabled={formSubmitting}
              style={{
                width: "100%", backgroundColor: formSubmitting ? "rgba(201,184,122,0.4)" : "#C9B87A",
                color: "#0D1829", fontFamily: "Montserrat, sans-serif", fontWeight: 700,
                fontSize: "13px", letterSpacing: "0.18em", padding: "16px",
                borderRadius: "12px", border: "none", cursor: formSubmitting ? "not-allowed" : "pointer",
              }}
            >
              {formSubmitting ? "SUBMITTING…" : "SUBMIT CHALLENGE"}
            </button>
          </div>
        )}

        {/* ── Section 1: Active Challenge Card ── */}
        <p style={sectionTitle}>Active Challenge</p>

        {!challenge ? (
          <div style={{
            backgroundColor: "rgba(13,24,41,0.55)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
            border: "1px solid rgba(212,197,169,0.1)",
            borderRadius: "16px", padding: "32px 20px", marginBottom: "28px", textAlign: "center",
          }}>
            <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "18px", color: "rgba(212,197,169,0.5)", margin: 0 }}>
              No active challenge this week
            </p>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "12px", color: "rgba(212,197,169,0.35)", marginTop: "8px" }}>
              {isCM ? "Create one below ↓" : "The Challenge Master hasn't set one yet"}
            </p>
          </div>
        ) : (
          <div style={{
            backgroundColor: "rgba(13,24,41,0.60)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
            border: "1.5px solid rgba(201,184,122,0.35)",
            borderRadius: "20px", padding: "22px 20px", marginBottom: "28px",
            boxShadow: "0 6px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(201,184,122,0.06)",
          }}>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "10px", fontWeight: 700, color: "rgba(212,197,169,0.5)", letterSpacing: "0.25em", textTransform: "uppercase", margin: "0 0 10px" }}>
              Week {challenge.weekNum} Challenge
            </p>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "24px", fontWeight: 700, color: "#F5F2ED", margin: "0 0 10px", lineHeight: 1.2 }}>
              {challenge.title}
            </h2>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "13px", color: "rgba(212,197,169,0.65)", margin: "0 0 14px", lineHeight: 1.5 }}>
              {challenge.description}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "14px" }}>
              <span style={{
                backgroundColor: "rgba(201,184,122,0.12)", border: "1px solid rgba(201,184,122,0.3)",
                borderRadius: "999px", padding: "5px 12px",
                fontFamily: "Montserrat, sans-serif", fontSize: "10px", fontWeight: 700, color: "#C9B87A", letterSpacing: "0.1em",
              }}>
                {challenge.badge}
              </span>
            </div>
            <div style={{ borderTop: "1px solid rgba(212,197,169,0.08)", margin: "0 0 12px" }} />
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
              <CrownIcon />
              <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: "11px", color: "rgba(212,197,169,0.55)" }}>
                Set by <span style={{ color: "#C9B87A", fontWeight: 600 }}>{challenge.createdByName}</span> · Challenge Master
              </span>
            </div>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "11px", color: "rgba(212,197,169,0.45)", margin: "0 0 8px" }}>
              {challenge.deadline}
            </p>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "11px", fontWeight: 600, color: "#4A7C59", margin: 0 }}>
              +{challenge.bonus_points} pts on completion
            </p>
          </div>
        )}

        {/* ── Section 2: Live Progress ── */}
        {participants.length > 0 && (
          <>
            <p style={sectionTitle}>Live Progress</p>
            <div style={{ marginBottom: "28px" }}>
              {participants.map(p => (
                <ProgressRow key={p.name} {...p} />
              ))}
            </div>
          </>
        )}

        {/* ── Section 3: Challenge Master Panel ── */}
        {isCM && (
          <div style={{ marginBottom: "28px" }}>
            <p style={sectionTitle}>Your Challenge Master Duties</p>
            <div style={{
              backgroundColor: "rgba(13,24,41,0.55)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
              border: "1px solid rgba(201,184,122,0.2)",
              borderRadius: "16px", padding: "18px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <CrownIcon />
                <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: "13px", fontWeight: 700, color: "#C9B87A" }}>
                  You are Challenge Master for Week {currentWeekNum}
                </span>
              </div>
              <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "12px", color: "rgba(212,197,169,0.5)", margin: 0 }}>
                Lead this week&apos;s challenge and keep the group motivated.
              </p>
            </div>
          </div>
        )}

        {/* ── Section 4: Past Challenges ── */}
        <p style={sectionTitle}>Past Challenges</p>
        {pastList.length === 0 ? (
          <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "12px", color: "rgba(212,197,169,0.35)", textAlign: "center", padding: "16px 0" }}>
            No past challenges yet
          </p>
        ) : (
          <div>
            {pastList.map(({ weekNum, title, completedOf, total }) => {
              const allDone = completedOf === total && total > 0;
              return (
                <div key={weekNum} style={{
                  backgroundColor: "rgba(13,24,41,0.55)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
                  border: "1px solid rgba(212,197,169,0.08)",
                  borderRadius: "14px", padding: "14px 16px", marginBottom: "10px",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <div>
                    <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: "9px", fontWeight: 700, color: "rgba(212,197,169,0.35)", letterSpacing: "0.2em", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                      Week {weekNum}
                    </span>
                    <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "15px", fontWeight: 700, color: "#F5F2ED", margin: 0 }}>
                      {title}
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    {allDone && <CheckIcon color="#4A7C59" />}
                    <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: "11px", fontWeight: 600, color: allDone ? "#4A7C59" : "rgba(212,197,169,0.45)" }}>
                      {allDone ? "All completed" : `${completedOf} of ${total} completed`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        </div>{/* /zIndex wrapper */}
      </div>
    </AppLayout>
  );
}
