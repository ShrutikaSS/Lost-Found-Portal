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

    const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(id);
    if (!match) {
      return res.status(404).json({ error: 'Match record not found.' });
    }

    db.prepare('UPDATE matches SET status = ? WHERE id = ?').run(status, id);

    if (status === 'verified') {
      db.prepare("UPDATE lost_items SET status = 'claimed' WHERE id = ?").run(match.lost_item_id);
      db.prepare("UPDATE found_items SET status = 'returned' WHERE id = ?").run(match.found_item_id);

      const lostItem = db.prepare('SELECT user_id, title FROM lost_items WHERE id = ?').get(match.lost_item_id);
      const foundItem = db.prepare('SELECT user_id, title FROM found_items WHERE id = ?').get(match.found_item_id);

      if (lostItem && lostItem.user_id) {
        db.prepare(`
          INSERT INTO notifications (user_id, title, message, type)
          VALUES (?, 'Match Verified & Case Closed!', ?, 'success')
        `).run(lostItem.user_id, `An officer verified the match for your lost property "${lostItem.title}". Your case is now marked as Claimed & Closed.`);
      }

      if (foundItem && foundItem.user_id && foundItem.user_id !== lostItem?.user_id) {
        db.prepare(`
          INSERT INTO notifications (user_id, title, message, type)
          VALUES (?, 'Found Property Returned', ?, 'success')
        `).run(foundItem.user_id, `The found property "${foundItem.title}" you reported has been verified and returned to its owner.`);
      }
    }

    logAudit(req.user.id, req.user.name, `MATCH_${status.toUpperCase()}`, 'MATCH', id, `Updated match #${id} status to ${status}`);

    res.json({ message: `Match updated to ${status}. Linked lost item marked as Claimed and Closed.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update match status.' });
  }
});

export default router;
