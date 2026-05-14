import { useReveal } from '../hooks/useReveal'

const amenities = [
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><path d="M6 1v3M10 1v3M14 1v3"/></svg>,
    title: 'Fully Equipped Kitchen',
    desc: 'Stainless steel appliances, Keurig & drip coffee, blender, toaster, and everything you need to cook at home.'
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a4 4 0 00-8 0v2"/></svg>,
    title: 'Self Check-in',
    desc: 'Easy lockbox access so you arrive on your schedule. No waiting, no hassle — just walk right in.'
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0M12 20h.01"/></svg>,
    title: 'Fast Wi-Fi',
    desc: 'Blazing 335 Mbps for seamless remote work, streaming, and staying connected during your stay.'
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    title: 'Private Backyard',
    desc: 'Peaceful outdoor space with furniture and deck — perfect for morning coffee or evening relaxation.'
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>,
    title: 'Entertainment',
    desc: 'Smart TVs, game console, air hockey, board games, books, and a cozy reading nook.'
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    title: 'Safety & Security',
    desc: 'Exterior cameras, smoke & CO alarms, fire extinguisher, first aid kit — your safety comes first.'
  },
]

export default function Amenities() {
  const addRef = useReveal()
  return (
    <section className="amenities" id="amenities">
      <div className="amenities-header reveal" ref={addRef}>
        <p className="section-label">What We Offer</p>
        <h2 className="section-title">Thoughtful Amenities</h2>
        <p className="section-subtitle">Every detail curated for your comfort and convenience.</p>
      </div>
      <div className="amenities-grid">
        {amenities.map(a => (
          <div key={a.title} className="amenity-card reveal" ref={addRef}>
            <div className="amenity-icon">{a.icon}</div>
            <h4>{a.title}</h4>
            <p>{a.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
