import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Search, Users, Bell, LogOut, FileText, Home } from 'lucide-react';

export default function Navbar({ activePage, setActivePage }) {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {}
  };

  const markRead = async (id) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {}
  };

  const getDashboardPage = () => {
    if (!user) return 'login';
    if (user.role === 'admin') return 'admin-dashboard';
    if (user.role === 'officer') return 'officer-dashboard';
    return 'student-dashboard';
  };

  const handleUserManagementClick = () => {
    if (!user) {
      showToast('Please log in as Administrator to access User Management.', 'info');
      setActivePage('login');
      return;
    }
    if (user.role !== 'admin') {
      showToast(`User Directory Management requires Administrator privileges (your role: ${user.role}).`, 'error');
      return;
    }
    setActivePage('admin-user-management');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* TrackNFind Custom Logo Branding */}
        <div 
          className="brand-logo" 
          onClick={() => setActivePage('landing')} 
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
        >
          <img 
            src="/logo.jpg" 
            alt="TrackNFind Logo" 
            style={{ height: '44px', width: 'auto', borderRadius: '6px', objectFit: 'contain' }} 
          />
          <div>
            <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
              Track<span style={{ color: '#0284c7' }}>N</span>Find
            </span>
            <span style={{ fontSize: '9px', display: 'block', color: '#0284c7', fontWeight: 800, letterSpacing: '0.8px' }}>
              TRACK IT. FIND IT. GET IT BACK.
            </span>
          </div>
        </div>

        {/* Navigation Links in Taskbar */}
        <div className="nav-links">
          <button 
            className={`btn ${activePage === 'landing' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setActivePage('landing')}
          >
            <Home size={15} /> Home Portal
          </button>

          {/* Functional User Management Taskbar Option */}
          <button 
            className={`btn ${activePage.includes('user-management') ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={handleUserManagementClick}
            title="Manage user directory, RBAC roles, and account statuses"
          >
            <Users size={15} color="#2563eb" /> User Management
          </button>

          {user && (
            <button 
              className={`btn ${activePage.includes('dashboard') && !activePage.includes('user-management') ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setActivePage(getDashboardPage())}
            >
              <FileText size={15} /> 
              {user.role === 'admin' ? 'Admin Hub' : user.role === 'officer' ? 'Officer Queue' : 'My Dashboard'}
            </button>
          )}

          {/* Always Visible Notification Bell */}
          <div style={{ position: 'relative' }}>
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={() => setShowNotifications(!showNotifications)}
              style={{ position: 'relative', padding: '0.5rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              title="Campus Alerts & Notifications"
            >
              <Bell size={16} color="#0284c7" />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>Alerts</span>
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: '10px',
                  fontWeight: 800,
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #ffffff'
                }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Drawer */}
            {showNotifications && (
              <div className="glass-panel" style={{
                position: 'absolute',
                top: '42px',
                right: 0,
                width: '320px',
                maxHeight: '380px',
                overflowY: 'auto',
                zIndex: 300,
                padding: '1rem',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                  <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>🔔 Campus Notifications</strong>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                    {user ? `${unreadCount} unread` : 'Public Alerts'}
                  </span>
                </div>

                {!user ? (
                  <div>
                    <div style={{ padding: '0.65rem', borderRadius: '8px', background: '#eff6ff', border: '1px solid #bfdbfe', marginBottom: '0.75rem', fontSize: '0.8rem' }}>
                      <div style={{ fontWeight: 700, color: '#1e40af', marginBottom: '2px' }}>📢 High-Value Property Announcement</div>
                      <div style={{ color: '#334155', fontSize: '0.75rem', lineHeight: '1.4' }}>
                        High-value electronics recovered near Science & Innovation Lab. Log in to your student/staff account to submit claims.
                      </div>
                    </div>
                    <div style={{ padding: '0.65rem', borderRadius: '8px', background: '#f8fafc', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
                      <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 0.5rem 0' }}>
                        Sign in to view real-time match alerts & personal claim status.
                      </p>
                      <button 
                        className="btn btn-primary btn-sm" 
                        style={{ fontSize: '0.75rem', width: '100%' }}
                        onClick={() => { setShowNotifications(false); setActivePage('login'); }}
                      >
                        Sign In Now
                      </button>
                    </div>
                  </div>
                ) : notifications.length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'center', padding: '1rem 0' }}>
                    No unread notifications right now.
                  </p>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => markRead(n.id)}
                      style={{
                        padding: '0.6rem',
                        borderRadius: '8px',
                        background: n.is_read ? '#f8fafc' : '#eff6ff',
                        marginBottom: '0.5rem',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        borderLeft: n.is_read ? 'none' : '3px solid #0284c7'
                      }}
                    >
                      <div style={{ fontWeight: 700, color: n.is_read ? '#64748b' : '#0f172a' }}>{n.title}</div>
                      <div style={{ color: '#475569', fontSize: '0.75rem', marginTop: '2px' }}>{n.message}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {!user ? (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setActivePage('login')}>
                Log In
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => setActivePage('register')}>
                Register
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {/* User Avatar & Role Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className={`badge ${user.role === 'admin' ? 'badge-rejected' : user.role === 'officer' ? 'badge-matched' : 'badge-submitted'}`}>
                  {user.role.toUpperCase().replace('_', '/')}
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.name.split(' ')[0]}</span>
                <button className="btn btn-secondary btn-sm" onClick={logout} title="Sign Out">
                  <LogOut size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
