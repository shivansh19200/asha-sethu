import React, { useEffect, useRef, useState } from 'react'
import rules from '../../data/rules.json'
import './theme.css'
import './screens.css'
import { T } from './strings'
import { Icon, TopRow, SignRow, getLang, patientLabel } from './ui'

const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)

export default function Describe({ visit, setVisit, goToScreen }) {
  const lang = getLang()
  const t = T[lang]
  const patient = visit.patient === 'mother' ? 'mother' : 'newborn'
  const signs = rules.signs.filter((s) => s.patient === patient)

  const [listening, setListening] = useState(false)
  const [typing, setTyping] = useState(!SR)
  const recRef = useRef(null)

  useEffect(() => () => recRef.current && recRef.current.stop(), [])

  const toggleMic = () => {
    if (!SR) return
    if (listening) {
      recRef.current && recRef.current.stop()
      return
    }
    const rec = new SR()
    rec.lang = lang === 'hi' ? 'hi-IN' : 'en-IN'
    rec.interimResults = false
    rec.continuous = false
    rec.onresult = (e) => {
      const heard = Array.from(e.results).map((r) => r[0].transcript).join(' ')
      setVisit((v) => ({ ...v, text: v.text ? v.text + ' ' + heard : heard }))
    }
    rec.onend = () => setListening(false)
    rec.onerror = () => setListening(false)
    recRef.current = rec
    rec.start()
    setListening(true)
  }

  const toggleSign = (id) =>
    setVisit((v) => ({
      ...v,
      signs: v.signs.includes(id) ? v.signs.filter((x) => x !== id) : [...v.signs, id]
    }))

  const toggleDone = () => setVisit((v) => ({ ...v, checklistDone: !v.checklistDone }))

  return (
    <div className="sx-screen">
      <TopRow label={patientLabel(patient, lang)} onBack={() => goToScreen('home')} lang={lang} />

      <h1 className="sx-header sx-in" style={{ '--i': 1 }}>{t.describeHeader}</h1>
      <div className="sx-label sx-in" style={{ '--i': 2 }}>{t.describeLabel}</div>

      <div className="sx-mic-wrap sx-in" style={{ '--i': 3 }}>
        <span className="sx-ring" />
        <span className="sx-ring sx-ring-2" />
        <button type="button" className="sx-mic" onClick={toggleMic} disabled={!SR}
          aria-label={t.mic} aria-pressed={listening}>
          <Icon name="mic" size={36} />
        </button>
      </div>

      {SR && (
        <button type="button" className="sx-link sx-in" style={{ '--i': 4 }} onClick={() => setTyping(!typing)}>
          {t.typeInstead}
        </button>
      )}

      <div className="sx-section sx-in" style={{ '--i': 5 }}>{t.heard}</div>
      {typing ? (
        <textarea className="sx-text" value={visit.text} placeholder={t.typeHere}
          onChange={(e) => setVisit((v) => ({ ...v, text: e.target.value }))} />
      ) : (
        <div className="sx-transcript">{visit.text}</div>
      )}

      <div className="sx-section">{t.checklist}</div>
      <div className="sx-rows">
        {signs.map((s, i) => (
          <SignRow key={s.id} index={i} label={lang === 'hi' ? s.name_hi : s.name_en}
            checked={visit.signs.includes(s.id)} onToggle={() => toggleSign(s.id)} />
        ))}
        <SignRow index={signs.length} label={t.checkedAll} checked={visit.checklistDone} onToggle={toggleDone} />
      </div>

      <button type="button" className="sx-fill" onClick={() => goToScreen('confirm')}>{t.cont}</button>
    </div>
  )
}
