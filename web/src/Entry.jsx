import React from 'react'
import './theme.css'
import './screens.css'
import './fmode.css'
import { Logo } from './Side'
import { Icon, useLang, announceLang } from './ui'
import { T } from './strings'
import { X } from './i18n'
import { Y } from './i18n2'

// First screen. Two ways in. No login for either in this version.
export function LangSeg() {
  const lang = useLang()
  const set = (next) => { try { localStorage.setItem('language', next) } catch { /* ignore */ } announceLang(next) }
  return (
    <div className="seg-lang" role="group" aria-label={X[lang].langLabel}>
      <button type="button" className={lang === 'en' ? 'on' : ''} onClick={() => set('EN')}>EN</button>
      <button type="button" className={lang === 'hi' ? 'on' : ''} onClick={() => set('हि')}>हि</button>
    </div>
  )
}

export default function Entry({ choose }) {
  const lang = useLang()
  const y = Y[lang]
  return (
    <div className="entry">
      <div className="entry-top">
        <div className="home-brand"><Logo size={28} /> Asha Sethu</div>
        <LangSeg />
      </div>
      <h1 className="entry-h">{y.entryAsk}</h1>
      <button type="button" className="entry-tile" onClick={() => choose('asha')}>
        <span className="entry-ico"><Icon name="stetho" size={30} /></span>
        <span className="entry-txt"><b>{y.entryAsha}</b><small>{y.entryAshaSub}</small></span>
      </button>
      <button type="button" className="entry-tile fam" onClick={() => choose('family')}>
        <span className="entry-ico"><Icon name="family" size={30} /></span>
        <span className="entry-txt"><b>{y.entryFam}</b><small>{y.entryFamSub}</small></span>
      </button>
      <p className="entry-note">{y.entryNote}</p>
      <p className="entry-foot">{T[lang].foot}</p>
    </div>
  )
}
