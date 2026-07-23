import React, { useState } from 'react';
import { 
  ShieldCheck, UserCheck, Package, CheckCircle2, Clock, AlertTriangle, 
  FilePlus, Search, BarChart3, Users, Settings, LogOut, ArrowLeft, Plus, Check, Eye
} from 'lucide-react';

export function AdminDashboard({ currentUser, setCurrentView }) {
  return (
    <div className="section" style={{ background: '#f8fafc', minHeight: 'calc(100vh - 4.5rem)' }}>
      <div className="container">
        {/* Role Banner Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge badge-admin" style={{ marginBottom: '0.5rem' }}>
              TRACKNFIND SYSTEM ADMIN DASHBOARD
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Welcome Back, {currentUser?.name || 'Administrator'}</h1>
            <p style={{ color: 'var(--text-muted)' }}>Overview of TrackNfind system health, active users, audit logs, and global portal settings.</p>
          </div>
          <button className="btn btn-secondary" onClick={() => setCurrentView('landing')}>
            <ArrowLeft size={16} /> Back to Public Portal
          </button>
        </div>

        {/* System Overview Metrics Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>TOTAL LOGGED ITEMS</span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary)', margin: '0.2rem 0' }}>1,482</h2>
            <span style={{ fontSize: '0.82rem', color: 'var(--success)', fontWeight: 600 }}>↑ +14% this month</span>
          </div>

          <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>SUCCESSFUL RECOVERIES</span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-teal)', margin: '0.2rem 0' }}>1,120</h2>
            <span style={{ fontSize: '0.82rem', color: 'var(--success)', fontWeight: 600 }}>75.5% Recovery Rate</span>
          </div>

          <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>ACTIVE USERS</span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-purple)', margin: '0.2rem 0' }}>4,290</h2>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Students & Officers</span>
          </div>

          <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>PENDING CLAIMS</span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-amber)', margin: '0.2rem 0' }}>18</h2>
            <span style={{ fontSize: '0.82rem', color: 'var(--accent-amber)', fontWeight: 600 }}>Requires Officer Review</span>
          </div>
        </div>

        {/* Audit Logs & Admin Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.75rem' }}>
          <div style={{ background: 'white', padding: '1.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>TrackNfind Audit & Security Logs</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.6rem 0' }}>Timestamp</th>
                  <th>Action</th>
                  <th>User Role</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem 0' }}>2026-07-21 13:20</td>
                  <td>Role Assignment: Officer #4</td>
                  <td><span className="badge badge-admin">Admin</span></td>
                  <td><span style={{ color: 'var(--success)' }}>SUCCESS</span></td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem 0' }}>2026-07-21 12:45</td>
                  <td>Item Bulk Export</td>
                  <td><span className="badge badge-found">Officer</span></td>
                  <td><span style={{ color: 'var(--success)' }}>SUCCESS</span></td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem 0' }}>2026-07-21 11:05</td>
                  <td>Password Reset Request</td>
                  <td><span className="badge badge-lost">Student</span></td>
                  <td><span style={{ color: 'var(--success)' }}>COMPLETED</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ background: 'white', padding: '1.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>Quick Admin Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button className="btn btn-secondary btn-full" style={{ justifyContent: 'flex-start' }}>
                <Users size={16} /> Manage Officer Accounts
              </button>
              <button className="btn btn-secondary btn-full" style={{ justifyContent: 'flex-start' }}>
                <BarChart3 size={16} /> Export Recovery Reports
              </button>
              <button className="btn btn-secondary btn-full" style={{ justifyContent: 'flex-start' }}>
                <Settings size={16} /> Retention Period Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function OfficerDashboard({ currentUser, setCurrentView }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [itemAddedToast, setItemAddedToast] = useState(false);

  const handleCreateItem = (e) => {
    e.preventDefault();
    setItemAddedToast(true);
    setTimeout(() => {
      setItemAddedToast(false);
      setShowAddModal(false);
    }, 1800);
  };

  return (
    <div className="section" style={{ background: '#f8fafc', minHeight: 'calc(100vh - 4.5rem)' }}>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge badge-found" style={{ marginBottom: '0.5rem' }}>
              TRACKNFIND OFFICER DESK
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Officer Desk: {currentUser?.name || 'Officer Smith'}</h1>
            <p style={{ color: 'var(--text-muted)' }}>Review submitted ownership claims, log new turned-in property, and verify student pickups.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-emerald" onClick={() => setShowAddModal(true)}>
              <Plus size={16} /> Log Found Property
            </button>
            <button className="btn btn-secondary" onClick={() => setCurrentView('landing')}>
              <ArrowLeft size={16} /> Public View
            </button>
          </div>
        </div>

        {/* Claims Approval Table */}
        <div style={{ background: 'white', padding: '1.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            Pending Verification Claims Queue (3 Action Required)
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.6rem 0' }}>Item Code</th>
                <th>Item Name</th>
                <th>Claimant</th>
                <th>Verification Proof Submitted</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '0.85rem 0', fontWeight: 700 }}>#ITM-902</td>
                <td>MacBook Pro 14"</td>
                <td>Rohan Verma (STU-8821)</td>
                <td>Serial #: C02G4581Q6, Desktop Wallpaper Photo</td>
                <td>
                  <button className="btn btn-emerald btn-sm" onClick={() => alert('Claim Approved! Pickup code emailed to student.')}>
                    <Check size={14} /> Approve Claim
                  </button>
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '0.85rem 0', fontWeight: 700 }}>#ITM-905</td>
                <td>Sony Headphones</td>
                <td>Sara Ali (STU-4412)</td>
                <td>Purchase Invoice Receipt PDF</td>
                <td>
                  <button className="btn btn-emerald btn-sm" onClick={() => alert('Claim Approved! Pickup code emailed to student.')}>
                    <Check size={14} /> Approve Claim
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: LOG NEW ITEM */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Log New Turned-in Property</h3>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              {itemAddedToast ? (
                <div className="alert-banner alert-banner-success">
                  <CheckCircle2 size={20} />
                  <div>
                    <strong>Property Logged into Inventory!</strong>
                    <p style={{ fontSize: '0.85rem' }}>Barcode tag generated. Item active in TrackNfind public search.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCreateItem}>
                  <div className="form-group">
                    <label className="form-label">Item Title</label>
                    <input type="text" className="form-input" placeholder="e.g. Dell XPS 15 Laptop" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-input">
                      <option>Electronics</option>
                      <option>IDs & Cards</option>
                      <option>Accessories</option>
                      <option>Books & Supplies</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Found Location Tag</label>
                    <input type="text" className="form-input" placeholder="e.g. Cafeteria Table #4" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Detailed Notes</label>
                    <textarea className="form-input" rows="2" placeholder="Distinct markings, color, case details..."></textarea>
                  </div>
                  <button type="submit" className="btn btn-emerald btn-full">
                    Save to TrackNfind Inventory
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function StudentDashboard({ currentUser, setCurrentView }) {
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportSuccessToast, setReportSuccessToast] = useState(false);

  const handleReportSubmit = (e) => {
    e.preventDefault();
    setReportSuccessToast(true);
    setTimeout(() => {
      setReportSuccessToast(false);
      setShowReportModal(false);
    }, 1800);
  };

  return (
    <div className="section" style={{ background: '#f8fafc', minHeight: 'calc(100vh - 4.5rem)' }}>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge badge-lost" style={{ marginBottom: '0.5rem' }}>
              TRACKNFIND USER PORTAL
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>My Dashboard: {currentUser?.name || 'Student Account'}</h1>
            <p style={{ color: 'var(--text-muted)' }}>Track your reported lost property and check the status of your submitted claim requests.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-primary" onClick={() => setShowReportModal(true)}>
              <Plus size={16} /> Report Lost Belonging
            </button>
            <button className="btn btn-secondary" onClick={() => setCurrentView('landing')}>
              <ArrowLeft size={16} /> Browse Public Catalog
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.75rem' }}>
          <div style={{ background: 'white', padding: '1.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>My Reported Lost Items</h3>
            <div style={{ padding: '1rem', background: 'var(--slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontWeight: 700 }}>Sony Headphones</h4>
                <span className="badge badge-lost">SEARCHING</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>Reported on 2026-07-19 • Auditorium Hall B</p>
            </div>
          </div>

          <div style={{ background: 'white', padding: '1.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>My Submitted Claims</h3>
            <div style={{ padding: '1rem', background: 'var(--accent-teal-light)', borderRadius: 'var(--radius-md)', border: '1px solid #99f6e4' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontWeight: 700, color: '#0f766e' }}>MacBook Pro 14"</h4>
                <span className="badge badge-found">UNDER REVIEW</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#0f766e', marginTop: '0.3rem' }}>Claim Submitted 2026-07-21 • Assigned Officer Desk</p>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: REPORT LOST ITEM */}
      {showReportModal && (
        <div className="modal-backdrop" onClick={() => setShowReportModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Report Lost Item on TrackNfind</h3>
              <button className="modal-close-btn" onClick={() => setShowReportModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              {reportSuccessToast ? (
                <div className="alert-banner alert-banner-success">
                  <CheckCircle2 size={20} />
                  <div>
                    <strong>Report Submitted to TrackNfind!</strong>
                    <p style={{ fontSize: '0.85rem' }}>System will notify you as soon as a matching item is turned in.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleReportSubmit}>
                  <div className="form-group">
                    <label className="form-label">Item Title / Description</label>
                    <input type="text" className="form-input" placeholder="e.g. Blue Hydroflask Water Bottle" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Estimated Date & Location Lost</label>
                    <input type="text" className="form-input" placeholder="e.g. Science Library, 2pm today" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Distinct Characteristics</label>
                    <textarea className="form-input" rows="2" placeholder="Mention scratches, stickers, or brand logo..."></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary btn-full">
                    Submit Lost Report
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
