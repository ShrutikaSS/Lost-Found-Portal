import React from 'react';
import StatusBadge from './StatusBadge';
import { Calendar, MapPin, Tag, Eye } from 'lucide-react';

export default function ItemCard({ item, onViewDetails, onClaim }) {
  const isFound = item.item_type === 'found';

  return (
    <div className="glass-card" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)'
    }}>
      {/* Item Image Container */}
      <div style={{
        height: '170px',
        borderRadius: '10px',
        overflow: 'hidden',
        background: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        marginBottom: '1rem',
        border: '1px solid #f1f5f9'
      }}>
        {item.image_url ? (
          <img 
            src={item.image_url} 
            alt={item.title} 
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }} 
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
          />
        ) : (
          <div style={{ textAlign: 'center', color: '#94a3b8' }}>
            <Tag size={38} opacity={0.4} />
            <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', fontWeight: 600 }}>No Photo Uploaded</div>
          </div>
        )}

        {/* Item Type Badge Overlay */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 2 }}>
          <span style={{
            background: isFound ? '#0284c7' : '#ef4444',
            color: '#ffffff',
            fontSize: '10px',
            fontWeight: 800,
            padding: '3px 9px',
            borderRadius: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
          }}>
            {isFound ? 'FOUND ITEM' : 'LOST ITEM'}
          </span>
        </div>

        {/* Status Badge Overlay */}
        <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 2 }}>
          <StatusBadge status={item.status} />
        </div>
      </div>

      {/* Item Details */}
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem', color: '#0f172a', lineHeight: '1.3' }}>
        {item.title}
      </h3>

      <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Tag size={13} color="#2563eb" /> {item.category_name || 'General'}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <MapPin size={13} color="#0284c7" /> {item.zone_name || 'Campus'}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Calendar size={13} color="#64748b" /> {isFound ? item.date_found : item.date_lost}
        </span>
      </div>

      {/* Brand & Color Pill */}
      {(item.brand || item.primary_color) && (
        <div style={{ fontSize: '0.78rem', color: '#475569', marginBottom: '0.75rem', background: '#f1f5f9', padding: '0.4rem 0.65rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          {item.brand && <span><strong>Brand:</strong> {item.brand} </span>}
          {item.primary_color && <span>• <strong>Color:</strong> {item.primary_color}</span>}
        </div>
      )}

      {/* Description */}
      <p style={{ fontSize: '0.825rem', color: '#475569', marginBottom: '1rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.5' }}>
        {item.description || 'Reported to campus lost and found inventory.'}
      </p>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
        <button 
          className="btn btn-secondary btn-sm" 
          onClick={() => onViewDetails(item)}
          style={{ flex: 1 }}
        >
          <Eye size={14} /> View Details
        </button>

        {isFound && (item.status === 'available' || item.status === 'verified') && (
          <button 
            className="btn btn-primary btn-sm" 
            onClick={() => onClaim(item)}
            style={{ flex: 1 }}
          >
            Claim Property
          </button>
        )}
      </div>
    </div>
  );
}
