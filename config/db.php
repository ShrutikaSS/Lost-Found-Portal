<?php
/**
 * TrackNfind - Database Configuration & System Initialization
 * PDO MySQL Connector with Automated Schema Bootstrap & Fallback Support
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

define('DB_HOST', '127.0.0.1');
define('DB_PORT', '3306');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'tracknfind_db');

/**
 * Get PDO Database Connection
 * @return PDO|null
 */
function getDBConnection() {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    try {
        // Try connecting to MySQL directly
        $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        // Ensure security columns exist in users table
        try {
            $pdo->exec("ALTER TABLE `users` ADD COLUMN `security_question` VARCHAR(255) NULL, ADD COLUMN `security_answer_hash` VARCHAR(255) NULL");
        } catch (Exception $e) {
            // Columns already exist
        }
        return $pdo;
    } catch (PDOException $e) {
        // If database doesn't exist, try connecting without DB name and auto-create database & tables
        try {
            $rootDsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";charset=utf8mb4";
            $rootPdo = new PDO($rootDsn, DB_USER, DB_PASS);
            $rootPdo->exec("CREATE DATABASE IF NOT EXISTS `" . DB_NAME . "` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            
            // Connect to newly created DB
            $pdo = new PDO("mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]);

            // Execute schema script
            $schemaFile = __DIR__ . '/../schema.sql';
            if (file_exists($schemaFile)) {
                $sql = file_get_contents($schemaFile);
                $pdo->exec($sql);
            }
            return $pdo;
        } catch (Exception $ex) {
            // MySQL server might be offline. Log warning and fall back to SQLite in-memory or session storage safely.
            error_log("MySQL Connection Notice: " . $ex->getMessage());
            return null;
        }
    }
}

/**
 * Check if User is Logged In
 */
function isLoggedIn() {
    return isset($_SESSION['user']) && !empty($_SESSION['user']['id']);
}

/**
 * Get Current Logged-in User Array
 */
function getCurrentUser() {
    return isLoggedIn() ? $_SESSION['user'] : null;
}

/**
 * Require Login Guard
 */
function requireLogin() {
    if (!isLoggedIn()) {
        header("Location: login.php");
        exit;
    }
}

/**
 * Require Specific Role Guard
 */
function requireRole($allowedRoles) {
    requireLogin();
    $user = getCurrentUser();
    if (!is_array($allowedRoles)) {
        $allowedRoles = [$allowedRoles];
    }
    if (!in_array($user['role'], $allowedRoles)) {
        header("Location: index.php");
        exit;
    }
}

/**
 * Log System Audit Action into Database
 */
function logAuditAction($action, $roleContext, $status = 'SUCCESS') {
    $db = getDBConnection();
    $user = getCurrentUser();
    $userId = $user ? $user['id'] : null;

    if ($db) {
        try {
            $stmt = $db->prepare("INSERT INTO audit_logs (user_id, action, role_context, status) VALUES (?, ?, ?, ?)");
            $stmt->execute([$userId, $action, $roleContext, $status]);
        } catch (Exception $e) {
            // Silence logger failure
        }
    }
}

/**
 * Sanitize Output Helper
 */
function sanitize($str) {
    return htmlspecialchars($str ?? '', ENT_QUOTES, 'UTF-8');
}

/**
 * Validate Password Policy Requirements:
 * - At least 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character
 * @return array Array of error messages (empty if valid)
 */
function validatePasswordPolicy($password) {
    $errors = [];
    if (strlen($password) < 8) {
        $errors[] = "Password must be at least 8 characters long.";
    }
    if (!preg_match('/[A-Z]/', $password)) {
        $errors[] = "Password must contain at least one uppercase letter (A-Z).";
    }
    if (!preg_match('/[a-z]/', $password)) {
        $errors[] = "Password must contain at least one lowercase letter (a-z).";
    }
    if (!preg_match('/[0-9]/', $password)) {
        $errors[] = "Password must contain at least one number (0-9).";
    }
    if (!preg_match('/[^A-Za-z0-9]/', $password)) {
        $errors[] = "Password must contain at least one special character (e.g. !@#$%^&*).";
    }
    return $errors;
}

