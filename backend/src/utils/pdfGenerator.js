import PDFDocument from 'pdfkit';

export const generateBookingPDF = (booking, output) => {
  const doc = new PDFDocument();

  // Handle output: stream to response or collect buffer
  const buffers = [];
  if (typeof output.setHeader === 'function') {
    // Streaming for download
    output.setHeader('Content-Type', 'application/pdf');
    output.setHeader('Content-Disposition', `attachment; filename=booking-${booking.id}.pdf`);
    doc.pipe(output);
  } else {
    // Buffer for email
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => output.end(Buffer.concat(buffers)));
    doc.on('error', output.on.bind(output, 'error'));
  }

  // Add content to PDF
  doc.fontSize(20).text('Parking Ticket', { align: 'center' });
  doc.moveDown();
  doc.moveTo(50, 100).lineTo(550, 100).stroke();
  doc.moveDown();

  doc.fontSize(14);
  doc.text(`Plate Number: ${booking.vehicle.plateNumber}`);
  doc.moveDown(0.5);
  doc.text(`Start Time: ${new Date(booking.startTime).toLocaleString()}`);
  doc.moveDown(0.5);
  doc.text(`End Time: ${new Date(booking.endTime).toLocaleString()}`);
  doc.moveDown(0.5);
  doc.text(`Amount to Pay: $${booking.payment.amount.toFixed(2)}`);

  doc.moveDown(2);
  doc.fontSize(10).text('This is an automatically generated document.', { align: 'center' });

  doc.end();
};

export const generateUserPDF = (user, bookings, res) => {
  const doc = new PDFDocument();
  
  // Set response headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=user-${user.id}.pdf`);
  
  // Pipe PDF to response
  doc.pipe(res);
  
  // Add content to PDF
  doc.fontSize(25).text('User Profile', { align: 'center' });
  
  doc.moveTo(50, 100).lineTo(550, 100).stroke();
  
  doc.moveDown();
  doc.fontSize(14);
  
  // User details
  doc.text(`Name: ${user.name}`);
  doc.moveDown(0.5);
  doc.text(`Email: ${user.email}`);
  doc.moveDown(0.5);
  doc.text(`Plate Number: ${user.plateNumber}`);
  doc.moveDown(0.5);
  doc.text(`Role: ${user.role}`);
  doc.moveDown(0.5);
  doc.text(`Joined: ${new Date(user.createdAt).toLocaleDateString()}`);
  
  // Booking history
  if (bookings.length > 0) {
    doc.moveDown();
    doc.fontSize(16).text('Booking History', { align: 'center' });
    doc.moveDown(0.5);
    
    bookings.forEach((booking, index) => {
      doc.fontSize(12);
      doc.text(`${index + 1}. Slot: ${booking.parkingSlot.slotNumber} (${booking.parkingSlot.type})`);
      doc.moveDown(0.3);
      doc.text(`   Status: ${booking.status}`);
      doc.moveDown(0.3);
      doc.text(`   Period: ${new Date(booking.startTime).toLocaleDateString()} to ${new Date(booking.endTime).toLocaleDateString()}`);
      doc.moveDown(0.3);
      doc.text(`   Payment: ${booking.isPaid ? 'Paid' : 'Unpaid'}`);
      doc.moveDown(0.5);
    });
  } else {
    doc.moveDown();
    doc.text('No booking history available.', { align: 'center' });
  }
  
  // Footer
  doc.moveDown(2);
  doc.fontSize(10).text('This is an automatically generated document.', { align: 'center' });
  
  // Finalize PDF
  doc.end();
};

export const generateCSVReport = (data, fields, res, filename) => {
  // Set response headers
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  
  // Create header row from field names
  const header = fields.map(field => field.header).join(',') + '\n';
  
  // Create rows from data
  const rows = data.map(item => {
    return fields.map(field => {
      let value = field.value(item);
      
      // Handle values with commas by wrapping in quotes
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value}"`;
      }
      
      return value;
    }).join(',');
  }).join('\n');
  
  // Combine header and rows and send response
  res.send(header + rows);
};