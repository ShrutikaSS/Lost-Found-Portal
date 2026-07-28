/**
 * Generates an Excel-compatible CSV download stream
 */
export function generateCsvReport(res, reportData) {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=lost_and_found_inventory_${Date.now()}.csv`);

  let csvContent = 'Item Type,ID,Title,Category,Campus Zone,Date,Primary Color,Brand,Status,Reporter Email\n';

  reportData.lostItems.forEach(item => {
    const title = `"${(item.title || '').replace(/"/g, '""')}"`;
    const cat = `"${(item.category_name || '').replace(/"/g, '""')}"`;
    const zone = `"${(item.zone_name || '').replace(/"/g, '""')}"`;
    csvContent += `Lost,L-${item.id},${title},${cat},${zone},${item.date_lost},"${item.primary_color || ''}","${item.brand || ''}",${item.status},${item.reporter_email}\n`;
  });

  reportData.foundItems.forEach(item => {
    const title = `"${(item.title || '').replace(/"/g, '""')}"`;
    const cat = `"${(item.category_name || '').replace(/"/g, '""')}"`;
    const zone = `"${(item.zone_name || '').replace(/"/g, '""')}"`;
    csvContent += `Found,F-${item.id},${title},${cat},${zone},${item.date_found},"${item.primary_color || ''}","${item.brand || ''}",${item.status},${item.reporter_email}\n`;
  });

  res.send(csvContent);
}
