    </main>
    <footer class="footer">
        <div class="container">
            <div class="footer-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 2rem; text-align: left; margin-bottom: 2rem;">
                
                <!-- Column 1: Brand & Slogan -->
                <div>
                    <div style="margin-bottom: 0.75rem;">
                        <img src="tracknfind-logo.jpg" alt="TrackNfind Logo" style="height: 52px; width: auto; object-fit: contain; background: white; padding: 4px; border-radius: 6px; border: 1px solid var(--border-color);" />
                    </div>
                    <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 0.75rem;">
                        Centralized campus asset recovery platform enabling students, faculty, and security personnel to log, locate, and claim lost property securely.
                    </p>
                    <span class="badge badge-found" style="font-size: 0.75rem;">TRACK IT. FIND IT. GET IT BACK.</span>
                </div>

                <!-- Column 2: Quick Links -->
                <div>
                    <h4 style="font-size: 1rem; font-weight: 800; color: var(--text-main); margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.05em;">
                        Quick Navigation
                    </h4>
                    <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.9rem; display: flex; flex-direction: column; gap: 0.5rem;">
                        <li><a href="index.php?tab=found">📦 Browse Found Items</a></li>
                        <li><a href="index.php?tab=lost">🚨 Reported Missing Items</a></li>
                        <li><a href="login.php">🔐 Portal Login & Role Selector</a></li>
                        <li><a href="register.php">✍️ Register Student / Officer Account</a></li>
                    </ul>
                </div>

                <!-- Column 3: L&F Campus Office Info -->
                <div>
                    <h4 style="font-size: 1rem; font-weight: 800; color: var(--text-main); margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.05em;">
                        Campus L&F Office
                    </h4>
                    <div style="font-size: 0.88rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.5rem;">
                        <div>📍 <strong>Location:</strong> Student Activity Center, Bldg 4, Room 102</div>
                        <div>🕒 <strong>Office Hours:</strong> Mon - Fri 8:00 AM - 6:00 PM</div>
                        <div>📞 <strong>Dispatch Desk:</strong> +1 (555) 019-9000</div>
                        <div>✉️ <strong>Official Email:</strong> lostandfound@tracknfind.edu</div>
                    </div>
                </div>

                <!-- Column 4: System & Verification -->
                <div>
                    <h4 style="font-size: 1rem; font-weight: 800; color: var(--text-main); margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.05em;">
                        Verification & Support
                    </h4>
                    <div style="font-size: 0.88rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.6rem;">
                        <div>🛡️ <strong>Security Protocol:</strong> Photo ID & ownership proof required for item handover.</div>
                        <div style="display: flex; align-items: center; gap: 0.4rem;">
                            <span style="display: inline-block; width: 10px; height: 10px; background: #10b981; border-radius: 50%;"></span>
                            <span style="font-weight: 600; color: var(--text-main);">System Status: Operational</span>
                        </div>
                        <div style="font-size: 0.8rem; color: var(--text-light); margin-top: 0.25rem;">
                            Engineered with PHP, HTML5, CSS3, JS & MySQL PDO.
                        </div>
                    </div>
                </div>

            </div>

            <div style="border-top: 1px solid var(--border-color); padding-top: 1.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; font-size: 0.85rem; color: var(--text-muted);">
                <p>© <?= date('Y') ?> <strong>TrackNfind</strong> Campus Asset Recovery Portal. All rights reserved.</p>
                <div style="display: flex; gap: 1.25rem;">
                    <a href="index.php" style="color: var(--text-muted);">Privacy Policy</a>
                    <a href="index.php" style="color: var(--text-muted);">Terms of Service</a>
                    <a href="index.php" style="color: var(--text-muted);">Security Audit</a>
                </div>
            </div>
        </div>
    </footer>
    <script src="js/app.js"></script>
</body>
</html>
