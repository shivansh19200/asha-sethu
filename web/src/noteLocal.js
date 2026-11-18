import rules from '../../data/rules.json'

// Used only when the server is down. Mirrors api/note.py write_note() so the note reads the same in both languages.
const LAB = {
  en: { title: 'REFERRAL NOTE', patient: 'Patient', code: 'code', level: 'Danger level', present: 'Signs present', asha: 'ASHA', date: 'Date', none: 'none', mother: 'Mother', newborn: 'Newborn', foot: 'This is an alert aid, not a diagnosis.', units: ['year', 'month', 'week', 'day'], lv: { RED: 'Red', AMBER: 'Amber', UNSURE: 'Unsure', GREEN: 'Green' } },
  hi: { title: 'रेफ़रल नोट', patient: 'रोगी', code: 'कोड', level: 'ख़तरे का स्तर', present: 'मिले लक्षण', asha: 'आशा', date: 'तारीख़', none: 'कोई नहीं', mother: 'माँ', newborn: 'नवजात', foot: 'यह चेतावनी सहायक है, निदान नहीं।', units: ['साल', 'महीने', 'सप्ताह', 'दिन'], lv: { RED: 'लाल', AMBER: 'पीला', UNSURE: 'अनिश्चित', GREEN: 'हरा' } }
}

export function localNote({ patient, signs, level, age, code, asha, village, when }, lang = 'en') {
  const L = LAB[lang]
  const names = Object.fromEntries(rules.signs.map((s) => [s.id, lang === 'hi' ? s.name_hi : s.name_en]))
  const ageText = ['years', 'months', 'weeks', 'days']
    .map((k, i) => (+age[k] ? `${+age[k]} ${L.units[i]}${lang === 'en' && +age[k] > 1 ? 's' : ''}` : null)).filter(Boolean).join(' ')
  return [
    L.title,
    `${L.patient}: ${L[patient === 'mother' ? 'mother' : 'newborn']}${ageText ? `, ${ageText}` : ''}${code ? `, ${L.code} ${code}` : ''}`,
    `${L.level}: ${L.lv[level]}`,
    `${L.present}: ${signs.map((id) => names[id]).filter(Boolean).join('; ') || L.none}`,
    `${L.asha}: ${asha || '-'}, ${village || '-'}`,
    `${L.date}: ${when}`,
    L.foot
  ].join('\n')
}
