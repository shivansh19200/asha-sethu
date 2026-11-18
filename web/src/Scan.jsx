import React, { useEffect, useRef, useState } from 'react'
import './theme.css'
import './screens.css'
import './result.css'
import './fmode.css'
import jsQR from './vendor/jsqr'
import { Icon, TopRow, useLang } from './ui'
import { Y } from './i18n2'
import { parseFile, mergeRecords } from './family'

// Reads the ASHA's hand-over QR with the phone camera, inside the app. Everything stays on the phone.
// The text read goes through the same strict checks as an imported file before anything is saved.
const MAX_SIDE = 1080
// Reads a QR from an image source. For the camera we read only the square the person sees in the viewfinder
// (the middle of the frame) at full resolution: shrinking the frame first makes a dense code unreadable.
function decodeCanvas(cv, ctx, src, sw, sh, maxSide, crop) {
  const side = crop ? Math.min(sw, sh) : null
  const sx = crop ? Math.round((sw - side) / 2) : 0
  const sy = crop ? Math.round((sh - side) / 2) : 0
  const cw = crop ? side : sw
  const ch = crop ? side : sh
  const k = Math.min(1, maxSide / Math.max(cw, ch))
  const w = Math.max(1, Math.round(cw * k))
  const h = Math.max(1, Math.round(ch * k))
  cv.width = w; cv.height = h
  ctx.drawImage(src, sx, sy, cw, ch, 0, 0, w, h)
  const d = ctx.getImageData(0, 0, w, h)
  const q = jsQR(d.data, w, h, { inversionAttempts: 'dontInvert' })
  return q ? q.data : null
}

export default function Scan({ goToScreen, openCard }) {
  const lang = useLang()
  const y = Y[lang]
  const video = useRef(null)
  const cv = useRef(null)
  const stream = useRef(null)
  const timer = useRef(0)
  const busy = useRef(false)
  const alive = useRef(true)
  const pick = useRef(null)
  const [phase, setPhase] = useState('starting') // starting | scanning | denied | done
  const [note, setNote] = useState(null)
  const [res, setRes] = useState(null)

  const stopCam = () => {
    clearTimeout(timer.current)
    const s = stream.current
    if (s) s.getTracks().forEach((t) => t.stop())
    stream.current = null
  }

  const accept = async (text) => {
    const r = await parseFile(text)
    if (!r.ok) {
      const k = r.err
      setNote({ kind: 'err', text: k === 'wrongFormat' || k === 'notJson' || k === 'tooBig' ? y.scBad : k === 'newer' ? y.scNewer : y.scInvalid })
      return false
    }
    const m = mergeRecords(r.records)
    stopCam()
    try { if (navigator.vibrate) navigator.vibrate(60) } catch { /* ignore */ }
    setRes({ added: m.added, id: r.records[0].record_id, n: r.records.length })
    setPhase('done')
    return true
  }

  const loop = (bd) => {
    if (!alive.current || !stream.current) return
    const tick = async () => {
      if (!alive.current || !stream.current) return
      const v = video.current
      if (!busy.current && v && v.readyState >= 2 && v.videoWidth) {
        busy.current = true
        try {
          let text = null
          if (bd) { try { const c = await bd.detect(v); if (c && c[0]) text = c[0].rawValue } catch { /* fall through to jsQR */ } }
          if (!text) text = decodeCanvas(cv.current, cv.current.getContext('2d', { willReadFrequently: true }), v, v.videoWidth, v.videoHeight, MAX_SIDE, true)
          if (text && alive.current) await accept(text)
        } finally { busy.current = false }
      }
      if (alive.current && stream.current) timer.current = setTimeout(tick, 130)
    }
    timer.current = setTimeout(tick, 130)
  }

  const start = async () => {
    setNote(null); setRes(null); setPhase('starting')
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { setPhase('denied'); return }
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } }, audio: false })
      if (!alive.current) { s.getTracks().forEach((t) => t.stop()); return }
      stream.current = s
      const v = video.current
      v.srcObject = s
      await v.play().catch(() => {})
      setPhase('scanning')
      let bd = null
      try { if ('BarcodeDetector' in window) bd = new window.BarcodeDetector({ formats: ['qr_code'] }) } catch { bd = null }
      loop(bd)
    } catch { if (alive.current) setPhase('denied') }
  }

  useEffect(() => {
    alive.current = true
    start()
    return () => { alive.current = false; stopCam() }
  }, [])

  // fallback when the camera cannot be opened: read a photo or screenshot of the code
  const onPhoto = async (e) => {
    const f = e.target.files && e.target.files[0]
    e.target.value = ''
    if (!f) return
    try {
      const bmp = await createImageBitmap(f)
      const text = decodeCanvas(cv.current, cv.current.getContext('2d', { willReadFrequently: true }), bmp, bmp.width, bmp.height, 1600, false)
      if (!text) { setNote({ kind: 'err', text: y.scNoCode }); return }
      await accept(text)
    } catch { setNote({ kind: 'err', text: y.scNoCode }) }
  }

  const close = () => { stopCam(); goToScreen('fhome') }

  if (phase === 'done' && res) {
    return (
      <div className="sx-screen sx-center">
        <span className="sx-seal"><Icon name="check" size={44} /></span>
        <h1 className="sx-header sx-in" style={{ '--i': 1 }}>{res.added ? y.scOk : y.scDup}</h1>
        {res.n === 1 && <button type="button" className="sx-fill" onClick={() => openCard(res.id, 'fhome')}>{y.scOpen}</button>}
        <button type="button" className="sx-btn" style={{ marginTop: 10 }} onClick={start}>{y.scAgain}</button>
        <button type="button" className="sx-link" onClick={close}>{y.scClose}</button>
      </div>
    )
  }

  return (
    <div className="sx-screen sc">
      <TopRow label="" onBack={close} lang={lang} />
      <h1 className="sx-header sx-in" style={{ '--i': 1 }}>{y.scTitle}</h1>
      {phase !== 'denied' && (
        <>
          <p className="sc-hint">{y.scHint}</p>
          <div className="sc-view">
            <video ref={video} playsInline muted autoPlay aria-label={y.scTitle} />
            <i className="sc-c tl" /><i className="sc-c tr" /><i className="sc-c bl" /><i className="sc-c br" />
            {phase === 'starting' && <div className="sc-wait">{y.scStarting}</div>}
          </div>
        </>
      )}
      {phase === 'denied' && <div role="alert" className="fam-msg err">{y.scDenied}</div>}
      {note && <div role="alert" className="fam-msg err">{note.text}</div>}
      <button type="button" className={phase === 'denied' ? 'sx-fill' : 'sx-btn'} style={{ marginTop: 14 }} onClick={() => pick.current && pick.current.click()}>{y.scPhoto}</button>
      <input ref={pick} type="file" accept="image/*" hidden onChange={onPhoto} />
      <canvas ref={cv} hidden />
    </div>
  )
}
