//src/utils/buildBillingRows.ts: Used for virtualization on walkin-billing/page.tsx
export function buildBillingRows<T>(items: T[], itemsPerRow: number): T[][] {
  const rows: T[][] = [];

  for (let i = 0; i < items.length; i += itemsPerRow) {
    rows.push(items.slice(i, i + itemsPerRow));
  }

  return rows;
}