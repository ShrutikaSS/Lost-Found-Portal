<?php
require_once __DIR__ . '/config/db.php';

// Handle claim POST submission directly if form submitted
$claimSuccessMsg = '';
$claimErrorMsg = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'submit_claim') {
    requireLogin();
    $user = getCurrentUser();
    $itemId = intval($_POST['item_id'] ?? 0);
    $claimNotes = trim($_POST['claim_notes'] ?? '');
    $proofDetails = trim($_POST['proof_details'] ?? '');

    if ($itemId > 0 && !empty($claimNotes)) {
        $db = getDBConnection();
        if ($db) {
            try {
                $stmt = $db->prepare("INSERT INTO claims (item_id, user_id, claim_notes, proof_details, status) VALUES (?, ?, ?, ?, 'pending')");
                $stmt->execute([$itemId, $user['id'], $claimNotes, $proofDetails]);
                logAuditAction("Claim Submitted for Item #{$itemId}", $user['role']);
                $claimSuccessMsg = "Your claim request for item #{$itemId} has been submitted! An L&F Officer will review it shortly.";
            } catch (Exception $e) {
                $claimErrorMsg = "Error submitting claim: " . $e->getMessage();
            }
        } else {
            $claimSuccessMsg = "Claim request recorded in demo mode! An officer will verify your proof details.";
        }
    } else {
        $claimErrorMsg = "Please provide detailed ownership notes and verification details.";
    }
}

// Search & Filter parameters
$searchQuery = trim($_GET['q'] ?? '');
$activeTab = $_GET['tab'] ?? 'found'; // 'found' or 'lost'
$selectedCat = $_GET['cat'] ?? 'All';

// Fetch items from MySQL database
$items = [];
$db = getDBConnection();

if ($db) {
    try {
        $sql = "SELECT * FROM items WHERE 1=1";
        $params = [];

        if (!empty($activeTab)) {
            $sql .= " AND type = ?";
            $params[] = $activeTab;
        }

        if ($selectedCat !== 'All' && !empty($selectedCat)) {
            $sql .= " AND category = ?";
            $params[] = $selectedCat;
        }

        if (!empty($searchQuery)) {
            $sql .= " AND (title LIKE ? OR description LIKE ? OR location LIKE ?)";
            $params[] = "%{$searchQuery}%";
            $params[] = "%{$searchQuery}%";
            $params[] = "%{$searchQuery}%";
        }

        $sql .= " ORDER BY created_at DESC";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $items = $stmt->fetchAll();
    } catch (Exception $e) {
        $items = [];
    }
}

// Fallback sample data if MySQL is not populated yet
if (empty($items)) {
    $allSample = [
        [
            'id' => 1,
            'item_code' => 'item-101',
            'title' => 'Apple MacBook Pro 14" M2 (Space Gray)',
            'category' => 'Electronics',
            'type' => 'found',
            'location' => 'Central Library - 2nd Floor Quiet Zone',
            'date_event' => '2026-07-20',
            'status' => 'Unclaimed',
            'image_url' => 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
            'description' => 'Found on desk 24 with a dark gray sleeve case. Turned into campus security post.'
        ],
        [
            'id' => 2,
            'item_code' => 'item-102',
            'title' => 'Student ID Card & Dorm Keycard (S. Sharma)',
            'category' => 'IDs & Cards',
            'type' => 'found',
            'location' => 'Student Activity Center Cafe',
            'date_event' => '2026-07-21',
            'status' => 'Unclaimed',
            'image_url' => 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
            'description' => 'Campus Student ID belonging to Computer Science dept. Found near order counter.'
        ],
        [
            'id' => 3,
            'item_code' => 'item-103',
            'title' => 'Sony WH-1000XM4 Noise Canceling Headphones',
            'category' => 'Electronics',
            'type' => 'lost',
            'location' => 'Auditorium Hall B',
            'date_event' => '2026-07-19',
            'status' => 'Searching',
            'image_url' => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
            'description' => 'Black headphones left during morning guest lecture. Small scratch on right ear cup.'
        ],
        [
            'id' => 4,
            'item_code' => 'item-104',
            'title' => 'Leather Wallet with Driving License',
            'category' => 'Accessories',
            'type' => 'found',
            'location' => 'Science Block - Lab 302',
            'date_event' => '2026-07-18',
            'status' => 'Unclaimed',
            'image_url' => 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80',
            'description' => 'Brown genuine leather wallet containing driving license and campus gym pass.'
        ]
    ];

    $items = array_filter($allSample, function($i) use ($activeTab, $selectedCat, $searchQuery) {
        if ($i['type'] !== $activeTab) return false;
        if ($selectedCat !== 'All' && $i['category'] !== $selectedCat) return false;
        if (!empty($searchQuery) && stripos($i['title'], $searchQuery) === false && stripos($i['description'], $searchQuery) === false) return false;
        return true;
    });
}

