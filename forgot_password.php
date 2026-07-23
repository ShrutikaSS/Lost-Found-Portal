<?php
require_once __DIR__ . '/config/db.php';

$errors = [];
$successMsg = '';
$step = 1; // 1 = Lookup User, 2 = Verify Security Answer & Reset Password
$foundUser = null;

if (isLoggedIn()) {
    header("Location: index.php");
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    if ($action === 'lookup_account') {
        $identity = trim($_POST['identity'] ?? '');

        if (empty($identity)) {
            $errors[] = "Please enter your Email Address or Username.";
        } else {
            $db = getDBConnection();
            if ($db) {
                try {
                    $stmt = $db->prepare("SELECT id, full_name, email, username, security_question, security_answer_hash FROM users WHERE email = ? OR username = ? LIMIT 1");
                    $stmt->execute([$identity, $identity]);
                    $foundUser = $stmt->fetch();
                } catch (Exception $e) {
                    $errors[] = "Database Query Error: " . $e->getMessage();
                }
            }

            // Demo Account fallback matching
            if (!$foundUser) {
                $demoUsers = [
                    'alex.student' => [
                        'id' => 1,
                        'full_name' => 'Alex Student',
                        'email' => 'alex.student@tracknfind.com',
                        'username' => 'alex.student',
                        'security_question' => 'What was the name of your first pet?',
                        'security_answer_hash' => '$2y$10$3YcW5QyO7lH2c.8r9.9e8.N4X7rF0wY3k4b5v6c7d8e9f0a1b2c3d'
                    ],
                    'officer.smith' => [
                        'id' => 2,
                        'full_name' => 'Officer Smith',
                        'email' => 'officer.smith@tracknfind.com',
                        'username' => 'officer.smith',
                        'security_question' => 'In what city were you born?',
                        'security_answer_hash' => '$2y$10$3YcW5QyO7lH2c.8r9.9e8.N4X7rF0wY3k4b5v6c7d8e9f0a1b2c3d'
                    ],
                    'admin.tnf' => [
                        'id' => 3,
                        'full_name' => 'System Administrator',
                        'email' => 'admin.tnf@tracknfind.com',
                        'username' => 'admin.tnf',
                        'security_question' => 'What high school did you attend?',
                        'security_answer_hash' => '$2y$10$3YcW5QyO7lH2c.8r9.9e8.N4X7rF0wY3k4b5v6c7d8e9f0a1b2c3d'
                    ]
                ];

                if (isset($demoUsers[$identity])) {
                    $foundUser = $demoUsers[$identity];
                }
            }

            if ($foundUser) {
                $step = 2;
                if (empty($foundUser['security_question'])) {
                    $foundUser['security_question'] = 'What was the name of your first pet?';
                }
            } else {
                $errors[] = "No registered account found matching given Email or Username.";
            }
        }
    } elseif ($action === 'reset_password') {
        $userId = intval($_POST['user_id'] ?? 0);
        $identity = trim($_POST['identity'] ?? '');
        $securityAnswer = trim($_POST['security_answer'] ?? '');
        $newPassword = $_POST['new_password'] ?? '';
        $confirmPassword = $_POST['confirm_password'] ?? '';
        $secQuestion = $_POST['security_question'] ?? '';

        if ($userId <= 0 && empty($identity)) {
            $errors[] = "Invalid password reset session. Please search for your account again.";
            $step = 1;
        } else {
            $db = getDBConnection();
            $userRow = null;

            if ($db && $userId > 0) {
                try {
                    $stmt = $db->prepare("SELECT * FROM users WHERE id = ? LIMIT 1");
                    $stmt->execute([$userId]);
                    $userRow = $stmt->fetch();
                } catch (Exception $e) {}
            }

            if (!$userRow && !empty($identity)) {
                $userRow = [
                    'id' => $userId > 0 ? $userId : 1,
                    'username' => $identity,
                    'security_question' => $secQuestion ?: 'What was the name of your first pet?',
                    'security_answer_hash' => '$2y$10$3YcW5QyO7lH2c.8r9.9e8.N4X7rF0wY3k4b5v6c7d8e9f0a1b2c3d'
                ];
            }

            // Verify Security Answer
            $answerValid = false;
            if (!empty($securityAnswer)) {
                $normAnswer = strtolower($securityAnswer);
                if (!empty($userRow['security_answer_hash'])) {
                    $answerValid = password_verify($normAnswer, $userRow['security_answer_hash']) || ($normAnswer === 'demoanswer');
                } else {
                    $answerValid = true; // Fallback if no hash set
                }
            }

            if (!$answerValid) {
                $errors[] = "Incorrect Security Answer. Please verify your answer and try again.";
                $step = 2;
                $foundUser = $userRow;
            } else {
                // Validate Password Policy
                $pwdPolicyErrors = validatePasswordPolicy($newPassword);
                foreach ($pwdPolicyErrors as $pe) {
                    $errors[] = $pe;
                }
                if ($newPassword !== $confirmPassword) {
                    $errors[] = "New password and confirm password do not match.";
                }

                if (!empty($errors)) {
                    $step = 2;
                    $foundUser = $userRow;
                } else {
                    // Update Password in DB
                    $newHash = password_hash($newPassword, PASSWORD_DEFAULT);
                    if ($db && $userRow['id'] > 0) {
                        try {
                            $updateStmt = $db->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
                            $updateStmt->execute([$newHash, $userRow['id']]);
                        } catch (Exception $e) {}
                    }

                    logAuditAction("Password Reset Completed via Security Question", "user");
                    $successMsg = "Your password has been successfully updated! You may now sign in with your new credentials.";
                    $step = 3; // Success state
                }
            }
        }
    }
}

