<?php
require_once __DIR__ . '/include/dbConfig.php';

$page_title = 'Password Recovery';
$error = '';
$msg = '';
$step = 1;
$security_question = '';
$user_email = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action']) && $_POST['action'] === 'request_question') {
        $email = strtolower(trim($_POST['email'] ?? ''));
        if (!empty($email)) {
            $stmt = $pdo->prepare("SELECT id, email, security_question FROM users WHERE email = ?");
            $stmt->execute([$email]);
            $u = $stmt->fetch();
            if ($u && !empty($u['security_question'])) {
                $security_question = $u['security_question'];
                $user_email = $u['email'];
                $msg = 'Account found. Please answer your security question below.';
                $step = 2;
            } else {
                $error = 'No account found with this email address or security question not configured.';
                $step = 1;
            }
        }
    } elseif (isset($_POST['action']) && $_POST['action'] === 'reset_password') {
        $email = strtolower(trim($_POST['email'] ?? ''));
        $security_answer = strtolower(trim($_POST['security_answer'] ?? ''));
        $new_password = $_POST['new_password'] ?? '';
        $security_question = $_POST['security_question'] ?? '';

        if ($email && $security_answer && $new_password) {
            $stmt = $pdo->prepare("SELECT id, security_answer_hash FROM users WHERE email = ?");
            $stmt->execute([$email]);
            $u = $stmt->fetch();

            if ($u && !empty($u['security_answer_hash'])) {
                if (password_verify($security_answer, $u['security_answer_hash'])) {
                    $passwordHash = password_hash($new_password, PASSWORD_BCRYPT);
                    $pdo->prepare("UPDATE users SET password_hash = ? WHERE id = ?")->execute([$passwordHash, $u['id']]);

                    set_flash('success', 'Password updated successfully! You can now log in.');
                    header('Location: login.php');
                    exit;
                } else {
                    $error = 'Incorrect security answer. Please try again.';
                    $user_email = $email;
                    $step = 2;
                }
            } else {
                $error = 'Account not found or security answer not configured.';
                $step = 1;
            }
        }
    }
}

require_once __DIR__ . '/include/header.php';
?>

<div class="main-content">
  <div style="max-width: 460px; margin: 3rem auto;">
    <div class="glass-panel" style="padding: 2.5rem 2rem; background: #ffffff;">
      <a href="login.php" style="color: #64748b; font-size: 0.85rem; font-weight: 600; text-decoration: none; display: flex; align-items: center; gap: 0.4rem; margin-bottom: 1.5rem;">⬅️ Back to Login</a>

      <div style="text-align: center; margin-bottom: 1.5rem;">
        <img src="images/icons/logo.jpg" alt="TrackNFind Logo" style="height: 60px; width: auto; border-radius: 8px; margin: 0 auto 0.75rem auto; object-fit: contain;">
        <h2 style="font-size: 1.4rem; font-weight: 800; color: #0f172a;">Security Question Recovery</h2>
        <p style="font-size: 0.85rem; color: #64748b;">
          <?php echo $step === 1 ? 'Enter your email to find your security question.' : 'Answer your security question to reset your password.'; ?>
        </p>
      </div>

      <?php if ($error): ?><div class="alert alert-danger"><?php echo htmlspecialchars($error); ?></div><?php endif; ?>
      <?php if ($msg): ?><div class="alert alert-info"><?php echo htmlspecialchars($msg); ?></div><?php endif; ?>

      <?php if ($step === 1): ?>
        <form action="forgot-password.php" method="POST">
          <input type="hidden" name="action" value="request_question">
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input type="email" name="email" class="form-control" placeholder="you@example.com" required>
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">Find Account</button>
        </form>
      <?php else: ?>
        <form action="forgot-password.php" method="POST">
          <input type="hidden" name="action" value="reset_password">
          <input type="hidden" name="email" value="<?php echo htmlspecialchars($user_email); ?>">
          <input type="hidden" name="security_question" value="<?php echo htmlspecialchars($security_question); ?>">

          <div style="background: #eff6ff; padding: 1rem; border-radius: 8px; border: 1px solid #bfdbfe; margin-bottom: 1.25rem;">
            <div style="font-size: 0.75rem; font-weight: 700; color: #1d4ed8; text-transform: uppercase; margin-bottom: 4px;">Your Security Question:</div>
            <div style="font-size: 0.95rem; font-weight: 700; color: #1e3a8a;">"<?php echo htmlspecialchars($security_question); ?>"</div>
          </div>

          <div class="form-group">
            <label class="form-label">Security Answer</label>
            <input type="text" name="security_answer" class="form-control" placeholder="Enter your answer" required>
          </div>

          <div class="form-group">
            <label class="form-label">New Password</label>
            <input type="password" name="new_password" class="form-control" placeholder="••••••••••••" minlength="6" required>
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">Reset Password</button>
        </form>
      <?php endif; ?>
    </div>
  </div>
</div>

<?php require_once __DIR__ . '/include/footer.php'; ?>
