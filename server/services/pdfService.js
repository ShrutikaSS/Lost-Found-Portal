import PDFDocument from 'pdfkit';

/**
 * Generates an institutional Lost & Found summary PDF report stream
 */
export function generatePdfReport(res, reportData) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=lost_and_found_report_${Date.now()}.pdf`);

  doc.pipe(res);

  // Header Banner
  doc.rect(0, 0, doc.page.width, 80).fill('#0f172a');
  doc.fillColor('#ffffff').fontSize(22).font('Helvetica-Bold').text('CAMPUS LOST & FOUND PORTAL', 40, 25);
  doc.fontSize(12).font('Helvetica').text('Official Institutional Operational & Claim Statistics Report', 40, 52);

  doc.moveDown(3);
  doc.fillColor('#000000');

  // Summary Metrics Section
  doc.fontSize(16).font('Helvetica-Bold').text('Executive Summary', 40, 100);
  doc.fontSize(10).font('Helvetica').text(`Generated On: ${new Date().toLocaleString()}`);
  doc.moveDown(1);

  const stats = reportData.stats;
  doc.fontSize(11).font('Helvetica-Bold').text(`Total Lost Reports: ${stats.totalLost}   |   Total Found Reports: ${stats.totalFound}`);
  doc.fontSize(11).font('Helvetica-Bold').text(`Resolved/Returned: ${stats.totalReturned}   |   Pending Claims: ${stats.pendingClaims}`);
  doc.fontSize(11).font('Helvetica-Bold').text(`Claim Approval Rate: ${stats.approvalRate}%`);

  doc.moveDown(1.5);
  doc.rect(40, doc.y, 515, 1).fill('#cbd5e1');
  doc.moveDown(1);

  // Recent Lost Items Table
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e293b').text('Recent Lost Items Inventory');
  doc.moveDown(0.5);

  let y = doc.y;
  doc.fontSize(9).font('Helvetica-Bold').fillColor('#475569');
  doc.text('ID', 40, y);
  doc.text('Item Name', 70, y);
  doc.text('Category', 220, y);
  doc.text('Date Lost', 340, y);
  doc.text('Status', 440, y);

  doc.moveTo(40, y + 15).lineTo(555, y + 15).stroke('#e2e8f0');
  y += 22;

  doc.font('Helvetica').fontSize(9).fillColor('#1e293b');
  reportData.lostItems.slice(0, 15).forEach(item => {
    if (y > 750) {
      doc.addPage();
      y = 40;
    }
    doc.text(`#L-${item.id}`, 40, y);
    doc.text(item.title.substring(0, 26), 70, y);
    doc.text(item.category_name || 'General', 220, y);
    doc.text(item.date_lost, 340, y);
    doc.text(item.status.toUpperCase(), 440, y);
    y += 18;
  });

  doc.moveDown(2);
  doc.end();
}
