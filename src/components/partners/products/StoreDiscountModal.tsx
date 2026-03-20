//src/components/partners/StoreDiscountModal.tsx
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { X, Trash2, Info, Loader2, Tag } from 'lucide-react'
import { toast } from 'sonner'

export default function StoreDiscountModal({ isOpen, onClose, onUpdate }: { isOpen: boolean, onClose: () => void, onUpdate?: () => void }) {
  const [loading, setLoading] = useState(false)
  const [discounts, setDiscounts] = useState<any[]>([])
  const [form, setForm] = useState({
    discount_type: 'flat',
    discount_value: '',
    min_cart_value: '',
  })
  const supabase = createClient()

  const fetchDiscounts = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const { data } = await supabase
      .from('discounts')
      .select('*')
      .eq('store_id', session.user.id)
      .eq('applies_to', 'store')
      .order('created_at', { ascending: false })
    setDiscounts(data || [])
  }

  useEffect(() => { if (isOpen) fetchDiscounts() }, [isOpen])

  const handleSave = async () => {
    const val = Number(form.discount_value)
    const min = Number(form.min_cart_value)

    if (discounts.length >= 4) return toast.error("Maximum 4 store discounts allowed")
    if (!val || val <= 0) return toast.error("Invalid discount value")

    if (form.discount_type === 'flat') {
      if (!min || min < val * 3) return toast.error(`Min cart must be at least ₹${val * 3} (3x discount)`)
    } else {
      if (val > 40) return toast.error("Maximum percentage is 40%")
      if (min < 300) return toast.error("Min cart for percentage must be at least ₹300")
    }

    setLoading(true)
    const res = await fetch('/api/partners/products', {
      method: 'POST',
      body: JSON.stringify({
        action: 'create_store_discount',
        data: {
          name: form.discount_type === 'flat' ? `Flat ₹${val} Off` : `${val}% Off`,
          discount_type: form.discount_type,
          discount_value: val,
          min_cart_value: min,
        }
      })
    })

    if (res.ok) {
      toast.success("Discount created")
      setForm({ discount_type: 'flat', discount_value: '', min_cart_value: '' })
      fetchDiscounts()
      if (onUpdate) onUpdate()
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    await fetch('/api/partners/products', {
      method: 'POST',
      body: JSON.stringify({ action: 'delete_discount', id })
    })
    fetchDiscounts()
    if (onUpdate) onUpdate()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-6 border-b flex justify-between items-start bg-orange-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Tag className="text-orange-600" size={24} /> Store Wide Discounts
            </h2>
            <p className="text-sm text-gray-500 mt-1 font-medium ml-8">
              Discounts will be applicable only on ONLINE orders.
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors -mt-1">
            <X size={20}/>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            {['flat', 'percent'].map(t => (
              <button 
                key={t}
                onClick={() => setForm({...form, discount_type: t})}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${form.discount_type === t ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500'}`}
              >
                {t === 'flat' ? 'Flat ₹' : 'Percentage %'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Discount Value</label>
              <Input type="number" value={form.discount_value} onChange={e => setForm({...form, discount_value: e.target.value})} placeholder="0" className="mt-1"/>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Min Cart Value</label>
              <Input type="number" value={form.min_cart_value} onChange={e => setForm({...form, min_cart_value: e.target.value})} placeholder="0" className="mt-1"/>
            </div>
          </div>

          <Button onClick={handleSave} disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700 h-12 rounded-xl">
            {loading ? <Loader2 className="animate-spin" /> : "Create Discount Rule"}
          </Button>

          <div className="pt-4 border-t">
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-widest">Active Discounts</h3>
            <div className="space-y-2">
              {discounts.map(d => (
                <div key={d.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                    <p className="font-bold text-gray-800">{d.name}</p>
                    <p className="text-[10px] text-gray-500 font-medium">MIN CART: ₹{d.min_cart_value}</p>
                  </div>
                  <button onClick={() => handleDelete(d.id)} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={18}/></button>
                </div>
              ))}
              {discounts.length === 0 && <p className="text-center py-4 text-gray-400 text-sm italic">No active store discounts</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}