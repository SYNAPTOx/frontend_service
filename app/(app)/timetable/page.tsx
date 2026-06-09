"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getTimetable, getTimetableLog } from '@/lib/api'
import { Upload, History, AlertTriangle, Pencil } from 'lucide-react'

interface TimetableData {
  days: string[]
  timeSlots: string[]
  grid: Record<string, Record<string, string>>
}

interface LogEntry {
  _id: string
  changedByName: string
  action: string
  createdAt: string
}

const PALETTE = [
  '#00e5ff', '#a855f7', '#22c55e', '#f59e0b', '#ef4444',
  '#3b82f6', '#ec4899', '#14b8a6', '#f97316', '#8b5cf6',
]
function subjectColor(name: string): string {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff
  return PALETTE[Math.abs(h) % PALETTE.length]
}

export default function TimetablePage() {
  const [data, setData] = useState<TimetableData | null>(null)
  const [log, setLog] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getTimetable()
      .then(d => { setData(d as TimetableData); setLoading(false) })
      .catch(e => { setError(e?.message ?? 'Failed to load timetable'); setLoading(false) })
    getTimetableLog()
      .then(l => setLog(l as LogEntry[]))
      .catch(() => {})
  }, [])

  const today = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()]

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00e5ff] border-t-transparent" />
    </div>
  )

  if (error) return (
    <div className="p-6 space-y-3">
      <p className="text-[#ef4444] text-sm font-semibold">Could not load timetable</p>
      <p className="text-[#6b7280] text-xs">{error}</p>
      {error.includes('profile') && (
        <a href="/profile" className="inline-block mt-2 text-xs text-[#00e5ff] hover:underline">→ Go to Profile to complete setup</a>
      )}
      <Link href="/timetable/upload" className="inline-flex items-center gap-2 mt-3 rounded-lg bg-[#00e5ff] px-4 py-2 text-xs font-black uppercase tracking-widest text-black hover:opacity-90">
        <Upload size={12} /> Upload Timetable
      </Link>
    </div>
  )

  if (!data || !data.timeSlots?.length) return (
    <div className="p-6 space-y-3">
      <p className="text-[#6b7280] text-sm">No timetable uploaded for your section yet.</p>
      <Link href="/timetable/upload" className="inline-flex items-center gap-2 rounded-lg bg-[#00e5ff] px-4 py-2 text-xs font-black uppercase tracking-widest text-black hover:opacity-90">
        <Upload size={12} /> Upload Timetable
      </Link>
    </div>
  )

  const allSubjects = Array.from(new Set(
    data.days.flatMap(d => data.timeSlots.map(t => data.grid[d]?.[t]).filter(Boolean))
  ))

  return (
    <div className="min-h-full bg-[#0a0a0f] p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="label-upper">Schedule</p>
          <h1 className="mt-0.5 text-2xl font-black uppercase tracking-tight text-white">
            WEEKLY <span className="text-[#00e5ff]">TIMETABLE</span>
          </h1>
          <p className="mt-1 text-xs text-[#6b7280]">
            Today is <span className="text-white font-semibold">{today}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/timetable/upload?prefill=true" className="inline-flex items-center gap-2 rounded-lg border border-[#00e5ff]/30 bg-[#00e5ff]/10 px-3 py-2 text-xs font-black uppercase tracking-widest text-[#00e5ff] hover:bg-[#00e5ff]/20 transition-colors">
            <Pencil size={11} /> Edit
          </Link>
          <Link href="/timetable/upload" className="inline-flex items-center gap-2 rounded-lg bg-[#00e5ff] px-3 py-2 text-xs font-black uppercase tracking-widest text-black hover:opacity-90">
            <Upload size={11} /> Upload New
          </Link>
        </div>
      </div>

      {/* Community warning */}
      <div className="mb-4 flex items-start gap-2 rounded-lg border border-[#f59e0b]/20 bg-[#f59e0b]/5 px-4 py-3">
        <AlertTriangle size={13} className="text-[#f59e0b] shrink-0 mt-0.5" />
        <p className="text-[10px] text-[#f59e0b]">
          This timetable is shared with your entire section. Any student can update it — you are visible to the whole class. Update responsibly.
        </p>
      </div>

      {/* Mobile: stacked day-by-day */}
      <div className="block lg:hidden space-y-4">
        {data.days.map(day => {
          const isToday = day === today
          const classes = data.timeSlots
            .map(t => ({ time: t, subject: data.grid[day]?.[t] }))
            .filter(s => !!s.subject)
          return (
            <div key={day} className={`synapto-card p-4 ${isToday ? 'border-[#00e5ff]/30' : ''}`}>
              <p className={`label-upper mb-3 ${isToday ? 'text-[#00e5ff]' : ''}`}>
                {day} {isToday && '— Today'}
              </p>
              {classes.length === 0
                ? <p className="text-xs text-[#6b7280]">No classes</p>
                : (
                  <div className="space-y-2">
                    {classes.map(({ time, subject }) => {
                      const color = subjectColor(subject)
                      return (
                        <div key={time} className="flex items-center gap-3 rounded-lg px-3 py-2" style={{ backgroundColor: `${color}10` }}>
                          <div className="h-full w-0.5 rounded-full self-stretch" style={{ backgroundColor: color }} />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-white">{subject}</p>
                            <p className="text-[10px] text-[#6b7280]">{time}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              }
            </div>
          )
        })}
      </div>

      {/* Desktop: grid */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="w-28 pb-3 text-[10px] uppercase tracking-widest text-[#6b7280] text-left">Time</th>
              {data.days.map(day => (
                <th key={day} className={`pb-3 text-[10px] uppercase tracking-widest text-left ${day === today ? 'text-[#00e5ff]' : 'text-[#6b7280]'}`}>
                  {day.slice(0, 3)}{day === today ? ' ●' : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.timeSlots.map(time => (
              <tr key={time} className="border-t border-white/[0.04]">
                <td className="py-2 pr-4">
                  <span className="text-[10px] text-[#6b7280] font-mono">{time}</span>
                </td>
                {data.days.map(day => {
                  const subject = data.grid[day]?.[time]
                  const isToday = day === today
                  const color = subject ? subjectColor(subject) : null
                  return (
                    <td key={day} className={`py-1 pr-2 ${isToday ? 'bg-[#00e5ff]/[0.02]' : ''}`}>
                      {subject && color ? (
                        <div
                          className="rounded-lg px-2.5 py-2"
                          style={{ backgroundColor: `${color}12`, borderLeft: `2px solid ${color}` }}
                        >
                          <p className="text-[11px] font-semibold text-white leading-tight truncate">{subject}</p>
                        </div>
                      ) : (
                        <div className="h-10 rounded-lg bg-white/[0.01]" />
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Subject legend */}
      {allSubjects.length > 0 && (
        <div className="mt-6 synapto-card p-4">
          <p className="label-upper mb-3">Subject Legend</p>
          <div className="flex flex-wrap gap-3">
            {allSubjects.map(subject => (
              <div key={subject} className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: subjectColor(subject) }} />
                <span className="text-[10px] text-[#6b7280]">{subject}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Change log */}
      <div className="mt-6 synapto-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <History size={13} className="text-[#a855f7]" />
          <p className="label-upper">Change Log</p>
        </div>
        {log.length === 0 ? (
          <p className="text-xs text-[#6b7280]">No changes recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {log.map(entry => (
              <div key={entry._id} className="flex items-center justify-between text-xs">
                <span className="text-white font-medium">{entry.changedByName}</span>
                <span className="text-[#6b7280]">{entry.action}</span>
                <span className="text-[#6b7280] text-[10px]">{new Date(entry.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
