import React, { useState } from 'react'
import './theme.css'
import './screens.css'
import './result.css'
import { T } from './strings'
import { Icon, getLang } from './ui'
import { StepList } from './Steps'
import { X } from './i18n'
import { levelOf } from './floor'
import Ticket, { ticketText } from './Ticket'
import { getFam } from './family'
import { Y } from './i18n2'

export default function Saved({ visit, goToScreen, openCard }) {
  const lang = getLang()
  const t = T[lang]
  const x = X[lang]
  const y = Y[lang]
  const [qr, setQr] = useState(false)
  const sr = visit.saveResult
  const send = visit.sendResult || {}
  if (!sr) return null

  const ok = send.sent ? send.ok : sr.ok
  const title = send.sent ? (send.ok ? t.sentTitle : t.waitTitle) : sr.ok ? t.savedTitle : t.waitTitle
  const text = visit.noteText ? (lang === 'hi' && visit.noteText.hi ? visit.noteText.hi : visit.noteText.en) : ''

  const level = levelOf(visit)
  const rec = getFam().find((r) => r.record_id === visit.clientId)
  const share = async () => {
    try { navigator.share ? await navigator.share({ text }) : await navigator.clipboard.writeText(text) } catch { /* cancelled */ }
  }

  return (
    <div className="sx-screen sx-center">
      <span className={`sx-seal${ok ? '' : ' wait'}`}><Icon name={ok ? 'check' : 'clock'} size={44} /></span>
      <h1 className="sx-header sx-in" style={{ '--i': 1 }}>{title}</h1>
      <div className="sx-label sx-in" style={{ '--i': 2 }}>{sr.code ? `${t.codeLbl}: ${sr.code}` : t.savedPhone}</div>
      <div style={{ textAlign: 'left' }}>
        <StepList steps={(visit.doneSteps || []).map((x) => [x.text, 'done'])} t={t} />
      </div>
      {level !== 'GREEN' && visit.noteText && <button type="button" className="sx-btn" onClick={() => setQr(true)}>{x.qrBtn}</button>}
      {rec && <button type="button" className="sx-btn" onClick={() => openCard(rec.record_id, 'saved')}>{y.hoShow}</button>}
      <button type="button" className="sx-btn" onClick={share}>{t.share}</button>
      <button type="button" className="sx-btn" onClick={() => window.print()}>{t.print}</button>
      <button type="button" className="sx-fill" onClick={() => goToScreen('home')}>{t.done}</button>
      {qr && <Ticket text={ticketText(visit.noteText.en)} onClose={() => setQr(false)} />}
    </div>
  )
}