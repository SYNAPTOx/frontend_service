"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { loginUser, googleLogin } from '@/lib/api'
import { useAuthStore } from '@/lib/store/authStore'
import { GoogleLogin } from '@react-oauth/google'
import { Eye, EyeOff, Zap } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    if (!email || !password) { setError('Please fill in all fields'); return }
    setLoading(true)
    setError('')
    try {
      const data = await loginUser(email, password) as any
      if (data.token) {
        setAuth(data.user, data.token)
        router.push('/dashboard')
      } else {
        setError(data.message ?? 'Login failed')
      }
    } catch {
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="synapto-card p-8">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#00e5ff]/10 text-lg font-black text-[#00e5ff]">S</div>
        <h1 className="text-lg font-black uppercase tracking-widest text-[#00e5ff]">SYNAPTO</h1>
        <p className="mt-1 text-xs text-[#6b7280]">AI Study Platform</p>
      </div>

      <div className="mb-6">
        <p className="text-xl font-black uppercase text-white">Welcome Back</p>
        <p className="text-xs text-[#6b7280] mt-0.5">Sign in to your account</p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-[#6b7280] mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="alex@college.edu"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="w-full rounded-lg border border-white/[0.07] bg-[#0a0a0f] px-3 py-2.5 text-sm text-white placeholder:text-[#6b7280] outline-none focus:border-[#00e5ff]/40 transition-colors"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-widest text-[#6b7280] mb-1">Password</label>
          <div className="relative">
            <input
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="w-full rounded-lg border border-white/[0.07] bg-[#0a0a0f] px-3 py-2.5 pr-10 text-sm text-white placeholder:text-[#6b7280] outline-none focus:border-[#00e5ff]/40 transition-colors"
            />
            <button
              onClick={() => setShowPwd(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-white transition-colors"
            >
              {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-xs text-[#ef4444]">{error}</p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full rounded-lg bg-[#00e5ff] py-2.5 text-sm font-black uppercase tracking-widest text-black transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Signing in…' : 'Login'}
        </button>

        <div className="flex items-center justify-between text-xs text-[#6b7280]">
          <Link href="/forgot-password" className="hover:text-white transition-colors">Forgot password?</Link>
          <Link href="/signup" className="hover:text-white transition-colors">Create account →</Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-white/[0.07]" />
          <span className="text-[10px] uppercase tracking-widest text-[#6b7280]">or</span>
          <div className="h-px flex-1 bg-white/[0.07]" />
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={async res => {
              const data = await googleLogin(res.credential!) as any
              if (data.token) {
                setAuth(data.user, data.token)
                router.push('/dashboard')
              }
            }}
            onError={() => setError('Google login failed')}
            theme="filled_black"
            shape="rectangular"
            size="large"
            width="100%"
          />
        </div>
      </div>

      <p className="mt-6 text-center text-[10px] text-[#6b7280]">
        Powered by Synapto V2
      </p>
    </div>
  )
}
