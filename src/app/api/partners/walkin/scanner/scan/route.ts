//aiva-stores/src/app/api/partners/walkin/scanner/scan/route.ts
import { NextResponse } from 'next/server';
import { getAppScannerUser } from '@/lib/partners/scanner-server';
import {
  scannerAdmin,
  UUID_PATTERN,
  BARCODE_PATTERN,
  failure,
} from '@/lib/partners/walkin-scanner-server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const user = await getAppScannerUser(request);

    if (!user) return failure('Unauthorized', 401);

    const body = await request.json();
    const barcode =
      typeof body.barcode === 'string' ? body.barcode.trim() : '';

    if (
      typeof body.sessionId !== 'string' ||
      !UUID_PATTERN.test(body.sessionId) ||
      typeof body.eventId !== 'string' ||
      !UUID_PATTERN.test(body.eventId) ||
      !BARCODE_PATTERN.test(barcode)
    ) {
      return failure('Invalid scan data');
    }

    const { data, error } = await scannerAdmin.rpc(
      'receive_walkin_scanner_event',
      {
        p_session_id: body.sessionId,
        p_user_id: user.id,
        p_event_id: body.eventId,
        p_barcode: barcode,
      }
    );

    if (error) throw error;

    if (!data?.success) {
      return failure(
        data?.error || 'Scan rejected',
        data?.code === 'SESSION_INACTIVE' ? 403 : 409,
        data?.code
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Walkin Scanner] Receive scan:', error);
    return failure('Failed to receive barcode', 500);
  }
}