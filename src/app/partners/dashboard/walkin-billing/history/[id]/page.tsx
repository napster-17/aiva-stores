//src/app/partners/dashboard/walkin-billing/history/[id]/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ChevronLeft, Printer, Download, Share2, 
  Phone, Calendar, Hash, Loader2, CheckCircle2 
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function InvoiceDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient() as any
  
  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState<any>(null)
  const [store, setStore] = useState<any>(null)

  useEffect(() => {
    async function loadInvoiceData() {
      try {
        const orderId = Array.isArray(id) ? id[0] : id;
        const { data: orderData, error: orderError } = await supabase
          .from('walkin_orders')
          .select(`
            *,
            walkin_invoices (*)
          `)
          .eq('id', orderId)
          .single()

        if (orderError) throw orderError

        const { data: storeData } = await supabase
          .from('store_profiles')
          .select('store_name, gstin, support_phone, address')
          .eq('id', (orderData as any).store_id)
          .single()

        const invoiceDetails = (orderData as any).walkin_invoices?.[0];
        
        setOrder({
          ...(orderData as any),
          invoice_number: invoiceDetails?.invoice_number || `WK-${(orderData as any).id.substring(0, 8)}`.toUpperCase()
        })
        setStore(storeData)
      } catch (err: any) {
        toast.error("Failed to load invoice")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    if (id) loadInvoiceData()
  }, [id])

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-white">
      <Loader2 className="animate-spin text-orange-500" size={40} />
    </div>
  )

  if (!order) return <div className="p-10 text-center">Invoice not found.</div>

  const invoice = order.walkin_invoices?.[0]
  const invoiceUrl = `https://your-storage-url.com/walkin-invoices/${order.store_id}/${order.id}.pdf` // Construct your storage URL

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Action Header */}
      <header className="sticky top-0 z-30 print:hidden transition-all">
        <div className="absolute inset-0 bg-gray-50/80 backdrop-blur-md border-b border-gray-200/50" />
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2.5 bg-white shadow-sm border border-gray-100 text-gray-600 hover:text-orange-500 rounded-xl transition-all">
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="font-black text-gray-900 tracking-tight">Invoice Details</h1>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Walk-in Billing</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.print()}
              className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
              title="Print"
            >
              <Printer size={20} />
            </button>
            <button 
              onClick={() => {
                navigator.share({
                  title: `Invoice ${order.invoice_number} - ${store?.store_name}`,
                  text: `View invoice for order ${order.invoice_number} from ${store?.store_name}`,
                  url: window.location.href
                }).catch(() => toast.error("Sharing failed"))
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black shadow-lg shadow-gray-200 transition-all"
            >
              <Share2 size={18} /> Share
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto mt-8 px-6">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden print:border-none print:shadow-none">
          {/* Brand Header */}
          <div className="bg-[#FE8C00] p-8 text-white flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight">{store?.store_name}</h2>
              <p className="text-orange-100 text-sm mt-1">GSTIN: {store?.gstin || 'N/A'}</p>
            </div>
            <div className="text-right">
              <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/30">
                <p className="text-[10px] font-bold uppercase tracking-widest text-orange-100">Invoice No</p>
                <p className="font-black text-lg">{order.invoice_number}</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Meta Info */}
            <div className="grid grid-cols-2 gap-8 mb-10">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Billed To</label>
                  <p className="font-bold text-gray-900 flex items-center gap-2">
                    <Phone size={14} className="text-orange-500" /> {order.customer_phone || 'Walk-in Customer'}
                  </p>
                </div>
              </div>
              <div className="text-right space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Date</label>
                  <p className="font-bold text-gray-900 flex items-center justify-end gap-2">
                    <Calendar size={14} className="text-orange-500" /> 
                    {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="rounded-2xl border border-gray-100 overflow-hidden mb-8">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-400 font-black uppercase text-[10px] tracking-widest">
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4 text-center">Qty</th>
                    <th className="px-6 py-4 text-right">Price</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {order.items?.map((item: any, idx: number) => (
                    <tr key={idx} className="text-gray-700">
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">{item.name}</p>
                        {item.unit_value && (
                          <p className="text-[10px] font-bold text-gray-400 uppercase">
                            {item.unit_value} {item.unit_metric}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center font-medium">{item.quantity}</td>
                      <td className="px-6 py-4 text-right font-medium">₹{item.price.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Section */}
            <div className="flex justify-end border-t border-dashed pt-6">
              <div className="w-64 space-y-3">
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Subtotal</span>
                  <span>₹{order.total_amount?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Platform Fee</span>
                  <span className="text-green-600 font-bold">FREE</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <span className="text-lg font-black text-gray-900 uppercase">Total</span>
                  <span className="text-2xl font-black text-orange-600">₹{order.total_amount?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <div className="mt-12 text-center">
              <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-1.5 rounded-full text-xs font-bold mb-4">
                <CheckCircle2 size={14} /> Paid via {order.payment_method || 'Cash'}
              </div>
              <p className="text-xs text-gray-400 font-medium">Thank you for shopping with us! This is a computer-generated invoice.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}