import React from 'react'
import sb from '../../data/scoreboard.json'

const Tick = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M8 12l3 3 5-6" /></svg>
export const Logo = ({ size = 34 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
    <rect width="40" height="40" rx="11" fill="#0E6B4F" />
    <path d="M11.5 21.9L8.5 20.8 M14.2 18.1L12.2 15.7 M18.4 16.1L17.9 13.0 M21.6 16.1L22.1 13.0 M25.8 18.1L27.8 15.7 M28.5 21.9L31.5 20.8" stroke="#F2A33A" strokeWidth="1.9" strokeLinecap="round" fill="none" />
    <path d="M14.6 25A5.4 5.4 0 0 1 25.4 25Z" fill="#F2A33A" />
    <path d="M7 33Q20 17 33 33" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    <path d="M6 33.6H34" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    <path d="M13 33.2V28.2M27 33.2V28.2" stroke="#9BE0C2" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
)

// Desktop-only pitch panel next to the phone frame. Numbers come from the real scoreboard file.
export default function Side() {
  const o = sb.ours, b = sb.baseline
  const pct = (x) => Math.round(x * 100) + '%'
  return (
    <div>
      <div className="side-brand"><Logo /> Asha Sethu</div>
      <h2 className="side-h">Danger-sign alerts for ASHA home visits</h2>
      <p className="side-p">She describes a sick newborn or mother. An AI agent picks its own next step, asks only what matters, shows every step, and never says Green when it is not sure.</p>
      <ul className="side-list">
        <li><Tick /> Safety floor in plain code: the AI can raise the danger level, never lower it</li>
        <li><Tick /> Unsure instead of Green when anything is unclear</li>
        <li><Tick /> Nothing is saved or sent until the health worker taps</li>
        <li><Tick /> Hindi, Hinglish and English</li>
      </ul>
      <div className="side-stats">
        <div className="side-stat"><b>{o.red_caught}/{o.red_total}</b><span>Red cases caught<br />(checklist: {b.red_caught}/{b.red_total})</span></div>
        <div className="side-stat"><b>{pct(o.level_accuracy)}</b><span>level accuracy<br />(checklist: {pct(b.level_accuracy)})</span></div>
        <div className="side-stat"><b>{sb.floor_test_1.passed}/{sb.floor_test_1.total}</b><span>floor test<br />passed</span></div>
      </div>
      <div className="side-links">
        <a href="#care">Care team view</a>
      </div>
      <div className="side-foot">Prototype. Rules reviewed by one gynaecologist, not clinically validated. An alert aid, not a diagnosis. Scores are from 104 builder-written test cases.</div>
    </div>
  )
}
