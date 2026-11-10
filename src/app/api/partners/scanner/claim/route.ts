//src/app/api/partners/scanner/claim/route.ts
import { NextResponse } from 'next/server';
import {
  scannerAdmin,
  getAppScannerUser,
  hashScannerToken,
} from '@/lib/partners/scanner-server';

export async function POST(request: Request) {
  try {
    const user = await getAppScannerUser(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { sessionId, token } = body;

    if (
      typeof sessionId !== 'string' ||
      typeof token !== 'string' ||
      !/^[a-f0-9]{64}$/i.test(token)
    ) {
      return NextResponse.json(
        { error: 'Invalid pairing request' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    // Conditional update makes the pairing claim single-use.
    const { data, error } = await scannerAdmin
      .from('partner_scanner_sessions')
      .update({
        status: 'connected',
        connected_by: user.id,
        connected_at: now,
      })
      .eq('id', sessionId)
      .eq('store_id', user.id)
      .eq('status', 'pending')
      .eq('pairing_token_hash', hashScannerToken(token))
      .gt('pairing_expires_at', now)
      .gt('expires_at', now)
      .select('id, store_id, expires_at')
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        {
          error:
            'Pairing failed. QR may be expired, used, or belong to another store.',
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      sessionId: data.id,
      storeId: data.store_id,
      expiresAt: data.expires_at,
    });
  } catch (error) {
    console.error('[Scanner] Claim session:', error);

    return NextResponse.json(
      { error: 'Failed to pair scanner' },
      { status: 500 }
    );
  }
}