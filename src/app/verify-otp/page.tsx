// src/app/verify-otp/page.tsx

'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/supabaseClient'
import { Input } from '@/components/input'
import { Button } from '@/components/button'
import { toast } from 'sonner'

function OtpForm() {
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const supabase = createClient()

  const handleVerify = async () => {
    if (!email || !otp) {
      toast.error('Missing email or OTP')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    })

    setLoading(false)

    if (error) {
      toast.error('Invalid OTP')
      console.error(error)
    } else {
      toast.success('Logged in successfully')
      router.push('/admin/global-products')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
      <h1 className="text-2xl font-semibold">Enter OTP sent to {email}</h1>
      <Input
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        className="max-w-sm"
      />
      <Button onClick={handleVerify} disabled={loading}>
        {loading ? 'Verifying...' : 'Verify OTP'}
      </Button>
    </div>
  )
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OtpForm />
    </Suspense>
  )
}
