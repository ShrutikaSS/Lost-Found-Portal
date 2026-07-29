import React from 'react';

export default function StatusBadge({ status }) {
  const s = (status || '').toLowerCase();

  let badgeClass = 'badge-submitted';
  let label = status;

  if (s === 'submitted') {
    badgeClass = 'badge-submitted';
    label = 'Submitted';
  } else if (s === 'verified') {
    badgeClass = 'badge-verified';
    label = 'Verified by Officer';
  } else if (s === 'matched') {
    badgeClass = 'badge-matched';
    label = 'System Matched';
  } else if (s === 'available') {
    badgeClass = 'badge-available';
    label = 'In Storage Inventory';
  } else if (s === 'claimed') {
    badgeClass = 'badge-verified';
    label = 'Claim Approved';
  } else if (s === 'returned') {
    badgeClass = 'badge-returned';
    label = 'Returned to Owner';
  } else if (s === 'closed') {
    badgeClass = 'badge-closed';
    label = 'Case Closed';
  } else if (s === 'pending') {
    badgeClass = 'badge-pending';
    label = 'Claim Pending Review';
  } else if (s === 'approved') {
    badgeClass = 'badge-verified';
    label = 'Claim Approved';
  } else if (s === 'rejected') {
    badgeClass = 'badge-rejected';
    label = 'Claim Rejected';
  }

  return (
    <span className={`badge ${badgeClass}`}>
      <span style={{ fontSize: '10px' }}>●</span> {label}
    </span>
  );
}
