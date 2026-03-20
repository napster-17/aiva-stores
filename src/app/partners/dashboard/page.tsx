// File: src/app/partners/dashboard/page.tsx: Main dashboard page
'use client'
import { Package, Settings, ScanBarcode, Bell, ArrowDownUp, BarChart3, ChevronRight, AlertCircle, Info } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { checkStoreEligibility } from '@/lib/partners/utils'
import { toast } from 'sonner'
import dayjs from 'dayjs'
import { createClient } from '@/lib/supabase/supabaseClient'
import { usePartnerProfile } from '@/components/partners/PartnerProfileProvider'
import RequirementsModal from '@/components/partners/settings/RequirementsModal'
import GoOnlineConfirmationModal from '@/components/partners/settings/GoOnlineConfirmationModal'
import { fetchNotifications, AppNotification, playNotificationSound } from '@/lib/partners/notification-utils'
import NotificationSheet from '@/components/partners/NotificationSheet'

export default function PartnerDashboard() {
  const { profile, refreshProfile } = usePartnerProfile()
  const router = useRouter()
  const supabase = createClient()
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [salesData, setSalesData] = useState({ online: 0, offline: 0 })
  const [lowStockItems, setLowStockItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [failedChecks, setFailedChecks] = useState<any>(null)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)

  // Logic: Load Sales and Stock
  const loadStats = async () => {
    if (!profile?.id) return
    try {
      const todayStart = dayjs().startOf('day').toISOString();

      // 1. Fetch Today's Online Sales (Only counting non-cancelled/non-rejected)
      const onlineQuery = supabase
        .from('orders')
        .select('total_amount')
        .eq('store_id', profile.id)
        .gte('created_at', todayStart)
        .not('status', 'in', '("cancelled","rejected")');

      // 2. Fetch Today's Offline Sales
      const offlineQuery = supabase
        .from('walkin_orders')
        .select('total_amount')
        .eq('store_id', profile.id)
        .gte('created_at', todayStart);

      // 3. Fetch Low Stock
      const stockQuery = supabase
        .from('products')
        .select(`
          name, 
          stock_quantity, 
          image_url, 
          unit_value, 
          unit_metric,
          global_categories(name)
        `)
        .eq('store_id', profile.id)
        .lte('stock_quantity', 3)
        .order('stock_quantity', { ascending: true })
        .limit(10);

      const [onlineRes, offlineRes, stockRes] = await Promise.all([
        onlineQuery,
        offlineQuery,
        stockQuery
      ]);

      // Calculate Totals
      const totalOnline = onlineRes.data?.reduce((sum, item) => sum + Number(item.total_amount), 0) || 0;
      const totalOffline = offlineRes.data?.reduce((sum, item) => sum + Number(item.total_amount), 0) || 0;

      setSalesData({
        online: totalOnline,
        offline: totalOffline
      });

      setLowStockItems(stockRes.data || []);
      
    } catch (err) {
      console.error("Dashboard Stats Error:", err)
    } finally {
      setLoading(false)
    }
  }

  const loadNotifications = async () => {
    if (profile?.id) {
      const data = await fetchNotifications(profile.id)
      setNotifications(data)
    }
  }

  useEffect(() => {
    loadNotifications()
    loadStats()

    if (profile?.id) {
      const channel = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'app_notifications', filter: `user_id=eq.${profile.id}` },
          (payload) => {
            playNotificationSound();
            loadNotifications();
          }
        )
        .on(
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table: 'app_notifications' },
          () => loadNotifications()
        )
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    }
  }, [profile?.id])

  const handleToggleOnline = async () => {
    if (!profile?.id) return;

    const nextState = !profile.is_online;
    
    if (nextState === true) {
      const { isValid, checks } = await checkStoreEligibility(profile);
      if (!isValid) {
        setFailedChecks(checks);
        setIsModalOpen(true);
        return;
      }
      // Instead of updating immediately, show confirmation modal
      setIsConfirmModalOpen(true);
    } else {
      // If going offline, do it immediately
      performStatusUpdate(false);
    }
  };

  const performStatusUpdate = async (status: boolean) => {
    try {
      const { error } = await supabase
        .from('store_profiles')
        .update({ is_online: status })
        .eq('id', profile?.id);

      if (error) throw error;
      
      if (refreshProfile) {
        await refreshProfile();
      }
      
      toast.success(`Store is now ${status ? 'Online' : 'Offline'}`);
    } catch (err) {
      toast.error("Failed to update status");
      console.error(err);
    }
  };

  return (
    <div className="space-y-10 pb-10">
      {/* 1. HEADER SECTION */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            Hello, <span className="text-[#FF8500]">{profile?.store_name}</span> 👋
          </h1>
          <p className="text-gray-500 mt-2 font-medium text-lg">Here's what's happening at your store today.</p>
        </div>
        
        <div className="flex items-center gap-4 w-full lg:w-auto">
          {/* Status Toggle Capsule */}
          <div className="flex items-center p-1 rounded-[1.25rem] bg-white border border-gray-100 shadow-sm hover:border-orange-200 transition-all h-[66px]">
            <div className={`hidden sm:flex px-3 py-2 rounded-xl transition-all duration-300 items-center gap-2 ${
              profile?.is_online ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
            }`}>
              <div className="relative group/tooltip">
                <Info size={14} className="cursor-help opacity-60" />
                <div className="absolute top-full mt-2 left-0 w-64 p-3 bg-gray-900 text-white text-[10px] font-medium leading-relaxed rounded-[8] opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all shadow-xl z-50">
                  <p>Controls visibility on the customer app. Ensure the <b>Aiva Partners App</b> is active on your device.</p>
                  <div className="absolute bottom-full left-2 border-8 border-transparent border-b-gray-900" />
                </div>
              </div>
              <span className="text-[12px] font-bold uppercase tracking-loose whitespace-nowrap">
                {profile?.is_online ? "Take Store Offline" : "Take Store Online"}
              </span>
            </div>

            <div className="flex items-center gap-3 pl-3 pr-2 py-1 ml-1 border-l border-gray-50">
              <span className={`text-[12px] font-bold uppercase tracking-loose ${profile?.is_online ? 'text-emerald-500' : 'text-gray-400'}`}>
                {profile?.is_online ? "Live" : "Offline"}
              </span>
              <button 
                onClick={() => !loading && handleToggleOnline()}
                disabled={loading}
                className={`w-11 h-6 rounded-full transition-all relative ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${profile?.is_online ? 'bg-emerald-500 shadow-lg shadow-emerald-100' : 'bg-gray-200'}`}
              >
                <motion.div 
                  animate={{ x: profile?.is_online ? 22 : 4 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm" 
                />
              </button>
            </div>
          </div>

          {/* Sales Card - Optimized Height */}
          <div className="relative bg-white h-[66px] px-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-6 flex-1 lg:flex-none hover:shadow-md transition-all overflow-hidden">
            <div className="flex flex-col border-r border-gray-100 pr-4">
              <span className="text-[12px] font-bold font-black text-[#FF8500] uppercase tracking-[0.1em] leading-none mb-1">Today's</span>
              <span className="text-[14px] font-bold font-black text-gray-900 uppercase leading-none">Sales</span>
            </div>
            
            <div className="flex items-center gap-6">
               <div>
                  <p className="text-[10px] font-bold tracking-[0.1em] text-gray-400 uppercase flex items-center gap-1.5 leading-none mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> Online
                  </p>
                  <p className="text-lg font-black text-gray-900 leading-none">₹{salesData.online.toLocaleString()}</p>
               </div>
               <div className="w-px h-6 bg-gray-100"></div>
               <div>
                  <p className="text-[10px] font-bold tracking-[0.1em] text-gray-400 uppercase flex items-center gap-1.5 leading-none mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Offline
                  </p>
                  <p className="text-lg font-black text-gray-900 leading-none">₹{salesData.offline.toLocaleString()}</p>
               </div>
            </div>
          </div>

          <button 
            onClick={() => setShowNotifications(true)}
            className={`relative p-5 rounded-2xl border transition-all duration-300 ${
              notifications.length > 0 
              ? 'bg-[#FF8500] border-[#FF8500] text-white shadow-lg shadow-orange-200' 
              : 'bg-white border-gray-100 text-[#FF8500]'
            }`}
          >
            <Bell 
              size={24} 
              className={`${notifications.length > 0 ? "animate-[ring_1s_ease-in-out_infinite]" : ""}`} 
              fill={notifications.length > 0 ? "white" : "none"} 
            />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
                {notifications.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* 2. SPLIT SECTION (Stock & Finance) */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left 60%: Low Stock Scroll */}
        <div className="w-full lg:w-[62%] bg-white border border-gray-100 rounded-[2.5rem] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black flex items-center gap-2">
              <AlertCircle size={20} className="text-red-500" /> Critical Stock
            </h3>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Qty ≤ 3</span>
              <button 
                onClick={() => router.push('/partners/dashboard/products')}
                className="text-[10px] font-bold font-black text-[#FF8500] uppercase tracking-widest hover:underline transition-all"
              >
                View Inventory
              </button>
            </div>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {lowStockItems.length > 0 ? lowStockItems.map((item, idx) => (
              <div 
                key={idx} 
                onClick={() => router.push('/partners/dashboard/products')}
                className={`min-w-[220px] rounded-3xl p-4 border transition-all flex flex-col h-[220px] cursor-pointer hover:shadow-md ${
                  item.stock_quantity <= 0 
                  ? 'bg-red-50 border-red-100 hover:bg-white hover:border-red-500' 
                  : 'bg-gray-50 border-transparent hover:bg-white hover:border-orange-500'
                }`}
              >
                <div className="w-16 h-16 bg-white rounded-2xl mb-3 flex-shrink-0 overflow-hidden border border-gray-100">
                  {item.image_url ? (
                    <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={24}/></div>
                  )}
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{item.global_categories?.name || 'Product'}</p>
                <h4 className="font-bold text-gray-800 text-sm line-clamp-2 leading-tight flex-grow">{item.name}</h4>
                <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-[10px] font-medium text-gray-500">{item.unit_value} {item.unit_metric}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-black ${
                    item.stock_quantity <= 0 ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'
                  }`}>
                    {item.stock_quantity <= 0 ? 'OUT OF STOCK' : `${item.stock_quantity} LEFT`}
                  </span>
                </div>
              </div>
            )) : (
              <div className="w-full py-10 flex flex-col items-center justify-center text-gray-400">
                <Package size={40} className="opacity-20 mb-2" />
                <p className="font-medium">Loading Data For Low Stocks</p>
              </div>
            )}
          </div>
        </div>

        {/* Right 40%: Financial Overview */}
        <div className="w-full lg:w-[38%] flex flex-col gap-4">
          <div 
            onClick={() => router.push('/partners/dashboard/ledger')}
            className="group flex-1 bg-white border border-gray-100 rounded-[2rem] p-6 flex items-center gap-6 cursor-pointer hover:shadow-xl hover:shadow-emerald-50 hover:border-emerald-500 transition-all duration-500"
          >
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <ArrowDownUp size={28} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-black text-gray-900">Store Ledger</h3>
              <p className="text-sm text-gray-500 font-medium">Track accounts & settlements</p>
            </div>
            <ChevronRight className="text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
          </div>

          <div 
            onClick={() => router.push('/partners/dashboard/analytics')}
            className="group flex-1 bg-white border border-gray-100 rounded-[2rem] p-6 flex items-center gap-6 cursor-pointer hover:shadow-xl hover:shadow-red-50 hover:border-red-500 transition-all duration-500"
          >
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <BarChart3 size={28} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-black text-gray-900">Analytics</h3>
              <p className="text-sm text-gray-500 font-medium">Sales trends & performance</p>
            </div>
            <ChevronRight className="text-gray-300 group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </div>

      {/* 3. CORE ACTIONS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Inventory */}
        <div 
          onClick={() => router.push('/partners/dashboard/products')}
          className="group bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-orange-100 hover:border-[#FF8500] cursor-pointer transition-all duration-500 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <Package size={120} />
          </div>
          <div className="w-14 h-14 bg-orange-50 text-[#FF8500] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Package size={28} />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-gray-900">Inventory</h2>
          <p className="text-gray-500 leading-relaxed font-medium">Manage your products, update stock levels, and set discounts.</p>
        </div>

        {/* Billing */}
        <div 
          onClick={() => router.push('/partners/dashboard/walkin-billing')}
          className="group bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-100 hover:border-blue-500 cursor-pointer transition-all duration-500 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500 text-blue-500">
            <ScanBarcode size={120} />
          </div>
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <ScanBarcode size={28} />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-gray-900">Quick Bill</h2>
          <p className="text-gray-500 leading-relaxed font-medium">Generate instant bills for walk-in customers at your shop.</p>
        </div>
        
        {/* Settings */}
        <div 
          onClick={() => router.push('/partners/dashboard/settings')}
          className="group bg-gray-50 p-8 rounded-[2rem] border border-dashed border-orange-500 cursor-pointer transition-all duration-500 hover:border-orange-500 hover:bg-white"
        >
          <div className="w-14 h-14 bg-white text-gray-400 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
            <Settings size={28} />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-gray-400 tracking-tight">Store Settings</h2>
          <p className="text-gray-400 leading-relaxed font-medium">Configure store timings, profile info, and delivery zones.</p>
        </div>
      </div>

      {/* Notification Pane */}
      {showNotifications && profile && (
        <div className="relative">
           <NotificationSheet 
            notifications={notifications}
            userId={profile.id}
            onClose={() => setShowNotifications(false)}
            refresh={loadNotifications}
          />
        </div>
      )}
      <RequirementsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        checks={failedChecks} 
      />
      <GoOnlineConfirmationModal 
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={() => {
          setIsConfirmModalOpen(false);
          performStatusUpdate(true);
        }}
      />
    </div>
  )
}