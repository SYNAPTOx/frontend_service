"use client"

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { getFiles, uploadFile, deleteFile, getNotes, getSubjects, getTimetable } from '@/lib/api'
import { Upload, Cloud, FileText, Trash2, ExternalLink, Clock, CheckCircle, AlertCircle, Loader2, FolderOpen } from 'lucide-react'

interface StudyFile {
  _id: string
  fileName: string
  subject: string
  mimeType: string
  processingStatus: 'pending' | 'processing' | 'done' | 'failed'
  processingStage?: string
  fileSize?: string
  studyPackId?: string
  createdAt: string
}

interface Note {
  _id: string
  title: string
  subject: string
  content: string
  tags: string[]
  createdAt: string
}

const FALLBACK_COLORS = ['#00e5ff', '#a855f7', '#22c55e', '#facc15', '#f97316', '#ef4444', '#3b82f6']

function extractTimetableSubjects(timetable: any): { subject: string; color: string }[] {
  const seen = new Map<string, string>()
  const grid = timetable?.grid ?? timetable?.data?.grid ?? {}
  for (const day of Object.values(grid) as any[]) {
    if (!day || typeof day !== 'object') continue
    for (const slot of Object.values(day) as any[]) {
      // Real API: slot is a plain string e.g. "Data Structures"
      // Mock API: slot is { subject: "...", color: "..." }
      const name = typeof slot === 'string' ? slot : slot?.subject
      if (name && !seen.has(name)) {
        const color = typeof slot === 'object' ? (slot?.color ?? null) : null
        seen.set(name, color ?? FALLBACK_COLORS[seen.size % FALLBACK_COLORS.length])
      }
    }
  }
  return Array.from(seen.entries()).map(([subject, color]) => ({ subject, color }))
}

const typeColor = (mime: string) => {
  if (mime.includes('pdf')) return '#ef4444'
  if (mime.includes('video')) return '#a855f7'
  if (mime.includes('word')) return '#00e5ff'
  if (mime.includes('image')) return '#22c55e'
  return '#6b7280'
}

const typeLabel = (mime: string) => {
  if (mime.includes('pdf')) return 'PDF'
  if (mime.includes('video')) return 'VIDEO'
  if (mime.includes('word')) return 'DOCX'
  if (mime.includes('image')) return 'IMG'
  return 'FILE'
}

const statusIcon = (status: string) => {
  if (status === 'done') return <CheckCircle size={13} className="text-[#22c55e]" />
  if (status === 'failed') return <AlertCircle size={13} className="text-[#ef4444]" />
  if (status === 'processing') return <Loader2 size={13} className="text-[#facc15] animate-spin" />
  return <Clock size={13} className="text-[#6b7280]" />
}

