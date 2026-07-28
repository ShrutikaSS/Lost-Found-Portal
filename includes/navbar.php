<?php
require_once __DIR__ . '/../config/auth.php';
$user = current_user();

// Fetch unread notifications count if user is logged in
$unread_count = 0;
if ($user) {
    global $pdo;
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = 0");
    $stmt->execute([$user['id']]);
    $unread_count = $stmt->fetchColumn();
}
?>
<nav class="navbar">
  <div class="navbar-container">
    <!-- Brand Logo -->
    <a href="index.php" class="brand-logo" style="display: flex; align-items: center; gap: 0.75rem;">
      <img src="logo.jpg" alt="TrackNFind Logo" style="height: 44px; width: auto; border-radius: 6px; object-fit: contain;">
      <div>
        <span style="font-size: 1.3rem; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">
          Track<span style="color: #0284c7;">N</span>Find
        </span>
        <span style="font-size: 9px; display: block; color: #0284c7; font-weight: 800; letter-spacing: 0.8px;">
          TRACK IT. FIND IT. GET IT BACK.
        </span>
      </div>
    </a>

    <!-- Taskbar Navigation Links -->
    <div class="nav-links">
      <a href="index.php" class="btn btn-secondary btn-sm">
        🏠 Home Portal
      </a>

      <!-- Functional User Management Taskbar Option -->
      <?php if ($user && $user['role'] === 'admin'): ?>
        <a href="admin-dashboard.php?tab=user-management" class="btn btn-secondary btn-sm" style="color: #2563eb; font-weight: 700;">
          👥 User Management
        </a>
      <?php elseif ($user): ?>
        <a href="javascript:void(0)" onclick="alert('User Directory Management requires Administrator privileges (your role: <?php echo htmlspecialchars($user['role']); ?>).')" class="btn btn-secondary btn-sm" style="color: #2563eb;">
          👥 User Management
        </a>
      <?php else: ?>
        <a href="login.php" onclick="alert('Please sign in as Administrator to access User Management.');" class="btn btn-secondary btn-sm" style="color: #2563eb;">
          👥 User Management
        </a>
      <?php endif; ?>

      <?php if ($user): ?>
        <?php if ($user['role'] === 'admin'): ?>
          <a href="admin-dashboard.php" class="btn btn-primary btn-sm">⚙️ Admin Hub</a>
        <?php elseif ($user['role'] === 'officer'): ?>
          <a href="officer-dashboard.php" class="btn btn-primary btn-sm">👮 Officer Queue</a>
        <?php else: ?>
          <a href="student-dashboard.php" class="btn btn-primary btn-sm">📄 My Dashboard</a>
        <?php endif; ?>

        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span class="badge <?php echo $user['role'] === 'admin' ? 'badge-rejected' : ($user['role'] === 'officer' ? 'badge-matched' : 'badge-submitted'); ?>">
            <?php echo strtoupper(str_replace('_', '/', $user['role'])); ?>
          </span>
          <span style="font-size: 0.85rem; font-weight: 600;"><?php echo htmlspecialchars(explode(' ', $user['name'])[0]); ?></span>
          <a href="logout.php" class="btn btn-secondary btn-sm" title="Sign Out">🚪 Logout</a>
        </div>
      <?php else: ?>
        <a href="login.php" class="btn btn-secondary btn-sm">Log In</a>
        <a href="register.php" class="btn btn-primary btn-sm">Register</a>
      <?php endif; ?>
    </div>
  </div>
</nav>
