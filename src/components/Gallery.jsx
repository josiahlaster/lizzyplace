import { useState } from 'react'
import { useReveal } from '../hooks/useReveal'
import { img } from '../utils/imagePath'

const GALLERY_5 = [
  { src: '/images/5bed/image1.png', alt: 'Front exterior', category: 'exterior', caption: 'Front Exterior & Wraparound Porch' },
  { src: '/images/5bed/image2.png', alt: 'Rear exterior', category: 'exterior', caption: 'Rear Exterior & Private Parking' },
  { src: '/images/5bed/image12.png', alt: 'Living room', category: 'living', caption: 'Spacious Living Room' },
  { src: '/images/5bed/image16.png', alt: 'Living room fireplace', category: 'living', caption: 'Living Room with Fireplace & TV' },
  { src: '/images/5bed/image15.png', alt: 'Dining area', category: 'living', caption: 'Elegant Dining Area' },
  { src: '/images/5bed/image17.png', alt: 'Dining detail', category: 'living', caption: 'Dining & Stairway View' },
  { src: '/images/5bed/image8.png', alt: 'Full kitchen', category: 'kitchen', caption: 'Full Kitchen with Island' },
  { src: '/images/5bed/image13.png', alt: 'Kitchen alternate', category: 'kitchen', caption: 'Kitchen – Alternate View' },
  { src: '/images/5bed/image14.png', alt: 'Laundry', category: 'kitchen', caption: 'Pantry & Washer/Dryer' },
  { src: '/images/5bed/image9.png', alt: 'Primary suite', category: 'bedroom', caption: 'Primary Suite – King Bed' },
  { src: '/images/5bed/image11.png', alt: 'Primary suite alt', category: 'bedroom', caption: 'Primary Suite – Another View' },
  { src: '/images/5bed/image5.png', alt: 'Bedroom 2', category: 'bedroom', caption: 'Bedroom 2 – Queen Bed & Desk' },
  { src: '/images/5bed/image6.png', alt: 'Bedroom 3', category: 'bedroom', caption: 'Bedroom 3 – Queen Bed' },
  { src: '/images/5bed/image3.png', alt: 'Bedroom 4', category: 'bedroom', caption: 'Bedroom 4 – Twin Beds & TV' },
  { src: '/images/5bed/image18.png', alt: 'Bedroom 5', category: 'bedroom', caption: 'Bedroom 5 – Queen Bed' },
  { src: '/images/5bed/image4.png', alt: 'Primary bathroom', category: 'bathroom', caption: 'Primary Ensuite Bathroom' },
  { src: '/images/5bed/image10.png', alt: 'Bathroom blue', category: 'bathroom', caption: 'Full Bathroom – Blue Tile' },
  { src: '/images/5bed/image7.png', alt: 'Half bathroom', category: 'bathroom', caption: 'Half Bathroom' },
  { src: '/images/5bed/image19.png', alt: 'Shower', category: 'bathroom', caption: 'Walk-in Shower' },
]

