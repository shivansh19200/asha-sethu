import React, { useEffect, useRef, useState } from 'react'
import rules from '../../data/rules.json'
import sb from '../../data/scoreboard.json'
import { Logo } from './Side'
import './landing.css'
import DemoPanel from './Demo'
import Scene from './Scene'
import Story from './Story'
import Tour from './Tour'
const play = () => window.dispatchEvent(new Event('asha-tour'))

const reviewed = rules.signs.filter((s) => s.review_status === 'reviewed').length
const pct = (x) => Math.round(x * 100)
const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

// adds .in to every .rv element when it scrolls into view; also drives the top progress bar and nav highlight
function useScrollFx(setActive, bar, setScrolled) {
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && e.target.classList.add('in')), { threshold: 0.18 })
    document.querySelectorAll('.rv').forEach((el) => io.observe(el))
    const secs = [...document.querySelectorAll('section[data-nav]')]
    const onScroll = () => {
      const h = document.documentElement
      if (bar.current) bar.current.style.transform = `scaleX(${h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)})`
      const y = window.innerHeight * 0.4
      const cur = secs.filter((s) => s.getBoundingClientRect().top < y).pop()
      setActive(cur ? cur.id : '')
      setScrolled(h.scrollTop > 40)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { io.disconnect(); window.removeEventListener('scroll', onScroll) }
  }, [])
}

function Count({ to, suffix = '', dur = 1400 }) {
  const ref = useRef(null)
  const [v, setV] = useState(0)
  useEffect(() => {
    const el = ref.current
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const t0 = performance.now()
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / dur)
        setV(Math.round(to * (1 - Math.pow(1 - p, 3))))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, { threshold: 0.6 })
    io.observe(el)
    return () => io.disconnect()
  }, [to])
  return <span ref={ref}>{v}{suffix}</span>
}

const Bar = ({ label, value, tone, note }) => (
  <div className="ev-row">
    <div className="ev-lab">{label}</div>
    <div className="ev-track"><div className={`ev-fill ${tone}`} style={{ '--w': `${value}%` }} /></div>
    <div className="ev-val">{note}</div>
  </div>
)

