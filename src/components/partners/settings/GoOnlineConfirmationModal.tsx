//src/components/partners/settings/GoOnlineConfirmationModal.tsx
'use client'
import { useState } from 'react'
import { X, AlertTriangle, Smartphone, Truck, Bell } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/button'

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function GoOnlineConfirmationModal({ isOpen, onClose, onConfirm }: Props) {
  const [isHindi, setIsHindi] = useState(false);

  if (!isOpen) return null;

  const content = {
    en: {
      title: "Ready to go Online?",
      subtitle: "Please read this carefully before opening your digital doors.",
      points: [
        {
          icon: <Smartphone className="text-blue-500" />,
          text: "Ensure the Aiva Partners App is installed and active on your Android phone to receive real-time orders."
        },
        {
          icon: <Bell className="text-orange-500" />,
          text: "Stay alert! Missing orders may lead to penalties as customers expect timely fulfillment."
        },
        {
          icon: <Truck className="text-emerald-500" />,
          text: "If you don't have a delivery agent or can't deliver door-to-door today, please stay offline."
        }
      ],
      confirm: "Yes, I am Ready",
      cancel: "Maybe Later"
    },
    hi: {
      title: "क्या आप ऑनलाइन जाने के लिए तैयार हैं?",
      subtitle: "अपनी डिजिटल दुकान खोलने से पहले इसे ध्यान से पढ़ें।",
      points: [
        {
          icon: <Smartphone className="text-blue-500" />,
          text: "सुनिश्चित करें कि ऑर्डर प्राप्त करने के लिए आपके एंड्रॉइड फोन पर Aiva Partners App इंस्टॉल और सक्रिय है।"
        },
        {
          icon: <Bell className="text-orange-500" />,
          text: "सतर्क रहें! ऑर्डर मिस करने से पेनल्टी लग सकती है क्योंकि ग्राहक समय पर डिलीवरी की उम्मीद करते हैं।"
        },
        {
          icon: <Truck className="text-emerald-500" />,
          text: "यदि आपके पास डिलीवरी एजेंट नहीं है या आप घर-घर डिलीवरी नहीं कर सकते हैं, तो कृपया ऑफलाइन ही रहें।"
        }
      ],
      confirm: "हाँ, मैं तैयार हूँ",
      cancel: "बाद में"
    }
  };

  const current = isHindi ? content.hi : content.en;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-[2.5rem] overflow-hidden max-w-lg w-full shadow-2xl border border-white"
      >
        {/* Header with Language Toggle */}
        <div className="p-8 pb-0">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-orange-50 p-3 rounded-2xl">
              <AlertTriangle className="text-orange-600" size={24} />
            </div>
            <div className="flex items-center bg-gray-100 p-1 rounded-xl">
              <button 
                onClick={() => setIsHindi(false)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${!isHindi ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500'}`}
              >
                English
              </button>
              <button 
                onClick={() => setIsHindi(true)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${isHindi ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500'}`}
              >
                हिंदी
              </button>
            </div>
          </div>

          <h2 className="text-3xl font-black text-gray-900 leading-tight mb-2">{current.title}</h2>
          <p className="text-gray-500 font-medium mb-8">{current.subtitle}</p>

          <div className="space-y-6 mb-8">
            {current.points.map((point, i) => (
              <div key={i} className="flex gap-4">
                <div className="mt-1">{point.icon}</div>
                <p className="font-bold text-gray-700 leading-snug">{point.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 bg-gray-50 flex gap-3">
          <Button 
            onClick={onClose}
            className="flex-1 h-14 rounded-2xl bg-white border border-gray-200 text-gray-600 font-bold hover:bg-gray-100"
          >
            {current.cancel}
          </Button>
          <Button 
            onClick={onConfirm}
            className="flex-[1.5] h-14 rounded-2xl bg-orange-600 text-white font-bold uppercase tracking-wider hover:bg-orange-700 shadow-lg shadow-orange-200"
          >
            {current.confirm}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}