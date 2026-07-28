<?php
require_once __DIR__ . '/include/dbConfig.php';
require_role(['admin']);

$lost = $pdo->query("
    SELECT l.*, c.name as category_name, z.name as zone_name
    FROM lost_items l
    LEFT JOIN categories c ON l.category_id = c.id
    LEFT JOIN campus_zones z ON l.campus_zone_id = z.id
    ORDER BY l.created_at DESC
")->fetchAll();

$found = $pdo->query("
    SELECT f.*, c.name as category_name, z.name as zone_name
    FROM found_items f
    LEFT JOIN categories c ON f.category_id = c.id
    LEFT JOIN campus_zones z ON f.campus_zone_id = z.id
    ORDER BY f.created_at DESC
")->fetchAll();

$total_lost = count($lost);
$total_found = count($found);
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>TrackNFind Official Report</title>
  <style>
    body { font-family: sans-serif; margin: 30px; color: #1e293b; }
    .header { background: #0f172a; color: #ffffff; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .header h1 { margin: 0; font-size: 24px; }
    .header p { margin: 5px 0 0 0; color: #94a3b8; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
    th { background: #f1f5f9; }
    @media print {
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 15px;">
    <button onclick="window.print()" style="padding: 8px 16px; background: #2563eb; color: #fff; border: none; border-radius: 6px; cursor: pointer;">🖨️ Print / Save to PDF</button>
  </div>

  <div class="header">
    <h1>TrackNFind | Official Institutional Report</h1>
    <p>Generated on <?php echo date('F d, Y \a\t H:i:s'); ?> | Executive Operational Inventory Summary</p>
  </div>

  <div style="display: flex; gap: 20px; margin-bottom: 20px;">
    <div><strong>Total Lost Reports:</strong> <?php echo $total_lost; ?></div>
    <div><strong>Total Found Reports:</strong> <?php echo $total_found; ?></div>
  </div>

  <h2>Lost Items Inventory</h2>
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Title</th>
        <th>Category</th>
        <th>Zone</th>
        <th>Date Lost</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      <?php foreach ($lost as $item): ?>
        <tr>
          <td>#L-<?php echo $item['id']; ?></td>
          <td><?php echo htmlspecialchars($item['title']); ?></td>
          <td><?php echo htmlspecialchars($item['category_name']); ?></td>
          <td><?php echo htmlspecialchars($item['zone_name']); ?></td>
          <td><?php echo $item['date_lost']; ?></td>
          <td><?php echo strtoupper($item['status']); ?></td>
        </tr>
      <?php endforeach; ?>
    </tbody>
  </table>

  <h2 style="margin-top: 30px;">Found Items Inventory</h2>
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Title</th>
        <th>Category</th>
        <th>Zone</th>
        <th>Locker ID</th>
        <th>Date Found</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      <?php foreach ($found as $item): ?>
        <tr>
          <td>#F-<?php echo $item['id']; ?></td>
          <td><?php echo htmlspecialchars($item['title']); ?></td>
          <td><?php echo htmlspecialchars($item['category_name']); ?></td>
          <td><?php echo htmlspecialchars($item['zone_name']); ?></td>
          <td><?php echo htmlspecialchars($item['locker_id'] ?: 'N/A'); ?></td>
          <td><?php echo $item['date_found']; ?></td>
          <td><?php echo strtoupper($item['status']); ?></td>
        </tr>
      <?php endforeach; ?>
    </tbody>
  </table>
</body>
</html>
