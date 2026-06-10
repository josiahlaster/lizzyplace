import { useState, useEffect } from 'react'
import { useReveal } from '../hooks/useReveal'

// iCal URLs – Airbnb provides these in your listing's Calendar settings
const ICAL_URLS = {
  '5br': {
    airbnb: 'https://www.airbnb.com/calendar/ical/1191526833797890858.ics',
    vrbo: '', // Paste your VRBO iCal export URL here from VRBO Host > Calendar > Export
  },
  '6br': {
    airbnb: 'https://www.airbnb.com/calendar/ical/1414760083961093369.ics',
    vrbo: '', // Paste your VRBO iCal export URL here from VRBO Host > Calendar > Export
  },
}

// CORS proxy needed because browsers block direct iCal fetches
const PROXY = 'https://corsproxy.io/?url='

// Parse iCal text → Set of 'YYYY-MM-DD' blocked date strings
function parseICal(text) {
  const blocked = new Set()
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    .replace(/\n[ \t]/g, '') // unfold
    .split('\n')

  let inEvent = false
  let dtStart = null
  let dtEnd = null

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') { inEvent = true; dtStart = null; dtEnd = null }
    if (line === 'END:VEVENT') {
      if (dtStart && dtEnd) {
        const cur = new Date(dtStart)
        while (cur < dtEnd) {
          blocked.add(cur.toISOString().slice(0, 10))
          cur.setDate(cur.getDate() + 1)
        }
      }
      inEvent = false
    }
    if (!inEvent) continue
    const [key, ...rest] = line.split(':')
    const val = rest.join(':').trim()
    const baseKey = key.split(';')[0]
    if (baseKey === 'DTSTART') dtStart = parseICalDate(val)
    if (baseKey === 'DTEND') dtEnd = parseICalDate(val)
  }
  return blocked
}

function parseICalDate(val) {
  // DATE-TIME: 20250601T140000Z or DATE: 20250601
  const clean = val.replace('Z', '')
  const y = clean.slice(0, 4), m = clean.slice(4, 6), d = clean.slice(6, 8)
  return new Date(`${y}-${m}-${d}`)
}

// Fetch an iCal URL via CORS proxy
async function fetchICal(url) {
  if (!url) return new Set()
  try {
    const res = await fetch(`${PROXY}${encodeURIComponent(url)}`)
    if (!res.ok) return new Set()
    const json = await res.json()
    return parseICal(json.contents)
  } catch {
    return new Set()
  }
}

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
    const urls = ICAL_URLS[propertyKey]
    Promise.all([fetchICal(urls.airbnb), fetchICal(urls.vrbo)]).then(([a, v]) => {
      setBlocked(new Set([...a, ...v]))
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
