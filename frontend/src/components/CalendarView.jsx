import { useState } from 'react'
import './CalendarView.css'
import './CalendarModal.css'

const CalendarView = ({ holidays, year, country }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedHolidays, setSelectedHolidays] = useState(null)
  const [modalDate, setModalDate] = useState(null)

  // State abbreviation mappings for Malaysia
  const stateMapping = {
    'JHR': 'Johor',
    'KDH': 'Kedah',
    'KTN': 'Kelantan',
    'KUL': 'Kuala Lumpur',
    'LBN': 'Labuan',
    'MLK': 'Melaka',
    'NSN': 'Negeri Sembilan',
    'PHG': 'Pahang',
    'PNG': 'Penang',
    'PRK': 'Perak',
    'PLS': 'Perlis',
    'PJY': 'Putrajaya',
    'SBH': 'Sabah',
    'SGR': 'Selangor',
    'SWK': 'Sarawak',
    'TRG': 'Terengganu',
  }

  // Convert state codes to full names
  const expandStateNames = (locationString) => {
    if (!locationString) return locationString
    
    // Handle "All except" cases
    if (locationString.toLowerCase().includes('all except')) {
      let expanded = locationString
      Object.entries(stateMapping).forEach(([code, name]) => {
        const regex = new RegExp(`\\b${code}\\b`, 'gi')
        expanded = expanded.replace(regex, name)
      })
      return expanded
    }
    
    // Handle comma-separated state codes
    return locationString.split(',').map(loc => {
      const trimmed = loc.trim()
      return stateMapping[trimmed] || trimmed
    }).join(', ')
  }

  // Normalize holiday type for consistent display
  const normalizeHolidayType = (typeArray) => {
    if (!typeArray || typeArray.length === 0) return 'Holiday'
    
    const type = typeArray[0].toLowerCase()
    
    if (type.includes('national')) return 'National'
    if (type.includes('local')) return 'Local'
    if (type.includes('observance')) return 'Observance'
    if (type.includes('common')) return 'Local'
    
    return typeArray[0]
  }

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Get holidays for a specific date and consolidate duplicates
  const getHolidaysForDate = (date) => {
    const dayHolidays = holidays.filter(holiday => {
      const holidayDate = new Date(holiday.date.iso)
      return (
        holidayDate.getDate() === date.getDate() &&
        holidayDate.getMonth() === date.getMonth() &&
        holidayDate.getFullYear() === date.getFullYear()
      )
    })

    // Group similar holidays (same base name)
    const grouped = {}
    dayHolidays.forEach(holiday => {
      // Normalize holiday name for grouping
      const baseName = holiday.name
        .replace(/\s+(Holiday|Day)$/i, '')
        .replace(/Second Day of /i, '')
        .trim()
      
      if (!grouped[baseName]) {
        grouped[baseName] = []
      }
      grouped[baseName].push(holiday)
    })

    // Consolidate groups that have complementary locations
    const consolidated = []
    Object.values(grouped).forEach(group => {
      if (group.length === 1) {
        consolidated.push(group[0])
      } else {
        // Check if we have "All except" and its complement
        const hasAllExcept = group.some(h => h.locations?.toLowerCase().includes('all except'))
        const hasSpecific = group.some(h => h.locations && !h.locations.toLowerCase().includes('all except'))
        
        if (hasAllExcept && hasSpecific) {
          // Consolidate to one holiday with "All states" or "Nationwide"
          const mainHoliday = group[0]
          consolidated.push({
            ...mainHoliday,
            locations: 'All states',
            type: ['National'],
            consolidated: true
          })
        } else {
          // Keep separate
          consolidated.push(...group)
        }
      }
    })

    return consolidated
  }

  // Generate calendar days for a given month
  const generateCalendarDays = (month, year) => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ day: null, date: null, holidays: [] })
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dayHolidays = getHolidaysForDate(date)
      days.push({ day, date, holidays: dayHolidays })
    }

    return days
  }

  const calendarDays = generateCalendarDays(selectedMonth, year)

  const handleMonthChange = (direction) => {
    if (direction === 'prev') {
      setSelectedMonth(prev => (prev === 0 ? 11 : prev - 1))
    } else {
      setSelectedMonth(prev => (prev === 11 ? 0 : prev + 1))
    }
  }

  const isToday = (date) => {
    if (!date) return false
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const handleDayClick = (date, dayHolidays) => {
    if (dayHolidays.length > 0) {
      setSelectedHolidays(dayHolidays)
      setModalDate(date)
    }
  }

  const closeModal = () => {
    setSelectedHolidays(null)
    setModalDate(null)
  }

  const formatModalDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="calendar-view">
      <div className="calendar-header">
        <button 
          className="nav-btn" 
          onClick={() => handleMonthChange('prev')}
          aria-label="Previous month"
        >
          ‹
        </button>
        <h2 className="calendar-title">
          {months[selectedMonth]} {year}
        </h2>
        <button 
          className="nav-btn" 
          onClick={() => handleMonthChange('next')}
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div className="month-quick-nav">
        {months.map((month, index) => (
          <button
            key={month}
            className={`month-btn ${selectedMonth === index ? 'active' : ''}`}
            onClick={() => setSelectedMonth(index)}
          >
            {month.substring(0, 3)}
          </button>
        ))}
      </div>

      <div className="calendar-grid">
        <div className="weekdays">
          {weekDays.map(day => (
            <div key={day} className="weekday-header">
              {day}
            </div>
          ))}
        </div>

        <div className="calendar-days">
          {calendarDays.map((item, index) => {
            const { day, date, holidays: dayHolidays } = item
            const hasHoliday = dayHolidays.length > 0
            const today = isToday(date)

            return (
              <div
                key={index}
                className={`calendar-day ${!day ? 'empty' : ''} ${hasHoliday ? 'has-holiday' : ''} ${today ? 'today' : ''}`}
                onClick={() => hasHoliday && handleDayClick(date, dayHolidays)}
                style={{ cursor: hasHoliday ? 'pointer' : 'default' }}
              >
                {day && (
                  <>
                    <div className="day-number">{day}</div>
                    {hasHoliday && (
                      <div className="holiday-list">
                        {dayHolidays.map((holiday, hIndex) => (
                          <div 
                            key={hIndex} 
                            className={`holiday-item ${holiday.type[0]?.toLowerCase()}`}
                          >
                            <div className="holiday-name">
                              {holiday.name}
                            </div>
                            {holiday.locations && (() => {
                              const locLower = holiday.locations.toLowerCase().trim();
                              const isAllStates = holiday.consolidated || locLower === 'all states' || locLower === 'all';
                              const isAllExcept = locLower.includes('all except');
                              
                              // Debug log
                              if (locLower.includes('all')) {
                                console.log('Holiday:', holiday.name, 'Locations:', holiday.locations, 'Consolidated:', holiday.consolidated, 'IsAllStates:', isAllStates);
                              }
                              
                              return (
                                <div className="holiday-location-hint">
                                  {isAllStates
                                    ? 'Nationwide'
                                    : isAllExcept
                                      ? `${expandStateNames(holiday.locations)}` 
                                      : `${holiday.locations.split(',').length} ${holiday.locations.split(',').length === 1 ? 'state' : 'states'}`
                                  }
                                </div>
                              );
                            })()}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-dot national"></div>
          <span>National Holiday</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot local"></div>
          <span>Local Holiday</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot observance"></div>
          <span>Observance</span>
        </div>
        <div className="legend-item">
          <div className="legend-box today"></div>
          <span>Today</span>
        </div>
      </div>

      {/* Holiday Details Modal */}
      {selectedHolidays && modalDate && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{formatModalDate(modalDate)}</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              {selectedHolidays.map((holiday, index) => (
                <div key={index} className={`modal-holiday-card ${holiday.type[0]?.toLowerCase()}`}>
                  <div className="modal-holiday-header">
                    <h4>{holiday.name}</h4>
                    <span className={`type-badge ${normalizeHolidayType(holiday.type).toLowerCase()}`}>
                      {normalizeHolidayType(holiday.type)}
                    </span>
                  </div>
                  {holiday.description && (
                    <p className="modal-holiday-description">{holiday.description}</p>
                  )}
                  {holiday.locations && (() => {
                    const locLower = holiday.locations.toLowerCase().trim();
                    const isAllStates = holiday.consolidated || locLower === 'all states' || locLower === 'all';
                    const isAllExcept = locLower.includes('all except');
                    
                    return (
                      <div className="modal-holiday-locations">
                        <strong>📍 Applicable States/Regions:</strong>
                        <div className="locations-list">
                          {isAllStates ? (
                            <span className="location-tag all-states">
                              All States (Nationwide)
                            </span>
                          ) : isAllExcept ? (
                            <span className="location-tag all-except">
                              {expandStateNames(holiday.locations)}
                            </span>
                          ) : (
                            expandStateNames(holiday.locations).split(',').map((location, i) => (
                              <span key={i} className="location-tag">
                                {location.trim()}
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })()}
                  <div className="modal-holiday-meta">
                    <span className="meta-item">
                      📅 {new Date(holiday.date.iso).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CalendarView
