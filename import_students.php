<?php
require_once 'config.php';
include 'includes/header.php';

// Restrict to Admins
if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'SUPER_ADMIN') {
    echo "<div class='p-8'><h2 class='text-red-500 font-bold'>Access Denied.</h2></div>";
    include 'includes/footer.php';
    exit;
}

$success = '';
$error = '';
$imported_count = 0;

if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_POST['ocr_text'])) {
    $text = $_POST['ocr_text'];
    $pattern = '/\b(12[45][A-Z0-9]{5,10})\b\s+([A-Za-z\s\.\-]+)/';
    
    $students = [];
    $seen = [];
    
    if (preg_match_all($pattern, $text, $matches, PREG_SET_ORDER)) {
        foreach ($matches as $match) {
            $zprn = trim($match[1]);
            $name = trim($match[2]);
            $name = preg_replace('/\s+/', ' ', $name);
            $name = trim($name);
            
            if (strlen($name) < 3) continue;
            if (stripos($name, 'Room No') !== false) continue;
            if (stripos($name, 'Subject') !== false) continue;
            
            if (!isset($seen[$zprn])) {
                $seen[$zprn] = true;
                $students[] = ['prn' => $zprn, 'name' => $name];
            }
        }
    }
    
    if (count($students) > 0) {
        try {
            $pdo->beginTransaction();
            $stmt = $pdo->prepare("INSERT IGNORE INTO users (prn, full_name, email, mobile_number, password_hash, role, status) VALUES (?, ?, ?, ?, ?, 'STUDENT', 'ACTIVE')");
            
            foreach ($students as $i => $student) {
                $prn = $student['prn'];
                $name = $student['name'];
                $email = strtolower($prn) . "@zealcollege.edu.in";
                $mobile = "90" . mt_rand(10000000, 99999999);
                $hash = password_hash($prn, PASSWORD_BCRYPT);
                
                $stmt->execute([$prn, $name, $email, $mobile, $hash]);
                if ($stmt->rowCount() > 0) $imported_count++;
            }
            
            $pdo->commit();
            $success = "Successfully imported $imported_count students into the database!";
        } catch (Exception $e) {
            $pdo->rollBack();
            $error = "Database Error: " . $e->getMessage();
        }
    } else {
        $error = "No valid student records found in the pasted text. Please check the format.";
    }
}
?>

<div class="mb-6">
    <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold dark:text-white">Bulk Student Importer</h2>
        <a href="users.php" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
            <i class="fas fa-arrow-left"></i> Back to Users
        </a>
    </div>
    <p class="text-gray-500 dark:text-gray-400 mt-2">Paste the OCR text from the PDF below to automatically extract and register students.</p>
</div>

<?php if($error): ?>
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
        <span class="block sm:inline"><?= escape($error) ?></span>
    </div>
<?php endif; ?>

<?php if($success): ?>
    <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
        <span class="block sm:inline"><?= escape($success) ?></span>
    </div>
<?php endif; ?>

<div class="glass rounded-2xl shadow-sm overflow-hidden p-6 sm:p-8">
    <form action="import_students.php" method="POST">
        <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Paste PDF OCR Text</label>
            <textarea name="ocr_text" rows="15" required class="block w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-primary focus:border-primary dark:text-white font-mono text-sm" placeholder="1 125UAD1001 TAGWALE SUMIT PRAKASH&#10;2 125UAD1002 DIVEKAR SRUSHTI SANTOSH..."></textarea>
            <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
                <i class="fas fa-info-circle text-primary"></i> 
                The system will automatically find lines containing ZPRNs and Names. It assigns the ZPRN as the PRN and default Password.
            </p>
        </div>
        
        <div class="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <button type="submit" class="px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors shadow-lg shadow-primary/30 flex items-center gap-2">
                <i class="fas fa-magic"></i> Extract & Import Students
            </button>
        </div>
    </form>
</div>

<?php include 'includes/footer.php'; ?>
