"use client";

import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import CountdownPill from "@/components/CountdownPill";

// ── Mock data ────────────────────────────────────────────────────────────────
const CHALLENGE = {
  week:        12,
  title:       "The Altitude Grind",
  description: "Complete 3 runs of at least 5km each before Sunday midnight",
  badge:       "3 RUNS · 5KM EACH",
  createdBy:   "Yash",
  deadline:    "Ends Sunday 11:59 PM",
  bonus:       "+10 pts on completion · +5 bonus if all finish",
  target:      3,
};

const PARTICIPANTS = [
  { name: "Yash",  initials: "Y", progress: 2, target: 3, completed: false, points: 0  },
  { name: "Arjun", initials: "A", progress: 3, target: 3, completed: true,  points: 10 },
  { name: "Priya", initials: "P", progress: 1, target: 3, completed: false, points: 0  },
];

const PAST_CHALLENGES = [
  { week: 11, title: "The Long One",       completedOf: 3, total: 3 },
  { week: 10, title: "Consistency Week",   completedOf: 2, total: 3 },
  { week: 9,  title: "Speed Work",         completedOf: 3, total: 3 },
];

const CHALLENGE_TYPES = [
  "Total Distance",
  "Number of Runs",
  "Single Run Distance",
  "Activity Streak",
  "Activity Type",
];

const TARGET_UNITS: Record<string, string> = {
  "Total Distance":      "km",
  "Number of Runs":      "runs",
  "Single Run Distance": "km",
  "Activity Streak":     "days",
  "Activity Type":       "sessions",
};

const IS_CHALLENGE_MASTER = true;

// ── Icons ────────────────────────────────────────────────────────────────────
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

