<!-- includes/footer.php -->
        </main> <!-- End Main Scrollable Area -->
        
    </div> <!-- End Main Content -->

    <script>
        // Sidebar Toggle Logic for Mobile
        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('sidebarOverlay');
            
            if (sidebar.classList.contains('-translate-x-full')) {
                sidebar.classList.remove('-translate-x-full');
                overlay.classList.remove('hidden');
            } else {
                sidebar.classList.add('-translate-x-full');
                overlay.classList.add('hidden');
            }
        }

        // Dark/Light Theme Toggle
        function toggleTheme() {
            document.body.classList.toggle('dark-mode');
            const themeIcon = document.getElementById('themeIcon');
            
            if (document.body.classList.contains('dark-mode')) {
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
                localStorage.setItem('theme', 'dark');
            } else {
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
                localStorage.setItem('theme', 'light');
            }
        }

        // Load Theme on Init
        window.addEventListener('DOMContentLoaded', () => {
            if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.body.classList.add('dark-mode');
                document.getElementById('themeIcon').classList.replace('fa-moon', 'fa-sun');
            }
            
            // Set dynamic page title
            const activeLink = document.querySelector('a.bg-indigo-50');
            if(activeLink) {
                const title = activeLink.querySelector('span').innerText;
                const pageTitleElement = document.getElementById('pageTitle');
                if(pageTitleElement) {
                    pageTitleElement.innerText = title;
                }
            }
        });
    </script>
</body>
</html>