const GALLERY_6 = [
  { src: '/images/6bed/images.pdf-image-050.jpg', alt: 'Front exterior', category: 'exterior', caption: 'Front Exterior & Wraparound Porch' },
  { src: '/images/6bed/images.pdf-image-051.jpg', alt: 'Front exterior alt', category: 'exterior', caption: 'Front Exterior – Alternate Angle' },
  { src: '/images/6bed/images.pdf-image-054.jpg', alt: 'Rear exterior', category: 'exterior', caption: 'Backyard with Cornhole Boards' },
  { src: '/images/6bed/images.pdf-image-058.jpg', alt: 'Cornhole', category: 'exterior', caption: 'Duke & UNC Cornhole Set' },
  { src: '/images/6bed/images.pdf-image-057.jpg', alt: 'Deck dining', category: 'exterior', caption: 'Upper Deck Dining Area' },
  { src: '/images/6bed/images.pdf-image-059.jpg', alt: 'Deck umbrella', category: 'exterior', caption: 'Deck Seating with Umbrella' },
  { src: '/images/6bed/images.pdf-image-053.jpg', alt: 'Basement patio', category: 'exterior', caption: 'Basement Patio Entrance' },
  { src: '/images/6bed/images.pdf-image-056.jpg', alt: 'Basement entry', category: 'exterior', caption: 'Basement Private Entrance' },
  { src: '/images/6bed/images.pdf-image-055.jpg', alt: 'Guest parking', category: 'exterior', caption: 'Guest Parking Area' },
  { src: '/images/6bed/images.pdf-image-060.jpg', alt: 'Side yard', category: 'exterior', caption: 'Fenced Side Yard & Parking' },
  { src: '/images/6bed/image.jpg', alt: 'Rear exterior', category: 'exterior', caption: 'Rear Exterior & Dual Driveways' },
  { src: '/images/6bed/images.pdf-image-000.jpg', alt: 'Main living', category: 'living', caption: 'Main Living Room' },
  { src: '/images/6bed/images.pdf-image-001.jpg', alt: 'Living alt', category: 'living', caption: 'Living Room – Alternate View' },
  { src: '/images/6bed/images.pdf-image-002.jpg', alt: 'Living fireplace', category: 'living', caption: 'Living Room with Fireplace & TV' },
  { src: '/images/6bed/images.pdf-image-003.jpg', alt: 'Fireplace', category: 'living', caption: 'Black Brick Fireplace Detail' },
  { src: '/images/6bed/images.pdf-image-004.jpg', alt: 'Den', category: 'living', caption: 'Den / Sitting Room' },
  { src: '/images/6bed/images.pdf-image-024.jpg', alt: 'Dining', category: 'living', caption: 'Formal Dining Room' },
  { src: '/images/6bed/images.pdf-image-026.jpg', alt: 'Dining alt', category: 'living', caption: 'Dining Room – Alternate View' },
  { src: '/images/6bed/images.pdf-image-025.jpg', alt: 'Dining stairway', category: 'living', caption: 'Dining Area & Stairway' },
  { src: '/images/6bed/images.pdf-image-023.jpg', alt: 'Breakfast nook', category: 'living', caption: 'Bay Window Breakfast Nook' },
  { src: '/images/6bed/images.pdf-image-045.jpg', alt: 'Hallway', category: 'living', caption: 'Upstairs Hallway & Landing' },
  { src: '/images/6bed/images.pdf-image-005.jpg', alt: 'Basement suite', category: 'living', caption: 'Basement Suite – Full View' },
  { src: '/images/6bed/images.pdf-image-006.jpg', alt: 'Basement living', category: 'living', caption: 'Basement Living & Kitchen' },
  { src: '/images/6bed/images.pdf-image-007.jpg', alt: 'Basement fireplace', category: 'living', caption: 'Basement Lounge with Fireplace' },
  { src: '/images/6bed/images.pdf-image-008.jpg', alt: 'Basement wide', category: 'living', caption: 'Basement Suite – Panoramic View' },
  { src: '/images/6bed/images.pdf-image-009.jpg', alt: 'Basement couch', category: 'living', caption: 'Cozy Seating Under Stairs' },
  { src: '/images/6bed/images.pdf-image-010.jpg', alt: 'Basement TV', category: 'living', caption: 'Basement TV & Fireplace Wall' },
  { src: '/images/6bed/images.pdf-image-011.jpg', alt: 'Game area', category: 'living', caption: 'Game Area with Air Hockey' },
  { src: '/images/6bed/images.pdf-image-012.jpg', alt: 'Air hockey', category: 'living', caption: 'LED Air Hockey Table' },
  { src: '/images/6bed/images.pdf-image-013.jpg', alt: 'Game wide', category: 'living', caption: 'Air Hockey & Game Room' },
  { src: '/images/6bed/images.pdf-image-014.jpg', alt: 'Arcade hallway', category: 'living', caption: 'Hallway Gallery & Arcade' },
  { src: '/images/6bed/images.pdf-image-015.jpg', alt: 'Pac-Man', category: 'living', caption: 'Ms. Pac-Man Arcade Cabinet' },
  { src: '/images/6bed/images.pdf-image-049.jpg', alt: 'Laundry', category: 'living', caption: 'Pantry & Washer/Dryer' },
  { src: '/images/6bed/images.pdf-image-016.jpg', alt: 'Main kitchen', category: 'kitchen', caption: 'Main Kitchen with Island' },
  { src: '/images/6bed/images.pdf-image-017.jpg', alt: 'Kitchen alt', category: 'kitchen', caption: 'Kitchen – Alternate View' },
  { src: '/images/6bed/images.pdf-image-018.jpg', alt: 'Kitchen island', category: 'kitchen', caption: 'Kitchen Island & Bar Seating' },
  { src: '/images/6bed/images.pdf-image-019.jpg', alt: 'Keurig', category: 'kitchen', caption: 'Keurig Coffee Station' },
  { src: '/images/6bed/images.pdf-image-020.jpg', alt: 'Drip coffee', category: 'kitchen', caption: 'Drip Coffee Bar' },
  { src: '/images/6bed/images.pdf-image-021.jpg', alt: 'Basement kitchen', category: 'kitchen', caption: 'Basement Kitchen' },
  { src: '/images/6bed/images.pdf-image-022.jpg', alt: 'Basement kitchen wide', category: 'kitchen', caption: 'Basement Kitchen & Bar Stools' },
  { src: '/images/6bed/images.pdf-image-027.jpg', alt: 'Primary suite', category: 'bedroom', caption: 'Primary Suite – King Bed' },
  { src: '/images/6bed/images.pdf-image-028.jpg', alt: 'Primary wide', category: 'bedroom', caption: 'Primary Suite – Full View' },
  { src: '/images/6bed/images.pdf-image-029.jpg', alt: 'Primary desk', category: 'bedroom', caption: 'Primary Suite – Desk & TV' },
  { src: '/images/6bed/images.pdf-image-030.jpg', alt: 'Welcome tray', category: 'bedroom', caption: 'Welcome Wine & Guest WiFi' },
  { src: '/images/6bed/images.pdf-image-031.jpg', alt: 'Bedroom 2', category: 'bedroom', caption: 'Bedroom 2 – Queen Bed' },
  { src: '/images/6bed/images.pdf-image-032.jpg', alt: 'Bedroom 2 alt', category: 'bedroom', caption: 'Bedroom 2 – Window & Desk' },
  { src: '/images/6bed/images.pdf-image-033.jpg', alt: 'Bedroom 3', category: 'bedroom', caption: 'Bedroom 3 – Queen Bed' },
  { src: '/images/6bed/images.pdf-image-034.jpg', alt: 'Bedroom 3 ensuite', category: 'bedroom', caption: 'Bedroom 3 & Ensuite View' },
  { src: '/images/6bed/images.pdf-image-035.jpg', alt: 'Bedroom 4', category: 'bedroom', caption: 'Bedroom 4 – Twin Beds & TV' },
  { src: '/images/6bed/images.pdf-image-036.jpg', alt: 'Bedroom 4 alt', category: 'bedroom', caption: 'Bedroom 4 – Alternate View' },
  { src: '/images/6bed/images.pdf-image-037.jpg', alt: 'Bedroom 5', category: 'bedroom', caption: 'Bedroom 5 – Queen Bed & Desk' },
  { src: '/images/6bed/images.pdf-image-038.jpg', alt: 'Basement bedroom', category: 'bedroom', caption: 'Basement Suite – King Bed' },
  { src: '/images/6bed/images.pdf-image-039.jpg', alt: 'Basement wide', category: 'bedroom', caption: 'Basement Suite – Full View' },
  { src: '/images/6bed/images.pdf-image-040.jpg', alt: 'Basement fireplace', category: 'bedroom', caption: 'Basement Bedroom with Fireplace' },
  { src: '/images/6bed/images.pdf-image-041.jpg', alt: 'Primary ensuite', category: 'bathroom', caption: 'Primary Ensuite – Double Vanity & Walk-in Shower' },
  { src: '/images/6bed/images.pdf-image-042.jpg', alt: 'Primary vanity', category: 'bathroom', caption: 'Primary Ensuite – Double Vanity Detail' },
  { src: '/images/6bed/images.pdf-image-043.jpg', alt: 'Marble shower', category: 'bathroom', caption: 'Marble Walk-in Shower' },
  { src: '/images/6bed/images.pdf-image-044.jpg', alt: 'Blue tile bath', category: 'bathroom', caption: 'Full Bath – Blue Tile & Tub' },
  { src: '/images/6bed/images.pdf-image-046.jpg', alt: 'Basement bath', category: 'bathroom', caption: 'Basement Bath – Gold Accents' },
  { src: '/images/6bed/images.pdf-image-047.jpg', alt: 'Basement bath tub', category: 'bathroom', caption: 'Basement Bath with Tub' },
  { src: '/images/6bed/images.pdf-image-048.jpg', alt: 'Half bath', category: 'bathroom', caption: 'Half Bath – Navy Vanity & Gold' },
]

