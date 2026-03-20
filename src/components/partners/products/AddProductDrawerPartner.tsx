//src/components/partners/AddProductDrawerPartner.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/input';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { X, Search, Loader2, CheckCircle2, Trash2, Package, Tag, Layers, } from 'lucide-react';
import { uploadProductImage } from '@/lib/partners/product-upload';
import { Plus, ImagePlus } from 'lucide-react';
import { toast } from 'sonner';
import { usePartnerProfile } from '../PartnerProfileProvider';

const UNIT_TYPES = ['pack', 'loose'];
const UNIT_METRICS = ['kg', 'gms', 'litre', 'ml', 'pcs', 'nos'];

const supabase = createClient();
const ITEMS_PER_PAGE = 40;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddProductDrawerPartner({ isOpen, onClose, onSuccess }: Props) {
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
  const [manualRows, setManualRows] = useState<any[]>([{
    id: crypto.randomUUID(), name: '', brand: '', category_id: '', image_url: '',
    variants: [{ id: crypto.randomUUID(), unit_type: 'pack', unit_metric: 'pcs', unit_value: '', price: '', cost_price: '', stock_quantity: '' }]
  }]);
  
  const observerTarget = useRef<HTMLDivElement>(null);

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

  const handleUpdateItem = (id: string, field: string, value: number) => {
    setSelectedItems(prev => {
      const next = new Map(prev);
      const item = next.get(id);
      if (item) next.set(id, { ...item, [field]: value });
      return next;
    });
  };

  const handleBulkAdd = async () => {
    setLoading(true);
    const itemsToInsert = Array.from(selectedItems.values()).map(item => ({
      global_product_id: item.id,
      name: item.name,
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

    try {
      const response = await fetch('/api/partners/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'bulk_insert', data: itemsToInsert })
      });

      if (!response.ok) throw new Error('Failed to import');

      toast.success(`Successfully added ${itemsToInsert.length} products`);
      onSuccess();
      onClose();
      setSelectedItems(new Map());
    } catch (error: any) {
      toast.error(error.message);
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

    setLoading(true);
    try {
      const response = await fetch('/api/partners/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'manual_bulk_insert', data: { products: manualRows } })
      });

      if (!response.ok) throw new Error('Failed to save manual products');

      toast.success("Products added successfully");
      onSuccess();
      onClose();
      // Reset manual rows
      setManualRows([{ id: crypto.randomUUID(), name: '', brand: '', category_id: '', image_url: '', variants: [{ id: crypto.randomUUID(), unit_type: 'pack', unit_metric: 'pcs', unit_value: '', price: '', cost_price: '', stock_quantity: '' }] }]);
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
      <div className="hidden md:flex w-[400px] bg-gray-50 border-r flex-col shadow-2xl animate-in slide-in-from-left duration-300">
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
          <div className="flex items-center gap-4">
            {activeTab === 'catalog' && (
              <button 
                onClick={() => setActiveTab('manual')}
                className="hidden sm:flex items-center gap-2 text-[13px] uppercase font-bold text-white hover:text-orange-500 bg-orange-500 hover:bg-white hover:border-2 hover:border-orange-500 px-3 py-3 rounded-lg transition-colors"
              >
                <Plus size={14} />
                Can't find an item? Add manually
              </button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-gray-100"><X /></Button>
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

        <div className="flex-1 overflow-y-auto p-6 bg-white">
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
            <div className="max-w-4xl mx-auto space-y-8">
              <button 
                onClick={() => setActiveTab('catalog')}
                className="flex items-center gap-2 text-[12px] uppercase tracking-widest font-bold text-gray-600 hover:text-orange-600 transition-all mb-6 group"
              >
                <span className="group-hover:-translate-x-1 transition-transform inline-block">←</span> Back to Global Catalog
              </button>
              {manualRows.map((row, rowIndex) => (
                <div key={row.id} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Image Upload */}
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-2xl h-44 bg-gray-50/50 relative group overflow-hidden transition-colors hover:border-orange-200 hover:bg-orange-50/30">
                      {row.image_url ? (
                        <img src={row.image_url} className="w-full h-full object-contain p-2" />
                      ) : (
                        <div className="flex flex-col items-center text-gray-400">
                          <ImagePlus size={32} />
                          <span className="text-[10px] font-bold mt-2">ADD IMAGE</span>
                        </div>
                      )}
                      <input 
                        type="file" 
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                        onChange={(e) => e.target.files?.[0] && handleManualImageUpload(rowIndex, e.target.files[0])}
                      />
                    </div>

                    {/* Basic Info */}
                    <div className="md:col-span-3 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
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
                            className="w-full h-11 appearance-none border border-gray-200 rounded-xl px-4 pr-10 text-sm bg-white focus:ring-2 focus:ring-orange-500 hover:border-orange-200 transition-all outline-none cursor-pointer"
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
                  <div className="mt-6 space-y-3">
                    <div className="flex justify-between items-center">
                      <h5 className="text-xs font-black text-gray-800 uppercase tracking-widest">Pricing & Metrics</h5>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-7 text-[10px] font-bold border-orange-200 text-orange-600 hover:bg-orange-50"
                        onClick={() => {
                          const newRows = [...manualRows];
                          newRows[rowIndex].variants.push({ id: crypto.randomUUID(), unit_type: 'pack', unit_metric: 'pcs', unit_value: '', price: '', cost_price: '', stock_quantity: '' });
                          setManualRows(newRows);
                        }}
                      >
                        <Plus size={12} className="mr-1" /> ADD VARIANT
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {row.variants.map((v: any, vIndex: number) => (
                        <div key={v.id} className="grid grid-cols-6 gap-2 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                          <div className="col-span-1">
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
                          <div className="col-span-1">
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
                          <div className="col-span-1">
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
                          <div className="col-span-1">
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
                          <div className="col-span-1">
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
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex justify-center pt-4">
                <Button 
                  variant="outline"
                  className="h-8 px-8 border-2 border-gray-200 text-gray-500 hover:text-white hover:border-orange-200 hover:bg-orange-500 transition-all rounded-md font-black text-xs tracking-widest"
                  onClick={() => setManualRows([...manualRows, { id: crypto.randomUUID(), name: '', brand: '', category_id: '', image_url: '', variants: [{ id: crypto.randomUUID(), unit_type: 'pack', unit_metric: 'pcs', unit_value: '', price: '', cost_price: '', stock_quantity: '' }] }])}
                >
                  <Plus size={16} className="mr-2" /> ADD NEW PRODUCT ENTRY
                </Button>
              </div>
              <div className="pt-1 pb-1 flex flex-col items-center">
                <p className="text-xs text-gray-500 mb-2 font-medium">Review all rows carefully before saving to your inventory</p>
                <Button 
                  className="w-full max-w-sm h-10 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-md font-bold text-sm tracking-widest shadow-xl shadow-orange-100 disabled:opacity-50 transition-all hover:shadow-orange-200 active:scale-[0.98]"
                  onClick={handleManualSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="animate-spin" size={20} />
                      <span>PUBLISHING...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={20} />
                      <span>PUBLISH TO INVENTORY</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}