import { useState, useEffect } from 'react'
import { isSupabaseConfigured, supabase, supabaseKey } from '../utils/supabaseClient'

export default function AdminDashboard() {
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [authError, setAuthError] = useState('')

  // Dashboard state
  const [activeTab, setActiveTab] = useState('bookings')
  const [bookings, setBookings] = useState([])
  const [manualBlocks, setManualBlocks] = useState([])
  const [syncStatus, setSyncStatus] = useState('')
  
  // Manual block form state
  const [propertyId, setPropertyId] = useState('5br')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [blockNote, setBlockNote] = useState('')
  const [blockError, setBlockError] = useState('')
  const [blockSuccess, setBlockSuccess] = useState('')

  useEffect(() => {
    if (!supabase) return undefined

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session) {
      fetchBookings()
      fetchManualBlocks()
    }
  }, [session])

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!supabase) {
      setAuthError('Supabase is not configured for this deployment.')
      return
    }
    setLoading(true)
    setAuthError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setAuthError(error.message)
    setLoading(false)
  }

  const handleLogout = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setSession(null)
  }

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) console.error(error)
    else setBookings(data)
  }

  const fetchManualBlocks = async () => {
    const { data, error } = await supabase
      .from('blocked_dates')
      .select('*')
      .eq('source', 'manual')
      .order('date', { ascending: true })
    if (error) console.error(error)
    else setManualBlocks(data)
  }

  const handleSync = async () => {
    setSyncStatus('syncing')
    try {
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-ota-calendars`
      const res = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`
        }
      })
      const result = await res.json()
      if (res.ok && result.success) {
        setSyncStatus('success')
        fetchManualBlocks()
      } else {
        throw new Error(result.error || 'Sync failed')
      }
    } catch (err) {
      console.error(err)
      setSyncStatus('error')
    }
  }

  const handleCreateBlock = async (e) => {
    e.preventDefault()
    setBlockError('')
    setBlockSuccess('')

    if (!startDate || !endDate) {
      setBlockError('Please select start and end dates.')
      return
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (start >= end) {
      setBlockError('Start date must be before end date.')
      return
    }

    const datesToBlock = []
    const cur = new Date(start)
    while (cur < end) {
      datesToBlock.push({
        property_id: propertyId,
        date: cur.toISOString().slice(0, 10),
        source: 'manual',
        notes: blockNote || 'Blocked by Admin'
      })
      cur.setDate(cur.getDate() + 1)
    }

    const { error } = await supabase
      .from('blocked_dates')
      .insert(datesToBlock)

    if (error) {
      setBlockError(error.message)
    } else {
      setBlockSuccess('Dates successfully blocked!')
      setStartDate('')
      setEndDate('')
      setBlockNote('')
      fetchManualBlocks()
    }
  }

  const handleDeleteBlock = async (id) => {
    const { error } = await supabase
      .from('blocked_dates')
      .delete()
      .eq('id', id)
    if (error) console.error(error)
    else fetchManualBlocks()
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="admin-login-container">
        <div className="admin-login-form">
          <h2 className="admin-title">Host Dashboard Unavailable</h2>
          <div className="admin-error">Supabase environment variables are missing. Configure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY before deploying.</div>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="admin-login-container">
        <form className="admin-login-form" onSubmit={handleLogin}>
          <h2 className="admin-title">Lizzy's Place Host Login</h2>
          {authError && <div className="admin-error">{authError}</div>}
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              placeholder="host@lizzysplace.com"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Access Dashboard'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div>
          <h2>Host Dashboard</h2>
          <p className="admin-subtitle">Manage availability, direct bookings & OTA syncing</p>
        </div>
        <div className="admin-actions">
          <button 
            className="btn-details" 
            onClick={handleSync}
            disabled={syncStatus === 'syncing'}
          >
            {syncStatus === 'syncing' ? 'Syncing...' : 'Sync OTA Calendars'}
          </button>
          <button className="btn-secondary" onClick={handleLogout}>Log Out</button>
        </div>
      </header>

      {syncStatus === 'success' && <div className="admin-alert-success">OTA Calendars Synced Successfully!</div>}
      {syncStatus === 'error' && <div className="admin-alert-error">Failed to sync OTA calendars. Check Supabase Edge Function logs.</div>}

      <div className="admin-tabs">
        <button 
          className={`admin-tab ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          Direct Bookings ({bookings.length})
        </button>
        <button 
          className={`admin-tab ${activeTab === 'blocks' ? 'active' : ''}`}
          onClick={() => setActiveTab('blocks')}
        >
          Manual Calendar Blocks ({manualBlocks.length})
        </button>
        <button 
          className={`admin-tab ${activeTab === 'instructions' ? 'active' : ''}`}
          onClick={() => setActiveTab('instructions')}
        >
          OTA Setup Instructions
        </button>
      </div>

      <main className="admin-content">
        {activeTab === 'bookings' && (
          <div className="admin-table-container">
            <h3>Direct Website Bookings</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Guest</th>
                  <th>Property</th>
                  <th>Dates</th>
                  <th>Total Price</th>
                  <th>Stripe Session ID</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td>
                      <strong>{b.guest_name}</strong>
                      <div className="guest-meta">{b.guest_email} {b.guest_phone && `| ${b.guest_phone}`}</div>
                    </td>
                    <td>{b.property_id === '5br' ? '5BR (Classic)' : '6BR (Grand)'}</td>
                    <td>{b.start_date} to {b.end_date}</td>
                    <td>${b.total_price}</td>
                    <td><code className="stripe-code">{b.stripe_session_id?.slice(0, 15)}...</code></td>
                    <td>
                      <span className={`status-badge ${b.status}`}>{b.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'blocks' && (
          <div className="admin-blocks-grid">
            <div className="block-form-container">
              <h3>Add Manual Calendar Block</h3>
              {blockError && <div className="admin-error">{blockError}</div>}
              {blockSuccess && <div className="admin-alert-success">{blockSuccess}</div>}
              <form onSubmit={handleCreateBlock}>
                <div className="form-group">
                  <label>Select Property</label>
                  <select value={propertyId} onChange={e => setPropertyId(e.target.value)}>
                    <option value="5br">The Classic (5BR Home)</option>
                    <option value="6br">The Grand (6BR Home)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Block Start Date</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Block End Date (Check-out)</label>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Block Note (Internal)</label>
                  <input 
                    type="text" 
                    value={blockNote} 
                    onChange={e => setBlockNote(e.target.value)} 
                    placeholder="e.g., HVAC Maintenance / Personal Stay"
                  />
                </div>
                <button type="submit" className="btn-primary">Apply Calendar Block</button>
              </form>
            </div>

            <div className="block-list-container">
              <h3>Active Manual Blocks</h3>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Blocked Date</th>
                    <th>Note</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {manualBlocks.map(block => (
                    <tr key={block.id}>
                      <td>{block.property_id === '5br' ? '5BR (Classic)' : '6BR (Grand)'}</td>
                      <td>{block.date}</td>
                      <td>{block.notes}</td>
                      <td>
                        <button className="btn-delete" onClick={() => handleDeleteBlock(block.id)}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'instructions' && (
          <div className="admin-instructions">
            <h3>Export Your Direct Booking iCal Feeds</h3>
            <p>Paste these calendar feeds into your Airbnb and VRBO listing settings. When a direct website booking or manual block is added, these feeds will automatically reserve the dates on Airbnb and VRBO.</p>
            
            <div className="feed-urls">
              <div className="feed-url-block">
                <h4>5-Bedroom (The Classic) Feed URL:</h4>
                <code>{`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ical-feed?property=5br`}</code>
              </div>
              <div className="feed-url-block">
                <h4>6-Bedroom (The Grand) Feed URL:</h4>
                <code>{`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ical-feed?property=6br`}</code>
              </div>
            </div>

            <div className="ota-guide">
              <h4>Airbnb Setup Steps:</h4>
              <ol>
                <li>Log in to Airbnb Host account → go to <strong>Calendar</strong>.</li>
                <li>In your calendar view, open the side panel and find <strong>Pricing and Availability</strong>.</li>
                <li>Scroll down to <strong>Calendar Sync</strong> and click <strong>Import Calendar</strong>.</li>
                <li>Paste the matching 5BR or 6BR URL from above and name it "Lizzy's Place Direct".</li>
              </ol>

              <h4>VRBO Setup Steps:</h4>
              <ol>
                <li>Log in to VRBO Owner dashboard → select your listing.</li>
                <li>Go to <strong>Calendars</strong> → <strong>Reservations</strong>.</li>
                <li>Click <strong>Import/Export</strong> dropdown and select <strong>Import Calendar</strong>.</li>
                <li>Paste the matching URL, choose a color, and name it "Lizzy's Place Direct".</li>
              </ol>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
