// src/app/api/partners/ledger/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch ledger with order details and check for pending withdrawals simultaneously
    const [ledgerRes, withdrawalRes, paymentRes] = await Promise.all([
      supabase
        .from('ledger')
        .select('*, orders(id, total_amount, payment_method, status)')
        .eq('store_id', session.user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('partner_withdrawals')
        .select('id')
        .eq('store_id', session.user.id)
        .eq('status', 'pending')
        .limit(1),
      supabase
        .from('payment_methods')
        .select('*')
        .eq('store_id', session.user.id)
    ]);

    if (ledgerRes.error) throw ledgerRes.error;

    return NextResponse.json({
      entries: ledgerRes.data || [],
      hasPendingWithdrawal: (withdrawalRes.data?.length ?? 0) > 0,
      paymentMethods: paymentRes.data || []
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}