import React from 'react'
import { T } from './strings'
//import path from 'path';

export const getLang = () => (localStorage.getItem('language') === 'हि' ? 'hi' : 'en')

const CIRCLE = <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
const PATHS = {
  back: <><path d="M5 12l14 0" /><path d="M5 12l6 6" /><path d="M5 12l6 -6" /></>,
  check: <path d="M5 12l5 5l10 -10" />,
  x: <><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></>,
  plus: <><path d="M12 5l0 14" /><path d="M5 12l14 0" /></>,
  mic: <><path d="M9 2m0 3a3 3 0 0 1 3 -3h0a3 3 0 0 1 3 3v5a3 3 0 0 1 -3 3h0a3 3 0 0 1 -3 -3z" /><path d="M5 10a7 7 0 0 0 14 0" /><path d="M8 21l8 0" /><path d="M12 17l0 4" /></>,
  'alert-triangle': <><path d="M12 9v4" /><path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z" /><path d="M12 16h.01" /></>,
  'alert-circle': <>{CIRCLE}<path d="M12 8v4" /><path d="M12 16h.01" /></>,
  'check-circle': <>{CIRCLE}<path d="M9 12l2 2l4 -4" /></>,
  'help-circle': <>{CIRCLE}<path d="M12 16v.01" /><path d="M12 13a2 2 0 0 0 .914 -3.782a1.98 1.98 0 0 0 -2.414 .483" /></>,
  'user-check': <><path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" /><path d="M6 21v-2a4 4 0 0 1 4 -4h4" /><path d="M15 19l2 2l4 -4" /></>,
  bulb: <><path d="M3 12h1m8 -9v1m8 8h1m-15.4 -6.4l.7 .7m12.1 -.7l-.7 .7" /><path d="M9 16a5 5 0 1 1 6 0a3.5 3.5 0 0 0 -1 3a2 2 0 0 1 -4 0a3.5 3.5 0 0 0 -1 -3" /><path d="M9.7 17l4.6 0" /></>,
  book: <><path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0" /><path d="M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0" /><path d="M3 6l0 13" /><path d="M12 6l0 13" /><path d="M21 6l0 13" /></>,
  clock: <>{CIRCLE}<path d="M12 7v5l3 3" /></>,
}

export function Icon({ name, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[name]}
    </svg>
  )
}

export function Baby({ size = 56 }) {
  return (
    <span className="sx-portrait" style={{ width: size, height: size }}>
      <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
        <path d="M8 64c0-14 10-22 24-22s24 8 24 22z" fill="var(--pri)" />
        <circle cx="32" cy="30" r="17" fill="#E0AE86" />
        <path d="M16 27c2-11 10-15 17-14 8 1 13 7 14 14-5-4-10-6-15-6-6 0-11 2-16 6z" fill="#2B2118" />
        <circle cx="26" cy="33" r="1.8" fill="#2B2118" /><circle cx="38" cy="33" r="1.8" fill="#2B2118" />
        <path d="M28 40q4 3 8 0" stroke="#8A4B2F" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <circle cx="22" cy="38" r="3" fill="#E58E7A" opacity=".5" /><circle cx="42" cy="38" r="3" fill="#E58E7A" opacity=".5" />
      </svg>
    </span>
  )
}

export function TopRow({ label, onBack, lang }) {
  return (
    <div className="sx-top sx-in" style={{ '--i': 0 }}>
      <button type="button" className="sx-back" onClick={onBack} aria-label={T[lang].back}>
        <Icon name="back" />
      </button>
      <span className="sx-small">{label}</span>
    </div>
  )
}

export function SignRow({ label, checked, onToggle, index = 0 }) {
  return (
    <button type="button" role="checkbox" aria-checked={checked}
      className={`sx-row sx-in${checked ? ' on' : ''}`} style={{ '--i': index }} onClick={onToggle}>
      <span className="sx-row-name">{label}</span>
      <span className="sx-box">{checked && <Icon name="check" size={18} />}</span>
    </button>
  )
}

export const patientLabel = (patient, lang) => (patient === 'mother' ? T[lang].mother : T[lang].newborn)