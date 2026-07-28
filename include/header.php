<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/jpg" href="images/icons/logo.jpg">
  <title><?php echo isset($page_title) ? htmlspecialchars($page_title) . ' | TrackNFind' : 'TrackNFind | Lost & Found Portal'; ?></title>
  <?php require_once __DIR__ . '/links.php'; ?>
</head>
<body>
<?php require_once __DIR__ . '/../navbar.php'; ?>
<?php require_once __DIR__ . '/sweetAlert.php'; ?>
