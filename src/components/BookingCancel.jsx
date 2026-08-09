import { Link } from 'react-router-dom';

export default function BookingCancel() {
  return (
    <div className="booking-cancel-page">
      <div className="booking-cancel-card">
        <h1>Booking Cancelled</h1>
        <p>Your payment was not processed. No charges were made.</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button onClick={() => window.history.back()} className="btn-return" style={{ background: 'var(--cream-dark)', color: 'var(--charcoal)' }}>Try Again</button>
          <Link to="/" className="btn-return">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
