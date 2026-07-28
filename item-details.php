<?php
require_once __DIR__ . '/include/dbConfig.php';

$type = $_GET['type'] ?? '';
$id = $_GET['id'] ?? 0;
$user = current_user();
$is_officer_or_admin = $user && in_array($user['role'], ['officer', 'admin']);

// Handle Claim Form Submission
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'submit_claim') {
    require_login();
    $id_card_ref = trim($_POST['id_card_ref'] ?? '');
    $evidence_description = trim($_POST['evidence_description'] ?? '');

    $evidence_file_url = null;
    if (isset($_FILES['evidenceFile']) && $_FILES['evidenceFile']['error'] === UPLOAD_ERR_OK) {
        $ext = pathinfo($_FILES['evidenceFile']['name'], PATHINFO_EXTENSION);
        $filename = 'proof-' . time() . '-' . rand(1000, 9999) . '.' . $ext;
        $target = __DIR__ . '/uploads/generalDocs/' . $filename;
        if (move_uploaded_file($_FILES['evidenceFile']['tmp_name'], $target)) {
            $evidence_file_url = 'uploads/generalDocs/' . $filename;
        }
    }

    if ($id_card_ref && $evidence_description) {
        $stmt = $pdo->prepare("INSERT INTO claims (item_type, item_id, claimant_id, id_card_ref, evidence_description, evidence_file_url, status) VALUES (?, ?, ?, ?, ?, ?, 'pending')");
        $stmt->execute([$type, $id, $user['id'], $id_card_ref, $evidence_description, $evidence_file_url]);

        require_once __DIR__ . '/services/audit.php';
        log_audit($user['id'], $user['name'], 'SUBMIT_CLAIM', 'CLAIM', $pdo->lastInsertId(), "Claim submitted for {$type} item #{$id}");

        set_flash('success', 'Claim request submitted successfully! An officer will review your evidence.');
        header('Location: student-dashboard.php?tab=my-claims');
        exit;
    }
}

// Fetch Item Record
$item = null;
if ($type === 'lost') {
    $stmt = $pdo->prepare("SELECT l.*, c.name as category_name, z.name as zone_name, u.name as reporter_name, u.email as reporter_email FROM lost_items l JOIN categories c ON l.category_id=c.id JOIN campus_zones z ON l.campus_zone_id=z.id JOIN users u ON l.user_id=u.id WHERE l.id=?");
    $stmt->execute([$id]);
    $item = $stmt->fetch();
} elseif ($type === 'found') {
    $stmt = $pdo->prepare("SELECT f.*, c.name as category_name, z.name as zone_name, u.name as reporter_name, u.email as reporter_email FROM found_items f JOIN categories c ON f.category_id=c.id JOIN campus_zones z ON f.campus_zone_id=z.id JOIN users u ON f.user_id=u.id WHERE f.id=?");
    $stmt->execute([$id]);
    $item = $stmt->fetch();
}

if (!$item) {
    set_flash('danger', 'Item record not found.');
    header('Location: index.php');
    exit;
}

$page_title = $item['title'];
require_once __DIR__ . '/include/header.php';
?>

