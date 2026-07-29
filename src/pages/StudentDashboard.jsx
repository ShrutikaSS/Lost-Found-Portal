import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';
import { PlusCircle, FileText, CheckCircle2, Clock, MapPin, Tag, Phone, Lock, Eye, AlertCircle } from 'lucide-react';

export default function StudentDashboard({ onSelectItem }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('my-reports');

  const [categories, setCategories] = useState([]);
  const [zones, setZones] = useState([]);

  const [myLostItems, setMyLostItems] = useState([]);
  const [myFoundItems, setMyFoundItems] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [loading, setLoading] = useState(false);

  // Lost Form State
  const [lostTitle, setLostTitle] = useState('');
  const [lostCategory, setLostCategory] = useState('');
  const [lostDesc, setLostDesc] = useState('');
  const [lostDate, setLostDate] = useState(new Date().toISOString().split('T')[0]);
  const [lostZone, setLostZone] = useState('');
  const [lostLocation, setLostLocation] = useState('');
  const [lostBrand, setLostBrand] = useState('');
  const [lostColor, setLostColor] = useState('');
  const [lostPhone, setLostPhone] = useState(user?.phone || '');
  const [lostFile, setLostFile] = useState(null);

  // Found Form State
  const [foundTitle, setFoundTitle] = useState('');
  const [foundCategory, setFoundCategory] = useState('');
  const [foundMarkers, setFoundMarkers] = useState('');
  const [foundDate, setFoundDate] = useState(new Date().toISOString().split('T')[0]);
  const [foundZone, setFoundZone] = useState('');
  const [foundLocation, setFoundLocation] = useState('');
  const [foundBrand, setFoundBrand] = useState('');
  const [foundColor, setFoundColor] = useState('');
  const [foundLocker, setFoundLocker] = useState('');
  const [foundFile, setFoundFile] = useState(null);

  useEffect(() => {
    fetchMetadata();
    fetchMyData();
  }, []);

  const fetchMetadata = async () => {
    try {
      const [catRes, zoneRes] = await Promise.all([
        fetch('/api/items/categories'),
        fetch('/api/items/zones')
      ]);
      if (catRes.ok) setCategories(await catRes.json());
      if (zoneRes.ok) setZones(await zoneRes.json());
    } catch (e) {}
  };

  const fetchMyData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [reportsRes, claimsRes] = await Promise.all([
        fetch('/api/items/my-reports', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/claims/my-claims', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (reportsRes.ok) {
        const data = await reportsRes.json();
        setMyLostItems(data.lostItems || []);
        setMyFoundItems(data.foundItems || []);
      }
      if (claimsRes.ok) {
        setMyClaims(await claimsRes.json());
      }
    } catch (e) {
      console.error('Failed fetching student data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkClaimed = async (itemType, itemId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/items/${itemType}/${itemId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'claimed' })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Item status updated to Claimed & Recovered!', 'success');
        fetchMyData();
      } else {
        showToast(data.error || 'Failed to update item status.', 'error');
      }
    } catch (err) {
      showToast('Server connection error.', 'error');
    }
  };

  const handleReportLost = async (e) => {
    e.preventDefault();
    if (!lostTitle || !lostCategory || !lostDesc || !lostDate || !lostZone || !lostPhone) {
      showToast('Please complete all required fields.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('title', lostTitle);
    formData.append('category_id', lostCategory);
    formData.append('description', lostDesc);
    formData.append('date_lost', lostDate);
    formData.append('campus_zone_id', lostZone);
    formData.append('location_details', lostLocation);
    formData.append('brand', lostBrand);
    formData.append('primary_color', lostColor);
    formData.append('contact_number', lostPhone);
    if (lostFile) formData.append('image', lostFile);

    try {
      const res = await fetch('/api/items/lost', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      const data = await res.json();

      if (res.ok) {
        showToast('Lost item reported successfully! Status set to Submitted.', 'success');
        setLostTitle('');
        setLostDesc('');
        setLostBrand('');
        setLostColor('');
        setLostFile(null);
        fetchMyData();
        setActiveTab('my-reports');
      } else {
        showToast(data.error || 'Failed to submit report.', 'error');
      }
    } catch (err) {
      showToast('Server connection error.', 'error');
    }
  };

  const handleReportFound = async (e) => {
    e.preventDefault();
    if (!foundTitle || !foundCategory || !foundDate || !foundZone) {
      showToast('Please complete all required fields.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('title', foundTitle);
    formData.append('category_id', foundCategory);
    formData.append('visual_markers', foundMarkers);
    formData.append('date_found', foundDate);
    formData.append('campus_zone_id', foundZone);
    formData.append('location_details', foundLocation);
    formData.append('brand', foundBrand);
    formData.append('primary_color', foundColor);
    formData.append('locker_id', foundLocker);
    if (foundFile) formData.append('image', foundFile);

    try {
      const res = await fetch('/api/items/found', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      const data = await res.json();

      if (res.ok) {
        showToast('Found item reported! Queued for Officer verification.', 'success');
        setFoundTitle('');
        setFoundMarkers('');
        setFoundBrand('');
        setFoundColor('');
        setFoundLocker('');
        setFoundFile(null);
        fetchMyData();
        setActiveTab('my-reports');
      } else {
        showToast(data.error || 'Failed to submit report.', 'error');
      }
    } catch (err) {
      showToast('Server connection error.', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Student Header */}
      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Student & Staff Portal</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Welcome back, <strong>{user?.name}</strong> ({user?.email}). Track your submitted reports and active claims.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className={`btn ${activeTab === 'report-lost' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setActiveTab('report-lost')}>
            <PlusCircle size={15} /> Report Lost Item
          </button>
          <button className={`btn ${activeTab === 'report-found' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setActiveTab('report-found')}>
            <PlusCircle size={15} /> Report Found Item
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>
        <button 
          className={`btn ${activeTab === 'my-reports' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('my-reports')}
        >
          My Reported Items ({myLostItems.length + myFoundItems.length})
        </button>
        <button 
          className={`btn ${activeTab === 'my-claims' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('my-claims')}
        >
          My Claims Tracker ({myClaims.length})
        </button>
        <button 
          className={`btn ${activeTab === 'report-lost' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('report-lost')}
        >
          Submit Lost Report
        </button>
        <button 
          className={`btn ${activeTab === 'report-found' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('report-found')}
        >
          Submit Found Report
        </button>
      </div>

      {/* Tab Content 1: My Reported Items Pipeline */}
      {activeTab === 'my-reports' && (
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Personal Report Pipelines</h2>
          
          {loading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading your reports...</p>
          ) : (myLostItems.length === 0 && myFoundItems.length === 0) ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p>You haven't reported any lost or found items yet.</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
                <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('report-lost')}>Report Lost Item</button>
                <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('report-found')}>Report Found Item</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {myLostItems.map(item => (
                <div key={`lost-${item.id}`} className="glass-panel" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                    <div>
                      <span className="badge badge-submitted" style={{ marginRight: '0.5rem' }}>LOST ITEM</span>
                      <strong style={{ fontSize: '1.1rem' }}>{item.title}</strong>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '0.75rem' }}>Reported on {item.date_lost}</span>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>

                  {/* Matched Found Item Banner */}
                  {item.matched_found_title && (
                    <div style={{ background: 'rgba(37, 99, 235, 0.08)', border: '1px solid rgba(37, 99, 235, 0.2)', padding: '0.65rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.85rem' }}>
                      <span>⚡ <strong>System Match Found:</strong> Matched with <strong>"{item.matched_found_title}"</strong> ({item.match_score}% Confidence)</span>
                      {item.matched_found_id && (
                        <button className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }} onClick={() => onSelectItem({ id: item.matched_found_id, item_type: 'found', title: item.matched_found_title })}>
                          View Matched Item Details
                        </button>
                      )}
                    </div>
                  )}

                  {/* Status Pipeline visual tracker */}
                  <div className="pipeline-tracker">
                    <div className={`pipeline-step ${['submitted', 'verified', 'matched', 'claimed', 'returned', 'closed'].includes(item.status) ? 'completed' : ''}`}>
                      <div className="pipeline-dot">1</div>
                      <span>Submitted</span>
                    </div>
                    <div className={`pipeline-step ${['verified', 'matched', 'claimed', 'returned', 'closed'].includes(item.status) ? 'completed' : item.status === 'submitted' ? 'active' : ''}`}>
                      <div className="pipeline-dot">2</div>
                      <span>Verification</span>
                    </div>
                    <div className={`pipeline-step ${['matched', 'claimed', 'returned', 'closed'].includes(item.status) ? 'completed' : ''}`}>
                      <div className="pipeline-dot">3</div>
                      <span>Matched</span>
                    </div>
                    <div className={`pipeline-step ${['claimed', 'returned', 'closed'].includes(item.status) ? 'completed' : ''}`}>
                      <div className="pipeline-dot">4</div>
                      <span>Claimed</span>
                    </div>
                    <div className={`pipeline-step ${['closed', 'returned'].includes(item.status) ? 'completed' : ''}`}>
                      <div className="pipeline-dot">5</div>
                      <span>Closed</span>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-glass)', paddingTop: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span>Category: <strong>{item.category_name}</strong> | Location: <strong>{item.zone_name}</strong></span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {!['claimed', 'returned', 'closed'].includes(item.status) && (
                        <button className="btn btn-primary btn-sm" style={{ background: '#16a34a', borderColor: '#16a34a' }} onClick={() => handleMarkClaimed('lost', item.id)}>
                          <CheckCircle2 size={14} /> Mark as Recovered
                        </button>
                      )}
                      <button className="btn btn-secondary btn-sm" onClick={() => onSelectItem({ ...item, item_type: 'lost' })}>
                        <Eye size={14} /> Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {myFoundItems.map(item => (
                <div key={`found-${item.id}`} className="glass-panel" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                    <div>
                      <span className="badge badge-available" style={{ marginRight: '0.5rem' }}>FOUND ITEM</span>
                      <strong style={{ fontSize: '1.1rem' }}>{item.title}</strong>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '0.75rem' }}>Turned in on {item.date_found}</span>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>

                  <div className="pipeline-tracker">
                    <div className={`pipeline-step ${['submitted', 'verified', 'available', 'returned', 'closed'].includes(item.status) ? 'completed' : ''}`}>
                      <div className="pipeline-dot">1</div>
                      <span>Submitted</span>
                    </div>
                    <div className={`pipeline-step ${['verified', 'available', 'returned', 'closed'].includes(item.status) ? 'completed' : ''}`}>
                      <div className="pipeline-dot">2</div>
                      <span>Officer Verified</span>
                    </div>
                    <div className={`pipeline-step ${['available', 'returned', 'closed'].includes(item.status) ? 'completed' : ''}`}>
                      <div className="pipeline-dot">3</div>
                      <span>In Inventory</span>
                    </div>
                    <div className={`pipeline-step ${['returned', 'closed'].includes(item.status) ? 'completed' : ''}`}>
                      <div className="pipeline-dot">4</div>
                      <span>Returned</span>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-glass)', paddingTop: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span>Category: <strong>{item.category_name}</strong> | Storage Locker ID: <strong style={{ color: 'var(--secondary)' }}>{item.locker_id || 'Officer Assigned'}</strong></span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {!['returned', 'claimed', 'closed'].includes(item.status) && (
                        <button className="btn btn-primary btn-sm" style={{ background: '#16a34a', borderColor: '#16a34a' }} onClick={() => handleMarkClaimed('found', item.id)}>
                          <CheckCircle2 size={14} /> Mark as Returned
                        </button>
                      )}
                      <button className="btn btn-secondary btn-sm" onClick={() => onSelectItem({ ...item, item_type: 'found' })}>
                        <Eye size={14} /> Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content 2: My Claims Tracker */}
      {activeTab === 'my-claims' && (
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Submitted Ownership Claims</h2>

          {myClaims.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No claims submitted yet. You can submit claims on items found in the public search inventory.
            </div>
          ) : (
            <div className="table-responsive glass-panel">
              <table className="table">
                <thead>
                  <tr>
                    <th>Claim ID</th>
                    <th>Item Name</th>
                    <th>Institutional ID Ref</th>
                    <th>Submitted Date</th>
                    <th>Status</th>
                    <th>Officer Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {myClaims.map(claim => (
                    <tr key={claim.id}>
                      <td><strong>#CLM-{claim.id}</strong></td>
                      <td>{claim.item_title}</td>
                      <td><code>{claim.id_card_ref}</code></td>
                      <td>{new Date(claim.created_at).toLocaleDateString()}</td>
                      <td><StatusBadge status={claim.status} /></td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {claim.officer_remarks || 'Pending officer review'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab Content 3: Report Lost Form */}
      {activeTab === 'report-lost' && (
        <div className="glass-panel" style={{ padding: '2rem', maxWidth: '720px', margin: '0 auto', width: '100%' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem' }}>Report a Lost Item</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Provide item details to help officers and our matching algorithm locate your lost property.
          </p>

          <form onSubmit={handleReportLost}>
            <div className="form-group">
              <label className="form-label">Item Name / Title *</label>
              <input type="text" className="form-control" placeholder="e.g. MacBook Pro 14 Space Gray" value={lostTitle} onChange={e => setLostTitle(e.target.value)} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select className="form-control" value={lostCategory} onChange={e => setLostCategory(e.target.value)} required>
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Date Lost *</label>
                <input type="date" className="form-control" value={lostDate} onChange={e => setLostDate(e.target.value)} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Campus Zone / Building *</label>
                <select className="form-control" value={lostZone} onChange={e => setLostZone(e.target.value)} required>
                  <option value="">Select Location</option>
                  {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Contact Phone Number *</label>
                <input type="text" className="form-control" placeholder="+1 (555) 234-5678" value={lostPhone} onChange={e => setLostPhone(e.target.value)} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Brand / Manufacturer</label>
                <input type="text" className="form-control" placeholder="e.g. Apple, Fossil, Sony" value={lostBrand} onChange={e => setLostBrand(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Primary Color</label>
                <input type="text" className="form-control" placeholder="e.g. Space Gray, Black, Brown" value={lostColor} onChange={e => setLostColor(e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Detailed Description *</label>
              <textarea className="form-control" rows="3" placeholder="Mention distinctive stickers, scratches, case details, or specific contents..." value={lostDesc} onChange={e => setLostDesc(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Upload Image (Optional)</label>
              <input type="file" className="form-control" accept="image/*" onChange={e => setLostFile(e.target.files[0])} />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
              Submit Lost Item Report
            </button>
          </form>
        </div>
      )}

      {/* Tab Content 4: Report Found Form */}
      {activeTab === 'report-found' && (
        <div className="glass-panel" style={{ padding: '2rem', maxWidth: '720px', margin: '0 auto', width: '100%' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem' }}>Report a Found Item</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Turned in property will be checked into physical campus locker storage by an Officer.
          </p>

          <form onSubmit={handleReportFound}>
            <div className="form-group">
              <label className="form-label">Found Item Name / Title *</label>
              <input type="text" className="form-control" placeholder="e.g. Fossil Leather Wallet" value={foundTitle} onChange={e => setFoundTitle(e.target.value)} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select className="form-control" value={foundCategory} onChange={e => setFoundCategory(e.target.value)} required>
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Date Found *</label>
                <input type="date" className="form-control" value={foundDate} onChange={e => setFoundDate(e.target.value)} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Recovery Campus Zone *</label>
                <select className="form-control" value={foundZone} onChange={e => setFoundZone(e.target.value)} required>
                  <option value="">Select Location</option>
                  {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Physical Storage Locker ID (Officer Use)</label>
                <input type="text" className="form-control" placeholder="e.g. LOCKER-A04" value={foundLocker} onChange={e => setFoundLocker(e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Brand</label>
                <input type="text" className="form-control" placeholder="e.g. Fossil" value={foundBrand} onChange={e => setFoundBrand(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Primary Color</label>
                <input type="text" className="form-control" placeholder="e.g. Brown" value={foundColor} onChange={e => setFoundColor(e.target.value)} />
              </div>
            </div>

            <div className="form-group" style={{ background: 'rgba(239,68,68,0.06)', border: '1px dashed var(--error)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <label className="form-label" style={{ color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Lock size={15} /> Sensitive Visual Reference Markers (Officer Only)
              </label>
              <textarea className="form-control" rows="2" placeholder="List unique identifying proof (serial number, hidden names, specific contents) — Hidden from public search!" value={foundMarkers} onChange={e => setFoundMarkers(e.target.value)} />
            </div>

            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label className="form-label">Upload Photo (Optional)</label>
              <input type="file" className="form-control" accept="image/*" onChange={e => setFoundFile(e.target.files[0])} />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
              Submit Found Item Report
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
