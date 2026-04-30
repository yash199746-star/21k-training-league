"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import CountdownPill from "@/components/CountdownPill";
import { createClient } from "@/lib/supabase-browser";
import { getWeekStart } from "@/lib/scoring";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";

// ── Data interfaces ───────────────────────────────────────────────────────────
interface StatsGrid {
  totalPoints: number;
  rank:         number;
  streak:       number;
  longestStreak: number;
  totalKm:      number;
  avgRunKm:     number;
}

interface WeekStats {
  points:       number;
  km:           number;
  runs:         number;
  activityUsed: number;
  restUsed:     boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDay(isoDate: string): string {
  const d = new Date(isoDate + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getWeekLabel(weekStart: string): string {
  const d    = new Date(weekStart + "T00:00:00");
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const n    = Math.ceil((((d.getTime() - jan1.getTime()) / 86400000) + jan1.getDay() + 1) / 7);
  return `W${n}`;
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

const chartCard: React.CSSProperties = {
  backgroundColor: "#0D1829",
  border: "1px solid rgba(212,197,169,0.08)",
  borderRadius: "16px",
  padding: "16px 12px 12px",
  marginBottom: "12px",
};

const chartLabel: React.CSSProperties = {
  fontFamily: "Montserrat, sans-serif",
  fontSize: "10px",
  fontWeight: 700,
  color: "rgba(212,197,169,0.45)",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  marginBottom: "12px",
};

const tooltipStyle = {
  backgroundColor: "#0D1829",
  border: "1px solid rgba(201,184,122,0.2)",
  borderRadius: "8px",
  fontFamily: "Montserrat, sans-serif",
  fontSize: "11px",
  color: "#C9B87A",
};

// ── Icons ─────────────────────────────────────────────────────────────────────
function TrophyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9B87A" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 21h8M12 17v4" />
      <path d="M7 4H4v5c0 3 2 5 5 6" />
      <path d="M17 4h3v5c0 3-2 5-5 6" />
      <path d="M6 4h12v8a6 6 0 0 1-12 0V4z" />
    </svg>
  );
}

// ── Custom tooltip ────────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label, unit }: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  unit?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ ...tooltipStyle, padding: "6px 10px" }}>
      <p style={{ margin: 0, color: "rgba(212,197,169,0.6)", fontSize: "10px" }}>{label}</p>
      <p style={{ margin: "2px 0 0", fontWeight: 700 }}>{payload[0].value}{unit}</p>
    </div>
  );
}

