import React from 'react'
import { Icon } from './ui'

const TAG = { ai: ['bulb', 'tagAI'], worker: ['user-check', 'tagWorker'], rules: ['book', 'tagRules'], done: ['check-circle', 'tagDone'] }

// steps = [[text, 'ai' | 'worker' | 'rules' | 'done'], ...]
export function StepList({ steps, t }) {
  return (
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
  )
}