export default function Landing({ children }) {
  const [active, setActive] = useState('')
  const bar = useRef(null)
  const [scrolled, setScrolled] = useState(false)
  useScrollFx(setActive, bar, setScrolled)
  const o = sb.ours, b = sb.baseline
  const L = sb.by_language
  const nav = [['does', 'What it does'], ['story', 'Story'], ['how', 'How it works'], ['safety', 'Safety'], ['evidence', 'Evidence'], ['review', 'Review'], ['try', 'Try it']]
  return (
    <div className="ld">
      <div className="ld-progress"><div ref={bar} /></div>
      <header className={`ld-nav ${scrolled ? 'sc' : ''}`}>
        <button className="ld-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><Logo size={30} /> Asha Sethu</button>
        <nav>{nav.map(([id, t]) => <button key={id} className={active === id ? 'on' : ''} onClick={() => go(id)}>{t}</button>)}</nav>
        <div className="ld-nav-r">
          <a href="#care" className="ld-link">Care team view</a>
          <button className="ld-cta" onClick={() => { go('try'); setTimeout(play, 700) }}>Play demo</button>
        </div>
      </header>

      <section className="ld-hero">
        <div className="ld-hero-in">
          <div className="ld-eyebrow rv">Code for a Billion · Built with AgentFoundry</div>
          <h1 className="rv" style={{ '--d': '80ms' }}>A second pair of eyes<br />for every ASHA home visit.</h1>
          <p className="rv" style={{ '--d': '160ms' }}>She describes a sick newborn or mother. An AI agent picks its own next step, asks only what could change the danger level, and shows every step it took. It never says Green when it is not sure.</p>
          <div className="ld-actions rv" style={{ '--d': '240ms' }}>
            <button className="ld-play" onClick={() => { go('try'); setTimeout(play, 700) }}><i />Play guided demo</button>
            <button className="ld-ghost" onClick={() => go('does')}>What does it do?</button>
            <button className="ld-ghost" onClick={() => go('try')}>Open the live app ↓</button>
          </div>
        </div>
        <div className="ld-hero-card rv" style={{ '--d': '200ms' }}>
          <div className="hc-banner"><span className="hc-warn">!</span><div><b>Red</b><span>Go to the hospital now.</span></div></div>
          <div className="hc-steps">
            {[['Heard 2 signs', 'Worker confirmed'], ['Asked: Is the baby feeding poorly? Yes', 'Worker confirmed'], ['Escalated Red', 'From rules'], ['Prepared referral (draft, not sent)', 'From rules']].map(([t, g], i) => (
              <div key={t} className="hc-step" style={{ '--i': i }}><i>✓</i><div>{t}<small>{g}</small></div></div>
            ))}
          </div>
          <div className="hc-foot">Nothing is sent until the worker taps.</div>
        </div>
        <button className="ld-scroll" onClick={() => go('problem')} aria-label="Scroll down"><span /></button>
      </section>

      <section id="does" data-nav className="ld-sec">
        <div className="ld-wrap">
          <div className="ld-kicker rv">What it does</div>
          <h2 className="rv" style={{ '--d': '60ms' }}>It carries the alert from the doorstep to the health centre.</h2>
          <p className="ld-lead rv" style={{ '--d': '120ms' }}>An ASHA visits a home and sees a sick baby or mother. She tells the app what she sees. It checks danger signs against doctor-reviewed rules and sends a clear Red, Amber or Unsure alert, with the referral ready for the health centre.</p>
          <div className="sc-wrap rv" style={{ '--d': '160ms' }}><Scene /></div>
          <div className="ld-three">
            {[['Describe', 'Speak, type or tick the signs she sees, in Hindi, Hinglish or English.'], ['Check', 'An AI agent asks only the questions that matter. A plain-code safety floor sets the minimum level.'], ['Refer', 'A draft referral and visit record are ready. Nothing is saved or sent until she taps.']].map(([t, d], i) => (
              <div key={t} className="rv" style={{ '--d': `${i * 110}ms` }}><b>{t}</b><span>{d}</span></div>
            ))}
          </div>
        </div>
      </section>

      <section id="problem" className="ld-sec alt">
        <div className="ld-wrap">
          <div className="ld-kicker rv">The problem</div>
          <h2 className="rv" style={{ '--d': '60ms' }}>The first health contact is often an ASHA at the door.</h2>
          <p className="ld-lead rv" style={{ '--d': '120ms' }}>A danger sign missed at home can become a delay in reaching care. Printed job aids do not handle Hindi, Hinglish, misspellings or "no fever".</p>
          <div className="ld-stats">
            {[[19, '', 'newborn deaths per 1,000 live births', 'Neonatal mortality rate, 2021'], [27, '', 'infant deaths per 1,000 live births', 'Infant mortality rate, 2021'], [93, '', 'maternal deaths per 100,000 live births', 'Maternal mortality ratio, 2019-21']].map(([n, s, t, c], i) => (
              <div key={t} className="ld-stat rv" style={{ '--d': `${i * 120}ms` }}>
                <b><Count to={n} suffix={s} /></b><span>{t}</span><small>{c}</small>
              </div>
            ))}
          </div>
          <div className="ld-src rv">Source: Sample Registration System (SRS) 2021, Registrar General of India, as reported by the Ministry of Health.</div>
        </div>
      </section>

      <section id="story" data-nav className="ld-sec">
        <div className="ld-wrap">
          <div className="ld-kicker rv">The same visit, twice</div>
          <h2 className="rv" style={{ '--d': '60ms' }}>What changes when the ASHA has a second pair of eyes.</h2>
          <Story />
        </div>
      </section>

      <section id="how" data-nav className="ld-sec alt">
        <div className="ld-wrap">
          <div className="ld-kicker rv">How it works</div>
          <h2 className="rv" style={{ '--d': '60ms' }}>Four steps. The worker stays in charge.</h2>
          <div className="ld-flow">
            {[['1', 'Describe', 'Speak, type, or tick a checklist. Hindi, Hinglish or English. A visit can be done with no typing.'], ['2', 'Agent asks', 'It picks the single question most likely to change the danger level, from a fixed, doctor-reviewed bank.'], ['3', 'Floor decides', 'Plain code sets the minimum level. The agent can raise it, never lower it. Unclear means Unsure, not Green.'], ['4', 'Worker confirms', 'The note, record and referral are drafts. Nothing is saved or sent until she taps.']].map(([n, t, d], i) => (
              <div key={n} className="ld-step rv" style={{ '--d': `${i * 110}ms` }}>
                <div className="ld-step-n">{n}</div><h3>{t}</h3><p>{d}</p>
              </div>
            ))}
          </div>
          <div className="ld-tags rv">
            {['AI suggested', 'Worker confirmed', 'From rules', 'Done'].map((t) => <span key={t}>{t}</span>)}
            <em>Every step carries one of these four tags.</em>
          </div>
        </div>
      </section>

      <section id="safety" data-nav className="ld-sec">
        <div className="ld-wrap two">
          <div>
            <div className="ld-kicker rv">Safety design</div>
            <h2 className="rv" style={{ '--d': '60ms' }}>The AI is never the last line of defence.</h2>
            <p className="ld-lead rv" style={{ '--d': '120ms' }}>Fixed rules in plain Python compute a minimum danger level from a versioned, sourced rule file. After every agent step, code re-checks the result outside the model.</p>
            <ul className="ld-list rv" style={{ '--d': '180ms' }}>
              <li>Final level = the higher of the rules floor and the agent's suggestion</li>
              <li>Green only if the checklist is finished and nothing is unclear</li>
              <li>The browser never talks to the database; the server key stays on the server</li>
              <li>No names, no initials: a random patient code and age in days</li>
            </ul>
          </div>
          <div className="ld-diagram rv" style={{ '--d': '140ms' }}>
            <div className="dg-title">Fever and foul-smelling discharge</div>
            {[['Rules floor', 'Amber', 'amber', 60], ['Agent suggests', 'Red', 'red', 100], ['Final level', 'Red', 'red', 100]].map(([l, v, tone, w], i) => (
              <div key={l} className="dg-row"><span>{l}</span><div className="dg-track"><div className={`dg-fill ${tone}`} style={{ '--w': `${w}%`, '--d': `${300 + i * 250}ms` }} /></div><b>{v}</b></div>
            ))}
            <div className="dg-note">If the agent had suggested Green, the final level would stay Amber. It can only go up.</div>
          </div>
        </div>
      </section>

      <section id="evidence" data-nav className="ld-sec alt">
        <div className="ld-wrap">
          <div className="ld-kicker rv">Evidence</div>
          <h2 className="rv" style={{ '--d': '60ms' }}>Measured against a printed checklist.</h2>
          <p className="ld-lead rv" style={{ '--d': '120ms' }}>{o.cases} test cases written by the builder, run offline with no AI model. The baseline is a printed-checklist stand-in: English keywords only, no negation, no questions.</p>
          <div className="ld-ev rv" style={{ '--d': '160ms' }}>
            <div className="ev-head"><span /><span>Printed checklist</span><span>Asha Sethu</span></div>
            <Bar label="Red cases caught" value={pct(b.red_caught / b.red_total)} tone="muted" note={`${b.red_caught}/${b.red_total}`} />
            <Bar label="" value={pct(o.red_caught / o.red_total)} tone="pri" note={`${o.red_caught}/${o.red_total}`} />
            <Bar label="Level accuracy" value={pct(b.level_accuracy)} tone="muted" note={`${pct(b.level_accuracy)}%`} />
            <Bar label="" value={pct(o.level_accuracy)} tone="pri" note={`${pct(o.level_accuracy)}%`} />
          </div>
          <div className="ld-lang rv" style={{ '--d': '200ms' }}>
            {[['English', 'en'], ['Hindi', 'hi'], ['Hinglish', 'hinglish']].map(([n, k]) => (
              <div key={k}><b>{pct(L[k].ours.level_accuracy)}%</b><span>{n}</span><small>checklist {pct(L[k].baseline.level_accuracy)}%</small></div>
            ))}
            <div><b>{sb.floor_test_1.passed}/{sb.floor_test_1.total}</b><span>floor test</span><small>code check, not a medical proof</small></div>
          </div>
          <div className="ld-src rv">Honest limits: cases are builder-written, so real-world scores will be lower. Free wording such as "baby looks fine" returns Unsure, which is safe but not Green.</div>
        </div>
      </section>

      <section id="review" data-nav className="ld-sec">
        <div className="ld-wrap">
          <div className="ld-kicker rv">Clinical review</div>
          <div className="ld-review rv" style={{ '--d': '80ms' }}>
            <img className="rv-photo" src="/dr-pratibha.jpg" alt="Dr Pratibha Aggarwal, obstetrician and gynaecologist" loading="lazy" />
            <div className="rv-badge">Rules v{rules.version}</div>
            <h2>Danger-sign levels reviewed by Dr Pratibha Aggarwal, obstetrician and gynaecologist.</h2>
            <div className="rv-who">Obstetrician, gynaecologist and IVF specialist · over 35 years of experience · New Delhi and Gurugram</div>
            <p>{reviewed} of {rules.signs.length} signs carry a reviewed verdict, each with a source and a version. One sign (heavy bleeding) is still pending and stays at Red until it is settled. Reviewed on 15 November 2026.</p>
            <div className="rv-note">Not clinically validated. The newborn signs have not had a paediatric review, and source page numbers are still being confirmed. This is an alert aid, not a diagnosis.</div>
          </div>
        </div>
      </section>

      <section id="try" data-nav className="ld-sec alt ld-try">
        <div className="ld-wrap two try">
          <div>
            <div className="ld-kicker rv">Try it</div>
            <h2 className="rv" style={{ '--d': '60ms' }}>The app is right here. Break it.</h2>
            <p className="ld-lead rv" style={{ '--d': '120ms' }}>Flip a scenario card to see what should happen, then run it in the phone. Or fire five tricky phrases at the real rules.</p>
            <div className="rv" style={{ '--d': '180ms', marginTop: 22 }}><DemoPanel /></div>
            <div className="ld-where rv" style={{ '--d': '200ms' }}>
              <b>Two ways to use it</b>
              <span><i>Desktop</i> You are here: this page, with the working app in the phone on the right.</span>
              <span><i>Phone</i> Open this same link on a phone and the app fills the screen with none of this page. Use the browser menu, "Add to Home screen", to keep it like an app.</span>
            </div>
            <a href="#care" className="ld-ghost dark rv" style={{ '--d': '240ms', marginTop: 22 }}>Open the care team view</a>
          </div>
          <div className="phone-wrap rv" style={{ '--d': '120ms' }}><div className="phone">{children}</div></div>
        </div>
      </section>

      <Tour />
      <footer className="ld-foot">
        <div className="ld-wrap">
          <div className="ld-brand-line"><Logo size={26} /> Asha Sethu</div>
          <p>Prototype for Code for a Billion. Built with AgentFoundry. Security is prototype-level: real logins and audit logs come before any field use. The care team access code is a prototype gate, not real security. A shadow pilot with real ASHAs is planned, not done.</p>
        </div>
      </footer>
    </div>
  )
}
