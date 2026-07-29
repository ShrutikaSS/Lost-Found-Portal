import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';
import { ArrowLeft, MapPin, Tag, Calendar, ShieldCheck, Lock, Upload, Phone, AlertTriangle } from 'lucide-react';

export default function ItemDetailsPage({ item, onBack, onClaimSubmitted }) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [idCardRef, setIdCardRef] = useState('');
  const [evidenceDesc, setEvidenceDesc] = useState('');
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const isFound = item.item_type === 'found';
  const isOfficerOrAdmin = user && (user.role === 'officer' || user.role === 'admin');

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please log in to submit an ownership claim.', 'error');
      return;
    }
    if (!idCardRef || !evidenceDesc) {
      showToast('Please provide your institutional ID card reference and detailed evidence description.', 'error');
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.append('item_type', item.item_type);
    formData.append('item_id', item.id);
    formData.append('id_card_ref', idCardRef);
    formData.append('evidence_description', evidenceDesc);
    if (evidenceFile) formData.append('evidenceFile', evidenceFile);

    try {
      const res = await fetch('/api/claims', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      const data = await res.json();

      if (res.ok) {
        showToast('Claim request submitted successfully! An officer will review your evidence.', 'success');
        if (onClaimSubmitted) onClaimSubmitted();
        onBack();
      } else {
        showToast(data.error || 'Failed to submit claim.', 'error');
      }
    } catch (err) {
      showToast('Server connection error.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto' }}>
      <button 
        onClick={onBack}
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: '1.5rem' }}
      >
        <ArrowLeft size={16} /> Back to Inventory Search
      </button>

      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Item Header & Badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{
              background: isFound ? 'rgba(6, 182, 212, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              color: isFound ? 'var(--secondary)' : 'var(--error)',
              fontSize: '11px',
              fontWeight: 800,
              padding: '4px 10px',
              borderRadius: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {isFound ? 'FOUND ITEM RECORD' : 'LOST ITEM RECORD'}
            </span>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.5rem' }}>{item.title}</h1>
          </div>
          <StatusBadge status={item.status} />
        </div>

        {/* Image Display */}
        {item.image_url && (
          <div style={{ maxHeight: '360px', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#000' }}>
            <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
        )}

        {/* Metadata Badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.85rem' }}>
            <Tag size={14} color="var(--primary)" inline /> <strong>Category:</strong> {item.category_name}
          </div>
          <div style={{ fontSize: '0.85rem' }}>
            <MapPin size={14} color="var(--secondary)" inline /> <strong>Location:</strong> {item.zone_name} ({item.location_details || 'Grounds'})
          </div>
          <div style={{ fontSize: '0.85rem' }}>
            <Calendar size={14} color="var(--text-subtle)" inline /> <strong>Date:</strong> {isFound ? item.date_found : item.date_lost}
          </div>
          {item.brand && (
            <div style={{ fontSize: '0.85rem' }}>
              <strong>Brand:</strong> {item.brand}
            </div>
          )}
          {item.primary_color && (
            <div style={{ fontSize: '0.85rem' }}>
              <strong>Color:</strong> {item.primary_color}
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem' }}>Item Description</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.925rem' }}>
            {item.description || item.visual_markers || 'No additional text provided.'}
          </p>
        </div>

        {/* Officer Only Sensitive Details */}
        {isOfficerOrAdmin && (
          <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid var(--warning)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ color: 'var(--warning)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Lock size={15} /> Restricted Officer Details:
            </h4>
            <p style={{ fontSize: '0.85rem' }}><strong>Storage Locker ID:</strong> <code style={{ color: 'var(--secondary)' }}>{item.locker_id || 'Not Assigned'}</code></p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}><strong>Reference Visual Markers:</strong> {item.visual_markers || 'None'}</p>
            {item.contact_number && <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}><strong>Reporter Contact:</strong> {item.contact_number}</p>}
          </div>
        )}

        {/* Claim Submission Form for Active Unclosed Items */}
        {!['claimed', 'returned', 'closed'].includes(item.status) && (
          <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={20} color="var(--primary)" /> Submit Property Ownership Claim
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Claims are verified by Lost & Found Officers before physical property release.
            </p>

            {!user ? (
              <div className="glass-card" style={{ textAlign: 'center', padding: '1.5rem' }}>
                <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>You must be signed in with your institutional email account to submit a claim.</p>
                <button className="btn btn-primary btn-sm" onClick={() => onBack('login')}>
                  Sign In to Claim
                </button>
              </div>
            ) : (
              <form onSubmit={handleClaimSubmit}>
                <div className="form-group">
                  <label className="form-label">Campus Student / Staff ID Reference Number *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. STU-2026-8894" 
                    value={idCardRef} 
                    onChange={e => setIdCardRef(e.target.value)} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Detailed Proof of Ownership & Identifying Features *</label>
                  <textarea 
                    className="form-control" 
                    rows="4" 
                    placeholder="Describe specific unique details: serial numbers, passwords/lock screen wallpaper, sticker placements, purchase date, hidden scratch marks..." 
                    value={evidenceDesc} 
                    onChange={e => setEvidenceDesc(e.target.value)} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Upload Proof Document / Receipt / Photo (Optional)</label>
                  <input 
                    type="file" 
                    className="form-control" 
                    accept="image/*,.pdf" 
                    onChange={e => setEvidenceFile(e.target.files[0])} 
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={submitting}>
                  {submitting ? 'Submitting Claim...' : 'Submit Claim to Officers'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
