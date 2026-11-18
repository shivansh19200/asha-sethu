import React from 'react'
import './theme.css'
import './screens.css'
import './result.css'
import { TopRow, getLang } from './ui'
import board from '../../data/scoreboard.json'
import { X } from './i18n'

const pct = (x) => `${Math.round(x * 100)}%`

export default function HowWeMeasured({ goToScreen }) {
  const lang = getLang()
  const x = X[lang]
  const b = board.baseline
  const o = board.ours
  const rows = [
    [x.mRows[0], x.mOf(b.red_caught, b.red_total), x.mOf(o.red_caught, o.red_total)],
    [x.mRows[1], b.red_missed, o.red_missed],
    [x.mRows[2], pct(b.level_accuracy), pct(o.level_accuracy)],
    [x.mRows[3], pct(b.false_negative_rate), pct(o.false_negative_rate)],
    [x.mRows[4], pct(b.false_positive_rate), pct(o.false_positive_rate)],
    [x.mRows[5], pct(b.unsure_rate), pct(o.unsure_rate)],
    [x.mRows[6], b.avg_steps, o.avg_steps]
  ]
  return (
    <div className="sx-screen">
      <TopRow label="" onBack={() => goToScreen('home')} lang={lang} />
      <h1 className="sx-header sx-in" style={{ '--i': 1 }}>{x.mTitle}</h1>
      <div className="sx-label sx-in" style={{ '--i': 2 }}>
        {board.cases_note && lang === 'en' ? board.cases_note : x.mCases(o.cases)} · {lang === 'hi' ? 'नियम' : 'rules'} {board.rules_version} · {x.mode[board.mode] || board.mode} · {board.run_at}
      </div>

      <table className="sx-table">
        <thead><tr><th></th><th>{x.mPrinted}</th><th>{x.mOurs}</th></tr></thead>
        <tbody>{rows.map(([k, x, y]) => <tr key={k}><td>{k}</td><td>{x}</td><td>{y}</td></tr>)}</tbody>
      </table>

      <div className="sx-section">{x.mByLang}</div>
      <table className="sx-table">
        <thead><tr><th>{x.mLang}</th><th>{x.mCasesCol}</th><th>{x.mChecklist}</th><th>{x.mOurs}</th></tr></thead>
        <tbody>
          {Object.entries(board.by_language).map(([l, v]) => (
            <tr key={l}>
              <td>{x.langName[l] || l}</td><td>{v.ours.cases}</td>
              <td>{pct(v.baseline.level_accuracy)} · {lang === 'hi' ? 'लाल' : 'RED'} {v.baseline.red_caught}/{v.baseline.red_total}</td>
              <td>{pct(v.ours.level_accuracy)} · {lang === 'hi' ? 'लाल' : 'RED'} {v.ours.red_caught}/{v.ours.red_total}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="sx-section">{x.mFloor}</div>
      <table className="sx-table">
        <tbody>
          <tr><td>{x.mF1}</td><td>{x.mOf(board.floor_test_1.passed, board.floor_test_1.total)}</td></tr>
          <tr><td>{x.mF2}</td><td>{x.mOf(board.floor_test_2.passed, board.floor_test_2.total)}</td></tr>
        </tbody>
      </table>

      <p className="sx-small" style={{ textTransform: 'none', letterSpacing: 0, fontSize: 14, marginTop: 14 }}>
        {x.mNote1}
      </p>
      <p className="sx-small" style={{ textTransform: 'none', letterSpacing: 0, fontSize: 14 }}>
        {x.mNote2}
      </p>
    </div>
  )
}
