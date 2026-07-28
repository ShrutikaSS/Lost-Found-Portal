<?php
require_once __DIR__ . '/config/auth.php';
session_unset();
session_destroy();
session_start();
set_flash('info', 'Logged out successfully.');
header('Location: index.php');
exit;
