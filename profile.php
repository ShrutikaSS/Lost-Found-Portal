<?php 
require_once 'config.php';

$id = $_GET['id'] ?? null;
$user = null;
$error = '';

if ($id) {
    try {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$id]);
        $user = $stmt->fetch();
        if (!$user) {
            $error = "User not found.";
        }
    } catch (PDOException $e) {
        $error = "Error fetching user: " . $e->getMessage();
    }
} else {
    $error = "No user ID provided.";
}

include 'includes/header.php'; 
?>

<div class="mb-6">
    <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
        <a href="users.php" class="hover:text-primary transition-colors">Users</a>
        <i class="fas fa-chevron-right text-xs"></i>
        <span class="text-gray-900 dark:text-white">User Profile</span>
    </div>
    
    <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold dark:text-white">User Profile</h2>
        <?php if($user): ?>
        <a href="edit-user.php?id=<?= $user['id'] ?>" class="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-colors shadow-sm shadow-primary/30 flex items-center gap-2">
            <i class="fas fa-edit"></i> Edit Profile
        </a>
        <?php endif; ?>
    </div>
</div>

<?php if($error): ?>
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
        <span class="block sm:inline"><?= escape($error) ?></span>
    </div>
<?php else: ?>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Left Column: Profile Card -->
    <div class="lg:col-span-1">
        <div class="glass rounded-2xl p-6 text-center shadow-sm">
            <div class="relative inline-block mb-4">
                <img src="<?= $user['photo_url'] ?: 'https://ui-avatars.com/api/?name='.urlencode($user['full_name']).'&background=4F46E5&color=fff&size=128' ?>" alt="Profile" class="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-md">
                <span class="absolute bottom-2 right-2 w-4 h-4 rounded-full <?= $user['status'] === 'ACTIVE' ? 'bg-green-500' : 'bg-yellow-500' ?> border-2 border-white dark:border-gray-800"></span>
            </div>
            
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-1"><?= escape($user['full_name']) ?></h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-3"><?= escape($user['role']) ?></p>
            
            <span class="badge badge-<?= strtolower($user['status']) ?> mb-6 inline-block">
                <?= escape($user['status']) ?>
            </span>
            
            <div class="flex flex-col gap-3 text-left border-t border-gray-100 dark:border-gray-700 pt-4">
                <div class="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <i class="fas fa-id-badge w-5 text-center text-gray-400"></i>
                    <span>PRN: <span class="font-medium text-gray-900 dark:text-white"><?= escape($user['prn']) ?></span></span>
                </div>
                <div class="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <i class="fas fa-envelope w-5 text-center text-gray-400"></i>
                    <span><?= escape($user['email']) ?></span>
                </div>
                <div class="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <i class="fas fa-phone w-5 text-center text-gray-400"></i>
                    <span><?= escape($user['mobile_number']) ?></span>
                </div>
                <div class="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <i class="fas fa-building w-5 text-center text-gray-400"></i>
                    <span><?= escape($user['department'] ?? 'No Dept') ?></span>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Right Column: Details & Tabs -->
    <div class="lg:col-span-2">
        <div class="glass rounded-2xl shadow-sm overflow-hidden h-full">
            
            <!-- Tabs -->
            <div class="border-b border-gray-200 dark:border-gray-700">
                <nav class="flex -mb-px px-6">
                    <button class="text-primary border-primary py-4 px-1 text-center border-b-2 font-medium text-sm w-1/4">Overview</button>
                    <button class="text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:border-gray-300 py-4 px-1 text-center border-b-2 border-transparent font-medium text-sm w-1/4">Activity</button>
                    <button class="text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:border-gray-300 py-4 px-1 text-center border-b-2 border-transparent font-medium text-sm w-1/4">Reports</button>
                    <button class="text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:border-gray-300 py-4 px-1 text-center border-b-2 border-transparent font-medium text-sm w-1/4">Security</button>
                </nav>
            </div>
            
            <!-- Tab Content -->
            <div class="p-6">
                <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Academic Information</h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                        <span class="block text-xs text-gray-500 uppercase tracking-wider mb-1">Branch</span>
                        <span class="font-medium text-gray-900 dark:text-white"><?= escape($user['branch'] ?? 'N/A') ?></span>
                    </div>
                    <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                        <span class="block text-xs text-gray-500 uppercase tracking-wider mb-1">Study Year</span>
                        <span class="font-medium text-gray-900 dark:text-white"><?= escape($user['study_year'] ?? 'N/A') ?></span>
                    </div>
                    <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                        <span class="block text-xs text-gray-500 uppercase tracking-wider mb-1">Gender</span>
                        <span class="font-medium text-gray-900 dark:text-white"><?= escape($user['gender'] ?? 'N/A') ?></span>
                    </div>
                    <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                        <span class="block text-xs text-gray-500 uppercase tracking-wider mb-1">Joined Date</span>
                        <span class="font-medium text-gray-900 dark:text-white"><?= date('F j, Y', strtotime($user['created_at'])) ?></span>
                    </div>
                </div>

                <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity (Mock)</h4>
                <div class="relative border-l border-gray-200 dark:border-gray-700 ml-3">
                    
                    <div class="mb-6 ml-6">
                        <span class="absolute -left-3 flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full ring-4 ring-white dark:ring-gray-900 dark:bg-blue-900">
                            <i class="fas fa-sign-in-alt text-xs text-blue-600 dark:text-blue-300"></i>
                        </span>
                        <h5 class="flex items-center mb-1 text-sm font-semibold text-gray-900 dark:text-white">User Logged In</h5>
                        <time class="block mb-2 text-xs font-normal leading-none text-gray-400 dark:text-gray-500">Today, 09:30 AM</time>
                        <p class="text-sm font-normal text-gray-500 dark:text-gray-400">Logged in from IP 192.168.1.1 (Windows, Chrome)</p>
                    </div>

                    <div class="mb-6 ml-6">
                        <span class="absolute -left-3 flex items-center justify-center w-6 h-6 bg-green-100 rounded-full ring-4 ring-white dark:ring-gray-900 dark:bg-green-900">
                            <i class="fas fa-plus text-xs text-green-600 dark:text-green-300"></i>
                        </span>
                        <h5 class="flex items-center mb-1 text-sm font-semibold text-gray-900 dark:text-white">Reported Found Item</h5>
                        <time class="block mb-2 text-xs font-normal leading-none text-gray-400 dark:text-gray-500">Yesterday, 02:15 PM</time>
                        <p class="text-sm font-normal text-gray-500 dark:text-gray-400">Reported a found Scientific Calculator in Library.</p>
                    </div>

                </div>
            </div>

        </div>
    </div>
</div>

<?php endif; ?>
<?php include 'includes/footer.php'; ?>
