//src/app/api/partners/products/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { action, data, id } = body
    const storeId = session.user.id

    if (action === 'bulk_insert') {
      const items = data.map((item: any) => ({ ...item, store_id: storeId }))
      const { error } = await supabase.from('products').insert(items)
      if (error) throw error
      return NextResponse.json({ success: true })
    }

    if (action === 'manual_bulk_insert') {
      const { products } = data; // Array of products with variants
      
      for (const row of products) {
        // 1. Create the Parent Global Product using the first variant's details
        const firstVariant = row.variants[0];
        const { data: globalParent, error: globalErr } = await supabase
          .from('global_products')
          .insert({
            name: row.name,
            brand: row.brand,
            image_url: row.image_url,
            category_id: row.category_id,
            unit_type: firstVariant.unit_type,
            unit_metric: firstVariant.unit_metric,
            unit_value: firstVariant.unit_value,
            source: 'manual',
            is_verified: false
          })
          .select('id')
          .single();

        if (globalErr) throw globalErr;

        // 2. Prepare all variants (including parent) for the 'products' table
        const productsToInsert = row.variants.map((v: any, index: number) => ({
          store_id: storeId,
          global_product_id: globalParent.id,
          name: row.name,
          brand: row.brand,
          image_url: row.image_url,
          category_id: row.category_id,
          price: Number(v.price),
          cost_price: Number(v.cost_price) || 0,
          stock_quantity: Number(v.stock_quantity) || 0,
          unit_type: v.unit_type,
          unit_metric: v.unit_metric,
          unit_value: v.unit_value,
          source: 'manual'
        }));

        // 3. If there are extra variants, add them to global_products as children
        if (row.variants.length > 1) {
          const otherVariantsGlobal = row.variants.slice(1).map((v: any) => ({
            name: row.name,
            brand: row.brand,
            image_url: row.image_url,
            category_id: row.category_id,
            unit_type: v.unit_type,
            unit_metric: v.unit_metric,
            unit_value: v.unit_value,
            parent_product_id: globalParent.id,
            source: 'manual',
            is_verified: false
          }));
          
          const { error: variantErr } = await supabase.from('global_products').insert(otherVariantsGlobal);
          if (variantErr) throw variantErr;
        }

        // 4. Finally, insert into store products
        const { error: storeProdErr } = await supabase.from('products').insert(productsToInsert);
        if (storeProdErr) throw storeProdErr;
      }

      return NextResponse.json({ success: true });
    }

    if (action === 'update') {
      const { 
        price, cost_price, stock_quantity, parent_product_id, 
        discount_value, discount_type 
      } = data;

      let discount_id = data.discount_id;

      // Logic: If value > 0, we create/update a discount. If 0, we unlink.
      if (Number(discount_value) > 0) {
        // Product discounts are now strictly 'flat' as per your requirement
        const type = 'flat'; 
        const code = `auto-${id}-${type}`;
        const discountName = `Flat ₹${discount_value} Off`;

        const { data: existing } = await supabase
          .from('discounts')
          .select('id')
          .eq('code', code)
          .single();

        if (existing) {
          await supabase.from('discounts').update({
            discount_type: type,
            discount_value: Number(discount_value),
            name: discountName,
          }).eq('id', existing.id);
          discount_id = existing.id;
        } else {
          const { data: newDiscount, error: insErr } = await supabase
            .from('discounts')
            .insert({
              store_id: storeId,
              code,
              name: discountName,
              discount_type: type,
              discount_value: Number(discount_value),
              applies_to: 'product',
            })
            .select('id')
            .single();
          if (!insErr) discount_id = newDiscount.id;
        }
      } else {
        discount_id = null;
      }

      const { error } = await supabase
        .from('products')
        .update({
          price: Number(price),
          cost_price: Number(cost_price),
          stock_quantity: Number(stock_quantity),
          parent_product_id: parent_product_id,
          discount_id: discount_id
        })
        .eq('id', id)
        .eq('store_id', storeId);

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    // Action: Delete
    if (action === 'delete') {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .eq('store_id', storeId)
      if (error) throw error
      return NextResponse.json({ success: true })
    }

    if (action === 'create_store_discount') {
      const { error } = await supabase.from('discounts').insert({
        ...data,
        store_id: storeId,
        applies_to: 'store',
        code: `store-${Date.now()}`
      });
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === 'delete_discount') {
      const { error } = await supabase.from('discounts').delete().eq('id', id).eq('store_id', storeId);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err: any) {
    console.error("❌ Partner API Error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}