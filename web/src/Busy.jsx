import React, { useEffect, useState } from 'react'
import './busy.css'

// Shows a logo animation while a save / agent / note / referral request takes longer than ~0.35 s.
// Wraps window.fetch once; no screen needs to change. Background calls (/api/care) are ignored.
const WATCH = ['/api/agent', '/api/visits', '/api/referral', '/api/note', '/api/understand']
let count = 0
const subs = new Set()
const emit = () => subs.forEach((f) => f(count))
if (!window.__busyPatched) {
  window.__busyPatched = true
  const orig = window.fetch.bind(window)
  window.fetch = (input, init) => {
    const url = typeof input === 'string' ? input : input.url
    if ((init && init.quiet) || !WATCH.some((p) => url.includes(p))) return orig(input, init)
    count++; emit()
    return orig(input, init).finally(() => { count--; emit() })
  }
}

export function Loader({ label = 'Checking', size = 76 }) {
  return (
    <div className="bz-card" role="status" aria-live="polite">
      <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
        <rect width="40" height="40" rx="11" fill="#0E6B4F" />
        <path className="bz-rays" d="M11.5 21.9L8.5 20.8 M14.2 18.1L12.2 15.7 M18.4 16.1L17.9 13.0 M21.6 16.1L22.1 13.0 M25.8 18.1L27.8 15.7 M28.5 21.9L31.5 20.8" stroke="#F2A33A" strokeWidth="1.9" strokeLinecap="round" fill="none" />
        <path className="bz-sun" d="M14.6 25A5.4 5.4 0 0 1 25.4 25Z" fill="#F2A33A" />
        <path className="bz-arch" d="M7 33Q20 17 33 33" pathLength="1" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        <path className="bz-deck" d="M6 33.6H34" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        <path className="bz-p bz-p1" d="M13 33.2V28.2" stroke="#9BE0C2" strokeWidth="2.2" strokeLinecap="round" />
        <path className="bz-p bz-p3" d="M27 33.2V28.2" stroke="#9BE0C2" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
      <div className="bz-label">{label}<span>.</span><span>.</span><span>.</span></div>
    </div>
  )
}

export default function Busy() {
  const [n, setN] = useState(0)
  const [show, setShow] = useState(false)
  useEffect(() => { subs.add(setN); return () => subs.delete(setN) }, [])
  useEffect(() => {
    if (n > 0) { const t = setTimeout(() => setShow(true), 350); return () => clearTimeout(t) }
    setShow(false)
  }, [n])
  if (!show) return null
  return <div className="bz-overlay"><Loader /></div>
}
