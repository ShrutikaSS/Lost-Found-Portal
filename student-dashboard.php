<?php
require_once __DIR__ . '/include/dbConfig.php';
require_login();

$user = current_user();
$page_title = 'Student & Staff Dashboard';
$tab = $_GET['tab'] ?? 'my-reports';

// Handle Report Lost Form Submission
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'report_lost') {
    $title = trim($_POST['title'] ?? '');
    $category_id = $_POST['category_id'] ?? '';
    $description = trim($_POST['description'] ?? '');
    $date_lost = $_POST['date_lost'] ?? '';
    $campus_zone_id = $_POST['campus_zone_id'] ?? '';
    $location_details = trim($_POST['location_details'] ?? '');
    $brand = trim($_POST['brand'] ?? '');
    $primary_color = trim($_POST['primary_color'] ?? '');
    $contact_number = trim($_POST['contact_number'] ?? '');

    $image_url = null;
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
        $filename = 'lost-' . time() . '-' . rand(1000, 9999) . '.' . $ext;
        $target = __DIR__ . '/uploads/generalDocs/' . $filename;
        if (move_uploaded_file($_FILES['image']['tmp_name'], $target)) {
            $image_url = 'uploads/generalDocs/' . $filename;
        }
    }

    if ($title && $category_id && $description && $date_lost && $campus_zone_id && $contact_number) {
        $stmt = $pdo->prepare("INSERT INTO lost_items (user_id, title, category_id, description, date_lost, campus_zone_id, location_details, brand, primary_color, image_url, contact_number, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted')");
        $stmt->execute([$user['id'], $title, $category_id, $description, $date_lost, $campus_zone_id, $location_details, $brand, $primary_color, $image_url, $contact_number]);
        
        require_once __DIR__ . '/services/matching.php';
        run_matching_engine();

        set_flash('success', 'Lost item report submitted successfully!');
        header('Location: student-dashboard.php?tab=my-reports');
        exit;
    }
}

// Handle Report Found Form Submission
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'report_found') {
    $title = trim($_POST['title'] ?? '');
    $category_id = $_POST['category_id'] ?? '';
    $visual_markers = trim($_POST['visual_markers'] ?? '');
    $date_found = $_POST['date_found'] ?? '';
    $campus_zone_id = $_POST['campus_zone_id'] ?? '';
    $location_details = trim($_POST['location_details'] ?? '');
    $brand = trim($_POST['brand'] ?? '');
    $primary_color = trim($_POST['primary_color'] ?? '');
    $locker_id = trim($_POST['locker_id'] ?? '');

    $image_url = null;
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
        $filename = 'found-' . time() . '-' . rand(1000, 9999) . '.' . $ext;
        $target = __DIR__ . '/uploads/generalDocs/' . $filename;
        if (move_uploaded_file($_FILES['image']['tmp_name'], $target)) {
            $image_url = 'uploads/generalDocs/' . $filename;
        }
    }

    if ($title && $category_id && $date_found && $campus_zone_id) {
        $status = in_array($user['role'], ['officer', 'admin']) ? 'verified' : 'submitted';
        $stmt = $pdo->prepare("INSERT INTO found_items (user_id, title, category_id, visual_markers, date_found, campus_zone_id, location_details, brand, primary_color, locker_id, image_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$user['id'], $title, $category_id, $visual_markers, $date_found, $campus_zone_id, $location_details, $brand, $primary_color, $locker_id, $image_url, $status]);

        require_once __DIR__ . '/services/matching.php';
        run_matching_engine();

        set_flash('success', 'Found item reported successfully!');
        header('Location: student-dashboard.php?tab=my-reports');
        exit;
    }
}

// Fetch User Reports & Claims
$my_lost = $pdo->prepare("SELECT l.*, c.name as category_name, z.name as zone_name FROM lost_items l JOIN categories c ON l.category_id=c.id JOIN campus_zones z ON l.campus_zone_id=z.id WHERE l.user_id=? ORDER BY l.created_at DESC");
$my_lost->execute([$user['id']]);
$lost_items = $my_lost->fetchAll();

$my_found = $pdo->prepare("SELECT f.*, c.name as category_name, z.name as zone_name FROM found_items f JOIN categories c ON f.category_id=c.id JOIN campus_zones z ON f.campus_zone_id=z.id WHERE f.user_id=? ORDER BY f.created_at DESC");
$my_found->execute([$user['id']]);
$found_items = $my_found->fetchAll();

