//src/components/partners/settings/RequirementsModal.tsx
import { X, CheckCircle2, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function RequirementsModal({ isOpen, onClose, checks }: any) {
  if (!isOpen) return null;

  const items = [
    { label: "Internet Connection", status: checks.isInternetConnected },
    { label: "10+ Products in Stock", status: checks.hasProducts },
    { label: "Delivery Method Enabled (Std/Instant)", status: checks.hasSlots },
    { label: "Inside Store Timings", status: checks.isWithinHours },
    { label: "Account Status (Not Flagged)", status: checks.isNotFlagged },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-gray-900">Go Online Requirements</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={20}/></button>
        </div>
        <div className="space-y-4 mb-8">
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-gray-50 bg-gray-50/50">
              <span className="font-bold text-gray-700">{item.label}</span>
              {item.status ? <CheckCircle2 className="text-emerald-500" /> : <AlertCircle className="text-red-500" />}
            </div>
          ))}
        </div>
        <button onClick={onClose} className="w-full py-4 bg-orange-600 text-white rounded-2xl font-bold hover:bg-orange-700 transition-colors">
          Got it, I'll fix it!
        </button>
      </motion.div>
    </div>
  )
}