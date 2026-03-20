//src/app/api/partners/analytics/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import dayjs from 'dayjs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '7d';
    const type = searchParams.get('type') || 'online'; 
    const metric = searchParams.get('metric') || 'summary'; // summary, products, categories

    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const storeId = session.user.id;
    
    // NEW LOGIC FOR EXTENDED RANGES
    let from = null;
    if (range !== 'all') {
      const daysMap: Record<string, number> = {
        '24h': 1, '7d': 7, '30d': 30, '90d': 90, '1y': 365
      };
      const days = daysMap[range] || 7;
      from = dayjs().subtract(days, 'day').toISOString();
    }

    let responseData: any = {};

    // Fetch ALL unique customers who ever ordered from this store to determine New vs Returning
    const { data: allOnlineCustomers } = await supabase
      .from('orders')
      .select('customer_id, created_at')
      .eq('store_id', storeId)
      .order('created_at', { ascending: true });

    const { data: allWalkinCustomers } = await supabase
      .from('walkin_orders')
      .select('customer_phone, customer_email, created_at')
      .eq('store_id', storeId)
      .order('created_at', { ascending: true });

    // Map to store the FIRST order date for every unique customer
    const firstOrderMap = new Map<string, string>();

    allOnlineCustomers?.forEach(o => {
      if (o.customer_id && !firstOrderMap.has(o.customer_id)) {
        // Store the Unix timestamp as a string to ensure exact matching
        firstOrderMap.set(o.customer_id, dayjs(o.created_at).valueOf().toString());
      }
    });

    allWalkinCustomers?.forEach(o => {
      const identifier = o.customer_phone || o.customer_email;
      if (identifier && !firstOrderMap.has(identifier)) {
        firstOrderMap.set(identifier, dayjs(o.created_at).valueOf().toString());
      }
    });

    // 1. FETCH BASE DATA
    let onlineQuery = supabase.from('orders').select(`
      id, customer_id, total_amount, created_at, status, slot_type, payment_method, rejection_reason,
      order_items(product_id, quantity, price, name)
    `).eq('store_id', storeId);

    let walkinQuery = supabase.from('walkin_orders').select('*')
      .eq('store_id', storeId);

    // Only apply date filter if not 'all'
    if (from) {
      onlineQuery = onlineQuery.gte('created_at', from);
      walkinQuery = walkinQuery.gte('created_at', from);
    }

    const [onlineRes, walkinRes] = await Promise.all([onlineQuery, walkinQuery]);
    
    // 2. EXTRACT PRODUCT IDs & FETCH COST PRICES
    const onlineItems = (onlineRes.data || []).flatMap(o => o.order_items || []);
    const walkinItems = (walkinRes.data || []).flatMap(o => {
      const items = typeof o.items === 'string' ? JSON.parse(o.items) : o.items;
      return items || [];
    });

    const allProductIds = Array.from(new Set([
      ...onlineItems.map((i: any) => i.product_id),
      ...walkinItems.map((i: any) => i.id) // Walkin uses 'id' as product_id in JSON
    ])).filter(Boolean);

    const { data: products } = await supabase
      .from('products')
      .select('id, cost_price, category_id, global_categories(name)')
      .in('id', allProductIds);

    const productMap: Record<string, any> = {};
    products?.forEach((p: any) => {
      productMap[p.id] = { 
        cost: p.cost_price, 
        cat: p.global_categories?.name || 'Uncategorized' 
      };
    });

    // 3. PROCESSING LOGIC
    const online = type === 'walkin' ? [] : (onlineRes.data || []);
    const walkin = type === 'online' ? [] : (walkinRes.data || []);

    const chartMap: Record<string, any> = {};
    const productTally: Record<string, { name: string; qty: number; margin: number }> = {};
    const categoryTally: Record<string, number> = {};
    const paymentTally: Record<string, number> = {};
    
    let totalSales = 0, totalOrders = 0, totalProfit = 0, costMissing = false;

    // Initialize Heatmap and Customer Tracking
    const hourlyDistribution = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      display: dayjs().hour(i).format('ha'), // e.g., 1pm
      count: 0
    }));

    const customerStats = {
      new: 0,
      returning: 0,
      undefined: 0
    };

    // Process Online
    online.forEach((o: any) => {
      // 1. Customer Segmentation (Runs for ALL orders)
      if (!o.customer_id) {
        customerStats.undefined++;
      } else {
        const firstOrderTime = firstOrderMap.get(o.customer_id);
        const currentOrderTime = dayjs(o.created_at).valueOf().toString();
        
        if (firstOrderTime === currentOrderTime) {
          customerStats.new++;
        } else {
          customerStats.returning++;
        }
      }

      // 2. Metrics (Only for delivered orders)
      if (o.status === 'delivered') {
        const orderSales = Number(o.total_amount) || 0;
        totalSales += orderSales;
        totalOrders++;

        // Track Hour for Heatmap
        const hour = dayjs(o.created_at).hour();
        hourlyDistribution[hour].count++;
        
        const date = dayjs(o.created_at).format('MMM DD');
        if (!chartMap[date]) chartMap[date] = { name: date, sales: 0 };
        chartMap[date].sales += orderSales;

        o.order_items?.forEach((item: any) => {
          const pData = productMap[item.product_id] || {};
          const itemPrice = Number(item.price) || 0;
          const qty = Number(item.quantity) || 0;
          
          productTally[item.name] = {
            name: item.name,
            qty: (productTally[item.name]?.qty || 0) + qty,
            margin: 0
          };
          
          const cat = pData.cat || 'Uncategorized';
          categoryTally[cat] = (categoryTally[cat] || 0) + (itemPrice * qty);
        });
      }
      paymentTally[o.payment_method || 'Online'] = (paymentTally[o.payment_method || 'Online'] || 0) + 1;
    });

    // Process Walk-in (Process all)
    walkin.forEach((o: any) => {
      const orderSales = Number(o.total_amount) || 0;
      totalSales += orderSales;
      totalOrders++;

      // Customer Segmentation Logic
      const identifier = o.customer_phone || o.customer_email;
      if (!identifier) {
        customerStats.undefined++;
      } else {
        const firstOrderTime = firstOrderMap.get(identifier);
        const currentOrderTime = dayjs(o.created_at).valueOf().toString();

        if (firstOrderTime === currentOrderTime) {
          customerStats.new++;
        } else {
          customerStats.returning++;
        }
      }

      // Track Hour for Heatmap
      const hour = dayjs(o.created_at).hour();
      hourlyDistribution[hour].count++;

      const date = dayjs(o.created_at).format('MMM DD');
      if (!chartMap[date]) chartMap[date] = { name: date, sales: 0 };
      chartMap[date].sales += orderSales;

      const items = typeof o.items === 'string' ? JSON.parse(o.items) : o.items;
      items?.forEach((item: any) => {
        const pData = productMap[item.id];
        const itemPrice = Number(item.price) || 0;
        const qty = Number(item.quantity) || 0;

        // Consistent Profit Logic for Walk-in
        const costPriceFromDB = pData?.cost;
        const effectiveCost = (costPriceFromDB !== null && costPriceFromDB !== undefined && Number(costPriceFromDB) > 0)
          ? Number(costPriceFromDB)
          : itemPrice;

        if (costPriceFromDB === null || costPriceFromDB === undefined) costMissing = true;

        const margin = (itemPrice - effectiveCost) * qty;
        totalProfit += margin;

        productTally[item.name] = {
          name: item.name,
          qty: (productTally[item.name]?.qty || 0) + qty,
          margin: (productTally[item.name]?.margin || 0) + margin
        };
        const cat = pData?.cat || 'Uncategorized';
        categoryTally[cat] = (categoryTally[cat] || 0) + (itemPrice * qty);
      });
      paymentTally[o.payment_method || 'Cash'] = (paymentTally[o.payment_method || 'Cash'] || 0) + 1;
    });

    const sortedProducts = Object.values(productTally).sort((a, b) => b.qty - a.qty);

    return NextResponse.json({
      summary: {
        totalSales,
        totalOrders,
        avgOrderValue: totalOrders > 0 ? totalSales / totalOrders : 0,
        totalProfit,
        avgProfitPerOrder: totalOrders > 0 ? totalProfit / totalOrders : 0,
        costPriceWarning: costMissing
      },
      chart: Object.values(chartMap).sort((a: any, b: any) => dayjs(a.name, 'MMM DD').unix() - dayjs(b.name, 'MMM DD').unix()),
      heatmap: hourlyDistribution, // NEW
      customers: customerStats,
      topProducts: sortedProducts.slice(0, 10),
      leastProducts: sortedProducts.reverse().slice(0, 10),
      categories: Object.entries(categoryTally).map(([name, value]) => ({ name, value })),
      payments: Object.entries(paymentTally).map(([name, value]) => ({ name, value }))
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}