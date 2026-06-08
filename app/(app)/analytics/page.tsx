"use client"

import { useEffect, useState } from 'react'
import { getOverview, getAttendanceAnalytics, getActivityHeatmap, getQuizAnalytics } from '@/lib/api'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { TrendingUp, Activity, BookOpen, Target, Flame, MessageSquare, Brain, HardDrive } from 'lucide-react'

interface Overview {
  avgAttendance: number; quizzesTaken: number; deadlinesCompleted: number; deadlinesTotal: number
  studyStreak: number; totalFiles: number; chatMessages: number; totalHoursStudied: number
}
interface HeatmapDay { date: string; count: number }
interface TrendPoint { week: string; [key: string]: string | number }
interface QuizResult { date: string; subject: string; score: number; total: number; label: string }

const SUBJECT_COLORS: Record<string, string> = {
  'Data Structures': '#00e5ff',
  'Operating Systems': '#a855f7',
  'Computer Networks': '#22c55e',
  'Database Systems': '#facc15',
}

const heatColor = (count: number) => {
  if (count === 0) return 'rgba(255,255,255,0.04)'
  if (count <= 2) return '#00e5ff22'
  if (count <= 4) return '#00e5ff55'
  if (count <= 6) return '#00e5ff99'
  return '#00e5ff'
}

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<Overview | null>(null)
  const [heatmap, setHeatmap] = useState<HeatmapDay[]>([])
  const [trend, setTrend] = useState<TrendPoint[]>([])
  const [quizHistory, setQuizHistory] = useState<QuizResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.allSettled([getOverview(), getActivityHeatmap(), getAttendanceAnalytics(), getQuizAnalytics()])
      .then(([ov, hm, at, qz]) => {
        if (ov.status === 'fulfilled') setOverview(ov.value as Overview)
        setHeatmap(hm.status === 'fulfilled' ? ((hm.value as HeatmapDay[]) ?? []) : [])
        setTrend(at.status === 'fulfilled' ? ((at.value as TrendPoint[]) ?? []) : [])
        setQuizHistory(qz.status === 'fulfilled' ? ((qz.value as QuizResult[]) ?? []) : [])

        const failures = [ov, hm, at, qz].filter(r => r.status === 'rejected')
        if (failures.length === 4) {
          setError((failures[0] as PromiseRejectedResult).reason?.message ?? 'Failed to load analytics')
        }
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00e5ff] border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm font-semibold text-[#ef4444]">Failed to load analytics</p>
        <p className="text-xs text-[#6b7280]">{error}</p>
        <button
          onClick={() => { setError(null); setLoading(true); window.location.reload() }}
          className="mt-2 rounded-lg border border-[#00e5ff33] px-4 py-1.5 text-xs text-[#00e5ff] hover:bg-[#00e5ff11]"
        >
          Retry
        </button>
      </div>
    )
  }

  const recentActivity = [...(heatmap ?? [])].slice(-7)

  return (
    <div className="min-h-full bg-[#0a0a0f] p-6 space-y-6">

      {/* Header */}
      <div>
        <p className="label-upper">Analytics</p>
        <h1 className="mt-0.5 text-2xl font-black uppercase tracking-tight text-white">
          INSIGHTS & <span className="text-[#00e5ff]">ACTIVITY</span>
        </h1>
      </div>

      {/* Overview stats */}
      {overview && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'AVG ATTENDANCE', value: `${overview.avgAttendance}%`, icon: Activity, color: overview.avgAttendance >= 75 ? '#22c55e' : '#ef4444' },
            { label: 'STUDY STREAK', value: `${overview.studyStreak}d`, icon: Flame, color: '#facc15' },
            { label: 'QUIZZES TAKEN', value: overview.quizzesTaken, icon: Brain, color: '#a855f7' },
            { label: 'HOURS STUDIED', value: overview.totalHoursStudied, icon: BookOpen, color: '#00e5ff' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="synapto-card p-4">
              <Icon size={16} style={{ color }} className="mb-2" />
              <p className="text-2xl font-black" style={{ color }}>{value}</p>
              <p className="label-upper mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

        {/* Left — Feed */}
        <div className="xl:col-span-2 space-y-4">
          <p className="label-upper">Activity Feed</p>

          {/* Heatmap */}
          <div className="synapto-card p-4">
            <p className="text-xs font-semibold text-white mb-3">Study Activity — Last 30 Days</p>
            <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(10, 1fr)' }}>
              {heatmap.map((day, i) => (
                <div
                  key={i}
                  title={`${day.date}: ${day.count} sessions`}
                  className="aspect-square rounded-sm transition-colors cursor-default"
                  style={{ backgroundColor: heatColor(day.count) }}
                />
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2 justify-end">
              <span className="text-[9px] text-[#6b7280]">Less</span>
              {[0, 2, 4, 6, 8].map(v => (
                <div key={v} className="h-3 w-3 rounded-sm" style={{ backgroundColor: heatColor(v) }} />
              ))}
              <span className="text-[9px] text-[#6b7280]">More</span>
            </div>
          </div>

          {/* Quiz history */}
          <div className="synapto-card p-4">
            <p className="text-xs font-semibold text-white mb-3">Recent Quiz Results</p>
            <div className="space-y-2">
              {quizHistory.slice(-5).reverse().map((q, i) => {
                const pct = Math.round((q.score / q.total) * 100)
                const color = pct >= 80 ? '#22c55e' : pct >= 60 ? '#facc15' : '#ef4444'
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-black" style={{ backgroundColor: `${color}15`, color }}>
                      {pct}%
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-white truncate">{q.label}</p>
                      <p className="text-[9px] text-[#6b7280]">{q.subject}</p>
                    </div>
                    <span className="text-[10px] text-[#6b7280]">{q.date.slice(5)}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* More stats */}
          {overview && (
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'FILES UPLOADED', value: overview.totalFiles, icon: HardDrive, color: '#a855f7' },
                { label: 'CHAT MESSAGES', value: overview.chatMessages, icon: MessageSquare, color: '#00e5ff' },
                { label: 'DEADLINES DONE', value: `${overview.deadlinesCompleted}/${overview.deadlinesTotal}`, icon: Target, color: '#22c55e' },
                { label: 'PROCESSING', value: '94%', icon: TrendingUp, color: '#facc15' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="synapto-card p-3">
                  <Icon size={13} style={{ color }} className="mb-1.5" />
                  <p className="text-lg font-black" style={{ color }}>{value}</p>
                  <p className="label-upper mt-0.5 text-[8px]">{label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right — Insights */}
        <div className="xl:col-span-3 space-y-4">
          <p className="label-upper">Insights</p>

          {/* Study Heat chart */}
          <div className="synapto-card p-5">
            <p className="text-xs font-semibold text-white mb-4">Study Heat — Attendance Trend</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trend} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111118', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, fontSize: 11 }}
                  labelStyle={{ color: '#fff' }}
                  formatter={(val: number) => [`${val.toFixed(1)}%`]}
                />
                {Object.entries(SUBJECT_COLORS).map(([subject, color]) => (
                  <Line key={subject} type="monotone" dataKey={subject} stroke={color} strokeWidth={2} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-3 flex flex-wrap gap-3">
              {Object.entries(SUBJECT_COLORS).map(([subject, color]) => (
                <div key={subject} className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-[9px] text-[#6b7280]">{subject.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quiz performance bars */}
          <div className="synapto-card p-5">
            <p className="text-xs font-semibold text-white mb-4">Quiz Performance by Subject</p>
            <div className="space-y-3">
              {Object.keys(SUBJECT_COLORS).map(subject => {
                const subjectQuizzes = quizHistory.filter(q => q.subject === subject)
                if (subjectQuizzes.length === 0) return null
                const avg = subjectQuizzes.reduce((sum, q) => sum + (q.score / q.total) * 100, 0) / subjectQuizzes.length
                const color = SUBJECT_COLORS[subject]
                return (
                  <div key={subject}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-white">{subject}</span>
                      <span className="text-xs font-bold" style={{ color }}>{avg.toFixed(0)}%</span>
                    </div>
                    <div className="progress-track">
                      <div className="h-full rounded-full transition-all" style={{ width: `${avg}%`, backgroundColor: color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
