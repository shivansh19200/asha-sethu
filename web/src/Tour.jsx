import React, { useEffect, useRef, useState } from 'react'
import { startScenario, SCENARIOS } from './Demo'
import { getLang } from './ui'
import './tour.css'

// Guided demo: Play highlights real elements in the real app and explains each in a tooltip.
// Steps with `click` wait for the user to tap the highlighted control; `wait` advances by itself when an element appears.
// the tour fills the age field for the user (4 days). The worker can enter age in years, months, weeks or days.
// Hindi: each step has `hi` [title, text] and an `audio` clip in public/audio/hi/ (played only in Hindi, can be muted).
// Desktop: the app sits inside .phone. Phone: no frame, so selectors have no .phone prefix.
const DESK = window.matchMedia('(min-width: 900px) and (hover: hover) and (pointer: fine)').matches
const P = DESK ? '.phone ' : ''
const fillAge = () => {
  const ins = [...document.querySelectorAll(P + '.sx-grid input')]
  const days = ins[ins.length - 1]
  if (!days || days.value) return
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(days, '4')
  days.dispatchEvent(new Event('input', { bubbles: true }))
}
const STEPS = [
  { id: 'intro', audio: 'hi_01_intro', title: 'A visit in 90 seconds', text: 'You are the ASHA. A baby, 4 days old, has refused the breast since last night. Follow the highlights. You tap, the app explains.', hi: ['एक विज़िट, 90 सेकंड में', 'चलिए, शुरू करते हैं। मान लीजिए आप आशा दीदी हैं, और एक चार दिन का बच्चा कल रात से दूध नहीं पी रहा। घबराइए मत, मैं हर क़दम पर साथ हूँ। जहाँ चमकता निशान दिखे, वहाँ टैप कीजिए।'], cta: 'Start the visit', start: true },
  { sel: P + '.sx-text, ' + P + '.sx-transcript', audio: 'hi_02_describe', title: 'Describe it your way', text: 'She speaks or types what she sees, in Hindi, Hinglish or English. Here the text is already filled in.', hi: ['अपने तरीक़े से बताइए', 'सबसे पहले, जो देखा, बस अपने तरीक़े से बता दीजिए। हिंदी, हिंग्लिश, अंग्रेज़ी, जैसे आसान लगे। बोलें या लिखें, दोनों चलेगा। यहाँ मैंने पहले से लिख दिया है।'], next: true },
  { sel: P + '.sx-rows', audio: 'hi_03_tick', title: 'Or just tick', text: 'A visit can be done with no typing at all. Typed and ticked signs are always added together.', hi: ['या बस टिक कीजिए', 'और अगर लिखने का मन न हो, तो कोई बात नहीं। नीचे सूची में बस लक्षणों पर टिक लगा दीजिए। लिखा हुआ और टिक किया हुआ, दोनों साथ जुड़ जाते हैं।'], next: true },
  { sel: P + '.sx-fill', audio: 'hi_04_continue', title: 'Continue', text: 'Tap Continue.', hi: ['आगे बढ़ें', '"आगे बढ़ें" दबाइए।'], click: true },
  { sel: P + '.sx-chips', audio: 'hi_05_signs', title: 'Signs found', text: 'Plain rules found "Not feeding". Anything the AI only suggests carries an "AI suggested" tag and counts only after she taps it.', hi: ['मिले हुए लक्षण', 'देखिए, ऐप ने पहचान लिया, "दूध नहीं पी रहा"। कभी AI भी कोई लक्षण सुझाता है। तब उस पर "AI ने सुझाया" लिखा होता है। और वह तभी जुड़ता है जब आप उसे टैप करें।'], next: true },
  { sel: P + '.sx-fill', audio: 'hi_06_confirm', title: 'Confirm', text: 'Tap Confirm. She stays in charge.', hi: ['पुष्टि करें', 'सब ठीक लगे तो "पुष्टि करें" दबाइए। आख़िरी फ़ैसला हमेशा आपका ही रहता है।'], click: true },
  { sel: P + '.sx-qtext', wait: P + '.sx-banner', audio: 'hi_07_agent', title: 'The agent asks', text: 'It asks only a question that could change the danger level, from a doctor-reviewed bank. Tap No to each one. "Show result now" is always available and never gives Green.', hi: ['ऐप सवाल पूछता है', 'अब ऐप कुछ सवाल पूछेगा। सिर्फ़ वही, जिनसे ख़तरे का स्तर बदल सकता है। ये सवाल डॉक्टर ने देखे हुए हैं। यहाँ हर सवाल पर "नहीं" दबाते जाइए। जल्दी हो, तो "अभी परिणाम दिखाएँ" दबा सकती हैं। उसमें ऐप कभी "हरा" नहीं दिखाएगा।'], hint: true },
  { sel: P + '.sx-banner', audio: 'hi_08_result', title: 'The result', text: 'Amber means go to the health centre today. Red means go to the hospital now. If it says Unsure, check the list again or ask a doctor.', hi: ['नतीजा', 'ये रहा नतीजा, पीला। पीले का मतलब, आज ही स्वास्थ्य केंद्र जाना है। लाल आए तो अभी अस्पताल। और अगर "अनिश्चित" आए, तो सूची एक बार फिर देख लीजिए या डॉक्टर से पूछ लीजिए।'], next: true },
  { sel: P + '.sx-steps', audio: 'hi_09_steps', title: 'What the app did', text: 'Below you can see what the app did. Take a look if you want.', hi: ['ऐप ने क्या किया', 'नीचे आप देख सकती हैं कि ऐप ने क्या-क्या किया। चाहें तो एक नज़र डाल लीजिए।'], next: true },
  { sel: P + '.sx-fill', audio: 'hi_10_review', title: 'Review and send', text: 'Tap Review and send. Nothing has been sent yet.', hi: ['समीक्षा करें और भेजें', 'अब "समीक्षा करें और भेजें" दबाइए। अभी तक कुछ भी भेजा नहीं गया है।'], click: true },
  { sel: P + '.sx-grid', audio: 'hi_11_draft', title: 'The referral note', text: 'The referral note is filled in. Fix anything that looks wrong. Age can be in years, months, weeks or days. No name needed. We entered 4 days for you.', hi: ['रेफ़रल का नोट', 'रेफ़रल का नोट अपने आप भर गया है। कुछ ग़लत लगे तो ठीक कर लीजिए। उम्र आप साल, महीने, सप्ताह या दिन, जिसमें चाहें भर सकती हैं। नाम की ज़रूरत नहीं। यहाँ हमने चार दिन भर दिए हैं।'], next: true, enter: fillAge },
  { sel: P + '.sx-fill', audio: 'hi_12_save', title: 'Save', text: 'Tap the green button to save the visit. Nothing leaves the phone before this.', hi: ['सहेजें', 'अब हरे बटन से विज़िट सहेज लीजिए। सहेजने से पहले कुछ भी फ़ोन से बाहर नहीं जाता।'], click: true },
  { sel: P + '.sx-fill', audio: 'hi_13_send', title: 'Send', text: 'Finally tap Send referral. Only then does the doctor get the news, not before.', hi: ['भेजें', 'आख़िर में "रेफ़रल भेजा जाए" दबाइए। तभी डॉक्टर तक ख़बर जाएगी, उससे पहले नहीं।'], click: true },
  { id: 'end', audio: 'hi_14_end', title: 'Done', text: 'That was quick. The visit took just a few taps, no long form, no hassle. And the doctor has the news.', hi: ['विज़िट पूरी', 'देखिए, बस कुछ ही टैप में विज़िट पूरी हो गई। न लंबा फ़ॉर्म, न कोई झंझट। और डॉक्टर तक ख़बर भी पहुँच गई।'], cta: 'Open care team view', end: true }
]

