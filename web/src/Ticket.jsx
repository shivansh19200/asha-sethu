import React, { useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import './family.css'
import qrcode from './vendor/qrcode'
import rules from '../../data/rules.json'
import { getLang } from './ui'
import { X } from './i18n'

// The ticket is plain text, so any phone camera or QR app can read it with no signal and no server.
// It carries the same referral note the ASHA reviewed (English, for the doctor) plus the rules version.
export const ticketText = (noteEn) => `${noteEn}\nAsha Sethu rules v${rules.version}`

function makeQr(text, ecc = 'M') {
  try {
    const q = qrcode(0, ecc)
    q.addData(text, 'Byte')
    q.make()
    const n = q.getModuleCount()
    let d = ''
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c + 4} ${r + 4}h1v1h-1z`
    return { n, d }
  } catch { return null }
}

// title, hint, small, ecc let the same sheet carry the hand-over code for the family's phone.
export default function Ticket({ text, onClose, title, hint, small, ecc = 'M' }) {
  const lang = getLang()
  const x = X[lang]
  const qr = useMemo(() => makeQr(text, ecc), [text, ecc])
  useEffect(() => {
    const k = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])
  // Portal: the screen has a transform animation, which would turn this fixed overlay into a screen-sized box.
  return createPortal(
    <div className="qr-back" onClick={onClose}>
      <div className="qr-sheet" role="dialog" aria-modal="true" aria-label={title || x.qrTitle} onClick={(e) => e.stopPropagation()}>
        <h2>{title || x.qrTitle}</h2>
        {qr ? (
          <svg className="qr-code" viewBox={`0 0 ${qr.n + 8} ${qr.n + 8}`} role="img" aria-label="QR" shapeRendering="crispEdges">
            <rect width="100%" height="100%" fill="#fff" />
            <path d={qr.d} fill="#000" />
          </svg>
        ) : <div className="qr-err" role="alert">{x.qrTooLong}</div>}
        <p>{hint || x.qrHint}</p>
        <p className="qr-small">{small || x.qrLang}</p>
        <button type="button" className="sx-fill" onClick={onClose}>{x.qrClose}</button>
      </div>
    </div>,
    document.body
  )
}
