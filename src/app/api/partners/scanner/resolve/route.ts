//src/app/api/partners/scanner/resolve/route.ts
import { NextResponse } from 'next/server';
import { scannerAdmin, getWebScannerUser, isValidScannerStore } from '@/lib/partners/scanner-server';

export const dynamic = 'force-dynamic';

const BARCODE_PATTERN = /^[A-Za-z0-9._/+ -]{6,80}$/;
const UNIT_TYPES = new Set(['pack', 'loose']);
const UNIT_METRICS = new Set(['kg', 'gms', 'litre', 'ml', 'pcs', 'nos']);
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type ResolveBody = {
  action?: 'associate' | 'create';
  barcode?: string;
  globalProductId?: string;
  product?: {
    name?: string;
    brand?: string;
    category_id?: string | null;
    image_url?: string | null;
    unit_type?: string | null;
    unit_metric?: string | null;
    unit_value?: number | null;
    price?: number | null;
  };
};

const failure = (error: string, status: number) => NextResponse.json({ error }, { status });

export async function POST(request: Request) {
  try {
    const user = await getWebScannerUser();
    if (!user) return failure('Unauthorized', 401);
    if (!(await isValidScannerStore(user.id))) return failure('Partner store not found', 403);

    const body = (await request.json()) as ResolveBody;
    const barcode = typeof body?.barcode === 'string' ? body.barcode.trim() : '';
    if (!BARCODE_PATTERN.test(barcode)) return failure('Invalid barcode', 400);
    if (body.action !== 'associate' && body.action !== 'create') {
      return failure('Invalid resolution action', 400);
    }

    // Prevent mapping a barcode that already belongs to another product.
    // Database triggers also enforce this across both barcode tables.
    const [aliasResult, primaryResult] = await Promise.all([
      scannerAdmin.from('global_product_barcodes').select('global_product_id')
        .eq('barcode', barcode).maybeSingle(),
      scannerAdmin.from('global_products').select('id')
        .eq('barcode', barcode).limit(2),
    ]);
    if (aliasResult.error) throw aliasResult.error;
    if (primaryResult.error) throw primaryResult.error;
    const existingOwner = aliasResult.data?.global_product_id || primaryResult.data?.[0]?.id || null;

    let productId: string;
    let created = false;
    if (body.action === 'associate') {
      productId = body.globalProductId || '';
      if (!UUID_PATTERN.test(productId)) return failure('Invalid product ID', 400);
      const { data: target, error } = await scannerAdmin.from('global_products')
        .select('id').eq('id', productId).is('deleted_at', null).maybeSingle();
      if (error) throw error;
      if (!target) return failure('Global product not found', 404);
      if (existingOwner && existingOwner !== productId) {
        return failure('Barcode already belongs to a different product', 409);
      }
      if (!existingOwner) {
        const { data: targetProduct, error: targetError } = await scannerAdmin
          .from('global_products')
          .select('barcode')
          .eq('id', productId)
          .single();

        if (targetError) throw targetError;

        if (!targetProduct.barcode) {
          // First barcode: assign it as the primary global barcode.
          const { data: updated, error: updateError } = await scannerAdmin
            .from('global_products')
            .update({ barcode })
            .eq('id', productId)
            .is('barcode', null)
            .select('id');

          if (updateError) {
            if (updateError.code === '23505' || updateError.code === 'P0001') {
              return failure('Barcode was assigned concurrently. Scan it again.', 409);
            }
            throw updateError;
          }

          // Another request may have populated the primary barcode first.
          if (!updated?.length) {
            return failure('Product barcode changed. Please try scanning again.', 409);
          }
        } else {
          // Existing primary barcode: add the scanned barcode as an alias.
          const { error: insertError } = await scannerAdmin
            .from('global_product_barcodes')
            .insert({
              global_product_id: productId,
              barcode,
              source: 'partner_scanner',
            });

          if (insertError) {
            if (insertError.code === '23505' || insertError.code === 'P0001') {
              return failure('Barcode was assigned concurrently. Scan it again.', 409);
            }
            throw insertError;
          }
        }
      }
    } else {
      if (existingOwner) return failure('Barcode already exists in the global catalog', 409);
      const input = body.product;
      const name = typeof input?.name === 'string' ? input.name.trim() : '';
      const brand = typeof input?.brand === 'string' ? input.brand.trim() : '';
      const categoryId = input?.category_id || null;
      const imageUrl = typeof input?.image_url === 'string' ? input.image_url.trim() : null;
      const unitType = input?.unit_type || null;
      const unitMetric = input?.unit_metric || null;
      const unitValue = input?.unit_value == null ? null : Number(input.unit_value);
      const price = input?.price == null ? null : Number(input.price);

      if (!name || name.length > 180 || brand.length > 120) return failure('Invalid product name or brand', 400);
      if (categoryId && !UUID_PATTERN.test(categoryId)) return failure('Invalid category', 400);
      if (unitType && !UNIT_TYPES.has(unitType)) return failure('Invalid unit type', 400);
      if (unitMetric && !UNIT_METRICS.has(unitMetric)) return failure('Invalid unit metric', 400);
      if (unitValue !== null && (!Number.isFinite(unitValue) || unitValue <= 0)) return failure('Invalid unit value', 400);
      if (price !== null && (!Number.isFinite(price) || price < 0)) return failure('Invalid price', 400);
      if (imageUrl && (imageUrl.length > 2000 || !/^https:\/\//i.test(imageUrl))) return failure('Invalid image URL', 400);

      // Use primary barcode on the new global product. The existing database
      // trigger validates format and cross-table ownership.
      const { data: inserted, error: insertError } = await scannerAdmin.from('global_products')
        .insert({
          name,
          brand: brand || null,
          barcode,
          category_id: categoryId,
          image_url: imageUrl || null,
          unit_type: unitType,
          unit_metric: unitMetric,
          unit_value: unitValue,
          price: price === null ? null : String(price),
          source: 'partner_scanner',
          added_by: user.id,
          is_verified: false,
        })
        .select('id').single();
      if (insertError) {
        if (insertError.code === '23505' || insertError.code === 'P0001') {
          return failure('Barcode was assigned concurrently. Scan it again.', 409);
        }
        throw insertError;
      }
      productId = inserted.id;
      created = true;
    }

    const { data: product, error: productError } = await scannerAdmin.from('global_products')
      .select('*, global_categories(name)').eq('id', productId)
      .is('deleted_at', null).single();
    if (productError) throw productError;

    const { data: existingStoreProduct, error: storeError } = await scannerAdmin.from('products')
      .select('id').eq('store_id', user.id).eq('global_product_id', productId).limit(1);
    if (storeError) throw storeError;

    return NextResponse.json({
      success: true,
      created,
      product,
      alreadyInStore: (existingStoreProduct?.length || 0) > 0,
    });
  } catch (error) {
    console.error('[Scanner] Resolve barcode:', error);
    return NextResponse.json({ error: 'Failed to resolve barcode' }, { status: 500 });
  }
}