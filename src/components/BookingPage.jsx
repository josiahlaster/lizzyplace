import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { isSupabaseConfigured, supabase, supabaseKey } from '../utils/supabaseClient';
import { fetchBlockedDates } from '../utils/availability';

const PROPERTIES = {
  '5br': {
    name: 'The Classic',
    fullName: 'The Classic · 5BR / 3.5BA Home',
    badge: '5 Bedrooms',
    specs: '10 guests · 5 bedrooms · 6 beds · 3.5 baths',
    maxGuests: 10,
  },
  '6br': {
    name: 'The Grand',
    fullName: 'The Grand · 6BR / 4.5BA Home',
    badge: '6 Bedrooms',
    specs: '14 guests · 6 bedrooms · 7 beds · 4.5 baths',
    maxGuests: 14,
  },
};

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function toDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseLocalDate(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDisplayDate(date) {
  if (!date) return 'Select date';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function BookingPage() {
  const { propertyId } = useParams();
  const property = PROPERTIES[propertyId] || PROPERTIES['5br'];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = toDateStr(today);

  const [baseMonth, setBaseMonth] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [blockedDates, setBlockedDates] = useState(new Set());
  const [pricePerNight, setPricePerNight] = useState(299);
  const [loading, setLoading] = useState(true);
  const [checkIn, setCheckIn] = useState(null);   // 'YYYY-MM-DD' string
  const [checkOut, setCheckOut] = useState(null);  // 'YYYY-MM-DD' string
  const [hoverDate, setHoverDate] = useState(null);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [numGuests, setNumGuests] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const dates = await fetchBlockedDates(propertyId);
        setBlockedDates(dates);

        if (supabase) {
          const { data, error } = await supabase
            .from('properties')
            .select('base_price_per_night')
            .eq('id', propertyId)
            .single();

          if (!error && data) {
            setPricePerNight(data.base_price_per_night);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [propertyId]);

  const isBlocked = (dateStr) => blockedDates.has(dateStr);
  const isPast = (dateStr) => dateStr < todayStr;

  const hasBlockedInRange = (startStr, endStr) => {
    const cur = parseLocalDate(startStr);
    const end = parseLocalDate(endStr);
    while (cur < end) {
      if (isBlocked(toDateStr(cur))) return true;
      cur.setDate(cur.getDate() + 1);
    }
    return false;
  };

  const handleDateClick = (dateStr) => {
    if (isBlocked(dateStr) || isPast(dateStr)) return;

    if (!checkIn || (checkIn && checkOut)) {
      // Starting a new selection
      setCheckIn(dateStr);
      setCheckOut(null);
      setError('');
    } else {
      // Picking checkout
      if (dateStr <= checkIn) {
        // Clicked before check-in, restart
        setCheckIn(dateStr);
        setCheckOut(null);
      } else {
        if (hasBlockedInRange(checkIn, dateStr)) {
          setError('Selected range includes unavailable dates. Please choose different dates.');
          setCheckIn(dateStr);
          setCheckOut(null);
        } else {
          setCheckOut(dateStr);
          setError('');
        }
      }
    }
  };

  const prevMonth = () => {
    if (baseMonth.year === today.getFullYear() && baseMonth.month === today.getMonth()) return;
    const d = new Date(baseMonth.year, baseMonth.month - 1, 1);
    setBaseMonth({ year: d.getFullYear(), month: d.getMonth() });
  };

  const nextMonth = () => {
    const d = new Date(baseMonth.year, baseMonth.month + 1, 1);
    setBaseMonth({ year: d.getFullYear(), month: d.getMonth() });
  };

  const canGoPrev = !(baseMonth.year === today.getFullYear() && baseMonth.month === today.getMonth());

  function renderMonth(year, month) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const cells = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`e-${i}`} className="booking-day empty" />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const blocked = isBlocked(dateStr);
      const past = isPast(dateStr);
      const isCheckIn = checkIn === dateStr;
      const isCheckOut = checkOut === dateStr;
      const isInRange = checkIn && checkOut && dateStr > checkIn && dateStr < checkOut;

      // Hover preview range
      const isHoverRange = checkIn && !checkOut && hoverDate && dateStr > checkIn && dateStr <= hoverDate && !blocked && !past;
      const hoverRangeValid = isHoverRange && !hasBlockedInRange(checkIn, dateStr);

      let cls = 'booking-day';
      if (blocked) cls += ' blocked';
      else if (past) cls += ' past';
      else cls += ' available';

      if (isCheckIn) cls += ' selected check-in';
      if (isCheckOut) cls += ' selected check-out';
      if (isInRange) cls += ' in-range';
      if (hoverRangeValid) cls += ' in-range';

      cells.push(
        <div
          key={dateStr}
          className={cls}
          onClick={() => handleDateClick(dateStr)}
          onMouseEnter={() => !blocked && !past && setHoverDate(dateStr)}
          onMouseLeave={() => setHoverDate(null)}
        >
          {d}
        </div>
      );
    }

    return (
      <div className="booking-month" key={`${year}-${month}`}>
        <div className="booking-month-title">{MONTHS[month]} {year}</div>
        <div className="booking-cal-header">
          {DAYS.map(d => <div key={d}>{d}</div>)}
        </div>
        <div className="booking-cal-grid">
          {cells}
        </div>
      </div>
    );
  }

  const month1 = { year: baseMonth.year, month: baseMonth.month };
  const m2Date = new Date(baseMonth.year, baseMonth.month + 1, 1);
  const month2 = { year: m2Date.getFullYear(), month: m2Date.getMonth() };

  const nights = checkIn && checkOut
    ? Math.round((parseLocalDate(checkOut) - parseLocalDate(checkIn)) / (1000 * 60 * 60 * 24))
    : 0;
  const total = nights * pricePerNight;

  const isFormValid = checkIn && checkOut && guestName.trim() && guestEmail.trim() && guestPhone.trim() && numGuests > 0;

  const handleSubmit = async () => {
    if (!isFormValid || submitting) return;
    if (!isSupabaseConfigured) {
      setError('Booking is temporarily unavailable. Please try again later.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`;
      const res = await fetch(functionUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({
          propertyId,
          startDate: checkIn,
          endDate: checkOut,
          guestName: guestName.trim(),
          guestEmail: guestEmail.trim(),
          guestPhone: guestPhone.trim(),
          totalAmount: total,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        setSubmitting(false);
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="booking-page">
      <Link to="/" className="booking-back">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back to Home
      </Link>

      <div className="booking-property-header">
        <span className="badge">{property.badge}</span>
        <h1>{property.name}</h1>
        <p>{property.specs}</p>
      </div>

      <div className="booking-layout">
        {/* Calendar Section */}
        <div className="booking-calendar-section">
          <div className="booking-calendar">
            <div className="booking-cal-nav">
              <button onClick={prevMonth} disabled={!canGoPrev} aria-label="Previous month">&lsaquo;</button>
              <h3 className="booking-cal-nav-title">Select Your Dates</h3>
              <button onClick={nextMonth} aria-label="Next month">&rsaquo;</button>
            </div>

            {loading ? (
              <div className="booking-cal-loading">Loading availability…</div>
            ) : (
              <div className="booking-months-grid">
                {renderMonth(month1.year, month1.month)}
                {renderMonth(month2.year, month2.month)}
              </div>
            )}
          </div>

          <div className="booking-legend">
            <div><span className="dot available"></span> Available</div>
            <div><span className="dot selected"></span> Selected</div>
            <div><span className="dot blocked"></span> Booked</div>
          </div>

          {error && <div className="booking-error">{error}</div>}
        </div>

        {/* Summary Section */}
        <div className="booking-summary">
          <div className="booking-summary-header">
            <p className="booking-summary-label">Booking Summary</p>
            <h3>{property.fullName}</h3>
          </div>

          <div className="booking-dates-display">
            <div>
              <span>Check-in</span>
              <strong>{checkIn ? formatDisplayDate(parseLocalDate(checkIn)) : 'Select date'}</strong>
            </div>
            <div className="booking-dates-divider">→</div>
            <div>
              <span>Check-out</span>
              <strong>{checkOut ? formatDisplayDate(parseLocalDate(checkOut)) : 'Select date'}</strong>
            </div>
          </div>

          {nights > 0 && (
            <>
              <div className="booking-price-breakdown">
                <div className="booking-price-line">
                  <span>${pricePerNight} × {nights} night{nights > 1 ? 's' : ''}</span>
                  <span className="dots"></span>
                  <span>${total.toLocaleString()}</span>
                </div>
              </div>
              <div className="booking-total">
                <span>Total</span>
                <span>${total.toLocaleString()}</span>
              </div>
            </>
          )}

          <div className="booking-form">
            <div className="booking-form-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
              />
            </div>
            <div className="booking-form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="john@example.com"
                value={guestEmail}
                onChange={e => setGuestEmail(e.target.value)}
              />
            </div>
            <div className="booking-form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                placeholder="(555) 123-4567"
                value={guestPhone}
                onChange={e => setGuestPhone(e.target.value)}
              />
            </div>
            <div className="booking-form-group">
              <label>Number of Guests</label>
              <select value={numGuests} onChange={e => setNumGuests(parseInt(e.target.value))}>
                {Array.from({ length: property.maxGuests }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1} Guest{i > 0 ? 's' : ''}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            className={`booking-submit ${submitting ? 'loading' : ''}`}
            disabled={!isFormValid || submitting}
            onClick={handleSubmit}
          >
            {submitting ? (
              <>
                <span className="booking-submit-spinner"></span>
                Processing…
              </>
            ) : (
              'Proceed to Payment'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
