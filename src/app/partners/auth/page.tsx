// File: src/app/partners/auth/page.tsx
'use client'

import { createClient } from '@/lib/supabase/supabaseClient'
import { useRouter, useSearchParams } from 'next/navigation' 
import Image from 'next/image'
import { UserRoundX } from 'lucide-react'
import { useEffect, useState, Suspense } from 'react'

function AuthContent() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showDeniedModal, setShowDeniedModal] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const searchParams = useSearchParams()

  useEffect(() => {
    const denied = searchParams.get('denied') === 'true';
    const emailParam = searchParams.get('email');
    
    if (denied) {
      setShowDeniedModal(true);
      if (emailParam) setEmail(emailParam);
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setShowDeniedModal(false)

    // 1. Pre-flight Check: Call our internal API to check if email is a partner
    try {
      const response = await fetch('/api/partners/check-partner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const result = await response.json()

      if (!result.isPartner) {
        setLoading(false)
        setShowDeniedModal(true)
        return
      }
    } catch (err) {
      console.error("Check partner error:", err)
      setLoading(false)
      setMessage("Verification failed. Please try again.")
      return
    }

    // 2. Only if they are a partner, send the OTP
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/partners/dashboard`,
      }
    })

    setLoading(false)

    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      router.push(`/partners/verify-otp?email=${encodeURIComponent(email)}`)
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
      <form onSubmit={handleLogin} className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-2xl w-full max-w-sm space-y-6 border border-white">
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
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Partner Dashboard</h1>
          <p className="text-gray-500 mt-2">Enter your email to manage your store</p>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Business Email</label>
          <input
            type="email"
            placeholder="store-owner@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3.5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#FF8500] focus:border-transparent outline-none bg-gray-50/50 transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#FF8500] text-white py-3 rounded-xl font-semibold hover:bg-[#e67700] transition-colors disabled:opacity-50"
        >
          {loading ? 'Sending OTP...' : 'Get OTP'}
        </button>

        {message && <p className="text-sm text-center text-red-500">{message}</p>}
      </form>
      {/* Access Denied Modal */}
        {showDeniedModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserRoundX className="text-white" size={30} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Store Not Found</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                It looks like <span className="font-semibold text-gray-800">{email}</span> isn't registered as a partner yet. We'd love to have your store on board!
              </p>
              <div className="space-y-3">
                <button 
                  onClick={() => window.location.href = 'mailto:info@thegoaiva.com'}
                  className="w-full bg-[#FF8500] text-white py-3 rounded-xl font-bold hover:bg-[#e67700] transition-all"
                >
                  Contact Support
                </button>
                <button 
                  onClick={() => setShowDeniedModal(false)}
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                >
                  Try another email
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  )
}
export default function PartnerAuthPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthContent />
    </Suspense>
  )
}