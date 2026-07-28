<?php
require_once __DIR__ . '/include/dbConfig.php';

$page_title = 'Home Inventory Search';

// Fetch Categories & Campus Zones
$categories = $pdo->query("SELECT * FROM categories ORDER BY name ASC")->fetchAll();
$zones = $pdo->query("SELECT * FROM campus_zones ORDER BY name ASC")->fetchAll();

// Build Composable Search Query
$q = $_GET['q'] ?? '';
$type = $_GET['type'] ?? 'all';
$category_id = $_GET['category_id'] ?? '';
$zone_id = $_GET['zone_id'] ?? '';
$color = $_GET['color'] ?? '';
$brand = $_GET['brand'] ?? '';

$user = current_user();
$is_officer_or_admin = $user && in_array($user['role'], ['officer', 'admin']);

$items = [];

// Search Lost Items
if ($type === 'all' || $type === 'lost') {
    $sql = "
        SELECT l.*, c.name as category_name, z.name as zone_name, u.name as reporter_name, 'lost' as item_type
        FROM lost_items l
        JOIN categories c ON l.category_id = c.id
        JOIN campus_zones z ON l.campus_zone_id = z.id
        JOIN users u ON l.user_id = u.id
        WHERE 1=1
    ";
    $params = [];
    if ($q) { $sql .= " AND (l.title LIKE ? OR l.description LIKE ? OR l.brand LIKE ?)"; $params[] = "%$q%"; $params[] = "%$q%"; $params[] = "%$q%"; }
    if ($category_id) { $sql .= " AND l.category_id = ?"; $params[] = $category_id; }
    if ($zone_id) { $sql .= " AND l.campus_zone_id = ?"; $params[] = $zone_id; }
    if ($color) { $sql .= " AND l.primary_color LIKE ?"; $params[] = "%$color%"; }
    if ($brand) { $sql .= " AND l.brand LIKE ?"; $params[] = "%$brand%"; }

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $items = array_merge($items, $stmt->fetchAll());
}

// Search Found Items
if ($type === 'all' || $type === 'found') {
    $sql = "
        SELECT f.*, c.name as category_name, z.name as zone_name, u.name as reporter_name, 'found' as item_type
        FROM found_items f
        JOIN categories c ON f.category_id = c.id
        JOIN campus_zones z ON f.campus_zone_id = z.id
        JOIN users u ON f.user_id = u.id
        WHERE 1=1
    ";
    $params = [];
    if ($q) { $sql .= " AND (f.title LIKE ? OR f.brand LIKE ? OR f.location_details LIKE ?)"; $params[] = "%$q%"; $params[] = "%$q%"; $params[] = "%$q%"; }
    if ($category_id) { $sql .= " AND f.category_id = ?"; $params[] = $category_id; }
    if ($zone_id) { $sql .= " AND f.campus_zone_id = ?"; $params[] = $zone_id; }
    if ($color) { $sql .= " AND f.primary_color LIKE ?"; $params[] = "%$color%"; }
    if ($brand) { $sql .= " AND l.brand LIKE ?"; $params[] = "%$brand%"; }

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $found_list = $stmt->fetchAll();

    if (!$is_officer_or_admin) {
        foreach ($found_list as &$fi) {
            unset($fi['locker_id'], $fi['visual_markers']);
        }
    }
    $items = array_merge($items, $found_list);
}

// Sort items by created_at DESC
usort($items, function($a, $b) {
    return strtotime($b['created_at']) - strtotime($a['created_at']);
});

require_once __DIR__ . '/include/header.php';
?>

