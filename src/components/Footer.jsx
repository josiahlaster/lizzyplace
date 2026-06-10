export default function Footer() {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <a href="#" className="nav-logo" onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>Lizzy's Place</a>
          <p>Family-run luxury stays in Durham, NC — where Southern hospitality meets serene comfort. Superhosts Shae &amp; Liz.</p>
        </div>
        <div>
          <h4>Explore</h4>
          <ul>
            <li><a href="#properties" onClick={e => { e.preventDefault(); scrollTo('properties') }}>Properties</a></li>
            <li><a href="#amenities" onClick={e => { e.preventDefault(); scrollTo('amenities') }}>Amenities</a></li>
            <li><a href="#location" onClick={e => { e.preventDefault(); scrollTo('location') }}>Location</a></li>
            <li><a href="#reviews" onClick={e => { e.preventDefault(); scrollTo('reviews') }}>Reviews</a></li>
          </ul>
        </div>
        <div>
          <h4>Inquire</h4>
          <ul>
            <li><a href="#inquiry" onClick={e => { e.preventDefault(); scrollTo('inquiry') }}>5-Bedroom Home</a></li>
            <li><a href="#inquiry" onClick={e => { e.preventDefault(); scrollTo('inquiry') }}>6-Bedroom Home</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 Lizzy's Place. All rights reserved.</p>
        <p>Durham, North Carolina</p>
      </div>
    </footer>
  )
}
