//aiva-stores/src/app/api/partners/walkin/scanner/event/route.ts
import { NextResponse } from 'next/server';
import { getWebScannerUser } from '@/lib/partners/scanner-server';
import {
  scannerAdmin,
  getScannerUser,
  getOwnedSession,
  UUID_PATTERN,
  failure,
} from '@/lib/partners/walkin-scanner-server';

export const dynamic = 'force-dynamic';

const RESULT_STATUSES = new Set([
  'added',
  'not_found',
  'duplicate',
  'stock_limit',
  'error',
  'discarded',
]);

export async function GET(request: Request) {
  try {
    const user = await getScannerUser(request);

    if (!user) return failure('Unauthorized', 401);

    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');
    const eventId = url.searchParams.get('eventId');

    if (
      !sessionId ||
      !UUID_PATTERN.test(sessionId) ||
      (eventId !== null && !UUID_PATTERN.test(eventId))
    ) {
      return failure('Invalid event request');
    }

    const session = await getOwnedSession(sessionId, user.id);

    if (!session) return failure('Scanner session not found', 404);

    if (eventId) {
      const { data, error } = await scannerAdmin
        .from('walkin_scanner_events')
        .select('event_id, consumed_at, result_status, result_message')
        .eq('session_id', sessionId)
        .eq('store_id', user.id)
        .eq('event_id', eventId)
        .maybeSingle();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        event: data,
      });
    }

    // The pending queue is consumed only by the web dashboard.
    if (request.headers.has('authorization')) {
      return failure('Dashboard access required', 403);
    }

    const { data, error } = await scannerAdmin
      .from('walkin_scanner_events')
      .select('id, event_id, barcode, sequence_number')
      .eq('session_id', sessionId)
      .eq('store_id', user.id)
      .is('consumed_at', null)
      .order('sequence_number', { ascending: true })
      .limit(100);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      events: data || [],
    });
  } catch (error) {
    console.error('[Walkin Scanner] Read events:', error);
    return failure('Failed to read scanner events', 500);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getWebScannerUser();

    if (!user) return failure('Unauthorized', 401);

    const body = await request.json();

    if (
      typeof body.sessionId !== 'string' ||
      !UUID_PATTERN.test(body.sessionId) ||
      typeof body.eventId !== 'string' ||
      !UUID_PATTERN.test(body.eventId) ||
      !RESULT_STATUSES.has(body.status) ||
      typeof body.message !== 'string' ||
      body.message.length > 500
    ) {
      return failure('Invalid event result');
    }

    const session = await getOwnedSession(body.sessionId, user.id);

    if (!session) return failure('Scanner session not found', 404);

    const { data: event, error: readError } = await scannerAdmin
      .from('walkin_scanner_events')
      .select('event_id, consumed_at')
      .eq('session_id', session.id)
      .eq('store_id', user.id)
      .eq('event_id', body.eventId)
      .maybeSingle();

    if (readError) throw readError;
    if (!event) return failure('Scan event not found', 404);

    if (!event.consumed_at) {
      const { error } = await scannerAdmin
        .from('walkin_scanner_events')
        .update({
          consumed_at: new Date().toISOString(),
          result_status: body.status,
          result_message: body.message,
        })
        .eq('session_id', session.id)
        .eq('store_id', user.id)
        .eq('event_id', body.eventId)
        .is('consumed_at', null);

      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Walkin Scanner] Save result:', error);
    return failure('Failed to confirm scan result', 500);
  }
}