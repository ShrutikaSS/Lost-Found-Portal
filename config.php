<?php
// config.php - Database connection configuration (XAMPP MySQL)

$host = 'localhost';
$dbname = 'lost_and_found_db';
$user = 'root'; // XAMPP default user
$pass = '';     // XAMPP default password is empty

try {
    $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";
    
    $pdo = new PDO($dsn, $user, $pass);
    
    // Set PDO to throw exceptions on errors
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // Fetch associations by default
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    
} catch (PDOException $e) {
    die("Database Connection failed: " . $e->getMessage());
}

// Session configuration
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Utility function to safely escape output (XSS prevention)
function escape($html) {
    if ($html === null) return '';
    return htmlspecialchars((string)$html, ENT_QUOTES | ENT_SUBSTITUTE, "UTF-8");
}
?>
