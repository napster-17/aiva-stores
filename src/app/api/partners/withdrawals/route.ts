// src/app/api/partners/withdrawals/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { amount, paymentMethods } = await req.json();
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabase
      .from('partner_withdrawals')
      .insert([
        {
          store_id: session.user.id,
          amount: amount,
          payment_details: paymentMethods, // All methods saved as JSONB per mobile logic
          status: 'pending',
        },
      ]);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}