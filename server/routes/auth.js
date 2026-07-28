import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import db from '../config/db.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';
import { logAudit } from '../services/auditService.js';
import { sendPasswordResetEmail } from '../services/emailService.js';

const router = express.Router();

// Register (Allows any valid personal or institutional email address with Security Question)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, securityQuestion, securityAnswer } = req.body;

    if (!name || !email || !password || !securityQuestion || !securityAnswer) {
      return res.status(400).json({ error: 'Name, email address, password, security question, and answer are required.' });
    }

    const lowerEmail = email.toLowerCase().trim();

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(lowerEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address (e.g. name@gmail.com).' });
    }

    // Check if email already exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(lowerEmail);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const securityAnswerHash = await bcrypt.hash(securityAnswer.toLowerCase().trim(), 10);
    const assignedRole = 'student_staff'; // Default self-registration role

    const result = db.prepare(`
      INSERT INTO users (name, email, password_hash, role, phone, security_question, security_answer_hash, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `).run(name, lowerEmail, passwordHash, assignedRole, phone || null, securityQuestion, securityAnswerHash);

    const user = { id: result.lastInsertRowid, name, email: lowerEmail, role: assignedRole };
    const token = generateToken(user);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000
    });

    logAudit(user.id, user.name, 'USER_REGISTERED', 'USERS', user.id, `User registered with security question`);

    res.status(201).json({ message: 'Registration successful!', user, token });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email address or password.' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email address or password.' });
    }

    // Unlimited access guarantee: auto-activate account if inactive
    if (!user.is_active) {
      db.prepare('UPDATE users SET is_active = 1 WHERE id = ?').run(user.id);
      user.is_active = 1;
    }

    const token = generateToken(user);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000
    });

    logAudit(user.id, user.name, 'USER_LOGIN', 'USERS', user.id, `User logged in`);

    res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully.' });
});

// Current User Session
router.get('/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// Forgot Password Request (Retrieves Security Question for user's email)
router.post('/forgot-password', (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email address is required.' });

    const lowerEmail = email.toLowerCase().trim();
    const user = db.prepare('SELECT id, email, security_question FROM users WHERE email = ?').get(lowerEmail);

    if (!user || !user.security_question) {
      return res.status(404).json({ error: 'No account found with this email address or security question not configured.' });
    }

    res.json({
      message: 'Account found. Please answer your security question.',
      email: user.email,
      securityQuestion: user.security_question
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Failed to retrieve security question.' });
  }
});

// Reset Password via Security Question Verification
router.post('/reset-password', async (req, res) => {
  try {
    const { email, securityAnswer, newPassword } = req.body;

    if (!email || !securityAnswer || !newPassword) {
      return res.status(400).json({ error: 'Email address, security answer, and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const lowerEmail = email.toLowerCase().trim();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(lowerEmail);

    if (!user || !user.security_answer_hash) {
      return res.status(400).json({ error: 'Account not found or security answer not configured.' });
    }

    const cleanAnswer = securityAnswer.toLowerCase().trim();
    const isMatch = await bcrypt.compare(cleanAnswer, user.security_answer_hash);

    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect security answer. Please try again.' });
    }

    // Securely hash new password with bcrypt (10 salt rounds)
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newPasswordHash, user.id);

    logAudit(user.id, user.name, 'PASSWORD_RESET_COMPLETE', 'USERS', user.id, 'Password updated via Security Question verification');

    res.json({ message: 'Password reset successfully! You can now log in with your new password.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Failed to reset password.' });
  }
});

export default router;
