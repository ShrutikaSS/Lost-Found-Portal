<?php
// TrackNFind PHP Audit Logging Service

function log_audit($actor_id, $actor_name, $action, $target_type = null, $target_id = null, $remarks = null) {
    global $pdo;
    try {
        $stmt = $pdo->prepare("
            INSERT INTO audit_logs (actor_id, actor_name, action, target_type, target_id, remarks)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$actor_id, $actor_name, $action, $target_type, $target_id, $remarks]);
    } catch (Exception $e) {
        error_log("Audit log failed: " . $e->getMessage());
    }
}
