"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, Flame, FolderOpen, Brain, ClipboardCheck, Plus, ArrowRight, TrendingUp, TrendingDown, Activity } from 'lucide-react'
import { useAuthStore } from '@/lib/store/authStore'
import { getAttendanceStats, getDeadlines, getFiles } from '@/lib/api'

interface Subject { subject: string; percentage: number; status: string }
interface Deadline { _id: string; title: string; subject: string; dueDate: string; status: string; priority: string }
interface StudyFile { _id: string; fileName: string; subject: string; processingStatus: string }

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [deadlines, setDeadlines] = useState<Deadline[]>([])
  const [files, setFiles] = useState<StudyFile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([getAttendanceStats(), getDeadlines(), getFiles()]).then(
      ([att, dl, fl]) => {
        if (att.status === 'fulfilled') setSubjects(att.value as Subject[])
        if (dl.status === 'fulfilled') setDeadlines(dl.value as Deadline[])
        if (fl.status === 'fulfilled') setFiles(fl.value as StudyFile[])
        setLoading(false)
      }
    )
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = user?.name?.split(' ')[0] ?? 'Student'

  const validSubjects = subjects.filter(s => s.status !== 'cancelled')
  const avgAttendance = validSubjects.length
    ? Math.round(validSubjects.reduce((sum, s) => sum + s.percentage, 0) / validSubjects.length)
    : 0
  const criticalSubjects = subjects.filter(s => s.status === 'critical')
  const activeDeadlines = deadlines.filter(d => d.status === 'active')
  const overdueDeadlines = deadlines.filter(d => d.status === 'overdue')

  const statColor = (pct: number) =>
    pct >= 75 ? '#22c55e' : pct >= 65 ? '#facc15' : '#ef4444'

  const daysUntil = (iso: string) => {
    const diff = new Date(iso).getTime() - Date.now()
    return Math.ceil(diff / 86400000)
  }

  const priorityColor = (p: string) =>
    p === 'high' ? '#ef4444' : p === 'medium' ? '#facc15' : '#6b7280'

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00e5ff] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-full bg-[#0a0a0f] p-6 space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-[#6b7280]">{greeting}</p>
          <h1 className="text-2xl font-black text-white mt-0.5">
            {firstName.toUpperCase()}<span className="text-[#00e5ff]">_SYNTH</span>
          </h1>
          <p className="text-xs text-[#6b7280] mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-widest text-[#6b7280]">System Status</p>
          <p className="text-sm font-bold text-[#22c55e] mt-0.5">● ONLINE</p>
        </div>
      </div>

      {/* Alert banner */}
      {(criticalSubjects.length > 0 || overdueDeadlines.length > 0) && (
        <div className="rounded-xl border border-[#ef4444]/30 bg-[#ef4444]/5 px-4 py-3 flex items-center gap-3">
          <AlertTriangle size={16} className="text-[#ef4444] shrink-0" />
          <p className="text-sm text-[#ef4444]">
            {criticalSubjects.length > 0 && (
              <span><span className="font-bold">{criticalSubjects.length} subject{criticalSubjects.length > 1 ? 's' : ''}</span> below 75% attendance. </span>
            )}
            {overdueDeadlines.length > 0 && (
              <span><span className="font-bold">{overdueDeadlines.length} deadline{overdueDeadlines.length > 1 ? 's' : ''}</span> overdue.</span>
            )}
          </p>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'AVG ATTENDANCE',
            value: `${avgAttendance}%`,
            sub: `${validSubjects.length} subjects`,
            icon: Activity,
            color: statColor(avgAttendance),
            trend: avgAttendance >= 75 ? 'up' : 'down',
          },
          {
            label: 'ACTIVE DEADLINES',
            value: activeDeadlines.length,
            sub: overdueDeadlines.length > 0 ? `${overdueDeadlines.length} overdue` : 'all on track',
            icon: Flame,
            color: overdueDeadlines.length > 0 ? '#ef4444' : '#facc15',
            trend: overdueDeadlines.length > 0 ? 'down' : 'up',
          },
          {
            label: 'STUDY FILES',
            value: files.length,
            sub: `${files.filter(f => f.processingStatus === 'done').length} processed`,
            icon: FolderOpen,
            color: '#a855f7',
            trend: 'up',
          },
          {
            label: 'AI SESSIONS',
            value: 24,
            sub: 'this week',
            icon: Brain,
            color: '#00e5ff',
            trend: 'up',
          },
        ].map(({ label, value, sub, icon: Icon, color, trend }) => (
          <div key={label} className="synapto-card p-4">
            <div className="flex items-center justify-between mb-3">
              <Icon size={16} style={{ color }} />
              {trend === 'up'
                ? <TrendingUp size={12} className="text-[#22c55e]" />
                : <TrendingDown size={12} className="text-[#ef4444]" />
              }
            </div>
            <p className="text-2xl font-black" style={{ color }}>{value}</p>
            <p className="text-[10px] uppercase tracking-widest text-[#6b7280] mt-0.5">{label}</p>
            <p className="text-[10px] text-[#6b7280] mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Subject Matrix */}
        <div className="synapto-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <p className="label-upper">Subject Matrix</p>
            <Link href="/attendance" className="text-[10px] text-[#00e5ff] hover:underline flex items-center gap-1">
              View all <ArrowRight size={10} />
            </Link>
          </div>
          <div className="space-y-3">
            {validSubjects.map(s => (
              <div key={s.subject}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-white truncate max-w-[60%]">{s.subject}</span>
                  <span className="text-xs font-bold" style={{ color: statColor(s.percentage) }}>
                    {s.percentage}%
                  </span>
                </div>
                <div className="progress-track">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${s.percentage}%`, backgroundColor: statColor(s.percentage) }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="synapto-card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="label-upper">Deadlines</p>
            <Link href="/deadline" className="text-[10px] text-[#00e5ff] hover:underline flex items-center gap-1">
              View all <ArrowRight size={10} />
            </Link>
          </div>
          <div className="space-y-3">
            {deadlines.filter(d => d.status !== 'done').slice(0, 4).map(d => {
              const days = daysUntil(d.dueDate)
              return (
                <div key={d._id} className="flex items-start gap-3">
                  <div
                    className="mt-1 h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: priorityColor(d.priority) }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{d.title}</p>
                    <p className="text-[10px] text-[#6b7280]">{d.subject}</p>
                  </div>
                  <span className="text-[10px] shrink-0" style={{ color: days < 0 ? '#ef4444' : days <= 2 ? '#facc15' : '#6b7280' }}>
                    {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Today' : `${days}d`}
                  </span>
                </div>
              )
            })}
            {deadlines.filter(d => d.status !== 'done').length === 0 && (
              <p className="text-xs text-[#6b7280]">No active deadlines</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <p className="label-upper mb-3">Quick Actions</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'LOG ATTENDANCE', href: '/attendance', icon: ClipboardCheck, color: '#22c55e' },
            { label: 'UPLOAD FILE', href: '/study', icon: FolderOpen, color: '#a855f7' },
            { label: 'ADD DEADLINE', href: '/deadline', icon: Flame, color: '#facc15' },
            { label: 'ASK AI', href: '/ai-chat', icon: Brain, color: '#00e5ff' },
          ].map(({ label, href, icon: Icon, color }) => (
            <Link
              key={label}
              href={href}
              className="synapto-card flex items-center gap-3 p-4 hover:border-[#00e5ff]/20 transition-colors group"
            >
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${color}15` }}
              >
                <Icon size={14} style={{ color }} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280] group-hover:text-white transition-colors">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Files */}
      {files.length > 0 && (
        <div className="synapto-card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="label-upper">Recent Files</p>
            <Link href="/study" className="text-[10px] text-[#00e5ff] hover:underline flex items-center gap-1">
              Study Hub <ArrowRight size={10} />
            </Link>
          </div>
          <div className="space-y-2">
            {files.slice(0, 4).map(f => {
              const statusColor = f.processingStatus === 'done' ? '#22c55e' : f.processingStatus === 'failed' ? '#ef4444' : '#facc15'
              const ext = f.fileName.split('.').pop()?.toUpperCase() ?? 'FILE'
              return (
                <div key={f._id} className="flex items-center gap-3 py-1">
                  <div className="flex h-6 w-10 items-center justify-center rounded text-[8px] font-bold" style={{ backgroundColor: `${statusColor}15`, color: statusColor }}>
                    {ext}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white truncate">{f.fileName}</p>
                    <p className="text-[10px] text-[#6b7280]">{f.subject}</p>
                  </div>
                  <span className="text-[10px]" style={{ color: statusColor }}>
                    {f.processingStatus === 'done' ? '✓' : f.processingStatus === 'failed' ? '✗' : '⟳'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
