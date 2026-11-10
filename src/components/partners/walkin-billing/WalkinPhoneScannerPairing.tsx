//aiva-stores/src/components/partners/walkin-billing/WalkinPhoneScannerPairing.tsx
'use client';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState, } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Smartphone, X, Loader2 } from 'lucide-react';

const API = '/api/partners/walkin/scanner';

export type WalkinWebScanResult = { status: | 'added' | 'not_found' | 'duplicate' | 'stock_limit' | 'error' | 'discarded'; message: string; };
export type WalkinPhoneScannerHandle = { pause: () => Promise<void>; resume: () => Promise<void>; disconnect: () => Promise<void>; };

type Session = { sessionId: string; token: string; pairingExpiresAt: string; expiresAt: string; };
type ScanEvent = { id: string; event_id: string; barcode: string; };
type Props = { disabled: boolean; onBarcode: (barcode: string) => WalkinWebScanResult; hasCart: boolean; };

type ActivityEntry = {
  eventId: string;
  barcode: string;
  status: WalkinWebScanResult['status'];
  message: string;
  scanCount: number;
};

const RESULT_LABELS: Record<WalkinWebScanResult['status'], string> = {
  added: 'Added to bill',
  not_found: 'Not found',
  duplicate: 'Multiple matches',
  stock_limit: 'Stock limit',
  error: 'Could not add',
  discarded: 'Not added',
};

