import React, { useState } from 'react'
import Home from './Home'
import Settings from './Settings'
import Describe from './Describe'
import Confirm from './Confirm'
import Question from './Question'
import Result from './Result'

const emptyVisit = { patient: null, text: '', signs: [], checklistDone: false, unclear: false, confirmed: false, answers: [], skipped: false }

export default function App() {
  const [screen, setScreen] = useState('home')
  const [visit, setVisit] = useState(emptyVisit)

  // goToScreen('describe', 'mother') starts a fresh visit for that patient type.
  const goToScreen = (screenName, patient) => {
    if (patient) setVisit({ ...emptyVisit, patient })
    setScreen(screenName)
  }

  if (screen === 'home') return <Home goToScreen={goToScreen} />
  if (screen === 'settings') return <Settings goToScreen={goToScreen} />
  if (screen === 'describe') return <Describe visit={visit} setVisit={setVisit} goToScreen={goToScreen} />
  if (screen === 'confirm') return <Confirm visit={visit} setVisit={setVisit} goToScreen={goToScreen} />
  if (screen === 'question') return <Question visit={visit} setVisit={setVisit} goToScreen={goToScreen} />
  if (screen === 'result') return <Result visit={visit} setVisit={setVisit} goToScreen={goToScreen} />

  // Placeholder screens for question, result, note, send (pieces 3 and 4)
  const placeholderScreens = {
    question: 'Question',
    result: 'Result',
    note: 'Note and Record',
    send: 'Review and send'
  }

  return (
    <div style={{ padding: '20px' }}>
      <button
        onClick={() => goToScreen('confirm')}
        style={{ marginBottom: '20px', padding: '10px 15px', backgroundColor: 'transparent', border: 'none', color: 'var(--acc)', cursor: 'pointer', fontSize: '16px' }}
      >
        ← Back
      </button>
      <h1>{placeholderScreens[screen]}</h1>
      <p>Screen placeholder for {screen}</p>
      <p>Signs: {visit.signs.join(', ') || 'none'} | checklist done: {String(visit.checklistDone)} | unclear: {String(visit.unclear)}</p>
    </div>
  )
}
