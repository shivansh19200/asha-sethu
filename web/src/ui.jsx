import React from 'react'
import { T } from './strings'

export const getLang = () => (localStorage.getItem('language') === 'हि' ? 'hi' : 'en')

const PATHS = {
  back: <><path d="M5 12l14 0" /><path d="M5 12l6 6" /><path d="M5 12l6 -6" /></>,
  check: <path d="M5 12l5 5l10 -10" />,
  x: <><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></>,
  plus: <><path d="M12 5l0 14" /><path d="M5 12l14 0" /></>,
  mic: <><path d="M9 2m0 3a3 3 0 0 1 3 -3h0a3 3 0 0 1 3 3v5a3 3 0 0 1 -3 3h0a3 3 0 0 1 -3 -3z" /><path d="M5 10a7 7 0 0 0 14 0" /><path d="M8 21l8 0" /><path d="M12 17l0 4" /></>
}

export function Icon({ name, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[name]}
    </svg>
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
