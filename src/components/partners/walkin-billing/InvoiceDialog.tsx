//src/components/partners/walkin-billing/InvoiceDialog.tsx
'use client'

import React from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { CheckCircle2, MessageSquare, Printer, X, FileText, Store } from 'lucide-react'
import { CartProduct } from '@/lib/partners/walkin-billing/utils'

interface InvoiceDialogProps {
  isOpen: boolean
  onClose: () => void
  orderId: string
  totalAmount: number
  storeName: string
  upiId?: string
  onShareWhatsApp: () => void
  cartItems: CartProduct[]
}

const InvoiceDialog: React.FC<InvoiceDialogProps> = ({ 
  isOpen, onClose, orderId, totalAmount, storeName, upiId, onShareWhatsApp, cartItems
}) => {
  if (!isOpen) return null;

  // Dynamically use the upiId or fallback to a placeholder
  const upiLink = `upi://pay?pa=${upiId || ''}&pn=${encodeURIComponent(storeName)}&am=${totalAmount}&tn=Order-${orderId.substring(0,8)}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      {/* HIDDEN PRINT SECTION - Replicating PDF Design */}
      <div id="printable-invoice" className="hidden print:block p-10 text-black bg-white w-full max-w-[800px] mx-auto">
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-4xl font-black text-[#fe8c00] tracking-tight mb-1">{storeName}</h1>
            <div className="flex items-center gap-2 text-gray-500 font-bold text-xs uppercase tracking-widest">
              <FileText size={14} />
              <span>Tax Invoice / Bill of Supply</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-black text-gray-400 uppercase">Order ID</p>
            <p className="font-mono font-bold">#{orderId.substring(0, 8).toUpperCase()}</p>
            <p className="text-xs font-black text-gray-400 uppercase mt-2">Date</p>
            <p className="font-bold">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
          </div>
        </div>

        <table className="w-full text-left mb-8 border-collapse">
          <thead>
            <tr className="bg-gray-100 border-y-2 border-gray-200">
              <th className="py-4 px-3 text-xs font-black uppercase tracking-wider">Product</th>
              <th className="py-4 px-3 text-xs font-black uppercase tracking-wider text-center">Qty</th>
              <th className="py-4 px-3 text-xs font-black uppercase tracking-wider text-right">Price</th>
              <th className="py-4 px-3 text-xs font-black uppercase tracking-wider text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-100">
                <td className="py-4 px-3">
                  <p className="font-bold text-sm">{item.name}</p>
                  {item.brand && <p className="text-[10px] text-gray-400 font-bold uppercase">{item.brand}</p>}
                </td>
                <td className="py-4 px-3 text-center font-medium text-sm">{item.quantity}</td>
                <td className="py-4 px-3 text-right">
                   <div className="flex flex-col items-end">
                      {item.originalPrice && item.originalPrice > item.price && (
                        <span className="text-[10px] text-gray-400 line-through">₹{item.originalPrice.toFixed(2)}</span>
                      )}
                      <span className="font-medium text-sm">₹{item.price.toFixed(2)}</span>
                   </div>
                </td>
                <td className="py-4 px-3 text-right font-bold text-sm">₹{(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-64 space-y-3">
            <div className="flex justify-between text-gray-500 font-bold text-xs uppercase">
              <span>Subtotal</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
            <div className="h-px bg-[#fe8c00] w-full"></div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-sm font-black uppercase tracking-tighter">Grand Total</span>
              <span className="text-2xl font-black text-[#fe8c00]">₹{totalAmount.toFixed(2)}</span>
            </div>
            {cartItems.reduce((acc, item) => acc + ((item.originalPrice || item.price) - item.price) * item.quantity, 0) > 0 && (
              <div className="bg-green-50 p-2 rounded text-right">
                <p className="text-[10px] font-black text-green-700 uppercase">
                  Total Savings: ₹{cartItems.reduce((acc, item) => acc + ((item.originalPrice || item.price) - item.price) * item.quantity, 0).toFixed(2)}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-dashed border-gray-200 text-center">
          <p className="text-sm font-bold text-gray-800">Thank you for shopping at {storeName}!</p>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1 italic">Visit Again</p>
        </div>
      </div>

      {/* VISUAL MODAL */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 print:hidden">
        <button onClick={onClose} className="absolute right-4 top-4 p-1 hover:bg-gray-100 rounded-full text-gray-400">
          <X size={20} />
        </button>

        <div className="p-6">
          <div className="flex flex-col items-center justify-center text-center space-y-2">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
              <CheckCircle2 className="text-green-600" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Bill Generated!</h2>
            <p className="text-sm text-gray-500 font-mono bg-gray-50 px-3 py-1 rounded">
              ID: {orderId.substring(0, 8).toUpperCase()}
            </p>
          </div>

          <div className="flex flex-col items-center py-8 space-y-4">
            <div className="bg-white p-4 border-4 border-gray-50 rounded-2xl shadow-sm">
              <QRCodeSVG value={upiLink} size={200} level="H" />
            </div>
            <div className="text-center">
              <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-1">Total Amount</p>
              <p className="text-4xl font-black text-blue-600">₹{totalAmount.toFixed(2)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={onShareWhatsApp}
              className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-3 px-4 rounded-xl transition-colors"
            >
              <MessageSquare size={18} /> WhatsApp
            </button>
            <button 
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white font-bold py-3 px-4 rounded-xl transition-colors"
            >
              <Printer size={18} /> Print Bill
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InvoiceDialog