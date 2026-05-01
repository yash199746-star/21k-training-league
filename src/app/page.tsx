"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import CountdownPill from "@/components/CountdownPill";
import { createClient } from "@/lib/supabase-browser";

type ActivityType = "run" | "activity" | "rest" | "none";

interface Player {
  id: string;
  rank: number;
  name: string;
  initials: string;
  points: number;
  streak: number;
  todayLabel: string;
  todayType: ActivityType;
  todayPoints: number;
  challengeMaster: boolean;
  isCurrentUser: boolean;
}

interface RawActivity {
  user_id: string;
  date: string;
  activity_type: string;
  activity_subtype: string | null;
  distance_km: number | null;
  total_points_that_day: number | null;
}

const activityStyles: Record<ActivityType, { bg: string; color: string; border: string }> = {
  run:      { bg: "rgba(74,124,89,0.18)",    color: "#4A7C59",              border: "rgba(74,124,89,0.4)"       },
  activity: { bg: "rgba(201,184,122,0.12)",  color: "#C9B87A",              border: "rgba(201,184,122,0.35)"    },
  rest:     { bg: "rgba(212,197,169,0.08)",  color: "#D4C5A9",              border: "rgba(212,197,169,0.2)"     },
  none:     { bg: "rgba(212,197,169,0.04)",  color: "rgba(212,197,169,0.4)", border: "rgba(212,197,169,0.1)"   },
};

const CM_ORDER = ["Yash", "Hardik", "Devansh"];
// April 1 2026 UTC — epoch for all week calculations
const EPOCH_MS = Date.UTC(2026, 3, 1);
const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

function weeksFromEpoch(): number {
  const now = new Date();
  const todayUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.floor((todayUTC - EPOCH_MS) / MS_PER_WEEK);
}

function getChallengeMasterName(): string {
  const wk = weeksFromEpoch();
  return CM_ORDER[((wk % 3) + 3) % 3];
}

function getCurrentWeekNumber(): number {
  return Math.max(1, weeksFromEpoch() + 1);
}

function todayActivityFor(activities: RawActivity[], userId: string, today: string): {
  label: string; type: ActivityType; points: number;
} {
  const act = activities.find(a => a.user_id === userId && a.date === today);
  if (!act) return { label: "No activity yet", type: "none", points: 0 };
  if (act.activity_type === "run") {
    const km = act.distance_km != null ? Number(act.distance_km.toFixed(1)) : "?";
    return { label: `Run · ${km} km`, type: "run", points: act.total_points_that_day || 0 };
  }
  if (act.activity_type === "activity") {
    return { label: act.activity_subtype || "Activity", type: "activity", points: act.total_points_that_day || 0 };
  }
  return { label: "Rest Day", type: "rest", points: 0 };
}

function CrownIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="#C9B87A" stroke="none">
      <path d="M2 19h20v2H2zM2 7l5 7 5-7 5 7 5-7v10H2z" />
    </svg>
  );
}

