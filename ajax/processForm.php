<?php
// AJAX Form Processor Handler (ajax/processForm.php)
require_once __DIR__ . '/../include/dbConfig.php';

header('Content-Type: application/json');

$action = $_POST['action'] ?? '';

if ($action === 'ping') {
    echo json_encode(['status' => 'success', 'message' => 'TrackNFind API live']);
    exit;
}

echo json_encode(['status' => 'error', 'message' => 'Invalid action']);
