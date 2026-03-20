//src/components/partners/ledger/SettleDuesDrawer.tsx
'use client'

import React, { useState } from 'react'
import { X, Copy, CheckCircle2, Upload, Landmark, Wallet, Info, Loader2, ChevronRight } from 'lucide-react'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { uploadSettlementProof } from '@/lib/partners/settlement-storage'

interface SettleDuesDrawerProps {
  isOpen: boolean
  onClose: () => void
  storeId: string
  onSuccess: () => void
}

export default function SettleDuesDrawer({ isOpen, onClose, storeId, onSuccess }: SettleDuesDrawerProps) {
  const [amount, setAmount] = useState('')
  const [utr, setUtr] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showBankDetails, setShowBankDetails] = useState(false)

  const BANK_DETAILS = {
    name: 'AIVA STORES PRIVATE LIMITED',
    account: '142561900001410',
    ifsc: 'YESB0001425',
    upi: 'yespay.mabs1425619IKIT1410@yesbankltd'
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount) return toast.error('Please enter the amount paid')
    if (!utr && !file) return toast.error('Please provide either a Transaction ID or a Screenshot')

    setIsSubmitting(true)
    const supabase = createClient()

    try {
      let publicUrl = null
      
      // Only upload if a file actually exists
      if (file) {
        publicUrl = await uploadSettlementProof(supabase, file, storeId)
      }

      const { error } = await supabase.from('partner_settlements').insert({
        store_id: storeId,
        amount: parseFloat(amount),
        transaction_id: utr || null, // Ensure empty string becomes null
        screenshot_url: publicUrl,
        status: 'pending'
      })

      if (error) throw error

      toast.success('Settlement request submitted!')
      onSuccess()
      onClose()
      setAmount(''); setUtr(''); setFile(null);
    } catch (err) {
      toast.error('Submission failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-black text-gray-800">Settle Dues</h2>
            <p className="text-xs text-gray-500">Deposit outstanding balance to GoAiva</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Payment Instructions */}
          <section className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 space-y-3">
            <h4 className="text-xs font-black text-blue-800 uppercase flex items-center gap-2">
              <Info size={14} /> Payment Instructions
            </h4>
            <ul className="space-y-2">
              {[
                { step: "1", text: "Copy the UPI ID or Bank Details and complete payment via your preferred app." },
                { step: "2", text: "Save the UTR / Transaction ID or take a screenshot of the success message." },
                { step: "3", text: "Enter the Amount and either the Transaction ID or Upload Screenshot below." }
              ].map((item) => (
                <li key={item.step} className="flex gap-2 text-[12px] text-blue-700 leading-tight">
                  <span className="font-bold">{item.step}.</span> {item.text}
                </li>
              ))}
            </ul>
            <p className="text-[10px] text-blue-600 italic border-t border-blue-100 pt-2">
              Note: Verified within 12-24 hours. Status available in Settlements tab.
            </p>
          </section>  
          {/* Step 1: Payment Details */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-[#FF8500] font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-xs">1</span>
              <h3>Receiver Details</h3>
            </div>

            <div className="space-y-3">
              {/* UPI ID Card */}
              <div className="bg-orange-50 rounded-xl p-3 border border-orange-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-orange-600 uppercase">UPI ID</span>
                  <button onClick={() => copyToClipboard(BANK_DETAILS.upi)} className="p-1 hover:bg-orange-100 rounded text-orange-700 transition-colors">
                    <Copy size={12} />
                  </button>
                </div>
                <p className="font-mono font-bold text-gray-800 text-[14px] break-all">{BANK_DETAILS.upi}</p>
              </div>

              {/* Bank Details Card */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Account Name</span>
                    <p className="text-[14px] font-bold text-gray-700">{BANK_DETAILS.name}</p>
                  </div>
                  <button onClick={() => copyToClipboard(BANK_DETAILS.name)} className="p-1.5 hover:bg-gray-200 rounded text-gray-500 transition-colors">
                    <Copy size={12} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex justify-between items-start bg-white p-2 rounded-lg border border-gray-100">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-gray-400 font-bold uppercase">A/C Number</span>
                      <p className="text-[14px] font-bold text-gray-800">{BANK_DETAILS.account}</p>
                    </div>
                    <button onClick={() => copyToClipboard(BANK_DETAILS.account)} className="text-gray-400 hover:text-orange-500">
                      <Copy size={10} />
                    </button>
                  </div>
                  <div className="flex justify-between items-start bg-white p-2 rounded-lg border border-gray-100">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-gray-400 font-bold uppercase">IFSC Code</span>
                      <p className="text-[14px] font-bold text-gray-800">{BANK_DETAILS.ifsc}</p>
                    </div>
                    <button onClick={() => copyToClipboard(BANK_DETAILS.ifsc)} className="text-gray-400 hover:text-orange-500">
                      <Copy size={10} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Step 2: Submission Form */}
          <form onSubmit={handleSubmit} className="space-y-5 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-[#FF8500] font-bold">
              <span className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-xs">2</span>
              <h3>Submit Proof</h3>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Amount Paid</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400 font-bold">₹</span>
                <Input 
                  type="number" 
                  placeholder="0.00" 
                  className="pl-7 h-11 rounded-xl"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Transaction ID / UTR</label>
                {!file && <span className="text-[9px] text-orange-500 font-bold uppercase">Required if no screenshot</span>}
              </div>
              <Input 
                placeholder="Enter 12-digit UTR" 
                className="h-11 rounded-xl"
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
                // Removed required attribute
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Payment Screenshot</label>
                {!utr && <span className="text-[9px] text-orange-500 font-bold uppercase">Required if no UTR</span>}
              </div>
              <div className={`relative border-2 border-dashed rounded-xl p-4 transition-colors ${file ? 'border-emerald-200 bg-emerald-50/30' : 'border-gray-200 hover:border-orange-200'}`}>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <div className="flex flex-col items-center justify-center py-2 gap-2">
                  {file ? (
                    <>
                      <CheckCircle2 className="text-emerald-500" size={24} />
                      <span className="text-xs font-bold text-emerald-700">{file.name}</span>
                    </>
                  ) : (
                    <>
                      <Upload className="text-gray-400" size={24} />
                      <span className="text-xs text-gray-500">Tap to upload screenshot</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-[#FF8500] hover:bg-[#e67700] text-white h-12 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-orange-100"
            >
              {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
              {isSubmitting ? 'SUBMITTING...' : 'SUBMIT REQUEST'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}