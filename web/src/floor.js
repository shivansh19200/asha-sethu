import rules from '../../data/rules.json'
import questions from '../../data/questions.json'

export const RANK = { GREEN: 0, UNSURE: 1, AMBER: 2, RED: 3 }
const signLevel = Object.fromEntries(rules.signs.map((s) => [s.id, s.level]))

// Browser mirror of api/rules.floor_level. Mission 4 moves this to Python.
export function currentLevel(visit) {
  const found = visit.signs.map((id) => signLevel[id])
  visit.answers.forEach((a) => a.answer === 'yes' && found.push(a.levelIfYes))
  if (found.length) return found.reduce((a, b) => (RANK[b] > RANK[a] ? b : a))
  const unclear = visit.unclear || visit.skipped || visit.answers.some((a) => a.answer === 'unsure')
  return unclear || !visit.checklistDone ? 'UNSURE' : 'GREEN'
}

// Next question that could still raise the level. null = nothing left.
export function nextQuestion(visit) {
  const level = currentLevel({ ...visit, skipped: false })
  const asked = new Set(visit.answers.map((a) => a.qid))
  const pre = visit.patient === 'mother' ? 'm_' : 'nb_'
  return (
    questions.questions
      .filter((q) => q.sign.startsWith(pre) && !asked.has(q.id) && !visit.signs.includes(q.sign) && RANK[q.level_if_yes] > RANK[level])
      .sort((a, b) => RANK[b.level_if_yes] - RANK[a.level_if_yes])[0] || null
  )
}

export const TOPIC = {
  nb_not_feeding: ['Feeding', 'दूध'], nb_fever: ['Fever', 'बुखार'], nb_cold: ['Temperature', 'तापमान'],
  nb_fast_breathing: ['Breathing', 'साँस'], nb_diff_breathing: ['Breathing', 'साँस'], nb_fits: ['Fits', 'दौरे'],
  nb_sleepy: ['Alertness', 'सुस्ती'], nb_yellow: ['Colour', 'रंग'], nb_cord: ['Cord', 'नाल'], nb_no_cry: ['Cry', 'रोना'],
  m_headache: ['Headache', 'सिरदर्द'], m_vision: ['Vision', 'नज़र'], m_fits: ['Fits', 'दौरे'], m_bleeding: ['Bleeding', 'खून'],
  m_fever_discharge: ['Fever', 'बुखार'], m_belly_pain: ['Pain', 'दर्द'], m_breathless: ['Breathing', 'साँस'],
  m_baby_less: ['Movement', 'हलचल'], m_swelling: ['Swelling', 'सूजन'], m_water: ['Waters', 'पानी']
}