function remainingTime(iso: string, now: number) {
  const seconds = Math.max(
    0,
    Math.ceil((new Date(iso).getTime() - now) / 1000)
  );

  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(
    seconds % 60
  ).padStart(2, '0')}`;
}

async function request(
  path: string, method = 'GET', body?: Record<string, unknown>, keepalive = false
) {
  const response = await fetch(`${API}/${path}`, {
    method, cache: 'no-store', keepalive, headers: { 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  let result: any;

  try {
    result = await response.json();
  } catch {
    throw new Error(`Invalid dashboard response (${response.status}).`);
  }
  if (!response.ok || result.success !== true) { throw new Error(result.error || 'Scanner request failed.'); }
  return result;
}

const WalkinPhoneScannerPairing = forwardRef< WalkinPhoneScannerHandle, Props >(function WalkinPhoneScannerPairing({ disabled, onBarcode, hasCart }, ref) {
  const [session, setSession] = useState<Session | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('Not connected');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const sessionRef = useRef<Session | null>(null);
  const callbackRef = useRef(onBarcode);
  // Serializes polling, checkout pause, resume, and disconnect.
  const queueRef = useRef<Promise<unknown>>(Promise.resolve());
  // Retain locally applied results until the server acknowledges them.
  // An acknowledgement retry must not change the cart again.
  const appliedRef = useRef(new Map<string, WalkinWebScanResult>());
  const countedEventsRef = useRef(new Set<string>());
  const groupCountsRef = useRef(new Map<string, number>());  

  const [activityCounts, setActivityCounts] = useState({
    processed: 0,
    added: 0,
    notFound: 0,
    attention: 0,
  });

  const [recentActivity, setRecentActivity] = useState<ActivityEntry[]>([]);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const recordActivity = useCallback((
    event: ScanEvent,
    outcome: WalkinWebScanResult
  ) => {
    if (countedEventsRef.current.has(event.event_id)) return;

    countedEventsRef.current.add(event.event_id);

    const groupKey = `${event.barcode}:${outcome.status}`;
    const scanCount = (groupCountsRef.current.get(groupKey) || 0) + 1;

    groupCountsRef.current.set(groupKey, scanCount);

    setActivityCounts(previous => ({
      processed: previous.processed + 1,
      added: previous.added + (outcome.status === 'added' ? 1 : 0),
      notFound:
        previous.notFound + (outcome.status === 'not_found' ? 1 : 0),
      attention:
        previous.attention +
        (
          outcome.status !== 'added' &&
          outcome.status !== 'not_found'
            ? 1
            : 0
        ),
    }));

    setRecentActivity(previous => [
      {
        eventId: event.event_id,
        barcode: event.barcode,
        status: outcome.status,
        message: outcome.message,
        scanCount,
      },
      ...previous.filter(
        item => !(
          item.barcode === event.barcode &&
          item.status === outcome.status
        )
      ),
    ].slice(0, 20));
  }, []);

  callbackRef.current = onBarcode;

  const enqueue = useCallback(
    function enqueue<T>(work: () => Promise<T>): Promise<T> {
      const next = queueRef.current.then(work, work);
      queueRef.current = next.catch(() => {});
      return next;
    },
    []
  );

  const drain = useCallback(async () => {
    const current = sessionRef.current;
    if (!current) return;

    for (;;) {
      const result = await request( `event?sessionId=${encodeURIComponent(current.sessionId)}` );
      const events = result.events as ScanEvent[];

      for (const event of events) {
        let outcome = appliedRef.current.get(event.event_id);

        if (!outcome) {
          try {
            outcome = callbackRef.current(event.barcode);
          } catch (cause) {
            console.error('[Walkin Scanner] Cart callback:', cause);
            outcome = {
              status: 'error', message: 'Could not add this item. Search manually.' };
          }

          appliedRef.current.set(event.event_id, outcome);
          setMessage(outcome.message);
        }

        await request('event', 'POST', {
          sessionId: current.sessionId,
          eventId: event.event_id,
          status: outcome.status,
          message: outcome.message,
        });

        recordActivity(event, outcome);
        appliedRef.current.delete(event.event_id);
      }

      if (events.length < 100) break;
    }
  }, [recordActivity]);

  const pause = useCallback(
    () => enqueue(async () => {
      const current = sessionRef.current;
      if (!current) return;

      const remote = await request(
        `session?sessionId=${encodeURIComponent(current.sessionId)}`
      );

      if (remote.status !== 'closed') {
        await request('session', 'PATCH', {
          sessionId: current.sessionId,
          acceptingScans: false,
        });
      }

      // The server is now paused. Finish all events accepted before pause.
      await drain();
      setStatus(remote.status === 'closed' ? 'Disconnected' : 'Paused');
    }),
    [enqueue, drain]
  );

  const resume = useCallback(
    () => enqueue(async () => {
      const current = sessionRef.current;
      if (!current) return;

      const remote = await request( `session?sessionId=${encodeURIComponent(current.sessionId)}` );

      if (remote.status === 'closed') {
        setStatus('Disconnected');
        return;
      }

      await drain();

      await request('session', 'PATCH', { sessionId: current.sessionId, acceptingScans: true, });

      setStatus( remote.status === 'connected' ? 'Connected' : 'Scan QR to connect' );
      setError('');
    }),
    [enqueue, drain]
  );

  const disconnect = useCallback(
    () => enqueue(async () => {
      const current = sessionRef.current;
      if (!current) return;
      const remote = await request( `session?sessionId=${encodeURIComponent(current.sessionId)}` );

      if (remote.status !== 'closed') {
        await request('session', 'PATCH', { sessionId: current.sessionId, acceptingScans: false, });
      }
      await drain();
      await request('session', 'DELETE', { sessionId: current.sessionId, });

      sessionRef.current = null;
      appliedRef.current.clear();
      setSession(null);
      setStatus('Not connected');
      setOpen(false);
      setError('');
    }),
    [enqueue, drain]
  );

  useImperativeHandle(
    ref,
    () => ({ pause, resume, disconnect }),
    [pause, resume, disconnect]
  );

  const start = async () => {
    if (busy || disabled) return;

    setBusy(true);
    setError('');

    try {
      // Complete / close any old local session before replacing it.
      await disconnect();

      await enqueue(async () => {
        const created = await request('session', 'POST');

        sessionRef.current = created;
        appliedRef.current.clear();
        countedEventsRef.current.clear();
        groupCountsRef.current.clear();

        setActivityCounts({ processed: 0, added: 0, notFound: 0, attention: 0, });
        setRecentActivity([]);
        setNow(Date.now());        
        setSession(created);
        setStatus('Scan QR to connect');
        setMessage('');
        setOpen(true);
      });
    } catch (cause: any) {
      setError(cause.message || 'Could not connect scanner.');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!session) return;

    let cancelled = false;
    let polling = false;

    const poll = async () => {
      if (cancelled || polling) return;
      polling = true;

      try {
        await enqueue(async () => {
          if (cancelled || !sessionRef.current) return;
          const [remoteResult, drainResult] = await Promise.allSettled([
            request(
              `session?sessionId=${encodeURIComponent(session.sessionId)}`
            ),
            drain(),
          ]);

          // Both operations have finished before releasing the queue.
          if (remoteResult.status === 'rejected') {
            throw remoteResult.reason;
          }

          if (drainResult.status === 'rejected') {
            throw drainResult.reason;
          }

          const remote = remoteResult.value;

          if (cancelled) return;

          setStatus(
            remote.status === 'closed'
              ? 'Disconnected' : remote.status === 'pending'
                ? 'Scan QR to connect' : remote.acceptingScans
                  ? 'Connected' : 'Paused'
          );

          setError('');
        });
      } catch (cause: any) {
        if (!cancelled) { setError(cause.message || 'Scanner connection interrupted.'); }
      } finally {
        polling = false;
      }
    };

    void poll();

    // Short polling also recovers events missed during network interruptions.
    const timer = setInterval(() => void poll(), 1000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [session?.sessionId, enqueue, drain]);

  useEffect(() => {
    const closeOnExit = () => {
      const current = sessionRef.current;
      if (!current) return;

      // Best effort only: browsers cannot guarantee unload requests.
      void fetch(`${API}/session`, {
        method: 'DELETE',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: current.sessionId }),
      }).catch(() => {});
    };

    window.addEventListener('pagehide', closeOnExit);

    return () => {
      window.removeEventListener('pagehide', closeOnExit);
      closeOnExit();
    };
  }, []);

  const sessionExpired = Boolean( session && now >= new Date(session.expiresAt).getTime() );

  const qrExpired = Boolean( session && status === 'Scan QR to connect' && now >= new Date(session.pairingExpiresAt).getTime() );

  const displayStatus =
    sessionExpired
      ? 'Session expired'
      : qrExpired
        ? 'QR expired'
        : error
          ? 'Connection needs attention'
          : status;

  const ready = status === 'Connected' && !sessionExpired && !error;
  const showPairingQr = Boolean(session) && status === 'Scan QR to connect' && !sessionExpired && !qrExpired;
      
  const qrValue = session && typeof window !== 'undefined'
    ? `${window.location.origin}/partners/scanner/connect?flow=walkin&session=${encodeURIComponent(session.sessionId)}&token=${encodeURIComponent(session.token)}`
    : '';

  return (
    <>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <button
          type="button"
          disabled={busy || disabled}
          onClick={() => {
            if (session) setOpen(true);
            else void start();
          }}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm font-semibold text-orange-700 transition hover:bg-orange-100 disabled:opacity-50"
        >
          {busy
            ? <Loader2 size={17} className="animate-spin" />
            : <Smartphone size={17} />}

          <span>{session ? 'Phone scanner' : 'Scan with Phone'}</span>

          {session && (
            <span
              className={`h-2 w-2 rounded-full ${
                ready ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
          )}
        </button>

        {session && (
          <span className="max-w-56 text-right text-[11px] text-slate-500">
            {displayStatus}
            {' · '}
            {activityCounts.added} scan additions
          </span>
        )}

        {!session && error && (
          <p role="alert" className="max-w-64 text-xs text-red-600">
            {error}
          </p>
        )}
      </div>

      {open && !disabled && (
        <div
          className={`pointer-events-none fixed inset-y-3 left-3 right-3 z-[45] flex items-center justify-center sm:inset-y-6 sm:left-6 sm:right-6 ${
            hasCart ? 'lg:right-[384px]' : ''
          }`}
        >
          <section
            role="region"
            aria-labelledby="walkin-scanner-title"
            className="pointer-events-auto flex max-h-full w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="h-1 shrink-0 bg-orange-500" />

            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                  <Smartphone size={23} />
                </span>

                <div>
                  <h2
                    id="walkin-scanner-title"
                    className="text-base font-bold text-slate-900"
                  >
                    Phone scanner
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                     Scan on your phone. Adjust quantities in Current Bill.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Hide scanner panel and keep connection"
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="grid 2xl:grid-cols-[280px_minmax(0,1fr)]">
                <div className="border-b border-slate-100 bg-slate-50/70 p-5 2xl:border-b-0 2xl:border-r">
                  <div
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                      ready
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-amber-200 bg-amber-50 text-amber-800'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        ready ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                    />
                    {displayStatus}
                  </div>

                  {showPairingQr && qrValue ? (
                    <>
                      <div className="mx-auto mt-5 w-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <QRCodeSVG value={qrValue} size={190} level="M" />
                      </div>

                      <p className="mt-3 text-center text-xs text-slate-500">
                        QR expires in{' '}
                        <span className="font-mono font-semibold text-slate-800">
                          {remainingTime(session!.pairingExpiresAt, now)}
                        </span>
                      </p>

                      <ol className="mt-5 space-y-3 text-xs leading-5 text-slate-600">
                        <li>
                          <strong className="text-orange-600">1.</strong>{' '}
                          Open <strong>Aiva-Partners</strong>.
                        </li>
                        <li>
                          <strong className="text-orange-600">2.</strong>{' '}
                          Open <strong>Walk-in Billing → Web Scanner</strong>.
                        </li>
                        <li>
                          <strong className="text-orange-600">3.</strong>{' '}
                          Scan this QR, then scan product barcodes.
                        </li>
                      </ol>
                    </>
                  ) : (
                    <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
                      <Smartphone
                        size={34}
                        className={ready ? 'text-emerald-500' : 'text-orange-400'}
                      />

                      <h3 className="mt-4 text-sm font-bold text-slate-800">
                        {sessionExpired || qrExpired || status === 'Disconnected'
                          ? 'Connect again to continue'
                          : status === 'Paused'
                            ? 'Billing is in progress'
                            : error
                              ? 'Check your connection'
                              : 'Your phone is ready'}
                      </h3>

                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        {sessionExpired || qrExpired || status === 'Disconnected'
                          ? 'Generate a new QR and pair your phone again.'
                          : status === 'Paused'
                            ? 'Finish checkout or close the invoice. Scanning will resume afterwards.'
                            : error
                              ? 'Keep this page open. The scanner will check again automatically.'
                              : 'Scan items on your phone to add them directly to the current bill.'}
                      </p>
                    </div>
                  )}

                  {session && !sessionExpired && (
                    <p className="mt-5 text-xs text-slate-500">
                      Session remaining{' '}
                      <span className="font-mono font-semibold text-slate-800">
                        {remainingTime(session.expiresAt, now)}
                      </span>
                    </p>
                  )}

                  <p className="mt-3 text-[11px] leading-5 text-slate-400">
                    Pairing continues across bills. Hiding this panel keeps
                    the scanner connected.
                  </p>
                </div>

                <div className="min-w-0 p-5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      Scanner activity
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      This pairing session
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {[
                      {
                        label: 'Processed scans',
                        value: activityCounts.processed,
                        style: 'bg-slate-50 text-slate-700',
                      },
                      {
                        label: 'Added to bills',
                        value: activityCounts.added,
                        style: 'bg-emerald-50 text-emerald-700',
                      },
                      {
                        label: 'Not found',
                        value: activityCounts.notFound,
                        style: 'bg-amber-50 text-amber-800',
                      },
                      {
                        label: 'Other issues',
                        value: activityCounts.attention,
                        style: 'bg-red-50 text-red-700',
                      },
                    ].map(stat => (
                      <div
                        key={stat.label}
                        className={`rounded-xl p-3 ${stat.style}`}
                      >
                        <p className="text-2xl font-bold tabular-nums">
                          {stat.value}
                        </p>
                        <p className="mt-1 text-[11px] font-medium">
                          {stat.label}
                        </p>
                      </div>
                    ))}
                  </div>

                  <p className="mt-3 text-[11px] leading-5 text-slate-500">
                    Each successful scan adds one unit. These totals span
                    bills and do not represent your current cart.
                  </p>

                  {error && (
                    <p
                      role="alert"
                      className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-700"
                    >
                      {error}
                    </p>
                  )}

                  {message && (
                    <p
                      role="status"
                      className="mt-4 rounded-xl border border-orange-100 bg-orange-50/60 p-3 text-xs font-medium leading-5 text-slate-700"
                    >
                      {message}
                    </p>
                  )}

                  <div className="mt-5 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">
                      Grouped scan results
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      Latest 20 groups
                    </span>
                  </div>

                  {recentActivity.length === 0 ? (
                    <div className="mt-3 rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center">
                      <p className="text-sm font-medium text-slate-600">
                        No completed scans yet
                      </p>
                      <p className="mt-2 text-xs leading-5 text-slate-400">
                        Product results will appear here after scanning.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-3 divide-y divide-slate-100">
                      {recentActivity.map(item => (
                        <div key={`${item.barcode}:${item.status}`} className="py-3">
                          <div className="flex items-start gap-3">
                            <span
                              className={`shrink-0 rounded-lg px-2 py-1 text-[10px] font-semibold ${
                                item.status === 'added'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-amber-50 text-amber-800'
                              }`}
                            >
                              {item.status === 'added'
                                ? `${item.scanCount} successful scan${item.scanCount === 1 ? '' : 's'}`
                                : `${RESULT_LABELS[item.status]} · ${item.scanCount}`}
                            </span>

                            <div className="min-w-0">
                              <p className="break-words text-xs font-medium leading-5 text-slate-700">
                                {item.message}
                              </p>
                              <p className="mt-1 break-all font-mono text-[11px] text-slate-400">
                                {item.barcode}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-white px-5 py-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={busy || disabled}
                  onClick={() => void start()}
                  className="min-h-10 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  New QR
                </button>

                <button
                  type="button"
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true);

                    try {
                      await disconnect();
                    } catch (cause: any) {
                      setError(cause.message || 'Disconnect failed. Retry.');
                    } finally {
                      setBusy(false);
                    }
                  }}
                  className="min-h-10 rounded-xl border border-red-200 px-3 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {busy ? 'Please wait…' : 'Disconnect'}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="min-h-10 rounded-xl bg-orange-500 px-4 text-xs font-semibold text-white hover:bg-orange-600"
              >
                Hide · Continue Billing
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
});

export default WalkinPhoneScannerPairing;