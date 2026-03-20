//src/components/partners/ledger/LedgerInfoModal.tsx
'use client'

import React, { useState } from 'react'
import { X, Info, Calculator, Percent, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/button'

interface LedgerInfoModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LedgerInfoModal({ isOpen, onClose }: LedgerInfoModalProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'fees' | 'penalties'>('summary')

  if (!isOpen) return null

  const tabs = [
    { id: 'summary', label: 'Summary', icon: Calculator },
    { id: 'fees', label: 'Fees & Charges', icon: Percent },
    { id: 'penalties', label: 'Penalties', icon: AlertTriangle },
  ] as const

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-orange-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500 rounded-xl text-white">
              <Info size={20} />
            </div>
            <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Understanding Your Ledger</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 bg-gray-50/50 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-wider transition-all rounded-xl ${
                activeTab === tab.id 
                ? 'bg-white text-orange-600 shadow-sm' 
                : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-8 min-h-[300px]">
          {activeTab === 'summary' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-2">
              <div>
                <h4 className="font-black text-gray-800 text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-emerald-500 rounded-full"/> Available Balance
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Your net withdrawable earnings. A minimum balance of <span className="font-bold text-gray-800">₹100</span> is required to initiate a payout request.
                </p>
              </div>
              <div>
                <h4 className="font-black text-gray-800 text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-red-500 rounded-full"/> Total Deductions
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Consolidates all account debits, including transaction fees for COD orders, applicable penalties, and successfully processed withdrawals.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'fees' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-2">
              <div>
                <h4 className="font-black text-gray-800 text-sm uppercase tracking-wider mb-2">Platform Fee</h4>
                <p className="text-gray-600 text-sm leading-relaxed italic mb-1">Impact: No impact on your earnings.</p>
                <p className="text-gray-600 text-sm">A fixed service fee paid by the customer to support platform maintenance and support.</p>
              </div>
              <div>
                <h4 className="font-black text-gray-800 text-sm uppercase tracking-wider mb-2">Convenience Fee</h4>
                <p className="text-gray-600 text-sm leading-relaxed italic mb-1">Impact: No impact on your earnings.</p>
                <p className="text-gray-600 text-sm">A percentage-based fee charged to customers for secure payment processing and order handling.</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <h4 className="font-black text-gray-800 text-sm uppercase tracking-wider mb-2">TCS (Tax Collected at Source)</h4>
                <p className="text-blue-700 text-sm leading-relaxed">
                  <span className="font-bold">1.00%</span> is deducted from gross order value as mandated by Indian Govt. tax regulations for e-commerce operators.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'penalties' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-2">
              <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                <h4 className="font-black text-red-800 text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                  <AlertTriangle size={16} /> Standard Penalties
                </h4>
                <p className="text-red-700 text-sm leading-relaxed">
                  Charges are applied to your ledger in the following cases:
                </p>
                <ul className="mt-3 space-y-2 text-red-700 text-sm list-disc pl-4">
                  <li>Rejection of a prepaid order after confirmation.</li>
                  <li>Cancellation of an active order by the store.</li>
                  <li>Failure to fulfill a verified return request.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 flex justify-end">
          <Button onClick={onClose} className="bg-gray-800 text-white hover:bg-gray-900 px-8 rounded-xl font-bold uppercase text-xs tracking-widest">
            Got it
          </Button>
        </div>
      </div>
    </div>
  )
}