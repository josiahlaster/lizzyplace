import { useReveal } from '../hooks/useReveal'

export default function CTA() {
  const addRef = useReveal()
  return (
    <section className="cta-section" id="cta">
      <div className="cta-inner reveal" ref={addRef}>
        <p className="section-label" style={{ color: 'rgba(255,255,255,0.7)' }}>Ready to Stay?</p>
        <h2>Your Serene Escape Awaits</h2>
        <p>Choose the home that fits your group and book directly through Airbnb for the best experience.</p>
        <div className="cta-buttons">
          <a href="https://www.airbnb.com/rooms/1191526833797890858" target="_blank" rel="noreferrer" className="btn-cta-primary">Book 5-Bedroom</a>
          <a href="https://www.airbnb.com/rooms/1414760083961093369" target="_blank" rel="noreferrer" className="btn-cta-secondary">Book 6-Bedroom</a>
        </div>
      </div>
    </section>
  )
}
