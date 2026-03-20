// src/lib/partners/walkin-billing/whatsapp.ts

export const getWhatsAppUrl = (
  phoneNumber: string,
  cartItems: any[],
  storeName: string,
  cartTotal: number,
  invoiceUrl?: string
) => {
  const cleanPhone = phoneNumber ? phoneNumber.replace(/\D/g, '') : '';
  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  
  let totalSavings = 0;
  const itemListText = cartItems.map(item => {
    let itemString = `${item.name}: ₹${(item.price * item.quantity).toFixed(2)}`;
    // Check originalPrice to calculate savings just like the app
    if (item.originalPrice && item.originalPrice > item.price) {
      const savings = (item.originalPrice - item.price) * item.quantity;
      totalSavings += savings;
      itemString += ` (Saved: ₹${savings.toFixed(2)})`;
    }
    return itemString;
  }).join('\n');

  let message = `Hello! Your invoice from *${storeName}* is ready.\n\n`
    + `*Item List*\n`
    + `${itemListText}\n\n`
    + `*Total:* ₹${cartTotal.toFixed(2)}\n`;

  if (totalSavings > 0) {
    message += `*Total Savings:* ₹${totalSavings.toFixed(2)}\n\n`;
  }

  message += `Thank you for shopping with us!\n`;
  
  if (invoiceUrl) {
    message += `Your invoice link: ${invoiceUrl}`;
  }

  // Using web.whatsapp.com for direct web interface access
  return `https://web.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`;
};