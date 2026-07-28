<?php
// Alert Configurations & SweetAlert Helper (include/sweetAlert.php)
$flash = get_flash();
if ($flash):
?>
  <div class="main-content" style="padding-bottom: 0;">
    <div class="alert alert-<?php echo htmlspecialchars($flash['type']); ?>">
      <?php echo htmlspecialchars($flash['message']); ?>
    </div>
  </div>
<?php endif; ?>
