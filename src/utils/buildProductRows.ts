//src/utils/buildProductRows.ts: Used for virtualization on products/page.tsx
export type Row =
  | { type: 'category'; category: string }
  | { type: 'product'; product: any; isChild: false }
  | { type: 'product'; product: any; isChild: true };

export function buildRows({
  groupedProducts,
  allProducts,
  expandedParents,
  displayCategories,
}: {
  groupedProducts: Record<string, any[]>;
  allProducts: any[];
  expandedParents: Set<string>;
  displayCategories: string[];
}): Row[] {
  const rows: Row[] = [];

  // Precompute children map (O(n))
  const childrenMap = new Map<string, any[]>();

  for (const p of allProducts) {
    if (p.parent_product_id) {
      if (!childrenMap.has(p.parent_product_id)) {
        childrenMap.set(p.parent_product_id, []);
      }
      childrenMap.get(p.parent_product_id)!.push(p);
    }
  }

  for (const category of displayCategories) {
    rows.push({ type: 'category', category });

    for (const product of groupedProducts[category] || []) {
      rows.push({ type: 'product', product, isChild: false });

      if (expandedParents.has(product.id)) {
        const children = childrenMap.get(product.id) || [];

        for (const child of children) {
          rows.push({ type: 'product', product: child, isChild: true });
        }
      }
    }
  }

  return rows;
}