<div class="main-content">
  <a href="index.php" class="btn btn-secondary btn-sm" style="margin-bottom: 1.5rem;">⬅️ Back to Inventory Search</a>

  <div class="glass-panel" style="padding: 2rem; background: #ffffff; display: flex; flex-direction: column; gap: 1.5rem;">
    <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
      <div>
        <span style="background: <?php echo $type==='found'?'#0284c7':'#ef4444'; ?>; color: #fff; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 4px; text-transform: uppercase;">
          <?php echo strtoupper($type); ?> ITEM RECORD
        </span>
        <h1 style="font-size: 1.8rem; font-weight: 800; margin-top: 0.5rem; color: #0f172a;"><?php echo htmlspecialchars($item['title']); ?></h1>
      </div>
      <span class="badge badge-<?php echo strtolower($item['status']); ?>">● <?php echo ucfirst($item['status']); ?></span>
    </div>

    <?php if (!empty($item['image_url'])): ?>
      <div style="max-height: 380px; border-radius: var(--radius-md); overflow: hidden; background: #f8fafc; text-align: center;">
        <img src="<?php echo htmlspecialchars($item['image_url']); ?>" alt="<?php echo htmlspecialchars($item['title']); ?>" style="max-height: 380px; width: auto; object-fit: contain;" onerror="this.onerror=null; this.src='images/icons/logo.jpg';">
      </div>
    <?php endif; ?>

    <div style="display: flex; flex-wrap: wrap; gap: 1rem; background: #f8fafc; padding: 1rem; border-radius: var(--radius-md); border: 1px solid #e2e8f0;">
      <div>🏷️ <strong>Category:</strong> <?php echo htmlspecialchars($item['category_name']); ?></div>
      <div>📍 <strong>Location:</strong> <?php echo htmlspecialchars($item['zone_name']); ?> (<?php echo htmlspecialchars($item['location_details'] ?: 'Grounds'); ?>)</div>
      <div>📅 <strong>Date:</strong> <?php echo $type==='found'?$item['date_found']:$item['date_lost']; ?></div>
      <?php if (!empty($item['brand'])): ?><div><strong>Brand:</strong> <?php echo htmlspecialchars($item['brand']); ?></div><?php endif; ?>
      <?php if (!empty($item['primary_color'])): ?><div><strong>Color:</strong> <?php echo htmlspecialchars($item['primary_color']); ?></div><?php endif; ?>
    </div>

    <div>
      <h3 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 0.5rem; color: #1e293b;">Item Description</h3>
      <p style="color: #475569; line-height: 1.6; font-size: 0.925rem;">
        <?php echo htmlspecialchars($item['description'] ?? ''); ?>
      </p>
    </div>

    <?php if ($is_officer_or_admin): ?>
      <div style="background: #fffbeb; border: 1px solid #fde68a; padding: 1rem; border-radius: var(--radius-md);">
        <h4 style="color: #b45309; font-size: 0.9rem; margin-bottom: 0.5rem;">🔒 Restricted Officer Details:</h4>
        <p style="font-size: 0.85rem;"><strong>Storage Locker ID:</strong> <code style="color: #0284c7;"><?php echo htmlspecialchars($item['locker_id'] ?? 'Not Assigned'); ?></code></p>
        <p style="font-size: 0.85rem; margin-top: 0.25rem;"><strong>Reference Visual Markers:</strong> <?php echo htmlspecialchars($item['visual_markers'] ?? 'None'); ?></p>
        <?php if (!empty($item['contact_number'])): ?><p style="font-size: 0.85rem; margin-top: 0.25rem;"><strong>Reporter Contact:</strong> <?php echo htmlspecialchars($item['contact_number']); ?></p><?php endif; ?>
      </div>
    <?php endif; ?>

    <!-- Property Ownership Claim Form -->
    <?php if ($type === 'found' && in_array($item['status'], ['available', 'verified'])): ?>
      <div id="claim-form" style="margin-top: 1.5rem; border-top: 1px solid #e2e8f0; padding-top: 1.5rem;">
        <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; color: #0f172a;">🛡️ Submit Property Ownership Claim</h3>
        <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 1.25rem;">Claims are verified by Officers before physical property release.</p>

        <?php if (!$user): ?>
          <div class="glass-card" style="text-align: center; padding: 1.5rem;">
            <p style="margin-bottom: 1rem; color: #64748b;">You must be signed in to submit an ownership claim.</p>
            <a href="login.php" class="btn btn-primary btn-sm">Sign In to Claim Property</a>
          </div>
        <?php else: ?>
          <form action="item-details.php?type=found&id=<?php echo $id; ?>" method="POST" enctype="multipart/form-data">
            <input type="hidden" name="action" value="submit_claim">
            
            <div class="form-group">
              <label class="form-label">Campus Student / Staff ID Reference Number *</label>
              <input type="text" name="id_card_ref" class="form-control" placeholder="e.g. STU-2026-8894" required>
            </div>

            <div class="form-group">
              <label class="form-label">Detailed Proof of Ownership & Identifying Features *</label>
              <textarea name="evidence_description" class="form-control" rows="4" placeholder="Describe unique details: serial numbers, lock screen wallpaper, sticker placements, scratches..." required></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Upload Proof Document / Receipt / Photo (Optional)</label>
              <input type="file" name="evidenceFile" class="form-control" accept="image/*,.pdf">
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">Submit Claim to Officers</button>
          </form>
        <?php endif; ?>
      </div>
    <?php endif; ?>
  </div>
</div>

<?php require_once __DIR__ . '/include/footer.php'; ?>
