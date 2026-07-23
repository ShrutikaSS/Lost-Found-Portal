<?php
require_once __DIR__ . '/config/db.php';

$errors = [];
$registerSuccess = false;

if (isLoggedIn()) {
    header("Location: index.php");
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $fullName = trim($_POST['full_name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $username = trim($_POST['username'] ?? '');
    $role = 'student'; // Public registration is strictly restricted to Students/Users
    $studentId = trim($_POST['student_id'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $securityQuestion = trim($_POST['security_question'] ?? '');
    $securityAnswer = trim($_POST['security_answer'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirmPassword = $_POST['confirm_password'] ?? '';

    // Form Validations
    if (empty($fullName)) $errors[] = "Full Name is required.";
    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = "Valid campus email address is required.";
    if (empty($username) || strlen($username) < 4) $errors[] = "Username must be at least 4 characters long.";
    if (empty($studentId)) $errors[] = "Student ID is required for student registration.";
    if (empty($phone)) $errors[] = "Phone number is required.";
    if (empty($securityQuestion)) $errors[] = "Security question selection is required for password recovery.";
    if (empty($securityAnswer) || strlen($securityAnswer) < 2) $errors[] = "A valid Security Answer is required.";

    // Server-side Password Policy Validation
    $pwdPolicyErrors = validatePasswordPolicy($password);
    foreach ($pwdPolicyErrors as $pe) {
        $errors[] = $pe;
    }
    if ($password !== $confirmPassword) $errors[] = "Password and confirm password do not match.";

    if (empty($errors)) {
        $db = getDBConnection();
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        $answerHash = password_hash(strtolower(trim($securityAnswer)), PASSWORD_DEFAULT);

        if ($db) {
            try {
                // Check if user or email exists
                $checkStmt = $db->prepare("SELECT id FROM users WHERE email = ? OR username = ?");
                $checkStmt->execute([$email, $username]);
                if ($checkStmt->fetch()) {
                    $errors[] = "An account with this email address or username already exists.";
                } else {
                    $insertStmt = $db->prepare("INSERT INTO users (full_name, email, username, password_hash, role, student_id, phone, security_question, security_answer_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
                    $insertStmt->execute([$fullName, $email, $username, $passwordHash, $role, $studentId, $phone, $securityQuestion, $answerHash]);
                    $newUserId = $db->lastInsertId();

                    $_SESSION['user'] = [
                        'id' => $newUserId,
                        'full_name' => $fullName,
                        'email' => $email,
                        'username' => $username,
                        'role' => $role
                    ];

                    logAuditAction("New Account Registered ({$role})", $role);
                    header("Location: student_dashboard.php");
                    exit;
                }
            } catch (Exception $e) {
                $errors[] = "Database Registration Error: " . $e->getMessage();
            }
        } else {
            // Demo registration fallback
            $_SESSION['user'] = [
                'id' => rand(100, 999),
                'full_name' => $fullName,
                'email' => $email,
                'username' => $username,
                'role' => $role
            ];
            header("Location: student_dashboard.php");
            exit;
        }
    }
}

include __DIR__ . '/includes/header.php';
?>

<div class="auth-page-container">
    <div class="auth-card" style="max-width: 580px;">
        <div class="auth-card-header">
            <div style="text-align: center; margin-bottom: 0.75rem;">
                <img src="tracknfind-logo.jpg" alt="TrackNfind Logo" style="height: 64px; width: auto; object-fit: contain;" />
            </div>
            <h2 class="auth-card-title">Student / User Registration</h2>
            <p class="auth-card-subtitle">Create your student account to claim found items or report missing assets</p>
        </div>

        <?php if (!empty($errors)): ?>
            <div class="alert-banner alert-banner-error">
                <div>
                    <strong>Registration Requirements Missing</strong>
                    <ul style="margin-left: 1.25rem; margin-top: 0.35rem;">
                        <?php foreach ($errors as $err): ?>
                            <li><?= sanitize($err) ?></li>
                        <?php endforeach; ?>
                    </ul>
                </div>
            </div>
        <?php endif; ?>

        <form method="POST" action="register.php">
            <!-- Account Role Restriction Notice -->
            <div class="form-group">
                <div style="background: rgba(37, 99, 235, 0.08); border-left: 4px solid var(--primary); padding: 0.75rem 1rem; border-radius: var(--radius-sm); font-size: 0.88rem; color: var(--text-main);">
                    🎓 <strong>Student / User Account Portal</strong>
                    <p style="margin: 0.25rem 0 0 0; color: var(--text-muted); font-size: 0.82rem;">
                        Online registration is restricted strictly to <strong>Students / Users</strong>. Admin and L&F Officer accounts are assigned internally by Campus Administration.
                    </p>
                </div>
            </div>

            <!-- Full Name -->
            <div class="form-group">
                <label class="form-label">Full Name</label>
                <input type="text" name="full_name" class="form-input" placeholder="e.g. Alex Sharma" required value="<?= sanitize($_POST['full_name'] ?? '') ?>">
            </div>

            <!-- Email & Username -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                    <label class="form-label">Campus Email</label>
                    <input type="email" name="email" class="form-input" placeholder="alex@campus.edu" required value="<?= sanitize($_POST['email'] ?? '') ?>">
                </div>

                <div class="form-group">
                    <label class="form-label">Username</label>
                    <input type="text" name="username" class="form-input" placeholder="alex.sharma" required value="<?= sanitize($_POST['username'] ?? '') ?>">
                </div>
            </div>

            <!-- Student ID & Phone -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group" id="student_id_group">
                    <label class="form-label">Student ID Number</label>
                    <input type="text" name="student_id" class="form-input" placeholder="STU-2026-001" required value="<?= sanitize($_POST['student_id'] ?? '') ?>">
                </div>

                <div class="form-group">
                    <label class="form-label">Contact Phone</label>
                    <input type="text" name="phone" class="form-input" placeholder="+1 (555) 000-0000" required value="<?= sanitize($_POST['phone'] ?? '') ?>">
                </div>
            </div>

            <!-- Security Question & Answer for Forgot Password Reset -->
            <div class="form-group">
                <label class="form-label">Security Question (for Password Recovery)</label>
                <select name="security_question" class="form-input" required>
                    <option value="">-- Select a Security Question --</option>
                    <option value="What was the name of your first pet?" <?= (($_POST['security_question'] ?? '') === 'What was the name of your first pet?') ? 'selected' : '' ?>>What was the name of your first pet?</option>
                    <option value="What is your mother's maiden name?" <?= (($_POST['security_question'] ?? '') === "What is your mother's maiden name?") ? 'selected' : '' ?>>What is your mother's maiden name?</option>
                    <option value="What high school did you attend?" <?= (($_POST['security_question'] ?? '') === 'What high school did you attend?') ? 'selected' : '' ?>>What high school did you attend?</option>
                    <option value="What was your favorite childhood teacher's name?" <?= (($_POST['security_question'] ?? '') === "What was your favorite childhood teacher's name?") ? 'selected' : '' ?>>What was your favorite childhood teacher's name?</option>
                    <option value="In what city were you born?" <?= (($_POST['security_question'] ?? '') === 'In what city were you born?') ? 'selected' : '' ?>>In what city were you born?</option>
                </select>
            </div>

            <div class="form-group">
                <label class="form-label">Security Answer</label>
                <input type="text" name="security_answer" class="form-input" placeholder="Enter answer (case-insensitive for reset)" required value="<?= sanitize($_POST['security_answer'] ?? '') ?>">
            </div>

            <!-- Password & Confirmation -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                    <label class="form-label">Password</label>
                    <div style="position: relative;">
                        <input type="password" id="register_password" name="password" class="form-input" placeholder="Min 8 chars" required>
                        <button type="button" class="toggle-password-btn" data-target="register_password" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; font-size: 0.8rem; cursor: pointer; color: var(--text-muted);">👁️ Show</button>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Confirm Password</label>
                    <div style="position: relative;">
                        <input type="password" id="confirm_password" name="confirm_password" class="form-input" placeholder="Re-enter password" required>
                        <button type="button" class="toggle-password-btn" data-target="confirm_password" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; font-size: 0.8rem; cursor: pointer; color: var(--text-muted);">👁️ Show</button>
                    </div>
                </div>
            </div>

            <!-- Real-time Password Strength Bar & Requirement Checklist -->
            <div style="margin-bottom: 1.5rem; background: #f8fafc; padding: 0.85rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
                <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 0.35rem; font-weight: 700;">
                    <span>Password Security Rules:</span>
                    <span id="pwd_strength_label">Strength: Weak</span>
                </div>
                <div style="height: 6px; background: #e2e8f0; border-radius: 999px; overflow: hidden; margin-bottom: 0.75rem;">
                    <div id="pwd_strength_bar" style="width: 0%; height: 100%; transition: all 0.3s ease; background-color: #ef4444;"></div>
                </div>
                <div class="pwd-criteria-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem; font-size: 0.78rem;">
                    <div id="rule_len" style="color: #64748b;">❌ Min 8 Characters</div>
                    <div id="rule_upper" style="color: #64748b;">❌ 1 Uppercase Letter (A-Z)</div>
                    <div id="rule_lower" style="color: #64748b;">❌ 1 Lowercase Letter (a-z)</div>
                    <div id="rule_num" style="color: #64748b;">❌ 1 Number (0-9)</div>
                    <div id="rule_spec" style="color: #64748b; grid-column: span 2;">❌ 1 Special Character (!@#$%^&*)</div>
                </div>
            </div>

            <button type="submit" class="btn btn-primary btn-full btn-lg">Complete Student Registration</button>
        </form>

        <div style="text-align: center; margin-top: 1.5rem; font-size: 0.9rem; color: var(--text-muted);">
            Already have an account? <a href="login.php" style="font-weight: 700;">Sign In Here</a>
        </div>
    </div>
</div>

<?php include __DIR__ . '/includes/footer.php'; ?>

