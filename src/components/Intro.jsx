import { useEffect, useRef } from 'react'

export default function Intro() {
  const ref = useRef()
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => e.isIntersecting && e.target.classList.add('visible'), { threshold: 0.1 })
    ref.current && obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return (
    <section className="intro">
      <div className="intro-inner reveal" ref={ref}>
        <p className="section-label">Welcome</p>
        <h2 className="section-title">A Home Away From Home</h2>
        <p>Hosted by Shae &amp; Liz — a family-run Superhost team with a perfect 5.0 rating. Whether you're visiting Duke, attending an event at DPAC, or gathering with loved ones, Lizzy's Place offers the space, comfort, and peace you deserve.</p>
        <div className="intro-stats">
          <div className="stat"><span className="stat-number">5.0</span><span className="stat-label">Star Rating</span></div>
          <div className="stat"><span className="stat-number">41+</span><span className="stat-label">Reviews</span></div>
          <div className="stat"><span className="stat-number">2</span><span className="stat-label">Properties</span></div>
          <div className="stat"><span className="stat-number">24</span><span className="stat-label">Total Guests</span></div>
        </div>
      </div>
    </section>
  )
}