// Labels around the tooltip. Hindi wording needs a Hindi reader's check.
const UI = {
  en: { guided: 'Guided demo', step: (n, m) => `Step ${n} of ${m}`, skipTour: 'Skip tour', skipStep: 'Skip step', back: 'Back', next: 'Next', start: 'Start the visit', replay: 'Replay', care: 'Open care team view', tapDesk: 'Tap the highlighted button in the phone.', tapPhone: 'Tap the highlighted button.', keep: 'Keep answering. The tour continues at the result.', mute: 'Mute voice', unmute: 'Voice on' },
  hi: { guided: 'गाइडेड डेमो', step: (n, m) => `क़दम ${n} / ${m}`, skipTour: 'टूर छोड़ें', skipStep: 'यह क़दम छोड़ें', back: 'वापस', next: 'आगे', start: 'विज़िट शुरू करें', replay: 'फिर से चलाएँ', care: 'केयर टीम व्यू खोलें', tapDesk: 'फ़ोन में चमकते बटन पर टैप कीजिए।', tapPhone: 'चमकते बटन पर टैप कीजिए।', keep: 'जवाब देते रहिए। नतीजे पर टूर आगे बढ़ेगा।', mute: 'आवाज़ बंद', unmute: 'आवाज़ चालू' }
}
// The demo case, in the language of the app
const scenario = () => ({ ...SCENARIOS[1], text: getLang() === 'hi' ? 'बच्चा दूध नहीं पी रहा' : SCENARIOS[1].text })

