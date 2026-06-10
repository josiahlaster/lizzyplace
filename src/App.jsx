import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Intro from './components/Intro'
import Properties from './components/Properties'
import Gallery from './components/Gallery'
import Amenities from './components/Amenities'
import Location from './components/Location'
import Reviews from './components/Reviews'
import BookingCalendar from './components/BookingCalendar'
import CTA from './components/CTA'
import InquiryForm from './components/InquiryForm'
import Footer from './components/Footer'
import Modal from './components/Modal'
import './App.css'

export default function App() {
  const [activeModal, setActiveModal] = useState(null)

  useEffect(() => {
    document.body.style.overflow = activeModal ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [activeModal])

  return (
    <>
      <Navbar />
      <Hero />
      <Intro />
      <Properties openModal={setActiveModal} />
      <Gallery id="gallery-5bed" label="The Classic" title="5-Bedroom Gallery" subtitle="Explore every corner of our beautifully designed 5BR home." galleryKey="g5" />
      <Gallery id="gallery-6bed" label="The Grand" title="6-Bedroom Gallery" subtitle="Explore every corner of our spacious 6BR home with basement suite." galleryKey="g6" />
      <Amenities />
      <Location />
      {/*<BookingCalendar />*/}
      <Reviews />
      <InquiryForm />
      <CTA />
      <Footer />
      <Modal id="modal-5br" active={activeModal === 'modal-5br'} onClose={() => setActiveModal(null)} />
      <Modal id="modal-6br" active={activeModal === 'modal-6br'} onClose={() => setActiveModal(null)} />
    </>
  )
}
