<?php
require_once __DIR__ . '/../config/db.php';
$currentUser = getCurrentUser();
$currentPage = basename($_SERVER['PHP_SELF']);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TrackNfind - Campus Lost & Found Portal</title>
    <meta name="description" content="Centralized campus lost and found item recovery platform for students, staff, and administration.">
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <header class="header-bar">
        <div class="container header-inner">
            <!-- Brand Logo -->
            <a href="index.php" class="brand-logo" style="display: flex; align-items: center; gap: 0.75rem;">
                <img src="tracknfind-logo.jpg" alt="TrackNfind Logo" style="height: 48px; width: auto; object-fit: contain; border-radius: 4px;" />
            </a>

            <!-- Navigation Links -->
            <nav class="desktop-nav">
                <a href="index.php" class="nav-link <?= ($currentPage === 'index.php') ? 'active' : '' ?>">Browse Catalog</a>
                
                <?php if ($currentUser): ?>
                    <?php if ($currentUser['role'] === 'admin'): ?>
                        <a href="admin_dashboard.php" class="nav-link <?= ($currentPage === 'admin_dashboard.php') ? 'active' : '' ?>">Admin Portal</a>
                    <?php elseif ($currentUser['role'] === 'officer'): ?>
                        <a href="officer_dashboard.php" class="nav-link <?= ($currentPage === 'officer_dashboard.php') ? 'active' : '' ?>">Officer Hub</a>
                    <?php else: ?>
                        <a href="student_dashboard.php" class="nav-link <?= ($currentPage === 'student_dashboard.php') ? 'active' : '' ?>">My Dashboard</a>
                    <?php endif; ?>
                <?php endif; ?>
            </nav>

            <!-- User Session Actions -->
            <div class="auth-actions">
                <?php if ($currentUser): ?>
                    <span class="badge badge-<?= sanitize($currentUser['role']) ?>">
                        <?= strtoupper(sanitize($currentUser['role'])) ?>
                    </span>
                    <span style="font-weight: 700; font-size: 0.9rem; color: var(--text-main);">
                        <?= sanitize($currentUser['full_name'] ?? $currentUser['username']) ?>
                    </span>
                    <a href="logout.php" class="btn btn-secondary btn-sm">Sign Out</a>
                <?php else: ?>
                    <a href="login.php" class="btn btn-secondary btn-sm">Sign In</a>
                    <a href="register.php" class="btn btn-primary btn-sm">Register Account</a>
                <?php endif; ?>
            </div>
        </div>
    </header>
    <main style="flex: 1;">
