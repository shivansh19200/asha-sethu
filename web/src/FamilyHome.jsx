import React, { useState } from 'react'
import './theme.css'
import './screens.css'
import './result.css'
import './fmode.css'
import { Logo } from './Side'
import { Icon, useLang } from './ui'
import { T } from './strings'
import { Y, fmtBytes, fmtDay } from './i18n2'
import LevelPill from './Pill'
import { LangSeg } from './Entry'
import { getFam, shownLevel, storageInfo, compactableCount, compactOld } from './family'

// What a family sees. Read-only: cards from the ASHA, no forms, no files.
export default function FamilyHome({ openCard, changeMode, goToScreen }) {
  const lang = useLang()
  const y = Y[lang]
  const t = T[lang]
  const [tick, setTick] = useState(0)
  const [asking, setAsking] = useState(false)
  const [msg, setMsg] = useState(null)
  const recs = getFam()
  const info = storageInfo()
  const old = compactableCount()
  const shorten = () => { const n = compactOld(); setAsking(false); setMsg(y.freed(n)); setTick(tick + 1) }

  return (
    <div className="sx-screen fh">
      <div className="entry-top">
        <div className="home-brand"><Logo size={28} /> Asha Sethu</div>
        <LangSeg />
      </div>
      <h1 className="sx-header sx-in" style={{ '--i': 1 }}>{y.fhHeader}</h1>
      <div className="sx-label sx-in" style={{ '--i': 2 }}>{y.fhLabel}</div>

      <button type="button" className="fh-receive sx-in" style={{ '--i': 3 }} onClick={() => goToScreen('receive')}>
        <span className="entry-ico"><Icon name="scan" size={30} /></span>
        <span className="entry-txt"><b>{y.fhReceive}</b><small>{y.fhReceiveSub}</small></span>
      </button>

      {recs.length === 0 && (
        <div className="sx-empty fh-empty">
          <div style={{ fontWeight: 500 }}>{y.fhEmpty}</div>
          <div className="sx-small" style={{ textTransform: 'none', letterSpacing: 0, fontSize: 15, marginTop: 6 }}>{y.fhEmptyHint}</div>
        </div>
      )}

      <div className="fh-list">
        {recs.map((r) => {
          const level = shownLevel(r).level
          return (
            <button key={r.record_id} type="button" className={`fh-card lvb-${level.toLowerCase()}`} onClick={() => openCard(r.record_id, 'fhome')}>
              <span className="fh-main">
                <b>{y.cdPatient[r.patient]}{r.child_ref ? ` · ${r.child_ref}` : ''}</b>
                <small>{fmtDay(r.created_at, lang)}{r.demo ? ' · DEMO' : ''}</small>
              </span>
              <LevelPill level={level} lang={lang} />
              <Icon name="back" size={18} />
            </button>
          )
        })}
      </div>

      {msg && <div role="status" className="fam-msg ok">{msg}</div>}
      <div className="fh-store">
        <span>{y.stored(info.count, fmtBytes(info.bytes))}</span>
        {old > 0 && !asking && <button type="button" className="sx-btn sm line" onClick={() => { setMsg(null); setAsking(true) }}>{y.free}</button>}
      </div>
      {asking && (
        <div className="fam-ask" role="alertdialog" aria-label={y.free}>
          <span>{y.freeAsk(old)}</span>
          <button type="button" className="sx-btn sm line" onClick={shorten}>{y.freeYes}</button>
          <button type="button" className="sx-btn sm line" onClick={() => setAsking(false)}>{y.freeNo}</button>
        </div>
      )}

      <button type="button" className="sx-link" onClick={changeMode}>{y.modeChange}</button>
      <div className="sx-foot">{t.foot}</div>
    </div>
  )
}
