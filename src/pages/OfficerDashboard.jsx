import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { Shield, CheckCircle, XCircle, Zap, Eye, FileSearch, Lock, Layers } from 'lucide-react';

export default function OfficerDashboard({ onSelectItem }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('claims-queue');

  const [pendingClaims, setPendingClaims] = useState([]);
  const [suggestedMatches, setSuggestedMatches] = useState([]);
  const [unverifiedItems, setUnverifiedItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Review Claim Modal State
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [officerRemarks, setOfficerRemarks] = useState('');
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    fetchOfficerQueues();
  }, []);

  const fetchOfficerQueues = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [claimsRes, matchesRes, itemsRes] = await Promise.all([
        fetch('/api/claims/pending', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/matches/suggested', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/items/search?type=all', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (claimsRes.ok) setPendingClaims(await claimsRes.json());
      if (matchesRes.ok) setSuggestedMatches(await matchesRes.json());
      if (itemsRes.ok) {
        const data = await itemsRes.json();
        // Filter unverified / submitted items
        setUnverifiedItems((data.items || []).filter(i => i.status === 'submitted'));
      }
    } catch (e) {
      console.error('Failed fetching officer queues:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewClaim = async (status) => {
    if (!selectedClaim) return;
    setReviewing(true);

    try {
      const res = await fetch(`/api/claims/${selectedClaim.id}/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status, officer_remarks: officerRemarks })
      });
      const data = await res.json();

      if (res.ok) {
        showToast(`Claim #${selectedClaim.id} marked as ${status.toUpperCase()}.`, status === 'approved' ? 'success' : 'info');
        setSelectedClaim(null);
        setOfficerRemarks('');
        fetchOfficerQueues();
      } else {
        showToast(data.error || 'Failed to update claim.', 'error');
      }
    } catch (e) {
      showToast('Server error during claim review.', 'error');
    } finally {
      setReviewing(false);
    }
  };

  const handleUpdateMatchStatus = async (matchId, status) => {
    try {
      const res = await fetch(`/api/matches/${matchId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        showToast(`Match marked as ${status}.`, 'success');
        fetchOfficerQueues();
      }
    } catch (e) {}
  };

  const handleTriggerMatching = async () => {
    showToast('Executing multi-factor correlation matching engine...', 'info');
    try {
      const res = await fetch('/api/matches/trigger', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message, 'success');
        fetchOfficerQueues();
      }
    } catch (e) {}
  };

  const handleVerifyItem = async (type, id) => {
    try {
      const res = await fetch(`/api/items/${type}/${id}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: type === 'found' ? 'available' : 'verified' })
      });
      if (res.ok) {
        showToast('Item verified and moved to active inventory!', 'success');
        fetchOfficerQueues();
      }
    } catch (e) {}
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Officer Live Operational Banner */}
      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--secondary)', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '1px' }}>
            <Shield size={16} /> LIVE OPERATIONAL QUEUE
          </span>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Lost & Found Officer Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Review item verifications, audit submitted proof of ownership claims, and process match correlation suggestions.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleTriggerMatching}>
          <Zap size={16} /> Run Automated Matching Job
        </button>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>
        <button 
          className={`btn ${activeTab === 'claims-queue' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('claims-queue')}
        >
          Claims Review Queue ({pendingClaims.length})
        </button>
        <button 
          className={`btn ${activeTab === 'matches-queue' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('matches-queue')}
        >
          Suggested Matches ({suggestedMatches.length})
        </button>
        <button 
          className={`btn ${activeTab === 'verifications' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('verifications')}
        >
          Pending Verifications ({unverifiedItems.length})
        </button>
      </div>

      {/* Tab 1: Claims Review Queue */}
      {activeTab === 'claims-queue' && (
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Pending Claims Review Queue</h2>

          {pendingClaims.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No pending claims requiring review at this time.
            </div>
          ) : (
            <div className="table-responsive glass-panel">
              <table className="table">
                <thead>
                  <tr>
                    <th>Claim ID</th>
                    <th>Claimant Name</th>
                    <th>Item Title</th>
                    <th>Locker ID</th>
                    <th>ID Card Ref</th>
                    <th>Submitted Evidence</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingClaims.map(claim => (
                    <tr key={claim.id}>
                      <td><strong>#CLM-{claim.id}</strong></td>
                      <td>
                        <strong>{claim.claimant_name}</strong><br />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{claim.claimant_email}</span>
                      </td>
                      <td>{claim.item_title}</td>
                      <td><code style={{ color: 'var(--secondary)' }}>{claim.locker_id || 'N/A'}</code></td>
                      <td><code>{claim.id_card_ref}</code></td>
                      <td style={{ maxWidth: '220px', fontSize: '0.85rem' }}>
                        <p style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {claim.evidence_description}
                        </p>
                        {claim.evidence_file_url && (
                          <a href={claim.evidence_file_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem' }}>
                            View Proof Attachment 📎
                          </a>
                        )}
                      </td>
                      <td>
                        <button className="btn btn-primary btn-sm" onClick={() => setSelectedClaim(claim)}>
                          <FileSearch size={14} /> Review Proof
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: System Suggested Matches */}
      {activeTab === 'matches-queue' && (
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>System Suggested Item Matches</h2>

          {suggestedMatches.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No high-confidence match suggestions currently pending.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {suggestedMatches.map(m => (
                <div key={m.id} className="glass-card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--warning)' }}>
                      Match Score: {m.correlation_score}%
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Match #{m.id}</span>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--error)', fontWeight: 700, marginBottom: '0.2rem' }}>LOST ITEM (#L-{m.lost_item_id}):</div>
                    <div style={{ fontWeight: 700 }}>{m.lost_title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>By {m.lost_reporter} | {m.date_lost}</div>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: 700, marginBottom: '0.2rem' }}>FOUND ITEM (#F-{m.found_item_id}):</div>
                    <div style={{ fontWeight: 700 }}>{m.found_title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Locker: {m.locker_id || 'N/A'} | {m.date_found}</div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-success btn-sm" style={{ flex: 1 }} onClick={() => handleUpdateMatchStatus(m.id, 'verified')}>
                      <CheckCircle size={14} /> Verify Match
                    </button>
                    <button className="btn btn-danger btn-sm" style={{ flex: 1 }} onClick={() => handleUpdateMatchStatus(m.id, 'dismissed')}>
                      <XCircle size={14} /> Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Pending Verifications */}
      {activeTab === 'verifications' && (
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Unverified Item Reports</h2>

          {unverifiedItems.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              All submitted reports have been verified.
            </div>
          ) : (
            <div className="table-responsive glass-panel">
              <table className="table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Title</th>
                    <th>Reporter</th>
                    <th>Category</th>
                    <th>Zone</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {unverifiedItems.map(item => (
                    <tr key={`${item.item_type}-${item.id}`}>
                      <td>
                        <span className={`badge ${item.item_type === 'found' ? 'badge-available' : 'badge-submitted'}`}>
                          {item.item_type.toUpperCase()}
                        </span>
                      </td>
                      <td><strong>{item.title}</strong></td>
                      <td>{item.reporter_name}</td>
                      <td>{item.category_name}</td>
                      <td>{item.zone_name}</td>
                      <td>{item.item_type === 'found' ? item.date_found : item.date_lost}</td>
                      <td>
                        <button className="btn btn-primary btn-sm" onClick={() => handleVerifyItem(item.item_type, item.id)}>
                          <CheckCircle size={14} /> Verify & Publish
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Review Claim Modal */}
      <Modal isOpen={!!selectedClaim} onClose={() => setSelectedClaim(null)} title={`Review Ownership Claim #${selectedClaim?.id}`}>
        {selectedClaim && (
          <div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
              <p><strong>Claimant:</strong> {selectedClaim.claimant_name} ({selectedClaim.claimant_email})</p>
              <p><strong>Institutional ID Ref:</strong> <code>{selectedClaim.id_card_ref}</code></p>
              <p><strong>Item Claimed:</strong> {selectedClaim.item_title}</p>
              <p><strong>Locker ID:</strong> <strong style={{ color: 'var(--secondary)' }}>{selectedClaim.locker_id || 'N/A'}</strong></p>
              {selectedClaim.visual_markers && (
                <p style={{ marginTop: '0.5rem', color: 'var(--warning)' }}>
                  <Lock size={13} inline /> <strong>Officer Reference Visual Markers:</strong> {selectedClaim.visual_markers}
                </p>
              )}
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">Submitted Evidence & Proof of Ownership:</label>
              <div style={{ background: 'rgba(15,23,42,0.8)', padding: '0.85rem', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', color: 'var(--text-main)' }}>
                {selectedClaim.evidence_description}
              </div>
              {selectedClaim.evidence_file_url && (
                <div style={{ marginTop: '0.5rem' }}>
                  <a href={selectedClaim.evidence_file_url} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                    View Uploaded Evidence File 📄
                  </a>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Officer Review Remarks & Audit Notes *</label>
              <textarea 
                className="form-control" 
                rows="3" 
                placeholder="State verification notes, matching criteria, or reason for rejection..." 
                value={officerRemarks} 
                onChange={e => setOfficerRemarks(e.target.value)} 
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button className="btn btn-success" style={{ flex: 1 }} onClick={() => handleReviewClaim('approved')} disabled={reviewing}>
                <CheckCircle size={16} /> Approve Claim
              </button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => handleReviewClaim('rejected')} disabled={reviewing}>
                <XCircle size={16} /> Reject Claim
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
