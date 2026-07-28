import express from 'express';
import db from '../config/db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { logAudit } from '../services/auditService.js';
import { runMatchingEngine } from '../services/matchingEngine.js';

const router = express.Router();

// Public: Get Categories List
router.get('/categories', (req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM categories ORDER BY name ASC').all();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories.' });
  }
});

// Public: Get Campus Zones List
router.get('/zones', (req, res) => {
  try {
    const zones = db.prepare('SELECT * FROM campus_zones ORDER BY name ASC').all();
    res.json(zones);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch campus zones.' });
  }
});

// Public & Student Search & Filter Engine
router.get('/search', (req, res) => {
  try {
    const {
      q,
      type = 'all', // 'lost', 'found', or 'all'
      category_id,
      zone_id,
      color,
      brand,
      date_from,
      date_to,
      page = 1,
      limit = 12
    } = req.query;

    const isOfficerOrAdmin = req.user && (req.user.role === 'officer' || req.user.role === 'admin');

    const results = [];

    // Search Lost Items
    if (type === 'all' || type === 'lost') {
      let query = `
        SELECT l.*, c.name as category_name, z.name as zone_name, u.name as reporter_name, 'lost' as item_type
        FROM lost_items l
        JOIN categories c ON l.category_id = c.id
        JOIN campus_zones z ON l.campus_zone_id = z.id
        JOIN users u ON l.user_id = u.id
        WHERE 1=1
      `;
      const params = [];

      if (q) {
        query += ` AND (l.title LIKE ? OR l.description LIKE ? OR l.brand LIKE ?)`;
        const searchPattern = `%${q}%`;
        params.push(searchPattern, searchPattern, searchPattern);
      }
      if (category_id) {
        query += ` AND l.category_id = ?`;
        params.push(category_id);
      }
      if (zone_id) {
        query += ` AND l.campus_zone_id = ?`;
        params.push(zone_id);
      }
      if (color) {
        query += ` AND l.primary_color LIKE ?`;
        params.push(`%${color}%`);
      }
      if (brand) {
        query += ` AND l.brand LIKE ?`;
        params.push(`%${brand}%`);
      }
      if (date_from) {
        query += ` AND l.date_lost >= ?`;
        params.push(date_from);
      }
      if (date_to) {
        query += ` AND l.date_lost <= ?`;
        params.push(date_to);
      }

      query += ` ORDER BY l.created_at DESC`;
      const lostList = db.prepare(query).all(...params);
      results.push(...lostList);
    }

    // Search Found Items
    if (type === 'all' || type === 'found') {
      let query = `
        SELECT f.*, c.name as category_name, z.name as zone_name, u.name as reporter_name, 'found' as item_type
        FROM found_items f
        JOIN categories c ON f.category_id = c.id
        JOIN campus_zones z ON f.campus_zone_id = z.id
        JOIN users u ON f.user_id = u.id
        WHERE 1=1
      `;
      const params = [];

      if (q) {
        query += ` AND (f.title LIKE ? OR f.brand LIKE ? OR f.location_details LIKE ?)`;
        const searchPattern = `%${q}%`;
        params.push(searchPattern, searchPattern, searchPattern);
      }
      if (category_id) {
        query += ` AND f.category_id = ?`;
        params.push(category_id);
      }
      if (zone_id) {
        query += ` AND f.campus_zone_id = ?`;
        params.push(zone_id);
      }
      if (color) {
        query += ` AND f.primary_color LIKE ?`;
        params.push(`%${color}%`);
      }
      if (brand) {
        query += ` AND f.brand LIKE ?`;
        params.push(`%${brand}%`);
      }
      if (date_from) {
        query += ` AND f.date_found >= ?`;
        params.push(date_from);
      }
      if (date_to) {
        query += ` AND f.date_found <= ?`;
        params.push(date_to);
      }

      query += ` ORDER BY f.created_at DESC`;
      const foundList = db.prepare(query).all(...params);

      // Redact sensitive fields for non-officer/admin users
      const sanitizedFound = foundList.map(item => {
        if (!isOfficerOrAdmin) {
          const { locker_id, visual_markers, ...publicFields } = item;
          return publicFields;
        }
        return item;
      });

      results.push(...sanitizedFound);
    }

    // Sort combined results by created_at DESC
    results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedResults = results.slice(startIndex, startIndex + limitNum);

    res.json({
      total: results.length,
      page: pageNum,
      totalPages: Math.ceil(results.length / limitNum),
      items: paginatedResults
    });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Error processing item search.' });
  }
});

// Student/Staff/Officer: Report Lost Item
router.post('/lost', authenticateToken, upload.single('image'), (req, res) => {
  try {
    const {
      title,
      category_id,
      description,
      date_lost,
      campus_zone_id,
      location_details,
      brand,
      primary_color,
      contact_number
    } = req.body;

    if (!title || !category_id || !description || !date_lost || !campus_zone_id || !contact_number) {
      return res.status(400).json({ error: 'Title, category, description, date lost, zone, and contact number are required.' });
    }

    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    const result = db.prepare(`
      INSERT INTO lost_items
      (user_id, title, category_id, description, date_lost, campus_zone_id, location_details, brand, primary_color, image_url, contact_number, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted')
    `).run(
      req.user.id,
      title,
      category_id,
      description,
      date_lost,
      campus_zone_id,
      location_details || null,
      brand || null,
      primary_color || null,
      image_url,
      contact_number
    );

    logAudit(req.user.id, req.user.name, 'REPORT_LOST_ITEM', 'LOST_ITEM', result.lastInsertRowid, `Reported lost item: ${title}`);

    // Trigger matching engine asynchronously
    setTimeout(() => runMatchingEngine(), 500);

    res.status(201).json({
      message: 'Lost item report submitted successfully!',
      itemId: result.lastInsertRowid
    });
  } catch (err) {
    console.error('Report lost item error:', err);
    res.status(500).json({ error: 'Server error reporting lost item.' });
  }
});

