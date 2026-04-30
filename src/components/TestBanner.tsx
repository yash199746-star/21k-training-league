"use client"
export default function TestBanner() {
  if (process.env.NEXT_PUBLIC_IS_TEST_ENV !== 'true') return null
  return (
    <div style={{
      background: '#E8A020',
      color: '#0D1829',
      textAlign: 'center',
      padding: '6px',
      fontFamily: 'Montserrat, sans-serif',
      fontWeight: 700,
      fontSize: '11px',
      letterSpacing: '0.15em',
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      zIndex: 9999
    }}>
      ⚠ TEST ENVIRONMENT — DATA WILL BE RESET
    </div>
  )
}
