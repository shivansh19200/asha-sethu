import React, { useEffect } from 'react'
import './theme.css'
import './screens.css'
import './result.css'
import { T } from './strings'
import { TopRow, Baby, getLang, patientLabel } from './ui'
import { nextQuestion, TOPIC } from './floor'

export default function Question({ visit, setVisit, goToScreen }) {
  const lang = getLang()
  const t = T[lang]
  const patient = visit.patient === 'mother' ? 'mother' : 'newborn'
  const q = nextQuestion(visit)

  // Nothing left that could change the level (or RED floor): go to Result.
  useEffect(() => { if (!q) goToScreen('result') }, [q])
  if (!q) return null

  const answer = (a) =>
    setVisit((v) => ({
      ...v,
      signs: a === 'yes' && !v.signs.includes(q.sign) ? [...v.signs, q.sign] : v.signs,
      answers: [...v.answers, { qid: q.id, sign: q.sign, answer: a, levelIfYes: q.level_if_yes }]
    }))

  const showNow = () => {
    setVisit((v) => ({ ...v, skipped: nextQuestion(v) !== null }))
    goToScreen('result')
  }

  return (
    <div className="sx-screen" key={q.id}>
      <TopRow label={patientLabel(patient, lang)} onBack={() => goToScreen('confirm')} lang={lang} />
      <div className="sx-qhead sx-in" style={{ '--i': 1 }}>
        <Baby size={56} />
        <div>
          <h1 className="sx-header">{t.q} {visit.answers.length + 1}</h1>
          <div className="sx-label" style={{ margin: 0 }}>{(TOPIC[q.sign] || ['', ''])[lang === 'hi' ? 1 : 0]}</div>
        </div>
      </div>
      <div className="sx-qtext sx-in" style={{ '--i': 2 }}>{lang === 'hi' ? q.text_hi : q.text_en}</div>
      <button type="button" className="sx-fill sx-in" style={{ '--i': 3 }} onClick={() => answer('yes')}>{t.yes}</button>
      <button type="button" className="sx-btn sx-in" style={{ '--i': 4, marginTop: 10 }} onClick={() => answer('no')}>{t.no}</button>
      <button type="button" className="sx-btn sx-in" style={{ '--i': 5 }} onClick={() => answer('unsure')}>{t.notSure}</button>
      <button type="button" className="sx-link" onClick={showNow}>{t.showNow}</button>
    </div>
  )
}