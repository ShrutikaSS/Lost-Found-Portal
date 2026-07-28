import express from 'express';
import db from '../config/db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { logAudit } from '../services/auditService.js';

const router = express.Router();

// Submit a Claim Request (Student/Staff)
router.post('/', authenticateToken, upload.single('evidenceFile'), (req, res) => {
  try {
    const { item_type, item_id, id_card_ref, evidence_description } = req.body;

    if (!item_type || !item_id || !id_card_ref || !evidence_description) {
      return res.status(400).json({ error: 'Item type, item ID, institutional ID reference, and evidence description are required.' });
    }

    // Verify item existence
    let item;
    if (item_type === 'lost') {
      item = db.prepare('SELECT id, user_id, title FROM lost_items WHERE id = ?').get(item_id);
    } else {
      item = db.prepare('SELECT id, user_id, title FROM found_items WHERE id = ?').get(item_id);
    }

    if (!item) {
      return res.status(404).json({ error: 'Target item not found.' });
    }

    const evidence_file_url = req.file ? `/uploads/${req.file.filename}` : null;

    const result = db.prepare(`
      INSERT INTO claims
      (item_type, item_id, claimant_id, id_card_ref, evidence_description, evidence_file_url, status)
      VALUES (?, ?, ?, ?, ?, ?, 'pending')
    `).run(item_type, item_id, req.user.id, id_card_ref, evidence_description, evidence_file_url);

    logAudit(req.user.id, req.user.name, 'SUBMIT_CLAIM', 'CLAIM', result.lastInsertRowid, `Submitted claim for ${item_type} item #${item_id}`);

    // Notify item owner / officers
    db.prepare(`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (?, ?, ?, 'info')
    `).run(req.user.id, 'Claim Received', `Your claim for item "${item.title}" has been received and queued for officer review.`, 'info');

    res.status(201).json({
      message: 'Claim submitted successfully!',
      claimId: result.lastInsertRowid
    });
  } catch (err) {
    console.error('Submit claim error:', err);
    res.status(500).json({ error: 'Failed to submit claim.' });
  }
});

// Student: Get My Claims Tracker
router.get('/my-claims', authenticateToken, (req, res) => {
  try {
    const claims = db.prepare(`
      SELECT c.*, 
             COALESCE(l.title, f.title) as item_title,
             COALESCE(l.image_url, f.image_url) as item_image,
             officer.name as officer_name
      FROM claims c
      LEFT JOIN lost_items l ON c.item_type = 'lost' AND c.item_id = l.id
      LEFT JOIN found_items f ON c.item_type = 'found' AND c.item_id = f.id
      LEFT JOIN users officer ON c.reviewing_officer_id = officer.id
      WHERE c.claimant_id = ?
      ORDER BY c.created_at DESC
    `).all(req.user.id);

    res.json(claims);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch personal claims.' });
  }
});

// Officer/Admin: Get Pending Claims Queue
router.get('/pending', authenticateToken, requireRole(['officer', 'admin']), (req, res) => {
  try {
    const claims = db.prepare(`
      SELECT c.*, 
             u.name as claimant_name, 
             u.email as claimant_email,
             COALESCE(l.title, f.title) as item_title,
             COALESCE(l.brand, f.brand) as item_brand,
             f.locker_id,
             f.visual_markers
      FROM claims c
      JOIN users u ON c.claimant_id = u.id
      LEFT JOIN lost_items l ON c.item_type = 'lost' AND c.item_id = l.id
      LEFT JOIN found_items f ON c.item_type = 'found' AND c.item_id = f.id
      WHERE c.status = 'pending'
      ORDER BY c.created_at ASC
    `).all();

    res.json(claims);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pending claims queue.' });
  }
});

// Officer/Admin: Approve or Reject Claim
router.put('/:id/review', authenticateToken, requireRole(['officer', 'admin']), (req, res) => {
  try {
    const { id } = req.params;
    const { status, officer_remarks } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be approved or rejected.' });
    }

    const claim = db.prepare('SELECT * FROM claims WHERE id = ?').get(id);
    if (!claim) {
      return res.status(404).json({ error: 'Claim record not found.' });
    }

    const now = new Date().toISOString();

    // Update claim record
    db.prepare(`
      UPDATE claims 
      SET status = ?, reviewing_officer_id = ?, officer_remarks = ?, reviewed_at = ?
      WHERE id = ?
    `).run(status, req.user.id, officer_remarks || null, now, id);

    logAudit(req.user.id, req.user.name, `CLAIM_${status.toUpperCase()}`, 'CLAIM', id, officer_remarks);

    if (status === 'approved') {
      // Mark target item as Claimed/Returned
      if (claim.item_type === 'lost') {
        db.prepare("UPDATE lost_items SET status = 'claimed' WHERE id = ?").run(claim.item_id);
      } else {
        db.prepare("UPDATE found_items SET status = 'returned' WHERE id = ?").run(claim.item_id);
      }

      // Reject all other pending claims for this exact item
      db.prepare(`
        UPDATE claims 
        SET status = 'rejected', officer_remarks = 'Another claim was verified and approved by Officer.'
        WHERE item_type = ? AND item_id = ? AND id != ? AND status = 'pending'
      `).run(claim.item_type, claim.item_id, id);

      // Notify Claimant
      db.prepare(`
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (?, 'Claim Approved!', 'Your claim has been verified and approved by Officer. Please bring your student ID to the Lost & Found office for pick up.', 'success')
      `).run(claim.claimant_id);
    } else {
      // Notify Claimant of rejection
      db.prepare(`
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (?, 'Claim Update', ?, 'error')
      `).run(claim.claimant_id, `Your claim was rejected. Remarks: ${officer_remarks || 'Insufficient proof provided.'}`);
    }

    res.json({ message: `Claim ${status} successfully.` });
  } catch (err) {
    console.error('Review claim error:', err);
    res.status(500).json({ error: 'Failed to process claim review.' });
  }
});

export default router;
