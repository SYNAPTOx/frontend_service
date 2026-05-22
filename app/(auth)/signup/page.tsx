"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signupUser, googleLogin } from '@/lib/api'
import { useAuthStore } from '@/lib/store/authStore'
import { GoogleLogin } from '@react-oauth/google'

const inputCls = "w-full rounded-lg border border-white/[0.07] bg-[#0a0a0f] px-3 py-2.5 text-sm text-white placeholder:text-[#6b7280] outline-none focus:border-[#00e5ff]/40 transition-colors"

export default function SignupPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [form, setForm] = useState({ name: '', email: '', password: '', college: '', branch: '', year: '', section: '' })
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSignup = async () => {
    if (!form.name || !form.email || !form.password) { setMsg('Please fill in required fields'); return }
    setLoading(true)
    setMsg('')
    try {
      const data = await signupUser({ ...form, year: Number(form.year) }) as any
      if (data.token) {
        setAuth(data.user, data.token)
        router.push('/dashboard')
      } else {
        setMsg(data.message ?? 'Account created! Check your email to verify.')
      }
    } catch {
      setMsg('Signup failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="synapto-card p-8">
      {/* Logo */}
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#00e5ff]/10 text-lg font-black text-[#00e5ff]">S</div>
        <h1 className="text-lg font-black uppercase tracking-widest text-[#00e5ff]">SYNAPTO</h1>
        <p className="mt-0.5 text-xl font-black uppercase text-white">Create Account</p>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input name="name" placeholder="Full Name *" value={form.name} onChange={handleChange} className={inputCls} />
          <input name="email" type="email" placeholder="Email *" value={form.email} onChange={handleChange} className={inputCls} />
        </div>
        <input name="password" type="password" placeholder="Password *" value={form.password} onChange={handleChange} className={inputCls} />
        <input name="college" placeholder="College" value={form.college} onChange={handleChange} className={inputCls} />
        <div className="grid grid-cols-3 gap-3">
          <input name="branch" placeholder="Branch (CS)" value={form.branch} onChange={handleChange} className={inputCls} />
          <input name="year" placeholder="Year (2)" value={form.year} onChange={handleChange} className={inputCls} />
          <input name="section" placeholder="Section (A)" value={form.section} onChange={handleChange} className={inputCls} />
        </div>

        {msg && (
          <p className={`text-xs ${msg.toLowerCase().includes('failed') || msg.toLowerCase().includes('error') ? 'text-[#ef4444]' : 'text-[#22c55e]'}`}>
            {msg}
          </p>
        )}

        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full rounded-lg bg-[#00e5ff] py-2.5 text-sm font-black uppercase tracking-widest text-black transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Creating account…' : 'Sign Up'}
        </button>

        <p className="text-center text-xs text-[#6b7280]">
          Already have an account?{' '}
          <Link href="/login" className="text-[#00e5ff] hover:underline">Login</Link>
        </p>

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
            onError={() => setMsg('Google login failed')}
            theme="filled_black"
            shape="rectangular"
            size="large"
            width="100%"
          />
        </div>
      </div>
    </div>
  )
}