export default function StudyPage() {
  const [files, setFiles] = useState<StudyFile[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [subjects, setSubjects] = useState<string[]>([])
  const [subjectColors, setSubjectColors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadSubject, setUploadSubject] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    Promise.all([getFiles(), getNotes(), getSubjects(), getTimetable()]).then(([f, n, s, tt]) => {
      setFiles(f as StudyFile[])
      setNotes(n as Note[])

      // Subjects from timetable (with colors) + any extra subjects from uploaded files
      const ttSubjects = extractTimetableSubjects(tt)
      const colorMap: Record<string, string> = {}
      ttSubjects.forEach(({ subject, color }) => { colorMap[subject] = color })

      const fileSubjects = (s as string[]).filter(Boolean)
      const merged = [...ttSubjects.map(t => t.subject)]
      fileSubjects.forEach(sub => { if (!colorMap[sub]) { colorMap[sub] = FALLBACK_COLORS[merged.length % FALLBACK_COLORS.length]; merged.push(sub) } })

      setSubjectColors(colorMap)
      setSubjects(merged)
      setLoading(false)
    })
  }, [])

  const handleUpload = async (f: File) => {
    if (!uploadSubject) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', f)
    fd.append('subject', uploadSubject)
    try {
      await uploadFile(fd)
      const updated = await getFiles()
      setFiles(updated as StudyFile[])
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    await deleteFile(id)
    setFiles(prev => prev.filter(f => f._id !== id))
  }

  // Group files by subject
  const bySubject = subjects.reduce<Record<string, StudyFile[]>>((acc, sub) => {
    acc[sub] = files.filter(f => f.subject === sub)
    return acc
  }, {})

  const recentFiles = [...files].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)
  const totalSize = files.length * 2.1 // mock approximation in MB

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00e5ff] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-full bg-[#0a0a0f] p-6">
      {/* Header */}
      <div className="mb-6">
        <p className="label-upper">Study Hub</p>
        <h1 className="mt-0.5 text-2xl font-black uppercase tracking-tight text-white">
          NEURAL <span className="text-[#00e5ff]">VAULT</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left — main content */}
        <div className="xl:col-span-3 space-y-6">

          {/* Folders */}
          <div>
            <p className="label-upper mb-3">Subject Folders</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {subjects.map(sub => {
                const count = bySubject[sub]?.length ?? 0
                const color = subjectColors[sub] ?? '#6b7280'
                return (
                  <div
                    key={sub}
                    className="synapto-card p-4 flex items-center gap-3 hover:border-[#00e5ff]/20 transition-colors cursor-pointer"
                    style={{ borderLeft: `3px solid ${color}` }}
                  >
                    <FolderOpen size={18} style={{ color }} />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{sub}</p>
                      <p className="text-[10px] text-[#6b7280]">{count} file{count !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* All Materials */}
          <div>
            <p className="label-upper mb-3">All Materials</p>
            <div className="space-y-2">
              {files.map(f => {
                const tColor = typeColor(f.mimeType)
                const tLabel = typeLabel(f.mimeType)
                return (
                  <div key={f._id} className="synapto-card flex items-center gap-3 p-3 hover:border-[#00e5ff]/20 transition-colors">
                    <div
                      className="flex h-8 w-12 shrink-0 items-center justify-center rounded text-[9px] font-black"
                      style={{ backgroundColor: `${tColor}15`, color: tColor }}
                    >
                      {tLabel}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">{f.fileName}</p>
                      <p className="text-[10px] text-[#6b7280]">{f.subject} · {f.fileSize ?? '—'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {statusIcon(f.processingStatus)}
                      {(f.processingStatus === 'done' || f.processingStatus === 'processing' || f.processingStatus === 'pending') && (
                        <Link
                          href={`/study/pack/${f._id}`}
                          className="rounded px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-[#00e5ff] hover:bg-[#00e5ff]/10 transition-colors"
                        >
                          {f.processingStatus === 'done' ? 'Pack' : 'View…'}
                        </Link>
                      )}
                      <button
                        onClick={() => handleDelete(f._id)}
                        className="rounded p-1 text-[#6b7280] hover:bg-red-500/10 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Upload Zone */}
          <div>
            <p className="label-upper mb-3">Transfer Core</p>
            <div className="mb-3">
              <select
                value={uploadSubject}
                onChange={e => setUploadSubject(e.target.value)}
                className="w-full rounded-lg border border-white/[0.07] bg-[#0a0a0f] px-3 py-2 text-xs text-white outline-none focus:border-[#00e5ff]/40 sm:w-auto"
              >
                <option value="">Select subject first</option>
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div
              onClick={() => uploadSubject && fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => {
                e.preventDefault()
                setDragOver(false)
                const f = e.dataTransfer.files[0]
                if (f) handleUpload(f)
              }}
              className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-colors cursor-pointer ${
                dragOver
                  ? 'border-[#00e5ff]/60 bg-[#00e5ff]/5'
                  : uploadSubject
                  ? 'border-white/20 hover:border-[#00e5ff]/40'
                  : 'border-white/[0.07] cursor-not-allowed'
              }`}
            >
              {uploading ? (
                <Loader2 size={32} className="text-[#00e5ff] animate-spin mb-3" />
              ) : (
                <Cloud size={32} className={uploadSubject ? 'text-[#00e5ff]' : 'text-[#6b7280]'} />
              )}
              <p className="mt-3 text-xs font-bold text-white">
                {uploading ? 'Uploading…' : 'Drop files to initiate multi-threaded cloud synchronization'}
              </p>
              <p className="mt-1 text-[10px] text-[#6b7280]">
                {uploadSubject ? 'PDF, DOCX, MP4, Images supported' : 'Select a subject above to enable upload'}
              </p>
            </div>
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept=".pdf,.docx,.mp4,.jpg,.jpeg,.png"
              onChange={e => {
                const f = e.target.files?.[0]
                if (f) handleUpload(f)
              }}
            />
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          {/* Recent */}
          <div className="synapto-card p-4">
            <p className="label-upper mb-3">Recent Materials</p>
            <div className="space-y-2">
              {recentFiles.map(f => (
                <div key={f._id} className="flex items-center gap-2">
                  {statusIcon(f.processingStatus)}
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-white truncate">{f.fileName}</p>
                    <p className="text-[9px] text-[#6b7280]">{f.subject}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Storage Pulse */}
          <div className="synapto-card p-4">
            <p className="label-upper mb-2">Storage Pulse</p>
            <p className="text-2xl font-black text-[#00e5ff]">{files.length}</p>
            <p className="text-[10px] text-[#6b7280] mb-3">files · ~{totalSize.toFixed(1)} MB used</p>
            <div className="progress-track">
              <div className="h-full rounded-full bg-[#00e5ff]" style={{ width: `${Math.min((totalSize / 100) * 100, 95)}%` }} />
            </div>
            <div className="mt-1 flex justify-between text-[9px] text-[#6b7280]">
              <span>{totalSize.toFixed(1)} MB</span>
              <span>100 MB</span>
            </div>
          </div>

          {/* Upgrade card */}
          <div className="synapto-card p-4 border-[#a855f7]/20">
            <div className="mb-2 flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-[#a855f7]/20 flex items-center justify-center">
                <Upload size={12} className="text-[#a855f7]" />
              </div>
              <p className="text-xs font-black text-[#a855f7] uppercase tracking-widest">Synapto Pro</p>
            </div>
            <p className="text-[10px] text-[#6b7280] mb-3">Unlimited storage, priority AI processing, video transcription</p>
            <button className="w-full rounded-lg bg-[#a855f7] py-2 text-[10px] font-black uppercase tracking-widest text-white hover:opacity-90 transition-opacity">
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
