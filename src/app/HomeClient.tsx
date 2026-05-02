//src/app/HomeClient.tsx: Use as the main page content together with src/app/page.tsx
'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, ReceiptIndianRupee, PackageSearch, Wallet, 
  Users, BarChart3, ArrowRight, CheckCircle2, Zap, 
  ShoppingBag, Store, Smartphone, MessageSquare, ChevronDown } from 'lucide-react'
import PublicHeader from '@/components/PublicHeader'
import Footer from '@/components/Footer'

const showcaseItems = [
  {
    id: 'dashboard',
    title: 'Smart Dashboard',
    icon: <LayoutDashboard size={20} />,
    desc: 'Get a 360° view of your business. Monitor out of stock items, live sales, and real-time online order notifications in one unified screen.',
    image: '/assets/Aiva-Partner-Dashboard-Featured-Image.png'
  },
  {
    id: 'billing',
    title: 'Quick Billing',
    icon: <ReceiptIndianRupee size={20} />,
    desc: 'Replace expensive hardware. Generate WhatsApp invoices, track UPI/Cash/Credit payments, and manage "Udhaar" without a single sheet of paper.',
    image: '/assets/aiva-partner-dashboard-walkin-billing.png'
  },
  {
    id: 'inventory',
    title: 'Auto-Inventory',
    icon: <PackageSearch size={20} />,
    desc: 'Access 1000s of items from our global catalog. Track cost vs margin, set low-stock alerts, and manage bulk discounts effortlessly.',
    image: '/assets/aiva-partner-dashboard-inventory.mp4'
  },
  {
    id: 'analytics',
    title: 'Growth Insights',
    icon: <BarChart3 size={20} />,
    desc: 'Identify your best-selling items and peak hours. Use data-driven heatmaps to understand customer retention and maximize your daily profit.',
    image: '/assets/Aiva-Partner-Dashboard-Sales-Analytics.png'
  }
]

