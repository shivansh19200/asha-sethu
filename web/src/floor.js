import rules from '../../data/rules.json'
import questions from '../../data/questions.json'

export const RANK = { GREEN: 0, UNSURE: 1, AMBER: 2, RED: 3 }
const signLevel = Object.fromEntries(rules.signs.map((s) => [s.id, s.level]))

// Browser mirror of api/rules.floor_level. Mission 4 moves this to Python.
const combos = rules.combinations || []

export function currentLevel(visit) {
  const present = new Set([...visit.signs, ...visit.answers.filter((a) => a.answer === 'yes').map((a) => a.sign)])
  let best = 'GREEN'
  const up = (l) => { if (RANK[l] > RANK[best]) best = l }
  present.forEach((id) => signLevel[id] && up(signLevel[id]))
  visit.answers.forEach((a) => a.answer === 'yes' && up(a.levelIfYes))
  combos.forEach((c) => c.signs.every((s) => present.has(s)) && up(c.level))
  const unclear = visit.unclear || visit.skipped || visit.answers.some((a) => a.answer === 'unsure') || [...present].some((id) => !signLevel[id])
  if (best === 'GREEN' && (unclear || !visit.checklistDone)) return 'UNSURE'
  return best
}

// Next question that could still raise the level (directly, or by completing a combination). null = none left.
export function nextQuestion(visit) {
  const base = { ...visit, skipped: false }
  const level = currentLevel(base)
  const asked = new Set(visit.answers.map((a) => a.qid))
  const pre = visit.patient === 'mother' ? 'm_' : 'nb_'
  const reach = (q) => Math.max(RANK[q.level_if_yes], RANK[currentLevel({ ...base, signs: [...visit.signs, q.sign] })])
  return (
    questions.questions
      .filter((q) => q.sign.startsWith(pre) && !asked.has(q.id) && !visit.signs.includes(q.sign) && reach(q) > RANK[level])
      .sort((a, b) => reach(b) - reach(a))[0] || null
  )
}

export const TOPIC = {
  nb_not_feeding: ['Feeding', 'दूध'], nb_fever: ['Fever', 'बुखार'], nb_cold: ['Temperature', 'तापमान'],
  nb_fast_breathing: ['Breathing', 'साँस'], nb_diff_breathing: ['Breathing', 'साँस'], nb_fits: ['Fits', 'दौरे'],
  nb_sleepy: ['Alertness', 'सुस्ती'], nb_yellow: ['Colour', 'रंग'], nb_cord: ['Cord', 'नाल'], nb_no_cry: ['Cry', 'रोना'],
  m_headache: ['Headache', 'सिरदर्द'], m_vision: ['Vision', 'नज़र'], m_fits: ['Fits', 'दौरे'], m_bleeding: ['Bleeding', 'खून'],
  m_fever_discharge: ['Fever', 'बुखार'], m_belly_pain: ['Pain', 'दर्द'], m_breathless: ['Breathing', 'साँस'],
  m_baby_less: ['Movement', 'हलचल'], m_swelling: ['Swelling', 'सूजन'], m_water: ['Waters', 'पानी'], m_fever: ['Fever', 'बुखार'], m_foul_discharge: ['Discharge', 'स्राव'],   nb_chest_indrawing: ['Breathing', 'साँस'], nb_skin_pus: ['Skin', 'त्वचा'], nb_eye_pus: ['Eyes', 'आँखें'], nb_loose_stools: ['Stools', 'दस्त'],
  m_faint: ['Fainting', 'बेहोशी'], m_vag_bleed_preg: ['Bleeding', 'खून'], m_early_labour: ['Labour', 'प्रसव'], m_pale_weak: ['Weakness', 'कमज़ोरी'],
  m_urine_burning: ['Urine', 'पेशाब'], m_breast: ['Breast', 'स्तन'], m_stitches: ['Stitches', 'टाँके'], m_vomiting: ['Vomiting', 'उल्टी'],
}

export const levelOf = (visit) => (visit.agent && visit.agent.status === 'done' ? visit.agent.level : currentLevel(visit))