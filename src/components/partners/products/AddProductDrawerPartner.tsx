//src/components/partners/products/AddProductDrawerPartner.tsx
//Updated with concurrency
//Updated for atomicity
'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Search, Loader2, CheckCircle2, Trash2, Package, Tag, Layers, AlertCircle, ShieldCheck } from 'lucide-react';
import { Plus, ImagePlus, ScanBarcode } from 'lucide-react';
import { toast } from 'sonner';
import pLimit from 'p-limit';

import { createClient } from '@/lib/supabase/client';
import { uploadProductImage } from '@/lib/partners/product-upload';

import { Input } from '@/components/input';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import PhoneScannerPairing, { type PhoneScannerPairingHandle, type ScannerDisplayResult, } from '@/components/partners/products/PhoneScannerPairing';
import ScannerProductResolver from '@/components/partners/products/ScannerProductResolver';

import { usePartnerProfile } from '../PartnerProfileProvider';
import { chunkArray } from '@/utils/chunkArray';

const UNIT_TYPES = ['pack', 'loose'];
const UNIT_METRICS = ['kg', 'gms', 'litre', 'ml', 'pcs', 'nos'];

const supabase = createClient();
const ITEMS_PER_PAGE = 40;

export type AddProductMode = 'catalog' | 'scanner' | 'manual';

