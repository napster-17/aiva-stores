// File: src/app/api/partners/check-partner/route.ts: Used in auth page to check valid email id for store owners for partner dashboard.
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ isPartner: false, error: 'Email is required' }, { status: 400 })
    }

    // Initialize Supabase with Service Role Key to bypass RLS for this specific check
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // Ensure this is in your .env.local
    )

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('user_role')
      .eq('email', email)
      .single()

    if (error || data?.user_role !== 'partner') {
      return NextResponse.json({ isPartner: false })
    }

    return NextResponse.json({ isPartner: true })
  } catch (err: any) {
    return NextResponse.json({ isPartner: false, error: err.message }, { status: 500 })
  }
}