$my_claims = $pdo->prepare("SELECT c.*, COALESCE(l.title, f.title) as item_title FROM claims c LEFT JOIN lost_items l ON c.item_type='lost' AND c.item_id=l.id LEFT JOIN found_items f ON c.item_type='found' AND c.item_id=f.id WHERE c.claimant_id=? ORDER BY c.created_at DESC");
$my_claims->execute([$user['id']]);
$claims = $my_claims->fetchAll();

$categories = $pdo->query("SELECT * FROM categories ORDER BY name ASC")->fetchAll();
$zones = $pdo->query("SELECT * FROM campus_zones ORDER BY name ASC")->fetchAll();

require_once __DIR__ . '/include/header.php';
?>

<div class="main-content">
  <div class="glass-panel" style="padding: 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 2rem; background: #ffffff;">
    <div>
      <h1 style="font-size: 1.8rem; font-weight: 800; color: #0f172a;">Student & Staff Portal</h1>
      <p style="color: #64748b; font-size: 0.9rem;">Welcome back, <strong><?php echo htmlspecialchars($user['name']); ?></strong> (<?php echo htmlspecialchars($user['email']); ?>).</p>
    </div>
    <div style="display: flex; gap: 0.75rem;">
      <a href="student-dashboard.php?tab=report-lost" class="btn btn-primary btn-sm">➕ Report Lost Item</a>
      <a href="student-dashboard.php?tab=report-found" class="btn btn-secondary btn-sm">➕ Report Found Item</a>
    </div>
  </div>

  <!-- Tabs Navigation -->
  <div style="display: flex; gap: 0.5rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; margin-bottom: 2rem;">
    <a href="student-dashboard.php?tab=my-reports" class="btn <?php echo $tab==='my-reports'?'btn-primary':'btn-secondary'; ?> btn-sm">
      My Reports (<?php echo count($lost_items) + count($found_items); ?>)
    </a>
    <a href="student-dashboard.php?tab=my-claims" class="btn <?php echo $tab==='my-claims'?'btn-primary':'btn-secondary'; ?> btn-sm">
      My Claims Tracker (<?php echo count($claims); ?>)
    </a>
    <a href="student-dashboard.php?tab=report-lost" class="btn <?php echo $tab==='report-lost'?'btn-primary':'btn-secondary'; ?> btn-sm">
      Report Lost Item
    </a>
    <a href="student-dashboard.php?tab=report-found" class="btn <?php echo $tab==='report-found'?'btn-primary':'btn-secondary'; ?> btn-sm">
      Report Found Item
    </a>
  </div>

  <!-- Tab 1: My Reported Pipelines -->
  <?php if ($tab === 'my-reports'): ?>
    <h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem;">Personal Report Pipelines</h2>
    <?php if (empty($lost_items) && empty($found_items)): ?>
      <div class="glass-panel" style="padding: 3rem; text-align: center; color: #64748b; background: #ffffff;">
        <p>You haven't reported any lost or found items yet.</p>
      </div>
    <?php else: ?>
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <?php foreach ($lost_items as $item): ?>
          <div class="glass-panel" style="padding: 1.5rem; background: #ffffff;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
              <div>
                <span class="badge badge-submitted">LOST ITEM</span>
                <strong style="font-size: 1.1rem; margin-left: 0.5rem;"><?php echo htmlspecialchars($item['title']); ?></strong>
                <span style="font-size: 0.85rem; color: #64748b; margin-left: 0.75rem;">Reported on <?php echo $item['date_lost']; ?></span>
              </div>
              <span class="badge badge-<?php echo strtolower($item['status']); ?>"><?php echo ucfirst($item['status']); ?></span>
            </div>

            <!-- Pipeline Tracker -->
            <div class="pipeline-tracker">
              <div class="pipeline-step completed"><div class="pipeline-dot">1</div><span>Submitted</span></div>
              <div class="pipeline-step <?php echo in_array($item['status'], ['verified','matched','claimed','closed'])?'completed':'active'; ?>"><div class="pipeline-dot">2</div><span>Verification</span></div>
              <div class="pipeline-step <?php echo in_array($item['status'], ['matched','claimed','closed'])?'completed':''; ?>"><div class="pipeline-dot">3</div><span>Matched</span></div>
              <div class="pipeline-step <?php echo in_array($item['status'], ['claimed','closed'])?'completed':''; ?>"><div class="pipeline-dot">4</div><span>Claimed</span></div>
              <div class="pipeline-step <?php echo $item['status']==='closed'?'completed':''; ?>"><div class="pipeline-dot">5</div><span>Closed</span></div>
            </div>

            <div style="font-size: 0.85rem; color: #64748b; display: flex; justify-content: space-between; border-top: 1px solid #f1f5f9; padding-top: 0.75rem;">
              <span>Category: <strong><?php echo htmlspecialchars($item['category_name']); ?></strong> | Zone: <strong><?php echo htmlspecialchars($item['zone_name']); ?></strong></span>
              <a href="item-details.php?type=lost&id=<?php echo $item['id']; ?>" class="btn btn-secondary btn-sm">👁️ Details</a>
            </div>
          </div>
        <?php endforeach; ?>

        <?php foreach ($found_items as $item): ?>
          <div class="glass-panel" style="padding: 1.5rem; background: #ffffff;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
              <div>
                <span class="badge badge-available">FOUND ITEM</span>
                <strong style="font-size: 1.1rem; margin-left: 0.5rem;"><?php echo htmlspecialchars($item['title']); ?></strong>
                <span style="font-size: 0.85rem; color: #64748b; margin-left: 0.75rem;">Turned in on <?php echo $item['date_found']; ?></span>
              </div>
              <span class="badge badge-<?php echo strtolower($item['status']); ?>"><?php echo ucfirst($item['status']); ?></span>
            </div>

            <div class="pipeline-tracker">
              <div class="pipeline-step completed"><div class="pipeline-dot">1</div><span>Submitted</span></div>
              <div class="pipeline-step <?php echo in_array($item['status'], ['verified','available','returned','closed'])?'completed':''; ?>"><div class="pipeline-dot">2</div><span>Verified</span></div>
              <div class="pipeline-step <?php echo in_array($item['status'], ['available','returned','closed'])?'completed':''; ?>"><div class="pipeline-dot">3</div><span>Inventory</span></div>
              <div class="pipeline-step <?php echo in_array($item['status'], ['returned','closed'])?'completed':''; ?>"><div class="pipeline-dot">4</div><span>Returned</span></div>
            </div>

            <div style="font-size: 0.85rem; color: #64748b; display: flex; justify-content: space-between; border-top: 1px solid #f1f5f9; padding-top: 0.75rem;">
              <span>Category: <strong><?php echo htmlspecialchars($item['category_name']); ?></strong> | Storage Locker: <strong style="color: #0284c7;"><?php echo htmlspecialchars($item['locker_id'] ?: 'Officer Assigned'); ?></strong></span>
              <a href="item-details.php?type=found&id=<?php echo $item['id']; ?>" class="btn btn-secondary btn-sm">👁️ Details</a>
            </div>
          </div>
        <?php endforeach; ?>
      </div>
    <?php endif; ?>

  <!-- Tab 2: My Claims Tracker -->
  <?php elseif ($tab === 'my-claims'): ?>
    <h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem;">Submitted Ownership Claims</h2>
    <?php if (empty($claims)): ?>
      <div class="glass-panel" style="padding: 3rem; text-align: center; color: #64748b; background: #ffffff;">No claims submitted yet.</div>
    <?php else: ?>
      <div class="table-responsive glass-panel">
        <table class="table">
          <thead>
            <tr>
              <th>Claim ID</th>
              <th>Item Title</th>
              <th>ID Card Ref</th>
              <th>Submitted Date</th>
              <th>Status</th>
              <th>Officer Remarks</th>
            </tr>
          </thead>
          <tbody>
            <?php foreach ($claims as $claim): ?>
              <tr>
                <td><strong>#CLM-<?php echo $claim['id']; ?></strong></td>
                <td><?php echo htmlspecialchars($claim['item_title']); ?></td>
                <td><code><?php echo htmlspecialchars($claim['id_card_ref']); ?></code></td>
                <td><?php echo date('M d, Y', strtotime($claim['created_at'])); ?></td>
                <td><span class="badge badge-<?php echo strtolower($claim['status']); ?>"><?php echo ucfirst($claim['status']); ?></span></td>
                <td style="font-size: 0.85rem; color: #64748b;"><?php echo htmlspecialchars($claim['officer_remarks'] ?: 'Pending officer review'); ?></td>
              </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </div>
    <?php endif; ?>

  <!-- Tab 3: Report Lost Form -->
  <?php elseif ($tab === 'report-lost'): ?>
    <div class="glass-panel" style="padding: 2rem; max-width: 720px; margin: 0 auto; background: #ffffff;">
      <h2 style="font-size: 1.35rem; font-weight: 700; margin-bottom: 0.5rem;">Report a Lost Item</h2>
      <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 1.5rem;">Provide item details to help officers and our matching algorithm locate your lost property.</p>

      <form action="student-dashboard.php" method="POST" enctype="multipart/form-data">
        <input type="hidden" name="action" value="report_lost">
        <div class="form-group">
          <label class="form-label">Item Title *</label>
          <input type="text" name="title" class="form-control" placeholder="e.g. MacBook Pro 14 Space Gray" required>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="form-label">Category *</label>
            <select name="category_id" class="form-control" required>
              <option value="">Select Category</option>
              <?php foreach ($categories as $c): ?><option value="<?php echo $c['id']; ?>"><?php echo htmlspecialchars($c['name']); ?></option><?php endforeach; ?>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Date Lost *</label>
            <input type="date" name="date_lost" class="form-control" value="<?php echo date('Y-m-d'); ?>" required>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="form-label">Campus Zone *</label>
            <select name="campus_zone_id" class="form-control" required>
              <option value="">Select Location</option>
              <?php foreach ($zones as $z): ?><option value="<?php echo $z['id']; ?>"><?php echo htmlspecialchars($z['name']); ?></option><?php endforeach; ?>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Contact Phone Number *</label>
            <input type="text" name="contact_number" class="form-control" value="<?php echo htmlspecialchars($user['phone']); ?>" required>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="form-label">Brand</label>
            <input type="text" name="brand" class="form-control" placeholder="e.g. Apple, Fossil">
          </div>
          <div class="form-group">
            <label class="form-label">Primary Color</label>
            <input type="text" name="primary_color" class="form-control" placeholder="e.g. Space Gray, Black">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Detailed Description *</label>
          <textarea name="description" class="form-control" rows="3" placeholder="Distinctive stickers, scratches, case details..." required></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Upload Photo (Optional)</label>
          <input type="file" name="image" class="form-control" accept="image/*">
        </div>

        <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">Submit Lost Item Report</button>
      </form>
    </div>

  <!-- Tab 4: Report Found Form -->
  <?php elseif ($tab === 'report-found'): ?>
    <div class="glass-panel" style="padding: 2rem; max-width: 720px; margin: 0 auto; background: #ffffff;">
      <h2 style="font-size: 1.35rem; font-weight: 700; margin-bottom: 0.5rem;">Report a Found Item</h2>
      <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 1.5rem;">Turned in property will be checked into physical campus locker storage by an Officer.</p>

      <form action="student-dashboard.php" method="POST" enctype="multipart/form-data">
        <input type="hidden" name="action" value="report_found">
        <div class="form-group">
          <label class="form-label">Found Item Title *</label>
          <input type="text" name="title" class="form-control" placeholder="e.g. Fossil Leather Wallet" required>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="form-label">Category *</label>
            <select name="category_id" class="form-control" required>
              <option value="">Select Category</option>
              <?php foreach ($categories as $c): ?><option value="<?php echo $c['id']; ?>"><?php echo htmlspecialchars($c['name']); ?></option><?php endforeach; ?>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Date Found *</label>
            <input type="date" name="date_found" class="form-control" value="<?php echo date('Y-m-d'); ?>" required>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="form-label">Recovery Campus Zone *</label>
            <select name="campus_zone_id" class="form-control" required>
              <option value="">Select Location</option>
              <?php foreach ($zones as $z): ?><option value="<?php echo $z['id']; ?>"><?php echo htmlspecialchars($z['name']); ?></option><?php endforeach; ?>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Storage Locker ID (Officer Use)</label>
            <input type="text" name="locker_id" class="form-control" placeholder="e.g. LOCKER-A04">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Sensitive Visual Markers (Officer Only)</label>
          <textarea name="visual_markers" class="form-control" rows="2" placeholder="Hidden from public search!"></textarea>
        </div>

        <div class="form-group" style="margin-top: 1rem;">
          <label class="form-label">Upload Photo (Optional)</label>
          <input type="file" name="image" class="form-control" accept="image/*">
        </div>

        <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">Submit Found Item Report</button>
      </form>
    </div>
  <?php endif; ?>
</div>

<?php require_once __DIR__ . '/include/footer.php'; ?>
