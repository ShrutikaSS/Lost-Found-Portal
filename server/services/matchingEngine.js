import db from '../config/db.js';
import { logAudit } from './auditService.js';

/**
 * Calculates string similarity score between two strings (0.0 to 1.0) using Token Dice Coefficient
 */
function calculateTextSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;
  const tokens1 = new Set(str1.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean));
  const tokens2 = new Set(str2.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean));
  
  if (tokens1.size === 0 || tokens2.size === 0) return 0;
  
  let intersection = 0;
  tokens1.forEach(t => {
    if (tokens2.has(t)) intersection++;
  });
  
  return (2 * intersection) / (tokens1.size + tokens2.size);
}

/**
 * Compute multi-factor correlation score (0 - 100) between a Lost Item and a Found Item
 */
export function computeCorrelationScore(lost, found) {
  let score = 0;

  // 1. Category match (Weight: 30 points)
  if (lost.category_id === found.category_id) {
    score += 30;
  }

  // 2. Title & Description text similarity (Weight: 30 points)
  const titleSim = calculateTextSimilarity(lost.title, found.title);
  const descSim = calculateTextSimilarity(lost.description, found.visual_markers || '');
  const combinedTextSim = Math.max(titleSim, (titleSim * 0.7 + descSim * 0.3));
  score += combinedTextSim * 30;

  // 3. Color & Brand Match (Weight: 15 points)
  if (lost.brand && found.brand && lost.brand.toLowerCase() === found.brand.toLowerCase()) {
    score += 7.5;
  } else if (lost.brand && found.brand && (lost.brand.toLowerCase().includes(found.brand.toLowerCase()) || found.brand.toLowerCase().includes(lost.brand.toLowerCase()))) {
    score += 5;
  }

  if (lost.primary_color && found.primary_color && lost.primary_color.toLowerCase() === found.primary_color.toLowerCase()) {
    score += 7.5;
  }

  // 4. Location & Campus Zone Match (Weight: 15 points)
  if (lost.campus_zone_id === found.campus_zone_id) {
    score += 15;
  } else {
    const locSim = calculateTextSimilarity(lost.location_details, found.location_details);
    score += locSim * 10;
  }

  // 5. Date Proximity (Weight: 10 points)
  const lostDate = new Date(lost.date_lost);
  const foundDate = new Date(found.date_found);
  const diffDays = Math.abs((foundDate - lostDate) / (1000 * 60 * 60 * 24));

  if (diffDays <= 2) {
    score += 10;
  } else if (diffDays <= 7) {
    score += 7;
  } else if (diffDays <= 14) {
    score += 4;
  } else if (diffDays <= 30) {
    score += 1;
  }

  return Math.min(100, Math.round(score * 10) / 10);
}

/**
 * Runs intelligent matching across all active/unclaimed lost and found items
 */
export function runMatchingEngine() {
  console.log('⚡ Running Automated Matching Engine...');
  
  // Select un-closed, non-claimed lost items
  const lostItems = db.prepare(`
    SELECT * FROM lost_items 
    WHERE status IN ('submitted', 'verified')
  `).all();

  // Select available / verified found items
  const foundItems = db.prepare(`
    SELECT * FROM found_items 
    WHERE status IN ('submitted', 'verified', 'available')
  `).all();

  let matchCount = 0;

  for (const lost of lostItems) {
    for (const found of foundItems) {
      const score = computeCorrelationScore(lost, found);
      
      // Threshold for suggested match: 50.0+
      if (score >= 50.0) {
        // Check if match entry already exists
        const existing = db.prepare(`
          SELECT id FROM matches 
          WHERE lost_item_id = ? AND found_item_id = ?
        `).get(lost.id, found.id);

        if (!existing) {
          db.prepare(`
            INSERT INTO matches (lost_item_id, found_item_id, correlation_score, status)
            VALUES (?, ?, ?, 'suggested')
          `).run(lost.id, found.id, score);

          // Update lost item status to 'matched' when a system match is identified
          db.prepare(`
            UPDATE lost_items SET status = 'matched' WHERE id = ? AND status IN ('submitted', 'verified')
          `).run(lost.id);

          // Notify lost item owner
          db.prepare(`
            INSERT INTO notifications (user_id, title, message, type)
            VALUES (?, ?, ?, 'success')
          `).run(
            lost.user_id,
            'Possible Match Found!',
            `Our system found a ${score}% confidence match for your lost item "${lost.title}". An officer will review it shortly.`
          );

          // Notify found item reporter if distinct user
          if (found.user_id && found.user_id !== lost.user_id) {
            db.prepare(`
              INSERT INTO notifications (user_id, title, message, type)
              VALUES (?, ?, ?, 'info')
            `).run(
              found.user_id,
              'Found Item Matched with Lost Report',
              `The found item "${found.title}" you reported has been matched (${score}% confidence) with a lost item report.`
            );
          }

          matchCount++;
        }
      }
    }
  }

  if (matchCount > 0) {
    logAudit(null, 'SYSTEM_WORKER', 'AUTOMATED_MATCHING', 'MATCHES', null, `Created ${matchCount} new potential matches.`);
  }

  return matchCount;
}
