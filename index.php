<?php 
require_once 'config.php';
include 'includes/header.php'; 

// Mock Data for Dashboard (In a real app, query these from the database)
$stats = [
    'total_users' => 1250,
    'total_students' => 1100,
    'total_staff' => 120,
    'total_officers' => 30,
    'active_users' => 1180,
    'pending_verification' => 45,
    'blocked_users' => 15,
    'today_registrations' => 12,
    'monthly_registrations' => 145,
    'online_users' => 34
];
?>

<!-- Dashboard Stats Cards -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    
    <!-- Total Users Card -->
    <div class="glass rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-xl">
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Users</h3>
            <div class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <i class="fas fa-users"></i>
            </div>
        </div>
        <p class="text-3xl font-bold dark:text-white"><?= number_format($stats['total_users']) ?></p>
        <p class="text-sm text-green-500 mt-2 flex items-center gap-1">
            <i class="fas fa-arrow-up"></i> 12% from last month
        </p>
    </div>

    <!-- Active Users Card -->
    <div class="glass rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-xl">
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Active Users</h3>
            <div class="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                <i class="fas fa-user-check"></i>
            </div>
        </div>
        <p class="text-3xl font-bold dark:text-white"><?= number_format($stats['active_users']) ?></p>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
            <?= round(($stats['active_users'] / $stats['total_users']) * 100) ?>% of total
        </p>
    </div>

    <!-- Pending Verification -->
    <div class="glass rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-xl">
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pending</h3>
            <div class="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600 dark:text-yellow-400">
                <i class="fas fa-user-clock"></i>
            </div>
        </div>
        <p class="text-3xl font-bold dark:text-white"><?= number_format($stats['pending_verification']) ?></p>
        <p class="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
            Requires attention
        </p>
    </div>

    <!-- Online Users -->
    <div class="glass rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-xl">
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Online Now</h3>
            <div class="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <i class="fas fa-globe"></i>
            </div>
        </div>
        <p class="text-3xl font-bold dark:text-white"><?= number_format($stats['online_users']) ?></p>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Live
        </p>
    </div>

</div>

<!-- Charts Section -->
<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
    
    <!-- User Growth Chart -->
    <div class="glass rounded-2xl p-6">
        <h3 class="text-lg font-semibold mb-4 dark:text-white">User Growth (Last 6 Months)</h3>
        <div class="relative h-64 w-full">
            <canvas id="userGrowthChart"></canvas>
        </div>
    </div>

    <!-- Role Distribution Chart -->
    <div class="glass rounded-2xl p-6">
        <h3 class="text-lg font-semibold mb-4 dark:text-white">Role Distribution</h3>
        <div class="relative h-64 w-full flex justify-center">
            <canvas id="roleChart"></canvas>
        </div>
    </div>
</div>

<script>
    // User Growth Chart
    const growthCtx = document.getElementById('userGrowthChart').getContext('2d');
    new Chart(growthCtx, {
        type: 'line',
        data: {
            labels: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
            datasets: [{
                label: 'New Registrations',
                data: [65, 80, 110, 140, 125, 145],
                borderColor: '#4F46E5',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(156, 163, 175, 0.1)' } },
                x: { grid: { display: false } }
            }
        }
    });

    // Role Distribution Chart
    const roleCtx = document.getElementById('roleChart').getContext('2d');
    new Chart(roleCtx, {
        type: 'doughnut',
        data: {
            labels: ['Students', 'Staff', 'LF Officers', 'Admins'],
            datasets: [{
                data: [<?= $stats['total_students'] ?>, <?= $stats['total_staff'] ?>, <?= $stats['total_officers'] ?>, 5],
                backgroundColor: ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { color: '#9CA3AF' } }
            },
            cutout: '75%'
        }
    });
</script>

<?php include 'includes/footer.php'; ?>
