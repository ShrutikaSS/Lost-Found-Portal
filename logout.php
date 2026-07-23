<?php
require_once __DIR__ . '/config/db.php';

logAuditAction("User Logged Out", getCurrentUser()['role'] ?? 'guest');

unset($_SESSION['user']);
session_destroy();

header("Location: index.php");
exit;
