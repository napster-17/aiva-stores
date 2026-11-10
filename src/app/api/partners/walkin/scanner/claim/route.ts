//aiva-stores/src/app/api/partners/walkin/scanner/claim/route.ts
import { NextResponse } from 'next/server';
import { getAppScannerUser } from '@/lib/partners/scanner-server';
import {
  scannerAdmin,
  hashScannerToken,
  UUID_PATTERN,
  failure,
} from '@/lib/partners/walkin-scanner-server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const user = await getAppScannerUser(request);

    if (!user) return failure('Unauthorized', 401);

    const body = await request.json();

    if (
      typeof body.sessionId !== 'string' ||
      !UUID_PATTERN.test(body.sessionId) ||
      typeof body.token !== 'string' ||
      !/^[a-f0-9]{64}$/i.test(body.token)
    ) {
      return failure('Invalid pairing request');
    }

    const now = new Date().toISOString();
    const tokenHash = hashScannerToken(body.token);

    const { data, error } = await scannerAdmin
      .from('walkin_scanner_sessions')
      .update({
        status: 'connected',
        connected_by: user.id,
        connected_at: now,
      })
      .eq('id', body.sessionId)
      .eq('store_id', user.id)
      .eq('created_by', user.id)
      .eq('status', 'pending')
      .eq('pairing_token_hash', tokenHash)
      .gt('pairing_expires_at', now)
      .gt('expires_at', now)
      .select('id, expires_at')
      .maybeSingle();

    if (error) throw error;

    let connected = data;

    // Permit retrying a successful claim whose HTTP response was lost.
    if (!connected) {
      const { data: existing, error: retryError } = await scannerAdmin
        .from('walkin_scanner_sessions')
        .select('id, expires_at')
        .eq('id', body.sessionId)
        .eq('store_id', user.id)
        .eq('created_by', user.id)
        .eq('connected_by', user.id)
        .eq('status', 'connected')
        .eq('pairing_token_hash', tokenHash)
        .gt('expires_at', now)
        .maybeSingle();

      if (retryError) throw retryError;
      connected = existing;
    }

    if (!connected) {
      return failure(
        'Pairing failed. QR expired, was replaced, or belongs to another store.',
        403
      );
    }

    return NextResponse.json({
      success: true,
      sessionId: connected.id,
      expiresAt: connected.expires_at,
    });
  } catch (error) {
    console.error('[Walkin Scanner] Claim:', error);
    return failure('Failed to pair scanner', 500);
  }
}