import React, { useState } from 'react';
import { 
  User, Lock, Eye, EyeOff, LogIn, AlertCircle, CheckCircle2 
} from 'lucide-react';

export default function LoginPage({ setCurrentView, setCurrentUser }) {
  const [identity, setIdentity] = useState(''); // Email or Username
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('student'); // 'student' | 'officer' | 'admin'
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Validation & state feedback
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Client-side validation
  const validateForm = () => {
    const newErrors = {};

    if (!identity.trim()) {
      newErrors.identity = 'Email address or Username is required';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /*
   * BACKEND INTEGRATION PLACEHOLDER:
   * Plug in your API authentication endpoint here (e.g. POST /api/v1/auth/login).
   */
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginSuccess('');

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Simulate REST API network roundtrip delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (password === 'invalid') {
        throw new Error('Invalid credentials');
      }

      // Mock user object returned from backend API
      const userPayload = {
        name: identity.includes('@') ? identity.split('@')[0] : identity,
        email: identity.includes('@') ? identity : `${identity}@tracknfind.com`,
        role: selectedRole // 'admin' | 'officer' | 'student'
      };

      setCurrentUser(userPayload);
      setLoginSuccess(`Authenticated as ${selectedRole.toUpperCase()}. Redirecting...`);
      setIsSubmitting(false);

      // ROLE-BASED REDIRECT LOGIC
      setTimeout(() => {
        if (userPayload.role === 'admin') {
          setCurrentView('admin-dashboard');
        } else if (userPayload.role === 'officer') {
          setCurrentView('officer-dashboard');
        } else {
          setCurrentView('student-dashboard');
        }
      }, 1200);

    } catch (err) {
      setIsSubmitting(false);
      setLoginError('Invalid username/email or password. Please try again.');
    }
  };

  // Demo shortcut login helper for easy evaluation
  const handleDemoLogin = (role) => {
    let demoName = 'alex.student';
    if (role === 'admin') demoName = 'admin.tnf';
    if (role === 'officer') demoName = 'officer.smith';

    setIdentity(demoName);
    setPassword('DemoPass123!');
    setSelectedRole(role);

    const userPayload = {
      name: demoName,
      email: `${demoName}@tracknfind.com`,
      role: role
    };

    setCurrentUser(userPayload);
    setLoginSuccess(`Quick Demo Login: Authenticated as ${role.toUpperCase()}. Redirecting...`);
    setTimeout(() => {
      setCurrentView(`${role}-dashboard`);
    }, 800);
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    setForgotSuccess(true);
    setTimeout(() => {
      setForgotSuccess(false);
      setShowForgotModal(false);
      setForgotEmail('');
    }, 2500);
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-card-header">
          {/* TrackNfind Logo */}
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <img 
              src="/tracknfind-logo.png" 
              alt="TrackNfind Logo" 
              style={{ height: '56px', width: 'auto', objectFit: 'contain' }} 
            />
          </div>
          <h2 className="auth-card-title">TrackNfind Portal Login</h2>
          <p className="auth-card-subtitle">
            Sign in to access your role-based dashboard & manage items
          </p>
        </div>

        {/* Global Feedback Alerts */}
        {loginSuccess && (
          <div className="alert-banner alert-banner-success">
            <CheckCircle2 size={20} />
            <div>
              <strong>Login Successful!</strong>
              <p style={{ fontSize: '0.85rem' }}>{loginSuccess}</p>
            </div>
          </div>
        )}

        {loginError && (
          <div className="alert-banner alert-banner-error">
            <AlertCircle size={20} />
            <div>
              <strong>Authentication Failed</strong>
              <p style={{ fontSize: '0.85rem' }}>{loginError}</p>
            </div>
          </div>
        )}

        {/* Role Selector Pill */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label className="form-label" style={{ marginBottom: '0.5rem' }}>Login Role Context</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
            <button
              type="button"
              className={`btn btn-sm ${selectedRole === 'student' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedRole('student')}
            >
              Student / User
            </button>
            <button
              type="button"
              className={`btn btn-sm ${selectedRole === 'officer' ? 'btn-emerald' : 'btn-secondary'}`}
              onClick={() => setSelectedRole('officer')}
            >
              L&F Officer
            </button>
            <button
              type="button"
              className={`btn btn-sm ${selectedRole === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
              style={selectedRole === 'admin' ? { background: 'var(--accent-purple)' } : {}}
              onClick={() => setSelectedRole('admin')}
            >
              Admin
            </button>
          </div>
        </div>

        <form onSubmit={handleLoginSubmit} noValidate>
          {/* Email / Username Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="identity">Email Address or Username</label>
            <div className="input-wrapper">
              <span className="input-icon-left"><User size={18} /></span>
              <input
                id="identity"
                type="text"
                className={`form-input input-with-icon-left ${errors.identity ? 'is-invalid' : ''}`}
                placeholder="Enter email or username"
                value={identity}
                onChange={(e) => {
                  setIdentity(e.target.value);
                  if (errors.identity) setErrors(prev => ({ ...prev, identity: '' }));
                }}
                required
              />
            </div>
            {errors.identity && <span className="error-text"><AlertCircle size={14} /> {errors.identity}</span>}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <div className="form-label">
              <label htmlFor="password">Password</label>
              <button 
                type="button"
                className="nav-link" 
                style={{ fontSize: '0.82rem', color: 'var(--primary)' }}
                onClick={() => setShowForgotModal(true)}
              >
                Forgot Password?
              </button>
            </div>
            <div className="input-wrapper">
              <span className="input-icon-left"><Lock size={18} /></span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={`form-input input-with-icon-left input-with-icon-right ${errors.password ? 'is-invalid' : ''}`}
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                }}
                required
              />
              <button
                type="button"
                className="input-icon-right-button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <span className="error-text"><AlertCircle size={14} /> {errors.password}</span>}
          </div>

          {/* Remember Me */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <input 
              type="checkbox" 
              id="remember" 
              checked={rememberMe} 
              onChange={(e) => setRememberMe(e.target.checked)} 
              style={{ accentColor: 'var(--primary)' }}
            />
            <label htmlFor="remember" style={{ fontSize: '0.88rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
              Remember login credentials on this device
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Authenticating...' : `Sign In as ${selectedRole.toUpperCase()}`}
          </button>
        </form>

        {/* Demo Login Quick-Triggers */}
        <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.75rem', textAlign: 'center' }}>
            ⚡ Quick Evaluation Demo Shortcuts
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
            <button 
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleDemoLogin('student')}
            >
              Demo Student
            </button>
            <button 
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleDemoLogin('officer')}
            >
              Demo Officer
            </button>
            <button 
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleDemoLogin('admin')}
            >
              Demo Admin
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Don't have an account yet?{' '}
          <button 
            type="button"
            onClick={() => setCurrentView('register')}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}
          >
            Register Here
          </button>
        </div>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div className="modal-backdrop" onClick={() => setShowForgotModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <img src="/tracknfind-logo.png" alt="TrackNfind Logo" style={{ height: '32px', width: 'auto' }} />
                <h3>Reset Password</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setShowForgotModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              {forgotSuccess ? (
                <div className="alert-banner alert-banner-success">
                  <CheckCircle2 size={20} />
                  <div>
                    <strong>Password Reset Link Sent!</strong>
                    <p style={{ fontSize: '0.85rem' }}>Please check your inbox for recovery instructions from TrackNfind.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit}>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    Enter your registered email address below to receive a password reset link from TrackNfind.
                  </p>
                  <div className="form-group">
                    <label className="form-label">Registered Email</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      placeholder="user@tracknfind.com" 
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required 
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-full">
                    Send Reset Link
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
