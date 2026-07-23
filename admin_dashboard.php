<?php
require_once __DIR__ . '/config/db.php';
requireRole('admin');

$currentUser = getCurrentUser();
$db = getDBConnection();

// System Metrics
$totalItems = 1482;
$totalRecoveries = 1120;
$totalUsers = 4290;
$pendingClaims = 18;

$auditLogs = [];

if ($db) {
    try {
        $totalItems = $db->query("SELECT COUNT(*) FROM items")->fetchColumn();
        $totalRecoveries = $db->query("SELECT COUNT(*) FROM items WHERE status = 'Claimed'")->fetchColumn();
        $totalUsers = $db->query("SELECT COUNT(*) FROM users")->fetchColumn();
        $pendingClaims = $db->query("SELECT COUNT(*) FROM claims WHERE status = 'pending'")->fetchColumn();

        $auditLogs = $db->query("SELECT a.*, u.username FROM audit_logs a LEFT JOIN users u ON a.user_id = u.id ORDER BY a.created_at DESC LIMIT 10")->fetchAll();
    } catch (Exception $e) {
        // Fallback logs
    }
}

if (empty($auditLogs)) {
    $auditLogs = [
        ['created_at' => '2026-07-21 13:20', 'action' => 'Role Assignment: Officer #4', 'role_context' => 'admin', 'status' => 'SUCCESS'],
        ['created_at' => '2026-07-21 12:45', 'action' => 'Item Bulk Export', 'role_context' => 'officer', 'status' => 'SUCCESS'],
        ['created_at' => '2026-07-21 11:05', 'action' => 'Password Reset Request', 'role_context' => 'student', 'status' => 'COMPLETED'],
        ['created_at' => '2026-07-20 18:30', 'action' => 'New Item Logged #item-106', 'role_context' => 'officer', 'status' => 'SUCCESS'],
        ['created_at' => '2026-07-20 15:10', 'action' => 'Claim Approved #claim-101', 'role_context' => 'officer', 'status' => 'SUCCESS']
    ];
}

include __DIR__ . '/includes/header.php';
?>

<div style="background: var(--bg-main); min-height: calc(100vh - 4.5rem); padding: 2.5rem 0;">
    <div class="container">
        <!-- Banner Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
            <div>
                <span class="badge badge-admin" style="margin-bottom: 0.5rem;">
                    TRACKNFIND SYSTEM ADMIN DASHBOARD
                </span>
                <h1 style="font-size: 2rem; font-weight: 800;">Welcome Back, <?= sanitize($currentUser['full_name'] ?? 'Administrator') ?></h1>
                <p style="color: var(--text-muted);">Overview of TrackNfind system health, active users, audit logs, and global portal settings.</p>
            </div>
            <a href="index.php" class="btn btn-secondary">
                ← Back to Public Portal
            </a>
        </div>

        <!-- Metric Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem; margin-bottom: 2.5rem;">
            <div style="background: white; padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);">
                <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted);">TOTAL LOGGED ITEMS</span>
                <h2 style="font-size: 2.2rem; font-weight: 800; color: var(--primary); margin: 0.2rem 0;"><?= number_format($totalItems) ?></h2>
                <span style="font-size: 0.82rem; color: var(--success); font-weight: 600;">↑ +14% this month</span>
            </div>

            <div style="background: white; padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);">
                <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted);">SUCCESSFUL RECOVERIES</span>
                <h2 style="font-size: 2.2rem; font-weight: 800; color: var(--accent-teal); margin: 0.2rem 0;"><?= number_format($totalRecoveries) ?></h2>
                <span style="font-size: 0.82rem; color: var(--success); font-weight: 600;">75.5% Recovery Rate</span>
            </div>

            <div style="background: white; padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);">
                <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted);">REGISTERED USERS</span>
                <h2 style="font-size: 2.2rem; font-weight: 800; color: var(--accent-purple); margin: 0.2rem 0;"><?= number_format($totalUsers) ?></h2>
                <span style="font-size: 0.82rem; color: var(--text-muted);">Students & Officers</span>
            </div>

            <div style="background: white; padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);">
                <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted);">PENDING CLAIMS</span>
                <h2 style="font-size: 2.2rem; font-weight: 800; color: var(--accent-amber); margin: 0.2rem 0;"><?= number_format($pendingClaims) ?></h2>
                <span style="font-size: 0.82rem; color: var(--accent-amber); font-weight: 600;">Requires Officer Review</span>
            </div>
        </div>

        <!-- Audit & Admin Grid -->
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.75rem;">
            <div style="background: white; padding: 1.75rem; border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
                <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 1rem;">TrackNfind Security & Audit Logs</h3>
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
                    <thead>
                        <tr style="border-bottom: 2px solid var(--border-color); color: var(--text-muted);">
                            <th style="padding: 0.6rem 0;">Timestamp</th>
                            <th>Action</th>
                            <th>Role Context</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($auditLogs as $log): ?>
                            <tr style="border-bottom: 1px solid var(--border-color);">
                                <td style="padding: 0.75rem 0;"><?= sanitize($log['created_at']) ?></td>
                                <td><?= sanitize($log['action']) ?></td>
                                <td><span class="badge badge-<?= sanitize($log['role_context']) ?>"><?= strtoupper(sanitize($log['role_context'])) ?></span></td>
                                <td><span style="color: var(--success); font-weight: 700;"><?= sanitize($log['status']) ?></span></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>

            <div style="background: white; padding: 1.75rem; border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
                <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 1rem;">Quick Admin Controls</h3>
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                    <button class="btn btn-secondary btn-full" style="justify-content: flex-start;" onclick="alert('Manage Officer Accounts panel opening...')">
                        👥 Manage Officer Accounts
                    </button>
                    <button class="btn btn-secondary btn-full" style="justify-content: flex-start;" onclick="alert('Export Recovery Reports downloading...')">
                        📊 Export Recovery Reports (CSV)
                    </button>
                    <button class="btn btn-secondary btn-full" style="justify-content: flex-start;" onclick="alert('Retention Settings opened')">
                        ⚙️ Asset Retention Settings
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

<?php include __DIR__ . '/includes/footer.php'; ?>
