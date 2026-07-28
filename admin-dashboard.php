<?php
require_once __DIR__ . '/include/dbConfig.php';
require_role(['admin']);

$user = current_user();
$page_title = 'System Administration Hub';
$tab = $_GET['tab'] ?? 'user-management';

// Handle User Account Status Toggle (Enable/Disable)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'toggle_user_status') {
    $target_id = $_POST['user_id'] ?? 0;
    $new_status = $_POST['is_active'] == 1 ? 1 : 0;
    $pdo->prepare("UPDATE users SET is_active = ? WHERE id = ?")->execute([$new_status, $target_id]);

    require_once __DIR__ . '/services/audit.php';
    log_audit($user['id'], $user['name'], 'USER_STATUS_CHANGE', 'USERS', $target_id, "Changed user active status to {$new_status}");

    set_flash('success', 'User account status updated.');
    header('Location: admin-dashboard.php?tab=user-management');
    exit;
}

// Handle User Role Modification (RBAC)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'change_user_role') {
    $target_id = $_POST['user_id'] ?? 0;
    $new_role = $_POST['role'] ?? '';
    if (in_array($new_role, ['student_staff', 'officer', 'admin'])) {
        $pdo->prepare("UPDATE users SET role = ? WHERE id = ?")->execute([$new_role, $target_id]);

        require_once __DIR__ . '/services/audit.php';
        log_audit($user['id'], $user['name'], 'USER_ROLE_CHANGE', 'USERS', $target_id, "Updated user role to {$new_role}");

        set_flash('success', "User role updated to {$new_role}.");
        header('Location: admin-dashboard.php?tab=user-management');
        exit;
    }
}

// Handle Add Category
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'add_category') {
    $name = trim($_POST['name'] ?? '');
    $description = trim($_POST['description'] ?? '');
    if ($name) {
        $stmt = $pdo->prepare("INSERT INTO categories (name, description) VALUES (?, ?)");
        $stmt->execute([$name, $description ?: null]);

        require_once __DIR__ . '/services/audit.php';
        log_audit($user['id'], $user['name'], 'CREATE_CATEGORY', 'CATEGORIES', $pdo->lastInsertId(), "Added category {$name}");

        set_flash('success', 'New category added.');
        header('Location: admin-dashboard.php?tab=dropdowns');
        exit;
    }
}

// Handle Add Zone
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'add_zone') {
    $name = trim($_POST['name'] ?? '');
    $building_code = trim($_POST['building_code'] ?? '');
    if ($name) {
        $stmt = $pdo->prepare("INSERT INTO campus_zones (name, building_code) VALUES (?, ?)");
        $stmt->execute([$name, $building_code ?: null]);

        require_once __DIR__ . '/services/audit.php';
        log_audit($user['id'], $user['name'], 'CREATE_ZONE', 'CAMPUS_ZONES', $pdo->lastInsertId(), "Added campus zone {$name}");

        set_flash('success', 'New campus zone added.');
        header('Location: admin-dashboard.php?tab=dropdowns');
        exit;
    }
}

// Fetch Users Directory
$user_q = $_GET['user_q'] ?? '';
$user_role = $_GET['user_role'] ?? '';

$sql_users = "SELECT * FROM users WHERE 1=1";
$params_u = [];
if ($user_q) { $sql_users .= " AND (name LIKE ? OR email LIKE ?)"; $params_u[] = "%$user_q%"; $params_u[] = "%$user_q%"; }
if ($user_role) { $sql_users .= " AND role = ?"; $params_u[] = $user_role; }
$sql_users .= " ORDER BY created_at DESC";

$stmtUsers = $pdo->prepare($sql_users);
$stmtUsers->execute($params_u);
$users_list = $stmtUsers->fetchAll();

// Fetch Analytics Stats
$stats = [
    'totalLost' => $pdo->query("SELECT COUNT(*) FROM lost_items")->fetchColumn(),
    'totalFound' => $pdo->query("SELECT COUNT(*) FROM found_items")->fetchColumn(),
    'totalReturned' => $pdo->query("SELECT COUNT(*) FROM lost_items WHERE status='claimed'")->fetchColumn() + $pdo->query("SELECT COUNT(*) FROM found_items WHERE status='returned'")->fetchColumn(),
    'pendingClaims' => $pdo->query("SELECT COUNT(*) FROM claims WHERE status='pending'")->fetchColumn(),
    'totalUsers' => $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn(),
];