<div class="main-content">
  <!-- Ticker Banner -->
  <div class="glass-card" style="background: #eff6ff; border: 1px solid #bfdbfe; display: flex; align-items: center; gap: 0.85rem; padding: 0.75rem 1.25rem; margin-bottom: 2rem;">
    <span style="font-size: 1.2rem;">🔔</span>
    <div style="font-size: 0.875rem; color: #1e40af; font-weight: 500;">
      <strong>Campus Announcement:</strong> High-value electronics recovered near Science & Innovation Lab. Please submit claims with valid proof of purchase or serial numbers.
    </div>
  </div>

  <!-- Hero Section -->
  <div class="glass-panel" style="padding: 3.5rem 2rem; text-align: center; background: linear-gradient(135deg, #ffffff 0%, #eff6ff 100%); border: 1px solid #dbeafe; margin-bottom: 2.5rem;">
    <div style="max-width: 780px; margin: 0 auto;">
      <span style="display: inline-block; background: #dbeafe; color: #1e40af; font-size: 0.8rem; font-weight: 800; padding: 5px 14px; border-radius: 999px; margin-bottom: 1rem;">
        ✨ Official Institutional Lost & Found Platform
      </span>

      <h1 style="font-size: 2.6rem; font-weight: 800; margin-bottom: 1rem; color: #0f172a; line-height: 1.2;">
        Report, Search & Recover Campus Property Fast
      </h1>
      <p style="color: #475569; font-size: 1.05rem; margin-bottom: 2.25rem;">
        Transparent chain of custody and automated multi-factor item matching across university grounds.
      </p>

      <!-- Global Search Form -->
      <form action="index.php" method="GET" style="display: flex; gap: 0.5rem; background: #ffffff; padding: 0.65rem; border-radius: var(--radius-lg); border: 2px solid #2563eb; box-shadow: 0 8px 24px rgba(37, 99, 235, 0.15);">
        <input 
          type="text" 
          name="q" 
          class="form-control" 
          placeholder="Search found inventory (e.g., MacBook, Fossil Wallet, Sony Headphones, TI-84 Calculator)..." 
          value="<?php echo htmlspecialchars($q); ?>" 
          style="border: none; background: transparent; font-size: 1rem;"
        >
        <button type="submit" class="btn btn-primary" style="padding: 0.75rem 1.75rem;">Search Inventory</button>
      </form>

      <div style="display: flex; justify-content: center; gap: 1rem; margin-top: 2rem; flex-wrap: wrap;">
        <a href="student-dashboard.php?tab=report-lost" class="btn btn-primary">Report a Lost Item</a>
        <a href="student-dashboard.php?tab=report-found" class="btn btn-secondary">Report a Found Item</a>
      </div>
    </div>
  </div>

  <!-- Composable Inventory Filters -->
  <div class="glass-panel" style="padding: 1.75rem; background: #ffffff; margin-bottom: 2.5rem;">
    <form action="index.php" method="GET">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 0.5rem;">
        <h3 style="font-size: 1.15rem; font-weight: 700; color: #1e293b;">🔍 Composable Inventory Filters</h3>
        <a href="index.php" class="btn btn-secondary btn-sm">Reset Filters</a>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem;">
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label">Item Type</label>
          <select name="type" class="form-control">
            <option value="all" <?php echo $type==='all'?'selected':''; ?>>All Items (Lost & Found)</option>
            <option value="found" <?php echo $type==='found'?'selected':''; ?>>Found Inventory Only</option>
            <option value="lost" <?php echo $type==='lost'?'selected':''; ?>>Lost Reports Only</option>
          </select>
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label">Category</label>
          <select name="category_id" class="form-control">
            <option value="">All Categories</option>
            <?php foreach ($categories as $cat): ?>
              <option value="<?php echo $cat['id']; ?>" <?php echo $category_id==$cat['id']?'selected':''; ?>><?php echo htmlspecialchars($cat['name']); ?></option>
            <?php endforeach; ?>
          </select>
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label">Campus Zone</label>
          <select name="zone_id" class="form-control">
            <option value="">All Campus Zones</option>
            <?php foreach ($zones as $zone): ?>
              <option value="<?php echo $zone['id']; ?>" <?php echo $zone_id==$zone['id']?'selected':''; ?>><?php echo htmlspecialchars($zone['name']); ?> (<?php echo $zone['building_code']; ?>)</option>
            <?php endforeach; ?>
          </select>
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label">Primary Color</label>
          <input type="text" name="color" class="form-control" placeholder="e.g. Space Gray, Black" value="<?php echo htmlspecialchars($color); ?>">
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label">Brand</label>
          <input type="text" name="brand" class="form-control" placeholder="e.g. Apple, Fossil, Sony" value="<?php echo htmlspecialchars($brand); ?>">
        </div>
      </div>

      <div style="margin-top: 1.25rem; text-align: right;">
        <button type="submit" class="btn btn-primary btn-sm">Apply Filters</button>
      </div>
    </form>
  </div>

  <!-- Active Campus Inventory Grid -->
  <div style="margin-bottom: 3rem;">
    <div style="margin-bottom: 1.25rem;">
      <h2 style="font-size: 1.45rem; font-weight: 800; color: #0f172a;">📦 Active Campus Inventory (<?php echo count($items); ?> Items)</h2>
      <p style="font-size: 0.85rem; color: #64748b; margin-top: 0.2rem;">Live catalog with high-resolution photos. Storage locker IDs hidden from public view.</p>
    </div>

    <?php if (empty($items)): ?>
      <div class="glass-panel" style="padding: 3.5rem; text-align: center; color: #64748b; background: #ffffff;">
        <p style="font-size: 1.1rem; margin-bottom: 0.75rem; font-weight: 600;">No items match your filter criteria.</p>
        <a href="index.php" class="btn btn-secondary btn-sm">Clear Search Filters</a>
      </div>
    <?php else: ?>
      <div class="grid-cards">
        <?php foreach ($items as $item): ?>
          <div class="glass-card" style="display: flex; flex-direction: column; height: 100%; background: #ffffff; border: 1px solid #e2e8f0;">
            <!-- Image Container with robust onerror fallback -->
            <div style="height: 170px; border-radius: 10px; overflow: hidden; background: #f8fafc; display: flex; align-items: center; justify-content: center; position: relative; margin-bottom: 1rem;">
              <?php if (!empty($item['image_url'])): ?>
                <img src="<?php echo htmlspecialchars($item['image_url']); ?>" alt="<?php echo htmlspecialchars($item['title']); ?>" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.onerror=null; this.src='images/icons/logo.jpg';">
              <?php else: ?>
                <img src="images/icons/logo.jpg" alt="TrackNFind Item" style="width: 100%; height: 100%; object-fit: contain; padding: 1rem; background: #f8fafc;">
              <?php endif; ?>

              <div style="position: absolute; top: 10px; left: 10px; z-index: 2;">
                <span style="background: <?php echo $item['item_type']==='found'?'#0284c7':'#ef4444'; ?>; color: #fff; font-size: 10px; font-weight: 800; padding: 3px 9px; border-radius: 6px; text-transform: uppercase;">
                  <?php echo strtoupper($item['item_type']); ?> ITEM
                </span>
              </div>

              <div style="position: absolute; top: 10px; right: 10px; z-index: 2;">
                <span class="badge badge-<?php echo strtolower($item['status']); ?>">● <?php echo ucfirst($item['status']); ?></span>
              </div>
            </div>

            <!-- Item Title -->
            <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.4rem; color: #0f172a;"><?php echo htmlspecialchars($item['title']); ?></h3>

            <div style="font-size: 0.8rem; color: #64748b; display: flex; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 0.75rem;">
              <span>🏷️ <?php echo htmlspecialchars($item['category_name']); ?></span>
              <span>📍 <?php echo htmlspecialchars($item['zone_name']); ?></span>
              <span>📅 <?php echo $item['item_type']==='found'?$item['date_found']:$item['date_lost']; ?></span>
            </div>

            <?php if (!empty($item['brand']) || !empty($item['primary_color'])): ?>
              <div style="font-size: 0.78rem; color: #475569; margin-bottom: 0.75rem; background: #f1f5f9; padding: 0.4rem 0.65rem; border-radius: 6px;">
                <?php if ($item['brand']): ?><span><strong>Brand:</strong> <?php echo htmlspecialchars($item['brand']); ?> </span><?php endif; ?>
                <?php if ($item['primary_color']): ?><span>• <strong>Color:</strong> <?php echo htmlspecialchars($item['primary_color']); ?></span><?php endif; ?>
              </div>
            <?php endif; ?>

            <p style="font-size: 0.825rem; color: #475569; margin-bottom: 1rem; flex: 1; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
              <?php echo htmlspecialchars($item['description'] ?? ''); ?>
            </p>

            <div style="display: flex; gap: 0.5rem; margin-top: auto; padding-top: 0.75rem; border-top: 1px solid #f1f5f9;">
              <a href="item-details.php?type=<?php echo $item['item_type']; ?>&id=<?php echo $item['id']; ?>" class="btn btn-secondary btn-sm" style="flex: 1;">👁️ View Details</a>
              <?php if ($item['item_type']==='found' && in_array($item['status'], ['available', 'verified'])): ?>
                <a href="item-details.php?type=found&id=<?php echo $item['id']; ?>#claim-form" class="btn btn-primary btn-sm" style="flex: 1;">Claim Property</a>
              <?php endif; ?>
            </div>
          </div>
        <?php endforeach; ?>
      </div>
    <?php endif; ?>
  </div>
</div>

<?php require_once __DIR__ . '/include/footer.php'; ?>
