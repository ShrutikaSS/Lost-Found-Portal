<?php
require_once __DIR__ . '/config/db.php';
requireLogin();

$currentUser = getCurrentUser();
$db = getDBConnection();

$msgSuccess = '';
$msgError = '';

// Handle Report Lost Item by Student
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'report_lost_item') {
    $title = trim($_POST['title'] ?? '');
    $category = $_POST['category'] ?? 'Electronics';
    $location = trim($_POST['location'] ?? '');
    $dateEvent = $_POST['date_event'] ?? date('Y-m-d');
    $description = trim($_POST['description'] ?? '');

    if (!empty($title) && !empty($location) && !empty($description)) {
        $itemCode = 'lost-' . rand(100, 999);
        if ($db) {
            try {
                $stmt = $db->prepare("INSERT INTO items (item_code, title, category, type, location, date_event, status, image_url, description, reported_by) VALUES (?, ?, ?, 'lost', ?, ?, 'Searching', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80', ?, ?)");
                $stmt->execute([$itemCode, $title, $category, $location, $dateEvent, $description, $currentUser['id']]);
                logAuditAction("Student Reported Missing Item: {$title}", 'student');
                $msgSuccess = "Your missing item report for '{$title}' has been broadcast to campus security!";
            } catch (Exception $e) {
                $msgError = "Error submitting report: " . $e->getMessage();
            }
        } else {
            $msgSuccess = "Missing item report logged in demo mode!";
        }
    } else {
        $msgError = "Please fill in all required fields to report a lost item.";
    }
}

// Fetch user's claim applications
$myClaims = [];
$myReportedItems = [];

if ($db) {
    try {
        $stmtClaims = $db->prepare("SELECT c.*, i.title as item_title, i.location, i.category, i.image_url FROM claims c JOIN items i ON c.item_id = i.id WHERE c.user_id = ? ORDER BY c.submitted_at DESC");
        $stmtClaims->execute([$currentUser['id']]);
        $myClaims = $stmtClaims->fetchAll();

        $stmtReports = $db->prepare("SELECT * FROM items WHERE reported_by = ? ORDER BY created_at DESC");
        $stmtReports->execute([$currentUser['id']]);
        $myReportedItems = $stmtReports->fetchAll();
    } catch (Exception $e) {
        // Fallback
    }
}

if (empty($myClaims)) {
    $myClaims = [
        [
            'id' => 1,
            'item_title' => 'Apple MacBook Pro 14" M2 (Space Gray)',
            'location' => 'Central Library 2nd Floor',
            'category' => 'Electronics',
            'claim_notes' => 'Left during study session on desk 24.',
            'proof_details' => 'Serial ending in 8921.',
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
                <span class="badge badge-lost" style="margin-bottom: 0.5rem;">
                    STUDENT PORTAL DASHBOARD
                </span>
                <h1 style="font-size: 2rem; font-weight: 800;">Welcome, <?= sanitize($currentUser['full_name'] ?? $currentUser['username']) ?></h1>
                <p style="color: var(--text-muted);">Track your active item claims, view ownership verification status, and report lost items.</p>
            </div>
            <button class="btn btn-primary" onclick="document.getElementById('report_lost_modal').style.display = 'flex'">
                ➕ Report a Lost Item
            </button>
        </div>

        <?php if (!empty($msgSuccess)): ?>
            <div class="alert-banner alert-banner-success">
                <strong>✅ Action Completed!</strong>
                <p><?= sanitize($msgSuccess) ?></p>
            </div>
        <?php endif; ?>

        <?php if (!empty($msgError)): ?>
            <div class="alert-banner alert-banner-error">
                <strong>⚠️ Form Error</strong>
                <p><?= sanitize($msgError) ?></p>
            </div>
        <?php endif; ?>

        <!-- Student Claims & Reports -->
        <div style="display: grid; grid-template-columns: 1fr; gap: 2rem;">
            <!-- Claims Status Tracker -->
            <div style="background: white; padding: 1.75rem; border-radius: var(--radius-lg); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);">
                <h3 style="font-size: 1.2rem; font-weight: 700; margin-bottom: 1.25rem;">📋 My Submitted Item Claims</h3>

                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    <?php foreach ($myClaims as $claim): ?>
                        <div style="border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem; background: #fafafa; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
                            <div>
                                <h4 style="font-size: 1.05rem; font-weight: 700; color: var(--text-main);"><?= sanitize($claim['item_title']) ?></h4>
                                <p style="font-size: 0.85rem; color: var(--text-muted);">
                                    📍 Location: <?= sanitize($claim['location']) ?> | Submitted: <?= sanitize($claim['submitted_at']) ?>
                                </p>
                                <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem;">
                                    Notes: <?= sanitize($claim['claim_notes']) ?>
                                </p>
                            </div>
                            <div>
                                <span class="badge badge-<?= ($claim['status'] === 'approved') ? 'found' : (($claim['status'] === 'rejected') ? 'lost' : 'admin') ?>" style="font-size: 0.85rem; padding: 0.35rem 0.85rem;">
                                    Status: <?= strtoupper(sanitize($claim['status'])) ?>
                                </span>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Report Lost Item Modal -->
<div id="report_lost_modal" class="modal-backdrop" style="display: none;">
    <div class="modal-card">
        <div class="modal-header">
            <h3>Report a Missing / Lost Item</h3>
            <button class="modal-close-btn" onclick="document.getElementById('report_lost_modal').style.display = 'none'">&times;</button>
        </div>
        <div class="modal-body">
            <form method="POST" action="student_dashboard.php">
                <input type="hidden" name="action" value="report_lost_item">

                <div class="form-group">
                    <label class="form-label">Item Name / Title</label>
                    <input type="text" name="title" class="form-input" placeholder="e.g. Casio Scientific Calculator" required>
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
                        <label class="form-label">Date Lost</label>
                        <input type="date" name="date_event" class="form-input" value="<?= date('Y-m-d') ?>" required>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Last Known Location</label>
                    <input type="text" name="location" class="form-input" placeholder="e.g. Math Lab Room 104" required>
                </div>

                <div class="form-group">
                    <label class="form-label">Item Description & Identifiers</label>
                    <textarea name="description" class="form-input" rows="3" placeholder="Describe color, scratches, tape name..." required></textarea>
                </div>

                <button type="submit" class="btn btn-primary btn-full">Submit Missing Item Report</button>
            </form>
        </div>
    </div>
</div>

<?php include __DIR__ . '/includes/footer.php'; ?>
