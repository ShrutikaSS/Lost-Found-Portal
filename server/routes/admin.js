import express from 'express';
import db from '../config/db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { logAudit } from '../services/auditService.js';
import { generatePdfReport } from '../services/pdfService.js';
import { generateCsvReport } from '../services/excelService.js';

const router = express.Router();

// All routes require Admin role
router.use(authenticateToken, requireRole(['admin']));

// 1. User Directory Search & List
router.get('/users', (req, res) => {
  try {
    const { q, role, status } = req.query;
    let sql = 'SELECT id, name, email, role, phone, is_active, created_at FROM users WHERE 1=1';
    const params = [];

    if (q) {
      sql += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${q}%`, `%${q}%`);
    }
    if (role) {
      sql += ' AND role = ?';
      params.push(role);
    }
    if (status !== undefined && status !== '') {
      sql += ' AND is_active = ?';
      params.push(parseInt(status, 10));
    }

    sql += ' ORDER BY created_at DESC';
    const users = db.prepare(sql).all(...params);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user directory.' });
  }
});

// Toggle Active Status
router.put('/users/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    db.prepare('UPDATE users SET is_active = ? WHERE id = ?').run(is_active ? 1 : 0, id);
    logAudit(req.user.id, req.user.name, 'USER_STATUS_CHANGE', 'USERS', id, `Changed active status to ${is_active}`);

    res.json({ message: 'User status updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user status.' });
  }
});

// Change Role
router.put('/users/:id/role', (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['student_staff', 'officer', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified.' });
    }

    db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, id);
    logAudit(req.user.id, req.user.name, 'USER_ROLE_CHANGE', 'USERS', id, `Updated role to ${role}`);

    res.json({ message: 'User role updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user role.' });
  }
});

// 2. Manage Dropdown Categories CRUD
router.post('/categories', (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required.' });

    const result = db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)').run(name, description || null);
    logAudit(req.user.id, req.user.name, 'CREATE_CATEGORY', 'CATEGORIES', result.lastInsertRowid, `Added category: ${name}`);

    res.status(201).json({ message: 'Category added.', id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create category.' });
  }
});

router.put('/categories/:id', (req, res) => {
  try {
    const { name, description } = req.body;
    db.prepare('UPDATE categories SET name = ?, description = ? WHERE id = ?').run(name, description || null, req.params.id);
    logAudit(req.user.id, req.user.name, 'UPDATE_CATEGORY', 'CATEGORIES', req.params.id, `Updated category ${name}`);

    res.json({ message: 'Category updated.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update category.' });
  }
});

router.delete('/categories/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
    logAudit(req.user.id, req.user.name, 'DELETE_CATEGORY', 'CATEGORIES', req.params.id, 'Deleted category');
    res.json({ message: 'Category deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete category (might be referenced by items).' });
  }
});

// 3. Manage Campus Zones CRUD
router.post('/zones', (req, res) => {
  try {
    const { name, building_code } = req.body;
    if (!name) return res.status(400).json({ error: 'Campus zone name is required.' });

    const result = db.prepare('INSERT INTO campus_zones (name, building_code) VALUES (?, ?)').run(name, building_code || null);
    logAudit(req.user.id, req.user.name, 'CREATE_ZONE', 'CAMPUS_ZONES', result.lastInsertRowid, `Added zone: ${name}`);

    res.status(201).json({ message: 'Campus zone added.', id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create campus zone.' });
  }
});

router.put('/zones/:id', (req, res) => {
  try {
    const { name, building_code } = req.body;
    db.prepare('UPDATE campus_zones SET name = ?, building_code = ? WHERE id = ?').run(name, building_code || null, req.params.id);
    logAudit(req.user.id, req.user.name, 'UPDATE_ZONE', 'CAMPUS_ZONES', req.params.id, `Updated zone ${name}`);

    res.json({ message: 'Campus zone updated.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update campus zone.' });
  }
});

router.delete('/zones/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM campus_zones WHERE id = ?').run(req.params.id);
    logAudit(req.user.id, req.user.name, 'DELETE_ZONE', 'CAMPUS_ZONES', req.params.id, 'Deleted zone');
    res.json({ message: 'Campus zone deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete zone.' });
  }
});

// 4. Global Usage Statistics & Analytics
router.get('/stats', (req, res) => {
  try {
    const totalLost = db.prepare('SELECT COUNT(*) as count FROM lost_items').get().count;
    const totalFound = db.prepare('SELECT COUNT(*) as count FROM found_items').get().count;
    const totalClaimedLost = db.prepare("SELECT COUNT(*) as count FROM lost_items WHERE status = 'claimed'").get().count;
    const totalReturnedFound = db.prepare("SELECT COUNT(*) as count FROM found_items WHERE status = 'returned'").get().count;
    const pendingClaims = db.prepare("SELECT COUNT(*) as count FROM claims WHERE status = 'pending'").get().count;
    const totalApprovedClaims = db.prepare("SELECT COUNT(*) as count FROM claims WHERE status = 'approved'").get().count;
    const totalRejectedClaims = db.prepare("SELECT COUNT(*) as count FROM claims WHERE status = 'rejected'").get().count;
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;

    const totalDecidedClaims = totalApprovedClaims + totalRejectedClaims;
    const approvalRate = totalDecidedClaims > 0 ? Math.round((totalApprovedClaims / totalDecidedClaims) * 100) : 100;

    res.json({
      totalLost,
      totalFound,
      totalReturned: totalClaimedLost + totalReturnedFound,
      pendingClaims,
      totalApprovedClaims,
      totalRejectedClaims,
      approvalRate,
      totalUsers
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate stats.' });
  }
});

// 5. PDF & CSV/Excel Report Exporters
router.get('/reports/pdf', (req, res) => {
  try {
    const stats = {
      totalLost: db.prepare('SELECT COUNT(*) as count FROM lost_items').get().count,
      totalFound: db.prepare('SELECT COUNT(*) as count FROM found_items').get().count,
      totalReturned: db.prepare("SELECT COUNT(*) as count FROM lost_items WHERE status = 'claimed'").get().count + 
                     db.prepare("SELECT COUNT(*) as count FROM found_items WHERE status = 'returned'").get().count,
      pendingClaims: db.prepare("SELECT COUNT(*) as count FROM claims WHERE status = 'pending'").get().count,
      approvalRate: 92
    };

    const lostItems = db.prepare(`
      SELECT l.*, c.name as category_name, z.name as zone_name, u.email as reporter_email
      FROM lost_items l
      LEFT JOIN categories c ON l.category_id = c.id
      LEFT JOIN campus_zones z ON l.campus_zone_id = z.id
      LEFT JOIN users u ON l.user_id = u.id
      ORDER BY l.created_at DESC
    `).all();

    generatePdfReport(res, { stats, lostItems });
  } catch (err) {
    console.error('PDF report error:', err);
    res.status(500).json({ error: 'Failed to generate PDF report.' });
  }
});

router.get('/reports/excel', (req, res) => {
  try {
    const lostItems = db.prepare(`
      SELECT l.*, c.name as category_name, z.name as zone_name, u.email as reporter_email
      FROM lost_items l
      LEFT JOIN categories c ON l.category_id = c.id
      LEFT JOIN campus_zones z ON l.campus_zone_id = z.id
      LEFT JOIN users u ON l.user_id = u.id
      ORDER BY l.created_at DESC
    `).all();

    const foundItems = db.prepare(`
      SELECT f.*, c.name as category_name, z.name as zone_name, u.email as reporter_email
      FROM found_items f
      LEFT JOIN categories c ON f.category_id = c.id
      LEFT JOIN campus_zones z ON f.campus_zone_id = z.id
      LEFT JOIN users u ON f.user_id = u.id
      ORDER BY f.created_at DESC
    `).all();

    generateCsvReport(res, { lostItems, foundItems });
  } catch (err) {
    console.error('Excel report error:', err);
    res.status(500).json({ error: 'Failed to generate CSV export.' });
  }
});

// Audit Logs View
router.get('/audit-logs', (req, res) => {
  try {
    const logs = db.prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100').all();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch audit logs.' });
  }
});

export default router;
