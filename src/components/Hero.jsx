import { img } from '../utils/imagePath'

export default function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="hero-bg">
        <img src={img('images/5bed/image1.png')} alt="Lizzy's Place exterior" />
      </div>
      <div className="hero-overlay" />
      <div className="hero-content">
        <div className="hero-badge"><span className="dot" /> Durham, North Carolina <span className="dot" /></div>
        <h1>Lizzy's Place</h1>
        <p>Two thoughtfully designed homes near Duke University — where serene comfort meets Southern hospitality.</p>
        <div className="hero-actions">
          <a href="#properties" className="btn-primary" onClick={e => { e.preventDefault(); document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' }) }}>Explore Our Homes</a>
          <a href="#cta" className="btn-secondary" onClick={e => { e.preventDefault(); document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' }) }}>Book Your Stay</a>
        </div>
      </div>
      <div className="scroll-indicator"><span>Scroll</span><div className="scroll-line" /></div>
    </section>
  )
}
