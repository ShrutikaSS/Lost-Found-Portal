import express from 'express';
import db from '../config/db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { runMatchingEngine } from '../services/matchingEngine.js';
import { logAudit } from '../services/auditService.js';

const router = express.Router();

// Officer/Admin: Get Suggested Matches Queue
router.get('/suggested', authenticateToken, requireRole(['officer', 'admin']), (req, res) => {
  try {
    const matches = db.prepare(`
      SELECT m.*,
             l.title as lost_title, l.description as lost_description, l.date_lost, l.brand as lost_brand, l.primary_color as lost_color,
             f.title as found_title, f.visual_markers as found_markers, f.date_found, f.brand as found_brand, f.primary_color as found_color, f.locker_id,
             u1.name as lost_reporter, u2.name as found_reporter
      FROM matches m
      JOIN lost_items l ON m.lost_item_id = l.id
      JOIN found_items f ON m.found_item_id = f.id
      JOIN users u1 ON l.user_id = u1.id
      JOIN users u2 ON f.user_id = u2.id
      WHERE m.status = 'suggested'
      ORDER BY m.correlation_score DESC
    `).all();

    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch suggested matches.' });
  }
});

// Officer/Admin: Manually Trigger Matching Engine
router.post('/trigger', authenticateToken, requireRole(['officer', 'admin']), (req, res) => {
  try {
    const newMatchesCount = runMatchingEngine();
    res.json({ message: `Matching job completed. ${newMatchesCount} new potential matches found.`, count: newMatchesCount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to run matching job.' });
  }
});

// Officer/Admin: Verify or Dismiss Match
router.put('/:id/status', authenticateToken, requireRole(['officer', 'admin']), (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'verified' or 'dismissed'

    if (!['verified', 'dismissed'].includes(status)) {
      return res.status(400).json({ error: 'Status must be verified or dismissed.' });
    }

    db.prepare('UPDATE matches SET status = ? WHERE id = ?').run(status, id);
    logAudit(req.user.id, req.user.name, `MATCH_${status.toUpperCase()}`, 'MATCH', id, `Updated match #${id} status to ${status}`);

    res.json({ message: `Match updated to ${status}.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update match status.' });
  }
});

export default router;
