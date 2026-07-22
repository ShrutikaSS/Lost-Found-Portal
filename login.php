<?php 
require_once 'config.php';

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email_prn = trim($_POST['email_prn'] ?? '');
    $password = $_POST['password'] ?? '';
    
    if (empty($email_prn) || empty($password)) {
        $error = "Please enter both credentials.";
    } else {
        try {
            $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? OR prn = ? LIMIT 1");
            $stmt->execute([$email_prn, $email_prn]);
            $user = $stmt->fetch();
            
            if ($user && password_verify($password, $user['password_hash'])) {
                if ($user['status'] !== 'ACTIVE') {
                    $error = "Your account is currently " . strtolower($user['status']) . ". Please contact admin.";
                } else {
                    // Success
                    $_SESSION['user_id'] = $user['id'];
                    $_SESSION['user_role'] = $user['role'];
                    $_SESSION['full_name'] = $user['full_name'];
                    
                    // Route based on role
                    if ($user['role'] === 'STUDENT') {
                        header("Location: profile.php?id=" . $user['id']);
                    } else {
                        header("Location: index.php");
                    }
                    exit;
                }
            } else {
                $error = "Invalid credentials provided.";
            }
        } catch (PDOException $e) {
            $error = "Database Error: " . $e->getMessage();
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - TrackNfind</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 to-emerald-100 dark:from-gray-900 dark:to-teal-950 transition-colors duration-300">

<div class="glass w-full max-w-md rounded-2xl p-8 m-4 shadow-2xl relative overflow-hidden">
    <!-- Decorative Blob -->
    <div class="absolute -top-16 -right-16 w-32 h-32 bg-primary rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
    <div class="absolute -bottom-16 -left-16 w-32 h-32 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>

    <div class="text-center mb-8 relative z-10">
        <div class="mx-auto mb-4 flex justify-center">
            <img src="assets/img/logo.jpg" alt="TrackNfind Logo" class="h-24 w-auto rounded-xl shadow-md bg-white p-2">
        </div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Sign in to TrackNfind</p>
    </div>

    <?php if($error): ?>
        <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 text-sm relative z-10" role="alert">
            <p><?= escape($error) ?></p>
        </div>
    <?php endif; ?>

    <form action="login.php" method="POST" class="space-y-6 relative z-10">
        <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PRN or Email</label>
            <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i class="fas fa-user text-gray-400"></i>
                </div>
                <input type="text" name="email_prn" required class="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm focus:ring-primary focus:border-primary dark:text-white transition-all">
            </div>
        </div>

        <div>
            <div class="flex items-center justify-between mb-1">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <a href="#" class="text-xs font-medium text-primary hover:text-primary-hover dark:text-indigo-400">Forgot Password?</a>
            </div>
            <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i class="fas fa-lock text-gray-400"></i>
                </div>
                <input type="password" name="password" required class="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm focus:ring-primary focus:border-primary dark:text-white transition-all">
            </div>
        </div>

        <div class="flex items-center">
            <input type="checkbox" id="remember" class="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary bg-white dark:bg-gray-800">
            <label for="remember" class="ml-2 block text-sm text-gray-600 dark:text-gray-400">
                Remember me for 30 days
            </label>
        </div>

        <button type="submit" class="w-full py-2.5 px-4 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5">
            Sign In
        </button>
    </form>
</div>

</body>
</html>
