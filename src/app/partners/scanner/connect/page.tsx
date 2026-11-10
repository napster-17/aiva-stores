//src/app/partners/scanner/connect/page.tsx
'use client';

import React from 'react';
import { LockKeyhole, ScanBarcode, ShieldCheck, Smartphone } from 'lucide-react';

export default function ScannerConnectPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-x-hidden bg-[#F8FAFC] px-5 py-10">
      <div aria-hidden="true" className="pointer-events-none absolute -top-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-orange-100/60 blur-3xl" />
      <div className="relative w-full max-w-[420px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_70px_-35px_rgba(15,23,42,0.28)]">
        <div className="h-1.5 bg-gradient-to-r from-orange-400 via-orange-500 to-amber-400" />
        <div className="px-7 pb-8 pt-9 text-center sm:px-9">
          <div className="relative mx-auto mb-6 flex h-[76px] w-[76px] items-center justify-center rounded-3xl border border-orange-100 bg-orange-50 text-orange-600">
            <Smartphone size={34} strokeWidth={1.7} />
            <span className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-white ring-4 ring-white"><ScanBarcode size={19} /></span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-orange-600">Aiva Partners · Secure pairing</span>
          <h1 className="mt-4 text-[23px] font-extrabold tracking-tight text-slate-900">Connect your phone scanner</h1>
          <p className="mx-auto mt-3 max-w-[310px] text-sm leading-6 text-slate-500">This pairing code is designed to be scanned inside the Aiva-Partners mobile app.</p>
          <div className="mt-7 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-left">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">How to connect</p>
            <div className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-bold text-orange-600 ring-1 ring-slate-200">1</span>
              <p className="pt-1 text-xs leading-5 text-slate-600">Open the <span className="font-semibold text-slate-800">Aiva-Partners</span> app on your phone.</p>
            </div>
            <div className="my-3 ml-3.5 h-3 border-l border-dashed border-slate-300" />
            <div className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-bold text-orange-600 ring-1 ring-slate-200">2</span>
              <p className="pt-1 text-xs leading-5 text-slate-600">Select <span className="font-semibold text-slate-800">Scan to Web Dashboard</span> and scan the QR shown on your dashboard.</p>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-center gap-2 text-[11px] font-medium text-slate-400"><ShieldCheck size={15} className="text-emerald-600" /> Store-specific pairing <span className="text-slate-300">·</span> <LockKeyhole size={13} /> Secure connection</div>
        </div>
      </div>
    </main>
  );
}