//src/lib/partners/utils.ts: Used on partners/settings/page.tsx for checking the conditions for taking store online
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export async function checkStoreEligibility(profile: any) {
  const supabase = createClientComponentClient()
  const checks = {
    isOnline: profile.is_online,
    hasProducts: false,
    hasSlots: false,
    isWithinHours: false,
    isNotFlagged: profile.flag_status !== 'flagged',
    isInternetConnected: typeof window !== 'undefined' ? window.navigator.onLine : true
  }

  // 1. Check Product Count (Min 10 with stock > 0)
  const { count: productCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('store_id', profile.id)
    .gt('stock_quantity', 0) // Fixed: Changed from is_available to stock_quantity
  
  checks.hasProducts = (productCount || 0) >= 10

  // 2. Check Delivery Methods
  const { data: slots } = await supabase
    .from('delivery_slots')
    .select('id')
    .eq('store_id', profile.id)
    .eq('is_active', true)

  // Check if at least one delivery method is fully configured and enabled
  const isStandardValid = profile.standard_delivery && (slots && slots.length > 0);
  const isInstantValid = profile.instant_delivery; // Assuming min_amount 0 is allowed, otherwise add: && profile.min_instant_delivery_amount >= 0
  
  checks.hasSlots = isStandardValid || isInstantValid;

  // 3. Check Operating Hours
  if (profile.open_time && profile.close_time) {
    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    
    const [openH, openM] = profile.open_time.split(':').map(Number)
    const [closeH, closeM] = profile.close_time.split(':').map(Number)
    
    const openMinutes = openH * 60 + openM
    const closeMinutes = closeH * 60 + closeM
    
    checks.isWithinHours = currentTime >= openMinutes && currentTime <= closeMinutes
  }

  return {
    isValid: checks.hasProducts && checks.hasSlots && checks.isWithinHours && checks.isInternetConnected && checks.isNotFlagged,
    checks
  }
}