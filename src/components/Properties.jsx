import { useReveal } from '../hooks/useReveal'
import { img } from '../utils/imagePath'

const BedIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 12h20"/></svg>
const GuestIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
const BedroomIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7v11a2 2 0 002 2h14a2 2 0 002-2V7"/><path d="M21 7H3l2-4h14l2 4z"/></svg>
const BathIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12h16M4 12a2 2 0 01-2-2V6a2 2 0 012-2h16a2 2 0 012 2v4a2 2 0 01-2 2M6 12v4a2 2 0 002 2h8a2 2 0 002-2v-4"/></svg>

export default function Properties({ openModal }) {
  const addRef = useReveal()
  return (
    <section className="properties" id="properties">
      <div className="properties-header reveal" ref={addRef}>
        <p className="section-label">Our Homes</p>
        <h2 className="section-title">Choose Your Perfect Stay</h2>
        <p className="section-subtitle">Two unique layouts in the same serene Durham neighborhood, just 0.7 miles from Duke University.</p>
      </div>

      <div className="property-card reveal" id="prop-5br" ref={addRef}>
        <div className="property-images">
          <img src={img('images/5bed/image12.png')} alt="5-Bedroom Home – Living Room" />
          <span className="property-badge">5 Bedrooms</span>
        </div>
        <div className="property-info">
          <p className="section-label">The Classic</p>
          <h3 className="property-name">5BR / 3.5BA Home</h3>
          <p className="property-tagline">Near Duke &amp; UNC – Perfect for families and small groups of up to 10 guests.</p>
          <div className="property-rating"><span className="stars">★★★★★</span><span className="rating-text">5.0 · 27 reviews</span></div>
          <div className="property-specs">
            <div className="spec"><GuestIcon /> 10 Guests</div>
            <div className="spec"><BedroomIcon /> 5 Bedrooms</div>
            <div className="spec"><BedIcon /> 6 Beds</div>
            <div className="spec"><BathIcon /> 3.5 Baths</div>
          </div>
          <div className="property-highlights">
            <span className="highlight-tag">☕ Dual Coffee Makers</span>
            <span className="highlight-tag">🏡 Private Backyard</span>
            <span className="highlight-tag">💼 Workspace</span>
            <span className="highlight-tag">🅿️ Free Parking</span>
          </div>
          <div className="property-cta">
            <a href="https://www.airbnb.com/rooms/1191526833797890858" target="_blank" rel="noreferrer" className="btn-book">Book on Airbnb</a>
            <button className="btn-details" onClick={() => openModal('modal-5br')}>View Rooms</button>
            <a href="#gallery-5bed" className="btn-details" onClick={e => { e.preventDefault(); document.getElementById('gallery-5bed')?.scrollIntoView({ behavior: 'smooth' }) }}>Gallery</a>
          </div>
        </div>
      </div>

      <div className="property-card reverse reveal" id="prop-6br" ref={addRef}>
        <div className="property-images">
          <img src={img('images/6bed/images.pdf-image-050.jpg')} alt="6-Bedroom Home" />
          <span className="property-badge">6 Bedrooms</span>
        </div>
        <div className="property-info">
          <p className="section-label">The Grand</p>
          <h3 className="property-name">6BR / 4.5BA Home</h3>
          <p className="property-tagline">The ultimate retreat — two kitchens, a game lounge, private basement suite, and space for up to 14.</p>
          <div className="property-rating"><span className="stars">★★★★★</span><span className="rating-text">5.0 · 14 reviews · Guest Favorite</span></div>
          <div className="property-specs">
            <div className="spec"><GuestIcon /> 14 Guests</div>
            <div className="spec"><BedroomIcon /> 6 Bedrooms</div>
            <div className="spec"><BedIcon /> 7 Beds</div>
            <div className="spec"><BathIcon /> 4.5 Baths</div>
          </div>
          <div className="property-highlights">
            <span className="highlight-tag">🎮 Game Lounge</span>
            <span className="highlight-tag">🏠 Basement Suite</span>
            <span className="highlight-tag">📶 335 Mbps WiFi</span>
            <span className="highlight-tag">👨‍🍳 2 Kitchens</span>
          </div>
          <div className="property-cta">
            <a href="https://www.airbnb.com/rooms/1414760083961093369" target="_blank" rel="noreferrer" className="btn-book">Book on Airbnb</a>
            <button className="btn-details" onClick={() => openModal('modal-6br')}>View Rooms</button>
            <a href="#gallery-6bed" className="btn-details" onClick={e => { e.preventDefault(); document.getElementById('gallery-6bed')?.scrollIntoView({ behavior: 'smooth' }) }}>Gallery</a>
          </div>
        </div>
      </div>
    </section>
  )
}
