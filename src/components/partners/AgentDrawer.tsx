//src/components/partners/AgentDrawer.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { X, User, Lock, Phone, Save, Loader2, Check, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/button'
import { createAgent, updateAgent, Agent, checkUsernameAvailability } from '@/lib/partners/agent-utils'

interface AgentDrawerProps {
  isOpen: boolean
  onClose: () => void
  agent?: Agent
  onSuccess: () => void
  storeId: string
}

export function AgentDrawer({ isOpen, onClose, agent, onSuccess, storeId }: AgentDrawerProps) {
  const [loading, setLoading] = useState(false)
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    phone_number: '',
    password: ''
  })

  useEffect(() => {
    if (isOpen) {
      if (agent) {
        setFormData({
          full_name: agent.full_name,
          username: agent.username,
          phone_number: agent.phone_number || '',
          password: ''
        })
        setUsernameStatus('idle')
      } else {
        setFormData({ full_name: '', username: '', phone_number: '', password: '' })
        setUsernameStatus('idle')
      }
    }
  }, [agent, isOpen])

  // Real-time username check
  useEffect(() => {
    if (!formData.username || formData.username.length < 3 || (agent && formData.username === agent.username)) {
      setUsernameStatus('idle')
      return
    }

    const timer = setTimeout(async () => {
      setUsernameStatus('checking')
      try {
        const isAvailable = await checkUsernameAvailability(formData.username)
        setUsernameStatus(isAvailable ? 'available' : 'taken')
      } catch (err) {
        setUsernameStatus('idle')
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [formData.username])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!storeId) return

    // 1. Mandatory Fields Check
    if (!formData.full_name || !formData.username) {
      toast.error('Name and Username are mandatory')
      return
    }

    // 2. Username Availability Check
    if (usernameStatus === 'taken') {
      toast.error('This username is already taken')
      return
    }

    // 3. Password Validation
    if (!agent && (!formData.password || formData.password.length < 6)) {
      toast.error('Password must be at least 6 characters')
      return
    }
    if (agent && formData.password && formData.password.length < 6) {
      toast.error('New password must be at least 6 characters')
      return
    }

    try {
      setLoading(true)
      if (agent) {
        await updateAgent({
          agent_id: agent.id,
          store_id: storeId,
          full_name: formData.full_name.trim(),
          username: formData.username.trim(),
          phone_number: formData.phone_number.trim() || null,
          password: formData.password || undefined 
        })
        toast.success('Agent updated successfully')
      } else {
        await createAgent({
          store_id: storeId,
          full_name: formData.full_name.trim(),
          username: formData.username.trim(),
          phone_number: formData.phone_number.trim() || null,
          password: formData.password,
          is_free_slot: false 
        })
        toast.success('Agent created successfully')
      }
      onSuccess()
      onClose()
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-xl font-black text-gray-800 uppercase tracking-tighter">
              {agent ? 'Edit Agent' : 'New Delivery Agent'}
            </h2>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
              {agent ? `Modifying ${agent.username}` : 'Set login credentials'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-gray-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Full Name */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                required
                className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl py-4 pl-12 pr-4 font-bold text-gray-800 focus:bg-white focus:border-[#FF8500] transition-all outline-none"
                placeholder="John Doe"
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              />
            </div>
          </div>

          {/* Username */}
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Login Username</label>
              
              {/* Live Status Indicators */}
              <div className="flex items-center gap-1.5">
                {usernameStatus === 'checking' && (
                  <span className="text-[12px] font-semibold text-orange-500 uppercase flex items-center gap-1">
                    <Loader2 size={10} className="animate-spin" /> Checking...
                  </span>
                )}
                {usernameStatus === 'available' && (
                  <span className="text-[12px] font-semibold font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100 uppercase flex items-center gap-1">
                    <Check size={10} strokeWidth={3} /> Available
                  </span>
                )}
                {usernameStatus === 'taken' && (
                  <span className="text-[12px] font-semibold font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100 uppercase flex items-center gap-1">
                    <AlertCircle size={10} strokeWidth={3} /> Taken
                  </span>
                )}
              </div>
            </div>

            <div className="relative">
              <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-black transition-colors ${usernameStatus === 'taken' ? 'text-red-400' : 'text-gray-400'}`}>@</span>
              <input
                required
                className={`w-full bg-gray-50 border-2 rounded-2xl py-4 pl-10 pr-4 font-bold transition-all outline-none ${
                  usernameStatus === 'taken' 
                    ? 'border-red-200 text-red-900 focus:bg-red-50/30' 
                    : usernameStatus === 'available'
                    ? 'border-green-100 focus:border-[#FF8500] focus:bg-white text-gray-800'
                    : 'border-gray-50 focus:border-[#FF8500] focus:bg-white text-gray-800'
                }`}
                placeholder="username"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value.toLowerCase().replace(/\s/g, '')})}
              />
            </div>
            {usernameStatus === 'taken' && (
              <p className="text-[12px] font-semibold text-red-500 ml-1 animate-in fade-in slide-in-from-top-1">
                This username is taken. Try something different.
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl py-4 pl-12 pr-4 font-bold text-gray-800 focus:bg-white focus:border-[#FF8500] transition-all outline-none"
                placeholder="9876543210"
                value={formData.phone_number}
                onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
              {agent ? 'Change Password (Min 6 chars)' : 'Login Password (Min 6 chars)'}
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                required={!agent}
                minLength={6}
                className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl py-4 pl-12 pr-4 font-bold text-gray-800 focus:bg-white focus:border-[#FF8500] transition-all outline-none"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-gray-100 bg-gray-50/50">
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || usernameStatus === 'checking' || usernameStatus === 'taken'}
            className="w-full bg-[#FF8500] hover:bg-[#e67700] text-white font-black py-7 rounded-2xl shadow-lg shadow-orange-100 gap-2 active:scale-[0.98] transition-all"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            {agent ? 'Update Agent' : 'Create Agent Account'}
          </Button>
        </div>
      </div>
    </div>
  )
}