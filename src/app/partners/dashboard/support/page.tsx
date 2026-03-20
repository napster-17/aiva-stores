//src/app/partners/dashboard/support/page.tsx
'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Phone, Bug, Lightbulb, Copy, Check, ArrowRight, Clock } from 'lucide-react'
import { usePartnerProfile } from '@/components/partners/PartnerProfileProvider'

const SupportCard = ({ 
  icon: Icon, 
  title, 
  description, 
  value,
  label,
  isCopyable = false,
  onClick
}: { 
  icon: any, 
  title: string, 
  description: string, 
  value?: string,
  label?: string,
  isCopyable?: boolean,
  onClick?: () => void
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={onClick}
      className={`flex flex-col p-6 bg-white rounded-2xl border border-gray-100 shadow-sm transition-all text-left w-full relative group min-h-[220px] ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="p-3 w-fit rounded-xl bg-orange-50 text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300 mb-4">
        <Icon size={24} />
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed mb-6">
        {description}
      </p>

      {value ? (
        <div className="mt-auto pt-4 border-t border-gray-50">
          <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1.5 opacity-70">
            {label}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-800 break-all select-all">
              {value}
            </span>
            {isCopyable && (
              <button 
                onClick={handleCopy}
                className="p-1.5 text-gray-300 hover:text-orange-500 hover:bg-orange-50 rounded-md transition-all flex-shrink-0"
              >
                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-auto flex items-center text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] group-hover:text-orange-500 transition-colors">
          <span>{onClick ? 'Open WhatsApp' : 'Connect Now'}</span>
          <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
        </div>
      )}

      <AnimatePresence>
        {copied && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="absolute top-4 right-4 bg-green-500 text-white text-[10px] font-black px-2 py-1 rounded shadow-lg"
          >
            COPIED
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function SupportPage() {
  const { profile } = usePartnerProfile();
  const WHATSAPP_NUMBER = "8879316037";

  const openWhatsApp = (type: 'BUG' | 'FEEDBACK') => {
    const storeName = profile?.store_name || 'N/A';
    const storeId = profile?.id || 'N/A';
    
    let message = "";
    
    if (type === 'BUG') {
      message = `*🚨 BUG REPORT*\n\n` +
                `*Store Name:* ${storeName}\n` +
                `*Store ID:* ${storeId}\n` +
                `*Issue Details:* \n- \n\n` +
                `_Sent via Aiva Partner Support_`;
    } else {
      message = `*💡 FEEDBACK/SUGGESTION*\n\n` +
                `*Store Name:* ${storeName}\n` +
                `*Store ID:* ${storeId}\n` +
                `*Feedback:* \n- \n\n` +
                `_Sent via Aiva Partner Support_`;
    }

    const encodedMessage = encodeURIComponent(message);
    
    // Detect mobile to decide between web.whatsapp and api.whatsapp
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const baseUrl = isMobile 
      ? `https://api.whatsapp.com/send` 
      : `https://web.whatsapp.com/send`;

    window.open(`${baseUrl}?phone=${WHATSAPP_NUMBER}&text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-8">
      <header>
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Help & Support</h1>
          <p className="text-sm font-medium text-gray-400 uppercase tracking-[0.2em]">Partner Success Center</p>
        </motion.div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SupportCard 
          icon={Mail}
          title="Email Support"
          description="Drop us a line for documentation or account queries."
          label="Email Address"
          value="info@thegoaiva.com"
          isCopyable
        />
        <SupportCard 
          icon={Phone}
          title="Call Us"
          description="Direct line for urgent operational assistance."
          label="Contact Number"
          value="+91 8879316037"
          isCopyable
        />
        <SupportCard 
          icon={Bug}
          title="Report Bug"
          description="Encountered a glitch? Share it with our tech team on WhatsApp."
          onClick={() => openWhatsApp('BUG')}
        />
        <SupportCard 
          icon={Lightbulb}
          title="Feedback"
          description="Suggest features or improvements to make Aiva better for you."
          onClick={() => openWhatsApp('FEEDBACK')}
        />
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-8 bg-white rounded-2xl border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm"
      >
        <div className="flex items-center gap-6">
          <div className="relative w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500">
            <Clock size={28} />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500 border-2 border-white"></span>
            </span>
          </div>
          <div className="text-center md:text-left">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Standard Support Hours</h4>
            <p className="text-lg font-bold text-gray-900 tracking-tight">Mon - Sun: 09:00 AM to 09:00 PM</p>
          </div>
        </div>

        <div className="h-px w-12 md:w-px md:h-12 bg-gray-100" />

        <div className="text-center md:text-right">
          <p className="text-orange-500 font-black text-[10px] uppercase tracking-[0.2em] mb-1">Typical Response</p>
          <p className="text-2xl font-black text-gray-900 tracking-tighter">Under 2 Hours</p>
        </div>
      </motion.div>
    </div>
  )
}