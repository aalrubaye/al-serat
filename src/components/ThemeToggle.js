'use client'

import { useEffect, useState } from 'react'

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" fill="currentColor" />
      <g
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      >
        <path d="M12 1.8v3.1" />
        <path d="M12 19.1v3.1" />
        <path d="M1.8 12h3.1" />
        <path d="M19.1 12h3.1" />
        <path d="M4.6 4.6l2.2 2.2" />
        <path d="M17.2 17.2l2.2 2.2" />
        <path d="M17.2 6.8l2.2-2.2" />
        <path d="M4.6 19.4l2.2-2.2" />
      </g>
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M15.8 2.7c-1 .3-2 .9-2.8 1.7a8.9 8.9 0 0 0 0 12.6 8.8 8.8 0 0 0 5.3 2.5 9.2 9.2 0 0 1-2.1 1.2A10 10 0 1 1 15.8 2.7Z"
        fill="currentColor"
      />
    </svg>
  )
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'light'
    setTheme(saved)
    document.documentElement.setAttribute('data-theme', saved)
  }, [])

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  return (
    <button
      type="button"
      className={`theme-toggle-pill ${theme === 'dark' ? 'is-dark' : ''}`}
      onClick={toggleTheme}
      aria-label="تبديل المظهر"
      title="تبديل المظهر"
    >
      <span className="theme-toggle-label">المظهر</span>
      <span className="theme-toggle-track">
        <span className="theme-toggle-glyph theme-toggle-glyph-sun">
          <SunIcon />
        </span>
        <span className="theme-toggle-glyph theme-toggle-glyph-moon">
          <MoonIcon />
        </span>
        <span className="theme-toggle-knob" />
      </span>
    </button>
  )
}
