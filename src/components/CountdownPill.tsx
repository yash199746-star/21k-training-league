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
    <div style={{
      backgroundColor: '#E8A020',
      color: '#0D1829',
      fontFamily: 'Montserrat, sans-serif',
      fontWeight: 700,
      fontSize: '12px',
      letterSpacing: '0.15em',
      padding: '8px 20px',
      borderRadius: '999px',
      display: 'inline-block'
    }}>
      {days} DAYS TO LEH
    </div>
  )
}