include __DIR__ . '/includes/header.php';
?>

<!-- Hero Banner -->
<section class="hero-section">
    <div class="container hero-content">
        <div style="margin-bottom: 1rem;">
            <img src="tracknfind-logo.jpg" alt="TrackNfind Logo" style="max-height: 90px; width: auto; object-fit: contain;" />
        </div>
        <div class="hero-badge">TRACK IT. FIND IT. GET IT BACK.</div>
        <h1 class="hero-title">Campus Lost & Found Recovery Portal<br><span style="color: var(--primary);">TrackNfind Asset Management</span></h1>
        <p class="hero-subtitle">Search registered found property, verify ownership proof with security officers, or report missing personal items instantaneously.</p>
    </div>
</section>

<div class="container">
    <!-- Feedback Alerts -->
    <?php if (!empty($claimSuccessMsg)): ?>
        <div class="alert-banner alert-banner-success" style="margin-top: 1.5rem;">
            <strong>✅ Claim Submitted!</strong>
            <p><?= sanitize($claimSuccessMsg) ?></p>
        </div>
    <?php endif; ?>

    <?php if (!empty($claimErrorMsg)): ?>
        <div class="alert-banner alert-banner-error" style="margin-top: 1.5rem;">
            <strong>⚠️ Claim Submission Failed</strong>
            <p><?= sanitize($claimErrorMsg) ?></p>
        </div>
    <?php endif; ?>

    <!-- Search & Filter Card -->
    <div class="search-card">
        <!-- Tab Toggle -->
        <div class="tab-toggle">
            <a href="index.php?tab=found&cat=<?= urlencode($selectedCat) ?>" class="tab-button <?= ($activeTab === 'found') ? 'active' : '' ?>">
                📦 Found Items Catalog
            </a>
            <a href="index.php?tab=lost&cat=<?= urlencode($selectedCat) ?>" class="tab-button <?= ($activeTab === 'lost') ? 'active' : '' ?>">
                🚨 Reported Lost Items
            </a>
        </div>

        <form method="GET" action="index.php" class="search-input-group">
            <input type="hidden" name="tab" value="<?= sanitize($activeTab) ?>">
            
            <input 
                type="text" 
                name="q" 
                class="form-input" 
                style="flex: 2; min-width: 250px;" 
                placeholder="Search by keywords (e.g. MacBook, Wallet, Dorm Key...)" 
                value="<?= sanitize($searchQuery) ?>"
            >

            <select name="cat" class="form-input" style="flex: 1; min-width: 180px;" onchange="this.form.submit()">
                <option value="All" <?= ($selectedCat === 'All') ? 'selected' : '' ?>>All Categories</option>
                <option value="Electronics" <?= ($selectedCat === 'Electronics') ? 'selected' : '' ?>>Electronics</option>
                <option value="IDs & Cards" <?= ($selectedCat === 'IDs & Cards') ? 'selected' : '' ?>>IDs & Cards</option>
                <option value="Accessories" <?= ($selectedCat === 'Accessories') ? 'selected' : '' ?>>Accessories</option>
                <option value="Personal Belongings" <?= ($selectedCat === 'Personal Belongings') ? 'selected' : '' ?>>Personal Belongings</option>
            </select>

            <button type="submit" class="btn btn-primary">Search Catalog</button>
        </form>
    </div>

    <!-- Items Grid -->
    <div style="margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between;">
        <h2 style="font-size: 1.5rem; font-weight: 800;">
            <?= ($activeTab === 'found') ? 'Unclaimed Found Items' : 'Active Missing Item Listings' ?>
        </h2>
        <span style="color: var(--text-muted); font-size: 0.9rem;">
            Showing <?= count($items) ?> items
        </span>
    </div>

    <div class="item-grid">
        <?php foreach ($items as $item): ?>
            <div class="item-card">
                <img 
                    src="<?= sanitize($item['image_url'] ?? 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80') ?>" 
                    alt="<?= sanitize($item['title']) ?>" 
                    class="item-image"
                >
                <div class="item-body">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span class="badge badge-<?= sanitize($item['type']) ?>">
                            <?= strtoupper(sanitize($item['type'])) ?>
                        </span>
                        <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">
                            📅 <?= sanitize($item['date_event']) ?>
                        </span>
                    </div>

                    <h3 class="item-title"><?= sanitize($item['title']) ?></h3>

                    <div class="item-meta">
                        <div>📍 <strong>Location:</strong> <?= sanitize($item['location']) ?></div>
                        <div>🏷️ <strong>Category:</strong> <?= sanitize($item['category']) ?></div>
                    </div>

                    <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 1.25rem; flex: 1;">
                        <?= sanitize($item['description']) ?>
                    </p>

                    <?php if ($item['type'] === 'found'): ?>
                        <button 
                            type="button" 
                            class="btn btn-primary btn-full"
                            onclick='openClaimModal(<?= json_encode($item, JSON_HEX_APOS | JSON_HEX_QUOT) ?>)'
                        >
                            Claim This Item
                        </button>
                    <?php else: ?>
                        <a href="login.php" class="btn btn-secondary btn-full">
                            Contact Reporter / Security
                        </a>
                    <?php endif; ?>
                </div>
            </div>
        <?php endforeach; ?>
    </div>