// ── Custom donut label ────────────────────────────────────────────────────────
function DonutLabel({ cx, cy, midAngle, innerRadius, outerRadius, name, value }: {
  cx?: number; cy?: number; midAngle?: number;
  innerRadius?: number; outerRadius?: number;
  name?: string; value?: number;
}) {
  const RADIAN = Math.PI / 180;
  const radius = (innerRadius ?? 0) + ((outerRadius ?? 0) - (innerRadius ?? 0)) * 1.45;
  const x = (cx ?? 0) + radius * Math.cos(-(midAngle ?? 0) * RADIAN);
  const y = (cy ?? 0) + radius * Math.sin(-(midAngle ?? 0) * RADIAN);
  return (
    <text x={x} y={y} fill="rgba(212,197,169,0.55)" textAnchor={x > (cx ?? 0) ? "start" : "end"}
      dominantBaseline="central" style={{ fontFamily: "Montserrat, sans-serif", fontSize: "9px", fontWeight: 700 }}>
      {name} ({value})
    </text>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonBlock({ w, h, radius = 6 }: { w?: string; h: number; radius?: number }) {
  return <div style={{ width: w ?? "100%", height: `${h}px`, borderRadius: `${radius}px`, backgroundColor: "rgba(212,197,169,0.07)" }} />;
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function StatsPage() {
  const router = useRouter();

  const [loading,          setLoading]          = useState(true);
  const [stats,            setStats]            = useState<StatsGrid>({ totalPoints: 0, rank: 1, streak: 0, longestStreak: 0, totalKm: 0, avgRunKm: 0 });
  const [week,             setWeek]             = useState<WeekStats>({ points: 0, km: 0, runs: 0, activityUsed: 0, restUsed: false });
  const [weeklyKm,         setWeeklyKm]         = useState<{ week: string; km: number }[]>([]);
  const [cumulativePoints, setCumulativePoints] = useState<{ day: string; pts: number }[]>([]);
  const [activityMix,      setActivityMix]      = useState<{ name: string; value: number; color: string }[]>([]);
  const [streakHistory,    setStreakHistory]     = useState<{ week: string; streak: number }[]>([]);
  const [records,          setRecords]          = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/login"); return; }

      const weekStart     = getWeekStart(new Date());
      const thirtyAgo     = new Date();
      thirtyAgo.setDate(thirtyAgo.getDate() - 30);
      const thirtyAgoStr  = thirtyAgo.toISOString().split("T")[0];

      const [
        { data: myActivities },
        { data: allPtsRaw },
        { data: streakRow },
        { data: myWeeklyAll },
        { data: thisWeek },
      ] = await Promise.all([
        supabase.from("activities")
          .select("date, activity_type, distance_km, total_points_that_day")
          .eq("user_id", user.id)
          .order("date", { ascending: true }),
        supabase.from("activities")
          .select("user_id, total_points_that_day"),
        supabase.from("streaks")
          .select("current_streak, longest_streak")
          .eq("user_id", user.id)
          .single(),
        supabase.from("weekly_stats")
          .select("*")
          .eq("user_id", user.id)
          .order("week_start", { ascending: true }),
        supabase.from("weekly_stats")
          .select("*")
          .eq("user_id", user.id)
          .eq("week_start", weekStart)
          .single(),
      ]);

      const acts = myActivities ?? [];
      const runs = acts.filter(a => a.activity_type === "run");

      // ── Stats grid ──────────────────────────────────────────────────────────
      const totalPoints   = acts.reduce((s, a) => s + (a.total_points_that_day || 0), 0);
      const totalKm       = runs.reduce((s, a) => s + (a.distance_km || 0), 0);
      const avgRunKm      = runs.length > 0 ? totalKm / runs.length : 0;
      const currentStreak = streakRow?.current_streak  || 0;
      const longestStreak = streakRow?.longest_streak  || 0;

      // Rank: count other users with more points
      const ptsByUser: Record<string, number> = {};
      (allPtsRaw ?? []).forEach(a => {
        ptsByUser[a.user_id] = (ptsByUser[a.user_id] || 0) + (a.total_points_that_day || 0);
      });
      const myTotal = ptsByUser[user.id] || 0;
      const rank    = Object.values(ptsByUser).filter(p => p > myTotal).length + 1;

      setStats({
        totalPoints:   Math.round(totalPoints),
        rank,
        streak:        currentStreak,
        longestStreak,
        totalKm:       Math.round(totalKm * 10) / 10,
        avgRunKm:      Math.round(avgRunKm * 10) / 10,
      });

      // ── This week ───────────────────────────────────────────────────────────
      setWeek({
        points:       Math.round(thisWeek?.total_points   || 0),
        km:           Math.round((thisWeek?.total_km      || 0) * 10) / 10,
        runs:         thisWeek?.runs_used          || 0,
        activityUsed: thisWeek?.activity_days_used || 0,
        restUsed:     (thisWeek?.rest_day_used     || 0) > 0,
      });

      // ── Weekly KM — last 6 weeks ─────────────────────────────────────────
      const last6 = (myWeeklyAll ?? []).slice(-6);
      setWeeklyKm(last6.map(w => ({
        week: getWeekLabel(w.week_start),
        km:   Math.round((w.total_km || 0) * 10) / 10,
      })));

      // ── Cumulative points — last 30 days ────────────────────────────────
      const recent = acts.filter(a => a.date >= thirtyAgoStr);
      const byDate: Record<string, number> = {};
      recent.forEach(a => {
        byDate[a.date] = (byDate[a.date] || 0) + (a.total_points_that_day || 0);
      });
      let running = 0;
      const cumPts = Object.entries(byDate)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, pts]) => { running += pts; return { day: formatDay(date), pts: Math.round(running) }; });
      setCumulativePoints(cumPts);

      // ── Activity mix ─────────────────────────────────────────────────────
      const counts = { run: 0, activity: 0, rest: 0 };
      acts.forEach(a => { if (a.activity_type in counts) counts[a.activity_type as keyof typeof counts]++; });
      setActivityMix([
        { name: "Run",      value: counts.run,      color: "#C9B87A" },
        { name: "Activity", value: counts.activity,  color: "#4A7C59" },
        { name: "Rest",     value: counts.rest,      color: "#2A3D5E" },
      ].filter(a => a.value > 0));

      // ── Streak history — active days per week, last 8 weeks ─────────────
      const last8 = (myWeeklyAll ?? []).slice(-8);
      setStreakHistory(last8.map(w => ({
        week:   getWeekLabel(w.week_start),
        streak: (w.runs_used || 0) + (w.activity_days_used || 0) + ((w.rest_day_used || 0) > 0 ? 1 : 0),
      })));

      // ── Personal records ─────────────────────────────────────────────────
      const longestRunKm = runs.reduce((max, a) => Math.max(max, a.distance_km || 0), 0);
      const bestWeekPts  = (myWeeklyAll ?? []).reduce((max, w) => Math.max(max, w.total_points || 0), 0);
      setRecords([
        { label: "Longest Run", value: longestRunKm > 0 ? `${longestRunKm.toFixed(1)} km` : "—" },
        { label: "Best Week",   value: bestWeekPts  > 0 ? `${Math.round(bestWeekPts)} pts`  : "—" },
        { label: "Max Streak",  value: longestStreak > 0 ? `${longestStreak} days`           : "—" },
      ]);

      setLoading(false);
    }
    fetchData();
  }, [router]);

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <AppLayout>
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}.sp{animation:pulse 1.6s ease-in-out infinite}`}</style>
        <div style={{ minHeight: "100vh", backgroundColor: "#1A2744", padding: "52px 20px 100px" }}>
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div style={{ height: "36px", width: "120px", borderRadius: "8px", backgroundColor: "rgba(212,197,169,0.07)", margin: "0 auto 14px" }} className="sp" />
            <div style={{ display: "flex", justifyContent: "center" }}><CountdownPill /></div>
          </div>
          <div className="sp" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "28px" }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ backgroundColor: "#0D1829", borderRadius: "14px", padding: "16px 14px" }}>
                <SkeletonBlock h={9}  w="60%"  />
                <div style={{ marginTop: "12px" }}><SkeletonBlock h={28} w="70%" /></div>
              </div>
            ))}
          </div>
          <div className="sp" style={{ display: "flex", gap: "8px", marginBottom: "28px" }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ flexShrink: 0, backgroundColor: "#0D1829", borderRadius: "999px", padding: "8px 16px", width: "80px", height: "52px" }} />
            ))}
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="sp" style={{ ...chartCard, height: "188px" }} />
          ))}
        </div>
      </AppLayout>
    );
  }

  // ── Loaded ────────────────────────────────────────────────────────────────
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
            My Stats
          </h1>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <CountdownPill />
          </div>
        </div>

        {/* ── Section 1: Stats Grid ── */}
        <p style={sectionTitle}>Overview</p>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "10px",
          marginBottom: "28px",
        }}>
          {[
            { label: "Total Points",     value: String(stats.totalPoints),                    unit: "pts"   },
            { label: "Current Rank",     value: `#${stats.rank}`,                             unit: ""      },
            { label: "Current Streak",   value: String(stats.streak),                         unit: " days", fire: true },
            { label: "Longest Streak",   value: String(stats.longestStreak),                  unit: " days" },
            { label: "Total Distance",   value: String(stats.totalKm),                        unit: " km"   },
            { label: "Avg Run Distance", value: stats.avgRunKm > 0 ? String(stats.avgRunKm) : "—", unit: stats.avgRunKm > 0 ? " km" : "" },
          ].map(({ label, value, unit, fire }) => (
            <div key={label} style={{
              backgroundColor: "#0D1829",
              border: "1px solid rgba(212,197,169,0.08)",
              borderRadius: "14px",
              padding: "16px 14px",
            }}>
              <p style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: "9px",
                fontWeight: 700,
                color: "rgba(212,197,169,0.45)",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                margin: "0 0 8px",
              }}>
                {label}
              </p>
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                <span style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: "28px",
                  fontWeight: 700,
                  color: "#C9B87A",
                  lineHeight: 1,
                }}>
                  {value}
                </span>
                {unit && (
                  <span style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: "11px",
                    color: "rgba(201,184,122,0.5)",
                    fontWeight: 600,
                  }}>
                    {unit}
                  </span>
                )}
                {fire && <span style={{ fontSize: "14px", marginLeft: "2px" }}>🔥</span>}
              </div>
            </div>
          ))}
        </div>

        {/* ── Section 2: This Week ── */}
        <p style={sectionTitle}>This Week</p>
        <div style={{
          display: "flex",
          gap: "8px",
          overflowX: "auto",
          paddingBottom: "4px",
          scrollbarWidth: "none",
          marginBottom: "28px",
        }}>
          {[
            { label: "Points",   value: `${week.points} pts`                        },
            { label: "Distance", value: `${week.km} km`                              },
            { label: "Runs",     value: `${week.runs} runs`                          },
            { label: "Activity", value: `${week.activityUsed}/2 days`                },
            { label: "Rest",     value: week.restUsed ? "Used" : "Not used", muted: !week.restUsed },
          ].map(({ label, value, muted }) => (
            <div key={label} style={{
              flexShrink: 0,
              backgroundColor: "#0D1829",
              border: "1px solid rgba(212,197,169,0.1)",
              borderRadius: "999px",
              padding: "8px 16px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "2px",
            }}>
              <span style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: "9px",
                fontWeight: 700,
                color: "rgba(212,197,169,0.4)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}>
                {label}
              </span>
              <span style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: "13px",
                fontWeight: 700,
                color: muted ? "rgba(212,197,169,0.3)" : "#C9B87A",
              }}>
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* ── Section 3: Charts ── */}
        <p style={sectionTitle}>Charts</p>

        {/* Weekly Distance */}
        <div style={chartCard}>
          <p style={chartLabel}>Weekly Distance</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={weeklyKm} barSize={28} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <XAxis dataKey="week" tick={{ fill: "rgba(212,197,169,0.4)", fontSize: 10, fontFamily: "Montserrat, sans-serif" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(212,197,169,0.4)", fontSize: 10, fontFamily: "Montserrat, sans-serif" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip unit=" km" />} cursor={{ fill: "rgba(201,184,122,0.05)" }} />
              <Bar dataKey="km" fill="#C9B87A" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Points Over Time */}
        <div style={chartCard}>
          <p style={chartLabel}>Points Over Time</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={cumulativePoints} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <XAxis dataKey="day" tick={{ fill: "rgba(212,197,169,0.4)", fontSize: 9, fontFamily: "Montserrat, sans-serif" }} axisLine={false} tickLine={false} interval={2} />
              <YAxis tick={{ fill: "rgba(212,197,169,0.4)", fontSize: 10, fontFamily: "Montserrat, sans-serif" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip unit=" pts" />} cursor={{ stroke: "rgba(201,184,122,0.15)", strokeWidth: 1 }} />
              <Line
                type="monotone"
                dataKey="pts"
                stroke="#C9B87A"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#C9B87A", stroke: "#0D1829", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Mix */}
        <div style={chartCard}>
          <p style={chartLabel}>Activity Mix</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={activityMix}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={72}
                paddingAngle={3}
                dataKey="value"
                labelLine={false}
                label={DonutLabel}
              >
                {activityMix.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v) => [`${v} days`]}
                contentStyle={tooltipStyle}
                itemStyle={{ color: "#C9B87A" }}
                labelStyle={{ display: "none" }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "4px" }}>
            {activityMix.map(({ name, color }) => (
              <div key={name} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: color }} />
                <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: "10px", color: "rgba(212,197,169,0.5)", fontWeight: 600 }}>
                  {name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Streak History */}
        <div style={chartCard}>
          <p style={chartLabel}>Active Days per Week</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={streakHistory} barSize={24} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <XAxis dataKey="week" tick={{ fill: "rgba(212,197,169,0.4)", fontSize: 10, fontFamily: "Montserrat, sans-serif" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(212,197,169,0.4)", fontSize: 10, fontFamily: "Montserrat, sans-serif" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip unit=" days" />} cursor={{ fill: "rgba(201,184,122,0.05)" }} />
              <Bar dataKey="streak" fill="rgba(201,184,122,0.65)" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ── Section 4: Personal Records ── */}
        <p style={sectionTitle}>Personal Records</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {records.map(({ label, value }) => (
            <div key={label} style={{
              backgroundColor: "#0D1829",
              border: "1px solid rgba(201,184,122,0.15)",
              borderRadius: "14px",
              padding: "16px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(201,184,122,0.1)",
                  border: "1px solid rgba(201,184,122,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <TrophyIcon />
                </div>
                <span style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "rgba(212,197,169,0.65)",
                  letterSpacing: "0.03em",
                }}>
                  {label}
                </span>
              </div>
              <span style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "22px",
                fontWeight: 700,
                color: "#C9B87A",
              }}>
                {value}
              </span>
            </div>
          ))}
        </div>

      </div>
    </AppLayout>
  );
}
