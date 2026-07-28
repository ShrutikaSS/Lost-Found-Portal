import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Mail, Lock, User, Phone, HelpCircle, ShieldCheck } from 'lucide-react';

export default function RegisterPage({ setActivePage }) {
  const { login } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('What was the name of your first school?');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const securityQuestionsList = [
    'What was the name of your first school?',
    'What city were you born in?',
    'What was your childhood nickname?',
    'What is your favorite book or movie?',
    'What was the name of your first pet?'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !securityQuestion || !securityAnswer) {
      showToast('Please fill in all required fields including your security question.', 'error');
      return;
    }
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone, securityQuestion, securityAnswer })
      });

      const data = await res.json();

      if (res.ok) {
        login(data.user, data.token);
        showToast('Registration successful! Account created.', 'success');
        setActivePage('student-dashboard');
      } else {
        showToast(data.error || 'Registration failed.', 'error');
      }
    } catch (err) {
      showToast('Server connection error.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '3rem auto' }}>
      <div className="glass-panel" style={{ padding: '2.5rem 2rem', background: '#ffffff', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img 
            src="/logo.jpg" 
            alt="TrackNFind Logo" 
            style={{ height: '70px', width: 'auto', borderRadius: '10px', margin: '0 auto 0.75rem auto', objectFit: 'contain' }} 
          />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>Create TrackNFind Account</h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
            Register with your personal or educational email address to report and claim items.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Alex Rivera" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                style={{ paddingLeft: '2.5rem' }}
                required 
              />
              <User size={16} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address (Personal or Educational)</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="email" 
                className="form-control" 
                placeholder="alex.rivera@gmail.com" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                style={{ paddingLeft: '2.5rem' }}
                required 
              />
              <Mail size={16} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Contact Phone Number</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="tel" 
                className="form-control" 
                placeholder="+1 (555) 019-2831" 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                style={{ paddingLeft: '2.5rem' }}
              />
              <Phone size={16} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="password" 
                className="form-control" 
                placeholder="At least 6 characters" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                style={{ paddingLeft: '2.5rem' }}
                required 
              />
              <Lock size={16} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          {/* Security Question Section for Password Recovery */}
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
              <ShieldCheck size={18} color="#2563eb" /> Security Question (For Password Recovery)
            </div>

            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label className="form-label">Select Security Question</label>
              <select 
                className="form-control" 
                value={securityQuestion} 
                onChange={e => setSecurityQuestion(e.target.value)}
                required
              >
                {securityQuestionsList.map((q, idx) => (
                  <option key={idx} value={q}>{q}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Security Answer</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Enter your security answer" 
                  value={securityAnswer} 
                  onChange={e => setSecurityAnswer(e.target.value)} 
                  style={{ paddingLeft: '2.5rem' }}
                  required 
                />
                <HelpCircle size={16} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#64748b' }}>
          Already have an account?{' '}
          <button 
            onClick={() => setActivePage('login')} 
            style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer' }}
          >
            Sign In Here
          </button>
        </div>
      </div>
    </div>
  );
}
