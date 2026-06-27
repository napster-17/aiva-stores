//src/components/partners/walkin-billing/BillingRow.tsx
'use client'
import React from 'react'
import ProductCard from './ProductCard'

interface BillingRowProps {
  row: any[]
  onAddToCart: any
  cart: Record<string, any>
  columns: number
}

const BillingRow: React.FC<BillingRowProps> = ({ row, onAddToCart, cart, columns }) => {
  return (
    <div
      className="grid gap-6 mb-6"
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`
      }}
    >
      {row.map((p) => (
        <ProductCard
          key={p.id}
          product={p}
          onAddToCart={onAddToCart}
          quantityInCart={cart[p.id]?.quantity || 0}
        />
      ))}

      {/* Fill empty slots for last row */}
      {row.length < columns &&
        Array.from({ length: columns - row.length }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
    </div>
  )
}

export default React.memo(BillingRow)