import React, { useEffect, useState } from 'react'
import rules from '../../data/rules.json'
import './theme.css'
import './screens.css'
import './result.css'
import { T } from './strings'
import { Icon, TopRow, SignRow, getLang, patientLabel } from './ui'
//import { headers } from 'next/headers';

export default function Confirm({ visit, setVisit, goToScreen }) {
  const lang = getLang()
  const t = T[lang]
  const patient = visit.patient === 'mother' ? 'mother' : 'newborn'
  const all = rules.signs.filter((s) => s.patient === patient)
  const byId = Object.fromEntries(all.map((s) => [s.id, s]))
  const name = (s) => (lang === 'hi' ? s.name_hi : s.name_en)
  const [showAll, setShowAll] = useState(false)
  const [busy, setBusy] = useState(false)

  // Typed signs are ADDED to ticked signs; text never removes a tick.
  // If the server fails, the text counts as unclear, so it can never end up GREEN by accident.
  useEffect(() => {
    const text = visit.text.trim()
    if (visit.understoodText === text) return
    if (!text) { setVisit((v) => ({ ...v, understoodText: '', negated: [], unclear: false })); return }
    let live = true
    setBusy(true)
    fetch('/api/understand', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, patient }) })
      .then((r) => { if (!r.ok) throw new Error('bad'); return r.json() })
      .catch(() => ({ signs: [], negated: [], suggested: [], unclear: true }))
      .then((u) => {
        if (!live) return
        setVisit((v) => ({
          ...v,
          signs: Array.from(new Set([...v.signs, ...u.signs])),
          suggested: (u.suggested || []).filter((id) => !v.signs.includes(id) && !u.signs.includes(id)),
          negated: u.negated,
          unclear: u.unclear,
          understoodText: text
        }))
        if (u.unclear && u.signs.length === 0 && !(u.suggested || []).length) setShowAll(true)
        setBusy(false)
      })
    return () => { live = false }
  }, [visit.text])

  const remove = (id) => setVisit((v) => ({ ...v, signs: v.signs.filter((x) => x !== id) }))
  const accept = (id) => setVisit((v) => ({ ...v, signs: v.signs.includes(id) ? v.signs : [...v.signs, id], suggested: v.suggested.filter((x) => x !== id) }))
  const dismiss = (id) => setVisit((v) => ({ ...v, suggested: v.suggested.filter((x) => x !== id) }))
  const pending = (visit.suggested || []).filter((id) => byId[id])
  const add = (id) => setVisit((v) => ({ ...v, signs: v.signs.includes(id) ? v.signs : [...v.signs, id] }))
  const confirm = () => { setVisit((v) => ({ ...v, confirmed: true })); goToScreen('question') }
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

      {pending.length > 0 && (
        <>
          <div className="sx-section">{t.tagAI}</div>
          <div className="sx-chips">
            {pending.map((id) => (
              <span key={id} className="sx-chip sx-suggest">
                {name(byId[id])}
                <span className="sx-tag"><Icon name="bulb" size={14} />{t.tagAI}</span>
                <button type="button" aria-label={t.add} onClick={() => accept(id)}><Icon name="plus" size={14} /></button>
                <button type="button" aria-label={t.remove} onClick={() => dismiss(id)}><Icon name="x" size={14} /></button>
              </span>
            ))}
          </div>
        </>
      )}

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

            <button type="button" className="sx-fill" disabled={busy || pending.length > 0} onClick={confirm}>{t.confirm}</button>
    </div>
  )
}