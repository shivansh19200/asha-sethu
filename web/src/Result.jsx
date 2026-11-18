import React from 'react'
import rules from '../../data/rules.json'
import questions from '../../data/questions.json'
import './theme.css'
import './screens.css'
import './result.css'
import { T } from './strings'
import { Icon, TopRow, getLang, patientLabel } from './ui'
import { levelOf } from './floor'
import { StepList } from './Steps'
import { M } from './more'
import { traceText } from './i18n'

const ICON = { RED: 'alert-triangle', AMBER: 'alert-circle', GREEN: 'check-circle', UNSURE: 'help-circle' }
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
  const base = fromAgent ? visit.agent.trace.map((x) => [traceText(x, lang), TAGMAP[x.tag] || 'rules']) : local
  const steps = [...base, ...(visit.doneSteps || []).map((x) => [x.text, 'done'])]

  const m = M[lang]
  const lvOf = Object.fromEntries(rules.signs.map((s) => [s.id, s.level]))
  const presentIds = [...new Set([...visit.signs, ...visit.answers.filter((a) => a.answer === 'yes').map((a) => a.sign)])]
  const setters = presentIds.filter((id) => lvOf[id] === level).map((id) => sname[id])
  const why = level === 'UNSURE' ? m.whyUnsure : level === 'GREEN' ? m.whyGreen : setters.length ? setters.join(', ') : m.whyRaised
  const copyAlert = async () => {
    const text = m.alertTpl(m.patient[patient], presentIds.map((id) => sname[id]).join(', ') || '-')
    try { navigator.share ? await navigator.share({ text }) : await navigator.clipboard.writeText(text) } catch { /* cancelled */ }
  }

  return (
    <div className="sx-screen">
      <TopRow label={patientLabel(patient, lang)} onBack={() => goToScreen('home')} lang={lang} />

      <div className={`sx-banner lv-${level.toLowerCase()}`}>
        <span className="sx-banner-icon"><Icon name={ICON[level]} size={32} /></span>
        <div className="sx-banner-word">{t['lv' + level]}</div>
        <div className="sx-banner-act">{t['act' + level]}</div>
      </div>

      <div className="sx-why"><b>{m.whyLabel}:</b> {why}</div>
      {level === 'RED' && <button type="button" className="sx-btn" onClick={copyAlert}>{m.copyAlert}</button>}

      <div className="sx-section">{t.found}</div>
      <div className="sx-chips">
        {visit.signs.length === 0 && <span className="sx-small">{t.none}</span>}
        {visit.signs.map((id) => <span key={id} className="sx-chip">{sname[id]}</span>)}
      </div>

      <div className="sx-section">{t.did}</div>
      <StepList steps={steps} t={t} />

      <button type="button" className="sx-fill" onClick={() => goToScreen('note')}>{t.review}</button>
      <div className="sx-foot">{t.foot}</div>
    </div>
  )
}