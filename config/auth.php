<?php
// TrackNFind PHP Authentication & Session Helper

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

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
