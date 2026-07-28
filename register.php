<?php
require_once __DIR__ . '/include/dbConfig.php';

$page_title = 'Register';
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $email = strtolower(trim($_POST['email'] ?? ''));
    $password = $_POST['password'] ?? '';
    $phone = trim($_POST['phone'] ?? '');
    $security_question = trim($_POST['security_question'] ?? '');
    $security_answer = strtolower(trim($_POST['security_answer'] ?? ''));

    if (empty($name) || empty($email) || empty($password) || empty($security_question) || empty($security_answer)) {
        $error = 'Please fill in all required fields including your security question.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = 'Please enter a valid email address.';
    } else {
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            $error = 'An account with this email address already exists.';
        } else {
            $passwordHash = password_hash($password, PASSWORD_BCRYPT);
            $securityAnswerHash = password_hash($security_answer, PASSWORD_BCRYPT);
            $stmtInsert = $pdo->prepare("INSERT INTO users (name, email, password_hash, role, phone, security_question, security_answer_hash, is_active) VALUES (?, ?, ?, 'student_staff', ?, ?, ?, 1)");
            $stmtInsert->execute([$name, $email, $passwordHash, $phone ?: null, $security_question, $securityAnswerHash]);

            $userId = $pdo->lastInsertId();

            $_SESSION['user_id'] = $userId;
            $_SESSION['user_name'] = $name;
            $_SESSION['user_email'] = $email;
            $_SESSION['user_role'] = 'student_staff';
            $_SESSION['user_phone'] = $phone;

            set_flash('success', 'Registration successful! Welcome to TrackNFind.');
            header('Location: student-dashboard.php');
            exit;
        }
    }
}

require_once __DIR__ . '/include/header.php';
?>

<div class="main-content">
  <div style="max-width: 480px; margin: 3rem auto;">
    <div class="glass-panel" style="padding: 2.5rem 2rem; background: #ffffff;">
      <div style="text-align: center; margin-bottom: 2rem;">
        <img src="images/icons/logo.jpg" alt="TrackNFind Logo" style="height: 70px; width: auto; border-radius: 10px; margin: 0 auto 0.75rem auto; object-fit: contain;">
        <h2 style="font-size: 1.6rem; font-weight: 800; color: #0f172a;">Create TrackNFind Account</h2>
        <p style="font-size: 0.85rem; color: #64748b; margin-top: 0.25rem;">Register with your personal or educational email address.</p>
      </div>

      <?php if ($error): ?>
        <div class="alert alert-danger"><?php echo htmlspecialchars($error); ?></div>
      <?php endif; ?>

      <form action="register.php" method="POST">
        <div class="form-group">
          <label class="form-label">Full Name *</label>
          <input type="text" name="name" class="form-control" placeholder="Alex Rivera" required>
        </div>

        <div class="form-group">
          <label class="form-label">Email Address (Personal or Educational) *</label>
          <input type="email" name="email" class="form-control" placeholder="alex.rivera@gmail.com" required>
        </div>

        <div class="form-group">
          <label class="form-label">Contact Phone Number</label>
          <input type="tel" name="phone" class="form-control" placeholder="+1 (555) 019-2831">
        </div>

        <div class="form-group">
          <label class="form-label">Password *</label>
          <input type="password" name="password" class="form-control" placeholder="At least 6 characters" required>
        </div>

        <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 1rem;">
          <div style="font-weight: 700; font-size: 0.85rem; color: #0f172a; margin-bottom: 0.75rem;">🛡️ Security Question (For Password Recovery)</div>
          
          <div class="form-group">
            <label class="form-label">Select Security Question *</label>
            <select name="security_question" class="form-control" required>
              <option value="What was the name of your first school?">What was the name of your first school?</option>
              <option value="What city were you born in?">What city were you born in?</option>
              <option value="What was your childhood nickname?">What was your childhood nickname?</option>
              <option value="What is your favorite book or movie?">What is your favorite book or movie?</option>
              <option value="What was the name of your first pet?">What was the name of your first pet?</option>
            </select>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Security Answer *</label>
            <input type="text" name="security_answer" class="form-control" placeholder="Enter your answer" required>
          </div>
        </div>

        <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 0.5rem;">Complete Registration</button>
      </form>

      <div style="text-align: center; margin-top: 1.5rem; font-size: 0.85rem; color: #64748b;">
        Already have an account? <a href="login.php" style="font-weight: 700;">Sign In Here</a>
      </div>
    </div>
  </div>
</div>

<?php require_once __DIR__ . '/include/footer.php'; ?>
