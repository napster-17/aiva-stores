// File: src/app/partners/verify-otp/page.tsx
'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/supabaseClient'
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
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
      <form onSubmit={handleVerify} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Verify OTP</h1>
          <p className="text-gray-500 mt-2">Sent to {email}</p>
        </div>

        <input
          type="text"
          placeholder="6-digit code"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded-xl text-center text-2xl tracking-widest focus:ring-2 focus:ring-[#FF8500] outline-none"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {loading ? 'Verifying...' : 'Login'}
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