<?php
// auth.php - Include this at the top of protected pages
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$current_page = basename($_SERVER['PHP_SELF']);
$public_pages = ['login.php'];

if (!in_array($current_page, $public_pages)) {
    if (!isset($_SESSION['user_id'])) {
        header("Location: login.php");
        exit;
    }
}
?>
