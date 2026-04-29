"use client";

import { useState, useEffect } from "react";

const LEH_DATE = new Date("2026-09-13T00:00:00");

export default function CountdownPill() {
  const [days, setDays] = useState(0);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = LEH_DATE.getTime() - today.getTime();
    setDays(Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24))));
  }, []);

  return (
    <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-saffron">
      <span className="text-navy-deep text-xs font-bold tracking-widest uppercase font-sans">
        {days} DAYS TO LEH
      </span>
    </div>
  );
}
