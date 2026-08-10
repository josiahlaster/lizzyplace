import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Intro from './components/Intro'
import Properties from './components/Properties'
import Gallery from './components/Gallery'
import Amenities from './components/Amenities'
import Location from './components/Location'
import Reviews from './components/Reviews'
import CTA from './components/CTA'
import InquiryForm from './components/InquiryForm'
import Footer from './components/Footer'
import Modal from './components/Modal'
import BookingPage from './components/BookingPage'
import BookingSuccess from './components/BookingSuccess'
import BookingCancel from './components/BookingCancel'
import AdminDashboard from './components/AdminDashboard'
import './App.css'

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function HomePage() {
  const [activeModal, setActiveModal] = useState(null)

  useEffect(() => {
    document.body.style.overflow = activeModal ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [activeModal])

  return (
    <>
      <Hero />
      <Intro />
      <Properties openModal={setActiveModal} />
      <Gallery id="gallery-5bed" label="The Classic" title="5-Bedroom Gallery" subtitle="Explore every corner of our beautifully designed 5BR home." galleryKey="g5" />
      <Gallery id="gallery-6bed" label="The Grand" title="6-Bedroom Gallery" subtitle="Explore every corner of our spacious 6BR home with basement suite." galleryKey="g6" />
      <Amenities />
      <Location />
      <Reviews />
      <InquiryForm />
      <CTA />
      <Modal id="modal-5br" active={activeModal === 'modal-5br'} onClose={() => setActiveModal(null)} />
      <Modal id="modal-6br" active={activeModal === 'modal-6br'} onClose={() => setActiveModal(null)} />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter basename="/lizzyplace">
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/book/:propertyId" element={<BookingPage />} />
        <Route path="/booking/success" element={<BookingSuccess />} />
        <Route path="/booking/cancel" element={<BookingCancel />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}
