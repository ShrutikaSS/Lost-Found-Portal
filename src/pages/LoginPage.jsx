import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Lock, Mail } from 'lucide-react';

export default function LoginPage({ setActivePage }) {
  const { login } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password.', 'error');
      return;
    }
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (res.ok) {
        login(data.user, data.token);
        showToast(`Welcome back, ${data.user.name}!`, 'success');
        if (data.user.role === 'admin') setActivePage('admin-dashboard');
        else if (data.user.role === 'officer') setActivePage('officer-dashboard');
        else setActivePage('student-dashboard');
      } else {
        showToast(data.error || 'Login failed', 'error');
      }
    } catch (err) {
      showToast('Server connection error.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div style={{ maxWidth: '440px', margin: '3rem auto' }}>
      <div className="glass-panel" style={{ padding: '2.5rem 2rem', background: '#ffffff' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img 
            src="/logo.jpg" 
            alt="TrackNFind Logo" 
            style={{ height: '70px', width: 'auto', borderRadius: '10px', margin: '0 auto 0.75rem auto', objectFit: 'contain' }} 
          />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>Sign In to TrackNFind</h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
            Enter your credentials to access your portal dashboard.
          </p>
        </div>

        {/* Demo Quick Fill Buttons */}
        <div style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Quick Demo Credentials:
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem' }} onClick={() => fillDemo('student@campus.edu', 'Password123!')}>
              🎓 User / Student
            </button>
            <button type="button" className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem' }} onClick={() => fillDemo('officer@campus.edu', 'Password123!')}>
              👮 Officer
            </button>
            <button type="button" className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem' }} onClick={() => fillDemo('admin@campus.edu', 'Password123!')}>
              ⚙️ Admin
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="email" 
                className="form-control" 
                placeholder="you@example.com" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                style={{ paddingLeft: '2.5rem' }}
                required 
              />
              <Mail size={16} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Password</span>
              <button 
                type="button" 
                onClick={() => setActivePage('forgot-password')} 
                style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
              >
                Forgot Password?
              </button>
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type="password" 
                className="form-control" 
                placeholder="••••••••••••" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                style={{ paddingLeft: '2.5rem' }}
                required 
              />
              <Lock size={16} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#64748b' }}>
          Don't have an account yet?{' '}
          <button 
            onClick={() => setActivePage('register')} 
            style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer' }}
          >
            Register Here
          </button>
        </div>
      </div>
    </div>
  );
}
