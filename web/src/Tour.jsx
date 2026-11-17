import React, { useEffect, useRef, useState } from 'react'
import { startScenario, SCENARIOS } from './Demo'
import './tour.css'

// Guided demo: Play highlights real elements in the real app and explains each in a tooltip.
// Steps with `click` wait for the user to tap the highlighted control; `wait` advances by itself when an element appears.
// the tour fills the age field for the user (4 days); age is stored as days only
// Desktop: the app sits inside .phone. Phone: no frame, so selectors have no .phone prefix.
const DESK = window.matchMedia('(min-width: 900px)').matches
const P = DESK ? '.phone ' : ''
const fillAge = () => {
  const ins = [...document.querySelectorAll(P + '.sx-grid input')]
  const days = ins[ins.length - 1]
  if (!days || days.value) return
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(days, '4')
  days.dispatchEvent(new Event('input', { bubbles: true }))
}
const STEPS = [
  { id: 'intro', title: 'A visit in 90 seconds', text: 'You are the ASHA. A baby, 4 days old, has refused the breast since last night. Follow the highlights. You tap, the app explains.', cta: 'Start the visit', start: true },
  { sel: P + '.sx-text, ' + P + '.sx-transcript', title: 'Describe it your way', text: 'She speaks or types what she sees, in Hindi, Hinglish or English. Here the text is already filled in.', next: true },
  { sel: P + '.sx-rows', title: 'Or just tick', text: 'A visit can be done with no typing at all. Typed and ticked signs are always added together.', next: true },
  { sel: P + '.sx-fill', title: 'Continue', text: 'Tap Continue.', click: true },
  { sel: P + '.sx-chips', title: 'Signs found', text: 'Plain rules found "Not feeding". Anything the AI only suggests carries an "AI suggested" tag and counts only after she taps it.', next: true },
  { sel: P + '.sx-fill', title: 'Confirm', text: 'Tap Confirm. She stays in charge.', click: true },
  { sel: P + '.sx-qtext', wait: P + '.sx-banner', title: 'The agent asks', text: 'It asks only a question that could change the danger level, from a doctor-reviewed bank. Tap No to each one. "Show result now" is always available and never gives Green.', hint: true },
  { sel: P + '.sx-banner', title: 'The result', text: 'Amber. A safety floor written in plain Python sets the minimum level. The AI can raise it, never lower it.', next: true },
  { sel: P + '.sx-steps', title: 'Every step is shown', text: 'Each step carries a tag: AI suggested, Worker confirmed, From rules, or Done. Nothing is hidden.', next: true },
  { sel: P + '.sx-fill', title: 'Review and send', text: 'Tap Review and send. Nothing has been saved or sent yet.', click: true },
  { sel: P + '.sx-grid', title: 'A draft, not a diagnosis', text: 'The note and record are filled in from the visit and she can edit every field. Age is stored as days only: no names, no birth dates. We entered 4 days for you.', next: true, enter: fillAge },
  { sel: P + '.sx-fill', title: 'Save', text: 'Tap the green button to save the visit. Nothing leaves the phone before this tap.', click: true },
  { sel: P + '.sx-fill', title: 'Send', text: 'Last check. Nothing is sent until this tap.', click: true },
  { id: 'end', title: 'That is the visit', text: 'Saved under a random patient code, no names. The doctor inbox now shows it, tagged DEMO DATA.', cta: 'Open care team view', end: true }
]

const visible = (el) => { const r = el.getBoundingClientRect(); return r.width > 4 && r.height > 4 }

