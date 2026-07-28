<?php
require_once __DIR__ . '/include/dbConfig.php';
require_role(['officer', 'admin']);

$user = current_user();
$page_title = 'Officer Operational Dashboard';
$tab = $_GET['tab'] ?? 'claims-queue';

// Handle Claim Review Post Action (Approve / Reject)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'review_claim') {
    $claim_id = $_POST['claim_id'] ?? 0;
    $status = $_POST['status'] ?? '';
    $remarks = trim($_POST['officer_remarks'] ?? '');

    if ($claim_id && in_array($status, ['approved', 'rejected'])) {
        $stmtClaim = $pdo->prepare("SELECT * FROM claims WHERE id = ?");
        $stmtClaim->execute([$claim_id]);
        $claim = $stmtClaim->fetch();

        if ($claim) {
            $now = date('Y-m-d H:i:s');
            $pdo->prepare("UPDATE claims SET status = ?, reviewing_officer_id = ?, officer_remarks = ?, reviewed_at = ? WHERE id = ?")
                ->execute([$status, $user['id'], $remarks, $now, $claim_id]);

            require_once __DIR__ . '/services/audit.php';
            log_audit($user['id'], $user['name'], "CLAIM_" . strtoupper($status), 'CLAIM', $claim_id, $remarks);

            if ($status === 'approved') {
                if ($claim['item_type'] === 'lost') {
                    $pdo->prepare("UPDATE lost_items SET status = 'claimed' WHERE id = ?")->execute([$claim['item_id']]);
                } else {
                    $pdo->prepare("UPDATE found_items SET status = 'returned' WHERE id = ?")->execute([$claim['item_id']]);
                }

                $pdo->prepare("UPDATE claims SET status = 'rejected', officer_remarks = 'Another claim was verified and approved by Officer.' WHERE item_type = ? AND item_id = ? AND id != ? AND status = 'pending'")
                    ->execute([$claim['item_type'], $claim['item_id'], $claim_id]);

                $pdo->prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, 'Claim Approved!', 'Your claim has been verified and approved. Please pick up your property at Central Library Room 102 with your ID card.', 'success')")
                    ->execute([$claim['claimant_id']]);
            } else {
                $pdo->prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, 'Claim Update', ?, 'error')")
                    ->execute([$claim['claimant_id'], "Your claim was rejected. Remarks: " . ($remarks ?: 'Insufficient proof provided.')]);
            }

            set_flash('success', "Claim #{$claim_id} marked as " . strtoupper($status) . ".");
            header('Location: officer-dashboard.php?tab=claims-queue');
            exit;
        }
    }
}

// Handle Match Status Update
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'update_match') {
    $match_id = $_POST['match_id'] ?? 0;
    $match_status = $_POST['status'] ?? '';
    if ($match_id && in_array($match_status, ['verified', 'dismissed'])) {
        $pdo->prepare("UPDATE matches SET status = ? WHERE id = ?")->execute([$match_status, $match_id]);
        require_once __DIR__ . '/services/audit.php';
        log_audit($user['id'], $user['name'], "MATCH_" . strtoupper($match_status), 'MATCH', $match_id, "Updated match status to {$match_status}");
        set_flash('success', "Match #{$match_id} marked as {$match_status}.");
        header('Location: officer-dashboard.php?tab=matches-queue');
        exit;
    }
}

// Handle Manual Match Trigger
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'trigger_matching') {
    require_once __DIR__ . '/services/matching.php';
    $count = run_matching_engine();
    set_flash('success', "Matching engine job executed. {$count} new potential matches found.");
    header('Location: officer-dashboard.php?tab=matches-queue');
    exit;
}

// Handle Item Verification
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'verify_item') {
    $item_type = $_POST['item_type'] ?? '';
    $item_id = $_POST['item_id'] ?? 0;
    if ($item_type === 'lost') {
        $pdo->prepare("UPDATE lost_items SET status = 'verified' WHERE id = ?")->execute([$item_id]);
    } else {
        $pdo->prepare("UPDATE found_items SET status = 'available' WHERE id = ?")->execute([$item_id]);
    }
    set_flash('success', "Item verified and published to active inventory.");
    header('Location: officer-dashboard.php?tab=verifications');
    exit;
}

