<?php
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

if ($uri === '/' || $uri === '' || $uri === '/index.html') {
    require __DIR__ . '/index.php';
    exit;
}

$file = __DIR__ . $uri;
if (file_exists($file) && !is_dir($file)) {
    return false; // serve static asset
}

require __DIR__ . '/index.php';
