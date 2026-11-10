//src/app/api/partners/scanner/scan/route.ts
import { NextResponse } from 'next/server';
import {
  scannerAdmin,
  getAppScannerUser,
} from '@/lib/partners/scanner-server';

const SCAN_BATCH_LIMIT = 50;

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
    const { sessionId, eventId } = body;

    const barcode =
      typeof body.barcode === 'string'
        ? body.barcode.trim()
        : '';

    if (
      typeof sessionId !== 'string' ||
      typeof eventId !== 'string' ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(eventId) ||
      barcode.length < 6 ||
      barcode.length > 80 ||
      !/^[A-Za-z0-9._/+ -]+$/.test(barcode)
    ) {
      return NextResponse.json(
        { error: 'Invalid scan data' },
        { status: 400 }
      );
    }

    const { data: session, error: sessionError } =
      await scannerAdmin
        .from('partner_scanner_sessions')
        .select('id, store_id, connected_by, status, expires_at')
        .eq('id', sessionId)
        .eq('store_id', user.id)
        .eq('connected_by', user.id)
        .eq('status', 'connected')
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

    if (sessionError) throw sessionError;

    if (!session) {
      return NextResponse.json(
        { error: 'Scanner session inactive or expired' },
        { status: 403 }
      );
    }

    // Count every stored event, independently of any query row limit.
    const { count, error: countError } = await scannerAdmin
      .from('partner_scanner_events')
      .select('id', { count: 'exact', head: true })
      .eq('session_id', session.id)
      .eq('store_id', session.store_id);

    if (countError) throw countError;

    const scanCount = count ?? 0;

    // A retry after a lost HTTP response must not use another slot.
    const { data: eventWithSameId, error: eventIdError } =
      await scannerAdmin
        .from('partner_scanner_events')
        .select('event_id')
        .eq('session_id', session.id)
        .eq('store_id', session.store_id)
        .eq('event_id', eventId)
        .limit(1)
        .maybeSingle();

    if (eventIdError) throw eventIdError;

    const { data: eventWithSameBarcode, error: barcodeError } =
      await scannerAdmin
        .from('partner_scanner_events')
        .select('event_id')
        .eq('session_id', session.id)
        .eq('store_id', session.store_id)
        .eq('barcode', barcode)
        .limit(1)
        .maybeSingle();

    if (barcodeError) throw barcodeError;

    const existingEvent = eventWithSameId || eventWithSameBarcode;

    if (existingEvent) {
      return NextResponse.json({
        success: true,
        duplicateEvent: true,
        scanCount,
        batchLimit: SCAN_BATCH_LIMIT,
        batchFull: scanCount >= SCAN_BATCH_LIMIT,
      });
    }

    if (scanCount >= SCAN_BATCH_LIMIT) {
      return NextResponse.json(
        {
          error:
            'Scan batch full. Review and add these products to inventory before starting another batch.',
          code: 'SCAN_BATCH_FULL',
          scanCount,
          batchLimit: SCAN_BATCH_LIMIT,
          batchFull: true,
        },
        { status: 409 }
      );
    }

    const { error } = await scannerAdmin
      .from('partner_scanner_events')
      .insert({
        session_id: session.id,
        store_id: session.store_id,
        event_id: eventId,
        barcode,
      });

    if (error && error.code !== '23505') throw error;

    // Read the confirmed total rather than guessing after a duplicate insert.
    const { count: confirmedCount, error: confirmedCountError } =
      await scannerAdmin
        .from('partner_scanner_events')
        .select('id', { count: 'exact', head: true })
        .eq('session_id', session.id)
        .eq('store_id', session.store_id);

    if (confirmedCountError) throw confirmedCountError;

    const total = confirmedCount ?? scanCount;

    return NextResponse.json({
      success: true,
      duplicateEvent: error?.code === '23505',
      scanCount: total,
      batchLimit: SCAN_BATCH_LIMIT,
      batchFull: total >= SCAN_BATCH_LIMIT,
    });
  } catch (error) {
    console.error('[Scanner] Receive barcode:', error);

    return NextResponse.json(
      { error: 'Failed to process scan' },
      { status: 500 }
    );
  }
}