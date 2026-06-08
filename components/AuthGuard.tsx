"use client"

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore, isProfileComplete } from '@/lib/store/authStore'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, setAuth } = useAuthStore()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.replace('/login')
      return
    }

    let loadedUser = user
    try {
      const raw = localStorage.getItem('user')
      if (raw) {
        const parsed = JSON.parse(raw)
        setAuth(parsed, token)
        loadedUser = parsed
      }
    } catch {}

    // Profile completion gate — skip when already on /profile
    if (pathname !== '/profile' && !isProfileComplete(loadedUser)) {
      // Fetch fresh profile from server to ensure accuracy
      fetch('/api/user/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.ok ? r.json() : null)
        .then(profile => {
          if (profile) {
            // Merge server data into stored user
            const merged = { ...(loadedUser ?? {}), ...profile }
            setAuth(merged, token)
            if (!isProfileComplete(merged)) {
              router.replace('/profile')
              return
            }
          } else if (!isProfileComplete(loadedUser)) {
            router.replace('/profile')
            return
          }
          setChecking(false)
        })
        .catch(() => {
          // If network error, fall back to locally stored data
          if (!isProfileComplete(loadedUser)) {
            router.replace('/profile')
            return
          }
          setChecking(false)
        })
    } else {
      setChecking(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
