import React from 'react'
import './theme.css'
import './screens.css'
import './result.css'
import { TopRow, getLang } from './ui'
import board from '../../data/scoreboard.json'

const pct = (x) => `${Math.round(x * 100)}%`

export default function HowWeMeasured({ goToScreen }) {
  const lang = getLang()
  const b = board.baseline
  const o = board.ours
  const rows = [
    ['RED cases caught', `${b.red_caught} of ${b.red_total}`, `${o.red_caught} of ${o.red_total}`],
    ['RED cases missed', b.red_missed, o.red_missed],
    ['Level accuracy', pct(b.level_accuracy), pct(o.level_accuracy)],
    ['Missed danger (false negatives)', pct(b.false_negative_rate), pct(o.false_negative_rate)],
    ['False alarms (over-referral)', pct(b.false_positive_rate), pct(o.false_positive_rate)],
    ['Unsure rate', pct(b.unsure_rate), pct(o.unsure_rate)],
    ['Average steps', b.avg_steps, o.avg_steps]
  ]
  return (
    <div className="sx-screen">
      <TopRow label="" onBack={() => goToScreen('home')} lang={lang} />
      <h1 className="sx-header sx-in" style={{ '--i': 1 }}>How we measured</h1>
      <div className="sx-label sx-in" style={{ '--i': 2 }}>
        {board.cases_note || `${o.cases} test cases`} · rules {board.rules_version} · {board.mode} · {board.run_at}
      </div>

      <table className="sx-table">
        <thead><tr><th></th><th>Printed checklist</th><th>Asha Sethu</th></tr></thead>
        <tbody>{rows.map(([k, x, y]) => <tr key={k}><td>{k}</td><td>{x}</td><td>{y}</td></tr>)}</tbody>
      </table>

      <div className="sx-section">By language</div>
      <table className="sx-table">
        <thead><tr><th>Language</th><th>Cases</th><th>Checklist</th><th>Asha Sethu</th></tr></thead>
        <tbody>
          {Object.entries(board.by_language).map(([l, v]) => (
            <tr key={l}>
              <td>{l}</td><td>{v.ours.cases}</td>
              <td>{pct(v.baseline.level_accuracy)} · RED {v.baseline.red_caught}/{v.baseline.red_total}</td>
              <td>{pct(v.ours.level_accuracy)} · RED {v.ours.red_caught}/{v.ours.red_total}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="sx-section">Floor tests</div>
      <table className="sx-table">
        <tbody>
          <tr><td>1. Final level is never below the rules floor</td><td>{board.floor_test_1.passed} of {board.floor_test_1.total}</td></tr>
          <tr><td>2. Never GREEN when unclear or checklist unfinished</td><td>{board.floor_test_2.passed} of {board.floor_test_2.total}</td></tr>
        </tbody>
      </table>

      <p className="sx-small" style={{ textTransform: 'none', letterSpacing: 0, fontSize: 14, marginTop: 14 }}>
        The floor test checks that the code works. It does not prove the clinical rules are correct.
      </p>
      <p className="sx-small" style={{ textTransform: 'none', letterSpacing: 0, fontSize: 14 }}>
        The cases were written by the builder, not collected from real visits, so scores will look better than real use. The baseline is a printed-checklist stand-in with English keywords only.
        Clinical review: levels reviewed by one gynaecologist; not clinically validated.
      </p>
    </div>
  )
}
