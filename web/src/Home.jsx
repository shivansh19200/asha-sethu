import React, { useState, useEffect } from 'react'
import rules from '../../data/rules.json'
import { careCall } from './api'
import { Logo } from './Side'
import './theme.css'
import './Home.css'
import './result.css'
import { M } from './more'
import LevelPill from './Pill'
import { getRecent, followups, patchRecent, ago, dueAt } from './recent'

const NAME = Object.fromEntries(rules.signs.map((s) => [s.id, s.name_en]))
const startVisit = (goToScreen, type) => { localStorage.removeItem('priorCode'); localStorage.removeItem('demoMode'); document.body.classList.remove('demo-on'); goToScreen('describe', type) }

export default function Home({ goToScreen }) {

  const [language, setLanguage] = useState(localStorage.getItem('language') || 'EN')

  const lang = language === 'EN' ? 'en' : 'hi'
  const m = M[lang]
  const [tick, setTick] = useState(0)
  const recent = getRecent()
  const fu = followups()
  const setFollowup = (v, status) => {
    patchRecent(v.id, status === 'reached' ? { reached: true, followup: status } : { followup: status })
    if (v.code) careCall({ action: 'followup', code: v.code, status })
    setTick(tick + 1)
  }
  const [q, setQ] = useState('')
  const [found, setFound] = useState(null)
  const lookup = async () => {
    const code = q.trim().toUpperCase()
    if (!code) return
    const d = await careCall({ action: 'history', code })
    setFound({ code, visits: d ? d.visits : null })
  }
  const begin = () => { localStorage.setItem('priorCode', found.code); goToScreen('describe', found.visits[0].patient_type) }
  // ask the server which referrals the doctor has received
  useEffect(() => {
    const codes = getRecent().filter((v) => v.code && v.sent && !v.received).map((v) => v.code)
    if (!codes.length) return
    careCall({ action: 'status', codes }).then((d) => {
      if (!d) return
      getRecent().forEach((v) => { if (d.received[v.code] && !v.received) patchRecent(v.id, { received: true }) })
      setTick((t) => t + 1)
    })
  }, [])

  const setLang = (next) => {
    setLanguage(next)
    localStorage.setItem('language', next)
  }

  return (
    <div className="home">
      {/* Top row */}
      <div className="home-top">
        <div className="home-brand"><Logo size={28} /> Asha Sethu</div>
        <div className="seg-lang" role="group" aria-label="Language">
          <button type="button" className={language === 'EN' ? 'on' : ''} onClick={() => setLang('EN')}>EN</button>
          <button type="button" className={language !== 'EN' ? 'on' : ''} onClick={() => setLang('हि')}>हि</button>
        </div>
      </div>
      <button type="button" className="home-who" onClick={() => goToScreen('settings')}>
        <i><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><circle cx="12" cy="8" r="4" /><path d="M4 21c1-5 15-5 16 0" /></svg></i>
        {m.homeAsha}
      </button>

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
          onClick={() => startVisit(goToScreen, 'mother')}
        >
          <div className="tile-illustration">
            <svg viewBox="0 0 64 64">
              <use href="#mom" />
            </svg>
          </div>
          <div className="tile-label">Mother</div>
          <div className="tile-sub">Danger signs in a mother</div>
        </button>

        <button
          className="tile"
          onClick={() => startVisit(goToScreen, 'newborn')}
        >
          <div className="tile-illustration">
            <svg viewBox="0 0 64 64">
              <use href="#baby" />
            </svg>
          </div>
          <div className="tile-label">Newborn</div>
          <div className="tile-sub">Danger signs in a baby</div>
        </button>
      </div>

      <button type="button" className="home-demo" onClick={() => goToScreen('demo')}>{m.demoLink}</button>

      {/* Follow-ups and recent visits (real data from this phone) */}
      <div className="home-bottom">
        <div className="home-followups">
          <span className="home-followups-text">{fu.open.length ? m.followups(fu.open.length) : m.allGood}</span>
          {fu.overdue.length > 0 && (
            <span className="home-overdue-pill">
              <svg className="home-overdue-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {m.overdueN(fu.overdue.length)}
            </span>
          )}
        </div>

        <div className="sx-section" style={{ marginTop: 18 }}>Seen before? Look up by patient code</div>
        <div className="sx-rowcard">
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="4-letter code" maxLength={8} style={{ flex: 1, minWidth: 0, padding: 10, fontSize: 16, textTransform: 'uppercase', border: '1px solid var(--bd)', borderRadius: 10 }} />
            <button type="button" className="sx-btn sm line" onClick={lookup}>Look up</button>
          </div>
          {found && found.visits === null && <div className="sx-small" style={{ marginTop: 8 }}>Could not reach the server.</div>}
          {found && found.visits && found.visits.length === 0 && <div className="sx-small" style={{ marginTop: 8 }}>No visits found for {found.code}.</div>}
          {found && found.visits && found.visits.length > 0 && (
            <div style={{ marginTop: 10 }}>
              {found.visits.map((v, i) => (
                <div key={i} className="sx-rowtop" style={{ marginBottom: 6 }}>
                  <span className="sx-small" style={{ textTransform: 'none', letterSpacing: 0, fontSize: 13 }}>{v.days_ago === 0 ? 'Today' : `${v.days_ago} d ago`}: {v.signs.map((x) => NAME[x] || x).join(', ') || 'no signs'}</span>
                  <LevelPill level={v.level} lang={lang} />
                </div>
              ))}
              <button type="button" className="sx-btn" onClick={begin}>Start a visit for this patient</button>
            </div>
          )}
        </div>

        <div className="sx-section" style={{ marginTop: 18 }}>{m.recent}</div>
        {recent.length === 0 && (
          <div className="sx-empty">
            <svg viewBox="0 0 64 64" aria-hidden="true"><use href="#mom" /></svg>
            <svg viewBox="0 0 64 64" aria-hidden="true" style={{ width: 56, height: 56 }}><use href="#baby" /></svg>
            <div style={{ fontWeight: 500 }}>{m.noVisits}</div>
            <div className="sx-small" style={{ textTransform: 'none', letterSpacing: 0, fontSize: 14 }}>{m.noVisitsHint}</div>
          </div>
        )}
        <div className="sx-list">
          {recent.slice(0, 8).map((v, i) => {
            const open = v.level === 'RED' || v.level === 'AMBER'
            const overdue = open && !v.reached && Date.now() > dueAt(v)
            return (
              <div key={v.id} className="sx-rowcard" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="sx-rowtop">
                  <span style={{ fontWeight: 500 }}>{m.patient[v.patient]} · {v.code ? `${m.code} ${v.code}` : m.onPhone}</span>
                  <LevelPill level={v.level} lang={lang} />
                </div>
                <div className="sx-small" style={{ textTransform: 'none', letterSpacing: 0, fontSize: 12 }}>
                  {ago(v.ts, lang)}{v.sent ? ` · ${m.referralSent}` : ''}
                </div>
                {open && (
                  <div className="sx-rowmeta">
                    {v.received && <span className="sx-chip" style={{ fontSize: 11 }}>✓ Doctor received</span>}
                    {v.reached ? (
                      <span className="sx-chip" style={{ fontSize: 11 }}>{m.reachedDone}</span>
                    ) : (
                      <>
                        {overdue && <span className="home-overdue-pill">{m.overdueN(1)}</span>}
                        {v.followup === 'could_not_go' && <span className="sx-chip" style={{ fontSize: 11 }}>Could not go</span>}
                        {v.followup === 'not_yet' && <span className="sx-chip" style={{ fontSize: 11 }}>Not yet</span>}
                        <button type="button" className="sx-btn sm line" onClick={() => setFollowup(v, 'reached')}>Reached</button>
                        <button type="button" className="sx-btn sm line" onClick={() => setFollowup(v, 'not_yet')}>Not yet</button>
                        <button type="button" className="sx-btn sm line" onClick={() => setFollowup(v, 'could_not_go')}>Could not go</button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
