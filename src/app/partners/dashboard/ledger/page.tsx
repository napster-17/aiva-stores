//src/app/partners/dashboard/ledger/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { Wallet, ArrowUpRight, ArrowDownLeft, Info, Search, Download, Clock, CheckCircle2, 
  AlertCircle, Banknote, Receipt, HandCoins, } from 'lucide-react'
import { toast } from 'sonner'
import { calculateLedgerStats, LedgerEntry } from '@/lib/partners/ledger-utils'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { TableSkeleton } from '@/components/partners/TableSkeleton'
import SettleDuesDrawer from '@/components/partners/ledger/SettleDuesDrawer'
import { usePartnerProfile } from '@/components/partners/PartnerProfileProvider'
import LedgerInfoModal from '@/components/partners/ledger/LedgerInfoModal'

export default function LedgerPage() {
  const [loading, setLoading] = useState(true)
  const [entries, setEntries] = useState<LedgerEntry[]>([])
  const [hasPendingWithdrawal, setHasPendingWithdrawal] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [paymentMethods, setPaymentMethods] = useState<any[]>([])
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { profile } = usePartnerProfile()
  const [isSettleOpen, setIsSettleOpen] = useState(false)
  const [isInfoOpen, setIsInfoOpen] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/partners/ledger')
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      
      setEntries(data.entries)
      setHasPendingWithdrawal(data.hasPendingWithdrawal)
      setPaymentMethods(data.paymentMethods)
    } catch (err: any) {
      toast.error('Failed to load ledger: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const stats = calculateLedgerStats(entries)

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount)
    
    if (isNaN(amount) || amount < 100) {
      return toast.error('Minimum withdrawal is ₹100')
    }
    if (amount > stats.availableBalance) {
      return toast.error('Insufficient balance')
    }
    if (paymentMethods.length === 0) {
      return toast.error('Please add a payment method first from the *Settings* in the left sidebar or from the Aiva Partners App.')
    }

    try {
      setIsSubmitting(true)
      const res = await fetch('/api/partners/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, paymentMethods })
      })
      if (!res.ok) throw new Error('Request failed')
      
      toast.success('Withdrawal request submitted successfully')
      setWithdrawAmount('')
      fetchData()
    } catch (err) {
      toast.error('Failed to process withdrawal')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getEntryIcon = (entry: LedgerEntry) => {
    if (entry.note?.includes('Withdrawal')) return <ArrowUpRight className="text-red-500" size={20} />
    if (entry.note?.includes('Deposit')) return <ArrowDownLeft className="text-emerald-500" size={20} />
    if (entry.type === 'CREDIT') return <ArrowDownLeft className="text-emerald-500" size={20} />
    return <ArrowUpRight className="text-red-500" size={20} />
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === entries.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(entries.map(e => e.id)))
    }
  }

  const toggleSelectEntry = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const handleExport = () => {
    const itemsToExport = entries.filter(e => 
      selectedIds.size === 0 ? true : selectedIds.has(e.id)
    )

    if (itemsToExport.length === 0) {
      return toast.error("No entries to export")
    }

    const headers = [
      "Date", "Description", "Order ID", "Type", "Net Amount", 
      "Comm (Platform Fee)", "GST", "TCS", "Razorpay Fee", 
      "Cust. Platform Fee", "Cust. Conv. Fee", "Note"
    ]
    const csvContent = [
      headers.join(","),
      ...itemsToExport.map(e => {
        const isDebit = e.type === 'DEBIT' || e.type === 'PENALTY';
        return [
          new Date(e.created_at).toLocaleDateString(),
          e.note?.includes('Withdrawal') ? 'Withdrawal' : (e.order_id ? 'Order' : 'Other'),
          e.order_id || 'N/A',
          e.type,
          `${isDebit ? '-' : ''}${e.amount.toFixed(2)}`,
          `-${(e.platform_fee || 0).toFixed(2)}`,
          `-${(e.gst || 0).toFixed(2)}`,
          `-${(e.tcs || 0).toFixed(2)}`,
          `-${(e.razorpay_fee || 0).toFixed(2)}`,
          `-${(e.customer_platform_fee || 0).toFixed(2)}`,
          `-${(e.customer_convenience_fee || 0).toFixed(2)}`,
          `"${e.note || ''}"`
        ].join(",")
      })
    ].join("\n")

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `ledger_export_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success(`Exported ${itemsToExport.length} entries`)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-orange-50 rounded-lg text-[#FF8500]"><Wallet size={20}/></div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Available Balance</div>
          </div>
          <div className="text-3xl font-black text-gray-800">
            {loading ? <div className="h-8 w-24 bg-gray-100 animate-pulse rounded-lg" /> : `₹${stats.availableBalance.toFixed(2)}`}
          </div>
          <p className="text-[10px] text-gray-500 mt-2 flex items-center gap-1">
            <Info size={12}/> Net earnings ready for payout
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
           <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-red-50 rounded-lg text-red-500"><ArrowUpRight size={20}/></div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Debit</div>
          </div>
          <div className="text-3xl font-black text-gray-800">
            {loading ? <div className="h-8 w-24 bg-gray-100 animate-pulse rounded-lg" /> : `₹${stats.debitSum.toFixed(2)}`}
          </div>
          <p className="text-[10px] text-red-400 mt-2 font-medium uppercase tracking-wider">Withdrawals, Fees & Penalties</p>
        </div>

        {/* Simple Withdrawal Block */}
        <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-gray-100 shadow-sm flex flex-col justify-between relative group">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-orange-50 rounded-lg text-[#FF8500]"><Banknote size={20}/></div>
            <div className="flex flex-col items-end">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Request Payout</div>
              {/* Info Icon with Tooltip */}
              <div className="group/tip relative">
                <Info size={14} className="text-orange-400 cursor-help mt-1" />
                <div className="absolute right-0 top-6 w-64 bg-gray-900 text-white text-[10px] p-3 rounded-xl opacity-0 invisible group-hover/tip:opacity-100 group-hover/tip:visible transition-all z-50 shadow-xl pointer-events-none leading-relaxed">
                  <p className="font-bold mb-1 text-orange-400">Confirm Withdrawal Request</p>
                  Important: Payments below ₹10,000 are typically processed via UPI within 1-2 business days. Larger amounts may require bank transfer (3-5 business days). Excludes holidays.
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="relative">
              <span className="absolute left-3 top-1.5 text-gray-400 font-bold text-xs">₹</span>
              <input 
                type="number" 
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="100"
                className="w-full bg-gray-50 border border-gray-100 rounded-lg py-1.5 pl-6 pr-3 text-sm focus:outline-none focus:ring-2 ring-orange-100 transition-all font-bold"
              />
            </div>
            <Button 
              disabled={isSubmitting || hasPendingWithdrawal || stats.availableBalance < 100}
              onClick={handleWithdraw}
              variant="outline"
              className="w-full border-gray-200 text-gray-600 hover:bg-gray-50 font-black text-[10px] uppercase h-8 rounded-lg transition-all"
            >
              {isSubmitting ? '...' : hasPendingWithdrawal ? 'Pending' : 'Withdraw'}
            </Button>
          </div>
        </div>

        {/* Highlighted Settle Dues Block */}
        <div className="bg-[#FF8500] p-6 rounded-2xl shadow-lg shadow-orange-100 text-white flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-white/20 rounded-lg text-white"><HandCoins size={20}/></div>
            <div className="text-[10px] font-bold text-orange-100 uppercase tracking-wider">Settle Dues</div>
          </div>
          <div className="mt-4">
            <p className="text-[10px] text-white/90 mb-3 leading-tight font-medium">Clear your negative balance via Bank/UPI transfer.</p>
            <Button 
              onClick={() => setIsSettleOpen(true)}
              className="w-full bg-white text-[#FF8500] hover:bg-orange-50 font-black text-xs uppercase h-10 rounded-xl transition-transform active:scale-95"
            >
              Deposit Now
            </Button>
          </div>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-gray-800 tracking-tight">Transaction History</h2>
            <p className="text-xs text-gray-500">Review all your account credits, debits and platform fees</p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16}/>
              <Input placeholder="Search Order ID..." className="pl-10 h-10 w-64 border-gray-100 rounded-xl" />
            </div>
            <Button 
              onClick={handleExport}
              variant="outline" 
              className="h-10 border-gray-100 rounded-xl text-gray-600 gap-2 hover:bg-orange-50"
            >
              <Download size={16}/> 
              {selectedIds.size > 0 ? `Export (${selectedIds.size})` : 'Export All'}
            </Button>

            <Button 
              onClick={() => setIsInfoOpen(true)}
              variant="outline" 
              className="h-10 border-orange-200 bg-orange-50/50 rounded-xl text-orange-600 gap-2 hover:bg-orange-100 hover:border-orange-300"
            >
              <Info size={16}/> 
              Guide
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50">
              <tr className="border-b border-gray-50">
                <th className="p-4 w-10">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-[#FF8500] focus:ring-[#FF8500]"
                    checked={entries.length > 0 && selectedIds.size === entries.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description</th>
                <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">
                  <div className="flex items-center justify-center gap-1 cursor-help" onClick={() => setIsInfoOpen(true)}>
                    Breakdown <Info size={12} className="text-orange-400" />
                  </div>
                </th>
                <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <TableSkeleton rows={8} columns={4} />
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-20 text-center">
                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Receipt className="text-gray-300" size={32}/>
                    </div>
                    <p className="text-gray-500 font-medium">No transactions found.</p>
                  </td>
                </tr>
              ) : entries.map((entry) => (
                <tr key={entry.id} className={`hover:bg-orange-50/20 transition-colors ${selectedIds.has(entry.id) ? 'bg-orange-50/50' : ''}`}>
                  <td className="p-4">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-[#FF8500] focus:ring-[#FF8500]"
                      checked={selectedIds.has(entry.id)}
                      onChange={() => toggleSelectEntry(entry.id)}
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">
                        {getEntryIcon(entry)}
                      </div>
                      <div>
                        <div className="font-bold text-gray-800 flex items-center gap-2">
                          {entry.note?.includes('Partner Withdrawal Processed') ? (
                            'Store Withdrawal'
                          ) : entry.note?.includes('Store payment via settlement request') ? (
                            'Store Deposit'
                          ) : entry.note?.includes('Refund payout') ? (
                            'Return Refund'
                          ) : entry.note?.includes('Walk-in Billing Subscription') ? (
                            'Store Billing Subscription'
                          ) : (
                            `Order ID: ${entry.order_id || '—'}`
                          )}
                          {entry.type === 'PENALTY' && (
                            <span className="text-[9px] bg-red-50 text-red-500 px-2 py-0.5 rounded-full border border-red-100 font-bold tracking-wider">PENALTY</span>
                          )}
                        </div>
                        {/* New Sub-header for Amount & Mode */}
                        <div className="text-[11px] font-semibold text-emerald-700 mt-0.5">
                          {entry.order_id ? (
                            `Amount: ₹${entry.orders?.total_amount?.toFixed(2) || '—'} | Mode: ${entry.orders?.payment_method || '—'}`
                          ) : (
                            `Amount: ₹${entry.amount.toFixed(2)} | Mode: ${entry.note?.includes('Withdrawal') ? 'Prepaid' : (entry.mode || 'Prepaid')}`
                          )}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                          <Clock size={10}/> {new Date(entry.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                        {entry.note && (
                          <div className="mt-2 text-[10px] text-gray-500 border-l-2 border-gray-100 pl-2">
                            Note: <span className={entry.note.includes('₹20 penalty') ? 'text-red-500 font-semibold' : 'text-gray-600 font-medium'}>
                              {entry.note}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1.5 items-center">
                      <div className="flex flex-wrap justify-center gap-2">
                        <span className="text-[11px] bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md font-bold">Comm: -₹{(entry.platform_fee || 0).toFixed(2)}</span>
                        <span className="text-[11px] bg-purple-50 text-purple-700 px-2.5 py-1 rounded-md font-bold">GST: -₹{(entry.gst || 0).toFixed(2)}</span>
                        <span className="text-[11px] bg-orange-50 text-orange-700 px-2.5 py-1 rounded-md font-bold">RPay: -₹{(entry.razorpay_fee || 0).toFixed(2)}</span>
                        <span className="text-[11px] bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md font-bold">TCS: -₹{(entry.tcs || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex flex-wrap justify-center gap-2">
                        <span className="text-[11px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md font-bold">C-Plat: -₹{(entry.customer_platform_fee || 0).toFixed(2)}</span>
                        <span className="text-[11px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md font-bold">C-Conv: -₹{(entry.customer_convenience_fee || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className={`text-sm font-black ${entry.type === 'CREDIT' ? 'text-emerald-600' : 'text-red-500'}`}>
                      {entry.type === 'CREDIT' ? '+' : '-'} ₹{entry.amount.toFixed(2)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* ... previous code */}
      <SettleDuesDrawer 
        isOpen={isSettleOpen} 
        onClose={() => setIsSettleOpen(false)} 
        storeId={profile?.id || ''} 
        onSuccess={fetchData} 
      />
      <LedgerInfoModal 
        isOpen={isInfoOpen} 
        onClose={() => setIsInfoOpen(false)} 
      />
    </div>
  )
}