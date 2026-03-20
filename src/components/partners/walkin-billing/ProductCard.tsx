//src/components/partners/walkin-billing/ProductCard.tsx
'use client'

import React from 'react'
import { useState } from 'react'
import Image from 'next/image'
import { Plus, Minus, Maximize2, X } from 'lucide-react'
import { Button } from '@/components/button'
import { Card, CardContent } from '@/components/card'
import { CartProduct } from '@/lib/partners/walkin-billing/utils'

interface Product {
  id: string; name: string; price: number; stock_quantity: number;
  frozen_quantity: number; brand?: string | null; category_name?: string;
  image_url?: string | null; unit_value: number; unit_metric: string;
  discounts?: {
    discount_type: 'flat' | 'percent'
    discount_value: number
  }
}

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product, quantity: number) => void
  quantityInCart: number
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, quantityInCart }) => {
  const [isZoomed, setIsZoomed] = useState(false)

  const sellingPrice = product.discounts
    ? product.discounts.discount_type === 'percent'
      ? product.price * (1 - product.discounts.discount_value / 100)
      : product.price - product.discounts.discount_value
    : product.price

  const availableStock = (product.stock_quantity || 0) - (product.frozen_quantity || 0)
  const isOutOfStock = availableStock <= 0

  return (
    <>
      <Card className={`group flex flex-col h-full overflow-hidden transition-all duration-300 border-none bg-white shadow-sm hover:shadow-xl ${isOutOfStock ? 'opacity-60' : ''}`}>
        <div className="relative h-40 w-full bg-gray-50/50 flex-shrink-0">
          <Image
            src={product.image_url || '/assets/product_fallback.jpg'}
            alt={product.name}
            fill
            className="object-contain p-4 transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Zoom Trigger */}
          <button 
            onClick={() => setIsZoomed(true)}
            className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white"
          >
            <Maximize2 size={14} className="text-gray-600" />
          </button>

          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-red-500 text-white text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider">Sold Out</span>
            </div>
          )}
        </div>

        <CardContent className="p-3 flex flex-col flex-1">
          <div className="flex-1">
            {product.brand && (
              <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-1 truncate">
                {product.brand}
              </p>
            )}
            <h3 className="font-semibold text-[13px] text-gray-800 leading-[1.2] min-h-[2.4rem] line-clamp-3 mb-2">
              {product.name}
            </h3>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[11px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                {product.unit_value} {product.unit_metric}
              </span>
              <span className={`text-[10px] font-bold ${availableStock < 5 ? 'text-red-500' : 'text-green-600'}`}>
                {availableStock} left
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-50">
            <div className="flex flex-col">
              <span className="font-bold text-gray-900 text-base">₹{sellingPrice.toFixed(2)}</span>
              {product.discounts && (
                <span className="text-[10px] text-gray-400 line-through">₹{product.price.toFixed(2)}</span>
              )}
            </div>

            {quantityInCart > 0 ? (
              <div className="flex items-center bg-gray-900 rounded-lg text-white shadow-lg overflow-hidden">
                <button onClick={() => onAddToCart(product, quantityInCart - 1)} className="p-1.5 hover:bg-black transition-colors">
                  <Minus size={12} strokeWidth={3} />
                </button>
                <span className="px-1.5 text-xs font-bold min-w-[20px] text-center">{quantityInCart}</span>
                <button 
                  onClick={() => onAddToCart(product, quantityInCart + 1)}
                  disabled={quantityInCart >= availableStock}
                  className="p-1.5 hover:bg-black transition-colors disabled:opacity-30"
                >
                  <Plus size={12} strokeWidth={3} />
                </button>
              </div>
            ) : (
              <Button 
                size="sm" 
                className="bg-white border-2 border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white font-bold h-8 rounded-lg transition-all"
                onClick={() => onAddToCart(product, 1)}
                disabled={isOutOfStock}
              >
                ADD
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Zoom Modal */}
      {isZoomed && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={() => setIsZoomed(false)}>
          <button className="absolute top-6 right-6 text-white hover:rotate-90 transition-transform">
            <X size={32} />
          </button>
          <div className="relative w-full max-w-2xl aspect-square bg-white rounded-3xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <Image
              src={product.image_url || '/assets/product_fallback.jpg'}
              alt={product.name}
              fill
              className="object-contain p-8"
            />
          </div>
        </div>
      )}
    </>
  )
}

export default React.memo(ProductCard)