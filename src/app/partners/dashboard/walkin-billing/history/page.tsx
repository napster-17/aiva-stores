//src/app/partners/dashboard/walkin-billing/history/page.tsx
'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { 
  ChevronLeft, Clock, Phone, 
  Printer, Loader2, FileText, Filter 
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { usePartnerProfile } from '@/components/partners/PartnerProfileProvider'

export default function WalkinHistoryPage() {
  const { profile } = usePartnerProfile()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [fetchingMore, setFetchingMore] = useState(false)
  const [orders, setOrders] = useState<any[]>([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'CASH' | 'CARDS' | 'UPI' | 'CREDIT'>('ALL')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const PAGE_SIZE = 15

  const fetchHistory = useCallback(async (pageNum: number) => {
    if (!profile?.id) return

    const sixtyDaysAgo = new Date()
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

    const { data, error } = await supabase
      .from('walkin_orders')
      .select(`
        *,
        walkin_invoices (*)
      `)
      .eq('store_id', profile.id)
      .gte('created_at', sixtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1)

    if (error) {
      console.error(error)
      return
    }

    if (data.length < PAGE_SIZE) setHasMore(false)
    
    setOrders(prev => pageNum === 0 ? data : [...prev, ...data])
    setLoading(false)
    setFetchingMore(false)
  }, [profile?.id, supabase])

  useEffect(() => {
    fetchHistory(0)
  }, [fetchHistory])

  // Grouping logic with Filtering
  const groupedOrders = orders.reduce((groups: any, order) => {
    const method = (order.payment_method || 'CASH').toUpperCase();
    const normalizedFilter = filter === 'CARDS' ? 'CARD' : filter; // Handle pluralization if needed

    // Skip if filter doesn't match
    if (filter !== 'ALL') {
      if (filter === 'CASH' && !['CASH', 'COD'].includes(method)) return groups;
      if (filter === 'CARDS' && !['CARDS', 'CARD'].includes(method)) return groups;
      if (filter === 'UPI' && !['UPI', 'ONLINE'].includes(method)) return groups;
      if (filter === 'CREDIT' && method !== 'CREDIT') return groups;
    }

    const date = new Date(order.created_at).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
    if (!groups[date]) groups[date] = []
    groups[date].push(order)
    return groups
  }, {})

  // Payment Method Color Logic
  const getPaymentBadgeStyles = (method: string) => {
    const m = method?.toUpperCase() || 'CASH';
    switch (m) {
      case 'UPI':
      case 'ONLINE':
        return 'bg-blue-100 text-blue-700';
      case 'CARDS':
      case 'CARD':
        return 'bg-orange-100 text-orange-700';
      case 'CREDIT':
        return 'bg-black text-white';
      case 'CASH':
      case 'COD':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-purple-100 text-purple-700';
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#F8F9FB]">
      <Loader2 className="animate-spin text-orange-500" size={40} />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-20">
      <div className="print:hidden">
        <header className="sticky top-0 z-30 px-8 py-6">
          <div className="absolute inset-0 bg-[#F8F9FB]/80 backdrop-blur-md border-b border-gray-200/50" />
          <div className="relative z-10 flex items-center justify-between">
            {/* Left Side: Back & Title */}
            <div className="flex items-center gap-4">
              <Link href="/partners/dashboard/walkin-billing" className="p-2.5 bg-gray-50 rounded-xl hover:bg-orange-50 transition-colors">
                <ChevronLeft size={20} className="text-gray-400" />
              </Link>
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">History</h1>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Invoices: 60 Days</p>
              </div>
            </div>

            {/* Right Side: Custom Styled Filter */}
            <div className="relative">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 pl-4 pr-3 py-2.5 border rounded-xl transition-all shadow-sm ${
                  isFilterOpen ? 'bg-white border-orange-500 ring-4 ring-orange-500/5' : 'bg-white border-gray-200 hover:border-orange-200'
                }`}
              >
                <Filter size={14} className={filter !== 'ALL' ? 'text-orange-500' : 'text-gray-400'} />
                <span className="text-[12px] font-bold font-black uppercase tracking-wider text-gray-700">
                  {filter === 'ALL' ? 'Filter' : filter}
                </span>
                <div className={`transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`}>
                  <div className="border-t-6 border-l-5 border-transparent border-t-gray-400 rotate-[135deg] w-1.5 h-1.5 mb-1" />
                </div>
              </button>

              {isFilterOpen && (
                <>
                  {/* Backdrop to close on click outside */}
                  <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
                  
                  {/* The Dropdown Pane */}
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 py-2 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">
                    <div className="px-4 py-2 border-b border-gray-50 mb-1">
                      <p className="text-[10px] font-bold font-black text-gray-400 uppercase tracking-[0.2em]">Select Mode</p>
                    </div>
                    {[
                      { id: 'ALL', label: 'All Payments' },
                      { id: 'CASH', label: 'Cash Only' },
                      { id: 'UPI', label: 'UPI / Online' },
                      { id: 'CARDS', label: 'Cards' },
                      { id: 'CREDIT', label: 'Credit' }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setFilter(opt.id as any);
                          setIsFilterOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wide transition-colors ${
                          filter === opt.id 
                            ? 'bg-orange-50 text-orange-600' 
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto p-8">
          {Object.keys(groupedOrders).length === 0 ? (
            <div className="text-center py-20 bg-white/50 rounded-[32px] border-2 border-dashed border-gray-100">
              <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">
                {filter === 'ALL' 
                  ? 'No invoices found in the last 60 days.' 
                  : `No ${filter} transactions found.`}
              </p>
              {filter !== 'ALL' && (
                <button 
                  onClick={() => setFilter('ALL')}
                  className="mt-4 text-orange-500 font-black text-[10px] uppercase tracking-widest underline"
                >
                  Clear Filter
                </button>
              )}
            </div>
          ) : (
            Object.keys(groupedOrders).map((date) => (
              <div key={date} className="mb-10">
                {/* Date Header Divider */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-px flex-1 bg-gray-200/60" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] bg-white border border-gray-100 px-4 py-1.5 rounded-full shadow-sm">
                    {date}
                  </span>
                  <div className="h-px flex-1 bg-gray-200/60" />
                </div>

                <div className="grid gap-4">
                  {groupedOrders[date].map((order: any) => {
                    const inv = order.walkin_invoices?.[0];
                    const pdfUrl = `https://juyiojsvoylvslqxsqxp.supabase.co/storage/v1/object/public/walkin-invoices/${order.store_id}/${order.id}.pdf`;
                    
                    return (
                      <div key={order.id} className="relative group">
                        <Link 
                          href={`/partners/dashboard/walkin-billing/history/${order.id}`}
                          className="block bg-white rounded-2xl p-5 border border-gray-100 transition-all flex items-center gap-6 hover:shadow-xl hover:border-orange-200"
                        >
                          <div className="w-12 h-12 bg-gray-50 rounded-xl flex-shrink-0 flex items-center justify-center text-gray-400 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                            <FileText size={24} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-sm font-black text-gray-900 tracking-tight">
                                {inv?.invoice_number || `WK-${order.id.substring(0, 8)}`.toUpperCase()}
                              </span>
                              <span className="text-[9px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase">
                                Completed
                              </span>
                              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${getPaymentBadgeStyles(order.payment_method)}`}>
                                {order.payment_method || 'CASH'}
                              </span>
                            </div>
                            
                            {/* RESTORED: Item Summary Logic */}
                            <p className="text-xs text-gray-500 mb-2 truncate font-medium">
                              {order.items?.[0]?.name}
                              {order.items?.length > 1 ? '...' : ''}
                            </p>

                            <div className="flex items-center gap-6 text-[11px] text-gray-400 font-bold uppercase tracking-tight">
                              <span className="flex items-center gap-1.5"><Phone size={14} className="text-orange-500"/> {order.customer_phone || 'Walk-in Guest'}</span>
                              <span className="flex items-center gap-1.5"><Clock size={14} className="text-orange-500"/> {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right border-r pr-4 border-gray-100">
                              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-0.5">Total</p>
                              <p className="text-xl font-black text-gray-900 group-hover:text-orange-600 transition-colors">
                                ₹{order.total_amount.toFixed(2)}
                              </p>
                            </div>
                            
                            <a 
                              href={pdfUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-3 bg-gray-50 text-gray-400 hover:bg-orange-500 hover:text-white rounded-xl transition-all"
                            >
                              <Printer size={20} />
                            </a>
                          </div>
                        </Link>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}

          {/* Lazy Loading Trigger */}
          {hasMore && (
            <div className="mt-12 flex justify-center">
              <button
                onClick={() => {
                  setFetchingMore(true)
                  setPage(p => p + 1)
                  fetchHistory(page + 1)
                }}
                disabled={fetchingMore}
                className="px-10 py-4 bg-white border border-gray-200 text-gray-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600 transition-all shadow-sm disabled:opacity-50 flex items-center gap-3"
              >
                {fetchingMore ? <Loader2 className="animate-spin" size={16} /> : 'Load More History'}
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}