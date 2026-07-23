<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/db.php';

if (!isLoggedIn()) {
    echo json_encode(['success' => false, 'message' => 'User must be authenticated']);
    exit;
}

$user = getCurrentUser();
$itemId = intval($_POST['item_id'] ?? 0);
$claimNotes = trim($_POST['claim_notes'] ?? '');
$proofDetails = trim($_POST['proof_details'] ?? '');

if ($itemId <= 0 || empty($claimNotes)) {
    echo json_encode(['success' => false, 'message' => 'Missing required item ID or claim description']);
    exit;
}

$db = getDBConnection();
if ($db) {
    try {
        $stmt = $db->prepare("INSERT INTO claims (item_id, user_id, claim_notes, proof_details, status) VALUES (?, ?, ?, ?, 'pending')");
        $stmt->execute([$itemId, $user['id'], $claimNotes, $proofDetails]);
        logAuditAction("API Claim Submitted for Item #{$itemId}", $user['role']);
        echo json_encode(['success' => true, 'message' => 'Claim application submitted successfully']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => true, 'message' => 'Claim submitted in demo mode']);
}
