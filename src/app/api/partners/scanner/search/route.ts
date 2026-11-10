//src/app/api/partners/scanner/search/route.ts
import { NextResponse } from 'next/server';
import { scannerAdmin, getWebScannerUser, isValidScannerStore } from '@/lib/partners/scanner-server';

export const dynamic = 'force-dynamic';

type CatalogProduct = {
  id: string;
  name: string;
  brand: string | null;
  barcode: string | null;
  image_url: string | null;
  price: string | null;
  global_categories: { name: string } | null;
  [key: string]: unknown;
};

export async function POST(request: Request) {
  try {
    const user = await getWebScannerUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!(await isValidScannerStore(user.id))) {
      return NextResponse.json({ error: 'Partner store not found' }, { status: 403 });
    }

    const body = await request.json();
    const term = typeof body?.query === 'string' ? body.query.trim().replace(/\s+/g, ' ') : '';
    if (term.length < 2 || term.length > 100) {
      return NextResponse.json({ error: 'Enter 2–100 characters' }, { status: 400 });
    }

    // Escape LIKE wildcards so user text is treated literally.
    const pattern = term.replace(/[\\%_]/g, '\\$&');
    const select = '*, global_categories(name)';
    const [nameResult, brandResult] = await Promise.all([
      scannerAdmin.from('global_products').select(select)
        .is('deleted_at', null).ilike('name', `%${pattern}%`).limit(50),
      scannerAdmin.from('global_products').select(select)
        .is('deleted_at', null).ilike('brand', `%${pattern}%`).limit(50),
    ]);
    if (nameResult.error) throw nameResult.error;
    if (brandResult.error) throw brandResult.error;

    const unique = new Map<string, CatalogProduct>();
    for (const product of [...(nameResult.data || []), ...(brandResult.data || [])]) {
      unique.set(product.id, product as CatalogProduct);
    }

    const q = term.toLocaleLowerCase();
    const rank = (p: CatalogProduct) => {
      const name = p.name.toLocaleLowerCase();
      const brand = (p.brand || '').toLocaleLowerCase();
      if (name === q) return 0;
      if (brand === q) return 1;
      if (name.startsWith(q)) return 2;
      if (brand.startsWith(q)) return 3;
      if (name.split(/\s+/).some(w => w === q)) return 4;
      if (name.includes(q)) return 5;
      return 6;
    };
    const products = [...unique.values()]
      .sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name))
      .slice(0, 30);

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error('[Scanner] Search products:', error);
    return NextResponse.json({ error: 'Failed to search global catalog' }, { status: 500 });
  }
}