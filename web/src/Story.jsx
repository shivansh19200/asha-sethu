import React, { useState } from 'react'

// Hand-drawn storyboard: the same visit without and with Asha Sethu. Flip each frame. Illustrative, not data.
const INK = '#2B2118'
const Sketch = () => (
  <defs>
    <filter id="sk" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.025" numOctaves="2" seed="4" result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale="4" /></filter>
  </defs>
)
const Ground = ({ c = '#B9AE98' }) => <path d="M8 205Q90 197 180 205T352 203" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" />
const Hut = ({ x = 18 }) => (
  <g transform={`translate(${x} 128)`} stroke={INK} strokeWidth="3" strokeLinejoin="round">
    <rect x="8" y="30" width="66" height="46" fill="#F3E2C4" /><path d="M0 34L41 4L82 34Z" fill="#C98A3B" /><rect x="34" y="46" width="16" height="30" fill="#8A5A2B" />
  </g>
)
const Asha = ({ x = 150, y = 100, phone, paper }) => (
  <g transform={`translate(${x} ${y})`} stroke={INK} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round">
    <path d="M4 100Q-2 56 18 36Q38 18 58 36Q78 56 72 100Z" fill="#D4572A" /><circle cx="38" cy="14" r="17" fill="#E0B48C" /><path d="M21 8Q22 -14 40 -13Q58 -12 56 6Q44 -6 21 8Z" fill={INK} /><circle cx="38" cy="-17" r="8" fill={INK} />
    <circle cx="32" cy="14" r="1.6" fill={INK} /><circle cx="44" cy="14" r="1.6" fill={INK} /><path d="M32 22q6 4 12 0" fill="none" />
    {phone && <g transform="rotate(12 70 58)"><rect x="58" y="34" width="26" height="46" rx="5" fill="#10261E" /><rect x="61" y="38" width="20" height="36" rx="2" fill="#fff" stroke="none" />{phone}</g>}
    {paper && <g transform="rotate(-8 62 60)"><rect x="52" y="36" width="34" height="44" fill="#fff" />{[44, 52, 60, 68].map((yy) => <path key={yy} d={`M57 ${yy}H81`} stroke="#9AA" strokeWidth="2" />)}</g>}
  </g>
)
const Mother = ({ x = 255, y = 112, hot }) => (
  <g transform={`translate(${x} ${y})`} stroke={INK} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round">
    <path d="M2 92Q-2 54 16 38Q34 24 52 38Q68 54 62 92Z" fill="#C9A227" /><circle cx="32" cy="14" r="15" fill="#D9A57A" /><path d="M17 10Q18 -8 33 -8Q48 -8 47 8Q36 -2 17 10Z" fill={INK} />
    <ellipse cx="18" cy="62" rx="20" ry="14" fill="#F4E3C8" transform="rotate(-16 18 62)" /><circle cx="2" cy="52" r="10" fill="#E0AE86" />
    {hot && [0, 1, 2].map((i) => <path className="sy-heat" style={{ animationDelay: `${i * 0.25}s` }} key={i} d={`M${-12 + i * 12} 36q4-6 0-12t0-12`} fill="none" stroke="#B3261E" strokeWidth="2.6" />)}
  </g>
)
const Say = ({ x, y, w, children, tone = '#fff' }) => (
  <g>
    <rect x={x} y={y} width={w} height="34" rx="14" fill={tone} stroke={INK} strokeWidth="2.6" />
    <text x={x + w / 2} y={y + 22} textAnchor="middle" className="hand" fontSize="17" fill={INK}>{children}</text>
  </g>
)
const Clock = ({ x, y, hands = 0 }) => (
  <g transform={`translate(${x} ${y})`} stroke={INK} strokeWidth="3" strokeLinecap="round">
    <circle r="22" fill="#fff" /><path className="sy-hand" d={hands ? 'M0 0V-14' : 'M0 0V-14'} fill="none" /><path d="M0 0L9 4" fill="none" />
  </g>
)

