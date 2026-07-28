<?php
require_once __DIR__ . '/include/dbConfig.php';
require_role(['admin']);

header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename=tracknfind_inventory_' . date('Y-m-d') . '.csv');

$output = fopen('php://output', 'w');
fputcsv($output, ['Item Type', 'ID', 'Title', 'Category', 'Campus Zone', 'Date', 'Primary Color', 'Brand', 'Status', 'Reporter Email']);

$lost = $pdo->query("
    SELECT l.*, c.name as category_name, z.name as zone_name, u.email as reporter_email
    FROM lost_items l
    LEFT JOIN categories c ON l.category_id = c.id
    LEFT JOIN campus_zones z ON l.campus_zone_id = z.id
    LEFT JOIN users u ON l.user_id = u.id
    ORDER BY l.created_at DESC
")->fetchAll();

foreach ($lost as $item) {
    fputcsv($output, [
        'Lost',
        'L-' . $item['id'],
        $item['title'],
        $item['category_name'],
        $item['zone_name'],
        $item['date_lost'],
        $item['primary_color'],
        $item['brand'],
        $item['status'],
        $item['reporter_email']
    ]);
}

$found = $pdo->query("
    SELECT f.*, c.name as category_name, z.name as zone_name, u.email as reporter_email
    FROM found_items f
    LEFT JOIN categories c ON f.category_id = c.id
    LEFT JOIN campus_zones z ON f.campus_zone_id = z.id
    LEFT JOIN users u ON f.user_id = u.id
    ORDER BY f.created_at DESC
")->fetchAll();

foreach ($found as $item) {
    fputcsv($output, [
        'Found',
        'F-' . $item['id'],
        $item['title'],
        $item['category_name'],
        $item['zone_name'],
        $item['date_found'],
        $item['primary_color'],
        $item['brand'],
        $item['status'],
        $item['reporter_email']
    ]);
}

fclose($output);
exit;
