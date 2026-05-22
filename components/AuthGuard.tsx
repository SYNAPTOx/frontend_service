"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/authStore'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.replace('/login')
      return
    }
    try {
      const raw = localStorage.getItem('user')
      if (raw) {
        const user = JSON.parse(raw)
        setAuth(user, token)
      }
    } catch {}
    setChecking(false)
  }, [router, setAuth])

  if (checking) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0a0a0f]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00e5ff]/20 border-t-[#00e5ff]" />
          <p className="label-upper">Loading Synapto</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
