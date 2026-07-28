<?php
// AJAX Data Fetcher Handler (ajax/fetchData.php)
require_once __DIR__ . '/../include/dbConfig.php';

header('Content-Type: application/json');

$action = $_GET['action'] ?? '';

if ($action === 'getCategories') {
    $categories = $pdo->query("SELECT * FROM categories ORDER BY name ASC")->fetchAll();
    echo json_encode(['status' => 'success', 'data' => $categories]);
    exit;
}

if ($action === 'getZones') {
    $zones = $pdo->query("SELECT * FROM campus_zones ORDER BY name ASC")->fetchAll();
    echo json_encode(['status' => 'success', 'data' => $zones]);
    exit;
}

echo json_encode(['status' => 'error', 'message' => 'Invalid action']);
