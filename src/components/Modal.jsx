const BedIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 12h20"/></svg>

const ROOMS_5 = [
  { floor: '2nd Floor', name: 'Primary Suite', desc: 'King bed · Private ensuite · Double closets · Wine fridge · Desk' },
  { floor: '2nd Floor', name: 'Bedroom 2', desc: 'Queen bed · Private ensuite · Closet · TV' },
  { floor: '2nd Floor', name: 'Bedroom 3', desc: 'Queen bed · Shared full bathroom' },
  { floor: '2nd Floor', name: 'Bedroom 4', desc: '2 Twin beds · Perfect for kids' },
  { floor: '1st Floor', name: 'Den', desc: 'Queen sleeper sofa · Private space' },
]

const ROOMS_6 = [
  { floor: 'Upstairs', name: 'Primary Suite', desc: 'King bed · Private ensuite · Double closets · Wine fridge · Desk' },
  { floor: 'Upstairs', name: 'Bedroom 2', desc: 'Queen bed · Private ensuite · Smart TV' },
  { floor: 'Upstairs', name: 'Bedroom 3', desc: 'Queen bed · Shared full bathroom' },
  { floor: 'Upstairs', name: 'Bedroom 4', desc: '2 Twin beds · Shared full bathroom' },
  { floor: 'Main Floor', name: 'Bedroom 5', desc: 'Queen sleeper sofa · Near half bath' },
  { floor: 'Private', name: 'Basement Suite', desc: 'King bed · Own living room · Full bath · Kitchen · Washer/dryer · Private entrance' },
]

export default function Modal({ id, active, onClose }) {
  const is5br = id === 'modal-5br'
  const rooms = is5br ? ROOMS_5 : ROOMS_6
  const title = is5br ? '5-Bedroom Home' : '6-Bedroom Home'
  const tagline = is5br ? 'Sleeping arrangements for up to 10 guests' : 'Sleeping arrangements for up to 14 guests'

  if (!active) return null

  return (
    <div className="modal-overlay active" id={id} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <h3>{title}</h3>
        <p className="property-tagline">{tagline}</p>
        <ul className="room-list">
          {rooms.map(r => (
            <li key={r.name} className="room-item">
              <div className="room-icon"><BedIcon /></div>
              <div className="room-details"><h5>{r.name} · {r.floor}</h5><p>{r.desc}</p></div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
