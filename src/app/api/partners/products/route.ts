//src/app/api/partners/products/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { chunkArray } from '@/utils/chunkArray';
import pLimit from 'p-limit'

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
      const items = data.map((item: any) => ({ ...item, store_id: storeId }));

      const CHUNK_SIZE = 100;
      const chunks = chunkArray(items, CHUNK_SIZE);

      const limit = pLimit(3);

      const results = await Promise.allSettled(
        chunks.map(chunk =>
          limit(() => supabase.from('products').insert(chunk))
        )
      );

      const failed = results.filter(r => r.status === 'rejected');

      if (failed.length > 0) {
        return NextResponse.json({
          success: false,
          partial: true,
          failed: failed.length
        }, { status: 207 });
      }

      return NextResponse.json({ success: true });
    }

    if (action === 'manual_bulk_insert') {
      const { products } = data;

      const CHUNK_SIZE = 50;
      const chunks = chunkArray(products, CHUNK_SIZE);

      for (const chunk of chunks) {
        const promises = chunk.map(async (row: any) => {
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

          const productsToInsert = row.variants.map((v: any) => ({
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

          if (row.variants.length > 1) {
            const children = row.variants.slice(1).map((v: any) => ({
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

            const { error: childErr } = await supabase.from('global_products').insert(children);
            if (childErr) throw childErr;
          }

          const { error: storeErr } = await supabase.from('products').insert(productsToInsert);
          if (storeErr) throw storeErr;
        });

        const limit = pLimit(3);

        const results = await Promise.allSettled(
          promises.map(p => limit(() => p))
        );

        const failed = results.filter(r => r.status === 'rejected');
        if (failed.length > 0) {
          return NextResponse.json({
            success: false,
            partial: true,
            failed: failed.length
          }, { status: 207 });
        }
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

    if (action === 'bulk_update') {
      const CHUNK_SIZE = 100
      const chunks = chunkArray(data, CHUNK_SIZE)

      for (const chunk of chunks) {
        const promises = chunk.map(async (item: any) => {
          const {
            id,
            price,
            cost_price,
            stock_quantity,
            discount_value
          } = item

          let discount_id = item.discount_id

          if (Number(discount_value) > 0) {
            const code = `auto-${id}-flat`
            const discountName = `Flat ₹${discount_value} Off`

            const { data: existing } = await supabase
              .from('discounts')
              .select('id')
              .eq('code', code)
              .single()

            if (existing) {
              await supabase.from('discounts').update({
                discount_value: Number(discount_value),
                name: discountName,
              }).eq('id', existing.id)

              discount_id = existing.id
            } else {
              const { data: newDiscount } = await supabase
                .from('discounts')
                .insert({
                  store_id: storeId,
                  code,
                  name: discountName,
                  discount_type: 'flat',
                  discount_value: Number(discount_value),
                  applies_to: 'product',
                })
                .select('id')
                .single()

              discount_id = newDiscount?.id
            }
          } else {
            // DO NOT delete manually → let SQL trigger handle it
            discount_id = null
          }

          return supabase
            .from('products')
            .update({
              price: Number(price),
              cost_price: Number(cost_price),
              stock_quantity: Number(stock_quantity),
              discount_id
            })
            .eq('id', id)
            .eq('store_id', storeId)
        })

        const limit = pLimit(5);
        await Promise.all(
          promises.map(p => limit(() => p))
        )
      }

      return NextResponse.json({ success: true })
    }

    // Action: Delete
    if (action === 'delete') {
      // get discount_id first
      const { data: product } = await supabase
        .from('products')
        .select('discount_id')
        .eq('id', id)
        .single();

        // get children
        const { data: children } = await supabase
          .from('products')
          .select('id')
          .eq('parent_product_id', id);

        if (children && children.length > 0) {
          const newParentId = children[0].id;

        // promote first child → root
        await supabase
          .from('products')
          .update({ parent_product_id: null })
          .eq('id', newParentId);

        // reassign remaining children to new parent
        const remainingIds = children
          .slice(1)
          .map(c => c.id);

        if (remainingIds.length > 0) {
          await supabase
            .from('products')
            .update({ parent_product_id: newParentId })
            .in('id', remainingIds);
        }
      }
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .eq('store_id', storeId);

      if (error) throw error;

      // delete discount if exists
      if (product?.discount_id) {
        await supabase
          .from('discounts')
          .delete()
          .eq('id', product.discount_id)
          .eq('store_id', storeId);
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'bulk_delete') {
      const ids = data;

      // 1. Get all discount_ids BEFORE deleting products
      const { data: productsWithDiscounts } = await supabase
        .from('products')
        .select('discount_id')
        .in('id', ids)
        .eq('store_id', storeId);

      const discountIds = (productsWithDiscounts || [])
        .map(p => p.discount_id)
        .filter(Boolean);

      // 2. Handle parent-child orphaning
      await supabase
        .from('products')
        .update({ parent_product_id: null })
        .in('parent_product_id', ids);

      // 3. Delete products  
      const { error } = await supabase
        .from('products')
        .delete()
        .in('id', ids)
        .eq('store_id', storeId);

      if (error) throw error;

      // 4. Delete related discounts (IMPORTANT)
      if (discountIds.length > 0) {
        await supabase
          .from('discounts')
          .delete()
          .in('id', discountIds)
          .eq('store_id', storeId);
      }
      return NextResponse.json({ success: true });
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