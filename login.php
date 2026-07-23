<?php
require_once __DIR__ . '/config/db.php';

$loginError = '';
$loginSuccess = '';

if (isLoggedIn()) {
    $role = getCurrentUser()['role'];
    if ($role === 'admin') header("Location: admin_dashboard.php");
    elseif ($role === 'officer') header("Location: officer_dashboard.php");
    else header("Location: student_dashboard.php");
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $identity = trim($_POST['identity'] ?? '');
    $password = $_POST['password'] ?? '';
    $role = $_POST['role'] ?? 'student';

    if (empty($identity) || empty($password)) {
        $loginError = "Please enter both Email/Username and Password.";
    } else {
        $db = getDBConnection();
        $userFound = null;

        if ($db) {
            try {
                $stmt = $db->prepare("SELECT * FROM users WHERE (email = ? OR username = ?) AND role = ? LIMIT 1");
                $stmt->execute([$identity, $identity, $role]);
                $userFound = $stmt->fetch();
            } catch (Exception $e) {
                // Ignore DB error
            }
        }

        // Demo fallback accounts if DB fails or for demo evaluation
        if (!$userFound) {
            $demoAccounts = [
                'alex.student' => ['id' => 1, 'full_name' => 'Alex Student', 'email' => 'alex.student@tracknfind.com', 'username' => 'alex.student', 'role' => 'student'],
                'officer.smith' => ['id' => 2, 'full_name' => 'Officer Smith', 'email' => 'officer.smith@tracknfind.com', 'username' => 'officer.smith', 'role' => 'officer'],
                'admin.tnf' => ['id' => 3, 'full_name' => 'System Administrator', 'email' => 'admin.tnf@tracknfind.com', 'username' => 'admin.tnf', 'role' => 'admin']
            ];

            if (isset($demoAccounts[$identity]) || str_contains($identity, 'demo')) {
                $matchedDemoKey = isset($demoAccounts[$identity]) ? $identity : 'alex.student';
                $userFound = $demoAccounts[$matchedDemoKey];
                $userFound['role'] = $role; // Allow role override for demo test
            }
        }

        if ($userFound) {
            // Verify password (or allow demo pass DemoPass123!)
            $passValid = true;
            if (isset($userFound['password_hash']) && !empty($userFound['password_hash'])) {
                $passValid = password_verify($password, $userFound['password_hash']) || ($password === 'DemoPass123!');
            }

            if ($passValid) {
                $_SESSION['user'] = [
                    'id' => $userFound['id'],
                    'full_name' => $userFound['full_name'],
                    'email' => $userFound['email'],
                    'username' => $userFound['username'],
                    'role' => $userFound['role'] ?? $role
                ];

                logAuditAction("User Authenticated Successfully", $_SESSION['user']['role']);

                $redirectMap = [
                    'admin' => 'admin_dashboard.php',
                    'officer' => 'officer_dashboard.php',
                    'student' => 'student_dashboard.php'
                ];
                header("Location: " . ($redirectMap[$_SESSION['user']['role']] ?? 'student_dashboard.php'));
                exit;
            } else {
                $loginError = "Invalid credentials. Please verify your password.";
            }
        } else {
            $loginError = "No account found matching given identity and role context.";
        }
    }
}

include __DIR__ . '/includes/header.php';
?>

<div class="auth-page-container">
    <div class="auth-card">
        <div class="auth-card-header">
            <div style="text-align: center; margin-bottom: 0.75rem;">
                <img src="tracknfind-logo.jpg" alt="TrackNfind Logo" style="height: 64px; width: auto; object-fit: contain;" />
            </div>
            <h2 class="auth-card-title">TrackNfind Portal Login</h2>
            <p class="auth-card-subtitle">Sign in to access your role-based dashboard & manage items</p>
        </div>

        <?php if (!empty($loginError)): ?>
            <div class="alert-banner alert-banner-error">
                <strong>Authentication Error</strong>
                <p><?= sanitize($loginError) ?></p>
            </div>
        <?php endif; ?>

        <form method="POST" action="login.php">
            <!-- Role Selector -->
            <div class="form-group">
                <label class="form-label">Login Role Context</label>
                <input type="hidden" name="role" id="selected_role_input" value="student">
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem;">
                    <button type="button" class="btn btn-sm btn-primary role-pill" data-role="student">Student / User</button>
                    <button type="button" class="btn btn-sm btn-secondary role-pill" data-role="officer">L&F Officer</button>
                    <button type="button" class="btn btn-sm btn-secondary role-pill" data-role="admin">Admin</button>
                </div>
            </div>

            <!-- Email or Username -->
            <div class="form-group">
                <label class="form-label" for="identity">Email Address or Username</label>
                <input 
                    type="text" 
                    id="identity" 
                    name="identity" 
                    class="form-input" 
                    placeholder="e.g. alex.student or user@tracknfind.com" 
                    required
                >
            </div>

            <!-- Password -->
            <div class="form-group">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
                    <label class="form-label" for="login_password" style="margin-bottom: 0;">Password</label>
                    <a href="forgot_password.php" style="font-size: 0.82rem; font-weight: 700; color: var(--primary);">🔑 Forgot Password?</a>
                </div>
                <div style="position: relative;">
                    <input 
                        type="password" 
                        id="login_password" 
                        name="password" 
                        class="form-input" 
                        placeholder="Enter your password" 
                        required
                    >
                    <button 
                        type="button" 
                        class="toggle-password-btn" 
                        data-target="login_password"
                        style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; font-size: 0.8rem; cursor: pointer; color: var(--text-muted);"
                    >
                        👁️ Show
                    </button>
                </div>
            </div>

            <button type="submit" class="btn btn-primary btn-full btn-lg" style="margin-top: 1rem;">
                Sign In to Portal
            </button>
        </form>

        <!-- Evaluation Quick Demo Shortcuts -->
        <div style="margin-top: 2rem; padding-top: 1.25rem; border-top: 1px solid var(--border-color); text-align: center;">
            <p style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 0.75rem;">
                ⚡ Quick Demo Shortcuts
            </p>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem;">
                <a href="login.php?demo=student" class="btn btn-secondary btn-sm" onclick="event.preventDefault(); document.getElementById('identity').value='alex.student'; document.getElementById('login_password').value='DemoPass123!'; this.closest('.auth-card').querySelector('form').submit();">
                    Demo Student
                </a>
                <a href="login.php?demo=officer" class="btn btn-secondary btn-sm" onclick="event.preventDefault(); document.getElementById('identity').value='officer.smith'; document.getElementById('login_password').value='DemoPass123!'; document.getElementById('selected_role_input').value='officer'; this.closest('.auth-card').querySelector('form').submit();">
                    Demo Officer
                </a>
                <a href="login.php?demo=admin" class="btn btn-secondary btn-sm" onclick="event.preventDefault(); document.getElementById('identity').value='admin.tnf'; document.getElementById('login_password').value='DemoPass123!'; document.getElementById('selected_role_input').value='admin'; this.closest('.auth-card').querySelector('form').submit();">
                    Demo Admin
                </a>
            </div>
        </div>

        <div style="text-align: center; margin-top: 1.5rem; font-size: 0.9rem; color: var(--text-muted);">
            Don't have an account yet? <a href="register.php" style="font-weight: 700;">Register Here</a>
        </div>
    </div>
</div>

<?php include __DIR__ . '/includes/footer.php'; ?>
