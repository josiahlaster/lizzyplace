import { useReveal } from '../hooks/useReveal'

export default function CTA() {
  const addRef = useReveal()
  return (
    <section className="cta-section" id="cta">
      <div className="cta-inner reveal" ref={addRef}>
        <p className="section-label" style={{ color: 'rgba(255,255,255,0.7)' }}>Ready to Stay?</p>
        <h2>Your Serene Escape Awaits</h2>
        <p>Have questions or want to book directly? Send us a message and we'll get back to you shortly.</p>
        <div className="cta-buttons">
          <button className="btn-cta-primary" onClick={() => document.getElementById('inquiry')?.scrollIntoView({ behavior: 'smooth' })}>Inquire – 5-Bedroom</button>
          <button className="btn-cta-secondary" onClick={() => document.getElementById('inquiry')?.scrollIntoView({ behavior: 'smooth' })}>Inquire – 6-Bedroom</button>
        </div>
      </div>
    </section>
  )
}
