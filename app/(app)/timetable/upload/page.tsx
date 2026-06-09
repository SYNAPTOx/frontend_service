"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Upload, Plus, Trash2, Check, FileText } from 'lucide-react'
import { uploadTimetable, updateTimetable, getUserMe, getTimetable } from '@/lib/api'

type Grid = Record<string, Record<string, string>>

interface TimetableData {
  section: string
  semester: string
  days: string[]
  timeSlots: string[]
  grid: Grid
}

export default function UploadPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const prefill = searchParams.get('prefill') === 'true'
  const [phase, setPhase] = useState<'upload' | 'edit' | 'saved'>('upload')

  // Upload form — defaults will be overwritten by profile data
  const [file, setFile] = useState<File | null>(null)
  const [section, setSection] = useState('')
  const [semester, setSemester] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  // Pre-populate from user profile so section/semester always matches
  // If prefill=true, also load existing timetable and skip upload phase
  useEffect(() => {
    getUserMe().then((u: any) => {
      if (u?.section) setSection(u.section)
      if (u?.semester) setSemester(String(u.semester))
    }).catch(() => {})

    if (prefill) {
      getTimetable().then((tt: any) => {
        if (!tt) return
        const days: string[] = tt.days ?? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        const timeSlots: string[] = tt.timeSlots ?? []
        const grid: Grid = {}
        days.forEach((d: string) => { grid[d] = tt.grid?.[d] ?? {} })
        getUserMe().then((u: any) => {
          setData({ section: u?.section ?? '', semester: String(u?.semester ?? ''), days, timeSlots, grid })
        }).catch(() => {
          setData({ section: '', semester: '', days, timeSlots, grid })
        })
        setPhase('edit')
      }).catch(() => {})
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Editable timetable
  const [data, setData] = useState<TimetableData | null>(null)
  const [editCell, setEditCell] = useState<{ day: string; slot: string } | null>(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [addingSlot, setAddingSlot] = useState(false)
  const [newSlot, setNewSlot] = useState('')

  const handleUpload = async () => {
    if (!file) { setUploadError('Select a file first'); return }
    setUploading(true); setUploadError('')
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('section', section)
      form.append('semester', semester)
      const res = await uploadTimetable(form) as any
      const tt = res.data ?? res
      const days: string[] = tt.days ?? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      const timeSlots: string[] = tt.timeSlots ?? []
      const grid: Grid = {}
      days.forEach((d: string) => { grid[d] = tt.grid?.[d] ?? {} })
      setData({ section, semester, days, timeSlots, grid })
      setPhase('edit')
    } catch (err: any) {
      setUploadError(err?.message ?? 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const startEdit = (day: string, slot: string) => {
    setEditCell({ day, slot })
    setEditValue(data?.grid[day]?.[slot] ?? '')
  }

  const commitEdit = (day: string, slot: string, val: string) => {
    setData(prev => {
      if (!prev) return prev
      const grid = { ...prev.grid }
      if (!grid[day]) grid[day] = {}
      if (val.trim()) grid[day][slot] = val.trim()
      else delete grid[day][slot]
      return { ...prev, grid }
    })
    setEditCell(null)
  }

  const removeSlot = (slot: string) => {
    setData(prev => {
      if (!prev) return prev
      const grid = { ...prev.grid }
      prev.days.forEach(d => { if (grid[d]) delete grid[d][slot] })
      return { ...prev, timeSlots: prev.timeSlots.filter(s => s !== slot), grid }
    })
  }

  const addSlot = () => {
    if (!newSlot.trim() || !data) return
    if (data.timeSlots.includes(newSlot.trim())) { setNewSlot(''); setAddingSlot(false); return }
    setData(prev => prev ? { ...prev, timeSlots: [...prev.timeSlots, newSlot.trim()] } : prev)
    setNewSlot('')
    setAddingSlot(false)
  }

  const handleConfirm = async () => {
    if (!data) return
    setSaving(true)
    setSaveError('')
    try {
      await updateTimetable({ section: data.section, semester: data.semester, days: data.days, timeSlots: data.timeSlots, grid: data.grid })
      setPhase('saved')
      setTimeout(() => router.push('/timetable'), 1200)
    } catch (err: any) {
      setSaveError(err?.message ?? 'Failed to save. Please try again.')
      setSaving(false)
    }
  }

  // Saved
  if (phase === 'saved') return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center space-y-3">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#22c55e]/20">
          <Check size={26} className="text-[#22c55e]" />
        </div>
        <p className="text-white font-black text-lg uppercase tracking-tight">Timetable Published</p>
        <p className="text-[#6b7280] text-xs">Redirecting to timetable…</p>
      </div>
    </div>
  )

  // Upload phase
  if (phase === 'upload') return (
    <div className="min-h-full bg-[#0a0a0f] p-6">
      <div className="mb-6">
        <p className="label-upper">Timetable</p>
        <h1 className="mt-0.5 text-2xl font-black uppercase tracking-tight text-white">
          UPLOAD <span className="text-[#00e5ff]">TIMETABLE</span>
        </h1>
        <p className="mt-1 text-xs text-[#6b7280]">AI will parse it — you can review and fix before publishing</p>
      </div>

      <div className="max-w-md synapto-card p-6 space-y-5">
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-[10px] uppercase tracking-widest text-[#6b7280] mb-1.5">Section</label>
            <input
              type="text"
              value={section}
              onChange={e => setSection(e.target.value.toUpperCase())}
              placeholder="e.g. A"
              className="w-full rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-sm text-white outline-none focus:border-[#00e5ff]/40"
            />
          </div>
          <div className="flex-1">
            <label className="block text-[10px] uppercase tracking-widest text-[#6b7280] mb-1.5">Semester</label>
            <select
              value={semester}
              onChange={e => setSemester(e.target.value)}
              className="w-full rounded-lg border border-white/[0.07] bg-[#0a0a0f] px-3 py-2 text-sm text-white outline-none focus:border-[#00e5ff]/40"
            >
              {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={String(n)}>Sem {n}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-widest text-[#6b7280] mb-1.5">Timetable File</label>
          <label className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 transition-colors ${file ? 'border-[#00e5ff]/40 bg-[#00e5ff]/[0.04]' : 'border-white/[0.08] hover:border-white/20'}`}>
            <input type="file" accept=".pdf,image/*" className="hidden" onChange={e => setFile(e.target.files?.[0] ?? null)} />
            {file ? (
              <>
                <FileText size={24} className="text-[#00e5ff]" />
                <p className="text-xs font-medium text-white text-center break-all">{file.name}</p>
                <p className="text-[10px] text-[#6b7280]">{(file.size / 1024).toFixed(0)} KB</p>
              </>
            ) : (
              <>
                <Upload size={24} className="text-[#6b7280]" />
                <p className="text-xs text-[#6b7280]">Click to choose PDF or image</p>
              </>
            )}
          </label>
        </div>

        {uploadError && <p className="text-xs text-[#ef4444]">{uploadError}</p>}

        <button
          onClick={handleUpload}
          disabled={uploading || !file}
          className="w-full rounded-lg bg-[#00e5ff] py-3 text-[11px] font-black uppercase tracking-widest text-black transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {uploading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black border-t-transparent" />
              Parsing with AI…
            </span>
          ) : 'Upload & Parse'}
        </button>
      </div>
    </div>
  )

  // Edit phase
  if (!data) return null

  const detectedSubjects = Array.from(
    new Set(data.days.flatMap(d => Object.values(data.grid[d] ?? {})).filter(Boolean))
  )

  return (
    <div className="min-h-full bg-[#0a0a0f] p-6">
      {/* Header */}
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="label-upper">Step 2 of 2</p>
          <h1 className="mt-0.5 text-2xl font-black uppercase tracking-tight text-white">
            REVIEW & <span className="text-[#00e5ff]">EDIT</span>
          </h1>
          <p className="mt-1 text-xs text-[#6b7280]">
            Section <span className="text-white font-semibold">{data.section}</span>
            {' · '}Sem <span className="text-white font-semibold">{data.semester}</span>
            {' · '}Click any cell to edit · hover a row to delete
          </p>
          {saveError && <p className="mt-1 text-xs text-[#ef4444]">{saveError}</p>}
        </div>
        <button
          onClick={handleConfirm}
          disabled={saving}
          className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-[#00e5ff] px-4 py-2.5 text-xs font-black uppercase tracking-widest text-black transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving
            ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black border-t-transparent" />
            : <Check size={13} />}
          {saving ? 'Saving…' : 'Confirm & Publish'}
        </button>
      </div>

      {/* Grid */}
      <div className="synapto-card p-4 overflow-x-auto">
        <table className="w-full border-collapse" style={{ minWidth: `${data.days.length * 130 + 140}px` }}>
          <thead>
            <tr>
              <th className="w-32 pb-3 pr-3 text-[10px] uppercase tracking-widest text-[#6b7280] text-left">Time Slot</th>
              {data.days.map(day => (
                <th key={day} className="pb-3 px-2 text-[10px] uppercase tracking-widest text-[#6b7280] text-left">{day}</th>
              ))}
              <th className="w-8 pb-3" />
            </tr>
          </thead>
          <tbody>
            {data.timeSlots.map(slot => (
              <tr key={slot} className="group border-t border-white/[0.04]">
                <td className="py-1.5 pr-3">
                  <span className="text-[11px] text-[#6b7280] whitespace-nowrap font-mono">{slot}</span>
                </td>
                {data.days.map(day => {
                  const isEditing = editCell?.day === day && editCell?.slot === slot
                  const subject = data.grid[day]?.[slot] ?? ''
                  return (
                    <td key={day} className="py-1 px-1.5">
                      {isEditing ? (
                        <input
                          autoFocus
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onBlur={() => commitEdit(day, slot, editValue)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') commitEdit(day, slot, editValue)
                            if (e.key === 'Escape') setEditCell(null)
                          }}
                          placeholder="Subject name…"
                          className="w-full rounded-lg border border-[#00e5ff]/50 bg-[#00e5ff]/[0.06] px-2.5 py-1.5 text-[11px] text-white outline-none"
                        />
                      ) : (
                        <button
                          onClick={() => startEdit(day, slot)}
                          className={`w-full rounded-lg px-2.5 py-2 text-left text-[11px] transition-colors min-h-[38px] ${
                            subject
                              ? 'bg-white/[0.05] text-white hover:bg-[#00e5ff]/[0.08] hover:text-[#00e5ff]'
                              : 'text-white/20 hover:bg-white/[0.03] hover:text-[#6b7280]'
                          }`}
                        >
                          {subject || '+ add'}
                        </button>
                      )}
                    </td>
                  )
                })}
                <td className="py-1 pl-1">
                  <button
                    onClick={() => removeSlot(slot)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md text-[#ef4444]/50 hover:text-[#ef4444] hover:bg-[#ef4444]/10"
                  >
                    <Trash2 size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add time slot */}
      <div className="mt-3">
        {addingSlot ? (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={newSlot}
              onChange={e => setNewSlot(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addSlot(); if (e.key === 'Escape') setAddingSlot(false) }}
              placeholder="e.g. 09:00-10:00"
              className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-xs text-white outline-none focus:border-[#00e5ff]/40 font-mono"
            />
            <button onClick={addSlot} className="rounded-lg bg-[#00e5ff]/10 px-3 py-2 text-xs font-bold text-[#00e5ff] hover:bg-[#00e5ff]/20">Add</button>
            <button onClick={() => setAddingSlot(false)} className="text-xs text-[#6b7280] hover:text-white px-2 py-2">Cancel</button>
          </div>
        ) : (
          <button
            onClick={() => setAddingSlot(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-white/[0.08] px-3 py-2 text-[11px] text-[#6b7280] transition-colors hover:border-white/20 hover:text-white"
          >
            <Plus size={12} /> Add Time Slot
          </button>
        )}
      </div>

      {/* Subject summary */}
      {detectedSubjects.length > 0 && (
        <div className="mt-5 synapto-card p-4">
          <p className="label-upper mb-3">Subjects in this timetable</p>
          <div className="flex flex-wrap gap-2">
            {detectedSubjects.map(sub => (
              <span key={sub} className="rounded-full border border-white/[0.07] bg-white/[0.03] px-3 py-1 text-[10px] text-[#6b7280]">
                {sub}
              </span>
            ))}
          </div>
          <p className="mt-3 text-[10px] text-[#6b7280]">
            These subjects will appear in the attendance tracker once you publish.
          </p>
        </div>
      )}
    </div>
  )
}
