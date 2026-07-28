<?php
require_once __DIR__ . '/include/dbConfig.php';

$page_title = 'Sign In';
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = strtolower(trim($_POST['email'] ?? ''));
    $password = $_POST['password'] ?? '';

    if (empty($email) || empty($password)) {
        $error = 'Please enter both email and password.';
    } else {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password_hash'])) {
            if (!$user['is_active']) {
                $pdo->prepare("UPDATE users SET is_active = 1 WHERE id = ?")->execute([$user['id']]);
                $user['is_active'] = 1;
            }
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_name'] = $user['name'];
            $_SESSION['user_email'] = $user['email'];
            $_SESSION['user_role'] = $user['role'];
            $_SESSION['user_phone'] = $user['phone'];

            set_flash('success', "Welcome back, {$user['name']}!");

            if ($user['role'] === 'admin') {
                header('Location: admin-dashboard.php');
            } elseif ($user['role'] === 'officer') {
                header('Location: officer-dashboard.php');
            } else {
                header('Location: student-dashboard.php');
            }
            exit;
        } else {
            $error = 'Invalid email address or password.';
        }
    }
}

require_once __DIR__ . '/include/header.php';
?>

<div class="main-content">
  <div style="max-width: 440px; margin: 3rem auto;">
    <div class="glass-panel" style="padding: 2.5rem 2rem; background: #ffffff;">
      <div style="text-align: center; margin-bottom: 2rem;">
        <img src="images/icons/logo.jpg" alt="TrackNFind Logo" style="height: 70px; width: auto; border-radius: 10px; margin: 0 auto 0.75rem auto; object-fit: contain;">
        <h2 style="font-size: 1.6rem; font-weight: 800; color: #0f172a;">Sign In to TrackNFind</h2>
        <p style="font-size: 0.85rem; color: #64748b; margin-top: 0.25rem;">Enter your credentials to access your portal dashboard.</p>
      </div>

      <?php if ($error): ?>
        <div class="alert alert-danger"><?php echo htmlspecialchars($error); ?></div>
      <?php endif; ?>

      <!-- Quick Demo Credentials -->
      <div style="margin-bottom: 1.5rem; background: #f8fafc; padding: 0.85rem; border-radius: var(--radius-md); border: 1px solid #e2e8f0;">
        <div style="font-size: 0.75rem; font-weight: 700; color: #64748b; margin-bottom: 0.5rem; text-transform: uppercase;">
          Quick Admin & Officer Credentials:
        </div>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <button type="button" class="btn btn-secondary btn-sm" style="font-size: 0.75rem;" onclick="document.getElementById('email').value='officer@campus.edu'; document.getElementById('password').value='Password123!';">👮 Officer</button>
          <button type="button" class="btn btn-secondary btn-sm" style="font-size: 0.75rem;" onclick="document.getElementById('email').value='admin@campus.edu'; document.getElementById('password').value='Password123!';">⚙️ Admin</button>
        </div>
      </div>

      <form action="login.php" method="POST">
        <div class="form-group">
          <label class="form-label">Email Address</label>
          <input type="email" id="email" name="email" class="form-control" placeholder="you@example.com" required>
        </div>

        <div class="form-group">
          <label class="form-label" style="display: flex; justify-content: space-between;">
            <span>Password</span>
            <a href="forgot-password.php" style="font-size: 0.8rem; font-weight: 600;">Forgot Password?</a>
          </label>
          <input type="password" id="password" name="password" class="form-control" placeholder="••••••••••••" required>
        </div>

        <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">Sign In</button>
      </form>

      <div style="text-align: center; margin-top: 1.5rem; font-size: 0.85rem; color: #64748b;">
        Don't have an account yet? <a href="register.php" style="font-weight: 700;">Register Here</a>
      </div>
    </div>
  </div>
</div>

<?php require_once __DIR__ . '/include/footer.php'; ?>
