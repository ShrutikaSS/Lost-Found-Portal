<!-- includes/sidebar.php -->
<div class="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
    <a href="index.php" class="flex items-center gap-2">
        <img src="assets/img/logo.jpg" alt="TrackNfind Logo" class="w-10 h-10 object-contain rounded-lg shadow-md bg-white p-1">
        <span class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">TrackNfind</span>
    </a>
</div>

<div class="flex-1 overflow-y-auto py-4 px-3">
    <ul class="space-y-1">
        <!-- Dashboard -->
        <li>
            <a href="index.php" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group <?= basename($_SERVER['PHP_SELF']) == 'index.php' ? 'bg-indigo-50 text-primary dark:bg-indigo-900/30 dark:text-indigo-400 font-medium' : '' ?>">
                <i class="fas fa-chart-pie w-5 text-center group-hover:text-primary transition-colors"></i>
                <span>Dashboard</span>
            </a>
        </li>
        
        <li class="pt-4 pb-2">
            <span class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">Management</span>
        </li>
        
        <!-- Users -->
        <li>
            <a href="users.php" class="flex items-center justify-between px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group <?= in_array(basename($_SERVER['PHP_SELF']), ['users.php', 'add-user.php', 'edit-user.php']) ? 'bg-indigo-50 text-primary dark:bg-indigo-900/30 dark:text-indigo-400 font-medium' : '' ?>">
                <div class="flex items-center gap-3">
                    <i class="fas fa-users w-5 text-center group-hover:text-primary transition-colors"></i>
                    <span>User Management</span>
                </div>
            </a>
        </li>

        <!-- Import Students -->
        <li>
            <a href="import_students.php" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group <?= basename($_SERVER['PHP_SELF']) == 'import_students.php' ? 'bg-indigo-50 text-primary dark:bg-indigo-900/30 dark:text-indigo-400 font-medium' : '' ?>">
                <i class="fas fa-file-import w-5 text-center group-hover:text-primary transition-colors"></i>
                <span>Bulk Import</span>
            </a>
        </li>

        <!-- Roles & Permissions -->
        <li>
            <a href="#" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group">
                <i class="fas fa-shield-alt w-5 text-center group-hover:text-primary transition-colors"></i>
                <span>Roles & Access</span>
            </a>
        </li>

        <li class="pt-4 pb-2">
            <span class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">System</span>
        </li>

        <!-- Audit Logs -->
        <li>
            <a href="#" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group">
                <i class="fas fa-history w-5 text-center group-hover:text-primary transition-colors"></i>
                <span>Audit Logs</span>
            </a>
        </li>

        <!-- Settings -->
        <li>
            <a href="#" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group">
                <i class="fas fa-cog w-5 text-center group-hover:text-primary transition-colors"></i>
                <span>Settings</span>
            </a>
        </li>
    </ul>
</div>

<div class="p-4 border-t border-gray-200 dark:border-gray-700">
    <a href="#" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group w-full">
        <i class="fas fa-sign-out-alt w-5 text-center"></i>
        <span>Logout</span>
    </a>
</div>
