// File: src/components/partners/PartnerProfileProvider.tsx
'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/supabaseClient'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner';

interface PartnerProfile {
  id: string; store_name: string; logo_url?: string; banner_url?: string;
  gstin?: string; is_gst_verified?: boolean; upi_id?: string; address?: string;
  support_phone?: string; open_time?: string; close_time?: string;
  is_setup: boolean; is_online: boolean; instant_delivery: boolean; standard_delivery: boolean; 
  standard_delivery_fee: number; min_standard_delivery_amount: number; free_standard_delivery_above?: number;
  instant_fee: number; min_instant_delivery_amount: number; free_instant_delivery_above?: number; 
  delivery_radius?: number; max_delivery_agents: number;
}

interface PartnerContextType {
  profile: PartnerProfile | null
  loading: boolean
  refreshProfile: () => Promise<void>
}

const PartnerContext = createContext<PartnerContextType>({
  profile: null,
  loading: true,
  refreshProfile: async () => {},
})

export const PartnerProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const [profile, setProfile] = useState<PartnerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  const fetchProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('store_profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (!error && data) {
      // Run auto-offline check if store is currently online
      if (data.is_online) {
        const { checkStoreEligibility } = await import('@/lib/partners/utils')
        const { isValid } = await checkStoreEligibility(data)
        if (!isValid) {
          await supabase.from('store_profiles').update({ is_online: false }).eq('id', data.id)
          data.is_online = false // Update local object before setting state
          toast.error("Store set to offline: Requirements not met or operating hours ended.")
        }
      }
      setProfile(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchProfile()

    // 1. Auth Listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setProfile(null)
        router.push('/partners/auth')
      } else if (session) {
        fetchProfile()
      }
    })

    // 2. Real-time Profile Listener
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'store_profiles' },
        (payload) => {
          // Update state immediately if the ID matches
          setProfile((current) => {
            if (current && payload.new.id === current.id) {
              return { ...current, ...payload.new as PartnerProfile };
            }
            return current;
          });
        }
      )
      .subscribe()

    return () => {
      authListener.subscription.unsubscribe()
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <PartnerContext.Provider value={{ profile, loading, refreshProfile: fetchProfile }}>
      {children}
    </PartnerContext.Provider>
  )
}

export const usePartnerProfile = () => useContext(PartnerContext)