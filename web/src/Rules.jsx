import React from 'react'
import rules from '../../data/rules.json'
import './theme.css'
import './screens.css'
import './result.css'
import { TopRow, getLang } from './ui'
import { M } from './more'
import LevelPill from './Pill'
import { X } from './i18n'

export default function Rules({ goToScreen }) {
  const lang = getLang()
  const m = M[lang]
  const x = X[lang]
  const groups = [['newborn', m.patient.newborn], ['mother', m.patient.mother]]
  return (
    <div className="sx-screen">
      <TopRow label="" onBack={() => goToScreen('settings')} lang={lang} />
      <h1 className="sx-header sx-in" style={{ '--i': 1 }}>{m.rulesHeader}</h1>
      <div className="sx-label sx-in" style={{ '--i': 2 }}>{m.version} {rules.version}</div>
      <div className="sx-small" style={{ textTransform: 'none', letterSpacing: 0, fontSize: 14, marginBottom: 6 }}>{lang === 'hi' && rules.status_hi ? rules.status_hi : rules.status}</div>
      {x.srcNote && <div className="sx-small" style={{ textTransform: 'none', letterSpacing: 0, fontSize: 13, marginBottom: 6 }}>{x.srcNote}</div>}
      {groups.map(([p, title]) => (
        <div key={p}>
          <div className="sx-section">{title}</div>
          <div className="sx-list">
            {rules.signs.filter((s) => s.patient === p).map((s) => (
              <div key={s.id} className="sx-rowcard">
                <div className="sx-rowtop">
                  <span style={{ fontWeight: 500 }}>{lang === 'hi' ? s.name_hi : s.name_en}</span>
                  <LevelPill level={s.level} lang={lang} />
                </div>
                <div className="sx-small" style={{ textTransform: 'none', letterSpacing: 0, fontSize: 12 }}>
                  {m.source}: {s.source}{s.source_url ? ' ' : ''}
                  {s.source_url && <a href={s.source_url} target="_blank" rel="noreferrer" style={{ color: 'var(--acc)' }}>{x.link}</a>}
                </div>
                <span className="sx-chip" style={{ fontSize: 11, marginTop: 6 }}>{s.review_status === 'reviewed' ? m.reviewed : m.pending}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
