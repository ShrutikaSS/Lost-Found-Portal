<?php 
// includes/header.php
require_once __DIR__ . '/auth.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TrackNfind - Dashboard</title>
    
    <!-- Tailwind CSS (CDN for rapid prototyping) -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        primary: '#0D9488', /* Teal 600 */
                        'primary-hover': '#0F766E', /* Teal 700 */
                        secondary: '#059669', /* Emerald 600 */
                    }
                }
            }
        }
    </script>
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

    <!-- Custom CSS -->
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body class="antialiased overflow-x-hidden flex h-screen text-gray-800 transition-colors duration-300">

    <!-- Mobile Sidebar Overlay -->
    <div id="sidebarOverlay" class="fixed inset-0 bg-gray-900 bg-opacity-50 z-20 hidden lg:hidden" onclick="toggleSidebar()"></div>

    <!-- Sidebar Wrapper -->
    <div id="sidebar" class="fixed inset-y-0 left-0 transform -translate-x-full lg:relative lg:translate-x-0 z-30 w-64 glass border-r transition-transform duration-300 ease-in-out flex flex-col">
        <?php include 'sidebar.php'; ?>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        <!-- Top Header -->
        <header class="glass sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b">
            <div class="flex items-center gap-4">
                <button onclick="toggleSidebar()" class="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white focus:outline-none">
                    <i class="fas fa-bars text-xl"></i>
                </button>
                <h1 class="text-xl font-semibold dark:text-white hidden sm:block" id="pageTitle">Admin Dashboard</h1>
            </div>

            <div class="flex items-center gap-6">
                <!-- Theme Toggle -->
                <button onclick="toggleTheme()" class="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-white transition-colors">
                    <i class="fas fa-moon text-xl" id="themeIcon"></i>
                </button>
                
                <!-- Notifications -->
                <button class="relative text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-white transition-colors">
                    <i class="fas fa-bell text-xl"></i>
                    <span class="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">3</span>
                </button>

                <!-- Profile Dropdown -->
                <div class="relative group cursor-pointer">
                    <div class="flex items-center gap-3">
                        <img src="https://ui-avatars.com/api/?name=Admin+User&background=4F46E5&color=fff" alt="Profile" class="h-9 w-9 rounded-full object-cover border-2 border-primary">
                        <div class="hidden md:block text-sm">
                            <p class="font-semibold dark:text-white">Admin User</p>
                            <p class="text-xs text-gray-500 dark:text-gray-400">Super Admin</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>

        <!-- Main Scrollable Area -->
        <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
