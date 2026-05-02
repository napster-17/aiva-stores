// src/utils/chunkArray.ts
export function chunkArray<T>(array: T[], size: number): T[][] {
  if (!Array.isArray(array)) return [];
  if (size <= 0) return [array];

  const result: T[][] = [];

  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }

  return result;
}