const FILTERS = ['all', 'exterior', 'living', 'bedroom', 'kitchen', 'bathroom']
const FILTER_LABELS = { all: 'All', exterior: 'Exterior', living: 'Living Areas', bedroom: 'Bedrooms', kitchen: 'Kitchen', bathroom: 'Bathrooms' }

export { GALLERY_5, GALLERY_6 }

export default function Gallery({ id, label, title, subtitle, galleryKey }) {
  const [filter, setFilter] = useState('all')
  const [current, setCurrent] = useState(0)
  const addRef = useReveal()

  const allItems = galleryKey === 'g5' ? GALLERY_5 : GALLERY_6
  const items = allItems.filter(i => filter === 'all' || i.category === filter)

  const safeIndex = items.length ? ((current % items.length) + items.length) % items.length : 0

  const goTo = (n) => setCurrent(((n % items.length) + items.length) % items.length)
  const prev = () => goTo(safeIndex - 1)
  const next = () => goTo(safeIndex + 1)

  // Reset to 0 when filter changes
  const handleFilter = (f) => { setFilter(f); setCurrent(0) }

  const bg = galleryKey === 'g5' ? 'var(--cream)' : 'var(--warm-white)'

  return (
    <section className={`gallery gallery-${galleryKey === 'g5' ? '5bed' : '6bed'}`} id={id} style={{ background: bg }}>
      <div className="gallery-header reveal" ref={addRef}>
        <p className="section-label">{label}</p>
        <h2 className="section-title">{title}</h2>
        <p className="section-subtitle">{subtitle}</p>
      </div>

      {/* Filter tabs */}
      <div className="gallery-filters">
        {FILTERS.map(f => (
          <button key={f} className={`gallery-filter${filter === f ? ' active' : ''}`} onClick={() => handleFilter(f)}>
            {FILTER_LABELS[f]}
          </button>
        ))}
      </div>

      {/* Carousel */}
      {items.length > 0 && (
        <div className="carousel-wrapper reveal" ref={addRef}>
          {/* Main slide */}
          <div className="carousel-stage">
            <button className="carousel-arrow carousel-prev" onClick={prev} aria-label="Previous">&#8249;</button>
            <div className="carousel-slide">
              <img
                key={items[safeIndex].src}
                src={img(items[safeIndex].src)}
                alt={items[safeIndex].alt}
                className="carousel-img"
              />
              <div className="carousel-caption">
                <span className="carousel-caption-text">{items[safeIndex].caption}</span>
                <span className="carousel-counter">{safeIndex + 1} / {items.length}</span>
              </div>
            </div>
            <button className="carousel-arrow carousel-next" onClick={next} aria-label="Next">&#8250;</button>
          </div>

          {/* Thumbnail strip */}
          <div className="carousel-thumbs">
            {items.map((item, i) => (
              <button
                key={item.src}
                className={`carousel-thumb${i === safeIndex ? ' active' : ''}`}
                onClick={() => goTo(i)}
                aria-label={item.caption}
              >
                <img src={img(item.src)} alt={item.alt} />
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
