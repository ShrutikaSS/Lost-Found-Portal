<?php
// TrackNFind Standard Database Configuration (include/dbConfig.php)

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$db_file = __DIR__ . '/../database.sqlite';

try {
    $pdo = new PDO("sqlite:" . $db_file);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $pdo->exec("PRAGMA foreign_keys = ON;");
    $pdo->exec("PRAGMA journal_mode = WAL;");

    // Auto-create DDL Schema
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('student_staff', 'officer', 'admin')),
            phone TEXT,
            is_active INTEGER NOT NULL DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            description TEXT
        );

        CREATE TABLE IF NOT EXISTS campus_zones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            building_code TEXT
        );

        CREATE TABLE IF NOT EXISTS lost_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            category_id INTEGER NOT NULL,
            description TEXT NOT NULL,
            date_lost DATE NOT NULL,
            campus_zone_id INTEGER NOT NULL,
            location_details TEXT,
            brand TEXT,
            primary_color TEXT,
            image_url TEXT,
            contact_number TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'submitted' CHECK(status IN ('submitted', 'verified', 'matched', 'claimed', 'closed')),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS found_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            category_id INTEGER NOT NULL,
            visual_markers TEXT,
            date_found DATE NOT NULL,
            campus_zone_id INTEGER NOT NULL,
            location_details TEXT,
            brand TEXT,
            primary_color TEXT,
            locker_id TEXT,
            image_url TEXT,
            status TEXT NOT NULL DEFAULT 'submitted' CHECK(status IN ('submitted', 'verified', 'available', 'returned', 'closed')),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS claims (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_type TEXT NOT NULL CHECK(item_type IN ('lost', 'found')),
            item_id INTEGER NOT NULL,
            claimant_id INTEGER NOT NULL,
            id_card_ref TEXT NOT NULL,
            evidence_description TEXT NOT NULL,
            evidence_file_url TEXT,
            status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
            reviewing_officer_id INTEGER,
            officer_remarks TEXT,
            reviewed_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS matches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            lost_item_id INTEGER NOT NULL,
            found_item_id INTEGER NOT NULL,
            correlation_score REAL NOT NULL,
            status TEXT NOT NULL DEFAULT 'suggested' CHECK(status IN ('suggested', 'verified', 'dismissed')),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            type TEXT NOT NULL DEFAULT 'info',
            is_read INTEGER NOT NULL DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS password_reset_tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            token_hash TEXT NOT NULL,
            expires_at DATETIME NOT NULL,
            used INTEGER NOT NULL DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            actor_id INTEGER,
            actor_name TEXT NOT NULL,
            action TEXT NOT NULL,
            target_type TEXT,
            target_id INTEGER,
            remarks TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    ");

    // Auto Seed Baseline Data if users table empty
    $user_count = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
    if ($user_count == 0) {
        $categories = [
            ['Electronics & Tech', 'Laptops, phones, chargers, tablets, headphones'],
            ['Wallets & Cards', 'Wallets, purses, student IDs, credit cards'],
            ['Keys & Accessories', 'Dorm keys, car key fobs, keychains'],
            ['Bags & Backpacks', 'Backpacks, duffel bags, tote bags'],
            ['Books & Stationery', 'Textbooks, notebooks, calculators, specs cases'],
            ['Apparel & Eyewear', 'Jackets, sunglasses, prescription specs, hoodies'],
            ['Jewelry & Watches', 'Rings, smartwatches, necklaces, bracelets']
        ];
        $stmtCat = $pdo->prepare("INSERT INTO categories (name, description) VALUES (?, ?)");
        foreach ($categories as $cat) { $stmtCat->execute($cat); }

        $zones = [
            ['Central Library', 'LIB'],
            ['Student Union & Food Court', 'SUB'],
            ['Engineering Complex - Block A', 'ENG-A'],
            ['Science & Innovation Lab', 'SCI'],
            ['Main Campus Gymnasium', 'GYM'],
            ['North Quad / Central Lawn', 'QUAD'],
            ['Lecture Hall Complex 3', 'LHC-3']
        ];
        $stmtZone = $pdo->prepare("INSERT INTO campus_zones (name, building_code) VALUES (?, ?)");
        foreach ($zones as $zone) { $stmtZone->execute($zone); }

        $passwordHash = password_hash('Password123!', PASSWORD_BCRYPT);
        $stmtUser = $pdo->prepare("INSERT INTO users (name, email, password_hash, role, phone, is_active) VALUES (?, ?, ?, ?, ?, 1)");
        
        $stmtUser->execute(['Alex Rivera', 'student@campus.edu', $passwordHash, 'student_staff', '+1 (555) 234-5678']);
        $studentId = $pdo->lastInsertId();

        $stmtUser->execute(['Officer Sarah Jenkins', 'officer@campus.edu', $passwordHash, 'officer', '+1 (555) 987-6543']);
        $officerId = $pdo->lastInsertId();

        $stmtUser->execute(['Dr. Marcus Vance (Admin)', 'admin@campus.edu', $passwordHash, 'admin', '+1 (555) 000-1122']);
        $adminId = $pdo->lastInsertId();

        $stmtLost = $pdo->prepare("INSERT INTO lost_items (user_id, title, category_id, description, date_lost, campus_zone_id, location_details, brand, primary_color, image_url, contact_number, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmtLost->execute([$studentId, 'MacBook Pro 14" Space Gray', 1, 'Left on table 12 on 2nd floor silent zone. GitHub Octocat sticker on back lid.', '2026-07-20', 1, '2nd Floor Silent Zone Table 12', 'Apple', 'Space Gray', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80', '+1 (555) 234-5678', 'submitted']);
        $stmtLost->execute([$studentId, 'Leather Wallet with Campus Student ID', 2, 'Brown leather bifold wallet containing Alex Rivera ID card and transit pass.', '2026-07-21', 2, 'Food Court table near Starbucks', 'Fossil', 'Brown', 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80', '+1 (555) 234-5678', 'verified']);
        $stmtLost->execute([$studentId, 'Sony WH-1000XM4 Headphones', 1, 'Black wireless noise-canceling headphones in original hard zip case.', '2026-07-22', 5, 'Locker Room Bench', 'Sony', 'Black', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80', '+1 (555) 234-5678', 'verified']);
        $stmtLost->execute([$studentId, 'North Face Waterproof Backpack', 4, 'Black dual-compartment backpack with university laptop sleeve inside.', '2026-07-19', 3, 'ENG-A Hallway Bench', 'North Face', 'Black', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80', '+1 (555) 234-5678', 'submitted']);

        $stmtFound = $pdo->prepare("INSERT INTO found_items (user_id, title, category_id, visual_markers, date_found, campus_zone_id, location_details, brand, primary_color, locker_id, image_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmtFound->execute([$officerId, 'Apple Laptop Space Gray 14-inch', 1, 'GitHub Octocat sticker on top, serial ending in 8F49.', '2026-07-20', 1, 'Handed to 1st floor help desk', 'Apple', 'Space Gray', 'LOCKER-A04', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80', 'verified']);
        $stmtFound->execute([$officerId, 'Fossil Brown Leather Wallet', 2, 'Contains student ID for Alex Rivera, $15 cash, subway card.', '2026-07-21', 2, 'Under table 4 near smoothie station', 'Fossil', 'Brown', 'LOCKER-B12', 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80', 'available']);
        $stmtFound->execute([$officerId, 'TI-84 Plus CE Graphing Calculator', 5, 'Blue casing with name Jordan written on back in Sharpie.', '2026-07-23', 7, 'Lectern podium in LHC-301', 'Texas Instruments', 'Blue', 'LOCKER-C01', 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?auto=format&fit=crop&w=600&q=80', 'verified']);
        $stmtFound->execute([$officerId, 'Dormitory Key Ring with Lanyard', 3, 'Silver key fob with blue university lanyard and dorm key #302.', '2026-07-24', 6, 'Bench near Central Lawn fountain', 'Generic', 'Silver / Blue', 'LOCKER-D05', 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80', 'available']);

        $stmtMatch = $pdo->prepare("INSERT INTO matches (lost_item_id, found_item_id, correlation_score, status) VALUES (?, ?, ?, ?)");
        $stmtMatch->execute([1, 1, 94.5, 'suggested']);
        $stmtMatch->execute([2, 2, 98.0, 'suggested']);
    }
} catch (PDOException $e) {
    die("Database Connection Error: " . $e->getMessage());
}

// Session Auth Helper Functions
function is_logged_in() {
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

function current_user() {
    if (!is_logged_in()) return null;
    return [
        'id' => $_SESSION['user_id'],
        'name' => $_SESSION['user_name'] ?? 'User',
        'email' => $_SESSION['user_email'] ?? '',
        'role' => $_SESSION['user_role'] ?? 'student_staff',
        'phone' => $_SESSION['user_phone'] ?? ''
    ];
}

function require_login() {
    if (!is_logged_in()) {
        set_flash('danger', 'Please sign in to access this page.');
        header('Location: login.php');
        exit;
    }
}

function require_role($allowed_roles = []) {
    require_login();
    $user = current_user();
    if (!in_array($user['role'], $allowed_roles)) {
        set_flash('danger', 'Access Restricted: You do not have permission to view this area.');
        header('Location: index.php');
        exit;
    }
}

function set_flash($type, $message) {
    $_SESSION['flash'] = ['type' => $type, 'message' => $message];
}

function get_flash() {
    if (isset($_SESSION['flash'])) {
        $flash = $_SESSION['flash'];
        unset($_SESSION['flash']);
        return $flash;
    }
    return null;
}
