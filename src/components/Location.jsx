import { useReveal } from '../hooks/useReveal'

const PinIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>

export default function Location() {
  const addRef = useReveal()
  return (
    <section className="location" id="location">
      <div className="location-inner">
        <div className="location-text reveal" ref={addRef}>
          <p className="section-label">Location</p>
          <h2 className="section-title">Heart of Durham</h2>
          <p className="section-subtitle">Steps from Duke University, world-class dining, and vibrant culture.</p>
          <ul className="location-points">
            <li><PinIcon /> 0.7 miles to Duke University</li>
            <li><PinIcon /> 10 min walk to Duke Hospital</li>
            <li><PinIcon /> Near UNC &amp; DPAC</li>
            <li><PinIcon /> Ninth Street dining &amp; shops</li>
            <li><PinIcon /> Quiet, family-friendly neighborhood</li>
          </ul>
        </div>
        <div className="location-map reveal" ref={addRef}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12917.!2d-78.91!3d36.00!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89ace46f1eb3d5b5%3A0x5b2b3a5c6e5c6c24!2sDuke%20University!5e0!3m2!1sen!2sus!4v1"
            allowFullScreen
            loading="lazy"
            title="Map to Duke University"
          />
        </div>
      </div>
    </section>
  )
}
