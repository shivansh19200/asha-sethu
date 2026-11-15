import React, { useState } from 'react'
import path from 'path';
import './theme.css'
import './Home.css'

export default function Home({ goToScreen }) {

  const [language, setLanguage] = useState(localStorage.getItem('language') || 'EN')

  const toggleLanguage = () => {
    const next = language === 'EN' ? 'हि' : 'EN'
    setLanguage(next)
    localStorage.setItem('language', next)
  }

  return (
    <div className="home">
      {/* Top row */}
      <div className="home-top">
        <div className="home-top-left">
          <div className="home-village-label" style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => goToScreen('settings')}>ASHA name and village</div>
        </div>
        <button
          className="language-toggle"
          onClick={toggleLanguage}
        >
          EN | हि
        </button>
      </div>

      {/* Header and label */}
      <div className="home-header-section">
        <h1 className="home-header">Start a visit</h1>
        <div className="home-label">Who is the visit for?</div>
      </div>

      {/* Hero panel */}
      <div className="home-hero">
        <svg
          width="0"
          height="0"
          style={{ position: 'absolute' }}
          aria-hidden="true"
        >
          <symbol id="baby" viewBox="0 0 64 64">
            <path d="M8 64c0-14 10-22 24-22s24 8 24 22z" fill="var(--pri)" />
            <circle cx="32" cy="30" r="17" fill="#E0AE86" />
            <path
              d="M16 27c2-11 10-15 17-14 8 1 13 7 14 14-5-4-10-6-15-6-6 0-11 2-16 6z"
              fill="#2B2118"
            />
            <circle cx="26" cy="33" r="1.8" fill="#2B2118" />
            <circle cx="38" cy="33" r="1.8" fill="#2B2118" />
            <path
              d="M28 40q4 3 8 0"
              stroke="#8A4B2F"
              strokeWidth="1.8"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="22" cy="38" r="3" fill="#E58E7A" opacity="0.5" />
            <circle cx="42" cy="38" r="3" fill="#E58E7A" opacity="0.5" />
          </symbol>
          <symbol id="mom" viewBox="0 0 64 64">
            <path d="M6 64c0-15 11-23 26-23s26 8 26 23z" fill="var(--pri)" />
            <rect x="27" y="38" width="10" height="9" rx="4" fill="#D9A57A" />
            <circle cx="32" cy="9" r="7" fill="#2B2118" />
            <circle cx="32" cy="26" r="17" fill="#2B2118" />
            <circle cx="32" cy="30" r="14" fill="#D9A57A" />
            <circle cx="26" cy="30" r="1.7" fill="#2B2118" />
            <circle cx="38" cy="30" r="1.7" fill="#2B2118" />
            <path
              d="M27 37q5 4 10 0"
              stroke="#8A4B2F"
              strokeWidth="1.8"
              fill="none"
              strokeLinecap="round"
            />
          </symbol>
        </svg>

        <svg className="home-hero-svg" viewBox="0 0 234 112">
          <circle cx="200" cy="30" r="40" fill="var(--ring)" opacity="0.45" />
          <use href="#mom" x="44" y="22" width="92" height="92" />
          <use href="#baby" x="118" y="56" width="60" height="60" />
        </svg>
      </div>

      {/* Tiles */}
      <div className="home-tiles">
        <button
          className="tile"
          onClick={() => goToScreen('describe', 'mother')}
        >
          <div className="tile-illustration">
            <svg viewBox="0 0 64 64">
              <use href="#mom" />
            </svg>
          </div>
          <div className="tile-label">Mother</div>
        </button>

        <button
          className="tile"
          onClick={() => goToScreen('describe', 'newborn')}
        >
          <div className="tile-illustration">
            <svg viewBox="0 0 64 64">
              <use href="#baby" />
            </svg>
          </div>
          <div className="tile-label">Newborn</div>
        </button>
      </div>

      {/* Bottom row */}
      <div className="home-bottom">
        <div className="home-followups">
          <span className="home-followups-text">2 follow-ups</span>
          <span className="home-overdue-pill">
            <svg className="home-overdue-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            1 overdue
          </span>
        </div>
      </div>
    </div>
  )
}
