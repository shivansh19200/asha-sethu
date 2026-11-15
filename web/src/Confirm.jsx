import React, { useState } from 'react'
import rules from '../../data/rules.json'
import './theme.css'
import './screens.css'
import { T } from './strings'
import { Icon, TopRow, SignRow, getLang, patientLabel } from './ui'

// Mission 3 replaces this with the real understanding step (api/understand.py).
// Until then: any typed text we could not turn into signs counts as unclear,
// so the result can never become GREEN by accident.
function understand(text) {
  return { signs: [], unclear: text.trim().length > 0 }
}

export default function Confirm({ visit, setVisit, goToScreen }) {
  const lang = getLang()
  const t = T[lang]
  const patient = visit.patient === 'mother' ? 'mother' : 'newborn'
  const all = rules.signs.filter((s) => s.patient === patient)
  const byId = Object.fromEntries(all.map((s) => [s.id, s]))
  const name = (s) => (lang === 'hi' ? s.name_hi : s.name_en)
  const [showAll, setShowAll] = useState(false)

  const remove = (id) => setVisit((v) => ({ ...v, signs: v.signs.filter((x) => x !== id) }))
  const add = (id) => setVisit((v) => ({ ...v, signs: v.signs.includes(id) ? v.signs : [...v.signs, id] }))

  const confirm = () => {
    const u = understand(visit.text)
    setVisit((v) => ({
      ...v,
      signs: Array.from(new Set([...v.signs, ...u.signs])),
      unclear: u.unclear,
      confirmed: true
    }))
    goToScreen('question')
  }

  const addable = all.filter((s) => !visit.signs.includes(s.id))

  return (
    <div className="sx-screen">
      <TopRow label={patientLabel(patient, lang)} onBack={() => goToScreen('describe')} lang={lang} />

      <h1 className="sx-header sx-in" style={{ '--i': 1 }}>{t.confirmHeader}</h1>
      <div className="sx-label sx-in" style={{ '--i': 2 }}>{t.confirmLabel}</div>

      {visit.text && (
        <>
          <div className="sx-section sx-in" style={{ '--i': 3 }}>{t.heard}</div>
          <div className="sx-transcript">{visit.text}</div>
        </>
      )}

      <div className="sx-section sx-in" style={{ '--i': 4 }}>{t.found}</div>
      <div className="sx-chips">
        {visit.signs.length === 0 && <span className="sx-small">{t.none}</span>}
        {visit.signs.map((id) => byId[id] && (
          <span key={id} className="sx-chip">
            {name(byId[id])}
            <button type="button" aria-label={t.remove} onClick={() => remove(id)}>
              <Icon name="x" size={14} />
            </button>
          </span>
        ))}
      </div>

      <button type="button" className="sx-btn" onClick={() => setShowAll(!showAll)}>
        <Icon name="plus" size={20} /> {t.add}
      </button>

      {showAll && (
        <div className="sx-rows">
          {addable.map((s, i) => (
            <SignRow key={s.id} index={i} label={name(s)} checked={false} onToggle={() => add(s.id)} />
          ))}
        </div>
      )}

      <button type="button" className="sx-fill" onClick={confirm}>{t.confirm}</button>
    </div>
  )
}
