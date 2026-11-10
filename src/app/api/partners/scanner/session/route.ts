//src/app/api/partners/scanner/session/route.ts
//implementing attomicity
import { NextResponse } from 'next/server';
import {
  scannerAdmin,
  getWebScannerUser,
  getAppScannerUser,
  isValidScannerStore,
  generateScannerToken,
  hashScannerToken,
} from '@/lib/partners/scanner-server';

export const dynamic = 'force-dynamic';

async function getScannerRequestUser(request: Request) {
  const authorization = request.headers.get('authorization');
  if (authorization !== null) {
    if (!authorization.startsWith('Bearer ')) { return null; }
    return getAppScannerUser(request);
  }
  return getWebScannerUser();
}

export async function POST() {
  try {
    const user = await getWebScannerUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!(await isValidScannerStore(user.id))) {
      return NextResponse.json(
        { error: 'Partner store not found' },
        { status: 403 }
      );
    }

    const now = Date.now();

    // Close previous active sessions belonging to this partner.
    const { error: closeError } = await scannerAdmin
      .from('partner_scanner_sessions')
      .update({
        status: 'closed',
        closed_at: new Date(now).toISOString(),
      })
      .eq('store_id', user.id)
      .in('status', ['pending', 'connected']);

    if (closeError) throw closeError;

    const token = generateScannerToken();

    const { data, error } = await scannerAdmin
      .from('partner_scanner_sessions')
      .insert({
        store_id: user.id,
        created_by: user.id,
        pairing_token_hash: hashScannerToken(token),
        status: 'pending',
        pairing_expires_at: new Date(
          now + 5 * 60 * 1000
        ).toISOString(),
        expires_at: new Date(
          now + 30 * 60 * 1000
        ).toISOString(),
      })
      .select('id, pairing_expires_at, expires_at')
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      sessionId: data.id,
      token,
      pairingExpiresAt: data.pairing_expires_at,
      expiresAt: data.expires_at,
    });
  } catch (error) {
    console.error('[Scanner] Create session:', error);

    return NextResponse.json(
      { error: 'Failed to create scanner session' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const user = await getScannerRequestUser(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, { status: 401 }
      );
    }

    const sessionId = new URL(request.url)
      .searchParams.get('sessionId');

    const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!sessionId || !UUID_PATTERN.test(sessionId)) {
      return NextResponse.json(
        { error: 'Invalid session ID' },
        { status: 400 }
      );
    }

    const { data, error } = await scannerAdmin
      .from('partner_scanner_sessions')
      .select( 'id, status, connected_by, pairing_expires_at, expires_at, closed_at' )
      .eq('id', sessionId)
      .eq('store_id', user.id)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { error: 'Scanner session not found' },
        { status: 404 }
      );
    }

    const now = Date.now();
    const expired = new Date(data.expires_at).getTime() <= now;
    const pairingExpired = data.status === 'pending' && new Date(data.pairing_expires_at).getTime() <= now;

    const effectiveStatus = data.status === 'closed' || expired || pairingExpired ? 'closed' : data.status;

    return NextResponse.json({
      success: true,
      sessionId: data.id,
      status: effectiveStatus,
      expiresAt: data.expires_at,
      closedAt: data.closed_at,
      connectedBy: data.connected_by,
    });
  } catch (error) {
    console.error('[Scanner] Get session status:', error);

    return NextResponse.json(
      { error: 'Failed to check scanner session' }, { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getScannerRequestUser(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const sessionId = body?.sessionId;

    const UUID_PATTERN =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (
      typeof sessionId !== 'string' ||
      !UUID_PATTERN.test(sessionId)
    ) {
      return NextResponse.json(
        { error: 'Invalid session ID' },
        { status: 400 }
      );
    }

    const { data: session, error: readError } =
      await scannerAdmin
        .from('partner_scanner_sessions')
        .select('id, status, created_by, connected_by')
        .eq('id', sessionId)
        .eq('store_id', user.id)
        .maybeSingle();

    if (readError) throw readError;

    if (!session) {
      return NextResponse.json(
        { error: 'Scanner session not found' },
        { status: 404 }
      );
    }

    if (
      session.created_by !== user.id &&
      session.connected_by !== user.id
    ) {
      return NextResponse.json(
        { error: 'Not authorized to close this session' },
        { status: 403 }
      );
    }

    // Idempotent closure: closing an already closed
    // session is treated as success.
    if (session.status === 'closed') {
      return NextResponse.json({
        success: true,
        status: 'closed',
        alreadyClosed: true,
      });
    }

    const { error: updateError } = await scannerAdmin
      .from('partner_scanner_sessions')
      .update({
        status: 'closed',
        closed_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .eq('store_id', user.id)
      .in('status', ['pending', 'connected']);

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      status: 'closed',
    });
  } catch (error) {
    console.error('[Scanner] Close session:', error);

    return NextResponse.json(
      { error: 'Failed to close scanner session' },
      { status: 500 }
    );
  }
}