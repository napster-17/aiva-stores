// src/components/partners/settings/DeliverySettings.tsx
'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Loader2, CircleCheckBig, Clock, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/input'

interface DeliverySettingsProps {
  formData: any;
  onInputChange: (field: string, value: any) => void;
}

export default function DeliverySettings({ formData, onInputChange }: DeliverySettingsProps) {
  const [slots, setSlots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSavingSlots, setIsSavingSlots] = useState(false)
  const [isDirtySlots, setIsDirtySlots] = useState(false)

  useEffect(() => {
    fetchSlots()
  }, [])

  const fetchSlots = async () => {
    try {
      const response = await fetch('/api/partners/delivery-slots')
      const data = await response.json()
      if (Array.isArray(data)) {
        setSlots(data)
        setIsDirtySlots(false)
      }
    } catch (error) {
      toast.error("Failed to load slots")
    } finally {
      setLoading(false)
    }
  }

  const to24h = (timeStr: string) => {
    if (!timeStr) return "09:00"
    const [time, modifier] = timeStr.split(' ')
    let [hours, minutes] = time.split(':')
    if (modifier === 'PM' && hours !== '12') hours = String(parseInt(hours) + 12)
    if (modifier === 'AM' && hours === '12') hours = '00'
    return `${hours.padStart(2, '0')}:${minutes}`
  }

  const handleSlotTimeChange = (id: string, field: 'start_time' | 'end_time', value: string) => {
    if (!value) return
    const [h, m] = value.split(':')
    let hours = parseInt(h)
    const suffix = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    const formattedTime = `${displayHours}:${m} ${suffix}`
    setSlots(slots.map(s => s.id === id ? { ...s, [field]: formattedTime } : s))
    setIsDirtySlots(true)
  }

  const addSlot = () => {
    if (slots.length >= 4) return toast.error("Maximum 4 slots allowed")
    const newSlot = { id: 'temp-' + Date.now(), start_time: '09:00 AM', end_time: '10:00 AM' }
    setSlots([...slots, newSlot])
    setIsDirtySlots(true)
  }

  const deleteSlot = async (id: string) => {
    let updatedSlots;
    if (id.toString().startsWith('temp-')) {
      updatedSlots = slots.filter(s => s.id !== id);
      setSlots(updatedSlots);
    } else {
      try {
        const res = await fetch('/api/partners/delivery-slots', {
          method: 'POST',
          body: JSON.stringify({ action: 'delete', slotId: id })
        })
        if (res.ok) {
          updatedSlots = slots.filter(s => s.id !== id);
          setSlots(updatedSlots);
          toast.success("Slot removed");
        } else {
          return;
        }
      } catch (error) {
        toast.error("Delete failed");
        return;
      }
    }

    // FIX: If no slots left, force-update the profile immediately so the DB stays in sync
    if (updatedSlots && updatedSlots.length === 0 && formData.standard_delivery) {
      onInputChange('standard_delivery', false);
      
      // Auto-Patch call to prevent "reload" inconsistency
      fetch('/api/partners/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, standard_delivery: false }),
      });
      
      toast.info("Standard delivery disabled because all slots were removed.");
    }
  };

  const saveSlots = async () => {
    if (formData.standard_delivery && slots.length === 0) {
      return toast.error("Please add at least one delivery slot to enable Standard Delivery")
    }

    const timeToMinutes = (timeStr: string) => {
      const [time, modifier] = timeStr.split(' ')
      let [hours, minutes] = time.split(':').map(Number)
      if (modifier === 'PM' && hours < 12) hours += 12
      if (modifier === 'AM' && hours === 12) hours = 0
      return hours * 60 + minutes
    }

    // Sort slots by start time to check overlaps easily
    const sortedSlots = [...slots].sort((a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time));

    for (let i = 0; i < sortedSlots.length; i++) {
      const start = timeToMinutes(sortedSlots[i].start_time)
      const end = timeToMinutes(sortedSlots[i].end_time)
      
      if (start >= end) {
        return toast.error(`Invalid range: Slot ${i + 1} ends before it starts.`)
      }

      // Check against the next slot for overlap
      if (i < sortedSlots.length - 1) {
        const nextStart = timeToMinutes(sortedSlots[i + 1].start_time)
        if (end > nextStart) {
          return toast.error(`Slot overlap detected! The slot ending at ${sortedSlots[i].end_time} overlaps with the one starting at ${sortedSlots[i+1].start_time}.`)
        }
      }
    }

    setIsSavingSlots(true)
    try {
      // First, we need to ensure we are sending the correct data to the API
      // Note: Your current API handles upsert, but for simplicity we iterate
      for (const slot of slots) {
        await fetch('/api/partners/delivery-slots', {
          method: 'POST',
          body: JSON.stringify({ action: 'upsert', slot })
        })
      }
      toast.success("Delivery slots updated")
      fetchSlots()
      setIsDirtySlots(false)
    } catch (error) {
      toast.error("Failed to save slots")
    } finally {
      setIsSavingSlots(false)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
      {/* STANDARD DELIVERY SECTION */}
      <div className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm space-y-6 flex flex-col min-h-[520px]">
        <div className="flex items-center justify-between p-4 bg-orange-50/50 rounded-2xl border border-orange-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
              <Clock size={20} />
            </div>
            <div>
              <h4 className="text-[12] font-extrabold text-gray-800 uppercase tracking-regular">Standard Delivery</h4>
              <p className="text-[12px] text-gray-500 font-medium">Manage std delivery slots</p>
            </div>
          </div>
          <button
            onClick={() => {
              const nextState = !formData.standard_delivery;
              if (nextState && slots.length === 0) {
                return toast.error("Add at least one slot first");
              }
              onInputChange('standard_delivery', nextState);
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.standard_delivery ? 'bg-orange-600' : 'bg-gray-200'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.standard_delivery ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        <div className="space-y-6 flex-1">
          <div className={`grid grid-cols-2 gap-3 transition-opacity ${!formData.standard_delivery ? 'opacity-40 pointer-events-none' : ''}`}>
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-gray-800 uppercase tracking-widest ml-1">Fee (₹)</label>
              <Input type="number" value={formData.standard_delivery_fee} onChange={(e) => onInputChange('standard_delivery_fee', e.target.value)} className="h-11 font-bold" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-gray-800 uppercase tracking-widest ml-1">Min Order (₹)</label>
              <Input type="number" value={formData.min_standard_delivery_amount} onChange={(e) => onInputChange('min_standard_delivery_amount', e.target.value)} className="h-11 font-bold" />
            </div>
          </div>

          <div className={`space-y-1.5 transition-opacity ${!formData.standard_delivery ? 'opacity-40 pointer-events-none' : ''}`}>
            <label className="text-[12px] font-bold text-gray-800 uppercase tracking-widest ml-1">Free Standard Delivery Above (₹)</label>
            <Input 
              type="number" 
              value={formData.free_standard_delivery_above || ''} 
              onChange={(e) => onInputChange('free_standard_delivery_above', e.target.value)} 
              className="h-11 font-bold" 
              placeholder="e.g. 500"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-t pt-4">
              <label className="text-[12px] font-bold text-gray-800 uppercase tracking-widest">Time Windows ({slots.length}/4)</label>
              <div className="flex gap-2">
                <button onClick={addSlot} className="p-1.5 bg-orange-50 text-orange-600 rounded-lg"><Plus size={16} /></button>
                {isDirtySlots && (
                  <button onClick={saveSlots} disabled={isSavingSlots} className="flex items-center gap-2 px-3 py-1.5 bg-orange-600 text-white rounded-lg text-[10px] font-bold uppercase">
                    {isSavingSlots ? <Loader2 size={12} className="animate-spin" /> : <CircleCheckBig size={12} />} Save Slots
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              {slots.map((slot) => (
                <div key={slot.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl">
                  <input type="time" className="flex-1 bg-white border rounded-lg px-2 py-1.5 text-xs font-bold" value={to24h(slot.start_time)} onChange={(e) => handleSlotTimeChange(slot.id, 'start_time', e.target.value)} />
                  <span className="text-[12px] font-bold text-gray-500">TO</span>
                  <input type="time" className="flex-1 bg-white border rounded-lg px-2 py-1.5 text-xs font-bold" value={to24h(slot.end_time)} onChange={(e) => handleSlotTimeChange(slot.id, 'end_time', e.target.value)} />
                  <button onClick={() => deleteSlot(slot.id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* INSTANT DELIVERY SECTION */}
      <div className={`p-6 rounded-[2rem] border transition-all flex flex-col min-h-[520px] ${formData.instant_delivery ? 'bg-white border-gray-100 shadow-sm' : 'bg-gray-50/50 border-dashed border-gray-200'}`}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.instant_delivery ? 'bg-orange-600 text-white shadow-lg' : 'bg-gray-200 text-gray-400'}`}>
              <Zap size={20} />
            </div>
            <h2 className={`text-[14] font-extrabold tracking-regular uppercase ${formData.instant_delivery ? 'text-gray-900' : 'text-gray-400'}`}>Instant</h2>
          </div>
          <button onClick={() => onInputChange('instant_delivery', !formData.instant_delivery)} className={`w-10 h-5 rounded-full relative transition-colors ${formData.instant_delivery ? 'bg-orange-500' : 'bg-gray-300'}`}>
            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.instant_delivery ? 'left-6' : 'left-1'}`} />
          </button>
        </div>

        <div className={`space-y-5 flex-1 ${formData.instant_delivery ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-gray-800 uppercase tracking-widest ml-1">Extra Fee (₹)</label>
              <Input type="number" value={formData.instant_fee} onChange={(e) => onInputChange('instant_fee', e.target.value)} className="h-12 font-bold" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-gray-800 uppercase tracking-widest ml-1">Min. Order (₹)</label>
              <Input type="number" value={formData.min_instant_delivery_amount} onChange={(e) => onInputChange('min_instant_delivery_amount', e.target.value)} className="h-12 font-bold" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[12px] font-bold text-gray-800 uppercase tracking-widest ml-1">Free Instant Above (₹)</label>
            <Input type="number" value={formData.free_instant_delivery_above || ''} onChange={(e) => onInputChange('free_instant_delivery_above', e.target.value)} className="h-12 font-bold" placeholder="Enter amount" />
          </div>
          
          {/* Spacer to push content up and maintain height visual when slots are fewer than 4 */}
          <div className="flex-1" />
        </div>
      </div>
    </div>
  )
}