<?php
require_once __DIR__ . '/config/db.php';
requireRole(['officer', 'admin']);

$currentUser = getCurrentUser();
$db = getDBConnection();
$msgSuccess = '';
$msgError = '';

// Handle New Item Post by Officer
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'log_new_item') {
    $title = trim($_POST['title'] ?? '');
    $category = $_POST['category'] ?? 'Electronics';
    $type = $_POST['type'] ?? 'found';
    $location = trim($_POST['location'] ?? '');
    $dateEvent = $_POST['date_event'] ?? date('Y-m-d');
    $description = trim($_POST['description'] ?? '');
    $imageUrl = trim($_POST['image_url'] ?? '');

    if (empty($imageUrl)) {
        $imageUrl = 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80';
    }

    if (!empty($title) && !empty($location) && !empty($description)) {
        $itemCode = 'item-' . rand(100, 999);
        if ($db) {
            try {
                $stmt = $db->prepare("INSERT INTO items (item_code, title, category, type, location, date_event, status, image_url, description, reported_by) VALUES (?, ?, ?, ?, ?, ?, 'Unclaimed', ?, ?, ?)");
                $stmt->execute([$itemCode, $title, $category, $type, $location, $dateEvent, $imageUrl, $description, $currentUser['id']]);
                logAuditAction("New Item Logged: {$title} ({$itemCode})", 'officer');
                $msgSuccess = "Item '{$title}' successfully published to catalog under ID: {$itemCode}!";
            } catch (Exception $e) {
                $msgError = "Error saving item: " . $e->getMessage();
            }
        } else {
            $msgSuccess = "Item '{$title}' logged successfully in demo session mode!";
        }
    } else {
        $msgError = "Please complete all required fields for the new item.";
    }
}

// Handle Claim Review Action (Approve / Reject)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'review_claim') {
    $claimId = intval($_POST['claim_id'] ?? 0);
    $newStatus = $_POST['claim_status'] ?? 'pending';

    if ($claimId > 0 && in_array($newStatus, ['approved', 'rejected'])) {
        if ($db) {
            try {
                $stmt = $db->prepare("UPDATE claims SET status = ? WHERE id = ?");
                $stmt->execute([$newStatus, $claimId]);

                if ($newStatus === 'approved') {
                    // Update item status to Claimed
                    $db->exec("UPDATE items SET status = 'Claimed' WHERE id = (SELECT item_id FROM claims WHERE id = {$claimId})");
                }

                logAuditAction("Claim #{$claimId} marked as " . strtoupper($newStatus), 'officer');
                $msgSuccess = "Claim Application #{$claimId} updated to: " . strtoupper($newStatus) . "!";
            } catch (Exception $e) {
                $msgError = "Failed to update claim: " . $e->getMessage();
            }
        } else {
            $msgSuccess = "Claim status updated to " . strtoupper($newStatus) . " in demo session mode.";
        }
    }
}

// Fetch Pending Claims
$claims = [];
$recentItems = [];

if ($db) {
    try {
        $claims = $db->query("SELECT c.*, i.title as item_title, i.item_code, u.full_name as student_name, u.email as student_email FROM claims c JOIN items i ON c.item_id = i.id JOIN users u ON c.user_id = u.id ORDER BY c.submitted_at DESC")->fetchAll();
        $recentItems = $db->query("SELECT * FROM items ORDER BY created_at DESC LIMIT 6")->fetchAll();
    } catch (Exception $e) {
        // Fallback
    }
}

if (empty($claims)) {
    $claims = [
        [
            'id' => 1,
            'item_title' => 'Apple MacBook Pro 14" M2 (Space Gray)',
            'item_code' => 'item-101',
            'student_name' => 'Alex Student',
            'student_email' => 'alex.student@tracknfind.com',
            'claim_notes' => 'This is my laptop left during my study session on desk 24.',
            'proof_details' => 'Serial ending in 8921. Desktop wallpaper is a mountain landscape.',
            'status' => 'pending',
            'submitted_at' => '2026-07-21 14:30'
        ]
    ];
}

include __DIR__ . '/includes/header.php';
?>

