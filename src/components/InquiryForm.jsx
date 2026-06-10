import { useState } from 'react'

export default function InquiryForm() {
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [message, setMessage] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    const formData = new FormData(e.target)

    try {
      // FormSubmit AJAX endpoint — email is injected at build time from VITE_FORM_EMAIL env var
      const email = import.meta.env.VITE_FORM_EMAIL
      const res = await fetch(`https://formsubmit.co/ajax/${email}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.fromEntries(formData)),
      })
      const data = await res.json()
      if (data.success === 'true' || data.success === true) {
        setStatus('success')
        setMessage('✓ Thank you! Your inquiry has been sent. Shae & Liz will be in touch soon.')
        e.target.reset()
      } else {
        setStatus('error')
        setMessage('Something went wrong. Please try again.')
      }
    } catch {
      setStatus('error')
      setMessage('Unable to send. Please check your connection and try again.')
    }

    setTimeout(() => { setStatus('idle'); setMessage('') }, 8000)
  }

  return (
    <section className="inquiry-section" id="inquiry">
      <div className="inquiry-inner">
        <div className="inquiry-header">
          <p className="section-label">Get In Touch</p>
          <h2 className="section-title">Send An Inquiry</h2>
          <p className="section-subtitle">
            Interested in booking directly or have questions about our homes? Leave us a message
            and Shae &amp; Liz will get back to you shortly.
          </p>
        </div>

        <form className="inquiry-form" onSubmit={handleSubmit}>
          {/* FormSubmit config fields */}
          <input type="hidden" name="_subject" value="New Inquiry — Lizzy's Place Website" />
          <input type="hidden" name="_captcha" value="false" />
          {/* Honeypot spam filter */}
          <input type="text" name="_honey" style={{ display: 'none' }} />

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="inq-name">Your Name</label>
              <input type="text" id="inq-name" name="name" required placeholder="Jane Doe" />
            </div>
            <div className="form-group">
              <label htmlFor="inq-email">Email Address</label>
              <input type="email" id="inq-email" name="email" required placeholder="jane@example.com" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="inq-phone">
                Phone Number <span className="form-optional">(Optional)</span>
              </label>
              <input type="tel" id="inq-phone" name="phone" placeholder="(555) 000-0000" />
            </div>
            <div className="form-group">
              <label htmlFor="inq-property">Property of Interest</label>
              <select id="inq-property" name="property_interest">
                <option value="General Inquiry">General Inquiry / Other</option>
                <option value="5BR Home – The Classic">5-Bedroom Home (The Classic)</option>
                <option value="6BR Home – The Grand">6-Bedroom Home (The Grand)</option>
                <option value="Both Properties">Both Properties (Large Groups / Retreats)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="inq-dates">
              Preferred Dates <span className="form-optional">(Optional)</span>
            </label>
            <input type="text" id="inq-dates" name="preferred_dates" placeholder="e.g. July 4–8, 2025" />
          </div>

          <div className="form-group">
            <label htmlFor="inq-message">Your Message</label>
            <textarea
              id="inq-message"
              name="message"
              rows={5}
              required
              placeholder="Tell us about your group size, trip purpose, and any special requests…"
            />
          </div>

          <div className="form-submit-container">
            <button
              type="submit"
              id="inquirySubmitBtn"
              className={`btn-submit${status === 'loading' ? ' loading' : ''}`}
              disabled={status === 'loading'}
            >
              <span className="btn-submit-text">
                {status === 'loading' ? 'Sending' : 'Send Inquiry'}
              </span>
              <span className="btn-submit-loader" aria-hidden="true" />
            </button>
          </div>

          {message && (
            <div className={`form-result visible ${status}`} role="alert" aria-live="polite">
              {message}
            </div>
          )}
        </form>
      </div>
    </section>
  )
}

