//aiva-stores/src/app/api/partners/walkin/scanner/session/route.ts
import { NextResponse } from 'next/server';
import { getWebScannerUser } from '@/lib/partners/scanner-server';
import {
  scannerAdmin,
  getScannerUser,
  getOwnedSession,
  effectiveStatus,
  generateScannerToken,
  hashScannerToken,
  isValidScannerStore,
  UUID_PATTERN,
  failure,
} from '@/lib/partners/walkin-scanner-server';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const user = await getWebScannerUser();

    if (!user) return failure('Unauthorized', 401);

    if (!(await isValidScannerStore(user.id))) {
      return failure('Partner store not found', 403);
    }

    const now = Date.now();

    // Starting a fresh pairing replaces the previous walk-in connection.
    const { error: closeError } = await scannerAdmin
      .from('walkin_scanner_sessions')
      .update({
        status: 'closed',
        accepting_scans: false,
        closed_at: new Date(now).toISOString(),
      })
      .eq('store_id', user.id)
      .in('status', ['pending', 'connected']);

    if (closeError) throw closeError;

    const token = generateScannerToken();

    const { data, error } = await scannerAdmin
      .from('walkin_scanner_sessions')
      .insert({
        store_id: user.id,
        created_by: user.id,
        pairing_token_hash: hashScannerToken(token),
        status: 'pending',
        accepting_scans: true,
        pairing_expires_at: new Date(now + 5 * 60 * 1000).toISOString(),
        expires_at: new Date(now + 60 * 60 * 1000).toISOString(),
      })
      .select('id, pairing_expires_at, expires_at')
      .single();

    if (error?.code === '23505') {
      return failure(
        'Another pairing was started. Please try again.',
        409
      );
    }

    if (error) throw error;

    return NextResponse.json({
      success: true,
      sessionId: data.id,
      token,
      pairingExpiresAt: data.pairing_expires_at,
      expiresAt: data.expires_at,
    });
  } catch (error) {
    console.error('[Walkin Scanner] Create session:', error);
    return failure('Failed to create scanner session', 500);
  }
}

export async function GET(request: Request) {
  try {
    const user = await getScannerUser(request);

    if (!user) return failure('Unauthorized', 401);

    const sessionId = new URL(request.url).searchParams.get('sessionId');

    if (!sessionId || !UUID_PATTERN.test(sessionId)) {
      return failure('Invalid session ID');
    }

    const session = await getOwnedSession(sessionId, user.id);

    if (!session) return failure('Scanner session not found', 404);

    const status = effectiveStatus(session);

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      status,
      acceptingScans:
        status === 'connected' && session.accepting_scans,
      connectedBy: session.connected_by,
      expiresAt: session.expires_at,
    });
  } catch (error) {
    console.error('[Walkin Scanner] Read session:', error);
    return failure('Failed to check scanner session', 500);
  }
}

export async function PATCH(request: Request) {
  try {
    // Only the web dashboard controls checkout pause / resume.
    const user = await getWebScannerUser();

    if (!user) return failure('Unauthorized', 401);

    const body = await request.json();

    if (
      typeof body.sessionId !== 'string' ||
      !UUID_PATTERN.test(body.sessionId) ||
      typeof body.acceptingScans !== 'boolean'
    ) {
      return failure('Invalid scanner update');
    }

    const session = await getOwnedSession(body.sessionId, user.id);

    if (!session) return failure('Scanner session not found', 404);

    if (effectiveStatus(session) === 'closed') {
      return failure('Scanner session inactive or expired', 409);
    }

    if (body.acceptingScans) {
      const { count, error } = await scannerAdmin
        .from('walkin_scanner_events')
        .select('id', { count: 'exact', head: true })
        .eq('session_id', session.id)
        .eq('store_id', user.id)
        .is('consumed_at', null);

      if (error) throw error;

      if ((count ?? 0) > 0) {
        return failure(
          'Finish processing pending scans before resuming.',
          409
        );
      }
    }

    const { data, error } = await scannerAdmin
      .from('walkin_scanner_sessions')
      .update({ accepting_scans: body.acceptingScans })
      .eq('id', session.id)
      .eq('store_id', user.id)
      .in('status', ['pending', 'connected'])
      .gt('expires_at', new Date().toISOString())
      .select('id')
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return failure('Scanner session inactive or expired', 409);
    }

    return NextResponse.json({
      success: true,
      acceptingScans: body.acceptingScans,
    });
  } catch (error) {
    console.error('[Walkin Scanner] Update session:', error);
    return failure('Failed to update scanner session', 500);
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getScannerUser(request);

    if (!user) return failure('Unauthorized', 401);

    const body = await request.json();

    if (
      typeof body.sessionId !== 'string' ||
      !UUID_PATTERN.test(body.sessionId)
    ) {
      return failure('Invalid session ID');
    }

    const session = await getOwnedSession(body.sessionId, user.id);

    if (!session) return failure('Scanner session not found', 404);

    if (session.status !== 'closed') {
      const { error } = await scannerAdmin
        .from('walkin_scanner_sessions')
        .update({
          status: 'closed',
          accepting_scans: false,
          closed_at: new Date().toISOString(),
        })
        .eq('id', session.id)
        .eq('store_id', user.id)
        .in('status', ['pending', 'connected']);

      if (error) throw error;
    }

    return NextResponse.json({
      success: true,
      status: 'closed',
    });
  } catch (error) {
    console.error('[Walkin Scanner] Close session:', error);
    return failure('Failed to disconnect scanner', 500);
  }
}