interface Props {
  isOpen: boolean;
  mode: AddProductMode;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddProductDrawerPartner({ isOpen, mode, onClose, onSuccess }: Props) {
  const { profile } = usePartnerProfile();
  const storeId = profile?.id;

  const [globalProducts, setGlobalProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [existingGlobalIds, setExistingGlobalIds] = useState<Set<string>>(new Set());
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItems, setSelectedItems] = useState<Map<string, any>>(new Map());
  
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [activeTab, setActiveTab] = useState<'catalog' | 'manual'>('catalog');

  const [scannerOpen, setScannerOpen] = useState(false);

  const scannerPairingRef = useRef<PhoneScannerPairingHandle>(null);
  const scannerClosingRef = useRef(false);
  const [scannerClosing, setScannerClosing] = useState(false);

  // Set the requested workspace whenever the drawer opens.
  useEffect(() => {
    if (!isOpen) return;
    if (mode === 'manual') { setActiveTab('manual'); setScannerOpen(false);
    } else if (mode === 'scanner') { setActiveTab('catalog'); setScannerOpen(true);
    } else { setActiveTab('catalog'); setScannerOpen(false); }
  }, [isOpen, mode]);

  const closeScannerPanel = async (): Promise<boolean> => {
    if (scannerClosingRef.current) return false;

    scannerClosingRef.current = true;
    setScannerClosing(true);

    try {
      const disconnected = await scannerPairingRef.current?.disconnect() ?? true;
      if (!disconnected) { return false; }
      setScannerOpen(false);
      return true;
    } finally {
      scannerClosingRef.current = false;
      setScannerClosing(false);
    }
  };

  const handleCloseDrawer = async () => {
    const closed = await closeScannerPanel();
    if (!closed) return;
    setActiveTab('catalog');
    onClose();
  };

  const [unknownBarcodes, setUnknownBarcodes] = useState<string[]>([]);
  const [scanResults, setScanResults] = useState< Record<string, ScannerDisplayResult> >({});
  const [resolverBarcode, setResolverBarcode] = useState<string | null>(null);

  const updateScanResult = useCallback(( barcode: string, result: ScannerDisplayResult
    ) => { setScanResults(previous => ({ ...previous, [barcode]: result, })); }, 
  []);

  const [manualRows, setManualRows] = useState<any[]>([{
    id: crypto.randomUUID(), name: '', brand: '', category_id: '', image_url: '',
    variants: [{ id: crypto.randomUUID(), unit_type: 'pack', unit_metric: 'pcs', unit_value: '', price: '', cost_price: '', stock_quantity: '', barcode: '' }]
  }]);
  
  type BarcodeCheck = {
    status: 'checking' | 'available' | 'exists' | 'error' | 'duplicate';
    barcode: string;
    product?: { id: string; name: string; brand: string | null; } | null;
    duplicateLocations?: string[];
  };
  // Results returned by the global-catalog verification.
  const [catalogBarcodeChecks, setBarcodeChecks] = useState< Record<string, BarcodeCheck> >({});
  const barcodePattern = /^[A-Za-z0-9._/+ -]{6,80}$/;

  // Check every barcode in the current form, including the first
  // variant used to create the parent product.
  const manualBarcodeLocations = new Map< string, { variantId: string; label: string }[] >();
  manualRows.forEach((row, rowIndex) => {
    row.variants.forEach((variant: any, variantIndex: number) => {
      const barcode = String(variant.barcode || '').trim();
      // Multiple empty barcode fields are allowed.
      if (!barcode) return;
      const locations = manualBarcodeLocations.get(barcode) || [];
      locations.push({
        variantId: String(variant.id),
        label: `Product ${rowIndex + 1}${ String(row.name || '').trim() ? ` (${String(row.name).trim()})` : ''
        } — ${
          variantIndex === 0 ? 'Parent / first variant' : `Variant ${variantIndex + 1}`
        }`,
      });

      manualBarcodeLocations.set(barcode, locations);
    });
  });

  // Local duplicates take priority over database availability.
  // This is derived on every render, so correcting or removing
  // a duplicate immediately removes its warning.
  const barcodeChecks: Record<string, BarcodeCheck> = { ...catalogBarcodeChecks, };

  for (const [barcode, locations] of manualBarcodeLocations) {
    if (locations.length < 2) continue;

    for (const location of locations) {
      barcodeChecks[location.variantId] = {
        status: 'duplicate',
        barcode,
        duplicateLocations: locations
          .filter(other => other.variantId !== location.variantId)
          .map(other => other.label),
      };
    }
  }

  // Only barcode changes should restart verification,
  // not edits to prices, stock, names, or categories.
  const barcodeSignature = JSON.stringify(
    manualRows.flatMap(row =>
      row.variants.map((v: any) => [ v.id, String(v.barcode || '').trim(), ])
    )
  );

  const observerTarget = useRef<HTMLDivElement>(null);

    useEffect(() => {
    if (!isOpen) return;

    const variants = manualRows.flatMap(row =>
      row.variants.map((v: any) => ({
        id: String(v.id), barcode: String(v.barcode || '').trim(),
      }))
    );

    // Remove outdated results whenever a barcode changes.
    setBarcodeChecks(prev => {
      const next: Record<string, BarcodeCheck> = {};

      for (const variant of variants) {
        if (
          variant.barcode &&
          barcodePattern.test(variant.barcode)
        ) {
          const previous = prev[variant.id];

          next[variant.id] =
            previous &&
            previous.barcode === variant.barcode &&
            previous.status !== 'error' ? previous : { status: 'checking', barcode: variant.barcode, };
        }
      }

      return next;
    });

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      const toCheck = variants.filter(
        v => v.barcode && barcodePattern.test(v.barcode)
      );

      await Promise.all(
        toCheck.map(async variant => {
          try {
            const response = await fetch('/api/partners/products', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              signal: controller.signal,
              body: JSON.stringify({
                action: 'check_barcode',
                data: { barcode: variant.barcode },
              }),
            });

            const result = await response.json();

            if (!response.ok || result.success !== true) {
              throw new Error(result.error || 'Verification failed');
            }

            if (controller.signal.aborted) return;

            setBarcodeChecks(prev => ({
              ...prev,
              [variant.id]: {
                barcode: variant.barcode,
                status: result.available ? 'available' : 'exists',
                product: result.product || null,
              },
            }));
          } catch (error) {
            if (controller.signal.aborted) return;

            setBarcodeChecks(prev => ({
              ...prev,
              [variant.id]: {
                barcode: variant.barcode,
                status: 'error',
              },
            }));
          }
        })
      );
    }, 500);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [barcodeSignature, isOpen]);

  useEffect(() => {
    if (!isOpen || !storeId) return;
    const fetchMetadata = async () => {
      const [catRes, existingRes] = await Promise.all([
        supabase.from('global_categories').select('*').order('name'),
        supabase.from('products').select('global_product_id').eq('store_id', storeId)
      ]);
      if (catRes.data) setCategories(catRes.data);
      if (existingRes.data) {
        const ids = new Set(existingRes.data.map(p => p.global_product_id).filter(Boolean) as string[]);
        setExistingGlobalIds(ids);
      }
    };
    fetchMetadata();
  }, [isOpen, storeId]);

  const fetchProducts = useCallback(async (isNewSearch: boolean = false) => {
    const currentPage = isNewSearch ? 0 : page;
    if (isNewSearch) setLoading(true); else setLoadingMore(true);

    try {
      let query = supabase
        .from('global_products')
        .select('*, global_categories(name)')
        .order('name', { ascending: true })
        .range(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE - 1);

      if (searchQuery.trim()) {
        query = query.or(`name.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%`);
      }
      if (selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;

      if (isNewSearch) {
        setGlobalProducts(data || []);
        setPage(1);
      } else {
        setGlobalProducts(prev => [...prev, ...(data || [])]);
        setPage(prev => prev + 1);
      }
      setHasMore(data?.length === ITEMS_PER_PAGE);
    } catch (err) {
      toast.error("Failed to load catalog");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchQuery, selectedCategory, page]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      setPage(0); // Reset page counter
      fetchProducts(true);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, isOpen]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          fetchProducts(false);
        }
      },
      { threshold: 0.5 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [fetchProducts, hasMore, loading, loadingMore]);

  const toggleSelection = (product: any) => {
    if (existingGlobalIds.has(product.id)) return;
    setSelectedItems(prev => {
      const next = new Map(prev);
      if (next.has(product.id)) {
        next.delete(product.id);
      } else {
        next.set(product.id, { 
          ...product, 
          qty: 10, 
          cost: 0, 
          sell: Number(product.price) || 0,
          category_name: product.global_categories?.name 
        });
      }
      return next;
    });
  };

  // Barcode scanning must ADD, never toggle a selected product off.
  const addScannedProduct = useCallback((
    product: any,
    scannedBarcode?: string
  ) => {
    if (existingGlobalIds.has(product.id)) {
      toast.info(`${product.name} is already in your inventory`);
      return;
    }

    setSelectedItems(prev => {
      if (prev.has(product.id)) return prev;

      const next = new Map(prev);

      next.set(product.id, {
        ...product,
        scanned_barcode: scannedBarcode || product.barcode || null,
        qty: 10,
        cost: 0,
        sell: Number(product.price) || 0,
        category_name: product.global_categories?.name || 'Uncategorized',
      });

      return next;
    });
  }, [existingGlobalIds]);

  const handleScannedBarcode = useCallback(async (barcode: string) => {
    updateScanResult(barcode, { status: 'checking' });

    try {
      const response = await fetch('/api/partners/scanner/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Barcode lookup failed');
      }

      if (!result.found) {
        setUnknownBarcodes(previous =>
          previous.includes(barcode)
            ? previous
            : [barcode, ...previous]
        );

        updateScanResult(barcode, { status: 'unmatched' });
        return;
      }

      if (result.alreadyInStore || existingGlobalIds.has(result.product.id)) {
        updateScanResult(barcode, {
          status: 'existing',
          productId: result.product.id,
          productName: result.product.name,
        });

        toast.info(`${result.product.name} is already in your store`);
        return;
      }

      addScannedProduct(result.product, barcode);

      updateScanResult(barcode, {
        status: 'ready',
        productId: result.product.id,
        productName: result.product.name,
      });

      setUnknownBarcodes(previous =>
        previous.filter(value => value !== barcode)
      );
    } catch (error: any) {
      updateScanResult(barcode, {
        status: 'error',
        message: error.message || 'Could not check this barcode',
      });

      toast.error(error.message || 'Failed to resolve barcode');
    } 
  }, [addScannedProduct, existingGlobalIds, updateScanResult]);

  // Called after an unmatched barcode is successfully resolved.
  const handleResolvedBarcode = useCallback((
    product: any,
    alreadyInStore: boolean,
    barcode: string
  ) => {
    setUnknownBarcodes(previous =>
      previous.filter(value => value !== barcode)
    );

    setResolverBarcode(previous =>
      previous === barcode ? null : previous
    );

    if (alreadyInStore || existingGlobalIds.has(product.id)) {
      updateScanResult(barcode, {
        status: 'existing',
        productId: product.id,
        productName: product.name,
      });

      toast.info(`${product.name} is already in your store`);
      return;
    }

    addScannedProduct(product, barcode);

    updateScanResult(barcode, {
      status: 'ready',
      productId: product.id,
      productName: product.name,
    });
  }, [addScannedProduct, existingGlobalIds, updateScanResult]);

  const handleUpdateItem = (id: string, field: string, value: number) => {
    setSelectedItems(prev => {
      const next = new Map(prev);
      const item = next.get(id);
      if (item) next.set(id, { ...item, [field]: value });
      return next;
    });
  };

  const CHUNK_SIZE = 100;

  const handleBulkAdd = async () => {
    setLoading(true);

    const itemsToInsert = Array.from(selectedItems.values()).map(item => ({
      global_product_id: item.id,
      name: item.name,
      barcode: item.scanned_barcode || item.barcode || null,
      price: item.sell || 0,
      cost_price: item.cost || 0,
      stock_quantity: item.qty || 0,
      image_url: item.image_url,
      category_id: item.category_id || null,
      unit_type: item.unit_type || null,
      unit_metric: item.unit_metric || null,
      unit_value: item.unit_value || 0,
      brand: item.brand || null,
      store_id: storeId
    }));

    const chunks = chunkArray(itemsToInsert, CHUNK_SIZE);
    const limit = pLimit(3);

    try {
      const tasks = chunks.map((chunk, i) =>
        limit(async () => {
          const response = await fetch('/api/partners/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'bulk_insert', data: chunk })
          });

          if (!response.ok) {
            throw new Error(`Chunk ${i + 1} failed`);
          }
        })
      );

      await Promise.all(tasks);

      toast.success(`Successfully added ${itemsToInsert.length} products`);
      onSuccess();
      setSelectedItems(new Map());
      await handleCloseDrawer();

    } catch (error: any) {
      toast.error(error.message || "Bulk import failed");
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async () => {
    // Basic validation
    const isValid = manualRows.every(r => r.name && r.variants.every((v: any) => v.price && v.stock_quantity));
    if (!isValid) {
      toast.error("Please fill in all required fields (Name, Price, Stock)");
      return;
    }

    // Barcode is optional, but must match the global
    // catalog's existing format constraints when provided.
    const allBarcodes = manualRows.flatMap(row =>
      row.variants
        .map((v: any) => String(v.barcode || '').trim())
        .filter(Boolean)
    );

    const barcodePattern = /^[A-Za-z0-9._/+ -]{6,80}$/;
    const invalidBarcode = allBarcodes.find( barcode => !barcodePattern.test(barcode) );

    if (invalidBarcode) { toast.error( 'Invalid barcode. Use 6–80 permitted characters.' ); return; }

    // Prevent the same barcode being assigned to multiple
    // variants in the same submission.
    if (new Set(allBarcodes).size !== allBarcodes.length) { toast.error( 'Duplicate barcode detected in your manual entries.' ); return; }

    setLoading(true);
    try {
      // Recheck all barcodes before saving.
      // Never rely only on an earlier green indicator.
      const checks = await Promise.all(
        allBarcodes.map(async barcode => {
          const response = await fetch('/api/partners/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'check_barcode', data: { barcode }, }),
          });

          const result = await response.json();
          if (!response.ok || result.success !== true) { throw new Error( `Could not verify barcode ${barcode}. Please try again.` ); }
          return { barcode, ...result };
        })
      );

      const duplicate = checks.find(check => !check.available);

      if (duplicate) {
        toast.error( `Barcode ${duplicate.barcode} already belongs to "${duplicate.product?.name || 'an existing product'}". Please use the Global Catalog.` );
        return;
      }

      const chunks = chunkArray(manualRows, 50);
      const limit = pLimit(3);

      const tasks = chunks.map((chunk, i) =>
        limit(async () => {
          const response = await fetch('/api/partners/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'manual_bulk_insert', data: { products: chunk } })
          });

          const result = await response.json();

          if (!response.ok || result.success !== true) {
            const details = Array.isArray(result.details) ? result.details.join('; ') : null;

            throw new Error( details || result.error || `Manual chunk ${i + 1} failed`
            );
          }
        })
      );

      await Promise.all(tasks);

      toast.success("Products added successfully");
      onSuccess();
      await handleCloseDrawer();
      // Reset manual rows
      setManualRows([{ id: crypto.randomUUID(), name: '', brand: '', category_id: '', image_url: '', variants: [{ id: crypto.randomUUID(), unit_type: 'pack', unit_metric: 'pcs', unit_value: '', price: '', cost_price: '', stock_quantity: '', barcode: '' }] }]);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleManualImageUpload = async (rowIndex: number, file: File) => {
    try {
      const url = await uploadProductImage(supabase, file, storeId!);
      const newRows = [...manualRows];
      newRows[rowIndex].image_url = url;
      setManualRows(newRows);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error("Image upload failed");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm transition-all">
      
      {/* Selection Panel (Left Side) */}
      <div className={`${ activeTab === 'manual' ? 'hidden' : 'hidden md:flex' } w-[400px] bg-gray-50 border-r flex-col shadow-2xl animate-in slide-in-from-left duration-300`} >
        <div className="p-6 border-b bg-white">
          <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
            Selected Items
            <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">{selectedItems.size}</span>
          </h3>
          <p className="text-xs text-gray-400 mt-1">Adjust stock and pricing before importing.</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {selectedItems.size === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-300 space-y-2 opacity-60">
              <Package size={48} />
              <p className="text-sm font-medium">No products selected yet</p>
            </div>
          ) : (
            Array.from(selectedItems.values()).map(item => (
              <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex gap-3">
                  <img src={item.image_url || '/assets/product_fallback.jpg'} className="w-14 h-14 object-contain rounded-lg border bg-white" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">{item.name}</p>
                    <p className="text-[10px] text-gray-500 font-medium">
                      {item.unit_value} {item.unit_metric}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold uppercase">{item.brand || 'Generic'}</span>
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">{item.category_name}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-gray-300 hover:text-red-500" onClick={() => toggleSelection(item)}>
                    <Trash2 size={16} />
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-50">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Stock</label>
                    <Input type="number" className="h-9 text-sm focus:ring-orange-500" value={item.qty} onChange={e => handleUpdateItem(item.id, 'qty', Number(e.target.value))} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Cost ₹</label>
                    <Input type="number" className="h-9 text-sm focus:ring-orange-500" value={item.cost} onChange={e => handleUpdateItem(item.id, 'cost', Number(e.target.value))} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-orange-500 uppercase tracking-wider">Sell ₹</label>
                    <Input type="number" className="h-9 text-sm border-orange-200 bg-orange-50/30 font-bold text-orange-700" value={item.sell} onChange={e => handleUpdateItem(item.id, 'sell', Number(e.target.value))} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-white border-t">
          <Button 
            className="w-full h-12 bg-[#FF8500] hover:bg-[#e67700] text-white font-bold rounded-xl shadow-lg shadow-orange-100 transition-all disabled:opacity-50"
            disabled={selectedItems.size === 0 || loading}
            onClick={handleBulkAdd}
          >
            {loading ? <Loader2 className="animate-spin" /> : `Import ${selectedItems.size} Products`}
          </Button>
        </div>
      </div>

      {/* Catalog Side (Right Side) */}
      <div className="flex-1 bg-white h-full flex flex-col overflow-hidden">
        <div className="p-4 px-6 border-b flex justify-between items-center bg-white">
          <div>
            <h2 className="text-lg font-black text-gray-900 tracking-tight">
              {activeTab === 'catalog' ? 'BROWSE CATALOG' : 'ADD PRODUCTS MANUALLY'}
            </h2>
            <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">
              {activeTab === 'catalog' ? 'Quick import from global database' : 'Create custom products for your store'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => void handleCloseDrawer()}
              className="rounded-full hover:bg-gray-100"
              aria-label="Close add products"
            >
              <X size={20} />
            </Button>
          </div>
        </div>
        
        {activeTab === 'catalog' && (
          <div className="p-4 flex gap-3 bg-gray-50/50 border-b">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search by name or brand..." 
                className="pl-10 h-11 bg-white border-gray-200 rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="relative min-w-[180px]">
              <select 
                className="w-full h-11 appearance-none border border-gray-200 rounded-xl px-4 pr-10 text-xs font-bold uppercase tracking-wider bg-white hover:border-orange-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all cursor-pointer text-gray-700"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <Layers size={14} />
              </div>
            </div>
          </div>
        )}

        <div className={`min-h-0 flex-1 overflow-y-auto overscroll-contain bg-white ${ activeTab === 'manual' ? 'px-4 py-5 sm:px-6 lg:px-8' : 'p-6' }`} >
          {activeTab === 'catalog' ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {loading ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20 space-y-4">
                  <Loader2 className="animate-spin text-orange-500 w-10 h-10" />
                  <p className="text-sm text-gray-400 font-medium">Searching global database...</p>
                </div>
              ) : (
                <>
                  {globalProducts.map(p => (
                    <Card 
                      key={p.id}
                      className={`p-3 cursor-pointer border-2 transition-all relative group flex flex-col ${
                        selectedItems.has(p.id) 
                        ? 'border-orange-500 ring-4 ring-orange-50 bg-orange-50/30' 
                        : 'border-gray-100 hover:border-orange-200 hover:shadow-md'
                      } ${existingGlobalIds.has(p.id) ? 'opacity-50 grayscale pointer-events-none' : ''}`}
                      onClick={() => toggleSelection(p)}
                    >
                      <div className="absolute top-2 right-2 z-10">
                        {selectedItems.has(p.id) ? (
                          <CheckCircle2 className="text-orange-500 fill-white" size={24} />
                        ) : (
                          <div className="w-6 h-6 border-2 rounded-full border-gray-100 bg-white group-hover:border-orange-200" />
                        )}
                      </div>

                      <div className="h-32 flex items-center justify-center mb-3">
                        <img src={p.image_url || '/assets/product_fallback.jpg'} className="max-h-full max-w-full object-contain mix-blend-multiply" />
                      </div>

                      <div className="space-y-2 mt-auto">
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-semibold uppercase tracking-wide truncate max-w-[60%] border border-blue-100">
                            {p.brand || 'Generic'}
                          </span>
                          <span className="text-[10px] text-orange-600 font-bold shrink-0 text-right">
                            {p.global_categories?.name}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-gray-800 line-clamp-2 leading-snug h-8">{p.name}</h4>
                        <p className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
                          <Layers size={10} /> {p.unit_value} {p.unit_metric}
                        </p>
                      </div>

                      {existingGlobalIds.has(p.id) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg backdrop-blur-[1px]">
                          <div className="bg-gray-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-xl">
                            ALREADY ADDED IN STORE
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                  <div ref={observerTarget} className="col-span-full h-20 flex items-center justify-center">
                    {loadingMore && <Loader2 className="animate-spin text-orange-500" />}
                  </div>
                </>
              )}
            </div>
          ) : (
            /* MANUAL ENTRY VIEW */
            <div className="mx-auto max-w-5xl space-y-4 pb-5">
              <button 
                onClick={() => setActiveTab('catalog')}
                className="flex items-center gap-2 text-[12px] uppercase tracking-widest font-bold text-gray-600 hover:text-orange-600 transition-all mb-6 group"
              >
                <span className="group-hover:-translate-x-1 transition-transform inline-block">←</span> Back to Global Catalog
              </button>
              {manualRows.map((row, rowIndex) => (
                <div key={row.id} className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5" >
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-[132px_minmax(0,1fr)]">
                    {/* Image Upload */}
                    <div className="group relative flex h-32 w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-200 bg-slate-50 transition-colors hover:border-orange-300 hover:bg-orange-50/30">
                      {row.image_url ? (
                        <img src={row.image_url} className="w-full h-full object-contain p-2" />
                      ) : (
                        <div className="flex flex-col items-center text-gray-400">
                          <ImagePlus size={24} strokeWidth={1.6} />
                          <span className="mt-2 text-[11px] font-medium"> Add photo </span>
                        </div>
                      )}
                      <input 
                        type="file" 
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                        onChange={(e) => e.target.files?.[0] && handleManualImageUpload(rowIndex, e.target.files[0])}
                      />
                    </div>

                    {/* Basic Info */}
                    <div className="min-w-0 space-y-3">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase">Product Name*</label>
                          <Input 
                            value={row.name} 
                            onChange={(e) => {
                              const newRows = [...manualRows];
                              newRows[rowIndex].name = e.target.value;
                              setManualRows(newRows);
                            }}
                            placeholder="e.g. Organic Moong Dal"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase">Brand</label>
                          <Input 
                            value={row.brand} 
                            onChange={(e) => {
                              const newRows = [...manualRows];
                              newRows[rowIndex].brand = e.target.value;
                              setManualRows(newRows);
                            }}
                            placeholder="e.g. Tata"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Category</label>
                        <div className="relative">
                          <select 
                            className="h-10 w-full cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-9 text-sm text-slate-700 outline-none transition-colors hover:border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                            value={row.category_id}
                            onChange={(e) => {
                              const newRows = [...manualRows];
                              newRows[rowIndex].category_id = e.target.value;
                              setManualRows(newRows);
                            }}
                          >
                            <option value="">Select Category</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <Plus size={14} className="rotate-45" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Variants Section */}
                  <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
                    <div className="flex items-center justify-between gap-3">
                      <h5 className="text-xs font-semibold text-slate-800"> Product variants </h5>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-7 text-[10px] font-bold border-orange-200 text-orange-600 hover:bg-orange-50"
                        onClick={() => {
                          const newRows = [...manualRows];
                          newRows[rowIndex].variants.push({ id: crypto.randomUUID(), unit_type: 'pack', unit_metric: 'pcs', unit_value: '', price: '', cost_price: '', stock_quantity: '', barcode: '' });
                          setManualRows(newRows);
                        }}
                      >
                        <Plus size={12} className="mr-1" /> ADD VARIANT
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {row.variants.map((v: any, vIndex: number) => (
                        <div key={v.id} className="grid grid-cols-2 gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3 sm:grid-cols-3 lg:grid-cols-6" >
                          <div className="min-w-0">
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Type</label>
                            <select 
                              className="w-full h-8 text-[11px] border-none bg-gray-50 rounded"
                              value={v.unit_type}
                              onChange={(e) => {
                                const newRows = [...manualRows];
                                newRows[rowIndex].variants[vIndex].unit_type = e.target.value;
                                setManualRows(newRows);
                              }}
                            >
                              {UNIT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                          </div>
                          <div className="min-w-0">
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Metric</label>
                            <select 
                              className="w-full h-8 text-[11px] border-none bg-gray-50 rounded"
                              value={v.unit_metric}
                              onChange={(e) => {
                                const newRows = [...manualRows];
                                newRows[rowIndex].variants[vIndex].unit_metric = e.target.value;
                                setManualRows(newRows);
                              }}
                            >
                              {UNIT_METRICS.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                          </div>
                          <div className="min-w-0">
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Value</label>
                            <Input 
                              className="h-8 text-[11px]" 
                              placeholder="500"
                              value={v.unit_value}
                              onChange={(e) => {
                                const newRows = [...manualRows];
                                newRows[rowIndex].variants[vIndex].unit_value = e.target.value;
                                setManualRows(newRows);
                              }}
                            />
                          </div>
                          <div className="min-w-0">
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Sell ₹</label>
                            <Input 
                              className="h-8 text-[11px] border-orange-100 bg-orange-50/50 font-bold" 
                              placeholder="100"
                              value={v.price}
                              onChange={(e) => {
                                const newRows = [...manualRows];
                                newRows[rowIndex].variants[vIndex].price = e.target.value;
                                setManualRows(newRows);
                              }}
                            />
                          </div>
                          <div className="min-w-0">
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Stock</label>
                            <Input 
                              className="h-8 text-[11px]" 
                              placeholder="5"
                              value={v.stock_quantity}
                              onChange={(e) => {
                                const newRows = [...manualRows];
                                newRows[rowIndex].variants[vIndex].stock_quantity = e.target.value;
                                setManualRows(newRows);
                              }}
                            />
                          </div>
                          <div className="flex items-end justify-end">
                            {vIndex > 0 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-300 hover:text-red-500"
                                onClick={() => {
                                  const newRows = [...manualRows];
                                  newRows[rowIndex].variants.splice(vIndex, 1);
                                  setManualRows(newRows);
                                }}
                              >
                                <Trash2 size={14} />
                              </Button>
                            )}
                          </div>

                          {/* Barcode with live global-catalog verification */}
                          <div className="col-span-2 mt-1 border-t border-slate-200 pt-3 sm:col-span-3 lg:col-span-6">
                            <label className="mb-1.5 block text-[11px] font-medium text-slate-600">
                              Barcode <span className="font-normal text-slate-400">(optional)</span>
                            </label>

                            <div className="relative max-w-sm">
                              <Input
                                type="text"
                                inputMode="text"
                                autoComplete="off"
                                maxLength={80}
                                placeholder="Enter barcode / EAN / UPC"
                                value={v.barcode || ''}
                                aria-invalid={ barcodeChecks[v.id]?.barcode === String(v.barcode || '').trim() && ( barcodeChecks[v.id]?.status === 'duplicate' || barcodeChecks[v.id]?.status === 'exists' ) }
                                className={`h-10 w-full pr-11 text-xs font-mono bg-white transition-all duration-300 ${
                                  barcodeChecks[v.id]?.barcode === String(v.barcode || '').trim() &&
                                  ( barcodeChecks[v.id]?.status === 'duplicate' || barcodeChecks[v.id]?.status === 'exists' )
                                    ? 'border-red-400 bg-red-50/30 focus-visible:ring-red-200' : barcodeChecks[v.id]?.barcode === String(v.barcode || '').trim() && barcodeChecks[v.id]?.status === 'available'
                                      ? 'border-green-400 bg-green-50/30 focus-visible:ring-green-200' : 'border-gray-200 focus-visible:border-orange-400'
                                }`}
                                onChange={(e) => {
                                  const newRows = [...manualRows]; newRows[rowIndex].variants[vIndex].barcode = e.target.value;
                                  setManualRows(newRows);
                                }}
                              />

                              {barcodeChecks[v.id]?.barcode === String(v.barcode || '').trim() &&
                                barcodeChecks[v.id]?.status === 'checking' && (
                                  <Loader2
                                    size={17}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-orange-500"
                                  />
                                )}

                              {barcodeChecks[v.id]?.barcode === String(v.barcode || '').trim() && barcodeChecks[v.id]?.status === 'available' && (
                                  <CheckCircle2
                                    size={18}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600"
                                  />
                                )}

                              {barcodeChecks[v.id]?.barcode === String(v.barcode || '').trim() &&
                                (
                                  barcodeChecks[v.id]?.status === 'exists' || barcodeChecks[v.id]?.status === 'duplicate'
                                ) && (
                                  <AlertCircle
                                    size={18}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500"
                                  />
                                )}
                            </div>

                            {barcodeChecks[v.id]?.barcode === String(v.barcode || '').trim() &&
                              barcodeChecks[v.id]?.status === 'duplicate' && (
                                <div
                                  role="status"
                                  className="mt-2 max-w-sm rounded-xl border border-red-200 bg-red-50 p-3"
                                >
                                  <div className="flex items-start gap-2">
                                    <AlertCircle
                                      size={16}
                                      className="mt-0.5 shrink-0 text-red-500"
                                    />

                                    <div className="min-w-0">
                                      <p className="text-xs font-bold text-red-700">
                                        Same barcode entered more than once
                                      </p>

                                      <p className="mt-1 text-xs leading-5 text-red-700">
                                        Also entered in:
                                      </p>

                                      <ul className="mt-1 list-disc space-y-1 pl-4 text-xs leading-5 text-red-700">
                                        {barcodeChecks[v.id].duplicateLocations?.map(location => (
                                          <li key={location} className="break-words">
                                            {location}
                                          </li>
                                        ))}
                                      </ul>

                                      <p className="mt-2 text-xs leading-5 text-slate-600">
                                        Keep this barcode on only one item. Change or clear the barcode on the other items before publishing.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}

                            {!String(v.barcode || '').trim() && (
                              <p className="text-[10px] text-gray-400 mt-1.5">
                                Leave blank if the product has no barcode.
                              </p>
                            )}

                            {!!String(v.barcode || '').trim() && !barcodePattern.test(String(v.barcode).trim()) && (
                                <p className="text-[11px] text-amber-600 mt-1.5">
                                  Enter 6–80 permitted characters to verify.
                                </p>
                              )}

                            {barcodeChecks[v.id]?.barcode === String(v.barcode || '').trim() && barcodeChecks[v.id]?.status === 'checking' && (
                                <div className="mt-2 flex items-center gap-2 text-[11px] text-orange-600 animate-pulse">
                                  <Loader2 size={12} className="animate-spin" />
                                  Checking global catalog...
                                </div>
                              )}

                            {barcodeChecks[v.id]?.barcode === String(v.barcode || '').trim() && barcodeChecks[v.id]?.status === 'available' && (
                                <div className="mt-2 flex items-center gap-2 text-[11px] font-semibold text-green-700">
                                  <ShieldCheck size={15} />
                                  Barcode available — no existing match found
                                </div>
                              )}

                            {barcodeChecks[v.id]?.barcode === String(v.barcode || '').trim() &&
                              barcodeChecks[v.id]?.status === 'exists' && (
                                <div className="mt-2 max-w-sm rounded-xl border border-red-200 bg-red-50 p-3">
                                  <div className="flex items-start gap-2">
                                    <AlertCircle
                                      size={16}
                                      className="mt-0.5 shrink-0 text-red-500"
                                    />

                                    <div className="min-w-0 space-y-1">
                                      <p className="text-xs font-bold text-red-700">
                                        This barcode already exists
                                      </p>

                                      <p className="text-xs font-semibold text-gray-800 break-words">
                                        {barcodeChecks[v.id].product?.name || 'Existing global product'}
                                      </p>

                                      {barcodeChecks[v.id].product?.brand && (
                                        <p className="text-[10px] text-gray-500">
                                          Brand: {barcodeChecks[v.id].product?.brand}
                                        </p>
                                      )}

                                      <button
                                        type="button"
                                        className="mt-1 text-[11px] font-bold text-orange-600 hover:text-orange-700 hover:underline"
                                        onClick={() => {
                                          setSearchQuery( barcodeChecks[v.id].product?.name || '' );
                                          setSelectedCategory('all');
                                          setActiveTab('catalog');
                                        }}
                                      >
                                        Find in Global Catalog →
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}

                            {barcodeChecks[v.id]?.barcode === String(v.barcode || '').trim() &&
                              barcodeChecks[v.id]?.status === 'error' && (
                                <p className="mt-2 flex items-center gap-1.5 text-[11px] text-red-600">
                                  <AlertCircle size={13} />
                                  Could not verify barcode. Please try again.
                                </p>
                              )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex justify-center pt-2">
                <Button
                  variant="outline"
                  className="h-10 rounded-xl border border-dashed border-slate-300 bg-white px-5 text-xs font-semibold text-slate-600 transition-colors hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
                  onClick={() => setManualRows([ ...manualRows, { id: crypto.randomUUID(), name: '', brand: '', category_id: '', image_url: '', variants: [{ id: crypto.randomUUID(), unit_type: 'pack', unit_metric: 'pcs', unit_value: '', price: '', cost_price: '', stock_quantity: '', barcode: '' }] } ]) }
                >
                  <Plus size={15} className="mr-2" />
                  Add another product
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Fixed manual-entry footer */}
        {activeTab === 'manual' && (
          <div className="z-10 shrink-0 border-t border-slate-200 bg-white px-4 py-3 shadow-[0_-8px_24px_-18px_rgba(15,23,42,0.25)] sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800">
                  {manualRows.length} {manualRows.length === 1 ? 'product' : 'products'} ready to review
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  Required: product name, selling price and stock
                </p>
              </div>

              <Button
                className="h-11 w-full shrink-0 rounded-xl bg-orange-500 px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-600 disabled:opacity-50 sm:w-auto"
                onClick={handleManualSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} className="mr-2" />
                    Publish to Inventory
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Phone scanner: independent right-side drawer. Keep mounted while hidden to preserve the active session. */}
      <div
        className={`fixed inset-0 z-[120] transition-opacity duration-200 ${ scannerOpen ? 'pointer-events-auto visible opacity-100' : 'pointer-events-none invisible opacity-0' }`}
        aria-hidden={!scannerOpen}
      >
        {/* Backdrop */}
        <button
          type="button"
          aria-label="Close scanner panel"
          tabIndex={scannerOpen ? 0 : -1}
          onClick={() => void closeScannerPanel()}
          disabled={scannerClosing}
          className="absolute inset-0 h-full w-full cursor-default bg-slate-950/45 backdrop-blur-[2px]"
        />

        {/* Sliding panel */}
        <aside
          role="dialog"
          aria-modal={scannerOpen}
          aria-label="Phone barcode scanner"
          className={`absolute inset-y-0 right-0 flex h-full w-full max-w-[1120px] flex-col overflow-hidden bg-white shadow-[-20px_0_70px_-25px_rgba(15,23,42,0.35)] transition-transform duration-300 ease-out ${
            scannerOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Drawer top bar */}
          <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-white px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-orange-500" />
              <span className="text-xs font-semibold text-slate-700">
                Scan Barcodes
              </span>
            </div>

            <button
              type="button"
              onClick={() => void closeScannerPanel()}
              disabled={scannerClosing}
              aria-label="Close scanner drawer"
              tabIndex={scannerOpen ? 0 : -1}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-800"
            >
              <X size={18} />
            </button>
          </div>

          {/* Desktop: results and product matching side by side.
              Small screens: one continuous scrolling workspace. */}
          <div className="min-h-0 flex-1 overflow-y-auto md:overflow-hidden">
            <div className="grid min-h-full grid-cols-1 md:h-full md:min-h-0 md:grid-cols-[minmax(0,1fr)_minmax(340px,0.9fr)]">
              <div className="min-w-0 md:min-h-0">
                <PhoneScannerPairing
                  ref={scannerPairingRef}
                  onScan={handleScannedBarcode}
                  results={scanResults}
                  selectedProductIds={new Set(selectedItems.keys())}
                  onResolve={setResolverBarcode}
                  onRetry={barcode => void handleScannedBarcode(barcode)}
                />
              </div>

              <div className="min-w-0 border-t border-slate-200 bg-slate-50 md:min-h-0 md:overflow-y-auto md:border-l md:border-t-0">
                {storeId && unknownBarcodes.length > 0 ? (
                  <ScannerProductResolver
                    barcodes={unknownBarcodes}
                    storeId={storeId}
                    categories={categories}
                    activeBarcodeRequest={resolverBarcode}
                    onResolved={handleResolvedBarcode}
                    onClear={() => {
                      setScanResults(previous => {
                        const next = { ...previous };

                        for (const barcode of unknownBarcodes) {
                          next[barcode] = { status: 'dismissed' };
                        }

                        return next;
                      });

                      setUnknownBarcodes([]);
                      setResolverBarcode(null);
                    }}
                  />
                ) : (
                  <div className="flex min-h-48 flex-col items-center justify-center px-6 py-10 text-center md:min-h-full">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-100 bg-white text-orange-500">
                      <Search size={23} />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-800">
                      Need to find a product?
                    </h3>
                    <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
                      If a scanned barcode is not found, search for the
                      product here or add a new product.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Fixed bottom action */}
          <div className="shrink-0 border-t border-slate-200 bg-white px-5 py-4">
            <button
              type="button"
              onClick={() => void closeScannerPanel()}
              disabled={scannerClosing}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            >
              {scannerClosing ? 'Disconnecting scanner...' : 'Done Scanning · Review Products'}
            </button>
            <p className="mt-2 text-center text-[11px] text-slate-400">
              Closing this panel disconnects your phone scanner.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}