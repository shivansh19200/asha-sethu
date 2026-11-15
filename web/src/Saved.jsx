import React from 'react'
import './theme.css'
import './screens.css'
import './result.css'
import { T } from './strings'
import { Icon, getLang } from './ui'

export default function Saved({ visit, goToScreen }) {
  const t = T[getLang()]
  const r = visit.saveResult
  if (!r) return null

  const share = async () => {
    try { navigator.share ? await navigator.share({ text: r.note }) : await navigator.clipboard.writeText(r.note) } catch { /* cancelled */ }
  }

  return (
    <div className="sx-screen sx-center">
      <span className={`sx-seal${r.ok ? '' : ' wait'}`}><Icon name={r.ok ? 'check' : 'clock'} size={44} /></span>
      <h1 className="sx-header sx-in" style={{ '--i': 1 }}>{r.ok ? t.savedTitle : t.waitTitle}</h1>
      <div className="sx-label sx-in" style={{ '--i': 2 }}>{r.ok ? `${t.codeLbl}: ${r.code}` : t.savedPhone}</div>
      <pre className="sx-note" style={{ textAlign: 'left' }}>{r.note}</pre>
      <button type="button" className="sx-btn" onClick={share}>{t.share}</button>
      <button type="button" className="sx-btn" onClick={() => window.print()}>{t.print}</button>
      <button type="button" className="sx-fill" onClick={() => goToScreen('home')}>{t.done}</button>
    </div>
  )
}