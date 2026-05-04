"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AppLayout from "@/components/AppLayout";
import CountdownPill from "@/components/CountdownPill";
import { createClient } from "@/lib/supabase-browser";
import { getWeekStart } from "@/lib/scoring";

// ── CM rotation (same logic as leaderboard) ────────────────────────────────
const CM_ORDER = ["Yash", "Hardik", "Devansh"];
const LEAGUE_START_MS = new Date(Date.UTC(2026, 4, 4)).getTime(); // Monday May 4, 2026

function getChallengeMasterName(): string {
  const weekStart = new Date(getWeekStart(new Date())).getTime();
  const wk = Math.max(0, Math.floor((weekStart - LEAGUE_START_MS) / (7 * 24 * 60 * 60 * 1000)));
  return CM_ORDER[((wk % 3) + 3) % 3];
}
function getCurrentWeekNumber(): number {
  const weekStart = new Date(getWeekStart(new Date())).getTime();
  return Math.max(1, Math.floor((weekStart - LEAGUE_START_MS) / (7 * 24 * 60 * 60 * 1000)) + 1);
}

// ── Helpers ────────────────────────────────────────────────────────────────
function formatDate(isoDate: string): string {
  return new Date(isoDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDesc(act: {
  activity_type: string;
  distance_km:   number | null;
  duration_mins: number | null;
  activity_subtype: string | null;
}): string {
  if (act.activity_type === "run") {
    const km  = act.distance_km  != null ? `${Number(act.distance_km.toFixed(1))} km` : "";
    const dur = act.duration_mins != null ? ` · ${act.duration_mins} min` : "";
    return `Run · ${km}${dur}`.replace("·  ·", "·");
  }
  if (act.activity_type === "activity") {
    const sub = act.activity_subtype || "Activity";
    const dur = act.duration_mins != null ? ` · ${act.duration_mins} min` : "";
    return `${sub}${dur}`;
  }
  return "Rest Day";
}

// ── Data interfaces ────────────────────────────────────────────────────────
interface ProfileData {
  name: string;
  initials: string;
  email: string;
  avatar_url: string | null;
  isChallengeMaster: boolean;
  challengeMasterWeek: number;
}
interface SeasonData {
  totalPoints: number;
  totalRuns:   number;
  totalKm:     number;
  bestStreak:  number;
}
interface FeedEntry {
  date: string;
  type: string;
  desc: string;
  pts:  number;
}

// ── Badge icon components ─────────────────────────────────────────────────────
function RunBadgeIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="15.5" cy="3.5" r="1.8" />
      <path d="M13.5 6.5L10 12" /><path d="M13.5 6.5L17 5" /><path d="M11.5 9.5L8 11.5" />
      <path d="M10 12L7.5 16.5 5 20" /><path d="M10 12L12.5 16 15.5 19.5" />
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
      <rect x="2" y="9" width="4" height="6" rx="2" /><rect x="18" y="9" width="4" height="6" rx="2" />
      <rect x="6" y="7" width="3" height="10" rx="1.5" /><rect x="15" y="7" width="3" height="10" rx="1.5" />
      <path d="M9 12h6" />
    </svg>
  );
}
function TargetIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill={color} stroke="none" />
    </svg>
  );
}
function HimalayaIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 20l7-13 4 6 3-5 6 12H2z" /><path d="M9 7l2-4 2 4" />
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

