import React, { useMemo, useState } from 'react'
import './theme.css'
import './screens.css'
import './result.css'
import './fmode.css'
import rules from '../../data/rules.json'
import { Icon, TopRow, useLang } from './ui'
import { T } from './strings'
import { Y, fmtDay } from './i18n2'
import { X, levelWord } from './i18n'
import { getFam, delFam, patchFam, shownLevel, validPhone, normPhone, handoverText, fitsQr } from './family'
import { localNote } from './noteLocal'
import Ticket from './Ticket'
import Speak from './Speak'

const ICON = { RED: 'alert-triangle', AMBER: 'alert-circle', GREEN: 'check-circle', UNSURE: 'help-circle' }
const SNAME = (lang) => Object.fromEntries(rules.signs.map((s) => [s.id, lang === 'hi' ? s.name_hi : s.name_en]))

// One visit, for the family. The colour, the word and the icon always agree, and the sentence is the reviewed one from strings.js.
// asha = true when the ASHA is showing it on her own phone: then it also offers the QR for the family's phone.
export default function FamilyCard({ id, from, asha, goToScreen }) {
  const lang = useLang()
  const y = Y[lang]
  const t = T[lang]
  const x = X[lang]
  const names = SNAME(lang)
  const [tick, setTick] = useState(0)
  const [phone, setPhone] = useState('')
  const [phoneErr, setPhoneErr] = useState(false)
  const [asking, setAsking] = useState(false)
  const [sheet, setSheet] = useState(null) // 'doctor' | 'hand'
  const rec = useMemo(() => getFam().find((r) => r.record_id === id), [id, tick])
  const back = () => goToScreen(from || 'fhome')

  if (!rec) {
    return (
      <div className="sx-screen">
        <TopRow label="" onBack={back} lang={lang} />
        <div className="sx-empty"><div style={{ fontWeight: 500 }}>{y.fhEmpty}</div></div>
      </div>
    )
  }

  const level = shownLevel(rec).level
  const sentence = level === 'UNSURE' ? y.cdUnsure : t['act' + level]
  const ph = rec.asha_phone
  const small = !!rec.compact
  const when = new Date(rec.created_at).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })
  const docText = small ? null : `${localNote({ patient: rec.patient, signs: rec.signs, level, age: { days: rec.age_days }, code: rec.child_ref, asha: null, village: null, when }, 'en')}\nAsha Sethu rules v${rec.rules_version}`
  const hand = asha ? handoverText(rec) : null
  const smsHref = ph ? `sms:${ph}${rec.child_ref ? `?body=${encodeURIComponent(y.smsBody(rec.child_ref))}` : ''}` : null

  const savePhone = () => {
    if (!validPhone(phone)) { setPhoneErr(true); return }
    patchFam(rec.record_id, { asha_phone: normPhone(phone) })
    setPhone(''); setPhoneErr(false); setTick(tick + 1)
  }
  const remove = () => { delFam(rec.record_id); back() }

  return (
    <div className="sx-screen fc">
      <TopRow label={asha ? y.cdAshaBar : ''} onBack={back} lang={lang} />

      <section className={`fc-hero lv-${level.toLowerCase()} sx-in`} style={{ '--i': 1 }} aria-label={levelWord(level, lang)}>
        <Icon name={ICON[level]} size={44} />
        <div className="fc-word">{levelWord(level, lang)}</div>
        <p className="fc-sentence">{sentence}</p>
        <Speak id={`lvl_${level}`} text={sentence} lang={lang} />
      </section>

      <div className="fc-meta sx-in" style={{ '--i': 2 }}>
        <span>{y.cdPatient[rec.patient]}{rec.child_ref ? ` · ${x.famCode} ${rec.child_ref}` : ''}</span>
        <span>{fmtDay(rec.created_at, lang)}{!small && rec.age_days ? ` · ${x.famAge}: ${x.famDays(rec.age_days)}` : ''}</span>
        {rec.demo && <span className="sx-chip" style={{ fontSize: 12 }}>{x.famDemo}</span>}
      </div>

      {small ? (
        <p className="fc-short">{y.cdShort}</p>
      ) : (
        <>
          <div className="sx-section">{y.cdFound}</div>
          <div className="sx-chips">
            {rec.signs.length === 0 && <span className="sx-small" style={{ textTransform: 'none', letterSpacing: 0, fontSize: 15 }}>{y.cdNone}</span>}
            {rec.signs.map((s) => <span key={s} className="sx-chip">{names[s]}</span>)}
          </div>
        </>
      )}

      {ph ? (
        <div className="fc-contact">
          <a className="sx-fill fc-a" href={`tel:${ph}`}><Icon name="phone" size={22} />{y.cdCall}</a>
          <a className="sx-btn fc-a" href={smsHref}><Icon name="message" size={22} />{y.cdSms}</a>
        </div>
      ) : (
        <div className="fc-nophone">
          <div>{y.cdNoPhone}</div>
          <label className="sx-small" style={{ textTransform: 'none', letterSpacing: 0, fontSize: 14 }} htmlFor="fc-ph">{y.cdAddPhone}</label>
          <div className="fc-phrow">
            <input id="fc-ph" className="sx-input" type="tel" inputMode="tel" autoComplete="off" value={phone} aria-invalid={phoneErr} onChange={(e) => { setPhone(e.target.value); setPhoneErr(false) }} />
            <button type="button" className="sx-btn sm line" onClick={savePhone}>{y.cdSave}</button>
          </div>
          {phoneErr && <div role="alert" className="fam-msg err">{y.cdPhoneBad}</div>}
        </div>
      )}

      <p className="fc-warn" role="note"><Icon name="alert-circle" size={20} />{y.cdWarn}</p>

      {!small && level !== 'GREEN' && <button type="button" className="sx-btn" onClick={() => setSheet('doctor')}>{x.qrBtn}</button>}
      {asha && (hand && fitsQr(hand)
        ? <button type="button" className="sx-btn" onClick={() => setSheet('hand')}>{y.hoQr}</button>
        : !small && <div role="alert" className="fam-msg err">{y.hoTooBig}</div>)}

      {!asha && (asking ? (
        <div className="fam-ask" role="alertdialog" aria-label={y.cdDelete}>
          <span>{y.cdDeleteAsk}</span>
          <button type="button" className="sx-btn sm line" onClick={remove}>{x.famYes}</button>
          <button type="button" className="sx-btn sm line" onClick={() => setAsking(false)}>{x.famCancel}</button>
        </div>
      ) : (
        <button type="button" className="sx-link" onClick={() => setAsking(true)}>{y.cdDelete}</button>
      ))}
      {asha && <button type="button" className="sx-fill" onClick={back}>{y.cdBackAsha}</button>}
      <div className="sx-foot">{t.foot}</div>

      {sheet === 'doctor' && docText && <Ticket text={docText} onClose={() => setSheet(null)} />}
      {sheet === 'hand' && hand && <Ticket text={hand} ecc="L" title={y.hoTitle} hint={y.hoHint} small={y.hoSmall} onClose={() => setSheet(null)} />}
    </div>
  )
}
