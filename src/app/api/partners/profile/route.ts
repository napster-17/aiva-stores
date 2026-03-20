//src/app/api/partners/profile/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from('store_profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    
    // NEW: Gatekeeper Logic for Standard Delivery
    let finalStandardDelivery = body.standard_delivery;
    if (finalStandardDelivery === true) {
      const { count } = await supabase
        .from('delivery_slots')
        .select('*', { count: 'exact', head: true })
        .eq('store_id', session.user.id);
      
      if (!count || count === 0) {
        finalStandardDelivery = false;
      }
    }

    // Update whitelisted fields
    const allowedUpdates = {
      store_name: body.store_name,
      gstin: body.gstin,
      address: body.address,
      support_phone: body.support_phone,
      open_time: body.open_time,
      close_time: body.close_time,
      is_online: body.is_online,
      banner_url: body.banner_url,
      latitude: body.latitude ? Number(body.latitude) : null,
      longitude: body.longitude ? Number(body.longitude) : null,
      delivery_radius: body.delivery_radius ? Math.round(Number(body.delivery_radius)) : null,
      instant_delivery: body.instant_delivery,
      instant_fee: Number(body.instant_fee),
      standard_delivery: finalStandardDelivery, // Use the gated value
      standard_delivery_fee: Number(body.standard_delivery_fee),
      min_standard_delivery_amount: Number(body.min_standard_delivery_amount),
      min_instant_delivery_amount: Number(body.min_instant_delivery_amount),
      free_standard_delivery_above: body.free_standard_delivery_above ? Number(body.free_standard_delivery_above) : null,
      free_instant_delivery_above: body.free_instant_delivery_above ? Number(body.free_instant_delivery_above) : null,
    }

    const { data, error } = await supabase
      .from('store_profiles')
      .update(allowedUpdates)
      .eq('id', session.user.id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}