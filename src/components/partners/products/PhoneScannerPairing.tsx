//src/components/partners/products/PhoneScannerPairing.tsx
//Updaing for atomicity
'use client';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle2, Clock3, Loader2, RefreshCw, ScanBarcode, Smartphone, X,
} from 'lucide-react';
import { toast } from 'sonner';

type ScannerSession = { sessionId: string; token: string; pairingExpiresAt: string; expiresAt: string; };
type ScanEvent = { id: string; event_id: string; session_id: string; barcode: string; created_at: string; };
type ScannerStatus = 'idle' | 'creating' | 'pending' | 'connected' | 'closed';

const SCAN_BATCH_LIMIT = 50;

export type ScannerDisplayResult = {
  status: | 'checking' | 'ready' | 'existing' | 'unmatched' | 'error' | 'dismissed';
  productId?: string; productName?: string; message?: string;
};

interface Props {
  onScan?: (barcode: string) => void | Promise<void>;
  results: Record<string, ScannerDisplayResult>;
  selectedProductIds: Set<string>;
  onResolve: (barcode: string) => void;
  onRetry: (barcode: string) => void;
}

export type PhoneScannerPairingHandle = { disconnect: () => Promise<boolean>; };

const formatRemaining = (milliseconds: number) => {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
};

const PhoneScannerPairing = forwardRef< PhoneScannerPairingHandle, Props
>(function PhoneScannerPairing({
  onScan, results, selectedProductIds, onResolve, onRetry,
}, ref) {
  const [session, setSession] = useState<ScannerSession | null>(null);
  const [status, setStatus] = useState<ScannerStatus>('idle');
  const [scans, setScans] = useState<ScanEvent[]>([]);
  const [now, setNow] = useState(Date.now());
  const [disconnecting, setDisconnecting] = useState(false);
  const [creating, setCreating] = useState(false);

  const supabase = useMemo(() => createClient(), []);
  const onScanRef = useRef(onScan);
  const processedEventIdsRef = useRef<Set<string>>(new Set());
  const sessionRef = useRef<ScannerSession | null>(null);
  const generationRef = useRef(0);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  const startSession = useCallback(async () => {
    if (creating || disconnecting) return;
    const generation = ++generationRef.current;
    setCreating(true);
    setStatus('creating');

    try {
      // If replacing an expired session, close the old one first.
      const previous = sessionRef.current;
      if (previous) {
        const closeResponse = await fetch('/api/partners/scanner/session', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: previous.sessionId }),
        });
        if (!closeResponse.ok) { throw new Error('Could not close the previous scanner session'); }
      }

      const response = await fetch('/api/partners/scanner/session', { method: 'POST' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to create session');

      if (generation !== generationRef.current) return;
      sessionRef.current = result as ScannerSession;
      setSession(result as ScannerSession);
      setScans([]);
      processedEventIdsRef.current.clear();
      setStatus('pending');
    } catch (error: any) {
      if (generation !== generationRef.current) return;
      setStatus(sessionRef.current ? 'closed' : 'idle');
      toast.error(error?.message || 'Failed to start scanner');
    } finally {
      if (generation === generationRef.current) setCreating(false);
    }
  }, [creating, disconnecting]);

const stopSession = useCallback(async (): Promise<boolean> => {
  const current = sessionRef.current;

  // No session exists, so the parent can safely close.
  if (!current) return true;

  if (disconnecting || creating) return false;

  setDisconnecting(true);

  try {
    const response = await fetch(
      '/api/partners/scanner/session',
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({ sessionId: current.sessionId, }),
      }
    );

    const result = await response.json();

    if (!response.ok || result.success !== true) { throw new Error( result.error || 'Failed to disconnect scanner' ); }
    generationRef.current += 1;
    sessionRef.current = null;
    setSession(null);
    setScans([]);
    processedEventIdsRef.current.clear();
    setStatus('closed');
    toast.success('Scanner disconnected');

    return true;
  } catch (error) {
    console.error('[Scanner] Disconnect failed:', error);
    toast.error( 'Unable to disconnect. Check your connection and retry.' );
    return false;
  } finally {
    setDisconnecting(false);
  }
}, [disconnecting, creating]);

  useImperativeHandle( ref, () => ({ disconnect: stopSession, }), [stopSession] );
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    const sessionId = session.sessionId;

    const processScan = (event: ScanEvent) => {
      if (cancelled || processedEventIdsRef.current.has(event.event_id)) return;
      processedEventIdsRef.current.add(event.event_id);
      setScans(prev => {
        if (prev.some(item => item.id === event.id)) return prev;
        return [event, ...prev];
      });
      void Promise.resolve(onScanRef.current?.(event.barcode)).catch(error =>
        console.error('[Scanner] Scan callback failed:', error)
      );
    };

    const checkSession = async () => {
      const { data, error } = await supabase
        .from('partner_scanner_sessions')
        .select('status, expires_at')
        .eq('id', sessionId)
        .maybeSingle();
      if (cancelled || error || !data) return;
      if (data.status === 'closed' || new Date(data.expires_at).getTime() <= Date.now()) {
        setStatus('closed');
      } else {
        setStatus(data.status === 'connected' ? 'connected' : 'pending');
      }
    };

    let loadingScans = false;

    const loadRecentScans = async () => {
      if (cancelled || loadingScans) return;
      loadingScans = true;
      const pageSize = 100;
      try {
        let offset = 0;
        while (!cancelled) {
          const { data, error } = await supabase
            .from('partner_scanner_events')
            .select('id, event_id, session_id, barcode, created_at')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: true })
            .order('id', { ascending: true })
            .range(offset, offset + pageSize - 1);
          if (cancelled) return;
          if (error) throw error;
          const events = (data || []) as ScanEvent[];
          for (const event of events) { processScan(event); }
          if (events.length < pageSize) break;
          offset += events.length;
        }
      } catch (error) {
        console.error('[Scanner] Scan recovery failed:', error);
      } finally {
        loadingScans = false;
      }
    };

    const channel = supabase
      .channel(`partner-scanner-${sessionId}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'partner_scanner_sessions',
        filter: `id=eq.${sessionId}`,
      }, () => { void checkSession(); })
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'partner_scanner_events',
        filter: `session_id=eq.${sessionId}`,
      }, payload => { processScan(payload.new as ScanEvent); })
      .subscribe(subscriptionStatus => {
        if (subscriptionStatus === 'SUBSCRIBED') {
          void checkSession(); void loadRecentScans(); }
      });

    const poll = setInterval(() => {
      void checkSession();
      void loadRecentScans();
    }, 10000);

    return () => {
      cancelled = true;
      clearInterval(poll);
      void supabase.removeChannel(channel);
    };
  }, [session?.sessionId, supabase]);

  const qrExpired = session ? now >= new Date(session.pairingExpiresAt).getTime() : false;
  const sessionExpired = session ? now >= new Date(session.expiresAt).getTime() : false;
  const isConnected = status === 'connected' && !sessionExpired;
  const isPending = status === 'pending' && !qrExpired && !sessionExpired;
  const needsRefresh = !!session && (sessionExpired || (status === 'pending' && qrExpired) || status === 'closed');
  const qrValue = session && typeof window !== 'undefined'
    ? `${window.location.origin}/partners/scanner/connect?session=${encodeURIComponent(session.sessionId)}&token=${encodeURIComponent(session.token)}`
    : '';
  // One visible row per barcode; repeated scans do not inflate the counters.
  const visibleScans = scans.filter( (scan, index, all) => all.findIndex(item => item.barcode === scan.barcode) === index );
  const scannedCount = visibleScans.length;
  const batchFull = scannedCount >= SCAN_BATCH_LIMIT;
  const displayStatus = (barcode: string) => {
  const result = results[barcode];

    if (
        result?.status === 'ready' &&
        result.productId &&
        !selectedProductIds.has(result.productId)
    ) {
        return 'removed';
    }

    return result?.status || 'checking';
    };

  const readyCount = visibleScans.filter( scan => displayStatus(scan.barcode) === 'ready' ).length;
  const existingCount = visibleScans.filter( scan => displayStatus(scan.barcode) === 'existing' ).length;
  const attentionCount = visibleScans.filter(scan => ['unmatched', 'error'].includes(displayStatus(scan.barcode)) ).length;

  const statusStyles = {
    checking: 'border-slate-200 bg-slate-50 text-slate-600',
    ready: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    existing: 'border-blue-200 bg-blue-50 text-blue-700',
    unmatched: 'border-amber-200 bg-amber-50 text-amber-800',
    error: 'border-red-200 bg-red-50 text-red-700',
    dismissed: 'border-slate-200 bg-slate-50 text-slate-500',
    removed: 'border-slate-200 bg-slate-50 text-slate-500',
  };

  const statusLabels = {
    checking: 'Checking…',
    ready: 'Ready to import',
    existing: 'Already in your store',
    unmatched: 'Product not found',
    error: 'Could not check',
    dismissed: 'Skipped',
    removed: 'Removed from selection',
  };

return (
  <section className="flex min-h-0 flex-col bg-white md:h-full">
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
      <div className="flex items-center gap-2">
        <Smartphone size={18} className="text-orange-500" />
        <h3 className="text-sm font-semibold text-slate-900">
          Phone scanner
        </h3>
      </div>

      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
          isConnected
            ? 'bg-emerald-50 text-emerald-700'
            : isPending
              ? 'bg-amber-50 text-amber-700'
              : 'bg-slate-100 text-slate-500'
        }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            isConnected
              ? 'bg-emerald-500'
              : isPending
                ? 'bg-amber-500'
                : 'bg-slate-400'
          }`}
        />
        {isConnected
          ? 'Connected' : isPending
            ? 'Scan QR to connect' : status === 'creating'
              ? 'Connecting…' : 'Not connected'}
      </span>
    </div>

    <div className="min-h-0 flex-1 md:overflow-y-auto">
      {(status === 'idle' || (status === 'closed' && !session)) && (
        <div className="px-4 py-5">
          <h4 className="text-base font-semibold text-slate-900">
            Use your phone to scan products
          </h4>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Open Aiva-Partners → Products → Add Products →
            Scan to Web Dashboard.
          </p>

          <button
            type="button"
            onClick={() => void startSession()}
            disabled={creating || disconnecting}
            className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
          >
            <Smartphone size={17} />
            Connect phone
          </button>
        </div>
      )}

      {status === 'creating' && (
        <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-slate-600">
          <Loader2 size={19} className="animate-spin text-orange-500" />
          Preparing QR code…
        </div>
      )}

      {isPending && (
        <div className="border-b border-slate-100 px-4 py-4">
          <div className="flex flex-col items-center gap-3">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              {qrValue && (
                <QRCodeSVG
                  value={qrValue}
                  size={190}
                  level="M"
                  marginSize={2}
                />
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock3 size={14} />
              QR expires in
              <span className="font-mono font-semibold text-slate-800">
                {formatRemaining(
                  new Date(session!.pairingExpiresAt).getTime() - now
                )}
              </span>
            </div>
          </div>

          <p className="mt-3 text-center text-sm leading-6 text-slate-600">
            In Aiva-Partners, open <strong>Scan to Web Dashboard</strong>
            {' '}and scan this QR.
          </p>

          <details className="mt-2 text-center text-xs text-slate-500">
            <summary className="cursor-pointer py-1 font-medium text-orange-600">
              Where do I find it?
            </summary>
            <p className="mt-1 leading-5">
              Products → Add Products → Scan to Web Dashboard.
              After pairing, keep the camera open to scan items.
            </p>
          </details>
        </div>
      )}

      {isConnected && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-100 bg-emerald-50/60 px-4 py-3">
          <p className="flex items-center gap-2 text-sm font-medium text-emerald-800">
            <CheckCircle2 size={17} />
            {batchFull
              ? 'Batch complete. Review your products.'
              : 'Ready. Scan your products.'}
          </p>

          <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
            <Clock3 size={13} />
            {formatRemaining(
              new Date(session!.expiresAt).getTime() - now
            )} left
          </span>
        </div>
      )}

      {needsRefresh && (
        <div className="border-b border-amber-100 bg-amber-50 px-4 py-4">
          <p className="text-sm font-semibold text-amber-900">
            {sessionExpired
              ? 'Scanner session expired'
              : status === 'closed'
                ? 'Scanner disconnected'
                : 'QR code expired'}
          </p>

          <button
            type="button"
            onClick={() => void startSession()}
            disabled={creating || disconnecting}
            className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-lg bg-orange-500 px-4 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
          >
            <RefreshCw size={15} />
            Connect again
          </button>
        </div>
      )}

      {session && (
        <div
          className={`border-b px-4 py-3 ${ batchFull ? 'border-orange-200 bg-orange-50' : 'border-slate-100 bg-slate-50' }`}
          aria-live="polite"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-800">
              {scannedCount} / {SCAN_BATCH_LIMIT} barcodes scanned
            </p>

            {batchFull && (
              <span className="text-xs font-semibold text-orange-700">
                Batch complete
              </span>
            )}
          </div>

          <p className="mt-1 text-xs leading-5 text-slate-600">
            {batchFull
              ? 'Finish checking or resolving products below. Then choose Done Scanning · Review Products and import your selection before starting another batch.'
              : 'Scan up to 50 unique barcodes, then review price and stock before importing.'}
          </p>
        </div>
      )}

      {visibleScans.length > 0 ? (
        <div className="p-4">
          <div className="mb-4 grid grid-cols-3 gap-2">
            {[
              {
                label: 'Ready to import',
                count: readyCount,
                style: 'bg-emerald-50 text-emerald-800',
              },
              {
                label: 'Already in store',
                count: existingCount,
                style: 'bg-blue-50 text-blue-800',
              },
              {
                label: 'Needs attention',
                count: attentionCount,
                style: 'bg-amber-50 text-amber-900',
              },
            ].map(item => (
              <div
                key={item.label}
                className={`rounded-xl px-3 py-3 ${item.style}`}
              >
                <p className="text-xl font-bold tabular-nums">
                  {item.count}
                </p>
                <p className="mt-1 text-xs leading-4">
                  {item.label}
                </p>
              </div>
            ))}
          </div>

          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-900">
              Batch products
            </h4>
            <span className="text-xs text-slate-500">
              {visibleScans.length} barcodes
            </span>
          </div>

          <div className="space-y-2" aria-live="polite" aria-atomic="false">
            {visibleScans.map(scan => {
              const result = results[scan.barcode];
              const currentStatus = displayStatus(scan.barcode);

              return (
                <div
                  key={scan.barcode}
                  className="rounded-xl border border-slate-200 bg-white p-3"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
                      {currentStatus === 'checking' ? (
                        <Loader2 size={17} className="animate-spin" />
                      ) : (
                        <ScanBarcode size={18} />
                      )}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="break-words text-sm font-semibold leading-5 text-slate-800">
                        {result?.productName || 'Scanned product'}
                      </p>

                      <p className="mt-0.5 break-all font-mono text-xs text-slate-500">
                        {scan.barcode}
                      </p>

                      <span
                        className={`mt-2 inline-flex rounded-md border px-2 py-1 text-xs font-medium ${statusStyles[currentStatus]}`}
                      >
                        {statusLabels[currentStatus]}
                      </span>

                      {currentStatus === 'unmatched' && (
                        <p className="mt-2 text-xs leading-5 text-slate-500">
                          Find the product by name or add a new product.
                        </p>
                      )}

                      {currentStatus === 'error' && (
                        <p className="mt-2 text-xs leading-5 text-red-600">
                          {result?.message || 'Please try again.'}
                        </p>
                      )}
                    </div>
                  </div>

                  {currentStatus === 'unmatched' && (
                    <button
                      type="button"
                      onClick={() => onResolve(scan.barcode)}
                      className="mt-3 min-h-10 w-full rounded-lg border border-orange-200 bg-orange-50 px-3 text-sm font-semibold text-orange-700 hover:bg-orange-100"
                    >
                      Find or add product
                    </button>
                  )}

                  {currentStatus === 'error' && (
                    <button
                      type="button"
                      onClick={() => onRetry(scan.barcode)}
                      className="mt-3 min-h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Try again
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <p className="mt-3 text-xs leading-5 text-slate-500">
            Ready products are selected for review. Check price and
            stock before importing. Repeated barcodes do not use
            another slot. Already-in-store and unmatched barcodes
            count toward this batch.
          </p>
        </div>
      ) : isConnected ? (
        <div className="px-5 py-10 text-center">
          <ScanBarcode size={30} className="mx-auto text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-700">
            Scan your first product
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Its name and result will appear here.
          </p>
        </div>
      ) : null}
    </div>

    {session && status !== 'creating' && (
      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-100 px-4 py-2.5">
        <span className="text-xs text-slate-400">
          Connected to your store only
        </span>

        <button
          type="button"
          onClick={() => void stopSession()}
          disabled={disconnecting || creating}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
        >
          {disconnecting ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <X size={14} />
          )}
          Disconnect
        </button>
      </div>
    )}
  </section>
  );
});

export default PhoneScannerPairing;