<div style="background: var(--bg-main); min-height: calc(100vh - 4.5rem); padding: 2.5rem 0;">
    <div class="container">
        <!-- Banner Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
            <div>
                <span class="badge badge-found" style="margin-bottom: 0.5rem;">
                    LOST & FOUND OFFICER HUB
                </span>
                <h1 style="font-size: 2rem; font-weight: 800;">Campus Officer Dashboard</h1>
                <p style="color: var(--text-muted);">Manage found asset logs, verify ownership claims, and process item recoveries.</p>
            </div>
            <a href="index.php" class="btn btn-secondary">
                ← View Public Catalog
            </a>
        </div>

        <?php if (!empty($msgSuccess)): ?>
            <div class="alert-banner alert-banner-success">
                <strong>✅ Officer Action Success!</strong>
                <p><?= sanitize($msgSuccess) ?></p>
            </div>
        <?php endif; ?>

        <?php if (!empty($msgError)): ?>
            <div class="alert-banner alert-banner-error">
                <strong>⚠️ Officer Action Error</strong>
                <p><?= sanitize($msgError) ?></p>
            </div>
        <?php endif; ?>

        <!-- Grid Layout: Log Item Form + Pending Claims -->
        <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 2rem; align-items: start;">
            
            <!-- Log New Item Form -->
            <div style="background: white; padding: 1.75rem; border-radius: var(--radius-lg); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);">
                <h3 style="font-size: 1.2rem; font-weight: 700; margin-bottom: 1.25rem;">📦 Log New Found or Missing Item</h3>
                
                <form method="POST" action="officer_dashboard.php">
                    <input type="hidden" name="action" value="log_new_item">

                    <div class="form-group">
                        <label class="form-label">Item Title</label>
                        <input type="text" name="title" class="form-input" placeholder="e.g. Sony Wireless Headphones" required>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div class="form-group">
                            <label class="form-label">Category</label>
                            <select name="category" class="form-input">
                                <option value="Electronics">Electronics</option>
                                <option value="IDs & Cards">IDs & Cards</option>
                                <option value="Accessories">Accessories</option>
                                <option value="Personal Belongings">Personal Belongings</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Type</label>
                            <select name="type" class="form-input">
                                <option value="found">Found Item</option>
                                <option value="lost">Lost Report</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Location Found / Lost</label>
                        <input type="text" name="location" class="form-input" placeholder="e.g. Library 2nd floor desk 12" required>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Event Date</label>
                        <input type="date" name="date_event" class="form-input" value="<?= date('Y-m-d') ?>" required>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Description & Physical Details</label>
                        <textarea name="description" class="form-input" rows="3" placeholder="Condition, sleeve case, color, unique marks..." required></textarea>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Photo Image URL (Optional)</label>
                        <input type="url" name="image_url" class="form-input" placeholder="https://images.unsplash.com/...">
                    </div>

                    <button type="submit" class="btn btn-emerald btn-full">
                        ➕ Register & Publish Item
                    </button>
                </form>
            </div>

            <!-- Review Student Claims -->
            <div style="background: white; padding: 1.75rem; border-radius: var(--radius-lg); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);">
                <h3 style="font-size: 1.2rem; font-weight: 700; margin-bottom: 1.25rem;">🔍 Pending Student Ownership Claims</h3>

                <?php if (empty($claims)): ?>
                    <p style="color: var(--text-muted);">No student claim applications currently pending review.</p>
                <?php else: ?>
                    <div style="display: flex; flex-direction: column; gap: 1.25rem;">
                        <?php foreach ($claims as $claim): ?>
                            <div style="border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem; background: #fafafa;">
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                                    <div>
                                        <h4 style="font-size: 1rem; font-weight: 700;"><?= sanitize($claim['item_title']) ?></h4>
                                        <span style="font-size: 0.8rem; color: var(--text-muted);">Claimant: <strong><?= sanitize($claim['student_name']) ?></strong> (<?= sanitize($claim['student_email']) ?>)</span>
                                    </div>
                                    <span class="badge badge-<?= ($claim['status'] === 'approved') ? 'found' : (($claim['status'] === 'rejected') ? 'lost' : 'admin') ?>">
                                        <?= strtoupper(sanitize($claim['status'])) ?>
                                    </span>
                                </div>

                                <div style="font-size: 0.88rem; color: var(--text-main); margin-bottom: 0.5rem; background: white; padding: 0.75rem; border-radius: var(--radius-sm); border: 1px solid #e2e8f0;">
                                    <strong>Claim Notes:</strong> <?= sanitize($claim['claim_notes']) ?><br>
                                    <?php if (!empty($claim['proof_details'])): ?>
                                        <strong style="color: var(--primary);">Proof Provided:</strong> <?= sanitize($claim['proof_details']) ?>
                                    <?php endif; ?>
                                </div>

                                <?php if ($claim['status'] === 'pending'): ?>
                                    <form method="POST" action="officer_dashboard.php" style="display: flex; gap: 0.5rem; margin-top: 0.75rem;">
                                        <input type="hidden" name="action" value="review_claim">
                                        <input type="hidden" name="claim_id" value="<?= intval($claim['id']) ?>">
                                        
                                        <button type="submit" name="claim_status" value="approved" class="btn btn-emerald btn-sm">
                                            ✓ Approve & Hand Over
                                        </button>
                                        <button type="submit" name="claim_status" value="rejected" class="btn btn-secondary btn-sm" style="color: var(--danger); border-color: #fecaca;">
                                            ✕ Reject Claim
                                        </button>
                                    </form>
                                <?php endif; ?>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </div>

        </div>
    </div>
</div>

<?php include __DIR__ . '/includes/footer.php'; ?>
