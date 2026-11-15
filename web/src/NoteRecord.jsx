import React, { useEffect, useRef, useState } from 'react'
import rules from '../../data/rules.json'
import './theme.css'
import './screens.css'
import './result.css'
import { T } from './strings'
import { TopRow, getLang, patientLabel } from './ui'
import { levelOf } from './floor'
import { saveVisit, getNote } from './api'
//import crypto from 'crypto';

const num = (s) => Math.max(0, parseInt(s, 10) || 0)
const PARTS = [['years', 'year'], ['months', 'month'], ['weeks', 'week'], ['days', 'day']]

export default function NoteRecord({ visit, setVisit, goToScreen }) {
  const lang = getLang()
  const t = T[lang]
  const patient = visit.patient === 'mother' ? 'mother' : 'newborn'
  const level = levelOf(visit)
  const sname = Object.fromEntries(rules.signs.map((s) => [s.id, lang === 'hi' ? s.name_hi : s.name_en]))

  const [age, setAge] = useState({ years: '', months: '', weeks: '', days: '' })
  const [feeding, setFeeding] = useState('')
  const [other, setOther] = useState('')
  const [advised, setAdvised] = useState(t['act' + level])
  const [busy, setBusy] = useState(false)
  const cid = useRef(window.crypto.randomUUID())

  const setPart = (k) => (e) => setAge((a) => ({ ...a, [k]: e.target.value }))
  const totalDays = num(age.years) * 365 + num(age.months) * 30 + num(age.weeks) * 7 + num(age.days)
  const ageText = PARTS.map(([k, w]) => (num(age[k]) ? `${num(age[k])} ${w}${num(age[k]) > 1 ? 's' : ''}` : null)).filter(Boolean).join(' ')
  const asha = localStorage.getItem('ashaName') || ''
  const village = localStorage.getItem('village') || ''
  const when = new Date().toLocaleString('en-IN')

  // fill_record (Python) pre-fills fields from what was said and answered. Nothing is saved here.
  useEffect(() => {
    getNote({ patient, signs: visit.signs, answers: visit.answers.map(({ qid, answer }) => ({ qid, answer })), level, when }).then((r) => {
      if (r && r.record && r.record.feeding) setFeeding((f) => f || r.record.feeding)
    })
  }, [])

  const save = async () => {
    setBusy(true)
    const r = await saveVisit({
      client_id: cid.current,
      patient_type: patient,
      age_value: totalDays,
      age_unit: 'days',
      signs: visit.signs,
      answers: visit.answers,
      level,
      record: { feeding, other_concern: other, advised, referral_made: false, age_text: ageText, checklist_done: visit.checklistDone, unclear: visit.unclear, skipped: visit.skipped },
      asha_name: asha,
      village
    })
    const text = r.ok ? 'Saved the visit record' : 'Saved the visit on this phone (will send when signal returns)'
    setVisit((v) => ({
      ...v,
      clientId: cid.current,
      saveResult: { ok: r.ok, code: r.code },
      noteInput: { age, other, asha, village, when },
      doneSteps: [...(v.doneSteps || []), { text, tag: 'done' }]
    }))
    goToScreen('review')
  }

  return (
    <div className="sx-screen">
      <TopRow label={patientLabel(patient, lang)} onBack={() => goToScreen('result')} lang={lang} />
      <h1 className="sx-header sx-in" style={{ '--i': 1 }}>{t.noteHeader}</h1>
      <div className="sx-label sx-in" style={{ '--i': 2 }}>{t.noteLabel}</div>

      <div className="sx-section">{t.found}</div>
      <div className="sx-chips">
        {visit.signs.length === 0 && <span className="sx-small">{t.none}</span>}
        {visit.signs.map((id) => <span key={id} className="sx-chip">{sname[id]}</span>)}
      </div>

      <div className="sx-section">{t.age}</div>
      <div className="sx-grid">
        {PARTS.map(([k]) => (
          <label key={k} className="sx-field">
            <span className="sx-small">{t[k]}</span>
            <input className="sx-input" type="number" min="0" inputMode="numeric" value={age[k]} onChange={setPart(k)} />
          </label>
        ))}
      </div>

      <div className="sx-section">{t.feeding}</div>
      <input className="sx-input" value={feeding} onChange={(e) => setFeeding(e.target.value)} />

      <div className="sx-section">{t.other}</div>
      <input className="sx-input" value={other} onChange={(e) => setOther(e.target.value)} />

      <div className="sx-section">{t.advised}</div>
      <input className="sx-input" value={advised} onChange={(e) => setAdvised(e.target.value)} />

      <button type="button" className="sx-fill" disabled={busy || totalDays === 0} onClick={save}>{t.saveBtn}</button>
    </div>
  )
}