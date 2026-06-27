//src/components/partners/PartnerNotificationsProvider.tsx
'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Bell, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/supabaseClient'
import { usePartnerProfile } from '@/components/partners/PartnerProfileProvider'
import NotificationSheet from '@/components/partners/NotificationSheet'
import {
  AppNotification,
  fetchNotifications,
  playNotificationSound,
} from '@/lib/partners/notification-utils'

interface PartnerNotificationsContextValue {
  notifications: AppNotification[]
  notificationCount: number
  showNotifications: boolean
  openNotifications: () => void
  closeNotifications: () => void
  refreshNotifications: () => Promise<void>
}

const PartnerNotificationsContext = createContext<PartnerNotificationsContextValue | null>(null)

export const usePartnerNotifications = () => {
  const context = useContext(PartnerNotificationsContext)

  if (!context) {
    throw new Error('usePartnerNotifications must be used inside PartnerNotificationsProvider')
  }

  return context
}

export default function PartnerNotificationsProvider({ children }: { children: React.ReactNode }) {
  const { profile } = usePartnerProfile()
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const pathname = usePathname()

  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [latestNotification, setLatestNotification] = useState<AppNotification | null>(null)
  const [showFloatingCard, setShowFloatingCard] = useState(false)

  const notificationCount = notifications.length

  const refreshNotifications = async () => {
    if (!profile?.id) {
      setNotifications([])
      return
    }

    try {
      const data = await fetchNotifications(profile.id)
      setNotifications(data)
    } catch (error) {
      console.error('Failed to load partner notifications:', error)
    }
  }

  const openNotifications = () => {
    setShowFloatingCard(false)

    if (pathname !== '/partners/dashboard') {
      router.push('/partners/dashboard')
    }

    setShowNotifications(true)
  }

  const closeNotifications = () => {
    setShowNotifications(false)
  }

  useEffect(() => {
    refreshNotifications()
  }, [profile?.id])

  useEffect(() => {
    if (!profile?.id) return

    const channel = supabase
      .channel(`partner-notifications-${profile.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'app_notifications',
          filter: `user_id=eq.${profile.id}`,
        },
        async (payload) => {
          const insertedNotification = payload.new as AppNotification

          playNotificationSound()

          setLatestNotification(insertedNotification)
          setShowFloatingCard(true)

          await refreshNotifications()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'app_notifications',
          filter: `user_id=eq.${profile.id}`,
        },
        async () => {
          await refreshNotifications()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [profile?.id, supabase])

  useEffect(() => {
    if (!showFloatingCard) return

    const timer = window.setTimeout(() => {
      setShowFloatingCard(false)
    }, 8000)

    return () => window.clearTimeout(timer)
  }, [showFloatingCard, latestNotification?.id])

  const value: PartnerNotificationsContextValue = {
    notifications,
    notificationCount,
    showNotifications,
    openNotifications,
    closeNotifications,
    refreshNotifications,
  }

  return (
    <PartnerNotificationsContext.Provider value={value}>
      {children}

      <AnimatePresence>
        {showFloatingCard && latestNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            className="fixed top-6 right-6 z-[9998] w-[360px] max-w-[calc(100vw-2rem)]"
          >
            <button
              onClick={openNotifications}
              className="w-full text-left bg-white border border-orange-100 rounded-[1.75rem] shadow-[0_20px_60px_-15px_rgba(255,133,0,0.45)] overflow-hidden hover:shadow-xl transition-all"
            >
              <div className="p-4 flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#FF8500] text-white flex items-center justify-center shrink-0 shadow-lg shadow-orange-100">
                  <Bell size={18} fill="currentColor" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#FF8500] mb-1">
                    New Store Alert
                  </p>
                  <h4 className="text-sm font-black text-gray-900 leading-tight line-clamp-1">
                    {latestNotification.title}
                  </h4>
                  <p className="text-xs font-medium text-gray-500 leading-snug mt-1 line-clamp-2">
                    {latestNotification.body}
                  </p>
                  <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-3">
                    Tap to view notifications
                  </p>
                </div>

                <span
                  onClick={(event) => {
                    event.stopPropagation()
                    setShowFloatingCard(false)
                  }}
                  className="p-1.5 rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <X size={14} strokeWidth={3} />
                </span>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {showNotifications && profile?.id && (
        <NotificationSheet
          notifications={notifications}
          userId={profile.id}
          onClose={closeNotifications}
          refresh={refreshNotifications}
        />
      )}
    </PartnerNotificationsContext.Provider>
  )
}