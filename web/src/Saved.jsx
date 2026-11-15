import React from 'react'
import './theme.css'
import './screens.css'
import './result.css'
import { T } from './strings'
import { Icon, getLang } from './ui'
import { StepList } from './Steps'

export default function Saved({ visit, goToScreen }) {
  const lang = getLang()
  const t = T[lang]
  const sr = visit.saveResult
  const send = visit.sendResult || {}
  if (!sr) return null

  const ok = send.sent ? send.ok : sr.ok
  const title = send.sent ? (send.ok ? t.sentTitle : t.waitTitle) : sr.ok ? t.savedTitle : t.waitTitle
  const text = visit.noteText ? (lang === 'hi' && visit.noteText.hi ? visit.noteText.hi : visit.noteText.en) : ''

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
      <button type="button" className="sx-btn" onClick={share}>{t.share}</button>
      <button type="button" className="sx-btn" onClick={() => window.print()}>{t.print}</button>
      <button type="button" className="sx-fill" onClick={() => goToScreen('home')}>{t.done}</button>
    </div>
  )
}