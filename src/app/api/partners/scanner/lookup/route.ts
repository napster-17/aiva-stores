//src/app/api/partners/scanner/lookup/route.ts
import { NextResponse } from 'next/server';
import {
  scannerAdmin,
  getWebScannerUser,
  isValidScannerStore,
} from '@/lib/partners/scanner-server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const user = await getWebScannerUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!(await isValidScannerStore(user.id))) {
      return NextResponse.json(
        { error: 'Partner store not found' },
        { status: 403 }
      );
    }

    const body = await request.json();

    const barcode =
      typeof body?.barcode === 'string'
        ? body.barcode.trim()
        : '';

    if (
      barcode.length < 6 ||
      barcode.length > 80 ||
      !/^[A-Za-z0-9._/+ -]+$/.test(barcode)
    ) {
      return NextResponse.json(
        { error: 'Invalid barcode' },
        { status: 400 }
      );
    }

    // First search the multi-barcode mapping table.
    const { data: mapping, error: mappingError } =
      await scannerAdmin
        .from('global_product_barcodes')
        .select('global_product_id')
        .eq('barcode', barcode)
        .maybeSingle();

    if (mappingError) throw mappingError;

    let product = null;

    if (mapping?.global_product_id) {
      const { data, error } = await scannerAdmin
        .from('global_products')
        .select('*, global_categories(name)')
        .eq('id', mapping.global_product_id)
        .is('deleted_at', null)
        .maybeSingle();

      if (error) throw error;
      product = data;
    }

    // Fallback: barcode directly stored on global_products.
    if (!product) {
      const { data, error } = await scannerAdmin
        .from('global_products')
        .select('*, global_categories(name)')
        .eq('barcode', barcode)
        .is('deleted_at', null)
        .limit(2);

      if (error) throw error;

      if ((data?.length ?? 0) > 1) {
        return NextResponse.json(
          { error: 'Multiple products match this barcode' },
          { status: 409 }
        );
      }

      product = data?.[0] ?? null;
    }

    if (!product) {
      return NextResponse.json({
        success: true,
        found: false,
        barcode,
      });
    }

    // Check if the store already carries this catalog product.
    const { data: existing, error: existingError } =
      await scannerAdmin
        .from('products')
        .select('id')
        .eq('store_id', user.id)
        .eq('global_product_id', product.id)
        .limit(1);

    if (existingError) throw existingError;

    return NextResponse.json({
      success: true,
      found: true,
      alreadyInStore: (existing?.length ?? 0) > 0,
      product,
    });
  } catch (error) {
    console.error('[Scanner] Barcode lookup:', error);

    return NextResponse.json(
      { error: 'Failed to resolve barcode' },
      { status: 500 }
    );
  }
}