// Student/Staff/Officer: Report Found Item
router.post('/found', authenticateToken, upload.single('image'), (req, res) => {
  try {
    const {
      title,
      category_id,
      visual_markers,
      date_found,
      campus_zone_id,
      location_details,
      brand,
      primary_color,
      locker_id
    } = req.body;

    if (!title || !category_id || !date_found || !campus_zone_id) {
      return res.status(400).json({ error: 'Title, category, date found, and campus zone are required.' });
    }

    const image_url = req.file ? `/uploads/${req.file.filename}` : null;
    const initialStatus = req.user.role === 'officer' || req.user.role === 'admin' ? 'verified' : 'submitted';

    const result = db.prepare(`
      INSERT INTO found_items
      (user_id, title, category_id, visual_markers, date_found, campus_zone_id, location_details, brand, primary_color, locker_id, image_url, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.user.id,
      title,
      category_id,
      visual_markers || null,
      date_found,
      campus_zone_id,
      location_details || null,
      brand || null,
      primary_color || null,
      locker_id || null,
      image_url,
      initialStatus
    );

    logAudit(req.user.id, req.user.name, 'REPORT_FOUND_ITEM', 'FOUND_ITEM', result.lastInsertRowid, `Reported found item: ${title}`);

    setTimeout(() => runMatchingEngine(), 500);

    res.status(201).json({
      message: 'Found item report submitted successfully!',
      itemId: result.lastInsertRowid
    });
  } catch (err) {
    console.error('Report found item error:', err);
    res.status(500).json({ error: 'Server error reporting found item.' });
  }
});

// Protected: Get My Reported Items
router.get('/my-reports', authenticateToken, (req, res) => {
  try {
    const lostList = db.prepare(`
      SELECT l.*, c.name as category_name, z.name as zone_name, 'lost' as item_type
      FROM lost_items l
      JOIN categories c ON l.category_id = c.id
      JOIN campus_zones z ON l.campus_zone_id = z.id
      WHERE l.user_id = ?
      ORDER BY l.created_at DESC
    `).all(req.user.id);

    const foundList = db.prepare(`
      SELECT f.*, c.name as category_name, z.name as zone_name, 'found' as item_type
      FROM found_items f
      JOIN categories c ON f.category_id = c.id
      JOIN campus_zones z ON f.campus_zone_id = z.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `).all(req.user.id);

    res.json({
      lostItems: lostList,
      foundItems: foundList
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch personal reports.' });
  }
});

// Single Item Details
router.get('/:type/:id', (req, res) => {
  try {
    const { type, id } = req.params;
    const isOfficerOrAdmin = req.user && (req.user.role === 'officer' || req.user.role === 'admin');

    if (type === 'lost') {
      const item = db.prepare(`
        SELECT l.*, c.name as category_name, z.name as zone_name, u.name as reporter_name, u.email as reporter_email
        FROM lost_items l
        JOIN categories c ON l.category_id = c.id
        JOIN campus_zones z ON l.campus_zone_id = z.id
        JOIN users u ON l.user_id = u.id
        WHERE l.id = ?
      `).get(id);

      if (!item) return res.status(404).json({ error: 'Lost item record not found.' });
      return res.json({ ...item, item_type: 'lost' });
    }

    if (type === 'found') {
      const item = db.prepare(`
        SELECT f.*, c.name as category_name, z.name as zone_name, u.name as reporter_name, u.email as reporter_email
        FROM found_items f
        JOIN categories c ON f.category_id = c.id
        JOIN campus_zones z ON f.campus_zone_id = z.id
        JOIN users u ON f.user_id = u.id
        WHERE f.id = ?
      `).get(id);

      if (!item) return res.status(404).json({ error: 'Found item record not found.' });

      // Redact sensitive details for public/student view
      if (!isOfficerOrAdmin) {
        delete item.locker_id;
        delete item.visual_markers;
      }

      return res.json({ ...item, item_type: 'found' });
    }

    res.status(400).json({ error: 'Invalid item type.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch item details.' });
  }
});

// Officer: Verify Item Details / Change Status
router.put('/:type/:id/verify', authenticateToken, requireRole(['officer', 'admin']), (req, res) => {
  try {
    const { type, id } = req.params;
    const { status, locker_id, visual_markers } = req.body;

    if (type === 'lost') {
      db.prepare('UPDATE lost_items SET status = ? WHERE id = ?').run(status || 'verified', id);
      logAudit(req.user.id, req.user.name, 'VERIFY_LOST_ITEM', 'LOST_ITEM', id, `Updated status to ${status}`);
    } else if (type === 'found') {
      const stmt = db.prepare(`
        UPDATE found_items 
        SET status = ?, 
            locker_id = COALESCE(?, locker_id), 
            visual_markers = COALESCE(?, visual_markers) 
        WHERE id = ?
      `);
      stmt.run(status || 'verified', locker_id || null, visual_markers || null, id);
      logAudit(req.user.id, req.user.name, 'VERIFY_FOUND_ITEM', 'FOUND_ITEM', id, `Updated status to ${status}, locker: ${locker_id || 'unchanged'}`);
    }

    res.json({ message: 'Item details verified and updated.' });
  } catch (err) {
    res.status(500).json({ error: 'Error verifying item.' });
  }
});

export default router;
