//src/components/partners/settings/PersonalSettings.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/card'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { User, UserCheck, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function PersonalSettings() {
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    gender: '',
    birthday: ''
  })

  useEffect(() => {
    fetchPersonalData()
  }, [])

  const fetchPersonalData = async () => {
    try {
      const res = await fetch('/api/partners/profile/personal')
      const data = await res.json()
      if (res.ok) {
        setFormData({
          full_name: data.full_name || '',
          email: data.email || '',
          gender: data.gender || '',
          birthday: data.birthday || ''
        })
      }
    } catch (error) {
      console.error("Error fetching personal profile:", error)
    } finally {
      setFetching(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/partners/profile/personal', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.full_name,
          gender: formData.gender,
          birthday: formData.birthday
        })
      })

      if (!res.ok) throw new Error("Failed to update personal details")
      toast.success("Personal details updated")
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-orange-500" /></div>

  return (
    <Card className="w-full border-gray-200 shadow-sm overflow-hidden">
      <CardHeader className="border-b border-gray-100 bg-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-600 rounded-lg shadow-sm">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">Personal Information</CardTitle>
              <p className="text-sm text-gray-500">Store owners' personal details</p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={loading} className="bg-orange-600 hover:bg-orange-500 text-white">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserCheck className="w-4 h-4 mr-2" />}
            Update Profile
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase">Full Name</label>
            <Input 
              value={formData.full_name} 
              onChange={(e) => setFormData({...formData, full_name: e.target.value})} 
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase">Email Address (Non-editable)</label>
            <Input 
              value={formData.email} 
              disabled 
              className="bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase">Gender</label>
            <select 
              value={formData.gender} 
              onChange={(e) => setFormData({...formData, gender: e.target.value})}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase">Birthday</label>
            <Input 
              type="date" 
              value={formData.birthday} 
              onChange={(e) => setFormData({...formData, birthday: e.target.value})} 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}