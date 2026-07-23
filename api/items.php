<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/db.php';

$type = $_GET['type'] ?? 'found';
$category = $_GET['cat'] ?? 'All';
$q = trim($_GET['q'] ?? '');

$db = getDBConnection();
$items = [];

if ($db) {
    try {
        $sql = "SELECT * FROM items WHERE 1=1";
        $params = [];

        if (!empty($type)) {
            $sql .= " AND type = ?";
            $params[] = $type;
        }

        if ($category !== 'All' && !empty($category)) {
            $sql .= " AND category = ?";
            $params[] = $category;
        }

        if (!empty($q)) {
            $sql .= " AND (title LIKE ? OR description LIKE ? OR location LIKE ?)";
            $params[] = "%{$q}%";
            $params[] = "%{$q}%";
            $params[] = "%{$q}%";
        }

        $sql .= " ORDER BY created_at DESC";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $items = $stmt->fetchAll();
    } catch (Exception $e) {
        $items = [];
    }
}

echo json_encode([
    'success' => true,
    'count' => count($items),
    'items' => $items
]);
