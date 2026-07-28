import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ allowedRoles = [], children, onRedirect }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
        Loading session & credentials...
      </div>
    );
  }

  if (!user) {
    onRedirect('login');
    return null;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', maxWidth: '500px', margin: '3rem auto' }}>
        <h2 style={{ color: 'var(--error)', marginBottom: '1rem' }}>Access Restricted</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Your current role (<strong>{user.role}</strong>) does not have authorization to view this area.
        </p>
        <button className="btn btn-primary" onClick={() => onRedirect('landing')}>
          Return to Public Portal
        </button>
      </div>
    );
  }

  return children;
}
