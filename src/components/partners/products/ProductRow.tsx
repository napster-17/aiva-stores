//src/components/partners/products/ProductRow.tsx
//Updated with ProductRow O(n²) for grouping/ungrouping logic optimized with useMemo to avoid unnecessary recalculations.
'use client'
import React from 'react'
import { ChevronDown, ChevronRight, Trash2, Layers, X } from 'lucide-react'
import { Button } from '@/components/button'
import { Input } from '@/components/input'

interface ProductRowProps {
  product: any
  allProducts: any[]
  isChild?: boolean
  expandedParents: Set<string>
  selectedIds: Set<string>
  editedIds: Set<string>
  zoomedImage: string | null
  isGrouping: boolean
  groupParentId: string | null
  onToggleParent: (id: string) => void
  onToggleSelect: (id: string) => void
  onSetZoom: (id: string | null) => void
  onUpdateField: (id: string, field: string, value: any) => void
  onAddToGroup: (id: string) => void
  onRemoveFromGroup: (id: string) => void
  onMakeParent: (id: string) => void
  onDelete: (id: string) => void
}

export const ProductRow = React.memo(({
  product: p,
  allProducts,
  isChild = false,
  expandedParents,
  selectedIds,
  editedIds,
  zoomedImage,
  isGrouping,
  groupParentId,
  onToggleParent,
  onToggleSelect,
  onSetZoom,
  onUpdateField,
  onAddToGroup,
  onRemoveFromGroup,
  onMakeParent,
  onDelete
}: ProductRowProps) => {
  const hasChildren = React.useMemo(() => {
    if (isChild) return false
    for (const child of allProducts) {
        if (child.parent_product_id === p.id) return true
    }
    return false
  }, [allProducts, p.id, isChild])
  const isExpanded = expandedParents.has(p.id)
  const isOutOfStock = Number(p.stock_quantity) <= 0
  const isSelected = selectedIds.has(p.id)

  return (
    <React.Fragment>
      <tr className={`
        ${isChild ? 'bg-gray-50/70' : 'bg-white'} 
        ${isSelected ? 'bg-orange-50 ring-1 ring-orange-200' : ''}
        ${isOutOfStock ? 'opacity-80 grayscale-[0.4] border-l-4 border-l-red-500 bg-red-50/40' : 'hover:bg-orange-50/40'} 
        transition-all border-b border-gray-100
      `}>
        <td className="p-4">
          <input 
            type="checkbox" 
            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer disabled:opacity-50"
            checked={isSelected}
            onChange={() => onToggleSelect(p.id)}
            disabled={editedIds.size > 0}
          />
        </td>
        <td className="p-4 pl-2">
          <div className="flex items-center gap-1">
            {hasChildren ? (
              <button onClick={() => onToggleParent(p.id)} className="text-gray-400 hover:text-orange-500">
                {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </button>
            ) : isChild ? (
              <div className="w-4 h-px bg-gray-300 ml-2 mr-1" />
            ) : <div className="w-4" />}
            
            <div 
              className="relative cursor-zoom-in"
              onClick={() => onSetZoom(zoomedImage === p.id ? null : p.id)}
            >
              <div className="w-14 h-14 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-md overflow-hidden shadow-sm">
                <img 
                    src={p.image_url || '/assets/product_fallback.jpg'} 
                    className={`object-contain max-w-full max-h-full transition-all duration-300 ${
                    zoomedImage === p.id ? 'fixed inset-0 m-auto w-[80vh] h-[80vh] z-50 shadow-2xl border-orange-200 bg-white p-4' : ''
                    }`}
                />
              </div>
              {zoomedImage === p.id && (
                <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={() => onSetZoom(null)} />
              )}
              {!isChild && hasChildren && (
                <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-[9px] px-2 py-0.5 rounded-full font-bold shadow-sm border border-white">
                  GROUP
                </span>
              )}
            </div>

            <div className="max-w-[280px] pl-2">
              <div className="font-semibold text-gray-900 text-[15px] flex flex-wrap gap-1 leading-tight">
                <span className="break-words">
                 {p.name}
                </span>

                <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full border border-gray-200 uppercase">
                 {p.brand || 'No Brand'}
                </span>

                {isOutOfStock && (
                <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-sm font-bold">
                    OUT OF STOCK
                </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[12px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
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
          <div className="flex flex-col gap-1 pl-4">
            <span className="text-[10px] text-gray-400 font-bold uppercase">Stock</span>
            <Input 
              type="number" 
              value={p.stock_quantity} 
              className="h-9 w-24 border-gray-200 bg-gray-50 focus:bg-white"
              onChange={(e) => onUpdateField(p.id, 'stock_quantity', e.target.value)}
            />
          </div>
        </td>

        <td className="p-4">
          <div className="flex gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase">Cost</span>
              <div className="relative">
                <span className="absolute left-2 top-2 text-gray-400 text-sm font-medium">₹</span>
                <Input 
                  type="number" 
                  value={p.cost_price || 0} 
                  className="h-9 w-24 border-gray-200 bg-gray-50 pl-5 focus:bg-white"
                  onChange={(e) => onUpdateField(p.id, 'cost_price', e.target.value)}
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
                  className={`h-9 w-24 pl-5 border-orange-200 bg-orange-50/40 text-orange-700 font-semibold ${
                    (Number(p.discount_value) > 0 || p.discounts?.discount_value > 0) ? 'line-through opacity-60' : ''
                  }`}
                  onChange={(e) => onUpdateField(p.id, 'price', e.target.value)}
                />
              </div>
            </div>
          </div>
        </td>

        <td className="p-4">
          <div className="flex flex-col gap-1 pl-4">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Flat Discount</span>
            <div className="flex items-center gap-1">
              <div className="relative">
                <span className="absolute left-2 top-2 text-gray-400 text-sm font-medium">₹</span>
                <Input 
                  type="number" 
                  placeholder="0"
                  value={p.discount_value !== undefined ? p.discount_value : (p.discounts?.discount_value || '')} 
                  className="h-9 w-24 border-gray-200 bg-gray-50 pl-5 focus:bg-white"
                  onChange={(e) => onUpdateField(p.id, 'discount_value', e.target.value)}
                />
              </div>
            </div>
            {(Number(p.discount_value) > 0 || p.discounts?.discount_value > 0) && (
              <div className="h-10 w-24 mt-1 px-2 py-1 bg-emerald-50 border border-emerald-200 rounded-md shadow-sm">
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
            {isGrouping && groupParentId !== p.id && !isChild && (
              <Button 
                variant="outline" size="sm" 
                className="text-orange-600 border-orange-200 h-10 font-bold"
                onClick={() => onAddToGroup(p.id)}
              >
                Select
              </Button>
            )}

            {isChild && (
              <Button 
                variant="ghost" size="icon" 
                className="text-gray-400 hover:text-red-600 h-10 w-10 border border-transparent hover:border-red-100" 
                onClick={() => onRemoveFromGroup(p.id)}
              >
                <X size={20} />
              </Button>
            )}

            {!isGrouping && !isChild && (
              <Button 
                variant="ghost" size="icon" 
                className="text-blue-500 hover:bg-blue-50 h-10 w-10 border border-blue-50" 
                onClick={() => onMakeParent(p.id)}
              >
                <Layers size={20} />
              </Button>
            )}

            <Button 
              variant="ghost" 
              size="icon" 
              className="text-red-400 hover:text-red-600 hover:bg-red-50 h-10 w-10"
              onClick={() => onDelete(p.id)}
            >
              <Trash2 size={20} />
            </Button>
          </div>
        </td>
      </tr>
    </React.Fragment>
  )
})

ProductRow.displayName = 'ProductRow'