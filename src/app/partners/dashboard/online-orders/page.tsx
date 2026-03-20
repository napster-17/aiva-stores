//src/app/partners/dashboard/online-orders/page.tsx
'use client'

import React from 'react'
import { 
  Globe, 
  Smartphone, 
  Monitor, 
  ArrowRight, 
  Rocket, 
  LayoutDashboard, 
  ShieldCheck,
  PackageSearch
} from 'lucide-react'
import { Button } from '@/components/button'

export default function OnlineOrdersComingSoon() {
  const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.nikk.aivapartners"

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-700">
      <div className="max-w-3xl w-full text-center space-y-8">
        
        {/* Visual Identity: Bridging App and Web */}
        <div className="relative flex justify-center">
          <div className="absolute inset-0 bg-orange-100 blur-3xl rounded-full opacity-50 scale-150" />
          <div className="relative flex items-center gap-6 bg-white p-6 rounded-3xl shadow-xl border border-orange-50">
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-gray-900 rounded-xl text-white">
                <Smartphone size={32} />
              </div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Mobile App</span>
            </div>
            
            <div className="flex flex-col items-center gap-1">
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-orange-200 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-[#FF8500] rounded-xl text-white shadow-lg shadow-orange-200">
                <Monitor size={32} />
              </div>
              <span className="text-[10px] font-black text-[#FF8500] uppercase tracking-tighter">Web Portal</span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
            Order Management <br/> <span className="text-[#FF8500]">Coming to Web Soon.</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            We’ve successfully brought your Ledger, Settlements, and Profile to the web. We are now working on replicating the complex, real-time Order flow to ensure you have a seamless experience across all your devices.
          </p>
        </div>

        {/* Feature Specific Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg w-fit mb-4">
              <ShieldCheck size={20} />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Real-time Reliability</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Managing live orders requires 100% uptime. We are perfecting the web notification system so you never miss a customer request while away from your phone.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg w-fit mb-4">
              <LayoutDashboard size={20} />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Full Sync Access</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Once live, any action you take on the web—accepting, packing, or dispatching—will instantly reflect on your Aiva Partners mobile app.
            </p>
          </div>
        </div>

        {/* Action Box */}
        <div className="bg-gray-900 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center gap-8 justify-between shadow-2xl shadow-gray-200">
          <div className="text-left space-y-2">
            <div className="flex items-center gap-2 text-orange-400">
              <PackageSearch size={18} />
              <h4 className="font-black uppercase tracking-widest text-xs">Active Management</h4>
            </div>
            <p className="text-sm text-gray-300 max-w-sm leading-snug">
              Your customers can still place orders via the GoAiva App. Please continue using the <span className="text-white font-bold">Aiva Partners App</span> on your phone to process them.
            </p>
          </div>
          
          <a 
            href={PLAY_STORE_URL} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full md:w-auto"
          >
            <Button className="w-full bg-[#FF8500] hover:bg-[#e67800] text-white px-8 h-14 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-orange-900/20">
              Get App on Play Store <ArrowRight size={16} />
            </Button>
          </a>
        </div>

        {/* Development Footer */}
        <div className="pt-4">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2">
            <Rocket size={12} className="text-[#FF8500]" /> High-performance web dashboard for online orders under construction
          </p>
        </div>
      </div>
    </div>
  )
}