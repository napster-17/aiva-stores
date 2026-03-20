// File: src/app/api/partners/settlements/route.ts
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

    // Fetch both withdrawals and settlements for the store
    const [withdrawalsRes, settlementsRes] = await Promise.all([
      supabase
        .from('partner_withdrawals')
        .select('*')
        .eq('store_id', session.user.id)
        .order('requested_at', { ascending: false }),
      supabase
        .from('partner_settlements')
        .select('*')
        .eq('store_id', session.user.id)
        .order('requested_at', { ascending: false })
    ]);

    if (withdrawalsRes.error) throw withdrawalsRes.error;
    if (settlementsRes.error) throw settlementsRes.error;

    // Combine and mark types
    const withdrawals = (withdrawalsRes.data || []).map(w => ({ ...w, type: 'withdrawal' }));
    const settlements = (settlementsRes.data || []).map(s => ({ ...s, type: 'settlement' }));

    const combined = [...withdrawals, ...settlements].sort((a, b) => 
      new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime()
    );

    return NextResponse.json({ transactions: combined });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}