</div>

<!-- How Website Works Section -->
<section class="how-it-works-section">
    <div class="container">
        <div class="section-header">
            <div class="hero-badge" style="margin-bottom: 0.75rem;">SIMPLE 4-STEP RECOVERY</div>
            <h2 class="section-title">How TrackNfind Portal Works</h2>
            <p class="section-subtitle">Our campus lost and found platform connects item finders with rightful owners through verified security workflows.</p>
        </div>

        <div class="steps-grid">
            <div class="step-card">
                <div class="step-badge">1</div>
                <h3>🔍 Search or Report Item</h3>
                <p>Browse live found item listings by category or submit a missing item report with details, pictures, and location information.</p>
            </div>

            <div class="step-card">
                <div class="step-badge">2</div>
                <h3>📝 Submit Claim Proof</h3>
                <p>Click "Claim This Item" on a matching listing to submit unique identifiers, receipt details, or distinctive feature notes.</p>
            </div>

            <div class="step-card">
                <div class="step-badge">3</div>
                <h3>🛡️ Officer Verification</h3>
                <p>Campus L&F Security Officers inspect your claim application, match proof details, and grant official claim approval.</p>
            </div>

            <div class="step-card">
                <div class="step-badge">4</div>
                <h3>🤝 Safe Item Handover</h3>
                <p>Visit the Campus Lost & Found Office with your student/photo ID to pick up your verified belongings safely.</p>
            </div>
        </div>
    </div>
</section>

