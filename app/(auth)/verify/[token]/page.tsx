"use client"

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { verifyEmail } from '@/lib/api'

export default function VerifyPage() {
  const params = useParams()
  const router = useRouter()
  const token = Array.isArray(params.token) ? params.token[0] : (params.token ?? '')
  const [msg, setMsg] = useState('Verifying your email…')

  useEffect(() => {
    if (!token) return
    verifyEmail(token).then(data => {
      const d = data as any
      setMsg(d.message ?? 'Verification complete')
      if (d.success) setTimeout(() => router.push('/login'), 1500)
    }).catch(() => setMsg('Verification failed. Link may have expired.'))
  }, [token])

  return (
    <div className="synapto-card p-8 text-center">
      <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#00e5ff]/10 text-lg font-black text-[#00e5ff]">S</div>
      <p className="text-sm text-white">{msg}</p>
    </div>
  )
}