// Fetch Queues
$pending_claims = $pdo->query("
    SELECT c.*, u.name as claimant_name, u.email as claimant_email,
           COALESCE(l.title, f.title) as item_title, f.locker_id, f.visual_markers
    FROM claims c
    JOIN users u ON c.claimant_id = u.id
    LEFT JOIN lost_items l ON c.item_type = 'lost' AND c.item_id = l.id
    LEFT JOIN found_items f ON c.item_type = 'found' AND c.item_id = f.id
    WHERE c.status = 'pending'
    ORDER BY c.created_at ASC
")->fetchAll();

$suggested_matches = $pdo->query("
    SELECT m.*, l.title as lost_title, l.date_lost, f.title as found_title, f.date_found, f.locker_id,
           u1.name as lost_reporter, u2.name as found_reporter
    FROM matches m
    JOIN lost_items l ON m.lost_item_id = l.id
    JOIN found_items f ON m.found_item_id = f.id
    JOIN users u1 ON l.user_id = u1.id
    JOIN users u2 ON f.user_id = u2.id
    WHERE m.status = 'suggested'
    ORDER BY m.correlation_score DESC
")->fetchAll();

$unverified_lost = $pdo->query("SELECT l.*, c.name as category_name, z.name as zone_name, u.name as reporter_name, 'lost' as item_type FROM lost_items l JOIN categories c ON l.category_id=c.id JOIN campus_zones z ON l.campus_zone_id=z.id JOIN users u ON l.user_id=u.id WHERE l.status='submitted'")->fetchAll();
$unverified_found = $pdo->query("SELECT f.*, c.name as category_name, z.name as zone_name, u.name as reporter_name, 'found' as item_type FROM found_items f JOIN categories c ON f.category_id=c.id JOIN campus_zones z ON f.campus_zone_id=z.id JOIN users u ON f.user_id=u.id WHERE f.status='submitted'")->fetchAll();
$unverified_items = array_merge($unverified_lost, $unverified_found);

require_once __DIR__ . '/include/header.php';
?>

<div class="main-content">
  <div class="glass-panel" style="padding: 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 2rem; background: #ffffff;">
    <div>
      <span style="color: #0284c7; font-weight: 800; font-size: 0.8rem;">🛡️ LIVE OPERATIONAL QUEUE</span>
      <h1 style="font-size: 1.8rem; font-weight: 800; color: #0f172a;">Lost & Found Officer Dashboard</h1>
      <p style="color: #64748b; font-size: 0.9rem;">Review item verifications, audit ownership claims with proof, and verify item matches.</p>
    </div>
    <form action="officer-dashboard.php" method="POST">
      <input type="hidden" name="action" value="trigger_matching">
      <button type="submit" class="btn btn-primary">⚡ Run Automated Matching Job</button>
    </form>
  </div>

  <div style="display: flex; gap: 0.5rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; margin-bottom: 2rem;">
    <a href="officer-dashboard.php?tab=claims-queue" class="btn <?php echo $tab==='claims-queue'?'btn-primary':'btn-secondary'; ?> btn-sm">
      Claims Review Queue (<?php echo count($pending_claims); ?>)
    </a>
    <a href="officer-dashboard.php?tab=matches-queue" class="btn <?php echo $tab==='matches-queue'?'btn-primary':'btn-secondary'; ?> btn-sm">
      Suggested Matches (<?php echo count($suggested_matches); ?>)
    </a>
    <a href="officer-dashboard.php?tab=verifications" class="btn <?php echo $tab==='verifications'?'btn-primary':'btn-secondary'; ?> btn-sm">
      Pending Verifications (<?php echo count($unverified_items); ?>)
    </a>
  </div>

  <!-- Tab 1: Claims Review Queue -->
  <?php if ($tab === 'claims-queue'): ?>
    <h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem;">Pending Claims Review Queue</h2>
    <?php if (empty($pending_claims)): ?>
      <div class="glass-panel" style="padding: 3rem; text-align: center; color: #64748b; background: #ffffff;">No pending claims requiring review at this time.</div>
    <?php else: ?>
      <div class="table-responsive glass-panel">
        <table class="table">
          <thead>
            <tr>
              <th>Claim ID</th>
              <th>Claimant</th>
              <th>Item Title</th>
              <th>Locker ID</th>
              <th>ID Card Ref</th>
              <th>Submitted Evidence</th>
              <th>Review Actions</th>
            </tr>
          </thead>
          <tbody>
            <?php foreach ($pending_claims as $claim): ?>
              <tr>
                <td><strong>#CLM-<?php echo $claim['id']; ?></strong></td>
                <td><strong><?php echo htmlspecialchars($claim['claimant_name']); ?></strong><br><span style="font-size: 0.75rem; color: #64748b;"><?php echo htmlspecialchars($claim['claimant_email']); ?></span></td>
                <td><?php echo htmlspecialchars($claim['item_title']); ?></td>
                <td><code style="color: #0284c7;"><?php echo htmlspecialchars($claim['locker_id'] ?: 'N/A'); ?></code></td>
                <td><code><?php echo htmlspecialchars($claim['id_card_ref']); ?></code></td>
                <td style="max-width: 240px; font-size: 0.85rem;">
                  <p><?php echo htmlspecialchars($claim['evidence_description']); ?></p>
                  <?php if (!empty($claim['evidence_file_url'])): ?>
                    <a href="<?php echo htmlspecialchars($claim['evidence_file_url']); ?>" target="_blank" style="font-size: 0.75rem;">View Proof Attachment 📎</a>
                  <?php endif; ?>
                </td>
                <td>
                  <form action="officer-dashboard.php" method="POST" style="display: flex; flex-direction: column; gap: 0.4rem;">
                    <input type="hidden" name="action" value="review_claim">
                    <input type="hidden" name="claim_id" value="<?php echo $claim['id']; ?>">
                    <input type="text" name="officer_remarks" class="form-control" placeholder="Audit remarks..." style="font-size: 0.75rem; padding: 0.3rem 0.5rem;" required>
                    <div style="display: flex; gap: 0.3rem;">
                      <button type="submit" name="status" value="approved" class="btn btn-success btn-sm" style="flex: 1;">Approve</button>
                      <button type="submit" name="status" value="rejected" class="btn btn-danger btn-sm" style="flex: 1;">Reject</button>
                    </div>
                  </form>
                </td>
              </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </div>
    <?php endif; ?>

  <!-- Tab 2: System Suggested Matches -->
  <?php elseif ($tab === 'matches-queue'): ?>
    <h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem;">System Suggested Item Matches</h2>
    <?php if (empty($suggested_matches)): ?>
      <div class="glass-panel" style="padding: 3rem; text-align: center; color: #64748b; background: #ffffff;">No match suggestions pending.</div>
    <?php else: ?>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem;">
        <?php foreach ($suggested_matches as $m): ?>
          <div class="glass-card" style="padding: 1.25rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem;">
              <span style="font-size: 0.8rem; font-weight: 800; color: #d97706;">Match Score: <?php echo $m['correlation_score']; ?>%</span>
              <span style="font-size: 0.75rem; color: #64748b;">Match #<?php echo $m['id']; ?></span>
            </div>

            <div style="margin-bottom: 1rem;">
              <div style="font-size: 0.8rem; color: #ef4444; font-weight: 700;">LOST ITEM (#L-<?php echo $m['lost_item_id']; ?>):</div>
              <div style="font-weight: 700;"><?php echo htmlspecialchars($m['lost_title']); ?></div>
              <div style="font-size: 0.78rem; color: #64748b;">By <?php echo htmlspecialchars($m['lost_reporter']); ?> | <?php echo $m['date_lost']; ?></div>
            </div>

            <div style="margin-bottom: 1rem;">
              <div style="font-size: 0.8rem; color: #0284c7; font-weight: 700;">FOUND ITEM (#F-<?php echo $m['found_item_id']; ?>):</div>
              <div style="font-weight: 700;"><?php echo htmlspecialchars($m['found_title']); ?></div>
              <div style="font-size: 0.78rem; color: #64748b;">Locker: <?php echo htmlspecialchars($m['locker_id'] ?: 'N/A'); ?> | <?php echo $m['date_found']; ?></div>
            </div>

            <form action="officer-dashboard.php" method="POST" style="display: flex; gap: 0.5rem;">
              <input type="hidden" name="action" value="update_match">
              <input type="hidden" name="match_id" value="<?php echo $m['id']; ?>">
              <button type="submit" name="status" value="verified" class="btn btn-success btn-sm" style="flex: 1;">Verify Match</button>
              <button type="submit" name="status" value="dismissed" class="btn btn-danger btn-sm" style="flex: 1;">Dismiss</button>
            </form>
          </div>
        <?php endforeach; ?>
      </div>
    <?php endif; ?>

  <!-- Tab 3: Pending Verifications -->
  <?php elseif ($tab === 'verifications'): ?>
    <h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem;">Unverified Item Reports</h2>
    <?php if (empty($unverified_items)): ?>
      <div class="glass-panel" style="padding: 3rem; text-align: center; color: #64748b; background: #ffffff;">All submitted reports have been verified.</div>
    <?php else: ?>
      <div class="table-responsive glass-panel">
        <table class="table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Title</th>
              <th>Reporter</th>
              <th>Category</th>
              <th>Zone</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <?php foreach ($unverified_items as $item): ?>
              <tr>
                <td><span class="badge badge-<?php echo $item['item_type']==='found'?'available':'submitted'; ?>"><?php echo strtoupper($item['item_type']); ?></span></td>
                <td><strong><?php echo htmlspecialchars($item['title']); ?></strong></td>
                <td><?php echo htmlspecialchars($item['reporter_name']); ?></td>
                <td><?php echo htmlspecialchars($item['category_name']); ?></td>
                <td><?php echo htmlspecialchars($item['zone_name']); ?></td>
                <td>
                  <form action="officer-dashboard.php" method="POST">
                    <input type="hidden" name="action" value="verify_item">
                    <input type="hidden" name="item_type" value="<?php echo $item['item_type']; ?>">
                    <input type="hidden" name="item_id" value="<?php echo $item['id']; ?>">
                    <button type="submit" class="btn btn-primary btn-sm">Verify & Publish</button>
                  </form>
                </td>
              </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </div>
    <?php endif; ?>
  <?php endif; ?>
</div>

<?php require_once __DIR__ . '/include/footer.php'; ?>
