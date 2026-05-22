"use client"

import { useEffect, useState } from 'react'
import { getUserMe, updateUserProfile } from '@/lib/api'
import { useAuthStore } from '@/lib/store/authStore'
import { User, Save, Zap, Bell, Shield } from 'lucide-react'

interface Profile { name: string; email: string; college: string; branch: string; year: string; section: string; isCR: boolean; phone: string }

const YEARS = ['1', '2', '3', '4']
const BRANCHES = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil']

export default function ProfilePage() {
  const { user, setAuth, token } = useAuthStore()
  const [form, setForm] = useState<Profile>({ name: '', email: '', college: '', branch: '', year: '', section: '', isCR: false, phone: '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getUserMe().then(p => {
      const profile = p as Profile
      setForm({
        name: profile.name ?? user?.name ?? '',
        email: profile.email ?? user?.email ?? '',
        college: profile.college ?? '',
        branch: profile.branch ?? 'Computer Science',
        year: profile.year ?? '2',
        section: profile.section ?? 'A',
        isCR: profile.isCR ?? false,
        phone: profile.phone ?? '',
      })
    })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateUserProfile({ ...form, year: form.year ? Number(form.year) : undefined })
      setAuth({ ...(user ?? {}), name: form.name, branch: form.branch, year: form.year, isCR: form.isCR } as any, token ?? '')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false) }
  }

  const initials = form.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'SY'

  return (
    <div className="min-h-full bg-[#0a0a0f] p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#00e5ff]/10 text-xl font-black text-[#00e5ff]">
          {initials}
        </div>
        <div>
          <p className="label-upper">User Profile</p>
          <h1 className="text-xl font-black uppercase text-white">{form.name || 'Your Profile'}</h1>
          <p className="text-xs text-[#6b7280]">{form.isCR ? '⭐ Class Representative' : form.branch || 'Student'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Profile form */}
        <div className="synapto-card p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <User size={14} className="text-[#00e5ff]" />
            <p className="label-upper">Personal Info</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Alex Kumar' },
              { key: 'email', label: 'Email', type: 'email', placeholder: 'alex@college.edu' },
              { key: 'college', label: 'College', type: 'text', placeholder: 'BITS Pilani' },
              { key: 'section', label: 'Section', type: 'text', placeholder: 'A' },
              { key: 'phone', label: 'Phone (for WhatsApp alerts)', type: 'text', placeholder: '+91 9876543210' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key} className={key === 'phone' ? 'sm:col-span-2' : ''}>
                <label className="block text-[10px] uppercase tracking-widest text-[#6b7280] mb-1">{label}</label>
                <input
                  type={type}
                  value={(form as any)[key]}
                  onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full rounded-lg border border-white/[0.07] bg-[#0a0a0f] px-3 py-2 text-xs text-white placeholder:text-[#6b7280] outline-none focus:border-[#00e5ff]/40"
                />
              </div>
            ))}

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#6b7280] mb-1">Branch</label>
              <select
                value={form.branch}
                onChange={e => setForm(p => ({ ...p, branch: e.target.value }))}
                className="w-full rounded-lg border border-white/[0.07] bg-[#0a0a0f] px-3 py-2 text-xs text-white outline-none focus:border-[#00e5ff]/40"
              >
                {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#6b7280] mb-1">Year</label>
              <select
                value={form.year}
                onChange={e => setForm(p => ({ ...p, year: e.target.value }))}
                className="w-full rounded-lg border border-white/[0.07] bg-[#0a0a0f] px-3 py-2 text-xs text-white outline-none focus:border-[#00e5ff]/40"
              >
                {YEARS.map(y => <option key={y} value={y}>Year {y}</option>)}
              </select>
            </div>

            <div className="sm:col-span-2 flex items-center gap-3 rounded-lg border border-white/[0.07] px-4 py-3">
              <input
                type="checkbox"
                id="isCR"
                checked={form.isCR}
                onChange={e => setForm(p => ({ ...p, isCR: e.target.checked }))}
                className="accent-[#00e5ff]"
              />
              <label htmlFor="isCR" className="text-xs text-white cursor-pointer">I am the Class Representative (CR)</label>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-4 flex items-center gap-2 rounded-lg bg-[#00e5ff] px-6 py-2.5 text-[11px] font-black uppercase tracking-widest text-black transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Save size={13} />
            {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Profile'}
          </button>
          {saved && <p className="mt-2 text-xs text-[#22c55e]">Profile updated successfully</p>}
        </div>

        {/* Side cards */}
        <div className="space-y-4">
          {/* Upgrade */}
          <div className="synapto-card p-4 border-[#a855f7]/20">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={14} className="text-[#a855f7]" />
              <p className="text-xs font-black text-[#a855f7] uppercase tracking-widest">Pro Plan</p>
            </div>
            <p className="text-[10px] text-[#6b7280] mb-3">
              Unlimited AI sessions, video transcription, priority processing, advanced analytics
            </p>
            <button className="w-full rounded-lg bg-[#a855f7] py-2 text-[10px] font-black uppercase tracking-widest text-white hover:opacity-90 transition-opacity">
              Upgrade to Pro
            </button>
          </div>

          {/* Notifications */}
          <div className="synapto-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Bell size={14} className="text-[#00e5ff]" />
              <p className="label-upper">Notifications</p>
            </div>
            {[
              { label: 'Attendance alerts (WhatsApp)', key: 'att' },
              { label: 'Deadline reminders', key: 'dl' },
              { label: 'Study pack ready', key: 'sp' },
              { label: 'Mass bunk polls', key: 'mb' },
            ].map(({ label, key }) => (
              <div key={key} className="flex items-center justify-between py-1.5">
                <span className="text-xs text-[#6b7280]">{label}</span>
                <div className="h-4 w-7 rounded-full bg-[#00e5ff]/20 relative cursor-pointer">
                  <div className="absolute right-0.5 top-0.5 h-3 w-3 rounded-full bg-[#00e5ff]" />
                </div>
              </div>
            ))}
          </div>

          {/* Security */}
          <div className="synapto-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield size={14} className="text-[#22c55e]" />
              <p className="label-upper">Security</p>
            </div>
            <button className="w-full rounded-lg border border-white/[0.07] py-2 text-xs text-[#6b7280] hover:border-white/20 hover:text-white transition-colors mb-2">
              Change Password
            </button>
            <button className="w-full rounded-lg border border-white/[0.07] py-2 text-xs text-[#6b7280] hover:border-white/20 hover:text-white transition-colors">
              Setup Passkey
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
