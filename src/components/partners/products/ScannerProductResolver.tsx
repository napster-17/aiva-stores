//src/components/partners/products/ScannerProductResolver.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Check, ChevronRight, Loader2, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import ScannerNewProductForm from './ScannerNewProductForm';

type Category = { id: string; name: string };
type Props = {
  barcodes: string[];
  storeId: string;
  categories: Category[];
  activeBarcodeRequest?: string | null;
  onResolved: (product: any, alreadyInStore: boolean, barcode: string) => void;
  onClear: () => void;
};

export default function ScannerProductResolver({
  barcodes,
  storeId,
  categories,
  activeBarcodeRequest,
  onResolved,
  onClear,
}: Props) {
  const [activeBarcode, setActiveBarcode] = useState<string | null>(null);
  const [mode, setMode] = useState<'match' | 'create'>('match');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [associating, setAssociating] = useState<string | null>(null);

  useEffect(() => {
    if (!activeBarcodeRequest) return;

    setActiveBarcode(activeBarcodeRequest);
    setMode('match');
    setQuery('');
    setResults([]);
  }, [activeBarcodeRequest]);

  useEffect(() => {
    if (activeBarcode && !barcodes.includes(activeBarcode)) setActiveBarcode(null);
  }, [activeBarcode, barcodes]);

  useEffect(() => {
    if (!activeBarcode || mode !== 'match' || query.trim().length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const response = await fetch('/api/partners/scanner/search', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: query.trim() }), signal: controller.signal,
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Search failed');
        setResults(result.products || []);
      } catch (error: any) {
        if (error.name !== 'AbortError') toast.error(error.message || 'Search failed');
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 300);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query, activeBarcode, mode]);

  const openBarcode = (barcode: string) => {
    setActiveBarcode(barcode);
    setMode('match');
    setQuery('');
    setResults([]);
  };

  const associate = async (productId: string) => {
    if (!activeBarcode || associating) return;
    const barcode = activeBarcode;
    setAssociating(productId);
    try {
      const response = await fetch('/api/partners/scanner/resolve', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'associate', barcode, globalProductId: productId }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not associate barcode');
      onResolved(result.product, result.alreadyInStore, barcode);
      setActiveBarcode(null);
      toast.success('Barcode linked to global product');
    } catch (error: any) {
      toast.error(error.message || 'Could not associate barcode');
    } finally {
      setAssociating(null);
    }
  };

  if (barcodes.length === 0) return null;

  return (
    <div className="bg-white">
    <div className="flex items-center justify-between gap-3 border-b border-amber-100 bg-amber-50/80 px-4 py-3">
        <div>
        <p className="text-sm font-semibold text-amber-900">
            Find or add products
        </p>
        <p className="mt-0.5 text-xs text-amber-700">
            {barcodes.length} barcodes need a product
        </p>
        </div>

        <button
        type="button"
        onClick={onClear}
        disabled={!!associating}
        className="min-h-10 shrink-0 px-2 text-xs font-semibold text-amber-700 hover:underline disabled:opacity-50"
        >
        Skip all
        </button>
    </div>

    <div className="px-4 py-4">
        {!activeBarcode ? (
          <div className="space-y-2">
            {barcodes.map(barcode => (
              <button key={barcode} type="button" onClick={() => openBarcode(barcode)} className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-left hover:border-orange-300 hover:bg-orange-50/30">
                <span className="min-w-0">
                <span className="block text-sm font-semibold text-slate-800">
                    Product not found
                </span>
                <span className="mt-1 block break-all font-mono text-xs text-slate-500">
                    {barcode}
                </span>
                </span>

                <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-orange-600">
                Find product
                <ChevronRight size={14} />
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2"><div className="min-w-0">
                <p className="text-xs font-medium text-slate-500"> Find the product for this barcode </p>
                <p className="truncate font-mono text-xs font-bold text-slate-900">{activeBarcode}</p></div><button type="button" onClick={() => setActiveBarcode(null)} aria-label="Back to unmatched barcodes" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={16} /></button></div>
            {mode === 'create' ? (
              <ScannerNewProductForm barcode={activeBarcode} storeId={storeId} categories={categories} onBack={() => setMode('match')} onResolved={(product, already, barcode) => { onResolved(product, already, barcode); setActiveBarcode(null); }} />
            ) : (
              <>
                <div className="relative"><Search size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  placeholder="Enter product name or brand"
                  aria-label="Search product name or brand"
                  className="h-11 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
                </div>
                {searching && <p className="flex items-center gap-2 text-xs text-slate-500"><Loader2 size={14} className="animate-spin" /> Searching catalog...</p>}
                {!searching && query.trim().length >= 2 && results.length === 0 && <p className="rounded-lg bg-slate-50 px-3 py-3 text-xs text-slate-500">No matching products found. Try a shorter name or create a new product.</p>}
                {results.length > 0 && <div className="space-y-1.5">{results.map(product => (
                  <button key={product.id} type="button" disabled={!!associating} onClick={() => void associate(product.id)} className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-2.5 text-left hover:border-orange-300 disabled:opacity-60">
                    <img src={product.image_url || '/assets/product_fallback.jpg'} alt="" className="h-11 w-11 shrink-0 rounded-lg bg-slate-50 object-contain" />
                    <span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-slate-800">{product.name}</span><span className="block truncate text-[11px] text-slate-500">{product.brand || 'Generic'} · {product.unit_value || ''} {product.unit_metric || ''}</span></span>
                    {associating === product.id ? <Loader2 size={15} className="animate-spin text-orange-600" /> : <Check size={15} className="text-orange-600" />}
                  </button>
                ))}</div>}
                <button
                  type="button"
                  onClick={() => setMode('create')}
                  disabled={!!associating}
                  className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-3 py-3 text-sm font-semibold text-orange-700 hover:bg-orange-100 disabled:opacity-50"
                >
                Add a new product
                <ChevronRight size={15} />
                </button>
                <p className="text-xs leading-5 text-slate-500">
                  Select the exact product and pack size. This barcode will
                  be linked to that product for all stores.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}