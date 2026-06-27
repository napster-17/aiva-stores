//src/app/partners/dashboard/products/page.tsx: Updated with search, fixed category, and category sorting
//updated with virtualiztaion & memoization & bulk API/batching
//updated with debounce search, fallback, optimistic UI, concurrency
//removed undo + retry logic for simplicity since undo was not working due to hard delete and retry had potential to cause race conditions and indempotency
'use client'
import React, { useState, useEffect } from 'react'
import { Plus, Package, Trash2, PackageCheck, Loader2, ChevronDown, ChevronRight, Tag, Layers, Search, X, PackageX } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import Fuse from 'fuse.js'
import { usePartnerProfile } from '@/components/partners/PartnerProfileProvider'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { TableSkeleton } from '@/components/partners/TableSkeleton'
import AddProductDrawerPartner from '@/components/partners/products/AddProductDrawerPartner'
import StoreDiscountModal from '@/components/partners/products/StoreDiscountModal'
import { ProductRow } from '@/components/partners/products/ProductRow'
import { Virtuoso } from 'react-virtuoso'
import { buildRows } from '@/utils/buildProductRows'
import pLimit from 'p-limit'

export default function PartnerProductManager() {
  const { profile } = usePartnerProfile()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isGrouping, setIsGrouping] = useState(false)
  const [groupParentId, setGroupParentId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set())
  const [zoomedImage, setZoomedImage] = useState<string | null>(null)
  const [editedIds, setEditedIds] = useState<Set<string>>(new Set())
  const [isStoreDiscountOpen, setIsStoreDiscountOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>('All')
  const [categories, setCategories] = useState<{name: string, image_url: string | null}[]>([])
  const supabase = createClient()
  const [storeDiscounts, setStoreDiscounts] = useState<any[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  const fetchStoreDiscounts = async () => {
    if (!profile?.id) return
    const { data } = await supabase
      .from('discounts')
      .select('*')
      .eq('store_id', profile.id)
      .eq('applies_to', 'store')
    setStoreDiscounts(data || [])
  }

  const fetchInventory = async () => {
    if (!profile?.id) return
    setLoading(true)
    
    const [prodRes, catRes] = await Promise.all([
      supabase
        .from('products')
        .select('*, global_categories(name), discounts(*)')
        .eq('store_id', profile.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('global_categories')
        .select('name, image_url')
        .order('name', { ascending: true })
    ])
    if (!prodRes.error) {
      const fetchedProducts = prodRes.data || []
      setProducts(fetchedProducts)
      // Auto-expand all parents that have children
      const parentIds = fetchedProducts
        .filter(p => fetchedProducts.some(child => child.parent_product_id === p.id))
        .map(p => p.id)
      setExpandedParents(new Set(parentIds))
    }
    if (!catRes.error) {
      setCategories([{ name: 'All', image_url: null }, ...catRes.data])
    }
    setLoading(false)
  }

  useEffect(() => { 
    fetchInventory()
    fetchStoreDiscounts()
  }, [profile])

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)

    return () => clearTimeout(t)
  }, [searchQuery])

  const toggleParent = (id: string) => {
    const next = new Set(expandedParents)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setExpandedParents(next)
  }

  const handleUpdateField = (id: string, field: string, value: any) => {
    if (selectedIds.size > 0) {
      toast.error('Please deselect items before making edits');
      return;
    }
    setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))
    setEditedIds(prev => new Set(prev).add(id))
  }

  const saveUpdate = async (product: any) => {
    setUpdatingId(product.id)
    try {
      const res = await fetch('/api/partners/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'update', 
          id: product.id, 
          data: { 
            price: Number(product.price),
            cost_price: Number(product.cost_price),
            stock_quantity: Number(product.stock_quantity),
            discount_value: Number(product.discount_value || 0),
            discount_type: 'flat',
            discount_id: product.discount_id
          } 
        })
      })

      if (!res.ok) throw new Error()

      toast.success('Product updated')
    } catch {
      toast.error('Failed to update')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleBulkSave = async () => {
    const productsToUpdate = products.filter(p => editedIds.has(p.id))
    if (productsToUpdate.length === 0) return

    setUpdatingId('bulk')

    try {
      const CHUNK_SIZE = 100

      const limit = pLimit(3);

      const tasks = [];

      for (let i = 0; i < productsToUpdate.length; i += CHUNK_SIZE) {
        const chunk = productsToUpdate.slice(i, i + CHUNK_SIZE)

        const payload = chunk.map(product => ({
          id: product.id,
          price: Number(product.price),
          cost_price: Number(product.cost_price),
          stock_quantity: Number(product.stock_quantity),
          discount_value: Number(product.discount_value || 0),
          discount_type: 'flat',
          discount_id: product.discount_id
        }))

        tasks.push(
          limit(async () => {
            const res = await fetch('/api/partners/products', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'bulk_update',
                data: payload
              })
            })

            if (!res.ok) throw new Error('Chunk failed')
          })
        )
      }

      await Promise.all(tasks)

      toast.success(`Updated ${productsToUpdate.length} products`)
      setEditedIds(new Set())
    } catch {
      toast.error('Bulk update failed')
    } finally {
      setUpdatingId(null)
    }
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    const prevProducts = [...products]
    const deletedProduct = products.find(p => p.id === id)

    // Optimistic UI
    setProducts(prev => prev.filter(p => p.id !== id))

    try {
    const res = await fetch('/api/partners/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id })
    })

    if (!res.ok) throw new Error()

    toast.success('Product deleted')

    } catch {
      setProducts(prevProducts) // rollback
      toast.error('Delete failed. Please try again.')
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} products?`)) return

    const ids = Array.from(selectedIds)
    const prevProducts = [...products]

    setUpdatingId('bulk-delete')

    // Optimistic UI
    setProducts(prev => prev.filter(p => !ids.includes(p.id)))
    setSelectedIds(new Set())

    try {
    const CHUNK_SIZE = 100

    for (let i = 0; i < ids.length; i += CHUNK_SIZE) {
      const chunk = ids.slice(i, i + CHUNK_SIZE)

      const res = await fetch('/api/partners/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulk_delete',
          data: chunk
        })
      })

      if (!res.ok) throw new Error()
    }

    } catch {
      setProducts(prevProducts)
      toast.error('Bulk delete failed. Retrying might help.')
    } finally {
      setUpdatingId(null)
    }
  }

  const toggleSelectAll = () => {
    if (editedIds.size > 0) {
      toast.error('Please save or discard your changes before selecting items');
      return;
    }

    const allVisibleSelected = visibleProductIds.every(id => selectedIds.has(id))

    if (allVisibleSelected) {
      // Unselect only visible ones
      const next = new Set(selectedIds)
      visibleProductIds.forEach(id => next.delete(id))
      setSelectedIds(next)
    } else {
      // Add only visible ones
      const next = new Set(selectedIds)
      visibleProductIds.forEach(id => next.add(id))
      setSelectedIds(next)
    }
  }

  const toggleSelectOne = (id: string) => {
    if (editedIds.size > 0) {
      toast.error('Please save or discard your changes before selecting items');
      return;
    }
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const handleMakeParent = (id: string) => {
    setGroupParentId(id)
    setIsGrouping(true)
    toast.info("Select another product to add it to this group")
  }

  const handleAddToGroup = async (childId: string) => {
    if (!groupParentId || childId === groupParentId) return;

    const currentProduct = products.find(p => p.id === childId);
    if (!currentProduct) return;

    // prevent multi-level nesting
    if (currentProduct.parent_product_id) {
      toast.error('Already part of another group');
      return;
    }

    try {
      const res = await fetch('/api/partners/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'update', 
          id: childId, 
          data: { 
            ...currentProduct,
            parent_product_id: groupParentId,
            price: Number(currentProduct.price),
            cost_price: Number(currentProduct.cost_price),
            stock_quantity: Number(currentProduct.stock_quantity)
          } 
        })
      });

      if (res.ok) {
        toast.success('Added to group');
        setIsGrouping(false);
        setGroupParentId(null);
        fetchInventory();
      }
    } catch {
      toast.error('Grouping failed');
    }
  };

  const handleRemoveFromGroup = async (id: string) => {
    const currentProduct = products.find(p => p.id === id);
    if (!currentProduct) return;

    try {
      const res = await fetch('/api/partners/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'update', 
          id: id, 
          data: { 
            ...currentProduct,
            parent_product_id: null,
            price: Number(currentProduct.price),
            cost_price: Number(currentProduct.cost_price),
            stock_quantity: Number(currentProduct.stock_quantity)
          } 
        })
      })
      if (res.ok) {
        toast.success('Removed from group')
        fetchInventory()
      }
    } catch (err) {
      toast.error('Failed to ungroup')
    }
  }

  const fuse = React.useMemo(() => {
    return new Fuse(products, {
      keys: ['name', 'brand', 'global_categories.name'],
      threshold: 0.3,
      distance: 100,
      ignoreLocation: true,
      minMatchCharLength: 2
    })
  }, [products])

  const filteredProducts = React.useMemo(() => {
    let result = [...products];

    if (debouncedQuery) {

      const searchResults = fuse.search(debouncedQuery).map(r => r.item);
      const resultIds = new Set(searchResults.map(r => r.id));
      
      result = products.filter(p => {
        if (resultIds.has(p.id)) return true;
        if (p.parent_product_id && resultIds.has(p.parent_product_id)) return true;
        if (products.some(child => child.parent_product_id === p.id && resultIds.has(child.id))) return true;
        return false;
      });

      // Priority Sorting: Exact matches first
      const query = debouncedQuery.toLowerCase();
      result.sort((a, b) => {
        const aName = (a.name || '').toLowerCase();
        const bName = (b.name || '').toLowerCase();

        const aStarts = aName.startsWith(query);
        const bStarts = bName.startsWith(query);
        
        // 1. If one starts with the query and the other doesn't, the one that starts with it wins.
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;

        // 2. If both start with it, or neither do, check if one contains it as a whole word
        const aContains = aName.includes(query);
        const bContains = bName.includes(query);
        if (aContains && !bContains) return -1;
        if (!aContains && bContains) return 1;

        // 3. Fallback to category if search relevance is equal
        const catA = a.global_categories?.name || 'Uncategorized';
        const catB = b.global_categories?.name || 'Uncategorized';
        if (catA !== catB) return catA.localeCompare(catB);
        return aName.localeCompare(bName);
      });

      return result;
    }

    // Default sorting when no search query
    return result.sort((a, b) => {
      const catA = a.global_categories?.name || 'Uncategorized';
      const catB = b.global_categories?.name || 'Uncategorized';
      if (catA !== catB) return catA.localeCompare(catB);
      return a.name.localeCompare(b.name);
    });
  }, [debouncedQuery, products]);

  const topLevelProducts = filteredProducts.filter(p => !p.parent_product_id)

  const groupedProducts = React.useMemo(() => {
    // When searching, we create a dummy "Search Results" group to maintain priority sorting
    if (debouncedQuery) {
      return { "Search Results": topLevelProducts };
    }

    return topLevelProducts.reduce((acc: Record<string, any[]>, product) => {
      const categoryName = product.global_categories?.name || 'Uncategorized';
      if (!acc[categoryName]) acc[categoryName] = [];
      acc[categoryName].push(product);
      return acc;
    }, {});
  }, [topLevelProducts, debouncedQuery]);

  const allCategoryNames = React.useMemo(() => {
    return Object.keys(groupedProducts).sort((a, b) => a.localeCompare(b));
  }, [groupedProducts]);

  useEffect(() => {
    if (activeCategory !== 'All' && !allCategoryNames.includes(activeCategory)) {
      setActiveCategory('All')
    }
  }, [allCategoryNames, activeCategory])

  const displayCategories = debouncedQuery
    ? ["Search Results"] 
    : (activeCategory === 'All' ? allCategoryNames : allCategoryNames.filter(cat => cat === activeCategory));

  const rows = React.useMemo(() => {
    return buildRows({
      groupedProducts,
      allProducts: products,
      expandedParents,
      displayCategories,
    });
  }, [groupedProducts, products, expandedParents, displayCategories]);

  const visibleProductIds = React.useMemo(() => {
    return rows
      .filter(r => r.type === 'product')
      .map(r => r.product.id)
  }, [rows])

  const isSearchEmpty = debouncedQuery && filteredProducts.length === 0

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      <div className="flex justify-between items-center">
        {/* Left Side: Store Discounts */}
        <div className="flex items-center">
          <Button 
            onClick={() => setIsStoreDiscountOpen(true)} 
            variant="outline"
            className={`border-orange-400 text-orange-600 hover:text-white hover:bg-orange-500 px-6 h-12 transition-all shadow-sm ${
              storeDiscounts.length > 0 ? 'rounded-l-xl border-r-0' : 'rounded-xl'
            }`}
          >
            <Tag className="w-5 h-5 mr-2" /> Store Discounts
          </Button>
          
          {storeDiscounts.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 h-9 border border-orange-200 border-l-0 bg-orange-50/30 rounded-r-xl">
              {storeDiscounts.map((sd, idx) => (
                <span 
                  key={sd.id} 
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-sm ${
                    idx % 2 === 0 
                      ? 'bg-orange-500 text-white border-orange-600' 
                      : 'bg-white text-orange-600 border-orange-200'
                  }`}
                >
                  {sd.discount_type === 'flat' ? `₹${sd.discount_value}` : `${sd.discount_value}%`}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Search and Add */}
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
            <Input 
              placeholder="Search items, brands..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 w-64 lg:w-80 h-12 bg-white border-gray-200 rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-2 focus-visible:border-orange-500 transition-all shadow-sm"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full text-gray-400"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <Button 
            onClick={() => setIsDrawerOpen(true)} 
            className="bg-white hover:bg-orange-500 text-orange-500 hover:text-white px-6 h-12 rounded-xl border-orange-500 border-2 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-5 h-5 mr-2" /> Add Products
          </Button>
        </div>
      </div>

      <div className="flex gap-6 items-start">
        {/* Fixed Category Sidebar */}
        <aside className="w-52 flex-shrink-0 flex flex-col sticky top-6 h-[calc(100vh-120px)] z-30">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl py-4 flex flex-col gap-1 border border-gray-100 shadow-xl max-h-full overflow-y-auto custom-scrollbar">
            {categories
              .filter(cat => cat.name === 'All' || allCategoryNames.includes(cat.name))
              .map((cat) => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`flex items-center py-3 px-3 mx-2 rounded-2xl transition-all duration-200 gap-3 ${
                  activeCategory === cat.name 
                    ? 'bg-white shadow-md ring-1 ring-black/[0.03]' 
                    : 'hover:bg-white/80'
                }`}
              >
                <div className="relative w-10 h-10 flex-shrink-0">
                  {cat.name === 'All' ? (
                    <div className={`w-full h-full rounded-xl flex items-center justify-center transition-all ${
                      activeCategory === 'All' 
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' 
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      <Package size={20} />
                    </div>
                  ) : (
                    <div className={`w-full h-full rounded-xl p-1 transition-all ${
                      activeCategory === cat.name ? 'bg-orange-100' : 'bg-gray-100'
                    }`}>
                      <img
                        src={cat.image_url || '/assets/product_fallback.jpg'}
                        alt={cat.name}
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>
                <span className={`
                  text-[13px] text-left font-semibold leading-tight transition-all duration-200
                  ${activeCategory === cat.name ? 'text-orange-600' : 'text-gray-500'}
                `}>
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </aside>

        <div className="flex-1 min-w-0 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-auto">
          <table className="w-full text-left border-collapse table-fixed">
            <colgroup>
              <col style={{ width: '50px' }}/>{/* checkbox */}
              <col style={{ width: '40%' }}/>{/* product info */}
              <col style={{ width: '140px' }}/>{/* inventory */}
              <col style={{ width: '220px' }}/>{/* pricing */}
              <col style={{ width: '180px' }}/>{/* discount */}
              <col style={{ width: '120px' }}/>{/* actions */}
            </colgroup>
            <thead className="bg-gray-50/95 border-b border-gray-100 sticky top-0 z-20 backdrop-blur">
              <tr>
                <th className="p-4 w-10">
                  <input 
                    type="checkbox" 
                    ref={(el) => {
                      if (!el) return
                      const total = visibleProductIds.length
                      const selectedCount = visibleProductIds.filter(id => selectedIds.has(id)).length
                      el.indeterminate = total > 0 && selectedCount > 0 && selectedCount < total
                    }}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer disabled:opacity-30"
                    checked={ visibleProductIds.length > 0 && visibleProductIds.every(id => selectedIds.has(id))}
                    onChange={toggleSelectAll}
                    disabled={editedIds.size > 0}
                  />
                </th>
                <th className="p-4 font-bold text-gray-600 text-xs uppercase tracking-wider">Product Information</th>
                <th className="p-4 font-bold text-gray-600 text-xs uppercase tracking-wider hidden md:table-cell">Inventory</th>
                <th className="p-4 font-bold text-gray-600 text-xs uppercase tracking-wider hidden sm:table-cell">Pricing</th>
                <th className="p-4 font-bold text-gray-600 text-xs uppercase tracking-wider hidden lg:table-cell">Discount</th>
                <th className="p-4 font-bold text-gray-600 text-xs uppercase">Actions</th>
              </tr>
            </thead>
              <tbody>
                <tr>
                  <td colSpan={6} className="p-0">
                    <div style={{ height: '80vh' }}>
                      {isSearchEmpty ? (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                          <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mb-4">
                            <PackageX className="w-10 h-10 text-gray-300" />
                          </div>
                          <p className="text-gray-600 font-semibold">
                            No products found
                          </p>
                          <p className="text-gray-400 text-sm mt-1">
                            Try a different search term
                          </p>
                        </div>
                      ) : (
                        <Virtuoso
                          data={rows}
                          itemContent={(index, row) => {
                            if (row.type === 'category') {
                              return (
                                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 sticky top-0 z-10">
                                  <div className="flex items-center gap-2">
                                    <Tag size={14} className="text-orange-600" />
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">
                                      {row.category}
                                    </span>
                                  </div>
                                </div>
                              )
                            }

                            return (
                              <table className="w-full border-collapse table-fixed">
                                <colgroup>
                                  <col style={{ width: '50px' }}/>
                                  <col style={{ width: '40%' }}/>
                                  <col style={{ width: '140px' }}/>
                                  <col style={{ width: '220px' }}/>
                                  <col style={{ width: '180px' }}/>
                                  <col style={{ width: '120px' }}/>
                                </colgroup>
                                <tbody>
                                  <ProductRow
                                    product={row.product}
                                    allProducts={products}
                                    isChild={row.isChild}
                                    expandedParents={expandedParents}
                                    selectedIds={selectedIds}
                                    editedIds={editedIds}
                                    zoomedImage={zoomedImage}
                                    isGrouping={isGrouping}
                                    groupParentId={groupParentId}
                                    onToggleParent={toggleParent}
                                    onToggleSelect={toggleSelectOne}
                                    onSetZoom={setZoomedImage}
                                    onUpdateField={handleUpdateField}
                                    onAddToGroup={handleAddToGroup}
                                    onRemoveFromGroup={handleRemoveFromGroup}
                                    onMakeParent={handleMakeParent}
                                    onDelete={deleteProduct}
                                  />
                                </tbody>
                              </table>
                            )
                          }}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              </tbody>
          </table>
          {products.length === 0 && !loading && (
            <div className="p-20 text-center">
              <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-10 h-10 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">Your inventory is empty.</p>
            </div>
          )}
        </div>
      </div>

      <AddProductDrawerPartner isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} onSuccess={fetchInventory} />
      <StoreDiscountModal 
        isOpen={isStoreDiscountOpen} 
        onClose={() => setIsStoreDiscountOpen(false)} 
        onUpdate={fetchStoreDiscounts}
      />
      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white border border-gray-100 border-orange-500 border-2 px-6 py-3 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex items-center gap-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3">
            <div className="bg-orange-50 p-2 rounded-xl">
              <Package className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none">Selected</span>
              <span className="text-sm font-black text-gray-900">{selectedIds.size} Products</span>
            </div>
          </div>
          
          <div className="h-8 w-px bg-gray-100" />
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              onClick={() => setSelectedIds(new Set())}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-50 h-9 px-4 text-xs font-bold"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleBulkDelete}
              disabled={updatingId === 'bulk-delete'}
              className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 h-9 px-4 text-xs font-bold transition-all shadow-sm"
            >
              {updatingId === 'bulk-delete' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Delete Selected
            </Button>
          </div>
        </div>
      )}
      {/* Floating Save Bar*/}
      {editedIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white border border-gray-100 border-orange-500 border-2 px-6 py-3 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex items-center gap-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 p-2 rounded-xl">
              <PackageCheck className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none">Unsaved</span>
              <span className="text-sm font-black text-gray-900">{editedIds.size} Changes</span>
            </div>
          </div>
          
          <div className="h-8 w-px bg-gray-100" />
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              onClick={() => {
                setEditedIds(new Set());
                fetchInventory();
              }}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-50 h-9 px-4 text-xs font-bold"
            >
              Discard
            </Button>
            <Button 
              onClick={handleBulkSave}
              disabled={updatingId === 'bulk'}
              className="bg-[#FF8500] hover:bg-[#e67700] text-white h-9 px-6 text-xs font-black shadow-lg shadow-orange-200 transition-all active:scale-95"
            >
              {updatingId === 'bulk' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save All Changes'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}