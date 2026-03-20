//src/components/GlobalLoader.tsx
'use client'

import Lottie from 'lottie-react'
import logoAnimation from '@/app/assets/Aiva-Logo-Orange.json'
import { motion } from 'framer-motion'

export default function GlobalLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/80 backdrop-blur-md">
      <div className="w-48 h-48">
        <Lottie animationData={logoAnimation} loop={true} />
      </div>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        className="flex flex-col items-center gap-1"
      >
        <span className="text-orange-600 font-black tracking-widest uppercase text-xs">AIVA</span>
        <span className="text-gray-400 font-bold text-[10px] uppercase tracking-tighter">Dashboard Loading...</span>
      </motion.div>
    </div>
  )
}