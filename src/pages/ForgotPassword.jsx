import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { Mail, KeyRound, ArrowLeft, ShieldQuestion, HelpCircle, CheckCircle2 } from 'lucide-react';

export default function ForgotPassword({ setActivePage }) {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleFetchQuestion = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (res.ok && data.securityQuestion) {
        setSecurityQuestion(data.securityQuestion);
        showToast('Account found! Please answer your security question below.', 'info');
        setStep(2);
      } else {
        showToast(data.error || 'No account found with this email address.', 'error');
      }
    } catch (e) {
      showToast('Server connection error.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!email || !securityAnswer || !newPassword) {
      showToast('Please fill in all fields.', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters long.', 'error');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, securityAnswer, newPassword })
      });
      const data = await res.json();

      if (res.ok) {
        showToast('Password reset successfully! Please log in with your new password.', 'success');
        setActivePage('login');
      } else {
        showToast(data.error || 'Incorrect security answer.', 'error');
      }
    } catch (e) {
      showToast('Server connection error.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '460px', margin: '3rem auto' }}>
      <div className="glass-panel" style={{ padding: '2.5rem 2rem', background: '#ffffff', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)' }}>
        <button 
          onClick={() => setActivePage('login')}
          style={{ background: 'none', border: 'none', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.85rem', fontWeight: 600 }}
        >
          <ArrowLeft size={16} /> Back to Login
        </button>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <img 
            src="/logo.jpg" 
            alt="TrackNFind Logo" 
            style={{ height: '60px', width: 'auto', borderRadius: '10px', margin: '0 auto 0.75rem auto', objectFit: 'contain' }} 
          />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>Security Question Recovery</h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            {step === 1 ? 'Enter your registered email address to find your account security question.' : `Answer your security question to reset your password.`}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleFetchQuestion}>
            <div className="form-group">
              <label className="form-label">Registered Email Address</label>
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

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }} disabled={loading}>
              <ShieldQuestion size={18} />
              {loading ? 'Finding Account...' : 'Continue to Security Question'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            {/* Display Security Question Box */}
            <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '10px', border: '1px solid #bfdbfe', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                Your Security Question:
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e3a8a', lineHeight: 1.4 }}>
                "{securityQuestion}"
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Security Answer</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Enter your answer" 
                  value={securityAnswer} 
                  onChange={e => setSecurityAnswer(e.target.value)} 
                  style={{ paddingLeft: '2.5rem' }}
                  required 
                />
                <HelpCircle size={16} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="Minimum 6 characters" 
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)} 
                  style={{ paddingLeft: '2.5rem' }}
                  minLength={6}
                  required 
                />
                <KeyRound size={16} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }} 
              disabled={loading}
            >
              <CheckCircle2 size={18} />
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
