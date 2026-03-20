// File: src/app/partners/dashboard/settlements/page.tsx
'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { 
  History, Search, Download, ArrowUpRight, ArrowDownLeft, 
  Clock, ChevronDown, ChevronUp, CheckCircle2, AlertCircle, 
  Hourglass, FileText, ExternalLink
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { TableSkeleton } from '@/components/partners/TableSkeleton'
import { usePartnerProfile } from '@/components/partners/PartnerProfileProvider'

interface Transaction {
  id: string;
  type: 'withdrawal' | 'settlement';
  amount: number;
  status: string;
  requested_at: string;
  processed_at?: string;
  approved_at?: string;
  transaction_id?: string;
  razorpay_payout_id?: string;
  rejection_reason?: string;
  admin_comment?: string;
  error_details?: string;
  screenshot_url?: string;
}

export default function SettlementHistoryPage() {
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const { profile } = usePartnerProfile()

  const handleExport = () => {
    const dataToExport = selectedIds.length > 0 
      ? transactions.filter(t => selectedIds.includes(t.id))
      : filteredData;

    if (dataToExport.length === 0) {
      toast.error("No data to export");
      return;
    }

    // Define CSV Headers
    const headers = ["ID", "Type", "Amount", "Status", "Date", "Transaction ID"];
    const csvContent = [
      headers.join(","),
      ...dataToExport.map(t => [
        t.id,
        t.type,
        `${t.type === 'withdrawal' ? '-' : ''}${t.amount}`,
        t.status,
        new Date(t.requested_at).toLocaleDateString(),
        t.transaction_id || t.razorpay_payout_id || 'N/A'
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `settlement_history_${new Date().getTime()}.csv`);
    link.click();
    toast.success(`Exported ${dataToExport.length} records`);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredData.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredData.map(t => t.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/partners/settlements')
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setTransactions(data.transactions)
    } catch (err: any) {
      toast.error('Failed to load history: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  // Filter logic
  const filteredData = useMemo(() => {
    return transactions.filter(t => 
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.amount.toString().includes(searchQuery)
    )
  }, [transactions, searchQuery])

  // Summary stats
  const stats = useMemo(() => {
    const total = transactions.reduce((sum, t) => sum + Number(t.amount), 0)
    const last = transactions.length > 0 ? transactions[0].amount : 0
    return { total, last }
  }, [transactions])

  const getStatusUI = (status: string) => {
    switch (status.toLowerCase()) {
      case 'processed':
      case 'approved':
        return { color: 'text-emerald-600', bg: 'bg-emerald-50', icon: <CheckCircle2 size={14}/> }
      case 'failed':
      case 'rejected':
        return { color: 'text-red-600', bg: 'bg-red-50', icon: <AlertCircle size={14}/> }
      default:
        return { color: 'text-orange-600', bg: 'bg-orange-50', icon: <Hourglass size={14}/> }
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h1 className="text-xl font-black text-gray-800 tracking-tight flex items-center gap-2">
            <History className="text-[#FF8500]" /> Settlement History
          </h1>
          <p className="text-xs text-gray-500 mt-1">Track all your payouts and deposits</p>
        </div>
        
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">All Transactions Volume</p>
            <p className="text-2xl font-black text-gray-800">₹{stats.total.toFixed(2)}</p>
          </div>
          <div className="p-3 bg-orange-50 rounded-xl text-[#FF8500]"><FileText size={20}/></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Last Transaction</p>
            <p className="text-2xl font-black text-gray-800">₹{stats.last.toFixed(2)}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl text-gray-400"><Clock size={20}/></div>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col md:row md:items-center justify-between gap-4 md:flex-row">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16}/>
            <Input 
              placeholder="Search by ID or type..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 border-gray-100 rounded-xl" 
            />
          </div>
          <Button 
            variant="outline" 
            onClick={handleExport}
            className="h-10 border-gray-100 rounded-xl text-gray-600 gap-2 hover:bg-orange-50 hover:text-[#FF8500] hover:border-orange-200 transition-all"
          >
            <Download size={16}/> 
            {selectedIds.length > 0 ? `Export (${selectedIds.length})` : 'Export History'}
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50">
              <tr className="border-b border-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <th className="p-4 w-10 text-center">
                  <input 
                    type="checkbox" 
                    onChange={toggleSelectAll}
                    checked={selectedIds.length === filteredData.length && filteredData.length > 0}
                    className="accent-[#FF8500] rounded"
                  />
                </th>
                <th className="p-4">Transaction Details</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Amount</th>
                <th className="p-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <TableSkeleton rows={5} columns={5} />
              ) : filteredData.length === 0 ? (
                <tr><td colSpan={5} className="p-20 text-center text-gray-500">No records found.</td></tr>
              ) : filteredData.map((item) => {
                const statusUI = getStatusUI(item.status);
                const isExpanded = expandedId === item.id;
                
                return (
                  <React.Fragment key={item.id}>
                    <tr 
                      className={`hover:bg-gray-50/50 cursor-pointer transition-colors ${selectedIds.includes(item.id) ? 'bg-orange-50/30' : ''}`}
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    >
                      <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(item.id)}
                          onChange={() => toggleSelectOne(item.id)}
                          className="accent-[#FF8500] rounded"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${item.type === 'withdrawal' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
                            {item.type === 'withdrawal' ? <ArrowUpRight size={18}/> : <ArrowDownLeft size={18}/>}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 text-sm">
                              {item.type === 'withdrawal' ? 'Withdrawal to Bank/UPI' : 'Deposit Settlement'}
                            </p>
                            <p className="text-[10px] text-gray-400 flex items-center gap-1">
                              ID: {item.id.slice(0, 8)}... • {new Date(item.requested_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusUI.bg} ${statusUI.color}`}>
                          {statusUI.icon} {item.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <p className={`font-black text-sm ${item.type === 'withdrawal' ? 'text-gray-800' : 'text-emerald-600'}`}>
                          {item.type === 'withdrawal' ? '-' : '+'} ₹{item.amount.toFixed(2)}
                        </p>
                      </td>
                      <td className="p-4 text-gray-400">
                        {isExpanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                      </td>
                    </tr>
                    
                    {isExpanded && (
                      <tr className="bg-gray-50/30">
                        <td colSpan={5} className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-top-2 duration-300">
                            <div className="space-y-3">
                              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Request Info</h4>
                              <DetailRow label="Full Request ID" value={item.id} />
                              <DetailRow label="Requested On" value={new Date(item.requested_at).toLocaleString()} />
                              {item.processed_at && <DetailRow label="Processed On" value={new Date(item.processed_at).toLocaleString()} />}
                              {item.approved_at && <DetailRow label="Approved On" value={new Date(item.approved_at).toLocaleString()} />}
                            </div>
                            <div className="space-y-3">
                              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Transaction Info</h4>
                              {item.type === 'withdrawal' ? (
                                <>
                                  <DetailRow label="Payout ID" value={item.razorpay_payout_id || 'Pending...'} />
                                  {item.error_details && <DetailRow label="Error" value={item.error_details} isError />}
                                </>
                              ) : (
                                <>
                                  <DetailRow label="Txn ID" value={item.transaction_id || 'N/A'} />
                                  {item.admin_comment && <DetailRow label="Admin Comment" value={item.admin_comment} />}
                                  {item.rejection_reason && <DetailRow label="Rejection Reason" value={item.rejection_reason} isError />}
                                  {item.screenshot_url && (
                                    <div className="pt-2">
                                      <a 
                                        href={item.screenshot_url} 
                                        target="_blank" 
                                        className="text-[11px] font-bold text-[#FF8500] flex items-center gap-1 hover:underline"
                                      >
                                        <ExternalLink size={12}/> View Proof Receipt
                                      </a>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function DetailRow({ label, value, isError = false }: { label: string, value: string, isError?: boolean }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-gray-100/50">
      <span className="text-xs text-gray-500 font-medium">{label}</span>
      <span className={`text-xs font-bold ${isError ? 'text-red-500' : 'text-gray-700'}`}>{value}</span>
    </div>
  )
}