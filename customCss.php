<?php
header("Content-type: text/css; charset: UTF-8");
?>
/* Project-specific CSS overrides (customCss.php) */

.brand-logo img {
  transition: transform 0.3s ease;
}

.brand-logo:hover img {
  transform: scale(1.05);
}

.glass-card img {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-card:hover img {
  transform: scale(1.04);
}
