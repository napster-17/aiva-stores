//src/app/api/partners/delivery-slots/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from('delivery_slots')
      .select('*')
      .eq('store_id', session.user.id)
      .order('start_time', { ascending: true })

    if (error) throw error
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { action, slot, slotId } = await req.json()

    if (action === 'delete') {
      const { error } = await supabase
        .from('delivery_slots')
        .delete()
        .eq('id', slotId)
        .eq('store_id', session.user.id) // Security: Ensure they own the slot

      if (error) throw error
      return NextResponse.json({ success: true })
    }

    // Upsert logic for saving/updating slots
    const { data, error } = await supabase
      .from('delivery_slots')
      .upsert({
        ...(slot.id.toString().startsWith('temp-') ? {} : { id: slot.id }),
        store_id: session.user.id,
        start_time: slot.start_time,
        end_time: slot.end_time,
        is_active: true
      })
      .select()

    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}