// ── Activity feed icons ───────────────────────────────────────────────────────
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
      <rect x="2" y="9" width="4" height="6" rx="2" /><rect x="18" y="9" width="4" height="6" rx="2" />
      <rect x="6" y="7" width="3" height="10" rx="1.5" /><rect x="15" y="7" width="3" height="10" rx="1.5" />
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
function ChevronRight({ color = "rgba(212,197,169,0.3)" }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

// ── Badge definitions ─────────────────────────────────────────────────────────
const BADGES = [
  { id: "First Run",        label: "First Run",        sub: "Logged your first run",  Icon: RunBadgeIcon  },
  { id: "Week Warrior",     label: "Week Warrior",      sub: "7 day streak",           Icon: FlameIcon     },
  { id: "Altitude Ready",   label: "Altitude Ready",    sub: "50 km total",            Icon: MountainIcon  },
  { id: "Challenge Master", label: "Challenge Master",  sub: "Set a weekly challenge", Icon: CrownBadgeIcon },
  { id: "Century",          label: "Century",           sub: "100 points",             Icon: DumbbellIcon  },
  { id: "Consistent",       label: "Consistent",        sub: "Active in 4+ weeks",     Icon: TargetIcon    },
  { id: "Himalayan",        label: "Himalayan",         sub: "100 km total",           Icon: HimalayaIcon  },
  { id: "Speed Week",       label: "Speed Week",        sub: "4 runs in one week",     Icon: LightningIcon },
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
  const router = useRouter();

  const [loading,  setLoading]  = useState(true);
  const [profile,  setProfile]  = useState<ProfileData | null>(null);
  const [season,   setSeason]   = useState<SeasonData>({ totalPoints: 0, totalRuns: 0, totalKm: 0, bestStreak: 0 });
  const [earned,   setEarned]   = useState<Set<string>>(new Set());
  const [feed,     setFeed]     = useState<FeedEntry[]>([]);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/login"); return; }

      const [
        { data: profileRow },
        { data: myActivities },
        { data: streakRow },
        { data: myWeeklyStats },
      ] = await Promise.all([
        supabase.from("profiles")
          .select("name, email, avatar_url")
          .eq("id", user.id)
          .single(),
        supabase.from("activities")
          .select("date, activity_type, distance_km, duration_mins, total_points_that_day, activity_subtype")
          .eq("user_id", user.id)
          .order("date", { ascending: false }),
        supabase.from("streaks")
          .select("current_streak, longest_streak")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase.from("weekly_stats")
          .select("week_start, runs_used, activity_days_used, rest_day_used")
          .eq("user_id", user.id),
      ]);

      const allActs     = myActivities ?? [];
      const acts        = allActs.filter(a =>
        a.activity_subtype !== "challenge_completion_bonus" &&
        !a.activity_subtype?.startsWith("cm_bonus_")
      );
      const runs        = acts.filter(a => a.activity_type === "run");
      const totalKm     = runs.reduce((s, a) => s + (a.distance_km || 0), 0);
      const totalPoints = allActs.reduce((s, a) => s + (a.total_points_that_day || 0), 0);
      const longestStreak = streakRow?.longest_streak || 0;

      // ── Profile ──────────────────────────────────────────────────────────
      const name     = profileRow?.name || profileRow?.email?.split("@")[0] || "Runner";
      const initials = name.charAt(0).toUpperCase();
      const email    = profileRow?.email || user.email || "";
      const cmName      = getChallengeMasterName();
      const leagueStarted = Date.now() >= new Date(Date.UTC(2026, 4, 4)).getTime();
      const isCM        = leagueStarted && name.toLowerCase() === cmName.toLowerCase();

      setProfile({ name, initials, email, avatar_url: profileRow?.avatar_url || null, isChallengeMaster: isCM, challengeMasterWeek: getCurrentWeekNumber() });

      // ── Season summary ───────────────────────────────────────────────────
      setSeason({
        totalPoints: Math.round(totalPoints),
        totalRuns:   runs.length,
        totalKm:     Math.round(totalKm * 10) / 10,
        bestStreak:  longestStreak,
      });

      // ── Badge logic ──────────────────────────────────────────────────────
      const distinctWeeks  = new Set(acts.map(a => getWeekStart(new Date(a.date + "T00:00:00"))));
      const maxRunsInWeek  = (myWeeklyStats ?? []).reduce((max, w) => Math.max(max, w.runs_used || 0), 0);
      const e = new Set<string>();
      if (runs.length >= 1)       e.add("First Run");
      if (totalPoints >= 100)     e.add("Century");
      if (totalKm >= 50)          e.add("Altitude Ready");
      if (isCM)                   e.add("Challenge Master");
      if (longestStreak >= 7)     e.add("Week Warrior");
      if (distinctWeeks.size >= 4) e.add("Consistent");
      if (maxRunsInWeek >= 4)     e.add("Speed Week");
      if (totalKm >= 100)         e.add("Himalayan");
      setEarned(e);

      // ── Activity feed (last 10) ───────────────────────────────────────────
      setFeed(acts.slice(0, 10).map(a => ({
        date: formatDate(a.date),
        type: a.activity_type,
        desc: formatDesc(a),
        pts:  Math.round(a.total_points_that_day || 0),
      })));

      setLoading(false);
    }
    fetchData();
  }, [router]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
  }

  // ── Loading skeleton ──────────────────────────────────────────────────────
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
            <div className="sp" style={{ height: "36px", width: "120px", borderRadius: "8px", backgroundColor: "rgba(212,197,169,0.07)", margin: "0 auto 14px" }} />
            <div style={{ display: "flex", justifyContent: "center" }}><CountdownPill /></div>
          </div>
          {/* Avatar skeleton */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "32px", gap: "12px" }}>
            <div className="sp" style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "rgba(212,197,169,0.1)" }} />
            <div className="sp" style={{ width: "120px", height: "22px", borderRadius: "6px", backgroundColor: "rgba(212,197,169,0.07)" }} />
            <div className="sp" style={{ width: "160px", height: "14px", borderRadius: "6px", backgroundColor: "rgba(212,197,169,0.05)" }} />
          </div>
          {/* Season grid skeleton */}
          <div className="sp" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px", marginBottom: "28px" }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ backgroundColor: "rgba(13,24,41,0.55)", borderRadius: "14px", padding: "14px 8px", height: "66px" }} />
            ))}
          </div>
          {/* Badge grid skeleton */}
          <div className="sp" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "10px", marginBottom: "28px" }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ backgroundColor: "rgba(13,24,41,0.55)", borderRadius: "14px", padding: "14px", height: "68px" }} />
            ))}
          </div>
          {/* Feed skeleton */}
          <div className="sp" style={{ backgroundColor: "rgba(13,24,41,0.55)", borderRadius: "16px", padding: "16px", marginBottom: "28px" }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ height: "44px", borderBottom: i < 4 ? "1px solid rgba(212,197,169,0.06)" : "none", display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "30px", height: "30px", borderRadius: "50%", backgroundColor: "rgba(212,197,169,0.07)" }} />
                <div style={{ flex: 1, height: "12px", borderRadius: "4px", backgroundColor: "rgba(212,197,169,0.07)" }} />
              </div>
            ))}
          </div>
          </div>{/* /zIndex wrapper */}
        </div>
      </AppLayout>
    );
  }

  const p = profile!;

  // ── Loaded ────────────────────────────────────────────────────────────────
  return (
    <AppLayout>
      <div style={{ minHeight: "100vh", padding: "52px 20px 100px", position: "relative" }}>
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0, backgroundImage: "url(/ladakh.png)", backgroundSize: "cover", backgroundPosition: "center 40%", backgroundRepeat: "no-repeat", backgroundAttachment: "scroll", pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(13,24,41,0.88)" }} />
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "30px", fontWeight: 700, color: "#F5F2ED", margin: "0 0 14px" }}>
            Profile
          </h1>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <CountdownPill />
          </div>
        </div>

        {/* ── Section 1: Profile Hero ── */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "32px" }}>
          <div style={{ marginBottom: "14px", borderRadius: "50%" }}>
            {p.avatar_url ? (
              <Image src={p.avatar_url} alt={p.name || "Profile"} width={80} height={80} style={{ borderRadius: "50%", objectFit: "cover", display: "block" }} />
            ) : (
              <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "#C9B87A", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display', Georgia, serif", fontSize: "32px", fontWeight: 700, color: "#0D1829" }}>
                {p.name?.[0] || "?"}
              </div>
            )}
          </div>

          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "26px", fontWeight: 700, color: "#F5F2ED", margin: "0 0 4px" }}>
            {p.name}
          </h2>
          <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "12px", color: "rgba(212,197,169,0.5)", margin: "0 0 14px" }}>
            {p.email}
          </p>

          {p.isChallengeMaster && (
            <div style={{
              display: "flex", alignItems: "center", gap: "6px",
              backgroundColor: "rgba(201,184,122,0.1)", border: "1px solid rgba(201,184,122,0.28)",
              borderRadius: "999px", padding: "5px 14px", marginBottom: "16px",
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#C9B87A" stroke="none">
                <path d="M2 19h20v2H2zM2 8l5 6.5L12 7l5 7.5L22 8v10H2z" />
              </svg>
              <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: "11px", fontWeight: 700, color: "#C9B87A", letterSpacing: "0.05em" }}>
                Challenge Master · Week {p.challengeMasterWeek}
              </span>
            </div>
          )}

        </div>

        {/* ── Section 2: Season Summary ── */}
        <p style={sectionTitle}>Season Summary</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginBottom: "28px" }}>
          {[
            { label: "Points", value: season.totalPoints, unit: ""  },
            { label: "Runs",   value: season.totalRuns,   unit: ""  },
            { label: "KM",     value: season.totalKm,     unit: ""  },
            { label: "Streak", value: season.bestStreak,  unit: "d" },
          ].map(({ label, value, unit }) => (
            <div key={label} style={{
              backgroundColor: "rgba(13,24,41,0.55)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
              border: "1px solid rgba(212,197,169,0.08)",
              borderRadius: "14px", padding: "14px 8px", textAlign: "center",
            }}>
              <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "22px", fontWeight: 700, color: "#C9B87A", lineHeight: 1 }}>
                {value}{unit}
              </div>
              <div style={{ fontFamily: "Montserrat, sans-serif", fontSize: "9px", fontWeight: 700, color: "rgba(212,197,169,0.4)", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: "6px" }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* ── Section 3: Badges ── */}
        <p style={sectionTitle}>Badges & Achievements</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", marginBottom: "28px" }}>
          {BADGES.map(({ id, label, sub, Icon }) => {
            const isEarned = earned.has(id);
            return (
              <div key={id} style={{
                backgroundColor: "rgba(13,24,41,0.55)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                border: `1px solid ${isEarned ? "rgba(201,184,122,0.25)" : "rgba(212,197,169,0.06)"}`,
                borderRadius: "14px", padding: "14px",
                display: "flex", alignItems: "center", gap: "12px",
                opacity: isEarned ? 1 : 0.45,
              }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "50%",
                  backgroundColor: isEarned ? "rgba(201,184,122,0.12)" : "rgba(212,197,169,0.05)",
                  border: `1px solid ${isEarned ? "rgba(201,184,122,0.3)" : "rgba(212,197,169,0.1)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <Icon color={isEarned ? "#C9B87A" : "rgba(212,197,169,0.35)"} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{
                    fontFamily: "Montserrat, sans-serif", fontSize: "11px", fontWeight: 700,
                    color: isEarned ? "#F5F2ED" : "rgba(212,197,169,0.4)",
                    margin: "0 0 2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    {label}
                  </p>
                  <p style={{
                    fontFamily: "Montserrat, sans-serif", fontSize: "9px",
                    color: isEarned ? "rgba(212,197,169,0.45)" : "rgba(212,197,169,0.25)",
                    margin: 0, lineHeight: 1.3,
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
          backgroundColor: "rgba(13,24,41,0.55)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
          border: "1px solid rgba(212,197,169,0.08)",
          borderRadius: "16px", overflow: "hidden", marginBottom: "28px",
        }}>
          {feed.length === 0 ? (
            <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "12px", color: "rgba(212,197,169,0.35)", textAlign: "center", padding: "24px" }}>
              No activities logged yet
            </p>
          ) : feed.map(({ date, type, desc, pts }, i) => {
            const isRun      = type === "run";
            const isActivity = type === "activity";
            const color = isRun ? "#C9B87A" : isActivity ? "#4A7C59" : "rgba(212,197,169,0.4)";
            const IconEl = isRun ? <ActivityRunIcon /> : isActivity ? <ActivityGymIcon /> : <ActivityRestIcon />;
            return (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "13px 16px",
                borderBottom: i < feed.length - 1 ? "1px solid rgba(212,197,169,0.06)" : "none",
              }}>
                <div style={{
                  width: "30px", height: "30px", borderRadius: "50%",
                  backgroundColor: isRun ? "rgba(201,184,122,0.1)" : isActivity ? "rgba(74,124,89,0.1)" : "rgba(212,197,169,0.05)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  {IconEl}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "12px", fontWeight: 600, color: "#F5F2ED", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {desc}
                  </p>
                  <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "10px", color: "rgba(212,197,169,0.4)", margin: "2px 0 0" }}>
                    {date}
                  </p>
                </div>
                {pts > 0 && (
                  <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: "12px", fontWeight: 700, color, flexShrink: 0 }}>
                    +{pts} pts
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Section 5: Settings ── */}
        <p style={sectionTitle}>Settings</p>
        <div style={{ backgroundColor: "rgba(13,24,41,0.55)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", border: "1px solid rgba(212,197,169,0.08)", borderRadius: "16px", overflow: "hidden" }}>
          <button
            onClick={handleSignOut}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", background: "none", border: "none", cursor: "pointer" }}
          >
            <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: "13px", fontWeight: 600, color: "rgba(210,70,70,0.85)" }}>
              Sign Out
            </span>
            <ChevronRight color="rgba(210,70,70,0.3)" />
          </button>
        </div>

        </div>{/* /zIndex wrapper */}
      </div>
    </AppLayout>
  );
}
