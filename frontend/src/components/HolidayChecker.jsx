import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import CalendarView from './CalendarView'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faTable, 
  faCalendar, 
  faTriangleExclamation,
  faCalendarDays,
  faGlobe
} from '@fortawesome/free-solid-svg-icons'
import './HolidayChecker.css'

const HolidayChecker = () => {
  const [holidays, setHolidays] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [year, setYear] = useState(new Date().getFullYear())
  const [country, setCountry] = useState('MY') // Malaysia
  const [viewMode, setViewMode] = useState('calendar') // 'table' or 'calendar' - default to calendar

  const countries = [
    { code: 'MY', name: 'Malaysia' },
    { code: 'SG', name: 'Singapore' },
    { code: 'ID', name: 'Indonesia' },
    { code: 'TH', name: 'Thailand' },
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
  ]

  const fetchHolidays = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Use environment variable for API URL, fallback to relative path for production
      const API_URL = import.meta.env.VITE_API_URL || '';
      const response = await axios.get(`${API_URL}/api/holidays`, {
        params: {
          country: country,
          year: year
        }
      })

      if (response.data && response.data.response && response.data.response.holidays) {
        setHolidays(response.data.response.holidays)
      } else {
        setError('No holidays found')
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch holidays')
    } finally {
      setLoading(false)
    }
  }, [country, year])

  useEffect(() => {
    fetchHolidays()
  }, [fetchHolidays])

  const formatDate = (dateObj) => {
    const date = new Date(dateObj.iso)
    return date.toLocaleDateString('en-MY', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getDayOfWeek = (dateObj) => {
    const date = new Date(dateObj.iso)
    return date.toLocaleDateString('en-US', { weekday: 'short' })
  }

  const getMonthGroup = (dateObj) => {
    const date = new Date(dateObj.iso)
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

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

  // Consolidate duplicate holidays (same logic as CalendarView)
  const consolidateHolidays = (holidayList) => {
    // Group by date
    const byDate = {}
    holidayList.forEach(holiday => {
      const dateKey = holiday.date.iso.split('T')[0]
      if (!byDate[dateKey]) {
        byDate[dateKey] = []
      }
      byDate[dateKey].push(holiday)
    })

    const consolidated = []
    Object.values(byDate).forEach(dayHolidays => {
      // Group similar holidays (same base name)
      const grouped = {}
      dayHolidays.forEach(holiday => {
        const baseName = holiday.name
          .replace(/\s+(Holiday|Day)$/i, '')
          .replace(/Second Day of /i, '')
          .trim()
        
        if (!grouped[baseName]) {
          grouped[baseName] = []
        }
        grouped[baseName].push(holiday)
      })

      // Consolidate groups with complementary locations
      Object.values(grouped).forEach(group => {
        if (group.length === 1) {
          consolidated.push(group[0])
        } else {
          const hasAllExcept = group.some(h => h.locations?.toLowerCase().includes('all except'))
          const hasSpecific = group.some(h => h.locations && !h.locations.toLowerCase().includes('all except'))
          
          if (hasAllExcept && hasSpecific) {
            const mainHoliday = group[0]
            consolidated.push({
              ...mainHoliday,
              locations: 'All states',
              type: ['National'],
              consolidated: true
            })
          } else {
            consolidated.push(...group)
          }
        }
      })
    })

    return consolidated
  }

  const consolidatedHolidays = consolidateHolidays(holidays)

  const groupedHolidays = consolidatedHolidays.reduce((groups, holiday) => {
    const month = getMonthGroup(holiday.date)
    if (!groups[month]) {
      groups[month] = []
    }
    groups[month].push(holiday)
    return groups
  }, {})

  return (
    <div className="holiday-checker">
      <div className="controls-card">
        <div className="controls-row">
          <div className="control-group">
            <label htmlFor="country">Country</label>
            <select
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="select-input"
            >
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label htmlFor="year">Year</label>
            <select
              id="year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="select-input"
            >
              {[...Array(5)].map((_, i) => {
                const y = new Date().getFullYear() - 1 + i
                return (
                  <option key={y} value={y}>
                    {y}
                  </option>
                )
              })}
            </select>
          </div>
        </div>

        <div className="controls-row">
          <div className="view-toggle">
            <label>View</label>
            <div className="toggle-buttons">
              <button
                className={`toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`}
                onClick={() => setViewMode('calendar')}
                title="Calendar View"
              >
                <FontAwesomeIcon icon={faCalendar} /> Calendar
              </button>
              <button
                className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
                title="Table View"
              >
                <FontAwesomeIcon icon={faTable} /> Table
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading holidays...</p>
        </div>
      ) : error ? (
        <div className="error-card">
          <div className="error-icon">
            <FontAwesomeIcon icon={faTriangleExclamation} />
          </div>
          <h3>Error Loading Holidays</h3>
          <p>{error}</p>
          <button onClick={fetchHolidays} className="retry-btn">
            Try Again
          </button>
        </div>
      ) : holidays.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <FontAwesomeIcon icon={faCalendarDays} />
          </div>
          <h3>No Holidays Found</h3>
          <p>Try selecting a different country or year.</p>
        </div>
      ) : viewMode === 'calendar' ? (
        <CalendarView 
          holidays={holidays} 
          year={year} 
          country={countries.find((c) => c.code === country)?.name || 'Selected Country'}
        />
      ) : (
        <div className="holidays-container">
          <div className="holidays-header">
            <h2>
              <FontAwesomeIcon icon={faGlobe} className="header-icon" />
              {consolidatedHolidays.length} Public Holidays in {countries.find((c) => c.code === country)?.name} ({year})
            </h2>
          </div>

          {Object.entries(groupedHolidays).map(([month, monthHolidays]) => (
            <div key={month} className="month-section">
              <h3 className="month-header">{month}</h3>
              <div className="holidays-table-wrapper">
                <table className="holidays-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Day</th>
                      <th>Holiday</th>
                      <th>Description</th>
                      <th>Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthHolidays.map((holiday, index) => (
                      <tr key={index} className="holiday-row">
                        <td className="date-cell">
                          <div className="date-box">
                            <span className="date-day">{new Date(holiday.date.iso).getDate()}</span>
                            <span className="date-month">
                              {new Date(holiday.date.iso).toLocaleDateString('en-US', { month: 'short' })}
                            </span>
                          </div>
                        </td>
                        <td className="day-cell">{getDayOfWeek(holiday.date)}</td>
                        <td className="name-cell">
                          <strong>{holiday.name}</strong>
                          {holiday.locations && (() => {
                            const locLower = holiday.locations.toLowerCase().trim();
                            const isAllStates = holiday.consolidated || locLower === 'all states' || locLower === 'all';
                            const isAllExcept = locLower.includes('all except');
                            
                            return (
                              <div className="table-locations">
                                <small>
                                  {isAllStates
                                    ? '🌍 Nationwide (All States)'
                                    : `📍 ${expandStateNames(holiday.locations)}`
                                  }
                                </small>
                              </div>
                            );
                          })()}
                        </td>
                        <td className="description-cell">
                          {holiday.description || '-'}
                        </td>
                        <td className="type-cell">
                          <span className={`type-badge ${normalizeHolidayType(holiday.type).toLowerCase()}`}>
                            {normalizeHolidayType(holiday.type)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default HolidayChecker