export default function Tour() {
  const [i, setI] = useState(-1)
  const [rect, setRect] = useState(null)
  const [phone, setPhone] = useState(null)
  const idx = useRef(i)
  idx.current = i
  const step = STEPS[i]

  useEffect(() => {
    const open = () => { setI(0); setRect(null) }
    window.addEventListener('asha-tour', open)
    return () => window.removeEventListener('asha-tour', open)
  }, [])

  const close = () => { setI(-1); setRect(null) }
  const go = (n) => setI(Math.max(0, Math.min(STEPS.length - 1, n)))

  // follow the target every frame (so page or phone scrolling never detaches the spotlight)
  const [anim, setAnim] = useState(true)
  const last = useRef('')
  useEffect(() => {
    if (i < 0) return undefined
    const s = STEPS[i]
    s.done = false
    let live = true, scrolled = false, raf = 0
    const born = performance.now()
    setAnim(true)
    const ta = setTimeout(() => setAnim(false), 650)
    const el = () => s.sel && [...document.querySelectorAll(s.sel)].find(visible)
    const loop = () => {
      if (!live) return
      const wrap = document.querySelector('.phone-wrap')
      if (wrap) { const r = wrap.getBoundingClientRect(); const k = `p${Math.round(r.left)}${Math.round(r.top)}`; if (k !== last.current + 'p') { last.current = k + ''; setPhone({ left: r.left, right: r.right, top: r.top }) } }
      if (s.sel && performance.now() - born > (s.click || s.wait ? 650 : 250)) {
        const t = el()
        if (t) {
          if (s.enter && !s.done) { s.done = true; s.enter() }
          const r = t.getBoundingClientRect()
          const ph = DESK ? document.querySelector('.phone')?.getBoundingClientRect() : { top: 0, bottom: window.innerHeight }
          if (!scrolled && ph && (r.bottom > ph.bottom - 6 || r.top < ph.top + 24)) { scrolled = true; t.scrollIntoView({ block: 'center', behavior: 'smooth' }) }
          setRect((o) => (o && o.top === r.top && o.left === r.left && o.width === r.width && o.height === r.height ? o : { top: r.top, left: r.left, width: r.width, height: r.height }))
        }
        if (s.wait && document.querySelector(s.wait)) { live = false; setTimeout(() => idx.current === i && go(i + 1), 500); return }
      }
      raf = requestAnimationFrame(loop)
    }
    if (!s.sel) setRect(null)
    raf = requestAnimationFrame(loop)
    const onClick = (e) => { if (s.click && e.target.closest && e.target.closest(s.sel)) { live = false; setRect(null); setTimeout(() => idx.current === i && go(i + 1), 750) } }
    document.addEventListener('click', onClick, true)
    return () => { live = false; cancelAnimationFrame(raf); clearTimeout(ta); document.removeEventListener('click', onClick, true) }
  }, [i])

  if (i < 0) return null
  const start = () => { startScenario(SCENARIOS[1]); document.querySelector('.phone-wrap')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); go(1) }
  const w = 350
  const ph = phone || { left: window.innerWidth - 480, right: window.innerWidth - 80, top: 80 }
  const left = ph.left > w + 30 ? ph.left - w - 22 : ph.right + 18
  const top = rect ? Math.min(Math.max(rect.top + rect.height / 2 - 110, 76), window.innerHeight - 280) : Math.max(96, window.innerHeight / 2 - 160)
  const dots = STEPS.length
  // phone: full-width card, at the bottom unless the highlighted control is in the lower half
  const tipStyle = DESK ? { left, top, width: w } : { left: 12, right: 12, ...(rect && rect.top + rect.height / 2 > window.innerHeight / 2 ? { top: 12 } : { bottom: 12 }) }

  return (
    <>
      {rect && step.sel && <div className={`tr-spot ${step.click ? 'pulse' : ''} ${anim ? 'anim' : ''}`} style={{ top: rect.top - 6, left: rect.left - 6, width: rect.width + 12, height: rect.height + 12 }} />}
      {!rect && <div className="tr-dim" />}
      <div className={`tr-tip ${anim ? 'anim' : ''}`} style={tipStyle} role="dialog" aria-live="polite">
        <div className="tr-prog"><span>{i === 0 ? 'Guided demo' : `Step ${Math.min(i, dots - 2)} of ${dots - 2}`}</span><button type="button" onClick={close} aria-label="Close the tour">Skip tour</button></div>
        <h3>{step.title}</h3>
        <p>{step.text}</p>
        {step.click && <div className="tr-hint">{DESK ? 'Tap the highlighted button in the phone.' : 'Tap the highlighted button.'}</div>}
        {step.hint && <div className="tr-hint">Keep answering. The tour continues at the result.</div>}
        <div className="tr-bar">
          {i > 1 && !step.end && <button type="button" className="tr-ghost" onClick={() => go(i - 1)}>Back</button>}
          {(step.click || step.hint) && !step.end && <button type="button" className="tr-ghost" onClick={() => go(i + 1)}>Skip step</button>}
          {step.next && <button type="button" className="tr-main" onClick={() => go(i + 1)}>Next</button>}
          {step.start && <button type="button" className="tr-main" onClick={start}>{step.cta}</button>}
          {step.end && <><button type="button" className="tr-ghost" onClick={() => { startScenario(SCENARIOS[1]); go(1) }}>Replay</button><a className="tr-main" href="#care" onClick={close}>{step.cta}</a></>}
        </div>
      </div>
    </>
  )
}