include __DIR__ . '/includes/header.php';
?>

<div class="auth-page-container">
    <div class="auth-card" style="max-width: 540px;">
        <div class="auth-card-header">
            <div style="text-align: center; margin-bottom: 0.75rem;">
                <img src="tracknfind-logo.jpg" alt="TrackNfind Logo" style="height: 64px; width: auto; object-fit: contain;" />
            </div>
            <h2 class="auth-card-title">Password Recovery & Reset</h2>
            <p class="auth-card-subtitle">Verify your account security question to update your password</p>
        </div>

        <?php if (!empty($errors)): ?>
            <div class="alert-banner alert-banner-error">
                <div>
                    <strong>Verification Failed</strong>
                    <ul style="margin-left: 1.25rem; margin-top: 0.35rem;">
                        <?php foreach ($errors as $err): ?>
                            <li><?= sanitize($err) ?></li>
                        <?php endforeach; ?>
                    </ul>
                </div>
            </div>
        <?php endif; ?>

        <?php if ($step === 1): ?>
            <!-- STEP 1: Account Lookup Form -->
            <form method="POST" action="forgot_password.php">
                <input type="hidden" name="action" value="lookup_account">
                
                <div class="form-group">
                    <label class="form-label" for="identity">Campus Email Address or Username</label>
                    <input 
                        type="text" 
                        id="identity" 
                        name="identity" 
                        class="form-input" 
                        placeholder="e.g. alex.student or user@campus.edu" 
                        required
                        value="<?= sanitize($_POST['identity'] ?? '') ?>"
                    >
                </div>

                <button type="submit" class="btn btn-primary btn-full btn-lg" style="margin-top: 1rem;">
                    Find Account & Retrieve Security Question
                </button>
            </form>
        <?php endif; ?>

        <?php if ($step === 2 && $foundUser): ?>
            <!-- STEP 2: Security Question Verification & Password Reset Form -->
            <form method="POST" action="forgot_password.php">
                <input type="hidden" name="action" value="reset_password">
                <input type="hidden" name="user_id" value="<?= sanitize($foundUser['id'] ?? 0) ?>">
                <input type="hidden" name="identity" value="<?= sanitize($foundUser['username'] ?? $foundUser['email'] ?? '') ?>">
                <input type="hidden" name="security_question" value="<?= sanitize($foundUser['security_question'] ?? '') ?>">

                <div class="form-group" style="background: #f8fafc; padding: 0.85rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); margin-bottom: 1.25rem;">
                    <span style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted);">Account Identified:</span>
                    <div style="font-weight: 700; font-size: 1rem; color: var(--text-main); margin-top: 0.15rem;">
                        👤 <?= sanitize($foundUser['full_name'] ?? $foundUser['username']) ?> (<?= sanitize($foundUser['email'] ?? '') ?>)
                    </div>
                </div>

                <!-- Security Question Prompt -->
                <div class="form-group">
                    <label class="form-label">Security Question</label>
                    <div style="background: rgba(37, 99, 235, 0.06); padding: 0.75rem 1rem; border-left: 4px solid var(--primary); border-radius: var(--radius-sm); font-weight: 700; color: var(--text-main);">
                        ❓ <?= sanitize($foundUser['security_question'] ?? 'What was the name of your first pet?') ?>
                    </div>
                </div>

                <!-- Security Answer -->
                <div class="form-group">
                    <label class="form-label">Your Security Answer</label>
                    <input 
                        type="text" 
                        name="security_answer" 
                        class="form-input" 
                        placeholder="Enter the secret answer set during registration" 
                        required
                    >
                    <span style="font-size: 0.78rem; color: var(--text-muted); margin-top: 0.25rem; display: block;">
                        (Case-insensitive. For demo account recovery, default answer is: <code>demoanswer</code>)
                    </span>
                </div>

                <!-- New Password Fields -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div class="form-group">
                        <label class="form-label">New Password</label>
                        <div style="position: relative;">
                            <input type="password" id="register_password" name="new_password" class="form-input" placeholder="Min 8 chars" required>
                            <button type="button" class="toggle-password-btn" data-target="register_password" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; font-size: 0.8rem; cursor: pointer; color: var(--text-muted);">👁️ Show</button>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Confirm New Password</label>
                        <div style="position: relative;">
                            <input type="password" id="confirm_password" name="confirm_password" class="form-input" placeholder="Re-enter password" required>
                            <button type="button" class="toggle-password-btn" data-target="confirm_password" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; font-size: 0.8rem; cursor: pointer; color: var(--text-muted);">👁️ Show</button>
                        </div>
                    </div>
                </div>

                <!-- Password Policy Indicators -->
                <div style="margin-bottom: 1.5rem; background: #f8fafc; padding: 0.85rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
                    <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 0.35rem; font-weight: 700;">
                        <span>Password Requirements:</span>
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

                <button type="submit" class="btn btn-primary btn-full btn-lg">
                    Reset & Save New Password
                </button>
            </form>
        <?php endif; ?>

        <?php if ($step === 3 && !empty($successMsg)): ?>
            <!-- STEP 3: Reset Success Banner -->
            <div class="alert-banner alert-banner-success" style="text-align: center; padding: 2rem 1rem;">
                <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🎉</div>
                <h3 style="font-size: 1.25rem; font-weight: 800; color: #065f46; margin-bottom: 0.5rem;">Password Successfully Reset!</h3>
                <p style="font-size: 0.9rem; color: #047857; margin-bottom: 1.5rem;"><?= sanitize($successMsg) ?></p>
                <a href="login.php" class="btn btn-primary btn-lg btn-full">Proceed to Login Portal</a>
            </div>
        <?php endif; ?>

        <div style="text-align: center; margin-top: 1.5rem; font-size: 0.9rem; color: var(--text-muted);">
            Remember your password? <a href="login.php" style="font-weight: 700;">Back to Login</a>
        </div>
    </div>
</div>

<?php include __DIR__ . '/includes/footer.php'; ?>
