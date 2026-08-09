import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const isHome = location.pathname === '/' || location.pathname === ''

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    onScroll() // check initial state
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // On non-home pages, always show scrolled (dark) style
  const showScrolled = scrolled || !isHome

  const scrollTo = (id) => {
    if (isHome) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate('/')
      // After navigation, scroll to the section
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
    setOpen(false)
  }

  const goHome = (e) => {
    e.preventDefault()
    if (isHome) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      navigate('/')
    }
  }

  return (
    <nav className={`navbar${showScrolled ? ' scrolled' : ''}`} id="navbar">
      <a href="#" className="nav-logo" onClick={goHome}>Lizzy's Place</a>
      <ul className={`nav-links${open ? ' open' : ''}`} id="navLinks">
        <li><a href="#properties" onClick={e => { e.preventDefault(); scrollTo('properties') }}>Properties</a></li>
        <li><a href="#amenities" onClick={e => { e.preventDefault(); scrollTo('amenities') }}>Amenities</a></li>
        <li><a href="#location" onClick={e => { e.preventDefault(); scrollTo('location') }}>Location</a></li>
        <li><a href="#reviews" onClick={e => { e.preventDefault(); scrollTo('reviews') }}>Reviews</a></li>
        <li><a href="#inquiry" onClick={e => { e.preventDefault(); scrollTo('inquiry') }}>Contact</a></li>
      </ul>
      <button className="nav-book" onClick={() => scrollTo('properties')}>BOOK NOW</button>
      <button className="nav-toggle" id="navToggle" aria-label="Menu" onClick={() => setOpen(o => !o)}>
        <span /><span /><span />
      </button>
    </nav>
  )
}
