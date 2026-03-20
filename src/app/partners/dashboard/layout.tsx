// File: src/app/partners/dashboard/layout.tsx
'use client'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/supabaseClient'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Package, ShoppingBag, ReceiptIndianRupee, ArrowDownUp, 
  Settings, LogOut, ScanBarcode, Zap, BookOpen, Wallet, BarChart3, Headset, Bike
} from 'lucide-react'
import { PartnerProfileProvider, usePartnerProfile } from '@/components/partners/PartnerProfileProvider'
import ConnectivityBanner from '@/components/partners/ConnectivityBanner'

const ModernLoader = () => (
  <div className="flex flex-col items-center gap-4">
    <motion.div
      animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
      className="relative"
    >
      <Zap size={48} className="text-[#FF8500] fill-[#FF8500]" />
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        className="absolute -inset-2 border-2 border-t-orange-500 border-transparent rounded-full"
      />
    </motion.div>
    <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em] animate-pulse">Aiva Stores</p>
  </div>
)

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { profile, loading } = usePartnerProfile()
  const router = useRouter()


  useEffect(() => {
    if (!loading && !profile) {
      router.push('/partners/auth')
    }
  }, [loading, profile, router])

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-white">
      <ModernLoader />
    </div>
  )
  return <>{profile ? children : null}</>
}

