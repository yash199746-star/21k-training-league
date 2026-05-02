"use client"
import { useState, useEffect } from 'react'

export default function CountdownPill() {
  const [days, setDays] = useState<number | null>(null)

  useEffect(() => {
    const raceDate = new Date('2026-09-13')
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const diff = Math.ceil((raceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    setDays(diff)
  }, [])

  if (days === null) return null

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        backgroundColor: '#C9B87A',
        color: '#0D1829',
        fontFamily: 'Montserrat, sans-serif',
        fontWeight: 700,
        fontSize: '12px',
        letterSpacing: '0.15em',
        padding: '8px 20px',
        borderRadius: '999px',
        display: 'inline-block',
      }}>
        {days} DAYS TO RACE
      </div>
      <p style={{
        fontFamily: 'Montserrat, sans-serif',
        fontSize: '10px',
        letterSpacing: '0.15em',
        color: '#D4C5A9',
        margin: '6px 0 0',
        textAlign: 'center',
      }}>
        LADAKH HALF MARATHON · 13 SEPT 2026
      </p>
    </div>
  )
}
