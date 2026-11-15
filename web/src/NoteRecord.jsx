import React, { useRef, useState } from 'react'
import rules from '../../data/rules.json'
import './theme.css'
import './screens.css'
import './result.css'
import { T } from './strings'
import { Icon, TopRow, getLang, patientLabel } from './ui'
import { currentLevel } from './floor'
import { saveVisit } from './api'
//import crypto from 'crypto';

const num = (s) => Math.max(0, parseInt(s, 10) || 0)
const PARTS = [['years', 'year'], ['months', 'month'], ['weeks', 'week'], ['days', 'day']]

export default function NoteRecord({ visit, setVisit, goToScreen }) {
  const lang = getLang()
  const t = T[lang]
  const patient = visit.patient === 'mother' ? 'mother' : 'newborn'
  const level = currentLevel(visit)
  const nameEn = Object.fromEntries(rules.signs.map((s) => [s.id, s.name_en]))

  const [age, setAge] = useState({ years: '', months: '', weeks: '', days: '' })
  const [feeding, setFeeding] = useState('')
  const [advised, setAdvised] = useState(t['act' + level])
  const [referral, setReferral] = useState(false)
  const [busy, setBusy] = useState(false)
  const cid = useRef(window.crypto.randomUUID())

  const setPart = (k) => (e) => setAge((a) => ({ ...a, [k]: e.target.value }))
  const totalDays = num(age.years) * 365 + num(age.months) * 30 + num(age.weeks) * 7 + num(age.days)
  const ageText = PARTS.map(([k, w]) => (num(age[k]) ? `${num(age[k])} ${w}${num(age[k]) > 1 ? 's' : ''}` : null)).filter(Boolean).join(' ')

  const asha = localStorage.getItem('ashaName') || ''
  const village = localStorage.getItem('village') || ''
  const absent = visit.answers.filter((a) => a.answer === 'no').map((a) => nameEn[a.sign])

  // Only confirmed facts go in the note. Mission 5 replaces this with write_note().
  const buildNote = (code) => [
    'REFERRAL NOTE',
    `Patient: ${T.en[patient]}${ageText ? `, ${ageText}` : ''}${code ? `, code ${code}` : ''}`,
    `Danger level: ${T.en['lv' + level]}`,
    `Signs present: ${visit.signs.map((id) => nameEn[id]).join('; ') || 'none'}`,
    `Asked and absent: ${absent.join('; ') || 'none'}`,
    `Advice: ${advised}`,
    `ASHA: ${asha || '-'}, ${village || '-'}`,
    `Date: ${new Date().toLocaleString('en-IN')}`,
    'This is an alert aid, not a diagnosis.'
  ].join('\n')

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
      record: { feeding, advised, referral_made: referral, age_text: ageText, checklist_done: visit.checklistDone, unclear: visit.unclear, skipped: visit.skipped },
      asha_name: asha,
      village
    })
    setVisit((v) => ({ ...v, saveResult: { ok: r.ok, code: r.code, note: buildNote(r.code) } }))
    goToScreen('saved')
  }

  const yn = (val, label) => (
    <button type="button" className={`sx-btn${referral === val ? ' on' : ''}`} onClick={() => setReferral(val)}>
      {referral === val && <Icon name="check" size={18} />}{label}
    </button>
  )

  return (
    <div className="sx-screen">
      <TopRow label={patientLabel(patient, lang)} onBack={() => goToScreen('result')} lang={lang} />
      <h1 className="sx-header sx-in" style={{ '--i': 1 }}>{t.noteHeader}</h1>
      <div className="sx-label sx-in" style={{ '--i': 2 }}>{t.noteLabel}</div>

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

      <div className="sx-section">{t.advised}</div>
      <input className="sx-input" value={advised} onChange={(e) => setAdvised(e.target.value)} />

      <div className="sx-section">{t.referralMade}</div>
      <div className="sx-seg">{yn(true, t.yes)}{yn(false, t.no)}</div>

      <div className="sx-section">{t.noteText}</div>
      <pre className="sx-note">{buildNote(null)}</pre>

      <button type="button" className="sx-fill" disabled={busy || totalDays === 0} onClick={save}>{t.saveBtn}</button>
    </div>
  )
}