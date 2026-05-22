"use client"

import { useEffect, useState } from 'react'
import { getTimetable } from '@/lib/api'
import { Table2 } from 'lucide-react'

interface Slot { time: string; label: string; isBreak?: boolean }
type Cell = { subject: string; code: string; room: string; color: string; isLab?: boolean } | null
interface TimetableData {
  days: string[]
  slots: Slot[]
  grid: Record<string, Record<string, Cell>>
}

export default function TimetablePage() {
  const [data, setData] = useState<TimetableData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTimetable().then(d => { setData(d as TimetableData); setLoading(false) })
  }, [])

  const today = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()]

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00e5ff] border-t-transparent" />
      </div>
    )
  }

  if (!data) return <div className="p-6 text-[#6b7280]">No timetable data</div>

  return (
    <div className="min-h-full bg-[#0a0a0f] p-6">
      <div className="mb-6">
        <p className="label-upper">Schedule</p>
        <h1 className="mt-0.5 text-2xl font-black uppercase tracking-tight text-white">
          WEEKLY <span className="text-[#00e5ff]">TIMETABLE</span>
        </h1>
        <p className="mt-1 text-xs text-[#6b7280]">
          Today is <span className="text-white font-semibold">{today}</span>
        </p>
      </div>

      {/* Mobile: stacked day-by-day */}
      <div className="block lg:hidden space-y-4">
        {data.days.map(day => {
          const isToday = day === today
          const classes = data.slots
            .filter(s => !s.isBreak && data.grid[day]?.[s.time])
            .map(s => ({ slot: s, cell: data.grid[day][s.time] }))
          return (
            <div key={day} className={`synapto-card p-4 ${isToday ? 'border-[#00e5ff]/30' : ''}`}>
              <p className={`label-upper mb-3 ${isToday ? 'text-[#00e5ff]' : ''}`}>
                {day} {isToday && '— Today'}
              </p>
              {classes.length === 0
                ? <p className="text-xs text-[#6b7280]">No classes</p>
                : (
                  <div className="space-y-2">
                    {classes.map(({ slot, cell }) => cell && (
                      <div key={slot.time} className="flex items-center gap-3 rounded-lg px-3 py-2" style={{ backgroundColor: `${cell.color}10` }}>
                        <div className="h-full w-0.5 rounded-full self-stretch" style={{ backgroundColor: cell.color }} />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-white">{cell.subject}</p>
                          <p className="text-[10px] text-[#6b7280]">{cell.room} · {slot.label}</p>
                        </div>
                        {cell.isLab && (
                          <span className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase" style={{ backgroundColor: `${cell.color}20`, color: cell.color }}>Lab</span>
                        )}
                      </div>
                    ))}
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
              <th className="w-24 pb-3 text-[10px] uppercase tracking-widest text-[#6b7280] text-left">Time</th>
              {data.days.map(day => (
                <th key={day} className={`pb-3 text-[10px] uppercase tracking-widest text-left ${day === today ? 'text-[#00e5ff]' : 'text-[#6b7280]'}`}>
                  {day.slice(0, 3)}{day === today ? ' ●' : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slots.map(slot => (
              <tr key={slot.time} className="border-t border-white/[0.04]">
                <td className="py-2 pr-4">
                  <span className="text-[10px] text-[#6b7280]">{slot.label}</span>
                </td>
                {slot.isBreak ? (
                  <td colSpan={data.days.length} className="py-2">
                    <div className="flex items-center gap-2">
                      <div className="h-px flex-1 bg-white/[0.04]" />
                      <span className="text-[9px] uppercase tracking-widest text-[#6b7280]">Lunch Break</span>
                      <div className="h-px flex-1 bg-white/[0.04]" />
                    </div>
                  </td>
                ) : (
                  data.days.map(day => {
                    const cell = data.grid[day]?.[slot.time]
                    const isToday = day === today
                    return (
                      <td key={day} className={`py-1 pr-2 ${isToday ? 'bg-[#00e5ff]/[0.02]' : ''}`}>
                        {cell ? (
                          <div
                            className="rounded-lg px-2.5 py-2 h-full"
                            style={{ backgroundColor: `${cell.color}12`, borderLeft: `2px solid ${cell.color}` }}
                          >
                            <p className="text-[11px] font-semibold text-white leading-tight truncate">{cell.subject}</p>
                            <p className="text-[9px] text-[#6b7280] mt-0.5">{cell.room}</p>
                            {cell.isLab && <span className="mt-0.5 inline-block rounded text-[8px] font-bold uppercase px-1" style={{ backgroundColor: `${cell.color}20`, color: cell.color }}>Lab</span>}
                          </div>
                        ) : (
                          <div className="h-14 rounded-lg bg-white/[0.01]" />
                        )}
                      </td>
                    )
                  })
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Subject legend */}
      <div className="mt-6 synapto-card p-4">
        <p className="label-upper mb-3">Subject Legend</p>
        <div className="flex flex-wrap gap-3">
          {Array.from(new Set(
            data.days.flatMap(day =>
              data.slots.filter(s => !s.isBreak).map(s => data.grid[day]?.[s.time]).filter(Boolean)
            )
          )).filter((c, i, arr) => arr.findIndex(x => x?.subject === c?.subject) === i).map(cell => cell && (
            <div key={cell.subject} className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cell.color }} />
              <span className="text-[10px] text-[#6b7280]">{cell.subject} <span className="text-[#6b7280]/60">({cell.code.split(' ')[0]})</span></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
