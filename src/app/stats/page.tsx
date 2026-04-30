"use client";

import AppLayout from "@/components/AppLayout";
import CountdownPill from "@/components/CountdownPill";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";

// ── Mock data ────────────────────────────────────────────────────────────────
const STATS = {
  totalPoints:    142,
  rank:           1,
  streak:         8,
  longestStreak:  12,
  totalKm:        67.5,
  avgRunKm:       6.1,
};

const WEEK = {
  points:       38,
  km:           18.5,
  runs:         3,
  activityUsed: 1,
  activityMax:  2,
  restUsed:     false,
};

const RECORDS = [
  { label: "Longest Run",  value: "12.5 km", },
  { label: "Best Week",    value: "52 pts",  },
  { label: "Max Streak",   value: "12 days", },
];

const weeklyKm = [
  { week: "W25", km: 9.2  },
  { week: "W26", km: 14.5 },
  { week: "W27", km: 11.0 },
  { week: "W28", km: 18.5 },
  { week: "W29", km: 6.8  },
  { week: "W30", km: 18.5 },
];

const cumulativePoints = [
  { day: "Apr 1",  pts: 8  },
  { day: "Apr 4",  pts: 18 },
  { day: "Apr 7",  pts: 30 },
  { day: "Apr 10", pts: 44 },
  { day: "Apr 13", pts: 56 },
  { day: "Apr 16", pts: 72 },
  { day: "Apr 19", pts: 88 },
  { day: "Apr 22", pts: 102 },
  { day: "Apr 25", pts: 118 },
  { day: "Apr 28", pts: 130 },
  { day: "Apr 30", pts: 142 },
];

const activityMix = [
  { name: "Run",      value: 11, color: "#C9B87A" },
  { name: "Activity", value: 6,  color: "#4A7C59" },
  { name: "Rest",     value: 4,  color: "#2A3D5E" },
];

const streakHistory = [
  { week: "W23", streak: 2  },
  { week: "W24", streak: 5  },
  { week: "W25", streak: 7  },
  { week: "W26", streak: 12 },
  { week: "W27", streak: 9  },
  { week: "W28", streak: 4  },
  { week: "W29", streak: 6  },
  { week: "W30", streak: 8  },
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

// ── Trophy icon ───────────────────────────────────────────────────────────────
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

// ── Page ──────────────────────────────────────────────────────────────────────
export default function StatsPage() {
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
            { label: "Total Points",     value: "142",    unit: "pts"  },
            { label: "Current Rank",     value: "#1",     unit: ""     },
            { label: "Current Streak",   value: "8",      unit: " days", fire: true },
            { label: "Longest Streak",   value: "12",     unit: " days" },
            { label: "Total Distance",   value: "67.5",   unit: " km"  },
            { label: "Avg Run Distance", value: "6.1",    unit: " km"  },
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
                {fire && (
                  <span style={{ fontSize: "14px", marginLeft: "2px" }}>🔥</span>
                )}
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
            { label: "Points",    value: `${WEEK.points} pts`                                                },
            { label: "Distance",  value: `${WEEK.km} km`                                                     },
            { label: "Runs",      value: `${WEEK.runs} runs`                                                  },
            { label: "Activity",  value: `${WEEK.activityUsed}/${WEEK.activityMax} days`                      },
            { label: "Rest",      value: WEEK.restUsed ? "Used" : "Not used", muted: !WEEK.restUsed           },
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
          {/* Legend */}
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
          <p style={chartLabel}>Streak History</p>
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
          {RECORDS.map(({ label, value }) => (
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
