import React, { useState, useEffect } from 'react'
import './theme.css'
import './Settings.css'

export default function Settings({ goToScreen }) {
  const [ashaName, setAshaName] = useState('')
  const [village, setVillage] = useState('')
  const [language, setLanguage] = useState('EN')
  const [theme, setTheme] = useState('system')

  // Load from localStorage on mount
  useEffect(() => {
    const savedAshaName = localStorage.getItem('ashaName') || ''
    const savedVillage = localStorage.getItem('village') || ''
    const savedLanguage = localStorage.getItem('language') || 'EN'
    const savedTheme = localStorage.getItem('theme') || 'system'

    setAshaName(savedAshaName)
    setVillage(savedVillage)
    setLanguage(savedLanguage)
    setTheme(savedTheme)

    // Apply theme on load
    applyTheme(savedTheme)
  }, [])

  // Apply theme to document
  const applyTheme = (themeValue) => {
    if (themeValue === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
    } else {
      document.documentElement.setAttribute('data-theme', themeValue)
    }
  }

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    applyTheme(newTheme)
  }

  const handleAshaNameChange = (e) => {
    const value = e.target.value
    setAshaName(value)
    localStorage.setItem('ashaName', value)
  }

  const handleVillageChange = (e) => {
    const value = e.target.value
    setVillage(value)
    localStorage.setItem('village', value)
  }

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage)
    localStorage.setItem('language', newLanguage)
  }

  return (
    <div className="settings">
      <button
        className="settings-back"
        onClick={() => goToScreen('home')}
      >
        ← Back
      </button>

      <h1 className="settings-header">Settings</h1>

      {/* ASHA Name */}
      <div className="settings-field">
        <label className="settings-label">ASHA name</label>
        <input
          type="text"
          className="settings-input"
          value={ashaName}
          onChange={handleAshaNameChange}
          placeholder="Enter your name"
        />
      </div>

      {/* Village */}
      <div className="settings-field">
        <label className="settings-label">Village</label>
        <input
          type="text"
          className="settings-input"
          value={village}
          onChange={handleVillageChange}
          placeholder="Enter village name"
        />
      </div>

      {/* Language */}
      <div className="settings-field">
        <label className="settings-label">Language</label>
        <div className="settings-toggle-group">
          <button
            className={`settings-toggle-button ${language === 'EN' ? 'active' : ''}`}
            onClick={() => handleLanguageChange('EN')}
          >
            EN
          </button>
          <button
            className={`settings-toggle-button ${language === 'हि' ? 'active' : ''}`}
            onClick={() => handleLanguageChange('हि')}
          >
            हि
          </button>
        </div>
      </div>

      {/* Dark mode toggle */}
      <div className="settings-field">
        <label className="settings-label">Dark mode</label>
        <div className="settings-toggle-group">
          <button
            className={`settings-toggle-button ${theme === 'system' ? 'active' : ''}`}
            onClick={() => handleThemeChange('system')}
          >
            System
          </button>
          <button
            className={`settings-toggle-button ${theme === 'light' ? 'active' : ''}`}
            onClick={() => handleThemeChange('light')}
          >
            Light
          </button>
          <button
            className={`settings-toggle-button ${theme === 'dark' ? 'active' : ''}`}
            onClick={() => handleThemeChange('dark')}
          >
            Dark
          </button>
        </div>
      </div>

      <button className="settings-back" onClick={() => goToScreen('measure')}>How we measured</button>
    </div>
  )
}
