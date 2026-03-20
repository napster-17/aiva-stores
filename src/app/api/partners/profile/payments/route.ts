//src/app/api/partners/profile/payments/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('store_id', session.user.id)

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

    const body = await req.json()
    const { method, upi_id, bank_account, ifsc_code, account_holder } = body

    const { data, error } = await supabase
      .from('payment_methods')
      .upsert({
        store_id: session.user.id,
        method,
        upi_id: method === 'upi' ? upi_id : null,
        bank_account: method === 'bank' ? bank_account : null,
        ifsc_code: method === 'bank' ? ifsc_code : null,
        account_holder: method === 'bank' ? account_holder : null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'store_id,method' })
      .select()

    if (error) throw error
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!session || !id) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

    const { error } = await supabase
      .from('payment_methods')
      .delete()
      .eq('id', id)
      .eq('store_id', session.user.id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}