function Sidebar({ isHovered, setIsHovered, handleLogout, menuItems, pathname, setIsPageLoading }: any) {
  const { profile } = usePartnerProfile()
  const [showActiveAnimation, setShowActiveAnimation] = useState(false)

  // Trigger Siri-style glow when store goes online
  useEffect(() => {
    if (profile?.is_online) {
      setShowActiveAnimation(true)
      const timer = setTimeout(() => setShowActiveAnimation(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [profile?.is_online])

  return (
    <motion.aside 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={false}
      animate={{ 
        width: isHovered ? '280px' : '80px',
        // We remove the white background from the motion.aside itself 
        // and let the inner div handle it so the Glow Layer stays on top.
        backgroundColor: 'rgba(255, 255, 255, 0)', 
      }}
      transition={{ type: 'spring', stiffness: 250, damping: 30 }}
      style={{ 
        borderTopRightRadius: '2rem', 
        borderBottomRightRadius: '2rem' 
      }}
      className="relative z-50 flex flex-col h-full shadow-[25px_0_60px_rgba(0,0,0,0.06)] backdrop-blur-2xl border-r border-white/20 overflow-hidden"
    >
      {/* --- START GLOW LAYER --- */}
      <AnimatePresence>
        {profile?.is_online && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] pointer-events-none bg-transparent"
            style={{ 
              borderTopRightRadius: '2rem', 
              borderBottomRightRadius: '2rem',
              overflow: 'hidden'
            }}
          >
            {/* The Moving Line Animation Wrapper */}
            {showActiveAnimation && (
              <div className="absolute inset-0 z-0 flex items-center justify-center">
                <motion.div 
                  className="absolute w-[600%] h-[600%]"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  style={{
                    background: 'conic-gradient(from 0deg, transparent 40%, #FF8500 50%, transparent 60%)',
                  }}
                />
                {/* Mask: Perfectly aligned with the inner content area */}
                <div 
                  className="absolute top-[4px] bottom-[4px] left-0 right-[4px] bg-white" 
                  style={{ 
                    borderTopRightRadius: 'calc(2rem - 4px)', 
                    borderBottomRightRadius: 'calc(2rem - 4px)',
                    zIndex: 1 
                  }} 
                />
              </div>
            )}

            {/* Thicker Permanent Orange Border when Online */}
            {!showActiveAnimation && (
              <div 
                className="absolute inset-0" 
                style={{ 
                  borderTopRightRadius: '2rem', 
                  borderBottomRightRadius: '2rem',
                  // Inset shadows on Top, Right, and Bottom
                  boxShadow: 'inset 0 4px 0 #FF8500, inset -4px 0 0 #FF8500, inset 0 -4px 0 #FF8500',
                  opacity: 1
                }} 
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {/* --- END GLOW LAYER --- */}

      <div className={`relative z-[70] flex flex-col h-full w-full transition-colors duration-500 ${isHovered ? 'bg-white' : 'bg-white/95'}`}
        style={{ 
          borderTopRightRadius: 'calc(2rem - 4px)', 
          borderBottomRightRadius: 'calc(2rem - 4px)',
          // Consistent 4px gap on all three visible outer edges
          margin: profile?.is_online ? '4px 4px 4px 0' : '0',
          width: profile?.is_online ? 'calc(100% - 4px)' : '100%'
        }}>
      {/* Logo Section */}
      <div className="h-24 flex items-center px-4 shrink-0">
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="min-w-[48px] h-12 relative rounded-[12px] p-[2px] bg-gradient-to-tr from-orange-400 to-orange-100 shadow-sm"
          >
            <div className="relative w-full h-full rounded-[10px] overflow-hidden bg-white">
              <Image 
                src={profile?.banner_url || '/assets/store_fallback.jpg'} 
                alt={profile?.store_name || 'Store Banner'} 
                fill
                className="object-cover"
              />
            </div>
          </motion.div>
          
          <AnimatePresence>
            {isHovered && (
              <motion.div 
                initial={{ opacity: 0, x: -8 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -8 }}
                className="overflow-hidden"
              >
                <h2 className="font-bold text-gray-800 leading-none text-[16px] line-clamp-2 uppercase tracking-regular">
                  {profile?.store_name || 'My Store'}
                </h2>
                <div className="flex items-center gap-1.5 mt-1">
                  {/* The Dot: Blinking orange if online, steady grey if offline */}
                  <span className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                    profile?.is_online 
                      ? 'bg-[#FF8500] animate-[pulse_1.5s_cubic-bezier(0.4,0,0.6,1)_infinite] shadow-[0_0_8px_rgba(255,133,0,0.5)]' 
                      : 'bg-gray-400'
                  }`} />
                  
                  <p className={`text-[12px] font-bold tracking-widest uppercase ${
                    profile?.is_online ? 'text-[#FF8500]' : 'text-gray-500'
                  }`}>
                    {profile?.is_online ? 'Store Live' : 'Store Offline'}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-2 mt-4 overflow-y-auto no-scrollbar">
        {menuItems.map((item: any, index: number) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.disabled ? '#' : item.href}
              onClick={() => { if(!item.disabled && pathname !== item.href) setIsPageLoading(true) }}
              className={`group relative flex items-center h-12 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'text-[#FF8500]' 
                  : item.disabled 
                    ? 'text-gray-200 cursor-not-allowed' 
                    : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100/50'
              }`}
            >
              {isActive && (
                <motion.div layoutId="activeNav" className="absolute inset-0 bg-orange-50/80 rounded-xl -z-10" />
              )}
              {isActive && (
                <motion.div 
                  layoutId="indicator"
                  className="absolute left-0 w-1 h-6 bg-[#FF8500] rounded-r-full shadow-[0_0_10px_rgba(255,133,0,0.5)]" 
                />
              )}
              <div className="min-w-[54px] flex items-center justify-center">
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <AnimatePresence mode="wait">
                {isHovered && (
                  <motion.span 
                    initial={{ opacity: 0, x: -5 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: -5 }}
                    transition={{ delay: index * 0.03 }}
                    className="font-semibold tracking-regular whitespace-wrap"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          )
        })}
      </nav>

      {/* Logout Section */}
      <div className="pl-3 pr-3 mb-1">
        <button 
          onClick={handleLogout}
          className="flex items-center h-12 w-full text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300"
        >
          <div className="min-w-[54px] flex items-center justify-center">
            <LogOut size={20} />
          </div>
          <AnimatePresence>
            {isHovered && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-bold text-sm">
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* BRAND FOOTER */}
      <div className="px-4 py-4">
        <AnimatePresence>
          {isHovered && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex flex-col gap-3 pl-2"
            >
              <div className="space-y-1">
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Powered by</p>
                <div className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity">
                  <Image 
                    src="/assets/logo.png" 
                    alt="Aiva Logo" 
                    width={24} 
                    height={24} 
                    className="object-contain"
                  />
                  <span className="text-[12px] font-semibold font-black text-gray-700 tracking-tight">© {new Date().getFullYear()} Aiva Stores<br/>Private Limited</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>
    </motion.aside>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isPageLoading, setIsPageLoading] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const supabase = createClient()
  const router = useRouter()

  // Prevent scrolling when page is loading
  useEffect(() => {
    if (isPageLoading) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isPageLoading])

  const handleLogout = async () => {
    setIsPageLoading(true) // Show the loader while signing out
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error logging out:', error.message)
      setIsPageLoading(false)
    } else {
      router.push('/partners/auth')
    }
  }

  useEffect(() => {
    setIsPageLoading(false)
  }, [pathname])

  // 2. Updated Menu Items with the specific order and "Coming Soon" status
  const menuItems = [
    { name: 'Dashboard', href: '/partners/dashboard', icon: LayoutDashboard, disabled: false },
    { name: 'Walk-in Billing', href: '/partners/dashboard/walkin-billing', icon: ScanBarcode, disabled: false },
    { name: 'Inventory', href: '/partners/dashboard/products', icon: Package, disabled: false },    
    { name: 'Ledger', href: '/partners/dashboard/ledger', icon: ArrowDownUp, disabled: false },
    { name: 'Settlements', href: '/partners/dashboard/settlements', icon: Wallet, disabled: false },
    { name: 'Delivery Agents', href: '/partners/dashboard/delivery-agents', icon: Bike, disabled: false },
    { name: 'Analytics', href: '/partners/dashboard/analytics', icon: BarChart3, disabled: false },
    { name: 'Settings', href: '/partners/dashboard/settings', icon: Settings, disabled: false },
    { name: 'Online Orders (Coming Soon)', href: '/partners/dashboard/online-orders', icon: ShoppingBag, disabled: false },
    { name: 'Store Support', href: '/partners/dashboard/support', icon: Headset, disabled: false },
  ]

  return (
    <PartnerProfileProvider>
      <AuthGuard>
        <ConnectivityBanner />
        <div className="flex h-screen w-full bg-[#F8F9FA] overflow-hidden relative">
          <AnimatePresence>
            {isHovered && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-40 bg-black/15 backdrop-blur-[1px] pointer-events-none border-r border-black/20"
              />
            )}
          </AnimatePresence>

          {/* Global Page Loader - Fixed positioning to cover entire screen */}
          <AnimatePresence>
            {isPageLoading && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="fixed inset-0 z-[9999] bg-white/80 backdrop-blur-md flex items-center justify-center"
              >
                <ModernLoader />
              </motion.div>
            )}
          </AnimatePresence>

          <Sidebar 
            isHovered={isHovered} 
            setIsHovered={setIsHovered} 
            handleLogout={handleLogout} 
            menuItems={menuItems} 
            pathname={pathname} 
            setIsPageLoading={setIsPageLoading} 
          />
          <main className="flex-1 h-screen overflow-y-auto relative bg-[#F8F9FA]">
            <div className="p-8 lg:p-12 max-w-[1400px]">
                {children}
            </div>
          </main>
        </div>
      </AuthGuard>
    </PartnerProfileProvider>
  )
}