// ── Progress row ─────────────────────────────────────────────────────────────
function ProgressRow({ name, initials, progress, target, completed, points }: {
  name: string; initials: string; progress: number;
  target: number; completed: boolean; points: number;
}) {
  const pct = Math.min((progress / target) * 100, 100);
  return (
    <div style={{
      backgroundColor: "#0D1829",
      border: `1px solid ${completed ? "rgba(74,124,89,0.3)" : "rgba(212,197,169,0.08)"}`,
      borderRadius: "14px",
      padding: "14px 16px",
      marginBottom: "10px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
        {/* Avatar */}
        <div style={{
          width: "38px",
          height: "38px",
          borderRadius: "50%",
          backgroundColor: "rgba(201,184,122,0.1)",
          border: `1.5px solid ${completed ? "rgba(74,124,89,0.5)" : "rgba(201,184,122,0.25)"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Montserrat, sans-serif",
          fontSize: "14px",
          fontWeight: 700,
          color: "#C9B87A",
          flexShrink: 0,
        }}>
          {initials}
        </div>

        {/* Name + status */}
        <div style={{ flex: 1 }}>
          <p style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: "14px",
            fontWeight: 600,
            color: "#F5F2ED",
            margin: 0,
          }}>
            {name}
          </p>
          <p style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: "11px",
            color: "rgba(212,197,169,0.45)",
            margin: "2px 0 0",
          }}>
            {progress} of {target} runs completed
          </p>
        </div>

        {/* Badges */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
          {completed && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              backgroundColor: "rgba(74,124,89,0.15)",
              border: "1px solid rgba(74,124,89,0.35)",
              borderRadius: "999px",
              padding: "3px 9px",
            }}>
              <CheckIcon />
              <span style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: "10px",
                fontWeight: 700,
                color: "#4A7C59",
                letterSpacing: "0.06em",
              }}>
                COMPLETED
              </span>
            </div>
          )}
          {points > 0 && (
            <span style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: "11px",
              fontWeight: 700,
              color: "#C9B87A",
            }}>
              +{points} pts
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        height: "6px",
        backgroundColor: "rgba(212,197,169,0.1)",
        borderRadius: "999px",
        overflow: "hidden",
      }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          backgroundColor: completed ? "#4A7C59" : "#C9B87A",
          borderRadius: "999px",
          transition: "width 0.4s ease",
        }} />
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ChallengePage() {
  const [showForm,    setShowForm]    = useState(false);
  const [formTitle,   setFormTitle]   = useState("");
  const [formDesc,    setFormDesc]    = useState("");
  const [formType,    setFormType]    = useState("Total Distance");
  const [formTarget,  setFormTarget]  = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formErrors,  setFormErrors]  = useState<string[]>([]);

  function handleSubmitChallenge() {
    const errs: string[] = [];
    if (!formTitle.trim())  errs.push("Please enter a challenge title.");
    if (!formDesc.trim())   errs.push("Please enter a description.");
    if (!formTarget || parseFloat(formTarget) <= 0) errs.push("Please enter a valid target.");
    if (errs.length) { setFormErrors(errs); return; }
    setFormErrors([]);
    console.log("Challenge submitted:", {
      title: formTitle, description: formDesc,
      type: formType, target: parseFloat(formTarget),
    });
    setFormSubmitted(true);
  }

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
            Weekly Challenge
          </h1>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <CountdownPill />
          </div>
        </div>

        {/* ── Section 1: Active Challenge Card ── */}
        <p style={sectionTitle}>Active Challenge</p>
        <div style={{
          backgroundColor: "#0D1829",
          border: "1.5px solid rgba(201,184,122,0.35)",
          borderRadius: "20px",
          padding: "22px 20px",
          marginBottom: "28px",
          boxShadow: "0 6px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(201,184,122,0.06)",
        }}>
          {/* Week label */}
          <p style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: "10px",
            fontWeight: 700,
            color: "rgba(212,197,169,0.5)",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            margin: "0 0 10px",
          }}>
            Week {CHALLENGE.week} Challenge
          </p>

          {/* Title */}
          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "24px",
            fontWeight: 700,
            color: "#F5F2ED",
            margin: "0 0 10px",
            lineHeight: 1.2,
          }}>
            {CHALLENGE.title}
          </h2>

          {/* Description */}
          <p style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: "13px",
            color: "rgba(212,197,169,0.65)",
            margin: "0 0 14px",
            lineHeight: 1.5,
          }}>
            {CHALLENGE.description}
          </p>

          {/* Badge row */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "14px" }}>
            <span style={{
              backgroundColor: "rgba(201,184,122,0.12)",
              border: "1px solid rgba(201,184,122,0.3)",
              borderRadius: "999px",
              padding: "5px 12px",
              fontFamily: "Montserrat, sans-serif",
              fontSize: "10px",
              fontWeight: 700,
              color: "#C9B87A",
              letterSpacing: "0.1em",
            }}>
              {CHALLENGE.badge}
            </span>
          </div>

          {/* Divider */}
          <div style={{ borderTop: "1px solid rgba(212,197,169,0.08)", margin: "0 0 12px" }} />

          {/* Meta row */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
            <CrownIcon />
            <span style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: "11px",
              color: "rgba(212,197,169,0.55)",
            }}>
              Set by <span style={{ color: "#C9B87A", fontWeight: 600 }}>{CHALLENGE.createdBy}</span> · Challenge Master
            </span>
          </div>
          <p style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: "11px",
            color: "rgba(212,197,169,0.45)",
            margin: "0 0 8px",
          }}>
            {CHALLENGE.deadline}
          </p>
          <p style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: "11px",
            fontWeight: 600,
            color: "#4A7C59",
            margin: 0,
          }}>
            {CHALLENGE.bonus}
          </p>
        </div>

        {/* ── Section 2: Live Progress ── */}
        <p style={sectionTitle}>Live Progress</p>
        <div style={{ marginBottom: "28px" }}>
          {PARTICIPANTS.map(p => (
            <ProgressRow key={p.name} {...p} />
          ))}
        </div>

        {/* ── Section 3: Challenge Master Panel ── */}
        {IS_CHALLENGE_MASTER && (
          <div style={{ marginBottom: "28px" }}>
            <p style={sectionTitle}>Your Challenge Master Duties</p>
            <div style={{
              backgroundColor: "#0D1829",
              border: "1px solid rgba(201,184,122,0.2)",
              borderRadius: "16px",
              padding: "18px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <CrownIcon />
                <span style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#C9B87A",
                }}>
                  You are Challenge Master for Week 13
                </span>
              </div>
              <p style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: "12px",
                color: "rgba(212,197,169,0.5)",
                margin: "0 0 16px",
              }}>
                Submit next week&apos;s challenge before Sunday 11:59 PM
              </p>

              {!formSubmitted ? (
                <button
                  onClick={() => setShowForm(v => !v)}
                  style={{
                    width: "100%",
                    backgroundColor: showForm ? "rgba(201,184,122,0.12)" : "#C9B87A",
                    color: showForm ? "#C9B87A" : "#0D1829",
                    fontFamily: "Montserrat, sans-serif",
                    fontWeight: 700,
                    fontSize: "12px",
                    letterSpacing: "0.15em",
                    padding: "14px",
                    borderRadius: "12px",
                    border: showForm ? "1px solid rgba(201,184,122,0.3)" : "none",
                    cursor: "pointer",
                  }}
                >
                  {showForm ? "CANCEL" : "CREATE NEXT CHALLENGE"}
                </button>
              ) : (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  backgroundColor: "rgba(74,124,89,0.1)",
                  border: "1px solid rgba(74,124,89,0.3)",
                  borderRadius: "12px",
                  padding: "12px 14px",
                }}>
                  <CheckIcon />
                  <span style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#4A7C59",
                  }}>
                    Challenge submitted for Week 13
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Section 4: Create Challenge Form ── */}
        {showForm && !formSubmitted && (
          <div style={{
            backgroundColor: "#0D1829",
            border: "1px solid rgba(212,197,169,0.12)",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "28px",
          }}>
            <p style={{ ...sectionTitle, marginBottom: "18px" }}>New Challenge — Week 13</p>

            {/* Title */}
            <div style={{ marginBottom: "16px" }}>
              <label style={formLabelStyle}>Challenge Title</label>
              <input
                type="text"
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                placeholder="e.g. The Summit Push"
                style={inputStyle}
              />
            </div>

            {/* Description */}
            <div style={{ marginBottom: "16px" }}>
              <label style={formLabelStyle}>Description</label>
              <textarea
                value={formDesc}
                onChange={e => setFormDesc(e.target.value)}
                placeholder="Describe the challenge..."
                rows={3}
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  lineHeight: 1.5,
                  fontFamily: "Montserrat, sans-serif",
                }}
              />
            </div>

            {/* Type */}
            <div style={{ marginBottom: "16px" }}>
              <label style={formLabelStyle}>Challenge Type</label>
              <select
                value={formType}
                onChange={e => setFormType(e.target.value)}
                style={{
                  ...inputStyle,
                  appearance: "none",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(212,197,169,0.5)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 14px center",
                  cursor: "pointer",
                  colorScheme: "dark" as React.CSSProperties["colorScheme"],
                }}
              >
                {CHALLENGE_TYPES.map(t => (
                  <option key={t} value={t} style={{ backgroundColor: "#0D1829" }}>{t}</option>
                ))}
              </select>
            </div>

            {/* Target */}
            <div style={{ marginBottom: "20px" }}>
              <label style={formLabelStyle}>
                Target ({TARGET_UNITS[formType]})
              </label>
              <input
                type="number"
                value={formTarget}
                onChange={e => setFormTarget(e.target.value)}
                placeholder={`e.g. ${formType === "Total Distance" ? "30" : formType === "Number of Runs" ? "4" : "5"}`}
                min="0"
                step={formType.includes("Distance") ? "0.5" : "1"}
                style={inputStyle}
              />
            </div>

            {/* Errors */}
            {formErrors.length > 0 && (
              <div style={{
                backgroundColor: "rgba(220,90,90,0.08)",
                border: "1px solid rgba(220,90,90,0.25)",
                borderRadius: "10px",
                padding: "12px 14px",
                marginBottom: "16px",
              }}>
                {formErrors.map((e, i) => (
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
              onClick={handleSubmitChallenge}
              style={{
                width: "100%",
                backgroundColor: "#C9B87A",
                color: "#0D1829",
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 700,
                fontSize: "13px",
                letterSpacing: "0.18em",
                padding: "16px",
                borderRadius: "12px",
                border: "none",
                cursor: "pointer",
              }}
            >
              SUBMIT CHALLENGE
            </button>
          </div>
        )}

        {/* ── Section 5: Past Challenges ── */}
        <p style={sectionTitle}>Past Challenges</p>
        <div>
          {PAST_CHALLENGES.map(({ week, title, completedOf, total }) => {
            const allDone = completedOf === total;
            return (
              <div key={week} style={{
                backgroundColor: "#0D1829",
                border: "1px solid rgba(212,197,169,0.08)",
                borderRadius: "14px",
                padding: "14px 16px",
                marginBottom: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}>
                <div>
                  <span style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: "9px",
                    fontWeight: 700,
                    color: "rgba(212,197,169,0.35)",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    display: "block",
                    marginBottom: "4px",
                  }}>
                    Week {week}
                  </span>
                  <p style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "#F5F2ED",
                    margin: 0,
                  }}>
                    {title}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  {allDone && <CheckIcon color="#4A7C59" />}
                  <span style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: allDone ? "#4A7C59" : "rgba(212,197,169,0.45)",
                  }}>
                    {allDone ? "All completed" : `${completedOf} of ${total} completed`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </AppLayout>
  );
}
