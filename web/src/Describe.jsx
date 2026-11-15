import React, { useEffect, useRef, useState } from 'react'
import rules from '../../data/rules.json'
import './theme.css'
import './screens.css'
import { T } from './strings'
import { Icon, TopRow, SignRow, getLang, patientLabel } from './ui'

const canRec = typeof window !== 'undefined' && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder)
const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)

export default function Describe({ visit, setVisit, goToScreen }) {
  const lang = getLang()
  const t = T[lang]
  const patient = visit.patient === 'mother' ? 'mother' : 'newborn'
  const signs = rules.signs.filter((s) => s.patient === patient)

  const [listening, setListening] = useState(false)
  const [micErr, setMicErr] = useState('')
  const [typing, setTyping] = useState(!SR && !canRec)
  const recRef = useRef(null)

  const [busy, setBusy] = useState(false)
  useEffect(() => () => { try { recRef.current && recRef.current.stop() } catch (e) { /* already stopped */ } }, [])

  const addText = (heard) => setVisit((v) => ({ ...v, text: v.text ? v.text + ' ' + heard : heard }))

  // Preferred: record a short clip and transcribe it on the server (works on every phone browser).
  const record = async () => {
    setMicErr('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'].find((m) => MediaRecorder.isTypeSupported(m)) || ''
      const mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)
      const chunks = []
      mr.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data) }
      mr.onstop = async () => {
        stream.getTracks().forEach((x) => x.stop())
        setListening(false)
        const blob = new Blob(chunks, { type: mr.mimeType || mime || 'audio/webm' })
        if (blob.size < 1500) { setMicErr('Did not hear anything. Tap the mic and speak closer.'); return }
        setBusy(true)
        try {
          const b64 = await new Promise((res) => { const r = new FileReader(); r.onloadend = () => res(String(r.result).split(',')[1]); r.readAsDataURL(blob) })
          const resp = await fetch('/api/transcribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ audio: b64, mime: blob.type, lang }) })
          const j = await resp.json()
          if (j.text) addText(j.text)
          else setMicErr(j.error ? 'Voice problem: ' + j.error : 'Did not catch that. Please try again or type.')
        } catch (e) { setMicErr('Could not reach the server. Please type instead.') }
        setBusy(false)
      }
      recRef.current = mr
      mr.start()
      setListening(true)
      setTimeout(() => { if (mr.state === 'recording') mr.stop() }, 30000)
    } catch (e) {
      setMicErr(e && (e.name === 'NotAllowedError' || e.name === 'SecurityError') ? 'Microphone is blocked. Allow it in the browser site settings, or type instead.' : 'No microphone found. Please type instead.')
      setTyping(true)
    }
  }

  // Fallback for browsers that cannot record: the built-in speech recognition.
  const recognise = () => {
    setMicErr('')
    const rec = new SR()
    rec.lang = lang === 'hi' ? 'hi-IN' : 'en-IN'
    rec.interimResults = false
    rec.continuous = false
    rec.onresult = (e) => addText(Array.from(e.results).map((r) => r[0].transcript).join(' '))
    rec.onend = () => setListening(false)
    rec.onerror = () => { setListening(false); setMicErr('Voice did not work on this browser. Please type instead.'); setTyping(true) }
    recRef.current = rec
    try { rec.start(); setListening(true) } catch (err) { setMicErr('Voice could not start. Please type instead.'); setTyping(true) }
  }

  const toggleMic = () => {
    if (busy) return
    if (listening) { try { recRef.current && recRef.current.stop() } catch (e) { setListening(false) } return }
    if (canRec) record()
    else if (SR) recognise()
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
        <button type="button" className="sx-mic" onClick={toggleMic} disabled={(!SR && !canRec) || busy}
          aria-label={t.mic} aria-pressed={listening}>
          <Icon name="mic" size={36} />
        </button>
      </div>

      {!SR && !canRec && <div role="alert" style={{ margin: '6px 16px', padding: '8px 12px', borderRadius: 12, background: '#FFF4D6', color: '#7A5200', fontSize: 14, textAlign: 'center' }}>Voice is not available in this browser (apps like WhatsApp or Instagram block the microphone). Open this link in Chrome or Safari, or type below.</div>}
      {listening && canRec && <div role="status" style={{ margin: '6px 16px', textAlign: 'center', fontSize: 14, color: '#B3261E', fontWeight: 600 }}>Recording... tap the mic again when you finish.</div>}
      {busy && <div role="status" style={{ margin: '6px 16px', textAlign: 'center', fontSize: 14, color: '#0E6B4F', fontWeight: 600 }}>Turning your voice into text...</div>}
      {micErr && <div role="alert" style={{ margin: '6px 16px', padding: '8px 12px', borderRadius: 12, background: '#FFF4D6', color: '#7A5200', fontSize: 14, textAlign: 'center' }}>{micErr}</div>}

      {(SR || canRec) && (
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
