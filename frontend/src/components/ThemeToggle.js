'use client'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'dark'
    setTheme(saved)
    document.documentElement.setAttribute('data-theme', saved)
  }, [])

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  return (
    <button onClick={toggle} style={{
      background: 'var(--bg-3)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      padding: '6px 12px',
      cursor: 'pointer',
      fontSize: 13,
      color: 'var(--text-secondary)',
      fontFamily: 'var(--font-mono)',
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      transition: 'all 0.15s',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-blue)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      {theme === 'dark' ? '☀ Light' : '☾ Dark'}
    </button>
  )
}