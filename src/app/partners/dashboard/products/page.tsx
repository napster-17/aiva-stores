//src/app/partners/dashboard/products/page.tsx
'use client'
import React, { useState, useEffect } from 'react'
import { Plus, Package, Trash2, PackageCheck, Loader2, ChevronDown, ChevronRight, Tag, Layers, Search, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import Fuse from 'fuse.js'
import { usePartnerProfile } from '@/components/partners/PartnerProfileProvider'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { TableSkeleton } from '@/components/partners/TableSkeleton'
import AddProductDrawerPartner from '@/components/partners/products/AddProductDrawerPartner'
import StoreDiscountModal from '@/components/partners/products/StoreDiscountModal'

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
      if (!res.ok) throw new Error('Update failed')
      toast.success('Product updated')
    } catch (err) {
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
      const promises = productsToUpdate.map(product => 
        fetch('/api/partners/products', {
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
              discount_type: 'flat'
            } 
          })
        })
      )
      await Promise.all(promises)
      toast.success(`Updated ${productsToUpdate.length} products`)
      setEditedIds(new Set())
    } catch (err) {
      toast.error('Bulk update failed')
    } finally {
      setUpdatingId(null)
    }
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    try {
        const res = await fetch('/api/partners/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id })
        })
        if (!res.ok) throw new Error()
        toast.success('Product removed')
        fetchInventory()
    } catch (err) {
        toast.error('Failed to delete')
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} products?`)) return
    setUpdatingId('bulk-delete')
    try {
      const promises = Array.from(selectedIds).map(id =>
        fetch('/api/partners/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete', id })
        })
      )
      await Promise.all(promises)
      toast.success(`Deleted ${selectedIds.size} products`)
      setSelectedIds(new Set())
      fetchInventory()
    } catch (err) {
      toast.error('Bulk delete failed')
    } finally {
      setUpdatingId(null)
    }
  }

  const toggleSelectAll = () => {
    if (editedIds.size > 0) {
      toast.error('Please save or discard your changes before selecting items');
      return;
    }
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(products.map(p => p.id)))
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
    const currentProduct = products.find(p => p.id === childId);
    if (!currentProduct) return;

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
      })
      if (res.ok) {
        toast.success('Added to group')
        setIsGrouping(false)
        setGroupParentId(null)
        fetchInventory()
      }
    } catch (err) {
      toast.error('Grouping failed')
    }
  }

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

  const renderProductRow = (p: any, isChild = false): React.ReactNode => {
    const hasChildren = !isChild && products.some(child => child.parent_product_id === p.id)
    const isExpanded = expandedParents.has(p.id)
    const isOutOfStock = Number(p.stock_quantity) <= 0
    const isSelected = selectedIds.has(p.id)

    return (
      <React.Fragment key={p.id}>
        <tr className={`
          ${isChild ? 'bg-gray-50/50' : 'bg-white'} 
          ${isSelected ? 'bg-orange-50/50' : ''}
          ${isOutOfStock ? 'opacity-80 grayscale-[0.5] border-l-4 border-l-red-500 bg-red-50/30' : 'hover:bg-orange-50/30'} 
          transition-all border-b border-gray-100
        `}>
          <td className="p-4">
            <input 
              type="checkbox" 
              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              checked={isSelected}
              onChange={() => toggleSelectOne(p.id)}
              disabled={editedIds.size > 0}
            />
          </td>
          <td className="p-4">
            <div className="flex items-center gap-3">
              {hasChildren ? (
                <button onClick={() => toggleParent(p.id)} className="text-gray-400 hover:text-orange-500">
                  {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>
              ) : isChild ? (
                <div className="w-4 h-px bg-gray-300 ml-2 mr-1" />
              ) : <div className="w-4" />}
              
              <div 
                className="relative cursor-zoom-in"
                onClick={() => setZoomedImage(zoomedImage === p.id ? null : p.id)}
              >
                <img 
                  src={p.image_url || '/assets/product_fallback.jpg'} 
                  className={`transition-all duration-300 rounded-lg bg-white shadow-sm border ${
                    zoomedImage === p.id ? 'fixed inset-0 m-auto w-[80vh] h-[80vh] z-50 shadow-2xl border-orange-200' : 'w-14 h-14 object-contain'
                  }`} 
                />
                {zoomedImage === p.id && (
                  <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={() => setZoomedImage(null)} />
                )}
                {!isChild && hasChildren && (
                  <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-[9px] px-2 py-0.5 rounded-full font-bold shadow-sm border border-white">
                    GROUP
                  </span>
                )}
              </div>

              <div>
                <div className="font-bold text-gray-800 flex items-center gap-2">
                  {p.name}
                  <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100 uppercase tracking-tight">
                    {p.brand || 'No Brand'}
                  </span>
                  {isOutOfStock && (
                    <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-sm font-bold">
                      OUT OF STOCK
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                    {p.unit_value} {p.unit_metric}
                  </span>
                  {p.global_categories?.name && (
                    <span className="text-[10px] text-orange-600 font-medium">
                      • {p.global_categories.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </td>

          <td className="p-4">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase">Stock</span>
              <Input 
                type="number" 
                value={p.stock_quantity} 
                className="h-9 w-24 border-gray-200 focus:ring-orange-500"
                onChange={(e) => handleUpdateField(p.id, 'stock_quantity', e.target.value)}
              />
            </div>
          </td>

          <td className="p-4">
            <div className="flex gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Cost</span>
                <div className="relative">
                  <span className="absolute left-2 top-2 text-gray-400 text-xs">₹</span>
                  <Input 
                    type="number" 
                    value={p.cost_price || 0} 
                    className="h-9 w-24 pl-5 border-gray-200"
                    onChange={(e) => handleUpdateField(p.id, 'cost_price', e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-orange-400 font-bold uppercase">MRP / Base</span>
                <div className="relative">
                  <span className="absolute left-2 top-2.5 text-orange-400 text-xs font-bold">₹</span>
                  <Input 
                    type="number" 
                    value={p.price} 
                    className={`h-10 w-28 pl-5 border-orange-200 bg-orange-50/30 text-orange-700 font-bold text-base ${
                      (Number(p.discount_value) > 0 || p.discounts?.discount_value > 0) ? 'line-through opacity-60' : ''
                    }`}
                    onChange={(e) => handleUpdateField(p.id, 'price', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </td>

          <td className="p-4">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Flat Discount</span>
              <div className="flex items-center gap-1">
                <div className="relative">
                  <span className="absolute left-2 top-2 text-gray-400 text-xs">₹</span>
                  <Input 
                    type="number" 
                    placeholder="0"
                    value={p.discount_value !== undefined ? p.discount_value : (p.discounts?.discount_value || '')} 
                    className="h-9 w-24 pl-5 border-gray-200"
                    onChange={(e) => handleUpdateField(p.id, 'discount_value', e.target.value)}
                  />
                </div>
              </div>
              {/* Selling Price Preview*/}
              {(Number(p.discount_value) > 0 || p.discounts?.discount_value > 0) && (
                <div className="mt-1 px-2 py-1 bg-emerald-50 border border-emerald-100 rounded-md">
                  <span className="text-[10px] text-emerald-600 font-bold block leading-none uppercase">Selling at:</span>
                  <span className="text-sm text-emerald-700 font-black">
                    ₹{(p.price - (Number(p.discount_value) || p.discounts?.discount_value || 0)).toFixed(0)}
                  </span>
                </div>
              )}
            </div>
          </td>

          <td className="p-4 text-right">
            <div className="flex justify-end items-center gap-2">

                {/* Grouping*/}
                {isGrouping && groupParentId !== p.id && !isChild && (
                    <Button 
                    variant="outline" size="sm" 
                    className="text-orange-600 border-orange-200 h-10 font-bold"
                    onClick={() => handleAddToGroup(p.id)}
                    >
                    Select
                    </Button>
                )}

                {/* Ungrouping*/}
                {isChild && (
                    <Button 
                    variant="ghost" size="icon" 
                    className="text-gray-400 hover:text-red-600 h-10 w-10 border border-transparent hover:border-red-100" 
                    title="Remove from group"
                    onClick={() => handleRemoveFromGroup(p.id)}
                    >
                    <X size={20} />
                    </Button>
                )}

                {/* Group Initiation */}
                {!isGrouping && !isChild && (
                    <Button 
                    variant="ghost" size="icon" 
                    className="text-blue-500 hover:bg-blue-50 h-10 w-10 border border-blue-50" 
                    onClick={() => handleMakeParent(p.id)}
                    title="Group with others"
                    >
                    <Layers size={20} />
                    </Button>
                )}

                {/* Delete Button */}
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-red-400 hover:text-red-600 hover:bg-red-50 h-10 w-10"
                    onClick={() => deleteProduct(p.id)}
                >
                    <Trash2 size={20} />
                </Button>
            </div>
          </td>
        </tr>
        {isExpanded && products
          .filter(child => child.parent_product_id === p.id)
          .map(child => renderProductRow(child, true))}
      </React.Fragment>
    )
  }

  const filteredProducts = React.useMemo(() => {
    if (!searchQuery) return products;

    const fuse = new Fuse(products, {
      keys: ['name', 'brand', 'global_categories.name'],
      threshold: 0.3, // Lower is stricter, 0.4 is good for typos
      distance: 100,
      ignoreLocation: true,
      minMatchCharLength: 2
    });

    const results = fuse.search(searchQuery).map(result => result.item);

    const resultIds = new Set(results.map(r => r.id));
    
    return products.filter(p => {
      // Direct match
      if (resultIds.has(p.id)) return true;
      if (p.parent_product_id && resultIds.has(p.parent_product_id)) return true;
      if (products.some(child => child.parent_product_id === p.id && resultIds.has(child.id))) return true;
      return false;
    });
  }, [searchQuery, products]);
  const topLevelProducts = filteredProducts.filter(p => !p.parent_product_id)

  const groupedProducts = topLevelProducts.reduce((acc: Record<string, any[]>, product) => {
    const categoryName = product.global_categories?.name || 'Uncategorized';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(product);
    return acc;
  }, {});

  const allCategoryNames = Object.keys(groupedProducts).sort();
  const displayCategories = activeCategory === 'All' 
    ? allCategoryNames 
    : allCategoryNames.filter((cat: string) => cat === activeCategory);

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
        {/*Category Sidebar */}
        <aside className="w-24 hover:w-64 transition-all duration-300 ease-in-out flex-shrink-0 flex flex-col sticky top-6 z-30 group/sidebar">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl py-4 flex flex-col gap-1 border border-gray-100 shadow-xl">
            {categories
              .filter(cat => cat.name === 'All' || allCategoryNames.includes(cat.name))
              .map((cat) => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`flex flex-col group-hover/sidebar:flex-row items-center py-1.5 px-3 mx-2 rounded-2xl transition-all duration-300 gap-0 group-hover/sidebar:gap-4 ${
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
                    <div className={`w-full h-full rounded-xl p-0.5 transition-all ${
                      activeCategory === cat.name ? 'bg-orange-100' : 'bg-gray-100'
                    }`}>
                      <img
                        src={cat.image_url || '/assets/product_fallback.jpg'}
                        alt={cat.name}
                        className="w-full h-full object-cover rounded-[10px]"
                      />
                    </div>
                  )}
                </div>
                <span className={`
                  text-[10px] pt-[2] group-hover/sidebar:text-sm 
                  text-center group-hover/sidebar:text-left 
                  font-medium group-hover/sidebar:font-semibold 
                  leading-tight uppercase 
                  tracking-tight group-hover/sidebar:tracking-normal
                  transition-all duration-300
                  ${activeCategory === cat.name ? 'text-orange-600' : 'text-gray-400 group-hover/sidebar:text-gray-600'}
                `}>
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </aside>

        <div className="flex-1 min-w-0 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/80 border-b border-gray-100">
            <tr>
              <th className="p-4 w-10">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer disabled:opacity-30"
                  checked={products.length > 0 && selectedIds.size === products.length}
                  onChange={toggleSelectAll}
                  disabled={editedIds.size > 0}
                />
              </th>
              <th className="p-4 font-bold text-gray-600 text-xs uppercase tracking-wider">Product Information</th>
              <th className="p-4 font-bold text-gray-600 text-xs uppercase tracking-wider hidden md:table-cell">Inventory</th>
              <th className="p-4 font-bold text-gray-600 text-xs uppercase tracking-wider hidden sm:table-cell">Pricing</th>
              <th className="p-4 font-bold text-gray-600 text-xs uppercase tracking-wider hidden lg:table-cell">Discount</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
            <tbody className="divide-y divide-gray-50">
            {loading ? (
              <TableSkeleton rows={10} columns={6} />
            ) : (
              displayCategories.map((category: string) => (
              <React.Fragment key={category}>
              {/* Category Section Header */}
              <tr className="bg-gray-100/50">
                <td colSpan={6} className="p-3">
                <div className="flex items-center gap-2">
                  <Tag size={14} className="text-orange-600" />
                    <span className="text-sm font-black text-gray-700 uppercase tracking-widest">
                    {category} 
                    <span className="ml-2 text-[10px] text-gray-400 font-medium">
                      ({groupedProducts[category].length} Items)
                    </span>
                    </span>
                </div>
                </td>
              </tr>
                
              {groupedProducts[category].map((p: any) => renderProductRow(p))}
              </React.Fragment>
              ))
            )}
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