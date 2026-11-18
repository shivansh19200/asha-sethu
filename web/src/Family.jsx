import React, { useRef, useState } from 'react'
import rules from '../../data/rules.json'
import './theme.css'
import './screens.css'
import './result.css'
import './family.css'
import { TopRow, getLang } from './ui'
import { T } from './strings'
import { M } from './more'
import { X } from './i18n'
import LevelPill from './Pill'
import { getFam, delFam, buildFile, parseFile, mergeRecords, saveFile, fileName, shownLevel } from './family'

const SNAME = (lang) => Object.fromEntries(rules.signs.map((s) => [s.id, lang === 'hi' ? s.name_hi : s.name_en]))
const day = (iso, lang) => new Date(iso).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

export default function Family({ goToScreen }) {
  const lang = getLang()
  const x = X[lang]
  const t = T[lang]
  const m = M[lang]
  const names = SNAME(lang)
  const [tick, setTick] = useState(0)
  const [msg, setMsg] = useState(null)       // { kind: 'ok' | 'err', text }
  const [asking, setAsking] = useState(null) // record_id waiting for delete confirmation
  const pick = useRef(null)
  const recs = getFam()

  const exportAll = async () => {
    if (!recs.length) { setMsg({ kind: 'err', text: x.famNone }); return }
    const r = await saveFile(fileName(null), await buildFile(recs))
    if (r !== 'cancelled') setMsg({ kind: 'ok', text: x.famExported(recs.length) })
  }
  const exportOne = async (rec) => {
    const r = await saveFile(fileName(rec), await buildFile([rec]))
    if (r !== 'cancelled') setMsg({ kind: 'ok', text: x.famExported(1) })
  }
  const onFile = async (e) => {
    const f = e.target.files && e.target.files[0]
    e.target.value = ''
    if (!f) return
    if (f.size > 1024 * 1024) { setMsg({ kind: 'err', text: x.famErr.tooBig }); return }
    const res = await parseFile(await f.text())
    if (!res.ok) {
      const text = res.err === 'checksum' ? x.famChecksumBad : res.err === 'badRecord' ? x.famErr.badRecord(res.index, x.famLevelWhy[res.why] || res.why) : x.famErr[res.err]
      setMsg({ kind: 'err', text })
      return
    }
    const { added, skipped } = mergeRecords(res.records)
    setMsg({ kind: 'ok', text: x.famImportOk(added, skipped) })
    setTick(tick + 1)
  }
  const remove = (id) => { delFam(id); setAsking(null); setMsg(null); setTick(tick + 1) }

  return (
    <div className="sx-screen">
      <TopRow label="" onBack={() => goToScreen('home')} lang={lang} />
      <h1 className="sx-header sx-in" style={{ '--i': 1 }}>{x.famHeader}</h1>
      <div className="sx-label sx-in" style={{ '--i': 2 }}>{x.famLabel}</div>

      <div className="fam-actions">
        <button type="button" className="sx-btn" onClick={exportAll}>{x.famExport}</button>
        <button type="button" className="sx-btn" onClick={() => pick.current && pick.current.click()}>{x.famImport}</button>
        <input ref={pick} type="file" accept=".json,application/json" hidden onChange={onFile} />
      </div>
      <p className="sx-small fam-priv">{x.famPrivacy}</p>
      {msg && <div role={msg.kind === 'err' ? 'alert' : 'status'} className={`fam-msg ${msg.kind}`}>{msg.text}</div>}

      {recs.length === 0 && (
        <div className="sx-empty">
          <div style={{ fontWeight: 500 }}>{x.famEmpty}</div>
          <div className="sx-small" style={{ textTransform: 'none', letterSpacing: 0, fontSize: 14 }}>{x.famEmptyHint}</div>
        </div>
      )}

      <div className="sx-list">
        {recs.map((r) => {
          const sl = shownLevel(r)
          return (
            <div key={r.record_id} className="sx-rowcard">
              <div className="sx-rowtop">
                <span style={{ fontWeight: 500 }}>{m.patient[r.patient]}{r.child_ref ? ` · ${x.famCode} ${r.child_ref}` : ''}</span>
                <LevelPill level={sl.level} lang={lang} />
              </div>
              <div className="sx-small fam-line">{x.famWhen}: {day(r.created_at, lang)}{r.age_days ? ` · ${x.famAge}: ${x.famDays(r.age_days)}` : ''}</div>
              <div className="sx-small fam-line">{x.famSigns}: {r.signs.map((id) => names[id]).join(', ') || x.famNoSigns}</div>
              {r.advised && <div className="sx-small fam-line">{x.famAdvice}: {r.advised}</div>}
              <div className="fam-chips">
                {r.demo && <span className="sx-chip" style={{ fontSize: 11 }}>{x.famDemo}</span>}
                {r.imported && <span className="sx-chip" style={{ fontSize: 11 }}>{x.famImported}</span>}
                {sl.raised && <span className="sx-chip" style={{ fontSize: 11 }}>{x.famFloorNote}</span>}
              </div>
              {asking === r.record_id ? (
                <div className="fam-ask">
                  <span>{x.famDeleteAsk}</span>
                  <button type="button" className="sx-btn sm line" onClick={() => remove(r.record_id)}>{x.famYes}</button>
                  <button type="button" className="sx-btn sm line" onClick={() => setAsking(null)}>{x.famCancel}</button>
                </div>
              ) : (
                <div className="fam-row">
                  <button type="button" className="sx-btn sm line" onClick={() => exportOne(r)}>{x.famExportOne}</button>
                  <button type="button" className="sx-btn sm line" onClick={() => setAsking(r.record_id)}>{x.famDelete}</button>
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div className="sx-foot">{t.foot}</div>
    </div>
  )
}
