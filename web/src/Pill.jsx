import React from 'react'
import { Icon } from './ui'

const ICON = { RED: 'alert-triangle', AMBER: 'alert-circle', GREEN: 'check-circle', UNSURE: 'help-circle' }
const WORD = {
  en: { RED: 'Red', AMBER: 'Amber', GREEN: 'Green', UNSURE: 'Unsure' },
  hi: { RED: 'लाल', AMBER: 'पीला', GREEN: 'हरा', UNSURE: 'अनिश्चित' }
}

// Level pill: icon + word, never colour alone.
export default function LevelPill({ level, lang = 'en' }) {
  return (
    <span className={`sx-pill lv-${level.toLowerCase()}`}>
      <Icon name={ICON[level]} size={16} />{WORD[lang][level]}
    </span>
  )
}