function SkeletonCard({ large }: { large?: boolean }) {
  return (
    <div style={{
      backgroundColor: large ? "rgba(201,184,122,0.03)" : "#1A2744",
      border: "1px solid rgba(212,197,169,0.07)",
      borderRadius: large ? "20px" : "16px",
      padding: large ? "22px 20px" : "16px 18px",
      marginBottom: "12px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <div style={{ width: "30px", height: large ? "30px" : "22px", borderRadius: "6px", backgroundColor: "rgba(212,197,169,0.08)" }} />
        <div style={{ width: large ? "50px" : "42px", height: large ? "50px" : "42px", borderRadius: "50%", backgroundColor: "rgba(212,197,169,0.08)", flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ width: "80px", height: "12px", borderRadius: "4px", backgroundColor: "rgba(212,197,169,0.08)", marginBottom: "10px" }} />
          <div style={{ width: "60px", height: "18px", borderRadius: "999px", backgroundColor: "rgba(212,197,169,0.06)" }} />
        </div>
        <div style={{ width: "44px", height: large ? "32px" : "26px", borderRadius: "6px", backgroundColor: "rgba(212,197,169,0.08)" }} />
      </div>
      <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px solid rgba(212,197,169,0.07)", height: "16px", borderRadius: "4px", backgroundColor: "rgba(212,197,169,0.06)", width: "120px" }} />
    </div>
  );
}

function PlayerCard({ player }: { player: Player }) {
  const isFirst = player.rank === 1;
  const badge   = activityStyles[player.todayType];

  return (
    <div style={{
      backgroundColor: isFirst ? "rgba(201,184,122,0.05)" : "#1A2744",
      border: isFirst
        ? "1px solid rgba(201,184,122,0.38)"
        : "1px solid rgba(212,197,169,0.07)",
      borderLeft: player.isCurrentUser && !isFirst
        ? "3px solid rgba(201,184,122,0.6)"
        : undefined,
      borderRadius: isFirst ? "20px" : "16px",
      padding: isFirst ? "22px 20px" : "16px 18px",
      marginBottom: "12px",
      boxShadow: isFirst
        ? "0 6px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(201,184,122,0.08)"
        : "0 2px 12px rgba(0,0,0,0.2)",
    }}>

      {/* Main row */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>

        {/* Rank */}
        <div style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: isFirst ? "30px" : "22px",
          fontWeight: 700,
          color: "#C9B87A",
          width: "30px",
          textAlign: "center",
          flexShrink: 0,
          lineHeight: 1,
        }}>
          {player.rank}
        </div>

        {/* Avatar */}
        <div style={{
          width: isFirst ? "50px" : "42px",
          height: isFirst ? "50px" : "42px",
          borderRadius: "50%",
          backgroundColor: "rgba(201,184,122,0.12)",
          border: `1.5px solid rgba(201,184,122,${isFirst ? "0.45" : "0.25"})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Montserrat, sans-serif",
          fontSize: isFirst ? "19px" : "16px",
          fontWeight: 700,
          color: "#C9B87A",
          flexShrink: 0,
        }}>
          {player.initials}
        </div>

        {/* Name + today badge */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: isFirst ? "17px" : "15px",
            fontWeight: 600,
            color: "#F5F2ED",
            marginBottom: "6px",
            letterSpacing: "0.01em",
          }}>
            {player.name}
            {player.isCurrentUser && (
              <span style={{
                marginLeft: "8px",
                fontFamily: "Montserrat, sans-serif",
                fontSize: "9px",
                fontWeight: 700,
                color: "rgba(201,184,122,0.5)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}>you</span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{
              backgroundColor: badge.bg,
              color: badge.color,
              border: `1px solid ${badge.border}`,
              borderRadius: "999px",
              padding: "3px 9px",
              fontSize: "10px",
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 700,
              letterSpacing: "0.07em",
              whiteSpace: "nowrap",
            }}>
              {player.todayLabel}
            </span>
            {player.todayPoints > 0 && (
              <span style={{
                fontSize: "11px",
                fontFamily: "Montserrat, sans-serif",
                color: "rgba(201,184,122,0.65)",
                fontWeight: 500,
              }}>
                +{player.todayPoints} pts
              </span>
            )}
          </div>
        </div>

        {/* Points */}
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: isFirst ? "32px" : "26px",
            fontWeight: 700,
            color: "#C9B87A",
            lineHeight: 1,
          }}>
            {player.points}
          </div>
          <div style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: "9px",
            color: "rgba(212,197,169,0.45)",
            letterSpacing: "0.12em",
            marginTop: "3px",
            textTransform: "uppercase",
          }}>
            pts
          </div>
        </div>
      </div>

      {/* Divider + footer row */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: "14px",
        paddingTop: "12px",
        borderTop: "1px solid rgba(212,197,169,0.07)",
      }}>
        <div style={{ fontFamily: "Montserrat, sans-serif", fontSize: "12px", color: "rgba(245,242,237,0.6)" }}>
          🔥 <span style={{ fontWeight: 600, color: "#F5F2ED" }}>{player.streak}</span> day streak
        </div>

        {player.challengeMaster && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            backgroundColor: "rgba(201,184,122,0.1)",
            border: "1px solid rgba(201,184,122,0.25)",
            borderRadius: "999px",
            padding: "3px 10px",
          }}>
            <CrownIcon />
            <span style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: "10px",
              fontWeight: 700,
              color: "#C9B87A",
              letterSpacing: "0.05em",
            }}>
              Challenge Master
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  const router  = useRouter();
  const [players,  setPlayers]  = useState<Player[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [weekNum,  setWeekNum]  = useState(1);

  useEffect(() => {
    async function fetchData() {
      console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/login"); return; }

      const today = new Date().toISOString().split("T")[0];
      const cmName = getChallengeMasterName();
      setWeekNum(getCurrentWeekNumber());

      const [
        { data: profiles, error: profilesError },
        { data: activities, error: activitiesError },
        { data: streaks },
      ] = await Promise.all([
        supabase.from("profiles").select("id, name, email"),
        supabase.from("activities").select("user_id, date, activity_type, activity_subtype, distance_km, total_points_that_day"),
        supabase.from("streaks").select("user_id, current_streak"),
      ]);

      console.log('[Leaderboard] profiles response:', profiles, 'error:', profilesError);
      console.log('[Leaderboard] activities response:', activities, 'error:', activitiesError);

      if (!profiles) { setLoading(false); return; }

      // Sum total points per user
      const pointsByUser: Record<string, number> = {};
      (activities ?? []).forEach(a => {
        pointsByUser[a.user_id] = (pointsByUser[a.user_id] || 0) + (a.total_points_that_day || 0);
      });

      // Streak lookup
      const streakByUser: Record<string, number> = {};
      (streaks ?? []).forEach(s => { streakByUser[s.user_id] = s.current_streak || 0; });

      // Build and sort players
      const built: Player[] = profiles.map(p => {
        const name    = p.name || p.email?.split("@")[0] || "Unknown";
        const initials = name.charAt(0).toUpperCase();
        const today_  = todayActivityFor(activities ?? [], p.id, today);
        const points  = Math.round(pointsByUser[p.id] || 0);

        return {
          id:             p.id,
          rank:           0,
          name,
          initials,
          points,
          streak:         streakByUser[p.id] || 0,
          todayLabel:     today_.label,
          todayType:      today_.type,
          todayPoints:    today_.points,
          challengeMaster: name.toLowerCase() === cmName.toLowerCase(),
          isCurrentUser:  p.id === user.id,
        };
      });

      built.sort((a, b) => b.points - a.points);
      built.forEach((p, i) => { p.rank = i + 1; });

      setPlayers(built);
      setLoading(false);
    }

    fetchData();
  }, [router]);

  return (
    <AppLayout>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.45; }
        }
        .skeleton-pulse { animation: pulse 1.6s ease-in-out infinite; }
      `}</style>

      <div style={{ padding: "52px 20px 24px", backgroundColor: "#1A2744", minHeight: "100vh" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <p style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: "10px",
            fontWeight: 700,
            color: "#C9B87A",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            marginBottom: "10px",
          }}>
            21K Training League
          </p>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "18px" }}>
            <CountdownPill />
          </div>
          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "32px",
            fontWeight: 700,
            color: "#F5F2ED",
            margin: 0,
            lineHeight: 1.1,
          }}>
            Leaderboard
          </h1>
          <p style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: "11px",
            color: "rgba(212,197,169,0.5)",
            marginTop: "6px",
            letterSpacing: "0.05em",
          }}>
            Season standings · Week {weekNum}
          </p>
        </div>

        {/* Cards */}
        <div className={loading ? "skeleton-pulse" : undefined}>
          {loading ? (
            <>
              <SkeletonCard large />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : players.length === 0 ? (
            <p style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: "13px",
              color: "rgba(212,197,169,0.4)",
              textAlign: "center",
              marginTop: "40px",
            }}>
              No players found
            </p>
          ) : (
            players.map(player => <PlayerCard key={player.id} player={player} />)
          )}
        </div>

      </div>
    </AppLayout>
  );
}
