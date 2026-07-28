import db from '../config/db.js';

export function logAudit(actorId, actorName, action, targetType = null, targetId = null, remarks = null) {
  try {
    const stmt = db.prepare(`
      INSERT INTO audit_logs (actor_id, actor_name, action, target_type, target_id, remarks)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(actorId, actorName, action, targetType, targetId, remarks);
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}