const visible = (el) => { const r = el.getBoundingClientRect(); return r.width > 4 && r.height > 4 }

export default function Tour() {
  const [i, setI] = useState(-1)
  const [rect, setRect] = useState(null)
  const [phone, setPhone] = useState(null)
  const idx = useRef(i)
  idx.current = i
  const step = STEPS[i]
  const lang = getLang()
  const L = UI[lang]

  // Voice: one audio element, created inside the tap that opens the tour (phones only allow sound after a tap).
  const audioRef = useRef(null)
  const [muted, setMuted] = useState(() => { try { return localStorage.getItem('tourMute') === '1' } catch { return false } })
  const mutedRef = useRef(muted)
  mutedRef.current = muted
  const say = (n) => {
    const a = audioRef.current
    if (!a) return
    a.pause()
    const s = STEPS[n]
    if (getLang() !== 'hi' || mutedRef.current || !s || !s.audio) return
    a.src = `/audio/hi/${s.audio}.mp3`
    a.currentTime = 0
    const p = a.play()
    if (p && p.catch) p.catch(() => {})
  }
  const toggleMute = () => {
    const m = !muted
    setMuted(m)
    mutedRef.current = m
    try { localStorage.setItem('tourMute', m ? '1' : '0') } catch { /* ignore */ }
    if (m) { if (audioRef.current) audioRef.current.pause() } else say(i)
  }

  useEffect(() => {
    const open = () => { if (!audioRef.current) audioRef.current = new Audio(); setI(0); setRect(null); say(0) }
    window.addEventListener('asha-tour', open)
    return () => window.removeEventListener('asha-tour', open)
  }, [])

  // play the clip for each step after the first (the first plays from the opening tap)
  useEffect(() => {
    if (i > 0) say(i)
    if (i < 0 && audioRef.current) audioRef.current.pause()
  }, [i])

  const close = () => { if (audioRef.current) audioRef.current.pause(); setI(-1); setRect(null) }
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
  const start = () => { startScenario(scenario()); document.querySelector('.phone-wrap')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); go(1) }
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
        <div className="tr-prog"><span>{i === 0 ? L.guided : L.step(Math.min(i, dots - 2), dots - 2)}</span><span>{lang === 'hi' && <button type="button" onClick={toggleMute}>{muted ? L.unmute : L.mute}</button>} <button type="button" onClick={close} aria-label={L.skipTour}>{L.skipTour}</button></span></div>
        <h3>{lang === 'hi' && step.hi ? step.hi[0] : step.title}</h3>
        <p>{lang === 'hi' && step.hi ? step.hi[1] : step.text}</p>
        {step.click && <div className="tr-hint">{DESK ? L.tapDesk : L.tapPhone}</div>}
        {step.hint && <div className="tr-hint">{L.keep}</div>}
        <div className="tr-bar">
          {i > 1 && !step.end && <button type="button" className="tr-ghost" onClick={() => go(i - 1)}>{L.back}</button>}
          {(step.click || step.hint) && !step.end && <button type="button" className="tr-ghost" onClick={() => go(i + 1)}>{L.skipStep}</button>}
          {step.next && <button type="button" className="tr-main" onClick={() => go(i + 1)}>{L.next}</button>}
          {step.start && <button type="button" className="tr-main" onClick={start}>{L.start}</button>}
          {step.end && <><button type="button" className="tr-ghost" onClick={() => { startScenario(scenario()); go(1) }}>{L.replay}</button><a className="tr-main" href="#care" onClick={close}>{L.care}</a></>}
        </div>
      </div>
    </>
  )
}
