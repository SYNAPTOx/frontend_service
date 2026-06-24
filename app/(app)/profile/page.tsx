"use client"

import { useEffect, useState } from 'react'
import { getUserMe, updateUserProfile, getSettings, updateSettings, sendCollegeEmailOtp, confirmCollegeEmailOtp } from '@/lib/api'
import { useAuthStore } from '@/lib/store/authStore'
import { User, Save, Bell, Shield, CheckCircle, Mail } from 'lucide-react'
import { COLLEGES, BRANCHES, YEARS } from '@/lib/constants/education'

interface Profile { name: string; email: string; college: string; branch: string; year: string; semester: string; section: string; isCR: boolean; phone: string; collegeEmail: string; collegeEmailVerified: boolean }
interface NotifSettings {
  deadlineNotifications: boolean
  studyPackNotifications: boolean
  attendanceNotifications: boolean
}

const SEMESTERS = ['1', '2', '3', '4', '5', '6', '7', '8']

export default function ProfilePage() {
  const { user, setAuth, token } = useAuthStore()
  const [form, setForm] = useState<Profile>({ name: '', email: '', college: '', branch: '', year: '', semester: '', section: '', isCR: false, phone: '', collegeEmail: '', collegeEmailVerified: false })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [notif, setNotif] = useState<NotifSettings>({ deadlineNotifications: true, studyPackNotifications: true, attendanceNotifications: true })
  const [collegeOtpSent, setCollegeOtpSent] = useState(false)
  const [collegeOtp, setCollegeOtp] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpMsg, setOtpMsg] = useState('')

  useEffect(() => {
    getSettings().then((s: any) => {
      if (s) setNotif({
        deadlineNotifications:  s.deadlineNotifications  ?? true,
        studyPackNotifications: s.studyPackNotifications ?? true,
        attendanceNotifications: s.attendanceNotifications ?? true,
      })
    }).catch(() => {})
    getUserMe().then(p => {
      const profile = (p ?? {}) as any
      // Defaults are BLANK (never 'Alex Kumar'/'Computer Science'/etc.) so an
      // unset profile shows placeholders, and a non-destructive save (below)
      // can't overwrite real data with guessed defaults.
      setForm({
        name: profile.name ?? '',
        email: profile.email ?? user?.email ?? '',
        college: profile.college ?? '',
        branch: profile.branch ?? '',
        year: profile.year != null ? String(profile.year) : '',
        semester: profile.semester != null ? String(profile.semester) : '',
        section: profile.section ?? '',
        isCR: profile.isCR ?? false,
        phone: profile.phone ?? '',
        collegeEmail: profile.collegeEmail ?? '',
        collegeEmailVerified: profile.collegeEmailVerified ?? false,
      })
      setLoaded(true)
    }).catch(() => {
      // Could not load the profile — do NOT present an empty editable form that
      // a Save would wipe. Show an error and keep Save disabled.
      setLoadError(true)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    // Never save before the profile has loaded — otherwise a blank form would
    // overwrite real data.
    if (!loaded) return
    setSaving(true)
    try {
      // Non-destructive: only send fields the user actually has a value for, so
      // an empty field can never wipe existing server data.
      const payload: Record<string, unknown> = {}
      if (form.name.trim()) payload.name = form.name.trim()
      if (form.college.trim()) payload.college = form.college.trim()
      if (form.branch.trim()) payload.branch = form.branch.trim()
      if (form.phone.trim()) payload.phone = form.phone.trim()
      if (form.section.trim()) payload.section = form.section.trim().toUpperCase()
      if (form.year) payload.year = Number(form.year)
      if (form.semester) payload.semester = Number(form.semester)

      await updateUserProfile(payload as Parameters<typeof updateUserProfile>[0])
      setAuth({
        ...(user ?? {}),
        ...(form.name.trim() ? { name: form.name.trim() } : {}),
        college: form.college,
        branch: form.branch,
        year: form.year ? Number(form.year) : undefined,
        semester: form.semester ? Number(form.semester) : undefined,
        section: form.section,
        isCR: form.isCR,
      } as any, token ?? '')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  const handleSendOtp = async () => {
    if (!form.collegeEmail) return
    setOtpLoading(true); setOtpMsg('')
    try {
      await sendCollegeEmailOtp(form.collegeEmail)
      setCollegeOtpSent(true)
      setOtpMsg('OTP sent to ' + form.collegeEmail)
    } catch {
      setOtpMsg('Failed to send OTP')
    } finally { setOtpLoading(false) }
  }

  const handleVerifyOtp = async () => {
    if (!collegeOtp) return
    setOtpLoading(true); setOtpMsg('')
    try {
      await confirmCollegeEmailOtp(collegeOtp)
      setForm(p => ({ ...p, collegeEmailVerified: true }))
      setCollegeOtpSent(false)
      setCollegeOtp('')
      setOtpMsg('College email verified!')
    } catch {
      setOtpMsg('Invalid or expired OTP')
    } finally { setOtpLoading(false) }
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
          <p className="text-xs text-[#6b7280]">{form.branch || 'Student'} · {form.college || 'Complete your profile'}</p>
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
              { key: 'email', label: 'Email', type: 'email', placeholder: 'alex@gmail.com', disabled: true },
              { key: 'phone', label: 'Phone', type: 'text', placeholder: '+91 9876543210' },
            ].map(({ key, label, type, placeholder, disabled }) => (
              <div key={key} className={key === 'phone' ? 'sm:col-span-2' : ''}>
                <label className="block text-[10px] uppercase tracking-widest text-[#6b7280] mb-1">{label}</label>
                <input
                  type={type}
                  value={(form as any)[key]}
                  onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder}
                  disabled={disabled}
                  className="w-full rounded-lg border border-white/[0.07] bg-[#0a0a0f] px-3 py-2 text-xs text-white placeholder:text-[#6b7280] outline-none focus:border-[#00e5ff]/40 disabled:opacity-50"
                />
              </div>
            ))}

            <div className="sm:col-span-2">
              <label className="block text-[10px] uppercase tracking-widest text-[#6b7280] mb-1">College</label>
              <select value={form.college} onChange={e => setForm(p => ({ ...p, college: e.target.value }))}
                className="w-full rounded-lg border border-white/[0.07] bg-[#0a0a0f] px-3 py-2 text-xs text-white outline-none focus:border-[#00e5ff]/40">
                <option value="">Select your college…</option>
                {COLLEGES.map(g => (
                  <optgroup key={g.group} label={g.group}>
                    {g.options.map(c => <option key={c} value={c}>{c}</option>)}
                  </optgroup>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#6b7280] mb-1">Branch</label>
              <select value={form.branch} onChange={e => setForm(p => ({ ...p, branch: e.target.value }))}
                className="w-full rounded-lg border border-white/[0.07] bg-[#0a0a0f] px-3 py-2 text-xs text-white outline-none focus:border-[#00e5ff]/40">
                <option value="">Select your branch…</option>
                {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#6b7280] mb-1">Year</label>
              <select value={form.year} onChange={e => setForm(p => ({ ...p, year: e.target.value }))}
                className="w-full rounded-lg border border-white/[0.07] bg-[#0a0a0f] px-3 py-2 text-xs text-white outline-none focus:border-[#00e5ff]/40">
                <option value="">Year</option>
                {YEARS.map(y => <option key={y} value={y}>Year {y}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#6b7280] mb-1">Semester</label>
              <select value={form.semester} onChange={e => setForm(p => ({ ...p, semester: e.target.value }))}
                className="w-full rounded-lg border border-white/[0.07] bg-[#0a0a0f] px-3 py-2 text-xs text-white outline-none focus:border-[#00e5ff]/40">
                <option value="">Semester</option>
                {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#6b7280] mb-1">Section</label>
              <input
                type="text"
                value={form.section}
                onChange={e => setForm(p => ({ ...p, section: e.target.value.toUpperCase() }))}
                placeholder="A"
                maxLength={5}
                className="w-full rounded-lg border border-white/[0.07] bg-[#0a0a0f] px-3 py-2 text-xs text-white placeholder:text-[#6b7280] outline-none focus:border-[#00e5ff]/40"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !loaded}
            className="mt-4 flex items-center gap-2 rounded-lg bg-[#00e5ff] px-6 py-2.5 text-[11px] font-black uppercase tracking-widest text-black transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Save size={13} />
            {saving ? 'Saving…' : saved ? 'Saved!' : !loaded ? 'Loading…' : 'Save Profile'}
          </button>
          {saved && <p className="mt-2 text-xs text-[#22c55e]">Profile updated successfully</p>}
          {loadError && <p className="mt-2 text-xs text-[#ef4444]">Couldn&apos;t load your profile. Refresh the page before editing — saving now is disabled to avoid overwriting your data.</p>}
        </div>

        {/* Side cards */}
        <div className="space-y-4">
          {/* College Email Verification */}
          <div className="synapto-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Mail size={14} className="text-[#00e5ff]" />
              <p className="label-upper">College Email</p>
              {form.collegeEmailVerified && <CheckCircle size={12} className="text-[#22c55e] ml-auto" />}
            </div>
            {form.collegeEmailVerified ? (
              <p className="text-xs text-[#22c55e]">{form.collegeEmail} verified</p>
            ) : (
              <div className="space-y-2">
                <input
                  type="email"
                  placeholder="student@college.edu"
                  value={form.collegeEmail}
                  onChange={e => setForm(p => ({ ...p, collegeEmail: e.target.value }))}
                  className="w-full rounded-lg border border-white/[0.07] bg-[#0a0a0f] px-3 py-2 text-xs text-white placeholder:text-[#6b7280] outline-none focus:border-[#00e5ff]/40"
                />
                {!collegeOtpSent ? (
                  <button
                    onClick={handleSendOtp}
                    disabled={otpLoading || !form.collegeEmail}
                    className="w-full rounded-lg bg-[#00e5ff]/10 border border-[#00e5ff]/20 py-2 text-xs text-[#00e5ff] hover:bg-[#00e5ff]/20 transition-colors disabled:opacity-40"
                  >
                    {otpLoading ? 'Sending…' : 'Send Verification OTP'}
                  </button>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={collegeOtp}
                      onChange={e => setCollegeOtp(e.target.value)}
                      className="w-full rounded-lg border border-white/[0.07] bg-[#0a0a0f] px-3 py-2 text-xs text-white placeholder:text-[#6b7280] outline-none focus:border-[#00e5ff]/40"
                    />
                    <button
                      onClick={handleVerifyOtp}
                      disabled={otpLoading || !collegeOtp}
                      className="w-full rounded-lg bg-[#22c55e]/10 border border-[#22c55e]/20 py-2 text-xs text-[#22c55e] hover:bg-[#22c55e]/20 transition-colors disabled:opacity-40"
                    >
                      {otpLoading ? 'Verifying…' : 'Verify OTP'}
                    </button>
                    <button onClick={() => { setCollegeOtpSent(false); setCollegeOtp('') }} className="text-[10px] text-[#6b7280] hover:text-white">
                      Resend OTP
                    </button>
                  </div>
                )}
                {otpMsg && <p className={`text-[10px] ${otpMsg.includes('Failed') || otpMsg.includes('Invalid') ? 'text-[#ef4444]' : 'text-[#22c55e]'}`}>{otpMsg}</p>}
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="synapto-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Bell size={14} className="text-[#00e5ff]" />
              <p className="label-upper">Notifications</p>
            </div>
            {([
              { label: 'Deadline reminders (email)', field: 'deadlineNotifications' as const },
              { label: 'Study pack ready (email)',   field: 'studyPackNotifications' as const },
              { label: 'Attendance alerts (email)',  field: 'attendanceNotifications' as const },
            ] as const).map(({ label, field }) => {
              const on = notif[field]
              return (
                <div key={field} className="flex items-center justify-between py-1.5">
                  <span className="text-xs text-[#6b7280]">{label}</span>
                  <button
                    onClick={async () => {
                      const next = { ...notif, [field]: !notif[field] }
                      setNotif(next)
                      try { await updateSettings(next) } catch {}
                    }}
                    className={`h-4 w-7 rounded-full relative transition-colors ${on ? 'bg-[#00e5ff]/40' : 'bg-white/10'}`}
                  >
                    <div className={`absolute top-0.5 h-3 w-3 rounded-full transition-all ${on ? 'right-0.5 bg-[#00e5ff]' : 'left-0.5 bg-[#6b7280]'}`} />
                  </button>
                </div>
              )
            })}
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
