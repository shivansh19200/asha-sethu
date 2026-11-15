import React, { useRef, useState } from 'react'
import rules from '../../data/rules.json'
import questions from '../../data/questions.json'
import './theme.css'
import './screens.css'
import './result.css'
import { T } from './strings'
import { TopRow, getLang, patientLabel } from './ui'
import { currentLevel } from './floor'
import { saveVisit } from './api'
//import crypto from 'crypto';

export default function NoteRecord({ visit, goToScreen }) {
  const lang = getLang()
  const t = T[lang]
  const patient = visit.patient === 'mother' ? 'mother' : 'newborn'
  const level = currentLevel(visit)
  const nameEn = Object.fromEntries(rules.signs.map((s) => [s.id, s.name_en]))

  const [age, setAge] = useState('')
  const [unit, setUnit] = useState('days')
  const [feeding, setFeeding] = useState('')
  const [advised, setAdvised] = useState(t['act' + level])
  const [referral, setReferral] = useState(false)
  const [busy, setBusy] = useState(false)
  const [res, setRes] = useState(null)
  const cid = useRef(window.crypto.randomUUID())

  const asha = localStorage.getItem('ashaName') || ''
  const village = localStorage.getItem('village') || ''
  const absent = visit.answers.filter((a) => a.answer === 'no').map((a) => nameEn[a.sign])

  // Only confirmed facts go in the note. Mission 5 replaces this with write_note().
  const note = [
    'REFERRAL NOTE',
    `Patient: ${T.en[patient]}${age ? `, ${age} ${unit}` : ''}${res && res.code ? `, code ${res.code}` : ''}`,
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
      age_value: parseInt(age, 10),
      age_unit: unit,
      signs: visit.signs,
      answers: visit.answers,
      level,
      record: { feeding, advised, referral_made: referral, checklist_done: visit.checklistDone, unclear: visit.unclear, skipped: visit.skipped },
      asha_name: asha,
      village
    })
    setRes({ code: r.code, phone: !r.ok })
    setBusy(false)
  }

  const share = async () => {
    try { navigator.share ? await navigator.share({ text: note }) : await navigator.clipboard.writeText(note) } catch { /* cancelled */ }
  }

  return (
    <div className="sx-screen">
      <TopRow label={patientLabel(patient, lang)} onBack={() => goToScreen('result')} lang={lang} />
      <h1 className="sx-header sx-in" style={{ '--i': 1 }}>{t.noteHeader}</h1>
      <div className="sx-label sx-in" style={{ '--i': 2 }}>{t.noteLabel}</div>

      <fieldset disabled={!!res} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
        <div className="sx-section">{t.age}</div>
        <input className="sx-input" type="number" min="0" inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} />
        <div className="sx-seg">
          {['days', 'weeks'].map((u) => (
            <button key={u} type="button" className={`sx-btn${unit === u ? ' on' : ''}`} onClick={() => setUnit(u)}>{t[u]}</button>
          ))}
        </div>

        <div className="sx-section">{t.feeding}</div>
        <input className="sx-input" value={feeding} onChange={(e) => setFeeding(e.target.value)} />

        <div className="sx-section">{t.advised}</div>
        <input className="sx-input" value={advised} onChange={(e) => setAdvised(e.target.value)} />

        <div className="sx-section">{t.referralMade}</div>
        <div className="sx-seg">
          <button type="button" className={`sx-btn${referral ? ' on' : ''}`} onClick={() => setReferral(true)}>{t.yes}</button>
          <button type="button" className={`sx-btn${!referral ? ' on' : ''}`} onClick={() => setReferral(false)}>{t.no}</button>
        </div>
      </fieldset>

      <div className="sx-section">{t.noteText}</div>
      <pre className="sx-note">{note}</pre>

      {!res && (
        <button type="button" className="sx-fill" disabled={busy || !age} onClick={save}>{t.saveBtn}</button>
      )}
      {res && (
        <>
          <div className="sx-small" style={{ margin: '8px 0 12px' }}>
            {res.phone ? t.savedPhone : `${t.saved}. ${t.codeLbl}: ${res.code}`}
          </div>
          <button type="button" className="sx-btn" onClick={share}>{t.share}</button>
          <button type="button" className="sx-btn" onClick={() => window.print()}>{t.print}</button>
          <button type="button" className="sx-fill" onClick={() => goToScreen('home')}>{t.done}</button>
        </>
      )}
    </div>
  )
}