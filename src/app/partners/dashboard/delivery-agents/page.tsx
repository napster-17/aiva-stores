//src/app/partners/dashboard/delivery-agents/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { Users, UserPlus, ShieldCheck, Phone, Clock, Trash2, Edit3, AlertCircle, Bike } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/button'
import { TableSkeleton } from '@/components/partners/TableSkeleton'
import { usePartnerProfile } from '@/components/partners/PartnerProfileProvider'
import { fetchAgents, Agent, deleteAgent } from '@/lib/partners/agent-utils'
import { AgentDrawer } from '@/components/partners/AgentDrawer'

export default function DeliveryAgentsPage() {
  const [loading, setLoading] = useState(true)
  const [agents, setAgents] = useState<Agent[]>([])
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<Agent | undefined>(undefined)
  const { profile } = usePartnerProfile()

  const loadAgents = async () => {
    if (!profile?.id) return
    try {
      setLoading(true)
      const data = await fetchAgents(profile.id)
      setAgents(data)
    } catch (err: any) {
      toast.error('Failed to load agents: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAgents()
  }, [profile?.id])

  const handleDelete = async (agent: Agent) => {
    if (!confirm(`Are you sure you want to remove ${agent.full_name}?`)) return
    
    try {
      await deleteAgent(agent.id, profile!.id)
      toast.success('Agent removed successfully')
      loadAgents()
    } catch (err: any) {
      toast.error('Failed to remove agent')
    }
  }

  const capacityReached = agents.length >= (profile?.max_delivery_agents || 4)

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-regular">Delivery Team</h1>
          <p className="text-sm text-gray-500 font-medium">Manage your delivery staff and login credentials</p>
        </div>
        
        <Button 
          disabled={capacityReached}
          onClick={() => {
            setSelectedAgent(undefined)
            setIsDrawerOpen(true)
          }}
          className="bg-[#FF8500] hover:bg-[#e67700] text-white font-black px-6 py-6 rounded-2xl shadow-lg shadow-orange-100 transition-all active:scale-95 gap-2"
        >
          <UserPlus size={20} />
          {capacityReached ? 'Limit Reached' : 'Add New Agent'}
        </Button>
      </div>

      {/* Capacity Alert */}
      <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex items-center gap-3">
        <div className="p-2 bg-white rounded-lg text-orange-500 shadow-sm">
          <ShieldCheck size={20} />
        </div>
        <div>
          <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest leading-none">Fleet Capacity</p>
          <p className="text-sm font-black text-orange-700">
            {agents.length} of {profile?.max_delivery_agents || 4} slots filled
          </p>
        </div>
      </div>

      {/* Agents Grid/Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50">
              <tr className="border-b border-gray-50">
                <th className="p-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Agent Details</th>
                <th className="p-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Username</th>
                <th className="p-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Added On</th>
                <th className="p-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <TableSkeleton rows={4} columns={4} />
              ) : agents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-20 text-center">
                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Bike className="text-gray-300" size={32}/>
                    </div>
                    <p className="text-gray-500 font-medium tracking-tight">No delivery agents found.</p>
                  </td>
                </tr>
              ) : agents.map((agent) => (
                <tr key={agent.id} className="hover:bg-orange-50/10 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-orange-100 flex items-center justify-center text-[#FF8500] font-black text-lg border-2 border-white shadow-sm">
                        {agent.full_name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-black text-gray-800 text-lg leading-none mb-1">{agent.full_name}</div>
                        <div className="flex items-center gap-2 text-gray-400 font-bold text-[11px] uppercase tracking-wider">
                          <Phone size={12} /> {agent.phone_number || 'No Phone'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg font-black text-xs">
                      {agent.username}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs font-bold">
                      <Clock size={14} />
                      {new Date(agent.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => {
                          setSelectedAgent(agent)
                          setIsDrawerOpen(true)
                        }}
                        className="p-2 text-gray-400 hover:text-[#FF8500] hover:bg-orange-50 rounded-xl transition-all"
                        title="Edit Agent"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(agent)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Remove Agent"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <AgentDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        agent={selectedAgent}
        onSuccess={loadAgents}
        storeId={profile?.id || ''}
      />
    </div>
  )
}