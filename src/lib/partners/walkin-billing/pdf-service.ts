// src/lib/partners/walkin-billing/pdf-service.ts
import jsPDF from 'jspdf';
import { createClient } from '@/lib/supabase/client';
import { CartProduct } from './utils';

// Helper to generate unique 7-char code
function generateShortCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 7; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function generateAndUploadInvoice(
  storeId: string,
  orderId: string,
  storeName: string,
  cartItems: CartProduct[],
  totalAmount: number,
  gstin?: string // Added gstin parameter
): Promise<string | null> {
  const supabase = createClient();
  const invoiceNumber = `WK-${orderId.substring(0, 8)}`.toUpperCase();

  try {
    const doc = new jsPDF('p', 'pt', 'a4');
    let yPos = 50;

    // --- Header (App Style: Orange Title) ---
    doc.setFontSize(24);
    doc.setTextColor(254, 140, 0); // #fe8c00
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice', 300, yPos, { align: 'center' });
    
    yPos += 25;
    doc.setFontSize(16);
    doc.setTextColor(85, 85, 85); // #555
    doc.text(storeName, 300, yPos, { align: 'center' });

    // --- Invoice Info ---
    yPos += 45;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice No: ${invoiceNumber}`, 40, yPos);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 550, yPos, { align: 'right' });
    
    if (gstin) {
        yPos += 15;
        doc.text(`GSTIN: ${gstin}`, 40, yPos);
    }

    // --- Table Header ---
    yPos += 30;
    doc.setFillColor(242, 242, 242); // #f2f2f2
    doc.rect(40, yPos - 15, 520, 25, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('Product', 50, yPos);
    doc.text('Qty', 320, yPos);
    doc.text('Price', 400, yPos);
    doc.text('Total', 550, yPos, { align: 'right' });

    // --- Table Rows ---
    doc.setFont('helvetica', 'normal');
    let totalSavings = 0;
    
    cartItems.forEach((item) => {
      yPos += 25;
      const itemTotal = item.price * item.quantity;
      const originalPrice = item.originalPrice || item.price;
      const savings = (originalPrice - item.price) * item.quantity;
      totalSavings += savings;

      const unitText = item.unit_value ? ` (${item.unit_value}${item.unit_metric})` : '';
      const fullName = item.name + unitText;
      doc.text(fullName.substring(0, 45), 50, yPos);
      doc.text(item.quantity.toString(), 320, yPos);
      
      if (savings > 0) {
          doc.setFontSize(9);
          doc.setTextColor(150, 150, 150);
          const oldPriceText = `Rs. ${(originalPrice).toFixed(2)}`;
          const textWidth = doc.getTextWidth(oldPriceText);
          
          doc.text(oldPriceText, 400, yPos - 8);
          doc.setDrawColor(150, 150, 150);
          doc.line(400, yPos - 11, 400 + textWidth, yPos - 11);
          
          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
      }
      
      doc.text(`Rs. ${item.price.toFixed(2)}`, 400, yPos);
      doc.text(`Rs. ${itemTotal.toFixed(2)}`, 550, yPos, { align: 'right' });

      doc.setDrawColor(221, 221, 221); // #ddd
      doc.line(40, yPos + 5, 560, yPos + 5);
    });

    // --- Totals Row ---
    yPos += 35;
    doc.setDrawColor(254, 140, 0); // Orange border top
    doc.setLineWidth(1.5);
    doc.line(40, yPos - 15, 560, yPos - 15);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Grand Total', 40, yPos);
    doc.text(`Rs. ${totalAmount.toFixed(2)}`, 550, yPos, { align: 'right' });

    // --- Savings Section ---
    if (totalSavings > 0) {
      yPos += 20;
      doc.setFontSize(11);
      doc.setTextColor(0, 128, 0); // Green
      doc.text(`Total Savings: Rs. ${totalSavings.toFixed(2)}`, 550, yPos, { align: 'right' });
    }

    // --- Footer ---
    yPos = 800;
    doc.setFontSize(10);
    doc.setTextColor(136, 136, 136);
    doc.text('Thank you for your business!', 300, yPos, { align: 'center' });

    const pdfBlob = doc.output('blob');
    const filePath = `${storeId}/${orderId}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from('walkin-invoices')
      .upload(filePath, pdfBlob, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from('walkin-invoices')
      .getPublicUrl(filePath);

    const longUrl = publicUrlData.publicUrl;

    // 3. Generate and save Short Link mapping
    const shortCode = generateShortCode();
    const { error: linkError } = await (supabase as any)
      .from('short_links')
      .insert({
        code: shortCode,
        destination_url: longUrl
      });

    if (linkError) {
       console.error('Short link creation failed:', linkError);
       return longUrl; // Fallback to long URL if link creation fails
    }

    // 4. Return the short URL (using your production domain)
    const baseUrl = 'https://www.thegoaiva.com'; 
    return `${baseUrl}/i/${shortCode}`;
  } catch (error) {
    console.error('PDF Generation Error:', error);
    return null;
  }
}