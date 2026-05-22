"use client"

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { resetPassword } from '@/lib/api'

export default function ResetPasswordPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const handleReset = async () => {
    if (!password) { setMsg('Enter a new password'); return }
    setLoading(true)
    try {
      const data = await resetPassword(token, password) as any
      setMsg(data.message ?? 'Password reset successfully')
      if (data.message?.toLowerCase().includes('success')) {
        setTimeout(() => router.push('/login'), 1500)
      }
    } catch {
      setMsg('Reset failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="synapto-card p-8">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#00e5ff]/10 text-lg font-black text-[#00e5ff]">S</div>
        <h1 className="text-xl font-black uppercase text-white">Reset Password</h1>
      </div>
      <div className="space-y-3">
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="New password"
          className="w-full rounded-lg border border-white/[0.07] bg-[#0a0a0f] px-3 py-2.5 text-sm text-white placeholder:text-[#6b7280] outline-none focus:border-[#00e5ff]/40"
        />
        {msg && <p className="text-xs text-[#22c55e]">{msg}</p>}
        <button
          onClick={handleReset}
          disabled={loading}
          className="w-full rounded-lg bg-[#00e5ff] py-2.5 text-sm font-black uppercase tracking-widest text-black transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Resetting…' : 'Reset Password'}
        </button>
      </div>
    </div>
  )
}
