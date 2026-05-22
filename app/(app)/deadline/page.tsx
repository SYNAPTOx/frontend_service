"use client"

import { useEffect, useState } from 'react'
import { getDeadlines, createDeadline, updateDeadline, deleteDeadline } from '@/lib/api'
import { Flame, Plus, Calendar, CheckCircle, Clock, X, ChevronRight } from 'lucide-react'

interface DayPlan { day: string; date: string; tasks: string[]; completed: boolean }
interface Deadline {
  _id: string
  title: string
  description: string
  subject: string
  dueDate: string
  priority: 'high' | 'medium' | 'low'
  status: 'active' | 'overdue' | 'done'
  studyPlan?: { days: DayPlan[] }
}

const SUBJECTS = ['Data Structures', 'Operating Systems', 'Computer Networks', 'Database Systems', 'Software Engineering']
const priorityColor = (p: string) => p === 'high' ? '#ef4444' : p === 'medium' ? '#facc15' : '#22c55e'
const statusBadge = (s: string) =>
  s === 'overdue' ? 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20'
  : s === 'done' ? 'bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20'
  : 'bg-[#facc15]/10 text-[#facc15] border-[#facc15]/20'

export default function DeadlinePage() {
  const [deadlines, setDeadlines] = useState<Deadline[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', description: '', subject: '', dueDate: '', priority: 'medium' as 'high' | 'medium' | 'low' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getDeadlines().then(d => { setDeadlines(d as Deadline[]); setLoading(false) })
  }, [])

  const handleCreate = async () => {
    if (!form.title || !form.subject || !form.dueDate) return
    setSubmitting(true)
    try {
      await createDeadline({ ...form, remindBeforeDays: 2 })
      const updated = await getDeadlines()
      setDeadlines(updated as Deadline[])
      setShowForm(false)
      setForm({ title: '', description: '', subject: '', dueDate: '', priority: 'medium' })
    } finally { setSubmitting(false) }
  }

  const handleComplete = async (id: string) => {
    await updateDeadline(id, { status: 'done' })
    setDeadlines(prev => prev.map(d => d._id === id ? { ...d, status: 'done' as const } : d))
  }

  const handleDelete = async (id: string) => {
    await deleteDeadline(id)
    setDeadlines(prev => prev.filter(d => d._id !== id))
  }

  const daysUntil = (iso: string) => Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000)

  const active = deadlines.filter(d => d.status === 'active')
  const overdue = deadlines.filter(d => d.status === 'overdue')
  const done = deadlines.filter(d => d.status === 'done')

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#facc15] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-full bg-[#0a0a0f] p-6 space-y-6">

      {/* Hero */}
      <div className="flex items-start justify-between">
        <div>
          <p className="label-upper">Deadline Tracker</p>
          <h1 className="mt-0.5 text-3xl font-black uppercase tracking-tight text-[#facc15]">
            THE BURN <span className="text-white">WINDOW</span>
          </h1>
          <p className="mt-1 text-xs text-[#6b7280]">
            {overdue.length > 0
              ? `${overdue.length} overdue · ${active.length} active · ${done.length} completed`
              : `${active.length} active · ${done.length} completed`}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-[#facc15] px-4 py-2 text-[11px] font-black uppercase tracking-widest text-black transition-opacity hover:opacity-90"
        >
          <Plus size={13} /> Add Deadline
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="synapto-card p-5 border-[#facc15]/20">
          <div className="flex items-center justify-between mb-4">
            <p className="label-upper">New Deadline</p>
            <button onClick={() => setShowForm(false)} className="text-[#6b7280] hover:text-white"><X size={14} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              placeholder="Title *"
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              className="rounded-lg border border-white/[0.07] bg-[#0a0a0f] px-3 py-2 text-xs text-white placeholder:text-[#6b7280] outline-none focus:border-[#facc15]/40 sm:col-span-2"
            />
            <input
              placeholder="Description"
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              className="rounded-lg border border-white/[0.07] bg-[#0a0a0f] px-3 py-2 text-xs text-white placeholder:text-[#6b7280] outline-none focus:border-[#facc15]/40 sm:col-span-2"
            />
            <select
              value={form.subject}
              onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
              className="rounded-lg border border-white/[0.07] bg-[#0a0a0f] px-3 py-2 text-xs text-white outline-none focus:border-[#facc15]/40"
            >
              <option value="">Select subject *</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input
              type="date"
              value={form.dueDate}
              onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))}
              className="rounded-lg border border-white/[0.07] bg-[#0a0a0f] px-3 py-2 text-xs text-white outline-none focus:border-[#facc15]/40"
            />
            <select
              value={form.priority}
              onChange={e => setForm(p => ({ ...p, priority: e.target.value as 'high' | 'medium' | 'low' }))}
              className="rounded-lg border border-white/[0.07] bg-[#0a0a0f] px-3 py-2 text-xs text-white outline-none focus:border-[#facc15]/40"
            >
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
            <button
              onClick={handleCreate}
              disabled={submitting || !form.title || !form.subject || !form.dueDate}
              className="rounded-lg bg-[#facc15] py-2 text-[11px] font-black uppercase tracking-widest text-black transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {submitting ? 'Creating…' : 'POWERMOVE ACCEPT'}
            </button>
          </div>
        </div>
      )}

      {/* Overdue */}
      {overdue.length > 0 && (
        <div>
          <p className="label-upper mb-3 text-[#ef4444]">Overdue</p>
          <div className="space-y-3">
            {overdue.map(d => (
              <DeadlineCard key={d._id} d={d} onComplete={handleComplete} onDelete={handleDelete} expanded={expandedId === d._id} onToggle={() => setExpandedId(expandedId === d._id ? null : d._id)} daysUntil={daysUntil} />
            ))}
          </div>
        </div>
      )}

      {/* Active */}
      {active.length > 0 && (
        <div>
          <p className="label-upper mb-3">Active</p>
          <div className="space-y-3">
            {active.map(d => (
              <DeadlineCard key={d._id} d={d} onComplete={handleComplete} onDelete={handleDelete} expanded={expandedId === d._id} onToggle={() => setExpandedId(expandedId === d._id ? null : d._id)} daysUntil={daysUntil} />
            ))}
          </div>
        </div>
      )}

      {/* Done */}
      {done.length > 0 && (
        <div>
          <p className="label-upper mb-3">Completed</p>
          <div className="space-y-2">
            {done.map(d => (
              <div key={d._id} className="synapto-card flex items-center gap-3 px-4 py-3 opacity-50">
                <CheckCircle size={14} className="text-[#22c55e] shrink-0" />
                <p className="text-xs text-white flex-1">{d.title}</p>
                <span className="text-[10px] text-[#6b7280]">{d.subject}</span>
                <button onClick={() => handleDelete(d._id)} className="text-[#6b7280] hover:text-red-400 transition-colors"><X size={12} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {deadlines.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16">
          <Flame size={32} className="text-[#facc15]/40" />
          <p className="text-sm text-[#6b7280]">No deadlines yet. The burn window is clear.</p>
        </div>
      )}
    </div>
  )
}

function DeadlineCard({ d, onComplete, onDelete, expanded, onToggle, daysUntil }: {
  d: Deadline; onComplete: (id: string) => void; onDelete: (id: string) => void
  expanded: boolean; onToggle: () => void; daysUntil: (iso: string) => number
}) {
  const days = daysUntil(d.dueDate)
  const pColor = priorityColor(d.priority)

  return (
    <div className="synapto-card overflow-hidden" style={{ borderLeft: `3px solid ${pColor}` }}>
      <div className="flex items-center gap-3 px-4 py-3">
        <Flame size={14} style={{ color: pColor }} className="shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white truncate">{d.title}</p>
          <p className="text-[10px] text-[#6b7280]">{d.subject}</p>
        </div>
        <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${statusBadge(d.status)}`}>
          {d.status}
        </span>
        <span className="text-[10px] shrink-0" style={{ color: days < 0 ? '#ef4444' : days <= 2 ? '#facc15' : '#6b7280' }}>
          {days < 0 ? `${Math.abs(days)}d ago` : days === 0 ? 'Today' : `${days}d`}
        </span>
        <div className="flex items-center gap-1">
          {d.status !== 'done' && (
            <button onClick={() => onComplete(d._id)} className="rounded p-1 text-[#6b7280] hover:text-[#22c55e] transition-colors">
              <CheckCircle size={13} />
            </button>
          )}
          <button onClick={() => onDelete(d._id)} className="rounded p-1 text-[#6b7280] hover:text-red-400 transition-colors">
            <X size={13} />
          </button>
          {d.studyPlan && (
            <button onClick={onToggle} className="rounded p-1 text-[#6b7280] hover:text-white transition-colors">
              <ChevronRight size={13} className={`transition-transform ${expanded ? 'rotate-90' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {d.description && <p className="px-4 pb-2 text-[11px] text-[#6b7280]">{d.description}</p>}

      {expanded && d.studyPlan && (
        <div className="border-t border-white/[0.07] px-4 py-3">
          <p className="label-upper mb-3">AI Study Plan</p>
          <div className="space-y-2">
            {d.studyPlan.days.map((day, i) => (
              <div key={i} className={`rounded-lg px-3 py-2 bg-white/[0.02] ${day.completed ? 'opacity-40' : ''}`}>
                <div className="flex items-center gap-2 mb-1">
                  {day.completed
                    ? <CheckCircle size={11} className="text-[#22c55e]" />
                    : <Clock size={11} className="text-[#facc15]" />
                  }
                  <p className="text-[10px] font-bold text-white">{day.day}</p>
                  <span className="text-[9px] text-[#6b7280]">{day.date}</span>
                </div>
                <ul className="pl-4 space-y-0.5">
                  {day.tasks.map((task, ti) => (
                    <li key={ti} className="text-[10px] text-[#6b7280]">• {task}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
