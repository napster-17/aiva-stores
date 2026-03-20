// src/components/ProductCard.tsx
import { Card, CardContent } from "@/components/card"
import { Badge } from "@/components/badge"

type Product = {
  id: string // changed from number to string to match Supabase uuid
  name: string
  brand_name?: string
  image_url?: string
  quantity?: string
  unit?: string
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="w-full max-w-sm rounded-2xl shadow-sm border">
      <CardContent className="p-4 flex gap-4">
        <img
          src={product.image_url || "/placeholder.svg"}
          alt={product.name}
          className="w-24 h-24 object-contain rounded-md bg-gray-100"
        />
        <div className="flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-lg">{product.name}</h3>
            {product.brand_name && (
              <p className="text-sm text-muted-foreground">
                {product.brand_name}
              </p>
            )}
          </div>
          <Badge className="w-fit mt-2">
            {product.quantity || "1"} {product.unit || "unit"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
