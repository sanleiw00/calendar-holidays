import { useState } from 'react'
import HolidayChecker from './components/HolidayChecker'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFlag } from '@fortawesome/free-solid-svg-icons'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>
          <FontAwesomeIcon icon={faFlag} className="title-icon" />
          Malaysia Public Holiday Checker
        </h1>
        <p className="subtitle">View all Malaysian public holidays at a glance</p>
      </header>
      <main className="app-main">
        <HolidayChecker />
      </main>
      <footer className="app-footer">
        <p>Data provided by <a href="https://calendarific.com" target="_blank" rel="noopener noreferrer">Calendarific API</a></p>
      </footer>
    </div>
  )
}

export default App