// Fetch Dropdowns & Audit Logs
$categories = $pdo->query("SELECT * FROM categories ORDER BY name ASC")->fetchAll();
$zones = $pdo->query("SELECT * FROM campus_zones ORDER BY name ASC")->fetchAll();
$audit_logs = $pdo->query("SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100")->fetchAll();

require_once __DIR__ . '/include/header.php';
?>

<div class="main-content">
  <div class="glass-panel" style="padding: 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 2rem; background: #ffffff;">
    <div>
      <span style="color: #2563eb; font-weight: 800; font-size: 0.8rem;">⚙️ TRACKNFIND ADMINISTRATION HUB</span>
      <h1 style="font-size: 1.8rem; font-weight: 800; color: #0f172a;">User Directory & System Administration</h1>
      <p style="color: #64748b; font-size: 0.9rem;">Manage user directory RBAC, enable/disable accounts, category & zone lists, and official reports.</p>
    </div>

    <div style="display: flex; gap: 0.5rem;">
      <a href="export-pdf.php" target="_blank" class="btn btn-secondary btn-sm">📄 Export PDF Report</a>
      <a href="export-csv.php" class="btn btn-primary btn-sm">📊 Export CSV / Excel</a>
    </div>
  </div>

  <div style="display: flex; gap: 0.5rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; margin-bottom: 2rem; flex-wrap: wrap;">
    <a href="admin-dashboard.php?tab=user-management" class="btn <?php echo $tab==='user-management'?'btn-primary':'btn-secondary'; ?> btn-sm">
      👥 User Directory RBAC (<?php echo count($users_list); ?>)
    </a>
    <a href="admin-dashboard.php?tab=analytics" class="btn <?php echo $tab==='analytics'?'btn-primary':'btn-secondary'; ?> btn-sm">
      📈 Global Analytics
    </a>
    <a href="admin-dashboard.php?tab=dropdowns" class="btn <?php echo $tab==='dropdowns'?'btn-primary':'btn-secondary'; ?> btn-sm">
      🗂️ Categories & Zones CRUD
    </a>
    <a href="admin-dashboard.php?tab=audit-logs" class="btn <?php echo $tab==='audit-logs'?'btn-primary':'btn-secondary'; ?> btn-sm">
      📜 Audit Logs (<?php echo count($audit_logs); ?>)
    </a>
  </div>

  <!-- Tab 1: User Directory Management -->
  <?php if ($tab === 'user-management'): 
    $active_section = ($user_role === 'admin') ? 'admin' : 'officer';
  ?>
    <!-- Sub-Section Navigation: 2 Dedicated Sections (Officer and Admin) -->
    <div style="display: flex; gap: 0.75rem; margin-bottom: 1.25rem;">
      <a href="admin-dashboard.php?tab=user-management&user_role=officer" class="btn <?php echo $active_section==='officer'?'btn-primary':'btn-secondary'; ?>" style="display: flex; align-items: center; gap: 0.5rem; font-weight: 700; padding: 0.6rem 1.25rem;">
        👮 Officer Section
      </a>
      <a href="admin-dashboard.php?tab=user-management&user_role=admin" class="btn <?php echo $active_section==='admin'?'btn-primary':'btn-secondary'; ?>" style="display: flex; align-items: center; gap: 0.5rem; font-weight: 700; padding: 0.6rem 1.25rem;">
        ⚙️ Admin Section
      </a>
    </div>

    <div class="glass-panel" style="padding: 1.25rem; margin-bottom: 1.25rem; background: #ffffff;">
      <form action="admin-dashboard.php" method="GET" style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; justify-content: space-between;">
        <input type="hidden" name="tab" value="user-management">
        <input type="hidden" name="user_role" value="<?php echo htmlspecialchars($active_section); ?>">
        <div style="display: flex; gap: 0.75rem; align-items: center; flex: 1; min-width: 280px;">
          <input type="text" name="user_q" class="form-control" placeholder="Search <?php echo $active_section==='admin'?'Admins':'Officers'; ?> by name or email..." value="<?php echo htmlspecialchars($user_q); ?>">
          <button type="submit" class="btn btn-primary btn-sm">Search</button>
        </div>
        <div style="font-size: 0.85rem; font-weight: 700; color: #0284c7; background: #eff6ff; padding: 0.4rem 0.8rem; border-radius: 6px;">
          Managing: <?php echo $active_section==='admin'?'⚙️ Administrator Directory':'👮 Officer Directory'; ?>
        </div>
      </form>
    </div>

    <div class="table-responsive glass-panel">
      <table class="table">
        <thead>
          <tr>
            <th>User ID</th>
            <th>Full Name</th>
            <th>Email Address</th>
            <th>Current Role</th>
            <th>Status</th>
            <th>Account Action</th>
          </tr>
        </thead>
        <tbody>
          <?php 
            $filtered_list = array_filter($users_list, function($u) use ($active_section) {
                return $u['role'] === $active_section;
            });
            if (empty($filtered_list)):
          ?>
            <tr>
              <td colspan="6" style="text-align: center; color: #64748b; padding: 2rem;">No accounts found in the <?php echo ucfirst($active_section); ?> section.</td>
            </tr>
          <?php else: ?>
            <?php foreach ($filtered_list as $u): ?>
              <tr>
                <td><strong>#USR-<?php echo $u['id']; ?></strong></td>
                <td><strong><?php echo htmlspecialchars($u['name']); ?></strong></td>
                <td><code><?php echo htmlspecialchars($u['email']); ?></code></td>
                <td>
                  <form action="admin-dashboard.php" method="POST">
                    <input type="hidden" name="action" value="change_user_role">
                    <input type="hidden" name="user_id" value="<?php echo $u['id']; ?>">
                    <select name="role" class="form-control" onchange="this.form.submit();" style="padding: 0.3rem 0.6rem; font-size: 0.825rem; font-weight: 600; background: #f8fafc;">
                      <option value="officer" <?php echo $u['role']==='officer'?'selected':''; ?>>Officer</option>
                      <option value="admin" <?php echo $u['role']==='admin'?'selected':''; ?>>Administrator</option>
                    </select>
                  </form>
                </td>
                <td><span class="badge badge-<?php echo $u['is_active']?'verified':'rejected'; ?>"><?php echo $u['is_active']?'Active':'Disabled'; ?></span></td>
                <td>
                  <form action="admin-dashboard.php" method="POST">
                    <input type="hidden" name="action" value="toggle_user_status">
                    <input type="hidden" name="user_id" value="<?php echo $u['id']; ?>">
                    <input type="hidden" name="is_active" value="<?php echo $u['is_active']?0:1; ?>">
                    <button type="submit" class="btn <?php echo $u['is_active']?'btn-danger':'btn-success'; ?> btn-sm">
                      <?php echo $u['is_active']?'Disable Account':'Enable Account'; ?>
                    </button>
                  </form>
                </td>
              </tr>
            <?php endforeach; ?>
          <?php endif; ?>
        </tbody>
      </table>
    </div>

  <!-- Tab 2: Global Analytics -->
  <?php elseif ($tab === 'analytics'): ?>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.25rem;">
      <div class="glass-card" style="text-align: center; padding: 1.5rem;"><div style="font-size: 2.2rem; font-weight: 800; color: #2563eb;"><?php echo $stats['totalLost']; ?></div><div style="font-size: 0.85rem; color: #64748b;">Total Lost Items</div></div>
      <div class="glass-card" style="text-align: center; padding: 1.5rem;"><div style="font-size: 2.2rem; font-weight: 800; color: #0284c7;"><?php echo $stats['totalFound']; ?></div><div style="font-size: 0.85rem; color: #64748b;">Total Found Items</div></div>
      <div class="glass-card" style="text-align: center; padding: 1.5rem;"><div style="font-size: 2.2rem; font-weight: 800; color: #10b981;"><?php echo $stats['totalReturned']; ?></div><div style="font-size: 0.85rem; color: #64748b;">Returned / Claimed</div></div>
      <div class="glass-card" style="text-align: center; padding: 1.5rem;"><div style="font-size: 2.2rem; font-weight: 800; color: #d97706;"><?php echo $stats['pendingClaims']; ?></div><div style="font-size: 0.85rem; color: #64748b;">Pending Claims</div></div>
      <div class="glass-card" style="text-align: center; padding: 1.5rem;"><div style="font-size: 2.2rem; font-weight: 800; color: #0f172a;"><?php echo $stats['totalUsers']; ?></div><div style="font-size: 0.85rem; color: #64748b;">Registered Users</div></div>
    </div>

  <!-- Tab 3: Dropdowns CRUD -->
  <?php elseif ($tab === 'dropdowns'): ?>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 2rem;">
      <div class="glass-panel" style="padding: 1.5rem; background: #ffffff;">
        <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 1rem;">Categories List CRUD</h3>
        <form action="admin-dashboard.php" method="POST" style="margin-bottom: 1.5rem;">
          <input type="hidden" name="action" value="add_category">
          <div class="form-group"><input type="text" name="name" class="form-control" placeholder="New Category Name..." required></div>
          <div class="form-group"><input type="text" name="description" class="form-control" placeholder="Description..."></div>
          <button type="submit" class="btn btn-primary btn-sm" style="width: 100%;">➕ Add Category</button>
        </form>
        <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.5rem;">
          <?php foreach ($categories as $c): ?>
            <li style="display: flex; justify-content: space-between; background: #f8fafc; padding: 0.6rem 0.85rem; border-radius: 8px; font-size: 0.85rem; border: 1px solid #e2e8f0;">
              <span><strong><?php echo htmlspecialchars($c['name']); ?></strong></span>
              <span style="font-size: 0.75rem; color: #64748b;">ID #<?php echo $c['id']; ?></span>
            </li>
          <?php endforeach; ?>
        </ul>
      </div>

      <div class="glass-panel" style="padding: 1.5rem; background: #ffffff;">
        <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 1rem;">Campus Zones List CRUD</h3>
        <form action="admin-dashboard.php" method="POST" style="margin-bottom: 1.5rem;">
          <input type="hidden" name="action" value="add_zone">
          <div class="form-group"><input type="text" name="name" class="form-control" placeholder="Zone Name..." required></div>
          <div class="form-group"><input type="text" name="building_code" class="form-control" placeholder="Building Code (e.g. SCI-B)..."></div>
          <button type="submit" class="btn btn-primary btn-sm" style="width: 100%;">➕ Add Campus Zone</button>
        </form>
        <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.5rem;">
          <?php foreach ($zones as $z): ?>
            <li style="display: flex; justify-content: space-between; background: #f8fafc; padding: 0.6rem 0.85rem; border-radius: 8px; font-size: 0.85rem; border: 1px solid #e2e8f0;">
              <span><strong><?php echo htmlspecialchars($z['name']); ?></strong> (<?php echo htmlspecialchars($z['building_code']); ?>)</span>
              <span style="font-size: 0.75rem; color: #64748b;">ID #<?php echo $z['id']; ?></span>
            </li>
          <?php endforeach; ?>
        </ul>
      </div>
    </div>

  <!-- Tab 4: Audit Logs -->
  <?php elseif ($tab === 'audit-logs'): ?>
    <h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem;">System Action Audit Trail</h2>
    <div class="table-responsive glass-panel">
      <table class="table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Actor</th>
            <th>Action Code</th>
            <th>Target Type</th>
            <th>Target ID</th>
            <th>Audit Notes</th>
          </tr>
        </thead>
        <tbody>
          <?php foreach ($audit_logs as $log): ?>
            <tr>
              <td style="font-size: 0.75rem; color: #64748b;"><?php echo date('M d, Y H:i', strtotime($log['created_at'])); ?></td>
              <td><strong><?php echo htmlspecialchars($log['actor_name']); ?></strong></td>
              <td><code><?php echo htmlspecialchars($log['action']); ?></code></td>
              <td><?php echo htmlspecialchars($log['target_type'] ?: '-'); ?></td>
              <td><?php echo $log['target_id'] ?: '-'; ?></td>
              <td style="font-size: 0.85rem;"><?php echo htmlspecialchars($log['remarks']); ?></td>
            </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  <?php endif; ?>
</div>

<?php require_once __DIR__ . '/include/footer.php'; ?>