const FRAMES = [
  {
    title: '1  The visit', cap: ['A baby is very hot and will not feed. The ASHA has a printed card.', 'She describes it in her own words. Hindi, Hinglish or English.'],
    without: (<><Hut /><Asha paper /><Mother hot /><Say x={92} y={46} w={118}>Is it serious?</Say><text x="298" y="102" className="hand" fontSize="18" fill="#B3261E">very hot!</text></>),
    withApp: (<><Hut /><Asha phone={<path d="M66 50q3-6 6 0t6 0" fill="none" stroke="#0E6B4F" strokeWidth="2.4" />} /><Mother hot /><Say x={70} y={40} w={190} tone="#E3F1EA">baby hot, not feeding</Say></>)
  },
  {
    title: '2  The decision', cap: ['An English-only card with no way to say "no fever". Wait and see?', 'The agent asks only what matters, shows every step, and sets Red.'],
    without: (<><rect x="40" y="30" width="120" height="150" fill="#fff" stroke={INK} strokeWidth="3" />{[52, 70, 88, 106, 124, 142].map((y) => <path key={y} d={`M54 ${y}H146`} stroke="#9AA" strokeWidth="3" />)}<text x="100" y="164" textAnchor="middle" className="hand" fontSize="15" fill="#6B7D74">English only</text><Clock x={250} y={84} hands /><Say x={196} y={128} w={140}>wait and see?</Say></>),
    withApp: (<><rect x="86" y="14" width="150" height="180" rx="18" fill="#10261E" stroke={INK} strokeWidth="3" /><rect x="94" y="26" width="134" height="160" rx="10" fill="#fff" /><rect className="sy-flash" x="94" y="26" width="134" height="40" rx="10" fill="#B3261E" /><text x="161" y="53" textAnchor="middle" className="hand" fontSize="19" fill="#fff">Red, go now</text>{[84, 108, 132].map((y) => <g key={y}><path d={`M106 ${y}l5 5 9-11`} stroke="#0E6B4F" strokeWidth="3" fill="none" /><path d={`M130 ${y}H214`} stroke="#B9C9BF" strokeWidth="4" /></g>)}</>)
  },
  {
    title: '3  The outcome', cap: ['No alert, no record. The family decides alone, and the delay grows.', 'The alert and the draft referral reach the health centre while she is still there.'],
    without: (<><Hut x={10} /><path d="M100 188Q190 150 290 186" fill="none" stroke="#9AA" strokeWidth="3" strokeDasharray="2 9" strokeLinecap="round" className="sy-trail" /><g transform="translate(268 120)" stroke={INK} strokeWidth="3"><rect y="26" width="64" height="52" fill="#fff" /><rect y="26" width="64" height="9" fill="#9AA" /><path d="M32 8V22M25 15H39" stroke="#B9AE98" strokeWidth="5" /></g><Clock x={190} y={96} hands /><text x="190" y="140" textAnchor="middle" className="hand" fontSize="18" fill="#6B7D74">hours later...</text></>),
    withApp: (<><Hut x={10} /><path d="M100 160Q190 90 290 150" fill="none" stroke="#B3261E" strokeWidth="4" strokeDasharray="2 9" strokeLinecap="round" className="sy-trail" /><g transform="translate(268 120)" stroke={INK} strokeWidth="3"><rect y="26" width="64" height="52" fill="#fff" /><rect y="26" width="64" height="9" fill="#0E6B4F" /><path d="M32 8V22M25 15H39" stroke="#B3261E" strokeWidth="5" /></g><circle className="sy-pop" cx="190" cy="104" r="20" fill="#1E7A3C" stroke={INK} strokeWidth="3" /><path d="M180 104l7 7 13-15" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" /><text x="190" y="146" textAnchor="middle" className="hand" fontSize="18" fill="#0B4A37">received</text></>)
  }
]

function Frame({ f, on }) {
  const [flip, setFlip] = useState(false)
  const v = on === undefined ? flip : on
  return (
    <div className={`sy-card ${v ? 'on' : ''}`}>
      <div className="sy-in">
        <div className="sy-face sy-without">
          <div className="sy-tag">Without</div>
          <svg viewBox="0 0 360 230" role="img" aria-label={f.cap[0]}><Sketch /><g filter="url(#sk)"><Ground />{f.without}</g></svg>
          <div className="sy-t"><b>{f.title}</b><p>{f.cap[0]}</p></div>
          <button type="button" className="sy-flip" onClick={() => setFlip(true)}>Flip: with Asha Sethu</button>
        </div>
        <div className="sy-face sy-with">
          <div className="sy-tag on">With Asha Sethu</div>
          <svg viewBox="0 0 360 230" role="img" aria-label={f.cap[1]}><Sketch /><g filter="url(#sk)"><Ground c="#7FC2A0" />{f.withApp}</g></svg>
          <div className="sy-t"><b>{f.title}</b><p>{f.cap[1]}</p></div>
          <button type="button" className="sy-flip" onClick={() => setFlip(false)}>Flip back</button>
        </div>
      </div>
    </div>
  )
}

export default function Story() {
  const [all, setAll] = useState(false)
  return (
    <div>
      <div className="sy-bar">
        <div className="sy-seg"><button type="button" className={!all ? 'on' : ''} onClick={() => setAll(false)}>Without</button><button type="button" className={all ? 'on' : ''} onClick={() => setAll(true)}>With Asha Sethu</button></div>
        <span>Same visit, same baby. Flip a frame, or switch the whole story.</span>
      </div>
      <div className="sy-grid">{FRAMES.map((f) => <Frame key={f.title} f={f} on={all ? true : undefined} />)}</div>
      <div className="ld-src">An illustrated story, not data. The point: the alert and the record exist while the health worker is still at the door.</div>
    </div>
  )
}