<!-- Frequently Asked Questions (FAQs) Section -->
<section class="faq-section">
    <div class="container">
        <div class="section-header">
            <div class="hero-badge" style="margin-bottom: 0.75rem;">HELP & KNOWLEDGE BASE</div>
            <h2 class="section-title">Frequently Asked Questions (FAQs)</h2>
            <p class="section-subtitle">Find answers to common questions about reporting items, claiming property, account security, and portal guidelines.</p>
        </div>

        <div class="faq-accordion">
            <div class="faq-item active">
                <button class="faq-question" type="button">
                    <span>❓ How do I report a missing item on campus?</span>
                    <span class="faq-icon">▼</span>
                </button>
                <div class="faq-answer">
                    Sign in to your TrackNfind student account, navigate to "My Dashboard" or click "Report Missing Item", fill in the item category, last known campus location, date, and description. Your listing will immediately post to the catalog.
                </div>
            </div>

            <div class="faq-item">
                <button class="faq-question" type="button">
                    <span>❓ What proof is required to claim a found item?</span>
                    <span class="faq-icon">▼</span>
                </button>
                <div class="faq-answer">
                    To protect belongings from false claims, you must provide unique identifying details (e.g. serial numbers, passcode wallpaper description, contents inside a wallet or bag) or original purchase receipt proof.
                </div>
            </div>

            <div class="faq-item">
                <button class="faq-question" type="button">
                    <span>❓ Who can register an account on TrackNfind?</span>
                    <span class="faq-icon">▼</span>
                </button>
                <div class="faq-answer">
                    Public registration on the portal is exclusively for <strong>Students and Campus Users</strong>. Campus L&F Officers and System Administrators receive pre-authorized credentials directly from Campus Security Administration.
                </div>
            </div>

            <div class="faq-item">
                <button class="faq-question" type="button">
                    <span>❓ How does password security and recovery work?</span>
                    <span class="faq-icon">▼</span>
                </button>
                <div class="faq-answer">
                    Passwords must be at least 8 characters long and contain uppercase, lowercase, numeric, and special characters. During registration, you configure a secret <strong>Security Question & Answer</strong>. If you forget your password, click "Forgot Password?" on the login page to securely reset your credentials.
                </div>
            </div>

            <div class="faq-item">
                <button class="faq-question" type="button">
                    <span>❓ Where is the physical Campus Lost & Found Office?</span>
                    <span class="faq-icon">▼</span>
                </button>
                <div class="faq-answer">
                    The Campus L&F Central Dispatch is located at <strong>Student Activity Center, Building 4, Room 102</strong>. Office hours are Monday through Friday, 8:00 AM to 6:00 PM.
                </div>
            </div>

            <div class="faq-item">
                <button class="faq-question" type="button">
                    <span>❓ How long are unclaimed items held before disposition?</span>
                    <span class="faq-icon">▼</span>
                </button>
                <div class="faq-answer">
                    Found items are retained securely at the L&F office for up to 90 days. High-value electronics and official IDs are archived in vault storage until claimed.
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Claim Ownership Modal -->
<div id="claim_modal" class="modal-backdrop" style="display: none;">
    <div class="modal-card">
        <div class="modal-header">
            <h3>Claim Item Ownership</h3>
            <button class="modal-close-btn" onclick="closeClaimModal()">&times;</button>
        </div>
        <div class="modal-body">
            <form method="POST" action="index.php">
                <input type="hidden" name="action" value="submit_claim">
                <input type="hidden" name="item_id" id="modal_item_id">

                <div style="display: flex; gap: 1rem; margin-bottom: 1rem; background: #f8fafc; padding: 0.75rem; border-radius: var(--radius-md);">
                    <img id="modal_item_img" src="" style="width: 80px; height: 80px; object-fit: cover; border-radius: var(--radius-sm);">
                    <div>
                        <h4 id="modal_item_title" style="font-size: 1rem; font-weight: 700;"></h4>
                        <p style="font-size: 0.8rem; color: var(--text-muted);">
                            Category: <span id="modal_item_category"></span> | Found at: <span id="modal_item_location"></span>
                        </p>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Ownership Description & Identifying Features</label>
                    <textarea 
                        name="claim_notes" 
                        class="form-input" 
                        rows="3" 
                        placeholder="Describe unique identifiers, passcode wallpaper, markings, or contents inside..." 
                        required
                    ></textarea>
                </div>

                <div class="form-group">
                    <label class="form-label">Proof of Ownership / Purchase Receipt Details (Optional)</label>
                    <input 
                        type="text" 
                        name="proof_details" 
                        class="form-input" 
                        placeholder="e.g. Serial number ending in XYZ, receipt date, or dorm room matching..."
                    >
                </div>

                <button type="submit" class="btn btn-primary btn-full">Submit Claim Application</button>
            </form>
        </div>
    </div>
</div>

<?php include __DIR__ . '/includes/footer.php'; ?>
