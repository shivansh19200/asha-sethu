import React from 'react'
import rules from '../../data/rules.json'
import questions from '../../data/questions.json'
import './theme.css'
import './screens.css'
import './result.css'
import { T } from './strings'
import { Icon, TopRow, getLang, patientLabel } from './ui'
import { levelOf } from './floor'

const ICON = { RED: 'alert-triangle', AMBER: 'alert-circle', GREEN: 'check-circle', UNSURE: 'help-circle' }
const TAG = { ai: ['bulb', 'tagAI'], worker: ['user-check', 'tagWorker'], rules: ['book', 'tagRules'], done: ['check-circle', 'tagDone'] }
const TAGMAP = { ai_suggested: 'ai', worker_confirmed: 'worker', rules: 'rules', done: 'done' }

export default function Result({ visit, goToScreen }) {
  const lang = getLang()
  const t = T[lang]
  const patient = visit.patient === 'mother' ? 'mother' : 'newborn'
  const level = levelOf(visit)
  const sname = Object.fromEntries(rules.signs.map((s) => [s.id, lang === 'hi' ? s.name_hi : s.name_en]))
  const qtext = Object.fromEntries(questions.questions.map((q) => [q.id, lang === 'hi' ? q.text_hi : q.text_en]))

  // Steps come from the agent. If the server was down, build a simple local version.
  const local = []
  const yesSigns = new Set(visit.answers.filter((a) => a.answer === 'yes').map((a) => a.sign))
  const heard = visit.signs.filter((id) => !yesSigns.has(id))
  if (heard.length) local.push([`${t.heardN(heard.length)}: ${heard.map((id) => sname[id]).join(', ')}`, 'worker'])
  visit.answers.forEach((a) => local.push([`${t.asked}: ${qtext[a.qid]} ${t['a_' + a.answer]}`, 'worker']))
  if (visit.skipped) local.push([t.early, 'rules'])
  if (level === 'RED') local.push([t.escalated, 'rules'])
  else if (level === 'AMBER') local.push([`${t.levelSet}: ${t.lvAMBER}`, 'rules'])
  else if (level === 'UNSURE') local.push([!visit.checklistDone && !visit.signs.length ? t.notDone : t.unclearStep, 'rules'])
  else local.push([t.allClear, 'rules'])
  const fromAgent = visit.agent && visit.agent.trace && visit.agent.trace.length
  const steps = fromAgent ? visit.agent.trace.map((x) => [x.text, TAGMAP[x.tag] || 'rules']) : local

  return (
    <div className="sx-screen">
      <TopRow label={patientLabel(patient, lang)} onBack={() => goToScreen('home')} lang={lang} />

      <div className={`sx-banner lv-${level.toLowerCase()}`}>
        <span className="sx-banner-icon"><Icon name={ICON[level]} size={32} /></span>
        <div className="sx-banner-word">{t['lv' + level]}</div>
        <div className="sx-banner-act">{t['act' + level]}</div>
      </div>

      <div className="sx-section">{t.found}</div>
      <div className="sx-chips">
        {visit.signs.length === 0 && <span className="sx-small">{t.none}</span>}
        {visit.signs.map((id) => <span key={id} className="sx-chip">{sname[id]}</span>)}
      </div>

      <div className="sx-section">{t.did}</div>
      <div className="sx-steps">
        {steps.map(([text, tag], i) => (
          <div key={i} className="sx-step" style={{ '--i': i }}>
            <span className="sx-step-tick"><Icon name="check" size={18} /></span>
            <div>
              <div>{text}</div>
              <span className="sx-tag"><Icon name={TAG[tag][0]} size={14} />{t[TAG[tag][1]]}</span>
            </div>
          </div>
        ))}
      </div>

      <button type="button" className="sx-fill" onClick={() => goToScreen('note')}>{t.review}</button>
      <div className="sx-foot">{t.foot}</div>
    </div>
  )
}