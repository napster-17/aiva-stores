// File: src/app/partners/verify-otp/page.tsx
'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/supabaseClient'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'

function VerifyOTPContent() {
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const router = useRouter()
  const supabase = createClient()

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    if (!email) return

    const { data: { session }, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'magiclink',
    })

    if (error || !session) {
      setErrorMsg(error?.message || 'Invalid OTP')
      setLoading(false)
      return
    }

    // FINAL ROLE CHECK: Security fallback
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_role')
      .eq('id', session.user.id)
      .single()

    if (profile?.user_role === 'partner') {
      router.push('/partners/dashboard')
    } else {
      await supabase.auth.signOut()
      // Redirect back to auth with a flag and the email to show in the modal
      router.push(`/partners/auth?denied=true&email=${encodeURIComponent(email || '')}`)
    }
  }

  return (
    <div 
      className="flex justify-center items-center min-h-screen px-4"
      style={{ 
        backgroundImage: "url('/assets/Aiva-Auth-Bg.png')",
        backgroundRepeat: 'repeat',
        backgroundSize: 'auto' 
      }}
    >
      <form onSubmit={handleVerify} className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-2xl w-full max-w-sm space-y-8 border border-white">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Image 
              src="/assets/logo.png" 
              alt="Aiva Logo" 
              width={60} 
              height={60} 
              className="rounded-xl shadow-sm"
            />
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Security Check</h1>
          <p className="text-gray-500 mt-2 text-sm italic">Sent to {email}</p>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] block text-center">Verification Code</label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="······"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            required
            autoFocus
            className="w-full p-4 border border-gray-200 rounded-2xl text-center text-2xl tracking-[0.5em] font-medium text-slate-700 focus:ring-2 focus:ring-[#FF8500] focus:border-transparent outline-none bg-gray-50/30 transition-all placeholder:text-gray-300 shadow-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading || otp.length < 6}
          className="w-full bg-[#FF8500] text-white py-4 rounded-2xl font-bold shadow-lg shadow-orange-200 hover:bg-[#e67700] transition-all disabled:opacity-50 disabled:grayscale"
        >
          {loading ? 'Checking OTP...' : 'Confirm & Login'}
        </button>

        {errorMsg && <p className="text-sm text-center text-red-500 font-medium">{errorMsg}</p>}
      </form>
    </div>
  )
}

export default function PartnerVerifyOTPPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyOTPContent />
    </Suspense>
  )
}