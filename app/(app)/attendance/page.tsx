"use client"

import { useEffect, useState } from 'react'
import {
  getAttendanceStats, getBunkBudget, getAttendancePrediction,
  getMassBunkPolls, logAttendance, voteMassBunk
} from '@/lib/api'
import { AlertTriangle, CheckCircle, Clock, Users, Zap } from 'lucide-react'
import { useAuthStore } from '@/lib/store/authStore'

interface Subject { subject: string; code: string; present: number; total: number; percentage: number; status: string }
interface BunkBudget { subject: string; maxAbsencesAllowed: number; safeToSkip: boolean }
interface Poll { _id: string; subject: string; reason: string; votes: { yes: number; no: number }; totalVoters: number; proposedDate: string }

export default function AttendancePage() {
  const { user } = useAuthStore()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [budget, setBudget] = useState<BunkBudget[]>([])
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)

  // Log form
  const [logSubject, setLogSubject] = useState('')
  const [logStatus, setLogStatus] = useState<'present' | 'absent' | 'cancelled'>('present')
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0])
  const [submitting, setSubmitting] = useState(false)
  const [logMsg, setLogMsg] = useState('')

  useEffect(() => {
    Promise.all([
      getAttendanceStats(),
      getBunkBudget(),
      getMassBunkPolls(),
    ]).then(([s, b, p]) => {
      setSubjects(s as Subject[])
      setBudget(b as BunkBudget[])
      setPolls(p as Poll[])
      setLoading(false)
    })
  }, [])

  const validSubjects = subjects.filter(s => s.status !== 'cancelled')
  const criticalCount = subjects.filter(s => s.status === 'critical').length
  const overallStatus = criticalCount > 0 ? 'CRITICAL' : subjects.some(s => s.status === 'borderline') ? 'BORDERLINE' : 'SAFE'
  const globalPct = validSubjects.length
    ? Math.round(validSubjects.reduce((sum, s) => sum + s.percentage, 0) / validSubjects.length)
    : 0

  const statusColor = overallStatus === 'CRITICAL' ? '#ef4444' : overallStatus === 'BORDERLINE' ? '#facc15' : '#22c55e'
  const barColor = (pct: number) => pct >= 75 ? '#00e5ff' : pct >= 65 ? '#facc15' : '#ef4444'

  const handleLog = async () => {
    if (!logSubject) return
    setSubmitting(true)
    try {
      await logAttendance({ subject: logSubject, date: logDate, status: logStatus })
      setLogMsg('Attendance logged!')
      const updated = await getAttendanceStats()
      setSubjects(updated as Subject[])
      setTimeout(() => setLogMsg(''), 3000)
    } catch {
      setLogMsg('Failed to log.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleVote = async (pollId: string, vote: 'yes' | 'no') => {
    await voteMassBunk(pollId, vote)
    const updated = await getMassBunkPolls()
    setPolls(updated as Poll[])
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00e5ff] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-full bg-[#0a0a0f] p-6 space-y-6">

      {/* Hero */}
      <div className="synapto-card p-6">
        <p className="label-upper mb-1">Attendance Tracker</p>
        <h1 className="text-3xl font-black uppercase tracking-tight text-white">
          STATUS: <span style={{ color: statusColor }}>{overallStatus}</span>
        </h1>
        <p className="mt-1 text-sm text-[#6b7280]">
          {overallStatus === 'CRITICAL'
            ? `${criticalCount} subject${criticalCount > 1 ? 's' : ''} below 75% — immediate action required`
            : overallStatus === 'BORDERLINE'
            ? 'Some subjects approaching the danger zone'
            : 'All subjects at safe attendance levels'}
        </p>
        <div className="mt-4 flex items-center gap-4">
          <div>
            <p className="text-4xl font-black text-[#00e5ff]">{globalPct}%</p>
            <p className="text-[10px] uppercase tracking-widest text-[#6b7280]">Overall Average</p>
          </div>
          <div className="h-12 w-px bg-white/10" />
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'SAFE', count: subjects.filter(s => s.status === 'safe').length, color: '#22c55e' },
              { label: 'BORDERLINE', count: subjects.filter(s => s.status === 'borderline').length, color: '#facc15' },
              { label: 'CRITICAL', count: subjects.filter(s => s.status === 'critical').length, color: '#ef4444' },
            ].map(({ label, count, color }) => (
              <div key={label} className="text-center">
                <p className="text-xl font-black" style={{ color }}>{count}</p>
                <p className="text-[9px] uppercase tracking-widest text-[#6b7280]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Subject Matrix */}
        <div className="synapto-card p-5 lg:col-span-2">
          <p className="label-upper mb-4">Subject Matrix</p>
          <div className="space-y-4">
            {subjects.map(s => (
              <div key={s.subject}>
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <span className="text-sm font-medium text-white">{s.subject}</span>
                    <span className="ml-2 text-[10px] text-[#6b7280]">{s.code}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold" style={{ color: s.status === 'cancelled' ? '#6b7280' : barColor(s.percentage) }}>
                      {s.status === 'cancelled' ? 'N/A' : `${s.percentage}%`}
                    </span>
                    <span className="ml-2 text-[9px] text-[#6b7280]">{s.present}/{s.total}</span>
                  </div>
                </div>
                {s.status === 'cancelled' ? (
                  <div className="progress-track"><div className="h-full w-full rounded-full bg-white/5" /></div>
                ) : (
                  <div className="progress-track">
                    <div className="h-full rounded-full transition-all" style={{ width: `${s.percentage}%`, backgroundColor: barColor(s.percentage) }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bunk Budget + Log */}
        <div className="space-y-4">
          {/* Bunk Budget */}
          <div className="synapto-card p-5">
            <p className="label-upper mb-3">Bunk Budget</p>
            {budget.filter(b => b.safeToSkip).length === 0 ? (
              <p className="text-xs text-[#6b7280]">No safe skips available right now.</p>
            ) : (
              <div className="space-y-2">
                {budget.filter(b => b.safeToSkip).map(b => (
                  <div key={b.subject} className="flex items-center justify-between">
                    <p className="text-xs text-[#6b7280] truncate max-w-[70%]">{b.subject}</p>
                    <p className="text-sm font-black text-[#00e5ff]">
                      {b.maxAbsencesAllowed} <span className="text-[10px] font-normal text-[#6b7280]">safe</span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Log Attendance */}
          <div className="synapto-card p-5">
            <p className="label-upper mb-3">Log Attendance</p>
            <div className="space-y-3">
              <select
                value={logSubject}
                onChange={e => setLogSubject(e.target.value)}
                className="w-full rounded-lg border border-white/[0.07] bg-[#0a0a0f] px-3 py-2 text-xs text-white outline-none focus:border-[#00e5ff]/40"
              >
                <option value="">Select subject</option>
                {subjects.map(s => (
                  <option key={s.subject} value={s.subject}>{s.subject}</option>
                ))}
              </select>
              <input
                type="date"
                value={logDate}
                onChange={e => setLogDate(e.target.value)}
                className="w-full rounded-lg border border-white/[0.07] bg-[#0a0a0f] px-3 py-2 text-xs text-white outline-none focus:border-[#00e5ff]/40"
              />
              <div className="grid grid-cols-3 gap-2">
                {(['present', 'absent', 'cancelled'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setLogStatus(s)}
                    className={`rounded-lg py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                      logStatus === s
                        ? s === 'present' ? 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/40'
                          : s === 'absent' ? 'bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/40'
                          : 'bg-[#6b7280]/20 text-[#6b7280] border border-[#6b7280]/40'
                        : 'border border-white/[0.07] text-[#6b7280] hover:border-white/20'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <button
                onClick={handleLog}
                disabled={submitting || !logSubject}
                className="w-full rounded-lg bg-[#00e5ff] py-2 text-[11px] font-black uppercase tracking-widest text-black transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? 'Saving…' : 'Log Attendance'}
              </button>
              {logMsg && <p className="text-center text-[10px] text-[#22c55e]">{logMsg}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Active Polls */}
      {polls.length > 0 && (
        <div>
          <p className="label-upper mb-3">Active Mass Bunk Polls</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {polls.map(poll => {
              const total = poll.votes.yes + poll.votes.no
              const yesPct = total > 0 ? Math.round((poll.votes.yes / total) * 100) : 0
              return (
                <div key={poll._id} className="synapto-card p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <Users size={13} className="text-[#a855f7]" />
                    <p className="text-xs font-bold text-white">{poll.subject}</p>
                  </div>
                  <p className="text-xs text-[#6b7280] mb-4">{poll.reason}</p>
                  <div className="flex gap-3 mb-3">
                    <button
                      onClick={() => handleVote(poll._id, 'yes')}
                      className="flex-1 rounded-lg bg-[#00e5ff] py-2.5 text-[11px] font-black uppercase tracking-widest text-black transition-opacity hover:opacity-90"
                    >
                      HELL YES
                    </button>
                    <button
                      onClick={() => handleVote(poll._id, 'no')}
                      className="flex-1 rounded-lg border border-white/[0.07] py-2.5 text-[11px] font-bold uppercase tracking-widest text-[#6b7280] transition-colors hover:bg-white/5"
                    >
                      NAH
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#6b7280]">
                    <span>{poll.votes.yes} yes · {poll.votes.no} no · {total} voted</span>
                    <span className="font-bold text-[#00e5ff]">{yesPct}% in</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Bottom Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'TOTAL HOURS', value: '1,240', icon: Clock, color: '#00e5ff' },
          { label: 'EFFICIENCY', value: '94%', icon: Zap, color: '#a855f7' },
          { label: 'BUNKED', value: '12', icon: AlertTriangle, color: '#ef4444' },
          { label: 'PEER RANK', value: '#4', icon: CheckCircle, color: '#22c55e' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="synapto-card p-4 text-center">
            <Icon size={16} className="mx-auto mb-2" style={{ color }} />
            <p className="text-xl font-black" style={{ color }}>{value}</p>
            <p className="label-upper mt-1">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
