import React, { useEffect, useState } from 'react'
import { patchRecent } from './recent'
import './theme.css'
import './screens.css'
import './result.css'
import { T } from './strings'
import { TopRow, getLang, patientLabel } from './ui'
import { levelOf } from './floor'
import { getNote, sendReferral } from './api'
import { localNote } from './noteLocal'

export default function ReviewSend({ visit, setVisit, goToScreen }) {
  const lang = getLang()
  const t = T[lang]
  const patient = visit.patient === 'mother' ? 'mother' : 'newborn'
  const level = levelOf(visit)
  const ni = visit.noteInput || {}
  const sr = visit.saveResult || {}
  const needsReferral = level === 'RED' || level === 'AMBER'
  const [notes, setNotes] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const payload = {
      patient, signs: visit.signs, answers: visit.answers.map(({ qid, answer }) => ({ qid, answer })), level,
      age: ni.age || {}, other_concern: ni.other, asha_name: ni.asha, village: ni.village, when: ni.when, code: sr.code
    }
    getNote(payload).then((r) => setNotes(r ? { en: r.note_en, hi: r.note_hi } : { en: localNote({ ...payload, age: payload.age, asha: ni.asha, village: ni.village }), hi: null }))
  }, [])

  const text = notes ? (lang === 'hi' && notes.hi ? notes.hi : notes.en) : ''

  // Nothing is sent before this tap.
  const send = async () => {
    setBusy(true)
    const r = await sendReferral(visit.clientId)
    if (r.ok) patchRecent(visit.clientId, { sent: true })
    const step = r.ok ? 'Referral sent' : 'Referral waiting for signal. It will send automatically.'
    setVisit((v) => ({ ...v, noteText: notes, sendResult: { sent: true, ok: r.ok }, doneSteps: [...(v.doneSteps || []), { text: step, tag: 'done' }] }))
    goToScreen('saved')
  }
  const finish = () => { setVisit((v) => ({ ...v, noteText: notes, sendResult: { sent: false } })); goToScreen('saved') }

  return (
    <div className="sx-screen">
      <TopRow label={patientLabel(patient, lang)} onBack={() => goToScreen('home')} lang={lang} />
      <h1 className="sx-header sx-in" style={{ '--i': 1 }}>{t.review}</h1>
      <div className="sx-label sx-in" style={{ '--i': 2 }}>{t.reviewLabel}</div>
      {sr.code && <div className="sx-small" style={{ marginBottom: 8 }}>{t.codeLbl}: {sr.code}</div>}
      <pre className="sx-note">{text}</pre>
      <button type="button" className="sx-fill" disabled={busy || !notes} onClick={needsReferral ? send : finish}>
        {needsReferral ? t.sendBtn : t.finishBtn}
      </button>
    </div>
  )
}