import { useState, useEffect } from 'react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setOpen(false)
  }

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`} id="navbar">
      <a href="#" className="nav-logo" onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>Lizzy's Place</a>
      <ul className={`nav-links${open ? ' open' : ''}`} id="navLinks">
        <li><a href="#properties" onClick={e => { e.preventDefault(); scrollTo('properties') }}>Properties</a></li>
        <li><a href="#amenities" onClick={e => { e.preventDefault(); scrollTo('amenities') }}>Amenities</a></li>
        <li><a href="#location" onClick={e => { e.preventDefault(); scrollTo('location') }}>Location</a></li>
        <li><a href="#reviews" onClick={e => { e.preventDefault(); scrollTo('reviews') }}>Reviews</a></li>
        <li><a href="#inquiry" onClick={e => { e.preventDefault(); scrollTo('inquiry') }}>Contact</a></li>
      </ul>
      <button className="nav-book" onClick={() => scrollTo('inquiry')}>Make an Inquiry</button>
      <button className="nav-toggle" id="navToggle" aria-label="Menu" onClick={() => setOpen(o => !o)}>
        <span /><span /><span />
      </button>
    </nav>
  )
}
