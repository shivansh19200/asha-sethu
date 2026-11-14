import React, { useState } from 'react'

export default function SmokeTest() {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const callHello = async () => {
    setLoading(true)
    setError('')
    setMessage('')
    try {
      const response = await fetch('/api/hello', { method: 'GET' })
      const data = await response.json()
      if (response.ok) {
        setMessage(JSON.stringify(data))
      } else {
        setError(data.error || 'API error')
      }
    } catch (err) {
      setError('Network error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Asha Sethu — Smoke Test</h1>
      <p>Testing backend connectivity</p>
      
      <button 
        onClick={callHello} 
        disabled={loading}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#1F5E9E',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1
        }}
      >
        {loading ? 'Calling...' : 'Call /api/hello'}
      </button>

      {message && <p style={{ color: '#2B4A35', marginTop: '20px', fontWeight: 'bold' }}>{message}</p>}
      {error && <p style={{ color: '#6B3205', marginTop: '20px' }}>Error: {error}</p>}
    </div>
  )
}
