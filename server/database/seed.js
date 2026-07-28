import bcrypt from 'bcryptjs';
import db from '../config/db.js';

console.log('🌱 Seeding database with White & Blue Theme inventory photos...');

try {
  // Clear existing tables
  db.prepare('DELETE FROM audit_logs').run();
  db.prepare('DELETE FROM notifications').run();
  db.prepare('DELETE FROM matches').run();
  db.prepare('DELETE FROM claims').run();
  db.prepare('DELETE FROM lost_items').run();
  db.prepare('DELETE FROM found_items').run();
  db.prepare('DELETE FROM users').run();
  db.prepare('DELETE FROM categories').run();
  db.prepare('DELETE FROM campus_zones').run();

  db.prepare('DELETE FROM sqlite_sequence').run();

  // 1. Categories
  const categories = [
    { name: 'Electronics & Tech', description: 'Laptops, phones, chargers, tablets, headphones' },
    { name: 'Wallets & Cards', description: 'Wallets, purses, student IDs, credit cards' },
    { name: 'Keys & Accessories', description: 'Dorm keys, car key fobs, keychains' },
    { name: 'Bags & Backpacks', description: 'Backpacks, duffel bags, tote bags' },
    { name: 'Books & Stationery', description: 'Textbooks, notebooks, calculators, specs cases' },
    { name: 'Apparel & Eyewear', description: 'Jackets, sunglasses, prescription specs, hoodies' },
    { name: 'Jewelry & Watches', description: 'Rings, smartwatches, necklaces, bracelets' }
  ];

  const insertCategory = db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)');
  categories.forEach(c => insertCategory.run(c.name, c.description));

  // 2. Campus Zones
  const zones = [
    { name: 'Central Library', building_code: 'LIB' },
    { name: 'Student Union & Food Court', building_code: 'SUB' },
    { name: 'Engineering Complex - Block A', building_code: 'ENG-A' },
    { name: 'Science & Innovation Lab', building_code: 'SCI' },
    { name: 'Main Campus Gymnasium', building_code: 'GYM' },
    { name: 'North Quad / Central Lawn', building_code: 'QUAD' },
    { name: 'Lecture Hall Complex 3', building_code: 'LHC-3' }
  ];

  const insertZone = db.prepare('INSERT INTO campus_zones (name, building_code) VALUES (?, ?)');
  zones.forEach(z => insertZone.run(z.name, z.building_code));

  // 3. Demo Users
  const passwordHash = bcrypt.hashSync('Password123!', 10);
  const defaultAnswerHash = bcrypt.hashSync('campus high', 10);
  const defaultQuestion = 'What was the name of your first school?';

  const insertUser = db.prepare(`
    INSERT INTO users (name, email, password_hash, role, phone, security_question, security_answer_hash, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `);

  const studentResult = insertUser.run('Alex Rivera', 'student@campus.edu', passwordHash, 'student_staff', '+1 (555) 234-5678', defaultQuestion, defaultAnswerHash);
  const officerResult = insertUser.run('Officer Sarah Jenkins', 'officer@campus.edu', passwordHash, 'officer', '+1 (555) 987-6543', defaultQuestion, defaultAnswerHash);
  const adminResult = insertUser.run('Dr. Marcus Vance (Admin)', 'admin@campus.edu', passwordHash, 'admin', '+1 (555) 000-1122', defaultQuestion, defaultAnswerHash);

  const studentId = studentResult.lastInsertRowid;
  const officerId = officerResult.lastInsertRowid;

  // 4. Lost Items with High Res Images
  const insertLost = db.prepare(`
    INSERT INTO lost_items 
    (user_id, title, category_id, description, date_lost, campus_zone_id, location_details, brand, primary_color, image_url, contact_number, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const l1 = insertLost.run(
    studentId,
    'MacBook Pro 14" Space Gray',
    1, // Electronics
    'Left on table 12 on 2nd floor silent reading zone. Has GitHub Octocat sticker on back lid.',
    '2026-07-20',
    1, // Central Library
    '2nd Floor Silent Zone Table 12',
    'Apple',
    'Space Gray',
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
    '+1 (555) 234-5678',
    'submitted'
  );

  const l2 = insertLost.run(
    studentId,
    'Leather Wallet with Campus Student ID',
    2, // Wallets
    'Brown leather bifold wallet containing Alex Rivera ID card and blue transit pass.',
    '2026-07-21',
    2, // Student Union
    'Food Court table near Starbucks',
    'Fossil',
    'Brown',
    'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80',
    '+1 (555) 234-5678',
    'verified'
  );

  const l3 = insertLost.run(
    studentId,
    'Sony WH-1000XM4 Headphones',
    1, // Electronics
    'Black wireless noise-canceling headphones in original hard zip case.',
    '2026-07-22',
    5, // Gym
    'Locker Room Bench',
    'Sony',
    'Black',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    '+1 (555) 234-5678',
    'verified'
  );

  const l4 = insertLost.run(
    studentId,
    'North Face Waterproof Backpack',
    4, // Bags
    'Black dual-compartment backpack with university laptop sleeve inside.',
    '2026-07-19',
    3, // Engineering Complex
    'ENG-A Hallway Bench',
    'North Face',
    'Black',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
    '+1 (555) 234-5678',
    'submitted'
  );

  // 5. Found Items with High Res Images
  const insertFound = db.prepare(`
    INSERT INTO found_items 
    (user_id, title, category_id, visual_markers, date_found, campus_zone_id, location_details, brand, primary_color, locker_id, image_url, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const f1 = insertFound.run(
    officerId,
    'Apple Laptop Space Gray 14-inch',
    1,
    'GitHub Octocat sticker on top, serial ending in 8F49. Scratched bottom left corner.',
    '2026-07-20',
    1, // Central Library
    'Handed to 1st floor help desk by librarian',
    'Apple',
    'Space Gray',
    'LOCKER-A04',
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
    'verified'
  );

  const f2 = insertFound.run(
    officerId,
    'Fossil Brown Leather Wallet',
    2,
    'Contains campus student ID for Alex Rivera, $15 cash, subway card.',
    '2026-07-21',
    2, // Student Union
    'Under table 4 near smoothie station',
    'Fossil',
    'Brown',
    'LOCKER-B12',
    'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80',
    'available'
  );

  const f3 = insertFound.run(
    officerId,
    'TI-84 Plus CE Graphing Calculator',
    5, // Books & Stationery
    'Blue casing with name "Jordan" written on back battery cover in silver Sharpie.',
    '2026-07-23',
    7, // LHC-3
    'Lectern podium in LHC-301',
    'Texas Instruments',
    'Blue',
    'LOCKER-C01',
    'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?auto=format&fit=crop&w=600&q=80',
    'verified'
  );

  const f4 = insertFound.run(
    officerId,
    'Dormitory Key Ring with Lanyard',
    3, // Keys
    'Silver key fob with blue university lanyard and brass dorm room key #302.',
    '2026-07-24',
    6, // North Quad
    'Bench near Central Lawn fountain',
    'Generic',
    'Silver / Blue',
    'LOCKER-D05',
    'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80',
    'available'
  );

  // 6. Seed Matches
  const insertMatch = db.prepare(`
    INSERT INTO matches (lost_item_id, found_item_id, correlation_score, status)
    VALUES (?, ?, ?, ?)
  `);

  insertMatch.run(l1.lastInsertRowid, f1.lastInsertRowid, 94.5, 'suggested');
  insertMatch.run(l2.lastInsertRowid, f2.lastInsertRowid, 98.0, 'suggested');

  // 7. Initial Audit Log
  const insertAudit = db.prepare(`
    INSERT INTO audit_logs (actor_id, actor_name, action, target_type, target_id, remarks)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertAudit.run(adminResult.lastInsertRowid, 'Dr. Marcus Vance (Admin)', 'SYSTEM_INITIALIZATION', 'SYSTEM', 1, 'Database seeded with default categories, zones, high-resolution inventory photos, and demo items.');

  console.log('✅ Seed completed successfully with high-resolution item photos!');
} catch (error) {
  console.error('❌ Error seeding database:', error);
}
