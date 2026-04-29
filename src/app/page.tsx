"use client";

import AppLayout from "@/components/AppLayout";
import CountdownPill from "@/components/CountdownPill";

type ActivityType = "run" | "activity" | "rest" | "none";

interface Player {
  rank: number;
  name: string;
  initials: string;
  points: number;
  streak: number;
  todayLabel: string;
  todayType: ActivityType;
  todayPoints: number;
  challengeMaster: boolean;
}

const players: Player[] = [
  {
    rank: 1,
    name: "Yash",
    initials: "Y",
    points: 142,
    streak: 8,
    todayLabel: "Run · 6 km",
    todayType: "run",
    todayPoints: 12,
    challengeMaster: true,
  },
  {
    rank: 2,
    name: "Arjun",
    initials: "A",
    points: 118,
    streak: 5,
    todayLabel: "Gym",
    todayType: "activity",
    todayPoints: 8,
    challengeMaster: false,
  },
  {
    rank: 3,
    name: "Priya",
    initials: "P",
    points: 97,
    streak: 3,
    todayLabel: "Rest Day",
    todayType: "rest",
    todayPoints: 0,
    challengeMaster: false,
  },
];

const activityStyles: Record<ActivityType, { bg: string; color: string; border: string }> = {
  run:      { bg: "rgba(74,124,89,0.18)",    color: "#4A7C59", border: "rgba(74,124,89,0.4)" },
  activity: { bg: "rgba(201,184,122,0.12)",  color: "#C9B87A", border: "rgba(201,184,122,0.35)" },
  rest:     { bg: "rgba(212,197,169,0.08)",  color: "#D4C5A9", border: "rgba(212,197,169,0.2)" },
  none:     { bg: "rgba(212,197,169,0.04)",  color: "rgba(212,197,169,0.4)", border: "rgba(212,197,169,0.1)" },
};

function CrownIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="#C9B87A" stroke="none">
      <path d="M2 19h20v2H2zM2 7l5 7 5-7 5 7 5-7v10H2z" />
    </svg>
  );
}

function PlayerCard({ player }: { player: Player }) {
  const isFirst = player.rank === 1;
  const badge = activityStyles[player.todayType];

  return (
    <div style={{
      backgroundColor: isFirst ? "rgba(201,184,122,0.05)" : "#1A2744",
      border: isFirst
        ? "1px solid rgba(201,184,122,0.38)"
        : "1px solid rgba(212,197,169,0.07)",
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
        {/* Streak */}
        <div style={{
          fontFamily: "Montserrat, sans-serif",
          fontSize: "12px",
          color: "rgba(245,242,237,0.6)",
        }}>
          🔥 <span style={{ fontWeight: 600, color: "#F5F2ED" }}>{player.streak}</span> day streak
        </div>

        {/* Challenge Master badge */}
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
  return (
    <AppLayout>
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
            Season standings · Week 12
          </p>
        </div>

        {/* Cards */}
        <div>
          {players.map((player) => (
            <PlayerCard key={player.rank} player={player} />
          ))}
        </div>

      </div>
    </AppLayout>
  );
}
