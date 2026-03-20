//src/components/partners/ConnectivityBanner.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff, RefreshCw } from 'lucide-react'

export default function ConnectivityBanner() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // Initial check
    setIsOnline(window.navigator.onLine)

    const goOnline = () => setIsOnline(true)
    const goOffline = () => setIsOnline(false)

    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)

    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[10000] flex items-center justify-center p-4"
        >
          <div className="bg-red-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-4 border-2 border-white/20 backdrop-blur-md">
            <div className="bg-white/20 p-2 rounded-lg animate-pulse">
              <WifiOff size={20} />
            </div>
            <div>
              <p className="font-black text-sm uppercase tracking-tighter leading-none">Connection Lost</p>
              <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mt-1">Please check your internet connectivity!</p>
            </div>
            <div className="ml-4 pl-4 border-l border-white/20">
               <RefreshCw size={16} className="animate-spin opacity-50" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}