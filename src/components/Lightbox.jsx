import { useEffect } from 'react'
import { GALLERY_5, GALLERY_6 } from './Gallery'

export default function Lightbox({ state, onClose, onNav }) {
  const { open, gallery, index } = state
  const items = gallery === 'g5' ? GALLERY_5 : GALLERY_6
  const safeIndex = items.length ? ((index % items.length) + items.length) % items.length : 0
  const item = items[safeIndex]

  useEffect(() => {
    const handler = (e) => {
      if (!open) return
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onNav(-1)
      if (e.key === 'ArrowRight') onNav(1)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose, onNav])

  if (!open || !item) return null

  return (
    <div className="lightbox active" id="lightbox" onClick={e => e.target.id === 'lightbox' && onClose()}>
      <button className="lightbox-close" onClick={onClose}>✕</button>
      <button className="lightbox-nav lightbox-prev" onClick={() => onNav(-1)}>‹</button>
      <img src={item.src} alt={item.alt} id="lightbox-img" />
      <button className="lightbox-nav lightbox-next" onClick={() => onNav(1)}>›</button>
      <div className="lightbox-caption" id="lightbox-caption">{item.caption}</div>
    </div>
  )
}
