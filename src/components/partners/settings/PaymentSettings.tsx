//src/components/partners/settings/PaymentSettings.tsx
'use client'

import { useState, useEffect } from 'react'
import { Landmark, QrCode, Trash2, Plus, Loader2, CreditCard, X, Edit2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/button'
import { Input } from '@/components/input'

export default function PaymentSettings() {
  const [methods, setMethods] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  
  const [activeTab, setActiveTab] = useState<'upi' | 'bank'>('upi')
  const [formData, setFormData] = useState({
    upi_id: '',
    bank_account: '',
    ifsc_code: '',
    account_holder: ''
  })

  useEffect(() => { fetchMethods() }, [])

  const fetchMethods = async () => {
    try {
      const res = await fetch('/api/partners/profile/payments')
      const data = await res.json()
      setMethods(data || [])
    } catch (err) { 
      toast.error("Failed to load payouts") 
    } finally { 
      setLoading(false) 
    }
  }

  const hasUPI = methods.some(m => m.method === 'upi')
  const hasBank = methods.some(m => m.method === 'bank')

  const handleAddNewClick = () => {
    setFormData({ upi_id: '', bank_account: '', ifsc_code: '', account_holder: '' })
    if (hasUPI && !hasBank) setActiveTab('bank')
    else if (!hasUPI && hasBank) setActiveTab('upi')
    else setActiveTab('upi')
    setShowForm(true)
  }

  const handleEdit = (method: any) => {
    setFormData({
      upi_id: method.upi_id || '',
      bank_account: method.bank_account || '',
      ifsc_code: method.ifsc_code || '',
      account_holder: method.account_holder || ''
    })
    setActiveTab(method.method)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (activeTab === 'upi' && !formData.upi_id.includes('@')) return toast.error("Invalid UPI ID")
    if (activeTab === 'bank' && (!formData.bank_account || !formData.ifsc_code)) return toast.error("Bank details incomplete")

    setIsSaving(true)
    try {
      const res = await fetch('/api/partners/profile/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: activeTab, ...formData })
      })
      if (!res.ok) throw new Error()
      toast.success(methods.some(m => m.method === activeTab) ? "Method updated" : "Method added")
      setShowForm(false)
      setFormData({ upi_id: '', bank_account: '', ifsc_code: '', account_holder: '' })
      fetchMethods()
    } catch (err) { 
      toast.error("Failed to save method") 
    } finally { 
      setIsSaving(false) 
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/partners/profile/payments?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success("Method removed")
      fetchMethods()
    } catch (err) { 
      toast.error("Delete failed") 
    }
  }

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-orange-500" /></div>

  return (
    <section className="bg-white p-0 rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      <div className="p-6 space-y-5">
      <div className="flex items-center gap-3 border-b border-gray-100 pb-6">
        <div className="p-2 bg-orange-600 rounded-lg shadow-sm">
          <Landmark className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Payout Methods</h2>
          <p className="text-sm text-gray-500">Add bank details for withdrawing or depositing money.</p>
        </div>
      </div>
      
      <div className="space-y-3">
        {methods.map((m) => (
          <div key={m.id} className="group relative flex items-center justify-between p-4 rounded-2xl border border-gray-50 bg-gray-50/30 hover:bg-white hover:border-orange-100 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-400 group-hover:text-orange-600 transition-colors border border-gray-50">
                {m.method === 'upi' ? <QrCode size={16} /> : <CreditCard size={16} />}
              </div>
              <div>
                <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">
                  {m.method === 'upi' ? 'UPI Transfer' : 'Bank Settlement'}
                </p>
                <p className="text-sm font-bold text-gray-800 tracking-regular">
                  {m.method === 'upi' ? m.upi_id : m.bank_account}
                </p>
                {m.method === 'bank' && (
                  <p className="text-[12px] font-medium text-gray-500 mt-0.5">
                    {m.account_holder} • {m.ifsc_code}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
              <button 
                onClick={() => handleEdit(m)}
                className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
              >
                <Edit2 size={14} />
              </button>
              <button 
                onClick={() => handleDelete(m.id)} 
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}

        {!showForm && methods.length < 2 && (
          <button 
            onClick={handleAddNewClick}
            className="w-full py-4 border-2 border-dashed border-gray-100 rounded-2xl flex items-center justify-center gap-2 text-gray-400 hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50/30 transition-all group"
          >
            <Plus size={16} className="group-hover:scale-110 transition-transform" />
            <span className="text-xs font-black uppercase tracking-widest">Add {methods.length === 1 ? 'Alternative' : 'New'} Method</span>
          </button>
        )}
      </div>

      {showForm && (
        <div className="pt-4 border-t border-gray-100 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between">
             <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
              {(['upi', 'bank'] as const).map((t) => {
                const isAlreadyAdded = (t === 'upi' && hasUPI) || (t === 'bank' && hasBank);
                const isEditingThis = methods.some(m => m.method === t && m.method === activeTab);
                
                return (
                  <button
                    key={t}
                    disabled={isAlreadyAdded && activeTab !== t}
                    onClick={() => setActiveTab(t)}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all 
                      ${activeTab === t ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-400'}
                      ${isAlreadyAdded && activeTab !== t ? 'opacity-30 cursor-not-allowed' : 'hover:text-gray-600'}`}
                  >
                    {t}
                  </button>
                )
              })}
            </div>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 p-1">
              <X size={18} />
            </button>
          </div>

          <div className="space-y-4">
            {activeTab === 'upi' ? (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">UPI ID</label>
                <Input 
                  placeholder="storename@upi" 
                  value={formData.upi_id} 
                  onChange={(e) => setFormData({...formData, upi_id: e.target.value})}
                  className="rounded-xl border-gray-100 h-11 font-bold text-sm bg-gray-50/50 focus:bg-white transition-colors"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Account Holder Name</label>
                  <Input 
                    placeholder="Full Legal Name" 
                    value={formData.account_holder} 
                    onChange={(e) => setFormData({...formData, account_holder: e.target.value})}
                    className="rounded-xl border-gray-100 h-11 font-bold text-sm bg-gray-50/50 focus:bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Account Number</label>
                  <Input 
                    placeholder="0000123456" 
                    value={formData.bank_account} 
                    onChange={(e) => setFormData({...formData, bank_account: e.target.value})}
                    className="rounded-xl border-gray-100 h-11 font-bold text-sm bg-gray-50/50 focus:bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">IFSC Code</label>
                  <Input 
                    placeholder="SBIN000..." 
                    value={formData.ifsc_code} 
                    onChange={(e) => setFormData({...formData, ifsc_code: e.target.value.toUpperCase()})}
                    className="rounded-xl border-gray-100 h-11 font-bold text-sm uppercase bg-gray-50/50 focus:bg-white"
                  />
                </div>
              </div>
            )}
            
            <Button 
              disabled={isSaving} 
              onClick={handleSave} 
              className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-xl h-11 font-bold text-xs uppercase tracking-widest gap-2"
            >
              {isSaving ? <Loader2 className="animate-spin w-4 h-4" /> : <Plus size={14} />}
              {methods.some(m => m.method === activeTab) ? 'Update Details' : 'Save Payout Method'}
            </Button>
          </div>
        </div>
      )}
      </div>
    </section>
  )
}