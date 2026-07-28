<?php
// Navigation bar component (navbar.php in project root)
$user = current_user();

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
    <!-- TrackNFind Logo Branding -->
    <a href="index.php" class="brand-logo" style="display: flex; align-items: center; gap: 0.75rem;">
      <img src="images/icons/logo.jpg" alt="TrackNFind Logo" style="height: 44px; width: auto; border-radius: 6px; object-fit: contain;">
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

      <!-- Notification Bell -->
      <div style="position: relative; display: inline-block;">
        <button type="button" class="btn btn-secondary btn-sm" onclick="const d=document.getElementById('php-notif-dropdown'); d.style.display = d.style.display === 'none' ? 'block' : 'none';" style="position: relative; padding: 0.5rem 0.65rem; display: flex; align-items: center; gap: 0.35rem;" title="Campus Alerts & Notifications">
          <span>🔔</span>
          <span style="font-size: 0.75rem; font-weight: 700; color: #0f172a;">Alerts</span>
          <?php if ($unread_count > 0): ?>
            <span style="position: absolute; top: -4px; right: -4px; background: #ef4444; color: #fff; font-size: 10px; font-weight: 800; border-radius: 50%; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; border: 2px solid #ffffff;">
              <?php echo $unread_count; ?>
            </span>
          <?php endif; ?>
        </button>

        <!-- Dropdown drawer -->
        <div id="php-notif-dropdown" class="glass-panel" style="display: none; position: absolute; top: 42px; right: 0; width: 320px; max-height: 380px; overflow-y: auto; z-index: 300; padding: 1rem; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; text-align: left;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem;">
            <strong style="font-size: 0.85rem; color: #0f172a;">🔔 Campus Notifications</strong>
            <span style="font-size: 0.75rem; color: #64748b; font-weight: 600;"><?php echo $user ? "{$unread_count} unread" : "Public Alerts"; ?></span>
          </div>

          <?php if (!$user): ?>
            <div style="padding: 0.65rem; border-radius: 8px; background: #eff6ff; border: 1px solid #bfdbfe; margin-bottom: 0.75rem; font-size: 0.8rem;">
              <div style="font-weight: 700; color: #1e40af; margin-bottom: 2px;">📢 High-Value Property Announcement</div>
              <div style="color: #334155; font-size: 0.75rem; line-height: 1.4;">
                High-value electronics recovered near Science & Innovation Lab. Log in to submit claims.
              </div>
            </div>
            <div style="padding: 0.65rem; border-radius: 8px; background: #f8fafc; border: 1px dashed #cbd5e1; text-align: center;">
              <p style="font-size: 0.75rem; color: #64748b; margin: 0 0 0.5rem 0;">Sign in to view real-time match alerts.</p>
              <a href="login.php" class="btn btn-primary btn-sm" style="font-size: 0.75rem; display: block; width: 100%;">Sign In Now</a>
            </div>
          <?php elseif ($unread_count == 0): ?>
            <p style="font-size: 0.8rem; color: #64748b; text-align: center; padding: 1rem 0;">No unread notifications right now.</p>
          <?php else: ?>
            <?php
              $stmtN = $pdo->prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 10");
              $stmtN->execute([$user['id']]);
              $userNotifs = $stmtN->fetchAll();
              foreach ($userNotifs as $n):
            ?>
              <div style="padding: 0.6rem; border-radius: 8px; background: <?php echo $n['is_read'] ? '#f8fafc' : '#eff6ff'; ?>; margin-bottom: 0.5rem; font-size: 0.8rem; border-left: <?php echo $n['is_read'] ? 'none' : '3px solid #0284c7'; ?>;">
                <div style="font-weight: 700; color: <?php echo $n['is_read'] ? '#64748b' : '#0f172a'; ?>;"><?php echo htmlspecialchars($n['title']); ?></div>
                <div style="color: #475569; font-size: 0.75rem; margin-top: 2px;"><?php echo htmlspecialchars($n['message']); ?></div>
              </div>
            <?php endforeach; ?>
          <?php endif; ?>
        </div>
      </div>

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
