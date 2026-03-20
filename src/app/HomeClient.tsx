//src/app/HomeClient.tsx: Use as the main page content together with src/app/page.tsx
//src/app/partner-dashboard/DashboardClient.tsx
'use client'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { LayoutDashboard, ReceiptIndianRupee, PackageSearch, Wallet, Users, BarChart3, 
  ArrowRight, ShieldCheck, Zap, TrendingUp, Clock, PieChart, ShoppingBag, } from 'lucide-react'
import PublicHeader from '@/components/PublicHeader'
import Footer from '@/components/Footer'

const PartnerFeatureCard = ({ icon, title, desc }: { icon: React.ReactNode; title: string, desc: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.5 }}
    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-start hover:shadow-md transition-all duration-300 h-full group"
  >
    <div className="w-12 h-12 bg-[#FE8000]/10 rounded-xl flex items-center justify-center text-[#FE8000] mb-6 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h4 className="text-xl font-bold text-gray-800 mb-3">{title}</h4>
    <p className="text-gray-500 leading-relaxed text-sm">{desc}</p>
  </motion.div>
)

const HighlightSection = ({ 
  title, 
  subtitle, 
  description, 
  features, 
  imageSrc, 
  imageLeft = false,
  isOrange = false,
  isSquare = false,
  isVideo = false
}: { 
  title: string, 
  subtitle: string, 
  description: string, 
  features: string[], 
  imageSrc: string, 
  imageLeft?: boolean,
  isOrange?: boolean,
  isSquare?: boolean,
  isVideo?: boolean
}) => (
  <section className={`w-full py-24 px-6 sm:px-10 ${isOrange ? 'bg-[#fff8f2]' : 'bg-white'}`}>
    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
      <motion.div 
        className={`${imageLeft ? 'lg:order-2' : ''}`}
        initial={{ opacity: 0, x: imageLeft ? 30 : -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <span className="text-[#FE8000] font-bold tracking-wider uppercase text-sm">{subtitle}</span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2 mb-6 leading-tight">
          {title}
        </h2>
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          {description}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-3 text-gray-700">
              <ShieldCheck className="text-[#FE8000] shrink-0" size={18} />
              <span className="font-medium text-sm">{f}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div 
        className={`relative ${
          isVideo ? 'aspect-[1920/910]' : isSquare ? 'aspect-[4/5] lg:aspect-square max-w-md mx-auto' : 'aspect-video'
        } rounded-3xl overflow-hidden shadow-2xl border-[12px] border-gray-900/5 ${imageLeft ? 'lg:order-1' : ''}`}
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        {imageSrc.endsWith('.mp4') ? (
          <video
            src={imageSrc}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <Image
            src={imageSrc}
            alt={title}
            fill
            className="object-cover"
          />
        )}
      </motion.div>
    </div>
  </section>
)

export default function PartnerDashboardLanding() {
  const loginUrl = "https://www.thegoaiva.com/partners/auth"

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800">
      <PublicHeader />

      {/* 1. Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative w-full min-h-[85vh] pt-24 pb-12 bg-black overflow-hidden flex items-center"
      >
        <Image
          src="/assets/Aiva-Partner-Dashboard-Featured-Image.png"
          alt="GoAiva Partner Background"
          fill
          priority
          className="object-cover opacity-20"
        />
        <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center z-10">
          <div className="text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-[#FE8000]/20 border border-[#FE8000]/30 text-[#FE8000] px-4 py-2 rounded-full text-sm font-bold mb-6"
            >
              Partner Dashboard 2.0
            </motion.div>
            <h1 className="text-5xl sm:text-6xl font-extrabold text-white mb-6 leading-tight">
              Your Store, <br />
              <span className="text-[#FE8000]">Digitized & Scaled.</span>
            </h1>
            <p className="text-xl text-gray-300 mb-10 max-w-xl leading-relaxed">
              Stop struggling with slow billing and messy registers. Manage inventory, track live sales, and grow your Kirana business with India's most advanced partner dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={loginUrl}
                className="bg-[#FE8000] text-white px-8 py-4 rounded-xl text-lg font-bold transition-all hover:bg-[#ff901a] hover:scale-105 shadow-xl flex items-center justify-center gap-2"
              >
                Login to Dashboard <ArrowRight size={20} />
              </a>
            </div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative hidden lg:block"
          >
             <div className="relative rounded-2xl overflow-hidden shadow-2xl border-8 border-white/10">
                <Image
                  src="/assets/Aiva-Partner-Dashboard-Featured-Image.png"
                  alt="GoAiva Dashboard Preview"
                  width={800}
                  height={500}
                  className="w-full h-auto object-cover"
                />
             </div>
          </motion.div>
        </div>
      </motion.section>

      {/* 2. Quick Features Grid - Alternating White */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-5xl font-bold mb-4 text-gray-900">Built for Modern Kirana</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">One platform to manage your walk-in customers and your digital future.</p>
        </div>
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <PartnerFeatureCard icon={<LayoutDashboard />} title="Store Command Center" desc="Take your store online/offline instantly. Monitor inventory health and daily sales overview at a glance." />
          <PartnerFeatureCard icon={<ReceiptIndianRupee />} title="Smart Walk-in Billing" desc="Generate and share invoices over WhatsApp. Complete support for Cash, UPI, and Credit payments." />
          <PartnerFeatureCard icon={<PackageSearch />} title="Inventory Management" desc="Access our global catalog to add items in seconds. Group similar products and manage multi-variant stocks." />
          <PartnerFeatureCard icon={<Wallet />} title="Merchant Ledger" desc="Transparent tracking of all fees, balances, and settlements. Export full history to CSV for your records." />
          <PartnerFeatureCard icon={<BarChart3 />} title="Sales Analytics" desc="Identify peak hours with heatmaps, track returning customers, and optimize your most profitable categories." />
          <PartnerFeatureCard icon={<Users />} title="Staff Management" desc="Securely add and manage up to 4 delivery agents with dedicated login credentials for your store." />
        </div>
      </section>

      {/* 3. Walk-in Billing Deep Dive - Alternating Whitish Orange */}
      <HighlightSection 
        subtitle="billing redefined"
        isOrange={true}
        title="Ditch the Expensive, Clunky Hardware"
        description="Why pay heavy monthly setup charges for billing software that wastes paper? Switch to a digital-first system that saves you money and goes green."
        features={[
          "Zero Paper Waste - Go Digital",
          "WhatsApp Invoicing in Real-time",
          "No Monthly Setup Fees",
          "Animated Quick-Access Sidebar",
          "Automated Udhaar (Credit) Tracking",
          "Search & Print History Instantly"
        ]}
        imageSrc="/assets/aiva-partner-dashboard-walkin-billing.png"
      />

      {/* 4. Inventory Section - Alternating White */}
      <HighlightSection 
        subtitle="inventory & stock"
        isOrange={false}
        imageLeft={true}
        isVideo={true}
        title="Your Entire Catalog, Managed in Minutes"
        description="Say goodbye to manual data entry. Use our in-house global catalog to build your inventory or add custom items if they are missing."
        features={[
          "Global In-house Product Catalog",
          "Bulk/Multi-select Actions",
          "Manage Cost vs Selling Price",
          "Low Stock Notification System",
          "Easy Product Grouping",
          "Category-wise Easy Search"
        ]}
        imageSrc="/assets/aiva-partner-dashboard-inventory.mp4"
      />

      {/* 5. Data-Driven Analytics Section */}
      <section className="py-24 px-6 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-[#FE8000] font-bold tracking-wider uppercase text-sm">Powerful Analytics</span>
            <h2 className="text-4xl font-extrabold text-gray-900 mt-2 mb-6">Data Points that Drive Profit</h2>
            <p className="text-lg text-gray-600 mb-10 leading-relaxed">
              Understand your business better than ever. Filter data by time range, compare Online vs Offline performance, and get deep insights into every corner of your business.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
              <div className="border-l-4 border-[#FE8000] pl-4">
                <div className="flex items-center gap-2 mb-1">
                  <Clock size={18} className="text-[#FE8000]" />
                  <span className="font-bold text-xl text-gray-800">Peak Times</span>
                </div>
                <p className="text-sm text-gray-500">Order density heatmaps to track your busiest hours.</p>
              </div>
              <div className="border-l-4 border-[#FE8000] pl-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp size={18} className="text-[#FE8000]" />
                  <span className="font-bold text-xl text-gray-800">Profitability</span>
                </div>
                <p className="text-sm text-gray-500">Track net profit per order and margin trends automatically.</p>
              </div>
              <div className="border-l-4 border-[#FE8000] pl-4">
                <div className="flex items-center gap-2 mb-1">
                  <Users size={18} className="text-[#FE8000]" />
                  <span className="font-bold text-xl text-gray-800">Retention</span>
                </div>
                <p className="text-sm text-gray-500">New vs Returning customer metrics to build loyalty.</p>
              </div>
              <div className="border-l-4 border-[#FE8000] pl-4">
                <div className="flex items-center gap-2 mb-1">
                  <PieChart size={18} className="text-[#FE8000]" />
                  <span className="font-bold text-xl text-gray-800">Inventory</span>
                </div>
                <p className="text-sm text-gray-500">Identify your best and least selling items in seconds.</p>
              </div>
            </div>
          </motion.div>

          {/* Portrait Orientation Analytics Image */}
          <motion.div 
            className="relative aspect-[4/5] max-w-md mx-auto w-full rounded-[2.5rem] overflow-hidden shadow-2xl border-[12px] border-gray-100 bg-white"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <Image
              src="/assets/Aiva-Partner-Dashboard-Sales-Analytics.png"
              alt="Analytics Dashboard"
              fill
              className="object-contain"
            />
          </motion.div>
        </div>
      </section>

      {/* 6. Online Orders Management (Coming Soon) - Orange Style */}
      <section className="relative bg-[#FE8000] text-white py-16 px-6 overflow-hidden">
        <div className="relative max-w-7xl mx-auto z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="lg:w-2/3 text-center lg:text-left">
            <div className="inline-block bg-white text-[#FE8000] text-xs font-bold px-3 py-1 rounded-full mb-4">COMING SOON</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Manage Online Orders from Desktop</h2>
            <p className="text-white/90 text-lg">
              Accept orders, assign agents, and track delivery and payments for all online orders directly from your dashboard.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center lg:justify-end lg:w-1/3">
             <div className="bg-white/90 text-[#FE8000] text-sm px-5 py-3 rounded-xl shadow-md font-semibold flex items-center gap-2">
                <ShoppingBag size={18} /> Real-time Alerts
             </div>
             <div className="bg-white/90 text-[#FE8000] text-sm px-5 py-3 rounded-xl shadow-md font-semibold flex items-center gap-2">
                <Zap size={18} /> Agent Tracking
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}