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

    // Shared lookup for primary and alternative global barcodes.
    const findExistingBarcode = async (barcode: string) => {
      const { data: primary, error: primaryError } = await supabase
        .from('global_products')
        .select('id, name, brand')
        .eq('barcode', barcode)
        .limit(1)
        .maybeSingle();

      if (primaryError) throw primaryError;

      if (primary) {
        return {
          id: primary.id,
          name: primary.name,
          brand: primary.brand,
        };
      }

      const { data: alternative, error: alternativeError } = await supabase
        .from('global_product_barcodes')
        .select('global_product_id, global_products!inner(id, name, brand)')
        .eq('barcode', barcode)
        .limit(1)
        .maybeSingle();

      if (alternativeError) throw alternativeError;

      if (!alternative) return null;

      const linkedProduct = alternative.global_products as unknown as {
        id: string;
        name: string;
        brand: string | null;
      };

      return {
        id: linkedProduct.id,
        name: linkedProduct.name,
        brand: linkedProduct.brand,
      };
    };

    if (action === 'check_barcode') {
      const barcode = String(data?.barcode ?? '').trim();
      const barcodePattern = /^[A-Za-z0-9._/+ -]{6,80}$/;

      if (!barcodePattern.test(barcode)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Enter a valid barcode (6–80 permitted characters)',
          },
          { status: 400 }
        );
      }

      const existing = await findExistingBarcode(barcode);

      return NextResponse.json({
        success: true,
        available: existing === null,
        product: existing,
      });
    }

    if (action === 'bulk_insert') {
      if (!Array.isArray(data) || data.length === 0) {
        return NextResponse.json(
          { error: 'No products provided' },
          { status: 400 }
        );
      }

      const items = data.map((item: any) => ({
        ...item,
        store_id: storeId,
      }));

      const CHUNK_SIZE = 100;
      const chunks = chunkArray(items, CHUNK_SIZE);
      const limit = pLimit(3);

      const results = await Promise.allSettled(
        chunks.map(chunk =>
          limit(async () => {
            const { error } = await supabase
              .from('products')
              .insert(chunk);

            if (error) throw error;
          })
        )
      );

      const failed = results.filter(
        result => result.status === 'rejected'
      );

      if (failed.length > 0) {
        console.error('[Products] Bulk insert failures:', failed);

        return NextResponse.json(
          {
            success: false,
            partial: failed.length < chunks.length,
            failed: failed.length,
            totalChunks: chunks.length,
            error: 'One or more product batches failed',
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        inserted: items.length,
      });
    }

    if (action === 'manual_bulk_insert') {
      const products = data?.products;

      if (!Array.isArray(products) || products.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No manual products provided' },
          { status: 400 }
        );
      }

      const barcodePattern = /^[A-Za-z0-9._/+ -]{6,80}$/;

      // Validate the complete request before creating any records.
      const submittedBarcodes = new Set<string>();

      for (const row of products) {
        if (
          !row.name ||
          !String(row.name).trim() ||
          !Array.isArray(row.variants) ||
          row.variants.length === 0
        ) {
          return NextResponse.json(
            {
              success: false,
              error: 'Each product needs a name and at least one variant',
            },
            { status: 400 }
          );
        }

        for (const variant of row.variants) {
          if (
            variant.price === '' ||
            variant.price === null ||
            variant.price === undefined ||
            !Number.isFinite(Number(variant.price)) ||
            Number(variant.price) < 0 ||
            variant.stock_quantity === '' ||
            variant.stock_quantity === null ||
            variant.stock_quantity === undefined ||
            !Number.isFinite(Number(variant.stock_quantity)) ||
            Number(variant.stock_quantity) < 0
          ) {
            return NextResponse.json(
              {
                success: false,
                error: `Invalid price or stock for ${row.name}`,
              },
              { status: 400 }
            );
          }

          const barcode = String(variant.barcode || '').trim();

          if (barcode) {
            if (!barcodePattern.test(barcode)) {
              return NextResponse.json(
                {
                  success: false,
                  error: `Invalid barcode ${barcode} for ${row.name}`,
                },
                { status: 400 }
              );
            }

            if (submittedBarcodes.has(barcode)) {
              return NextResponse.json(
                {
                  success: false,
                  error: `Duplicate barcode ${barcode} in this request`,
                },
                { status: 400 }
              );
            }

            submittedBarcodes.add(barcode);
          }
        }
      }

      // Reject existing global barcodes before inserting records.
      // This protects against bypassing the frontend verification.
      for (const barcode of submittedBarcodes) {
        const existing = await findExistingBarcode(barcode);

        if (existing) {
          return NextResponse.json(
            {
              success: false,
              error: `Barcode ${barcode} already belongs to "${existing.name}". Please select this product from the Global Catalog instead.`,
              existingProduct: existing,
            },
            { status: 409 }
          );
        }
      }

      const CHUNK_SIZE = 50;
      const chunks = chunkArray(products, CHUNK_SIZE);
      const limit = pLimit(3);

      let insertedProducts = 0;
      const failures: string[] = [];

      // Process each product and its variants together.
      const insertManualProduct = async (row: any) => {
        const firstVariant = row.variants[0];

        const normalizeBarcode = (value: any): string | null => {
          const barcode = String(value || '').trim();
          return barcode || null;
        };

        const commonGlobalFields = {
          name: String(row.name).trim(),
          brand: row.brand || null,
          image_url: row.image_url || null,
          category_id: row.category_id || null,
          source: 'manual',
          is_verified: false,
        };

        const commonStoreFields = {
          store_id: storeId,
          name: String(row.name).trim(),
          brand: row.brand || null,
          image_url: row.image_url || null,
          category_id: row.category_id || null,
          source: 'manual',
        };

        // STEP 1: Create the global parent using the first variant.
        const { data: globalParent, error: globalParentError } =
          await supabase
            .from('global_products')
            .insert({
              ...commonGlobalFields,
              barcode: normalizeBarcode(firstVariant.barcode),
              unit_type: firstVariant.unit_type,
              unit_metric: firstVariant.unit_metric,
              unit_value:
                firstVariant.unit_value === ''
                  ? null
                  : Number(firstVariant.unit_value),
            })
            .select('id')
            .single();

        if (globalParentError || !globalParent) {
          throw new Error(
            `Global parent: ${globalParentError?.message || 'Creation failed'}`
          );
        }

        // STEP 2: Create the corresponding store parent.
        const { data: storeParent, error: storeParentError } =
          await supabase
            .from('products')
            .insert({
              ...commonStoreFields,
              global_product_id: globalParent.id,
              parent_product_id: null,
              barcode: normalizeBarcode(firstVariant.barcode),
              price: Number(firstVariant.price),
              cost_price: Number(firstVariant.cost_price) || 0,
              stock_quantity: Number(firstVariant.stock_quantity),
              unit_type: firstVariant.unit_type,
              unit_metric: firstVariant.unit_metric,
              unit_value:
                firstVariant.unit_value === ''
                  ? null
                  : Number(firstVariant.unit_value),
            })
            .select('id')
            .single();

        if (storeParentError || !storeParent) {
          throw new Error(
            `Store parent: ${storeParentError?.message || 'Creation failed'}`
          );
        }

        // STEP 3: Create remaining variants, each with its own
        // global product and matching store product.
        for (const variant of row.variants.slice(1)) {
          const barcode = normalizeBarcode(variant.barcode);

          const { data: globalChild, error: globalChildError } =
            await supabase
              .from('global_products')
              .insert({
                ...commonGlobalFields,
                parent_product_id: globalParent.id,
                barcode,
                unit_type: variant.unit_type,
                unit_metric: variant.unit_metric,
                unit_value:
                  variant.unit_value === ''
                    ? null
                    : Number(variant.unit_value),
              })
              .select('id')
              .single();

          if (globalChildError || !globalChild) {
            throw new Error(
              `Global variant: ${globalChildError?.message || 'Creation failed'}`
            );
          }

          const { error: storeChildError } = await supabase
            .from('products')
            .insert({
              ...commonStoreFields,
              global_product_id: globalChild.id,
              parent_product_id: storeParent.id,
              barcode,
              price: Number(variant.price),
              cost_price: Number(variant.cost_price) || 0,
              stock_quantity: Number(variant.stock_quantity),
              unit_type: variant.unit_type,
              unit_metric: variant.unit_metric,
              unit_value:
                variant.unit_value === ''
                  ? null
                  : Number(variant.unit_value),
            });

          if (storeChildError) {
            throw new Error(
              `Store variant: ${storeChildError.message}`
            );
          }
        }

        return row.variants.length;
      };

      // Limit actual database work to three products at a time.
      for (const chunk of chunks) {
        const results = await Promise.allSettled(
          chunk.map((row: any) =>
            limit(() => insertManualProduct(row))
          )
        );

        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            insertedProducts += result.value;
          } else {
            const productName = chunk[index]?.name || 'Unnamed product';
            const reason =
              result.reason instanceof Error
                ? result.reason.message
                : String(result.reason);

            console.error(
              `[Products] Manual insertion failed for ${productName}:`,
              result.reason
            );

            failures.push(`${productName}: ${reason}`);
          }
        });

        // Do not start another chunk after a failure.
        if (failures.length > 0) break;
      }

      if (failures.length > 0) {
        return NextResponse.json(
          {
            success: false,
            partial: insertedProducts > 0,
            inserted: insertedProducts,
            failed: failures.length,
            error: 'One or more manual products failed to save',
            details: failures,
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        inserted: insertedProducts,
      });
    }

    if (action === 'update') {
      const {
        price,
        cost_price,
        stock_quantity,
        parent_product_id,
        discount_value
      } = data;

      let discount_id = data.discount_id;

      // ---- discount logic (same as before) ----
      if (Number(discount_value) > 0) {
        const code = `auto-${id}-flat`;
        const discountName = `Flat ₹${discount_value} Off`;

        const { data: existing } = await supabase
          .from('discounts')
          .select('id')
          .eq('code', code)
          .single();

        if (existing) {
          await supabase.from('discounts').update({
            discount_value: Number(discount_value),
            name: discountName,
          }).eq('id', existing.id);

          discount_id = existing.id;
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
            .single();

          discount_id = newDiscount?.id;
        }
      } else {
        discount_id = null;
      }

      // ---- IMPORTANT: direct update (NOT RPC) ----
      const { error } = await supabase
        .from('products')
        .update({
          price: Number(price),
          cost_price: Number(cost_price),
          stock_quantity: Number(stock_quantity),
          parent_product_id: parent_product_id ?? null,
          discount_id
        })
        .eq('id', id)
        .eq('store_id', storeId);

      if (error) throw error;

      return NextResponse.json({ success: true });
    }

    if (action === 'bulk_update') {
      const payload = data.map((item: any) => ({
        ...item,
        store_id: storeId
      }));

      const { error } = await supabase.rpc('bulk_update_products', {
        input: payload
      });

      if (error) throw error;

      return NextResponse.json({ success: true });
    }

    // Action: Delete
    if (action === 'delete') {
      const { error } = await supabase.rpc('bulk_delete_products', {
        ids: [id]
      });

      if (error) throw error;

      return NextResponse.json({ success: true });
    }

    if (action === 'bulk_delete') {
      const { error } = await supabase.rpc('bulk_delete_products', {
        ids: data
      });

      if (error) throw error;

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