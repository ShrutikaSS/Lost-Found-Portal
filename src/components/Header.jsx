import React, { useState } from 'react';
import { Menu, X, LogIn, UserPlus, LogOut, User } from 'lucide-react';

export default function Header({ currentView, setCurrentView, currentUser, setCurrentUser }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (view) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('landing');
    setMobileMenuOpen(false);
  };

  return (
    <header className="header-bar glass-panel">
      <div className="container header-inner">
        {/* Brand / Logo */}
        <a 
          href="#home" 
          onClick={(e) => { e.preventDefault(); handleNavClick('landing'); }} 
          className="brand-logo"
          style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}
        >
          <img 
            src="/tracknfind-logo.png" 
            alt="TrackNfind Logo" 
            style={{ 
              height: '52px', 
              width: 'auto', 
              objectFit: 'contain',
              display: 'block' 
            }} 
          />
          <div className="brand-title">
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              TrackNfind
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-teal)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Lost & Found Portal
            </span>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <button 
            className={`nav-link ${currentView === 'landing' ? 'active' : ''}`}
            onClick={() => handleNavClick('landing')}
          >
            Home
          </button>
          <button 
            className="nav-link"
            onClick={() => {
              handleNavClick('landing');
              setTimeout(() => {
                const searchEl = document.getElementById('search-catalog-section');
                if (searchEl) searchEl.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
          >
            Search Items
          </button>
          <button 
            className="nav-link"
            onClick={() => {
              handleNavClick('landing');
              setTimeout(() => {
                const aboutEl = document.getElementById('about-section');
                if (aboutEl) aboutEl.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
          >
            About
          </button>
          <button 
            className="nav-link"
            onClick={() => {
              handleNavClick('landing');
              setTimeout(() => {
                const annEl = document.getElementById('announcements-section');
                if (annEl) annEl.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
          >
            Announcements
          </button>
          <button 
            className="nav-link"
            onClick={() => {
              handleNavClick('landing');
              setTimeout(() => {
                const faqEl = document.getElementById('faq-section');
                if (faqEl) faqEl.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
          >
            FAQ
          </button>
        </nav>

        {/* Desktop Auth & User Actions */}
        <div className="auth-actions">
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className={`badge ${
                currentUser.role === 'admin' ? 'badge-admin' :
                currentUser.role === 'officer' ? 'badge-found' : 'badge-lost'
              }`}>
                {currentUser.role.toUpperCase()}
              </span>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setCurrentView(`${currentUser.role}-dashboard`)}
              >
                <User size={16} /> My Dashboard
              </button>
              <button className="btn btn-outline-primary btn-sm" onClick={handleLogout}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          ) : (
            <>
              <button 
                className={`btn btn-secondary btn-sm ${currentView === 'login' ? 'btn-primary' : ''}`} 
                onClick={() => handleNavClick('login')}
              >
                <LogIn size={16} /> Sign In
              </button>
              <button 
                className={`btn btn-primary btn-sm ${currentView === 'register' ? 'btn-emerald' : ''}`}
                onClick={() => handleNavClick('register')}
              >
                <UserPlus size={16} /> Create Account
              </button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button 
          className="mobile-menu-btn" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <button className="nav-link" onClick={() => handleNavClick('landing')}>
            Home Page
          </button>
          <button className="nav-link" onClick={() => handleNavClick('landing')}>
            Browse Catalog
          </button>
          {currentUser ? (
            <>
              <button 
                className="btn btn-primary btn-full"
                onClick={() => handleNavClick(`${currentUser.role}-dashboard`)}
              >
                Go to Dashboard ({currentUser.name})
              </button>
              <button className="btn btn-secondary btn-full" onClick={handleLogout}>
                Log Out
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button className="btn btn-secondary btn-full" onClick={() => handleNavClick('login')}>
                <LogIn size={18} /> Sign In
              </button>
              <button className="btn btn-primary btn-full" onClick={() => handleNavClick('register')}>
                <UserPlus size={18} /> Create Account
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
