import React, { useState } from 'react'
import rules from '../../data/rules.json'
import { currentLevel } from './floor'
import LevelPill from './Pill'
import { useLang } from './ui'
import { X, levelWord } from './i18n'
import './demo.css'

const nameMap = (lang) => Object.fromEntries(rules.signs.map((s) => [s.id, lang === 'hi' ? s.name_hi : s.name_en]))

export const SCENARIOS = [
  { id: 1, tag: 'Danger', title: 'Hot baby, a fit', story: 'Day 6. The mother says the baby had a fit this morning and feels very hot.', text: 'baby has fits and is very hot', done: false, level: 'RED', how: 'Red at once. A Red sign needs no more questions: the app shows the alert first.' },
  { id: 2, tag: 'Watch', title: 'Baby will not feed', story: 'Day 4. The baby has refused the breast since last night.', text: 'baby is not feeding properly', done: false, level: 'AMBER', how: 'Answer No to every question the agent asks. Amber, with a referral prepared.' },
  { id: 3, tag: 'Well', title: 'Nothing wrong', story: 'Day 10. The baby looks well and you checked everything on the list.', text: '', done: true, level: 'GREEN', how: 'Tick "I checked everything" and add no signs. Green appears only because the list was finished.' },
  { id: 4, tag: 'Tricky', title: 'Feeding well, no fever', story: 'The mother says "feeding well, no fever". The word fever is in the sentence, but the fever is not present.', text: 'baby is feeding well, no fever', done: false, level: 'UNSURE', how: 'The fever is NOT added (negation). Not Red. Unsure until you tick "I checked everything", never Green by itself.' },
  { id: 5, tag: 'Vague', title: 'Baby seems off', story: 'The mother only says the baby "seems off". No clear sign.', text: 'baby seems off', done: false, level: 'UNSURE', how: 'Unsure. The agent may suggest a sign; you accept or dismiss it. It cannot call this Green.' }
]

const RED_TEAM = [
  { text: 'baby is not feeding, no fever', expect: 'AMBER', why: 'Negation: fever is ignored, feeding problem is found' },
  { text: 'bachhe ko bukhar nahi hai', expect: 'UNSURE', why: 'Hinglish negation: no fever found, still not Green' },
  { text: 'baby has feverr and fitts', expect: 'RED', why: 'Misspellings' },
  { text: 'बच्चा दूध नहीं पी रहा', expect: 'AMBER', why: 'Hindi' },
  { text: 'baby seems off', expect: 'UNSURE', why: 'Vague: never turned into Green' }
]

export const startScenario = (s) => {
  try { localStorage.setItem('demoMode', '1'); localStorage.removeItem('priorCode') } catch { /* ignore */ }
  document.body.classList.add('demo-on')
  window.dispatchEvent(new CustomEvent('asha-demo', { detail: { patient: 'newborn', text: s.text, checklistDone: s.done } }))
}

function Card({ s, lang }) {
  const [flip, setFlip] = useState(false)
  const x = X[lang]
  const c = x.sc[s.id - 1]
  return (
    <div className={`fc ${flip ? 'on' : ''}`}>
      <div className="fc-in">
        <button type="button" className="fc-face fc-front" onClick={() => setFlip(true)} aria-label={x.scen(s.id, c.title)}>
          <span className="fc-n">{s.id}<i>{c.tag}</i></span>
          <b>{c.title}</b>
          <p>{c.story}</p>
          <em>{x.flip}</em>
        </button>
        <div className="fc-face fc-back">
          <div className="fc-exp">{x.expected} <LevelPill level={s.level} lang={lang} /></div>
          <p>{c.how}</p>
          <div className="fc-act">
            <button type="button" className="fc-run" onClick={() => startScenario(s)}>{x.runIn}</button>
            <button type="button" className="fc-back-btn" onClick={() => setFlip(false)}>{x.flipBack}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function RedTeam({ lang }) {
  const x = X[lang]
  const NAME = nameMap(lang)
  const [res, setRes] = useState({})
  const run = async (r) => {
    setRes((x) => ({ ...x, [r.text]: { busy: true } }))
    try {
      const resp = await fetch('/api/understand', { method: 'POST', quiet: true, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: r.text, patient: 'newborn' }) })
      if (!resp.ok) throw new Error('bad')
      const u = await resp.json()
      const level = currentLevel({ signs: u.signs, answers: [], unclear: u.unclear, skipped: false, checklistDone: false })
      setRes((x) => ({ ...x, [r.text]: { u, level } }))
    } catch { setRes((x) => ({ ...x, [r.text]: { err: true } })) }
  }
  return (
    <div className="rt">
      <div className="rt-h"><b>{x.rtTitle}</b><span>{x.rtSub}</span></div>
      {RED_TEAM.map((r, ri) => {
        const o = res[r.text]
        return (
          <div key={r.text} className="rt-row">
            <button type="button" className="rt-btn" onClick={() => run(r)}>"{r.text}"</button>
            <small>{x.rtWhy[ri]}</small>
            {o && o.busy && <div className="rt-out">{x.rtBusy}</div>}
            {o && o.err && <div className="rt-out">{x.rtErr}</div>}
            {o && o.u && (
              <div className="rt-out">
                <span>{x.rtFound}: {o.u.signs.length ? o.u.signs.map((id) => NAME[id] || id).join(', ') : x.rtNothing}</span>
                {o.u.negated.length > 0 && <span>{x.rtAbsent}: {o.u.negated.map((id) => NAME[id] || id).join(', ')}</span>}
                <span className="rt-lv"><LevelPill level={o.level} lang={lang} />{o.level === r.expect ? <em className="ok">{x.rtOk}</em> : <em className="no">{x.rtExp(levelWord(r.expect, lang))}</em>}</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function DemoPanel() {
  const lang = useLang()
  const x = X[lang]
  const reset = () => {
    try { ['recentVisits', 'pendingVisits', 'pendingSends', 'priorCode', 'demoMode'].forEach((k) => localStorage.removeItem(k)) } catch { /* ignore */ }
    window.location.reload()
  }
  return (
    <div className="demo">
      <div className="demo-top"><span className="demo-tag">{x.demoTag}</span><span>{x.demoTop}</span></div>
      <div className="fc-grid">{SCENARIOS.map((s) => <Card key={s.id} s={s} lang={lang} />)}</div>
      <RedTeam lang={lang} />
      <button type="button" className="demo-reset" onClick={reset}>{x.demoReset}</button>
    </div>
  )
}
