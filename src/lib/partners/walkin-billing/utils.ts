//src/lib/partners/walkin-billing/utils.ts
import { createClient } from '@/lib/supabase/client';

export interface CartProduct {
  id: string;
  name: string;
  price: number;
  quantity: number;
  originalPrice?: number;
  discountValue?: number;
  discountType?: 'flat' | 'percent';
  unit_value?: number;
  unit_metric?: string;
  image_url?: string | null;
  brand?: string | null;
}

interface CreateOrderResult {
  orderId: string | null;
  error: string | null;
}

/**
 * Ported logic from mobile to create walk-in orders and manage stock.
 */
export async function createWalkinOrder(
  storeId: string,
  cartItems: CartProduct[],
  customerEmail?: string | null,
  customerPhone?: string | null,
  paymentMethod: string = 'Cash'
): Promise<CreateOrderResult> {
  // We cast to 'any' here to stop the "never" errors while keeping your client import
  const supabase = createClient() as any;

  if (!storeId || cartItems.length === 0) {
    return { orderId: null, error: 'Missing store ID or cart items.' };
  }

  const totalItemsAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const platformFee = 0; // Keeping as 0 based on your current mobile bypass
  const totalAmount = totalItemsAmount + platformFee;
  const itemsJson = cartItems; // Supabase handles JS objects as JSONB

  try {
    // 1. Create the Walk-in Order
    const { data: newOrder, error: orderError } = await supabase
      .from('walkin_orders')
      .insert({
        store_id: storeId,
        customer_email: customerEmail || null,
        customer_phone: customerPhone || null,
        total_amount: totalAmount,
        items: itemsJson,
        payment_method: paymentMethod,
        status: 'completed',
      })
      .select('id')
      .single();

    if (orderError) throw orderError;

    const orderId = newOrder.id;
    const invoiceNumber = `WK-${orderId.substring(0, 8)}`;

    // 2. Decrement Stock for each product
    // Note: In a production web environment, we'd ideally do this via a RPC function 
    // to ensure atomicity, but we are replicating your mobile logic here.
    for (const item of cartItems) {
      const { data: product } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', item.id)
        .single();

      if (product) {
        const newQty = Math.max(0, (product.stock_quantity ?? 0) - item.quantity);
        await supabase
          .from('products')
          .update({ stock_quantity: newQty })
          .eq('id', item.id);
      }
    }

    // 3. Create the Invoice Record
    const priceDetails = {
      item_value: totalItemsAmount,
      total_amount: totalAmount,
      platform_fee: platformFee,
      convenience_fee: 0,
      delivery_fee: 0,
    };

    const { error: invoiceError } = await supabase
      .from('walkin_invoices')
      .insert({
        store_id: storeId,
        order_id: orderId,
        status: 'delivered',
        invoice_number: invoiceNumber,
        items: itemsJson,
        price_details: priceDetails,
        payment_method: paymentMethod,
        order_type: 'walkin',
      });

    if (invoiceError) throw invoiceError;

    return { orderId, error: null };
  } catch (error: any) {
    console.error('[createWalkinOrder] Error:', error.message);
    return { orderId: null, error: error.message };
  }
}

/**
 * Fetches unique recent customer phone numbers for a specific store.
 */
export async function getRecentCustomerPhones(
  storeId: string,
  searchQuery: string
): Promise<string[]> {
  const supabase = createClient() as any;

  if (!storeId || searchQuery.length < 3) return [];

  const { data, error } = await supabase
    .from('walkin_orders')
    .select('customer_phone')
    .eq('store_id', storeId)
    .not('customer_phone', 'is', null)
    .ilike('customer_phone', `${searchQuery}%`)
    .order('created_at', { ascending: false })
    .limit(20); // Get a pool of recent ones

  if (error) {
    console.error('[getRecentCustomerPhones] Error:', error.message);
    return [];
  }

  // Use Set to get unique numbers and limit to top 5
  const uniquePhones = Array.from(new Set((data as any[]).map(order => order.customer_phone)))
    .slice(0, 5);

  return uniquePhones as string[];
}