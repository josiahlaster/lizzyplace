import { useReveal } from '../hooks/useReveal'

const reviews = [
  { initial: 'J', name: 'Janet', text: '"The home was absolutely perfect for our family trip to visit Duke. Spacious, clean, and had everything we needed. Shae was incredibly responsive and welcoming!"' },
  { initial: 'J', name: 'Julio', text: '"Amazing space for our group! The man cave / game room was a hit. Proximity to Duke campus was unbeatable. We\'ll definitely be booking again."' },
  { initial: 'D', name: 'Deirdre', text: '"Beautifully designed home with thoughtful touches everywhere. The dual kitchens were a lifesaver for our large group. A truly serene retreat."' },
]

export default function Reviews() {
  const addRef = useReveal()
  return (
    <section className="reviews" id="reviews">
      <div className="reviews-header reveal" ref={addRef}>
        <p className="section-label">Guest Experiences</p>
        <h2 className="section-title">What Our Guests Say</h2>
        <p className="section-subtitle">Every stay rated 5 stars — here's why guests love Lizzy's Place.</p>
      </div>
      <div className="reviews-grid">
        {reviews.map(r => (
          <div key={r.name} className="review-card reveal" ref={addRef}>
            <div className="review-stars">★★★★★</div>
            <p className="review-text">{r.text}</p>
            <div className="review-author">
              <div className="review-avatar">{r.initial}</div>
              <div><div className="review-name">{r.name}</div><div className="review-date">Recent Guest</div></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