export default function HomeClient() {
  const [activeTab, setActiveTab] = useState(showcaseItems[0])
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const loginUrl = "/partners/auth"

  React.useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 selection:bg-[#FE8000]/30">
      <PublicHeader onInstall={deferredPrompt ? handleInstallClick : null} />

      {/* 1. Modern Hero Section */}
      <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-32 min-h-[100vh] flex flex-col justify-center overflow-hidden bg-[#fffaf5]">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FE8000]/10 border border-[#FE8000]/20 text-[#FE8000] text-sm font-bold mb-8"
            >
              <Store size={16} /> Trusted by Local Kirana Stores
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl lg:text-7xl font-black tracking-tight text-gray-900 mb-8 leading-[1.1]"
            >
              The Digital Dashboard <br />
              <span className="text-[#FE8000]">For Your Kirana Store.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Move beyond manual registers. Aiva Stores provides the digital tools you need for smart billing, inventory tracking, and hyper-local growth.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <a href={loginUrl} className="w-full sm:w-auto bg-[#FE8000] text-white px-8 py-3.5 rounded-xl text-base font-bold shadow-lg shadow-[#FE8000]/20 hover:bg-[#e67300] transition-all flex items-center justify-center gap-2">
                Get Started Now <ArrowRight size={18} />
              </a>
              <button 
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto bg-white text-gray-700 border border-gray-200 px-8 py-3.5 rounded-xl text-base font-bold hover:bg-gray-50 transition-all"
              >
                See Features
              </button>
            </motion.div>
          </div>
        </div>
        {/* Decorative background elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#FE8000]/5 via-transparent to-transparent -z-0" />

        {/* Animated Scroll Down Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 hidden md:flex flex-col items-center gap-2 cursor-pointer"
          onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <span className="text-[10px] font-bold text-[#FE8000] uppercase tracking-[0.2em]">Explore</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-8 h-12 border-2 border-[#FE8000]/30 rounded-full flex justify-center p-1"
          >
            <div className="w-1 h-2 bg-[#FE8000] rounded-full mt-1" />
          </motion.div>
          <ChevronDown size={20} className="text-[#FE8000] animate-pulse" />
        </motion.div>
      </section>

      {/* 2. Key Value Props - Grid */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { icon: <Smartphone size={28} />, title: "Paperless Billing", desc: "Ditch the expensive billing software. Send professional invoices via WhatsApp and track payments digitally." },
              { icon: <CheckCircle2 size={28} />, title: "Live Stock Sync", desc: "Auto-sync your online store and physical shop inventory. Never sell an out-of-stock item again." },
              { icon: <Wallet size={28} />, title: "Integrated Ledger", desc: "Manage withdrawals, deposits, and agent settlements with full CSV export capabilities." }
            ].map((item, idx) => (
              <div key={idx} className="space-y-4 group">
                <div className="w-14 h-14 bg-gradient-to-br from-[#FE8000] to-[#ff9d33] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. The "Product Showcase" Slider Section */}
      <section className="py-24 px-6 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold mb-4">Inside the Partner Dashboard</h2>
            <p className="text-gray-600 text-lg">Powerful tools designed specifically for Indian Retailers.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {showcaseItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
                  activeTab.id === item.id 
                  ? 'bg-[#FE8000] text-white shadow-lg' 
                  : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {item.icon} {item.title}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-[3rem] p-8 lg:p-16 border border-gray-100 shadow-2xl">
            <div className="grid lg:grid-cols-2 gap-16 items-start lg:items-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-3xl font-bold mb-6 text-gray-900">{activeTab.title}</h3>
                  <p className="text-lg text-gray-600 mb-8 leading-relaxed">{activeTab.desc}</p>
                  <ul className="space-y-4">
                    {activeTab.id === 'dashboard' && ['Out of stock alerts', 'Real-time notifications', 'Daily sales tracking'].map(li => <li key={li} className="flex items-center gap-3 font-semibold text-gray-700"><CheckCircle2 className="text-[#FE8000]" size={18}/> {li}</li>)}
                    {activeTab.id === 'billing' && ['WhatsApp Invoicing', 'Udhaar Tracking', 'Multi-mode payment'].map(li => <li key={li} className="flex items-center gap-3 font-semibold text-gray-700"><CheckCircle2 className="text-[#FE8000]" size={18}/> {li}</li>)}
                    {activeTab.id === 'inventory' && ['In-built global catalog', 'Add custom products', 'Margin analysis', 'Bulk stock update'].map(li => <li key={li} className="flex items-center gap-3 font-semibold text-gray-700"><CheckCircle2 className="text-[#FE8000]" size={18}/> {li}</li>)}
                    {activeTab.id === 'analytics' && ['Peak time heatmaps', 'Retention metrics', 'Profit tracking'].map(li => <li key={li} className="flex items-center gap-3 font-semibold text-gray-700"><CheckCircle2 className="text-[#FE8000]" size={18}/> {li}</li>)}
                  </ul>
                </motion.div>
              </AnimatePresence>

              <div className={`relative transition-all duration-500 rounded-2xl overflow-hidden shadow-2xl border-[10px] border-gray-900 bg-gray-900 mx-auto ${
                activeTab.id === 'inventory' ? 'aspect-[1920/910] w-full' : 
                activeTab.id === 'analytics' ? 'aspect-[1080/1350] w-full max-w-[340px]' : 
                'aspect-video w-full'
              }`}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.4 }}
                    className="w-full h-full"
                  >
                    {activeTab.image.endsWith('.mp4') ? (
                      <video src={activeTab.image} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                    ) : (
                      <Image 
                        src={activeTab.image} 
                        alt={activeTab.title} 
                        fill 
                        priority
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className={activeTab.id === 'analytics' ? "object-contain bg-white" : "object-cover"} 
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Managerial Features Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-orange-50 border border-orange-100">
                <Users className="text-[#FE8000] mb-4" />
                <h4 className="font-bold mb-2">Staff Management</h4>
                <p className="text-sm text-gray-600">Assign roles to delivery agents and manage their credentials securely.</p>
              </div>
              <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
                <Wallet className="text-[#FE8000] mb-4" />
                <h4 className="font-bold mb-2">Merchant Ledger</h4>
                <p className="text-sm text-gray-600">Track every rupee from settlements to deposits with CSV exports.</p>
              </div>
              <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
                <MessageSquare className="text-[#FE8000] mb-4" />
                <h4 className="font-bold mb-2">Direct Support</h4>
                <p className="text-sm text-gray-600">Connect with Aiva HQ via dedicated email and phone for feature requests.</p>
              </div>
              <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
                <Zap className="text-[#FE8000] mb-4" />
                <h4 className="font-bold mb-2">Store Settings</h4>
                <p className="text-sm text-gray-600">Control delivery radius, store timing, and bank details instantly.</p>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <span className="text-[#FE8000] font-bold tracking-widest uppercase text-xs">Total Control</span>
            <h2 className="text-4xl font-extrabold mt-4 mb-6">Manage Your Business, <br />Not Just Your Sales.</h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              Aiva provides a complete suite of back-office tools. From managing your delivery agents to configuring your store&apos;s digital radius, everything is under your thumb.
            </p>
            <div className="flex items-center gap-4 text-sm font-bold text-gray-500">
               <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-green-500"/> Secure Data</span>
               <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-green-500"/> Cloud Sync</span>
               <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-green-500"/> 24/7 Access</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Coming Soon Banner */}
      <section className="px-6 pb-24">
        <div className="max-w-7xl mx-auto rounded-[2rem] bg-[#FE8000] text-white p-8 lg:p-12 relative overflow-hidden shadow-2xl shadow-orange-200">
          <div className="relative z-10 lg:flex items-center justify-between gap-12 text-center lg:text-left">
            <div className="lg:max-w-2xl">
              <span className="bg-white/20 px-4 py-1 rounded-full text-xs font-bold mb-6 inline-block">COMING SOON</span>
              <h2 className="text-2xl lg:text-4xl font-black mb-4">Manage Online Orders From Your Desktop</h2>
              <p className="text-xl text-white/80 leading-relaxed">
                Soon, you won&apos;t need to juggle apps. Accept online orders, assign agents, and track live deliveries directly from your dashboard.
              </p>
            </div>
            <div className="mt-10 lg:mt-0">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#FE8000]"><ShoppingBag size={20}/></div>
                  <span className="font-bold text-lg">Online Management</span>
                </div>
                <div className="space-y-3">
                  <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden"><div className="h-full w-[85%] bg-white rounded-full"/></div>
                  <p className="text-xs text-white/60">Development Status: 85% Complete</p>
                </div>
              </div>
            </div>
          </div>
          {/* Abstract circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/5 rounded-full -ml-20 -mb-20 blur-3xl" />
        </div>
      </section>

      <Footer onInstall={deferredPrompt ? handleInstallClick : null} />
    </div>
  )
}