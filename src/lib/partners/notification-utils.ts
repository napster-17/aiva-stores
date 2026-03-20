//src/lib/partners/notification-utils.ts
import { createClient } from '@/lib/supabase/supabaseClient';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  created_at: string;
  is_read: boolean;
  image_url: string | null; // Added image_url
}

const supabase = createClient();

export const fetchNotifications = async (userId: string) => {
  const { data, error } = await supabase
    .from('app_notifications')
    .select('id, title, body, created_at, is_read, image_url') // Added image_url
    .eq('user_id', userId)
    .eq('role', 'partner')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as AppNotification[];
};

export const deleteAllNotifications = async (userId: string) => {
  const { error } = await supabase
    .from('app_notifications')
    .delete()
    .eq('user_id', userId)
    .eq('role', 'partner');
  if (error) throw error;
};

export const deleteSingleNotification = async (id: string) => {
  const { error } = await supabase
    .from('app_notifications')
    .delete()
    .eq('id', id);
  if (error) throw error;
};

export const playNotificationSound = () => {
  try {
    const audio = new Audio('/assets/order-alert.mp3');
    audio.play().catch(err => console.log('Audio playback failed (usually due to browser autoplay policies):', err));
    
    // Trigger vibration for mobile devices (pulse for 200ms)
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(200);
    }
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
};