//src/lib/partners/notification-utils.ts
import { createClient } from '@/lib/supabase/supabaseClient'

export interface AppNotification {
  id: string
  user_id?: string
  role?: 'customer' | 'partner'
  title: string
  body: string
  type?: string | null
  metadata?: Record<string, any> | null
  is_read: boolean
  created_at: string
  image_url: string | null
  source?: string | null
  icon?: string | null
  push_sent?: boolean
}

const supabase = createClient()

export const fetchNotifications = async (userId: string): Promise<AppNotification[]> => {
  const { data, error } = await supabase
    .from('app_notifications')
    .select('id, user_id, role, title, body, type, metadata, is_read, created_at, image_url, source, icon, push_sent')
    .eq('user_id', userId)
    .eq('role', 'partner')
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data || []) as AppNotification[]
}

export const deleteAllNotifications = async (userId: string) => {
  const { error } = await supabase
    .from('app_notifications')
    .delete()
    .eq('user_id', userId)
    .eq('role', 'partner')

  if (error) throw error
}

export const deleteSingleNotification = async (id: string) => {
  const { error } = await supabase
    .from('app_notifications')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export const playNotificationSound = () => {
  if (typeof window === 'undefined') return

  try {
    const audio = new Audio('/assets/order-alert.mp3')
    audio.volume = 1

    audio.play().catch((err) => {
      console.log('Audio playback failed. Browser may require one user interaction before allowing sound:', err)
    })

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([200, 100, 200])
    }
  } catch (error) {
    console.error('Error playing notification sound:', error)
  }
}