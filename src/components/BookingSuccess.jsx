import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || '';

const PROPERTY_NAMES = {
  '5br': 'The Classic · 5-Bedroom Home',
  '6br': 'The Grand · 6-Bedroom Home',
};

export default function BookingSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [booking, setBooking] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) { setLoading(false); return; }

    fetch(`${API}/api/booking-status/${sessionId}`)
      .then(r => r.json())
      .then(data => {
        setStatus(data.status);
        setBooking(data.booking);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [sessionId]);

  return (
    <div className="booking-success-page">
      <div className="booking-success-card">
        <div className="checkmark-circle">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1>Booking Confirmed!</h1>
        <p>Thank you for choosing Lizzy's Place. We can't wait to host you!</p>

        {loading ? (
          <div className="booking-details">
            <p style={{ textAlign: 'center', color: 'var(--text-light)' }}>Loading booking details…</p>
          </div>
        ) : booking ? (
          <div className="booking-details">
            <div className="booking-details-row">
              <span className="label">Property</span>
              <span className="value">{PROPERTY_NAMES[booking.propertyId] || booking.propertyId}</span>
            </div>
            <div className="booking-details-row">
              <span className="label">Check-in</span>
              <span className="value">{booking.checkIn}</span>
            </div>
            <div className="booking-details-row">
              <span className="label">Check-out</span>
              <span className="value">{booking.checkOut}</span>
            </div>
            <div className="booking-details-row">
              <span className="label">Guest</span>
              <span className="value">{booking.guestName}</span>
            </div>
            <div className="booking-details-row">
              <span className="label">Guests</span>
              <span className="value">{booking.numGuests}</span>
            </div>
            <div className="booking-details-row">
              <span className="label">Amount Paid</span>
              <span className="value">${booking.amountPaid?.toLocaleString()}</span>
            </div>
          </div>
        ) : status === 'paid' ? (
          <div className="booking-details">
            <p style={{ textAlign: 'center' }}>Your payment was successful! You'll receive a confirmation email shortly.</p>
          </div>
        ) : (
          <div className="booking-details">
            <p style={{ textAlign: 'center' }}>We're processing your booking. You'll receive a confirmation email shortly.</p>
          </div>
        )}

        <Link to="/" className="btn-return">Back to Home</Link>
      </div>
    </div>
  );
}
