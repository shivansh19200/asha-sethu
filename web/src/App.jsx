import React, { useState } from 'react'
import Home from './Home'
import Settings from './Settings'

export default function App() {
  const [screen, setScreen] = useState('home')

  const goToScreen = (screenName) => {
    setScreen(screenName)
  }

  const goBack = () => {
    setScreen('home')
  }

  if (screen === 'home') {
    return <Home goToScreen={goToScreen} />
  }

  if (screen === 'settings') {
    return <Settings goToScreen={goToScreen} />
  }

  // Placeholder screens for describe, confirm, question, result, note, send
  const placeholderScreens = {
    describe: 'Describe',
    confirm: 'Confirm',
    question: 'Question',
    result: 'Result',
    note: 'Note and Record',
    send: 'Review and send'
  }

  return (
    <div style={{ padding: '20px' }}>
      <button
        onClick={goBack}
        style={{
          marginBottom: '20px',
          padding: '10px 15px',
          backgroundColor: 'transparent',
          border: 'none',
          color: 'var(--acc)',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        ← Back
      </button>
      <h1>{placeholderScreens[screen]}</h1>
      <p>Screen placeholder for {screen}</p>
    </div>
  )
}
