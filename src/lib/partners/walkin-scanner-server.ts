///aiva-stores/src/lib/partners/walkin-scanner-server.ts
import 'server-only';
import { NextResponse } from 'next/server';
import { scannerAdmin, getAppScannerUser, getWebScannerUser, } from '@/lib/partners/scanner-server';

export { scannerAdmin, generateScannerToken, hashScannerToken, isValidScannerStore, } from '@/lib/partners/scanner-server';
export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const BARCODE_PATTERN = /^[A-Za-z0-9._/+ -]{6,80}$/;

export function failure(error: string, status = 400, code?: string) {
  return NextResponse.json(
    { success: false, error, ...(code ? { code } : {}) },
    { status }
  );
}

export async function getScannerUser(request: Request) {
  // An invalid bearer header must not fall back to browser cookies.
  if (request.headers.has('authorization')) {
    return getAppScannerUser(request);
  }

  return getWebScannerUser();
}

export async function getOwnedSession(
  sessionId: string,
  userId: string
) {
  const { data, error } = await scannerAdmin
    .from('walkin_scanner_sessions')
    .select(
      'id, store_id, created_by, connected_by, status, accepting_scans, pairing_expires_at, expires_at, closed_at'
    )
    .eq('id', sessionId)
    .eq('store_id', userId)
    .eq('created_by', userId)
    .maybeSingle();

  if (error) throw error;

  return data;
}

export function effectiveStatus(session: {
  status: string;
  expires_at: string;
  pairing_expires_at: string;
}) {
  const now = Date.now();

  if (
    session.status === 'closed' ||
    new Date(session.expires_at).getTime() <= now ||
    (
      session.status === 'pending' &&
      new Date(session.pairing_expires_at).getTime() <= now
    )
  ) {
    return 'closed';
  }

  return session.status;
}