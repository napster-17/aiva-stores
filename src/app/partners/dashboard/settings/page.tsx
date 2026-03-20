//src/app/partners/dashboard/settings/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Store, Clock, Phone, MapPin, CircleCheckBig, Loader2, Copy,
  Image as ImageIcon, Navigation, Globe, Edit2, LocateFixed, Layers, Crosshair, Info } from 'lucide-react'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { checkStoreEligibility } from '@/lib/partners/utils'
import { uploadStoreBanner } from '@/lib/partners/storage'
import { usePartnerProfile } from '@/components/partners/PartnerProfileProvider'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import RequirementsModal from '@/components/partners/settings/RequirementsModal'
import GoOnlineConfirmationModal from '@/components/partners/settings/GoOnlineConfirmationModal'
import DeliverySettings from '@/components/partners/settings/DeliverySettings'
import PersonalSettings from '@/components/partners/settings/PersonalSettings'
import PaymentSettings from '@/components/partners/settings/PaymentSettings'

const MapPreview = dynamic(() => import('@/components/partners/settings/MapPreview'), {  
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-gray-100 animate-pulse flex items-center justify-center text-gray-400 rounded-[2rem]">Loading Map...</div>
});

export default function StoreSettings() {
  const { profile, refreshProfile } = usePartnerProfile()
  const [formData, setFormData] = useState<any>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard')
  const [isFetchingLocation, setIsFetchingLocation] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [failedChecks, setFailedChecks] = useState<any>(null)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)

  const handleSearchLocation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`)
      const data = await res.json()
      if (data && data.length > 0) {
        handleInputChange('latitude', data[0].lat)
        handleInputChange('longitude', data[0].lon)
        toast.success("Location found!")
      } else {
        toast.error("Location not found")
      }
    } catch (err) {
      toast.error("Search failed")
    } finally {
      setIsSearching(false)
    }
  }

  useEffect(() => {
    if (profile) {
      setFormData({ ...profile })
    }
  }, [profile])

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
    setIsDirty(true)
  }

  const fetchCurrentLocation = () => {
    if (!navigator.geolocation) {
      return toast.error("Geolocation is not supported by your browser")
    }

    setIsFetchingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        handleInputChange('latitude', position.coords.latitude.toString())
        handleInputChange('longitude', position.coords.longitude.toString())
        setIsFetchingLocation(false)
        toast.success("Location updated to your current position")
      },
      (error) => {
        setIsFetchingLocation(false)
        toast.error("Permission denied. Please enable location access.")
      }
    )
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Store ID copied")
  }

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Banner: Max 5Mb file
    if (file.size > 5 * 1024 * 1024) return toast.error("File size must be less than 5MB")

    setIsUploading(true)
    const supabase = createClientComponentClient()

    try {
      const publicUrl = await uploadStoreBanner(
        supabase,
        file,
        formData.id,
        formData.banner_url
      )
      
      handleInputChange('banner_url', publicUrl)
      toast.success("Banner uploaded! Remember to save changes.")
    } catch (error) {
      toast.error("Failed to upload image")
    } finally {
      setIsUploading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.store_name) return toast.error("Store name is required")
    if (formData.support_phone?.length !== 10) return toast.error("Phone must be 10 digits")

    setIsSaving(true)
    try {
      const res = await fetch('/api/partners/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error()
      
      await refreshProfile()
      setIsDirty(false) // Explicitly clear dirty state here
      toast.success("Settings updated successfully")
    } catch (err) {
      toast.error("Failed to update settings")
    } finally {
      setIsSaving(false)
    }
  }
  
  if (!formData) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-orange-500" /></div>

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-8 pb-20"
    >
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 px-2">
        <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Store Settings</h1>
            <p className="text-gray-500 font-medium">Manage your digital storefront and delivery parameters.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="flex items-center p-1.5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-orange-200 transition-all group">
                <div className={`px-4 py-1.5 rounded-xl transition-all duration-300 flex items-center gap-2 ${
                  formData.is_online 
                    ? 'bg-red-50 text-red-600' 
                    : 'bg-emerald-50 text-emerald-600'
                }`}>
                  <div className="relative group/tooltip">
                    <Info size={14} className="cursor-help opacity-60 hover:opacity-100 transition-opacity" />
                    <div className="absolute top-full mt-2 left-0 w-64 p-3 bg-gray-900 text-white text-[10px] font-medium leading-relaxed rounded-[8] opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all shadow-xl z-50">
                      <p>This controls your store's visibility on the customer app for online orders. Ensure the <b>Aiva Partners Android App</b> is active on your Android device.</p>
                      <div className="absolute bottom-full left-2 border-8 border-transparent border-b-gray-900" />
                    </div>
                  </div>

                  <span className="text-[12px] font-bold uppercase tracking-loose whitespace-nowrap">
                    {formData.is_online ? "Take Store Offline" : "Take Store Online"}
                  </span>
                </div>

                {/* Toggle*/}
                <div className={`flex items-center gap-3 pl-3 pr-2 py-1 ml-1 border-l border-gray-50`}>
                  <span className={`text-[12px] font-bold uppercase tracking-loose ${formData.is_online ? 'text-emerald-500' : 'text-gray-400'}`}>
                    {formData.is_online ? "Live" : "Offline"}
                  </span>
                  <button 
                    onClick={async () => {
                        const nextState = !formData.is_online;
                        if (nextState === true) {
                            const { isValid, checks } = await checkStoreEligibility(formData);
                            if (!isValid) {
                                setFailedChecks(checks);
                                setIsModalOpen(true);
                                return;
                            }
                            // If eligibility passes, show the "Are you sure" modal instead of going online immediately
                            setIsConfirmModalOpen(true);
                        } else {
                            // If going offline, do it immediately
                            handleInputChange('is_online', false);
                        }
                    }}
                    className={`w-12 h-6 rounded-full transition-all relative ${formData.is_online ? 'bg-emerald-500 shadow-lg shadow-emerald-100' : 'bg-gray-200'}`}
                  >
                    <motion.div 
                      animate={{ x: formData.is_online ? 24 : 4 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm" 
                    />
                  </button>
                </div>
              </div>
            </div>
        </div>
      </header>

      {/* Banner*/}
      <section className="relative aspect-[21/7] rounded-[2.5rem] bg-gray-900 overflow-hidden border-4 border-white shadow-2xl group">
        {formData.banner_url ? (
          <>
            <img src={formData.banner_url} alt="Banner" className="w-full h-full object-cover opacity-70 transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 bg-gray-100">
            <ImageIcon size={48} className="opacity-20" />
          </div>
        )}
        
        <div className="absolute bottom-10 left-10 right-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="text-white flex-1 w-full max-w-xl">
            <div className="flex items-center gap-2 text-white/50 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">
                <Edit2 size={12} /> Click to edit store name
            </div>
            <input 
                value={formData.store_name}
                onChange={(e) => handleInputChange('store_name', e.target.value)}
                className="bg-transparent border-none text-4xl md:text-6xl font-black p-0 focus:ring-0 text-white placeholder:text-white/20 w-full outline-none"
                placeholder="Store Name"
            />
            <div 
              onClick={() => copyToClipboard(formData.id)}
              className="flex items-center gap-2 text-white/40 text-xs font-mono mt-3 cursor-pointer hover:text-white transition-colors w-fit"
            >
              ID: {formData.id}
              <Copy size={12} />
            </div>
          </div>
          
          <div className="relative">
            <input 
              type="file" 
              id="banner-upload" 
              className="hidden" 
              accept="image/*"
              onChange={handleBannerUpload}
              disabled={isUploading}
            />
            <button 
              onClick={() => document.getElementById('banner-upload')?.click()}
              disabled={isUploading}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/20 transition-all group/btn disabled:opacity-50"
            >
                <div className="flex items-center gap-3">
                  {isUploading ? (
                    <Loader2 className="text-white animate-spin" size={20} />
                  ) : (
                    <ImageIcon className="text-white group-hover/btn:scale-110 transition-transform" size={20} />
                  )}
                  <span className="text-white text-sm font-bold">
                    {isUploading ? 'Uploading...' : 'Update Banner'}
                  </span>
                </div>
            </button>
          </div>
        </div>
      </section>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PersonalSettings />
        <PaymentSettings />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* General & Hours Column */}
        <div className="lg:col-span-4 space-y-6 flex flex-col">
            <section className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-5 flex-1">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                        <Store size={18} />
                    </div>
                    <h2 className="text-lg font-black text-gray-900 tracking-tight">General Info</h2>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">GSTIN Number</label>
                        <Input 
                            value={formData.gstin || ''} 
                            onChange={(e) => handleInputChange('gstin', e.target.value)}
                            placeholder="Add GSTIN"
                            className="rounded-xl border-gray-100 h-12 uppercase font-bold text-gray-700 focus:ring-orange-500/10"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Support Hotline</label>
                        <div className="relative">
                            <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <Input 
                                type="text"
                                maxLength={10}
                                value={formData.support_phone || ''} 
                                onChange={(e) => handleInputChange('support_phone', e.target.value.replace(/\D/g, ''))}
                                className="rounded-xl border-gray-100 h-12 pl-11 font-bold text-gray-700"
                                placeholder="Phone number"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Operating Hours */}
            <section className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                        <Clock size={18} />
                    </div>
                    <h2 className="text-lg font-black text-gray-900 tracking-tight">Store Timing</h2>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Opens</label>
                        <input 
                            type="time" 
                            value={formData.open_time || ''} 
                            onChange={(e) => handleInputChange('open_time', e.target.value)}
                            className="w-full rounded-xl border border-gray-100 h-12 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/10 font-bold text-gray-700 text-sm"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Closes</label>
                        <input 
                            type="time" 
                            value={formData.close_time || ''} 
                            onChange={(e) => handleInputChange('close_time', e.target.value)}
                            className="w-full rounded-xl border border-gray-100 h-12 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/10 font-bold text-gray-700 text-sm"
                        />
                    </div>
                </div>
            </section>
        </div>

        {/* Delivery Config Column */}
        <div className="lg:col-span-8">
          <DeliverySettings 
            formData={formData} 
            onInputChange={handleInputChange} 
          />
        </div>
      </div>

      {/* Logistics & Coverage*/}
      <section className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-10 border-b border-gray-50 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
            <div className="flex items-center gap-5">
                    <div className="w-15 h-15 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                        <Navigation size={28} />
                    </div>
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Location & Delivery Radius</h2>
                    <p className="text-gray-500 font-medium">Manage your store's address, location coordinates, and delivery radius.</p>
                </div>
            </div>

            <div className="flex items-center gap-8 bg-gray-50 p-6 rounded-[2rem] border border-gray-100 flex-1 max-w-2xl">
                <div className="text-center min-w-[120px]">
                    <p className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">Coverage Radius</p>
                    <div className="flex items-baseline gap-1 justify-center">
                        <span className="text-4xl font-black text-gray-900">{(formData.delivery_radius / 1000 || 1.5).toFixed(1)}</span>
                        <span className="text-sm font-bold text-orange-600 uppercase">KM</span>
                    </div>
                </div>
                <div className="flex-1">
                    <input
                        type="range"
                        min="100"
                        max="3000"
                        step="100"
                        value={formData.delivery_radius || 1500}
                        onChange={(e) => handleInputChange('delivery_radius', parseInt(e.target.value))}
                        className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                    />
                    <div className="flex justify-between mt-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <span>0.1 km</span>
                        <span>2.5 km</span>
                        <span>3.0 km</span>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5">
            <div className="lg:col-span-2 p-10 bg-gray-50/30 border-r border-gray-50 space-y-8">
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                        <MapPin size={14} className="text-orange-500" /> Physical Store Address
                    </label>
                    <textarea 
                        value={formData.address || ''} 
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="Enter complete store address..."
                        className="w-full rounded-2xl border-gray-200 border bg-white p-4 h-32 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none font-medium text-gray-700 shadow-sm"
                    />
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                        <Globe size={14} className="text-blue-500" /> Precise Coordinates
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <span className="text-[9px] text-gray-400 font-bold ml-1 uppercase">Latitude</span>
                            <Input 
                                placeholder="0.0000" 
                                type="number"
                                value={formData.latitude || ''}
                                onChange={(e) => handleInputChange('latitude', e.target.value)}
                                className="rounded-xl border-gray-200 h-12 font-mono"
                            />
                        </div>
                        <div className="space-y-1">
                            <span className="text-[9px] text-gray-400 font-bold ml-1 uppercase">Longitude</span>
                            <Input 
                                placeholder="0.0000" 
                                type="number"
                                value={formData.longitude || ''}
                                onChange={(e) => handleInputChange('longitude', e.target.value)}
                                className="rounded-xl border-gray-200 h-12 font-mono"
                            />
                        </div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
                            <b>Pro Tip:</b> Right-click your store location on Google Maps to copy the exact coordinates for higher delivery accuracy.
                        </p>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-3 h-[500px] relative group">
                <form 
                  onSubmit={handleSearchLocation}
                  className="absolute top-6 left-1/2 -translate-x-1/2 z-[10] flex gap-2 w-full max-w-[280px] md:max-w-xs"
                >
                <div className="relative flex-1">
                    <Input 
                    placeholder="Search for a place..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white/90 backdrop-blur-md border-white/20 shadow-xl rounded-xl h-11 pl-4 pr-10"
                    />
                    <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-600">
                    {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Crosshair size={16} />}
                    </button>
                </div>
                </form>
              <div className="absolute top-4 right-4 z-[10] flex flex-col gap-2">
                <button 
                  onClick={() => setMapType(prev => prev === 'standard' ? 'satellite' : 'standard')}
                  className="bg-white p-3 rounded-xl shadow-lg border border-gray-100 hover:bg-gray-50 transition-all group/btn"
                  title="Toggle Satellite View"
                >
                  <Layers size={20} className={mapType === 'satellite' ? 'text-orange-600' : 'text-gray-600'} />
                </button>
                <button 
                  onClick={fetchCurrentLocation}
                  disabled={isFetchingLocation}
                  className="bg-white p-3 rounded-xl shadow-lg border border-gray-100 hover:bg-gray-50 transition-all disabled:opacity-50"
                  title="Fetch Current Location"
                >
                  {isFetchingLocation ? (
                    <Loader2 size={20} className="animate-spin text-orange-600" />
                  ) : (
                    <LocateFixed size={20} className="text-gray-600" />
                  )}
                </button>
              </div>

              {formData.latitude && formData.longitude && !isNaN(parseFloat(formData.latitude)) && !isNaN(parseFloat(formData.longitude)) ? (
                  <MapPreview 
                    lat={parseFloat(formData.latitude)}
                    lng={parseFloat(formData.longitude)}
                    radius={Number(formData.delivery_radius) || 1500}
                    height={500}
                    mapType={mapType}
                    onLocationChange={(lat, lng) => {
                        handleInputChange('latitude', lat.toFixed(6))
                        handleInputChange('longitude', lng.toFixed(6))
                    }}
                  />
              ) : (
                  <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center text-gray-400 space-y-4">
                      <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center animate-pulse">
                          <MapPin size={40} className="opacity-20" />
                      </div>
                      <p className="text-sm font-bold uppercase tracking-widest px-10 text-center">
                        Enter coordinates or click the locate icon to preview map
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={fetchCurrentLocation}
                        className="rounded-full bg-white border-gray-200 gap-2"
                      >
                        <LocateFixed size={16} /> Use My Location
                      </Button>
                  </div>
              )}
            </div>
        </div>
      </section>
      <RequirementsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        checks={failedChecks} 
      />
      <GoOnlineConfirmationModal 
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={() => {
          handleInputChange('is_online', true);
          setIsConfirmModalOpen(false);
          toast.success("Store is now live! Stay alert for orders.");
        }}
      />
      {/* Floating Save*/}
      {isDirty && (
        <motion.div 
          initial={{ y: 50, opacity: 0, x: '-50%' }}
          animate={{ y: 0, opacity: 1, x: '-50%' }}
          exit={{ y: 50, opacity: 0, x: '-50%' }}
          className="fixed bottom-10 left-1/2 z-[100] whitespace-nowrap"
        >
          <div className="bg-white/70 backdrop-blur-2xl px-3 py-3 rounded-[1.5rem] border-4 border-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center gap-6 ring-1 ring-orange-100">
            <div className="flex items-center gap-3 pl-4">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-gray-900 font-black text-sm tracking-tight">
                Unsaved Changes
              </span>
            </div>

            <Button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 h-12 rounded-[1.0rem] shadow-lg shadow-orange-200 gap-2 transition-all hover:scale-105 active:scale-95"
            >
              {isSaving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <div className="bg-white/20 p-1 rounded-lg">
                  <CircleCheckBig className="w-4 h-4" />
                </div>
              )}
              <span className="font-bold tracking-tight">Save All Changes</span>
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}