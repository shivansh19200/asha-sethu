import rules from '../../data/rules.json'

export function localNote({ patient, signs, level, age, code, asha, village, when }) {
  const names = Object.fromEntries(rules.signs.map((s) => [s.id, s.name_en]))
  const ageText = [['years', 'year'], ['months', 'month'], ['weeks', 'week'], ['days', 'day']]
    .map(([k, w]) => (+age[k] ? `${+age[k]} ${w}${+age[k] > 1 ? 's' : ''}` : null)).filter(Boolean).join(' ')
  const word = { RED: 'Red', AMBER: 'Amber', UNSURE: 'Unsure', GREEN: 'Green' }[level]
  return [
    'REFERRAL NOTE',
    `Patient: ${patient === 'mother' ? 'Mother' : 'Newborn'}${ageText ? `, ${ageText}` : ''}${code ? `, code ${code}` : ''}`,
    `Danger level: ${word}`,
    `Signs present: ${signs.map((id) => names[id]).filter(Boolean).join('; ') || 'none'}`,
    `ASHA: ${asha || '-'}, ${village || '-'}`,
    `Date: ${when}`,
    'This is an alert aid, not a diagnosis.'
  ].join('\n')
}