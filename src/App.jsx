import React, { useState } from 'react'
import Button from './components/Button'
import Tile from './components/Tile'

export default function App() {
  const [lang, setLang] = useState('EN')
  const [themeDark, setThemeDark] = useState(false)

  React.useEffect(() => {
    document.documentElement.classList.toggle('theme-dark', themeDark)
  }, [themeDark])

  return (
    <div className="app-shell">
      <div className="top-row">
        <div className="lang-switch" role="tablist" aria-label="language switch">
          <button
            className={`lang-btn ${lang === 'EN' ? 'active' : ''}`}
            onClick={() => setLang('EN')}
            aria-pressed={lang === 'EN'}
          >
            EN
          </button>
          <button
            className={`lang-btn ${lang === 'HI' ? 'active' : ''}`}
            onClick={() => setLang('HI')}
            aria-pressed={lang === 'HI'}
          >
            हि
          </button>
        </div>
      </div>

      <div className="header">Start a visit</div>
      <div className="label">Who is the visit for?</div>

      <div className="hero-row">
        <div className="hero-figure">
          <svg viewBox="0 0 112 112" className="hero-svg" aria-label="Mother and baby illustration">
            <circle cx="40" cy="30" r="10" fill="var(--sage-ink)" opacity="0.8" />
            <path d="M 30 42 L 30 55 L 50 55 L 50 42" stroke="var(--sage-ink)" strokeWidth="2" fill="none" opacity="0.8" />
            <circle cx="70" cy="35" r="8" fill="var(--sage-ink)" opacity="0.6" />
            <path d="M 62 45 L 62 55 L 78 55 L 78 45" stroke="var(--sage-ink)" strokeWidth="1.5" fill="none" opacity="0.6" />
          </svg>
        </div>
      </div>

      <div className="tiles-row">
        <Tile title="Mother" subtitle="Postpartum / ANC" />
        <Tile title="Newborn" subtitle="Baby" />
      </div>

      <div className="follow-row">
        <div className="follow-left">2 follow-ups</div>
        <div className="overdue-pill">1 overdue</div>
      </div>

      <div style={{height: 20}} />

    </div>
  )
}
