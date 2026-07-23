import React, { useState } from 'react';
import { 
  User, Mail, Phone, Lock, Eye, EyeOff, Check, X, 
  AlertCircle, CheckCircle2, CreditCard 
} from 'lucide-react';

export default function RegisterPage({ setCurrentView }) {
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: 'student', // 'student' | 'officer' | 'admin'
    studentId: '',
    phone: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  // Toggle password visibilities
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  // Real-time password strength check
  const calculatePasswordStrength = (pwd) => {
    const checks = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      symbol: /[^A-Za-z0-9]/.test(pwd)
    };

    const passedCount = Object.values(checks).filter(Boolean).length;
    let label = 'Weak';
    let color = 'var(--danger)';
    let percentage = (passedCount / 4) * 100;

    if (passedCount === 4) {
      label = 'Strong';
      color = 'var(--success)';
    } else if (passedCount >= 2) {
      label = 'Medium';
      color = 'var(--accent-amber)';
    }

    return { checks, passedCount, label, color, percentage };
  };

  const pwdAnalysis = calculatePasswordStrength(formData.password);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for field on type
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Client-side validation logic
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.role === 'student' && !formData.studentId.trim()) {
      newErrors.studentId = 'Student ID is required for student accounts';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-]{7,15}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 4) {
      newErrors.username = 'Username must be at least 4 characters';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (pwdAnalysis.passedCount < 3) {
      newErrors.password = 'Password does not meet minimum strength requirements';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /*
   * BACKEND INTEGRATION PLACEHOLDER:
   * Plug in your API endpoint here (e.g. POST /api/v1/auth/register).
   */
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Simulate REST API network call delay
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Mock API success state
      setSubmitSuccess(true);
      setIsSubmitting(false);

      // Auto redirect to Login after 2 seconds
      setTimeout(() => {
        setCurrentView('login');
      }, 2000);

    } catch (err) {
      setIsSubmitting(false);
      setApiError('Registration failed. Username or Email may already exist.');
    }
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
          <h2 className="auth-card-title">Create an Account</h2>
          <p className="auth-card-subtitle">
            Register for TrackNfind to report items, submit ownership claims, and track status
          </p>
        </div>

        {/* Global API Feedback Alerts */}
        {submitSuccess && (
          <div className="alert-banner alert-banner-success">
            <CheckCircle2 size={20} />
            <div>
              <strong>Account Registered Successfully!</strong>
              <p style={{ fontSize: '0.85rem' }}>Redirecting you to the Login page...</p>
            </div>
          </div>
        )}

        {apiError && (
          <div className="alert-banner alert-banner-error">
            <AlertCircle size={20} />
            <div>
              <strong>Registration Error</strong>
              <p style={{ fontSize: '0.85rem' }}>{apiError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleRegisterSubmit} noValidate>
          {/* Role Selection Toggle */}
          <div className="form-group">
            <label className="form-label">Account Role</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
              <button
                type="button"
                className={`btn btn-sm ${formData.role === 'student' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFormData(prev => ({ ...prev, role: 'student' }))}
              >
                Student / User
              </button>
              <button
                type="button"
                className={`btn btn-sm ${formData.role === 'officer' ? 'btn-emerald' : 'btn-secondary'}`}
                onClick={() => setFormData(prev => ({ ...prev, role: 'officer' }))}
              >
                L&F Officer
              </button>
              <button
                type="button"
                className={`btn btn-sm ${formData.role === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
                style={formData.role === 'admin' ? { background: 'var(--accent-purple)' } : {}}
                onClick={() => setFormData(prev => ({ ...prev, role: 'admin' }))}
              >
                Admin
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="fullName">Full Name</label>
            <div className="input-wrapper">
              <span className="input-icon-left"><User size={18} /></span>
              <input
                id="fullName"
                name="fullName"
                type="text"
                className={`form-input input-with-icon-left ${errors.fullName ? 'is-invalid' : ''}`}
                placeholder="e.g. Alex Morgan"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
            {errors.fullName && <span className="error-text"><AlertCircle size={14} /> {errors.fullName}</span>}
          </div>

          {/* Email Address */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon-left"><Mail size={18} /></span>
              <input
                id="email"
                name="email"
                type="email"
                className={`form-input input-with-icon-left ${errors.email ? 'is-invalid' : ''}`}
                placeholder="alex.m@tracknfind.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            {errors.email && <span className="error-text"><AlertCircle size={14} /> {errors.email}</span>}
          </div>

          {/* Student/Staff ID (Conditional/Optional for Officer) */}
          <div className="form-group">
            <label className="form-label" htmlFor="studentId">
              <span>{formData.role === 'student' ? 'Student ID Number' : 'Staff / Employee ID'}</span>
              {formData.role !== 'student' && <span className="optional">(Optional)</span>}
            </label>
            <div className="input-wrapper">
              <span className="input-icon-left"><CreditCard size={18} /></span>
              <input
                id="studentId"
                name="studentId"
                type="text"
                className={`form-input input-with-icon-left ${errors.studentId ? 'is-invalid' : ''}`}
                placeholder={formData.role === 'student' ? 'e.g. STU-2026-8941' : 'e.g. STF-4402'}
                value={formData.studentId}
                onChange={handleChange}
              />
            </div>
            {errors.studentId && <span className="error-text"><AlertCircle size={14} /> {errors.studentId}</span>}
          </div>

          {/* Phone Number & Username Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="phone">Phone Number</label>
              <div className="input-wrapper">
                <span className="input-icon-left"><Phone size={18} /></span>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className={`form-input input-with-icon-left ${errors.phone ? 'is-invalid' : ''}`}
                  placeholder="+1 555-0192"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              {errors.phone && <span className="error-text"><AlertCircle size={14} /> {errors.phone}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="username">Username</label>
              <div className="input-wrapper">
                <span className="input-icon-left"><User size={18} /></span>
                <input
                  id="username"
                  name="username"
                  type="text"
                  className={`form-input input-with-icon-left ${errors.username ? 'is-invalid' : ''}`}
                  placeholder="alexmorgan"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
              {errors.username && <span className="error-text"><AlertCircle size={14} /> {errors.username}</span>}
            </div>
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="input-wrapper">
              <span className="input-icon-left"><Lock size={18} /></span>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className={`form-input input-with-icon-left input-with-icon-right ${errors.password ? 'is-invalid' : ''}`}
                placeholder="Create strong password"
                value={formData.password}
                onChange={handleChange}
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

            {/* REAL-TIME PASSWORD STRENGTH INDICATOR */}
            {formData.password && (
              <div className="strength-meter-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem', fontWeight: 600 }}>
                  <span>Password Strength</span>
                  <span style={{ color: pwdAnalysis.color }}>{pwdAnalysis.label}</span>
                </div>

                <div className="strength-bar-track">
                  <div
                    className="strength-bar-fill"
                    style={{
                      width: `${pwdAnalysis.percentage}%`,
                      backgroundColor: pwdAnalysis.color
                    }}
                  ></div>
                </div>

                <ul className="strength-rules-list">
                  <li className={`strength-rule-item ${pwdAnalysis.checks.length ? 'passed' : ''}`}>
                    {pwdAnalysis.checks.length ? <Check size={12} /> : <X size={12} />} Min 8 characters
                  </li>
                  <li className={`strength-rule-item ${pwdAnalysis.checks.uppercase ? 'passed' : ''}`}>
                    {pwdAnalysis.checks.uppercase ? <Check size={12} /> : <X size={12} />} At least 1 uppercase
                  </li>
                  <li className={`strength-rule-item ${pwdAnalysis.checks.number ? 'passed' : ''}`}>
                    {pwdAnalysis.checks.number ? <Check size={12} /> : <X size={12} />} At least 1 number
                  </li>
                  <li className={`strength-rule-item ${pwdAnalysis.checks.symbol ? 'passed' : ''}`}>
                    {pwdAnalysis.checks.symbol ? <Check size={12} /> : <X size={12} />} At least 1 symbol
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-wrapper">
              <span className="input-icon-left"><Lock size={18} /></span>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                className={`form-input input-with-icon-left input-with-icon-right ${errors.confirmPassword ? 'is-invalid' : ''}`}
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="input-icon-right-button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && <span className="error-text"><AlertCircle size={14} /> {errors.confirmPassword}</span>}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            style={{ marginTop: '1rem' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Registering Account...' : 'Complete Registration'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <button 
            type="button"
            onClick={() => setCurrentView('login')}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}
          >
            Sign In Here
          </button>
        </div>
      </div>
    </div>
  );
}
