"use client"

import { useState } from 'react'
import Link from 'next/link'
import { forgotPassword } from '@/lib/api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = async () => {
    if (!email) return
    setLoading(true)
    const data = await forgotPassword(email) as any
    setMsg(data.message ?? 'Check your email for the reset link')
    setLoading(false)
  }

  return (
    <div className="synapto-card p-8">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#00e5ff]/10 text-lg font-black text-[#00e5ff]">S</div>
        <h1 className="text-xl font-black uppercase text-white">Forgot Password</h1>
        <p className="mt-1 text-xs text-[#6b7280]">We'll send a reset OTP to your email</p>
      </div>

      <div className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full rounded-lg border border-white/[0.07] bg-[#0a0a0f] px-3 py-2.5 text-sm text-white placeholder:text-[#6b7280] outline-none focus:border-[#00e5ff]/40"
        />

        {msg && <p className="text-xs text-[#22c55e]">{msg}</p>}

        <button
          onClick={handle}
          disabled={loading}
          className="w-full rounded-lg bg-[#00e5ff] py-2.5 text-sm font-black uppercase tracking-widest text-black transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Sending…' : 'Send Reset Link'}
        </button>

        <Link href="/login" className="block text-center text-xs text-[#6b7280] hover:text-white transition-colors">← Back to Login</Link>
      </div>
    </div>
  )
}
