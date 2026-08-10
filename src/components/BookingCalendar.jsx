import { useState, useEffect } from 'react'
import { useReveal } from '../hooks/useReveal'
import { fetchBlockedDates } from '../utils/availability'

function daysInMonth(year, month) { return new Date(year, month + 1, 0).getDate() }
function firstDayOfMonth(year, month) { return new Date(year, month, 1).getDay() }
function toKey(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function MonthGrid({ year, month, blocked, today }) {
  const days = daysInMonth(year, month)
  const firstDay = firstDayOfMonth(year, month)
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= days; d++) cells.push(d)

  return (
    <div className="cal-month">
      <div className="cal-month-title">{MONTHS[month]} {year}</div>
      <div className="cal-grid">
        {DAYS.map(d => <div key={d} className="cal-day-label">{d}</div>)}
        {cells.map((d, i) => {
          if (!d) return <div key={`e${i}`} />
          const key = toKey(year, month, d)
          const todayKey = today.toISOString().slice(0, 10)
          const isPast = key < todayKey
          const isBlocked = blocked.has(key)
          let cls = 'cal-day'
          if (isPast) cls += ' past'
          else if (isBlocked) cls += ' blocked'
          else cls += ' available'
          return <div key={key} className={cls}>{d}</div>
        })}
      </div>
    </div>
  )
}

function PropertyCalendar({ propertyKey, airbnbUrl, label }) {
  const [blocked, setBlocked] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const today = new Date()
  const months = [
    { year: today.getFullYear(), month: today.getMonth() },
    { year: today.getMonth() === 11 ? today.getFullYear() + 1 : today.getFullYear(), month: (today.getMonth() + 1) % 12 },
    { year: today.getMonth() >= 10 ? today.getFullYear() + 1 : today.getFullYear(), month: (today.getMonth() + 2) % 12 },
  ]

  useEffect(() => {
    setLoading(true)
    fetchBlockedDates(propertyKey).then(dates => {
      setBlocked(dates)
      setLoading(false)
    })
  }, [propertyKey])

  return (
    <div className="property-cal-block">
      <h3 className="property-cal-title">{label}</h3>
      {loading ? (
        <div className="cal-loading">Loading availability…</div>
      ) : (
        <div className="cal-months-row">
          {months.map(({ year, month }) => (
            <MonthGrid key={`${year}-${month}`} year={year} month={month} blocked={blocked} today={today} />
          ))}
        </div>
      )}
      <div className="cal-legend">
        <span><span className="legend-dot available" />Available</span>
        <span><span className="legend-dot blocked" />Booked</span>
        <span><span className="legend-dot past" />Past</span>
      </div>
      <a
        href={airbnbUrl}
        target="_blank"
        rel="noreferrer"
        className="btn-book cal-book-btn"
      >
        Book Now
      </a>
    </div>
  )
}

export default function BookingCalendar() {
  const addRef = useReveal()
  return (
    <section className="booking-cal-section" id="availability">
      <div className="booking-cal-inner reveal" ref={addRef}>
        <p className="section-label">Live Availability</p>
        <h2 className="section-title">Check Open Dates</h2>
        <p className="section-subtitle">
          Calendars sync automatically with Airbnb &amp; VRBO — no double-bookings.
        </p>
        <div className="booking-cal-grid">
          <PropertyCalendar
            propertyKey="5br"
            airbnbUrl="https://www.airbnb.com/rooms/1191526833797890858"
            label="The Classic · 5-Bedroom"
          />
          <PropertyCalendar
            propertyKey="6br"
            airbnbUrl="https://www.airbnb.com/rooms/1414760083961093369"
            label="The Grand · 6-Bedroom"
          />
        </div>
      </div>
    </section>
  )
}
