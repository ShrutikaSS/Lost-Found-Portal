import React from 'react';
import { ShieldCheck, PhoneCall, Clock } from 'lucide-react';

export default function Footer({ onOpenFaq }) {
  return (
    <footer style={{
      borderTop: '1px solid #e2e8f0',
      background: '#ffffff',
      padding: '2.5rem 1.5rem 1.5rem 1.5rem',
      marginTop: 'auto',
      boxShadow: '0 -4px 12px rgba(15, 23, 42, 0.03)'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        {/* Column 1 - Brand & Chain of Custody */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
            <img src="/logo.jpg" alt="TrackNFind Logo" style={{ height: '36px', width: 'auto', borderRadius: '4px', objectFit: 'contain' }} />
            <div>
              <h4 style={{ color: '#0f172a', fontSize: '1.1rem', fontWeight: 800 }}>TrackNFind</h4>
              <span style={{ fontSize: '9px', color: '#0284c7', fontWeight: 800, letterSpacing: '0.5px' }}>TRACK IT. FIND IT. GET IT BACK.</span>
            </div>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.6' }}>
            Official institutional lost & found property recovery portal. Every item claimed requires institutional ID verification and officer visual marker confirmation.
          </p>
        </div>

        {/* Column 2 */}
        <div>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1e293b', marginBottom: '0.75rem' }}>
            <Clock size={18} color="#0284c7" /> Office Hours & Pickup Location
          </h4>
          <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.6' }}>
            Central Library, Room 102 (Ground Floor)<br />
            Monday – Friday: 08:30 AM – 05:00 PM<br />
            Saturday: 10:00 AM – 01:00 PM
          </p>
        </div>

        {/* Column 3 */}
        <div>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1e293b', marginBottom: '0.75rem' }}>
            <PhoneCall size={18} color="#10b981" /> Help Desk & Emergency Contact
          </h4>
          <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.6' }}>
            Campus Safety Dispatch: +1 (555) 019-9911<br />
            Portal Email: support@tracknfind.edu<br />
            <button 
              onClick={onOpenFaq} 
              style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', textDecoration: 'underline', padding: 0, marginTop: '0.35rem', fontSize: '0.85rem', fontWeight: 600 }}
            >
              Frequently Asked Questions (FAQ)
            </button>
          </p>
        </div>
      </div>

      <div style={{
        borderTop: '1px solid #f1f5f9',
        paddingTop: '1rem',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: '#94a3b8'
      }}>
        © 2026 TrackNFind Portal. Track It. Find It. Get It Back. Secure Chain of Custody System.
      </div>
    </footer>
  );
}
