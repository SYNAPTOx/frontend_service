"use client"

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getStudyPack, submitQuiz } from '@/lib/api'
import { Brain, BookOpen, HelpCircle, Zap, ChevronLeft, CheckCircle, XCircle, Loader2, GitBranch } from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────────

interface QuizQuestion {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}
interface Flashcard { front: string; back: string }
interface KeyTerm { term: string; definition: string }
interface MindMapNode { id: string; data: { label?: string; [k: string]: any }; position: { x: number; y: number } }
interface MindMapEdge { id: string; source: string; target: string }
interface MindMap { nodes: MindMapNode[]; edges: MindMapEdge[] }

interface StudyPack {
  status: 'pending' | 'processing' | 'done' | 'failed'
  processingStage?: string
  summary?: string
  quickSummary?: string
  quiz?: QuizQuestion[]
  flashcards?: Flashcard[]
  keyTerms?: KeyTerm[]
  mindMap?: MindMap
}

// ── Normalise snake_case → camelCase from Python backend ──────────────────────

function normalise(raw: any): StudyPack {
  return {
    status: raw.status,
    processingStage: raw.processingStage ?? raw.processing_stage,
    summary: raw.summary,
    quickSummary: raw.quickSummary ?? raw.quick_summary,
    quiz: (raw.quiz ?? []).map((q: any) => ({
      question: q.question,
      options: q.options ?? [],
      correctIndex: q.correctIndex ?? q.correct_index ?? 0,
      explanation: q.explanation ?? '',
    })),
    flashcards: raw.flashcards ?? [],
    keyTerms: raw.keyTerms ?? raw.key_terms ?? [],
    mindMap: raw.mindMap ?? raw.mind_map,
  }
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'summary',    label: 'Summary',    icon: BookOpen  },
  { id: 'quiz',       label: 'Quiz',       icon: HelpCircle },
  { id: 'flashcards', label: 'Flashcards', icon: Brain     },
  { id: 'keyterms',   label: 'Key Terms',  icon: Zap       },
  { id: 'mindmap',    label: 'Mind Map',   icon: GitBranch },
] as const

type Tab = typeof TABS[number]['id']

// ── Mind Map (SVG renderer — no external lib) ─────────────────────────────────

function MindMapView({ map }: { map: MindMap }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [scale, setScale] = useState(1)
  const [pan, setPan] = useState({ x: 40, y: 40 })
  const dragging = useRef<{ sx: number; sy: number; px: number; py: number } | null>(null)

  if (!map.nodes?.length) {
    return <p className="text-xs text-[#6b7280]">No mind map data generated.</p>
  }

  const nodeMap = new Map(map.nodes.map(n => [n.id, n]))

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    setScale(s => Math.max(0.3, Math.min(2.5, s - e.deltaY * 0.001)))
  }
  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = { sx: e.clientX, sy: e.clientY, px: pan.x, py: pan.y }
  }
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return
    setPan({ x: dragging.current.px + (e.clientX - dragging.current.sx), y: dragging.current.py + (e.clientY - dragging.current.sy) })
  }
  const onMouseUp = () => { dragging.current = null }

  return (
    <div className="relative w-full h-[520px] rounded-xl border border-white/[0.07] bg-[#0d0d14] overflow-hidden cursor-grab active:cursor-grabbing select-none">
      <p className="absolute top-2 right-3 z-10 text-[9px] text-[#6b7280]">Scroll to zoom · Drag to pan</p>
      <svg
        ref={svgRef}
        className="w-full h-full"
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <g transform={`translate(${pan.x},${pan.y}) scale(${scale})`}>
          {/* Edges */}
          {map.edges.map(edge => {
            const src = nodeMap.get(edge.source)
            const tgt = nodeMap.get(edge.target)
            if (!src || !tgt) return null
            const x1 = src.position.x + 60, y1 = src.position.y + 18
            const x2 = tgt.position.x + 60, y2 = tgt.position.y + 18
            const mx = (x1 + x2) / 2
            return (
              <path
                key={edge.id}
                d={`M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`}
                stroke="rgba(0,229,255,0.25)"
                strokeWidth={1.5}
                fill="none"
              />
            )
          })}
          {/* Nodes */}
          {map.nodes.map((node, i) => {
            const label = node.data?.label ?? node.data?.text ?? node.id
            const isRoot = i === 0
            return (
              <g key={node.id} transform={`translate(${node.position.x},${node.position.y})`}>
                <rect
                  width={120} height={36} rx={8}
                  fill={isRoot ? 'rgba(0,229,255,0.15)' : 'rgba(255,255,255,0.05)'}
                  stroke={isRoot ? '#00e5ff' : 'rgba(255,255,255,0.12)'}
                  strokeWidth={isRoot ? 1.5 : 1}
                />
                <text
                  x={60} y={22}
                  textAnchor="middle"
                  fill={isRoot ? '#00e5ff' : '#c0c0c0'}
                  fontSize={isRoot ? 10 : 9}
                  fontWeight={isRoot ? 700 : 400}
                >
                  {label.length > 16 ? label.slice(0, 15) + '…' : label}
                </text>
              </g>
            )
          })}
        </g>
      </svg>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function StudyPackPage() {
  const { fileId } = useParams<{ fileId: string }>()
  const [pack, setPack] = useState<StudyPack | null>(null)
  const [tab, setTab] = useState<Tab>('summary')
  const [loading, setLoading] = useState(true)

  // Quiz state
  const [selected, setSelected] = useState<(number | null)[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)

  // Flashcard state
  const [fcIndex, setFcIndex] = useState(0)
  const [fcFlipped, setFcFlipped] = useState(false)

  // Initial load
  useEffect(() => {
    getStudyPack(fileId)
      .then(data => {
        setPack(normalise(data))
        setLoading(false)
      })
      .catch(() => {
        // 404 = study pack not created yet (event still in queue)
        setPack({ status: 'pending', processingStage: 'queued' })
        setLoading(false)
      })
  }, [fileId])

  // Poll every 3s while still processing
  useEffect(() => {
    if (!pack || pack.status === 'done' || pack.status === 'failed') return
    const timer = setTimeout(() => {
      getStudyPack(fileId)
        .then(data => setPack(normalise(data)))
        .catch(() => {/* still not ready, keep polling */})
    }, 3000)
    return () => clearTimeout(timer)
  }, [pack, fileId])

  useEffect(() => {
    if (pack?.quiz) setSelected(new Array(pack.quiz.length).fill(null))
  }, [pack?.quiz?.length])

  const handleSubmitQuiz = async () => {
    if (!pack?.quiz) return
    const answers = selected.map((s, i) => ({ questionIndex: i, selectedOption: s ?? -1 }))
    const result = await submitQuiz(fileId, answers) as any
    setScore(result.score ?? selected.filter((s, i) => s === pack.quiz![i].correctIndex).length)
    setSubmitted(true)
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00e5ff] border-t-transparent" />
      </div>
    )
  }

  // ── Processing ──
  if (!pack || pack.status === 'pending' || pack.status === 'processing') {
    const stage = pack?.processingStage ?? 'queued'
    const stages = ['queued', 'embedding', 'generating', 'saving']
    const stageIdx = stages.indexOf(stage)
    return (
      <div className="flex h-full flex-col items-center justify-center gap-6 p-8">
        <Loader2 size={36} className="text-[#00e5ff] animate-spin" />
        <div className="text-center">
          <p className="text-sm font-bold text-white capitalize">{stage.replace('_', ' ')}…</p>
          <p className="text-xs text-[#6b7280] mt-1">AI is building your study pack · auto-refreshing</p>
        </div>
        {/* Stage progress */}
        <div className="flex gap-2 items-center">
          {stages.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full transition-colors ${i <= stageIdx ? 'bg-[#00e5ff]' : 'bg-white/10'}`} />
              <span className={`text-[9px] uppercase tracking-widest ${i <= stageIdx ? 'text-[#00e5ff]' : 'text-[#6b7280]'}`}>{s}</span>
              {i < stages.length - 1 && <div className="h-px w-4 bg-white/10" />}
            </div>
          ))}
        </div>
        <Link href="/study" className="text-xs text-[#6b7280] hover:text-white transition-colors">← Back to Study Hub</Link>
      </div>
    )
  }

  // ── Failed ──
  if (pack.status === 'failed') {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
        <XCircle size={36} className="text-[#ef4444]" />
        <p className="text-sm text-white">Study pack generation failed.</p>
        <Link href="/study" className="text-xs text-[#00e5ff] hover:underline">← Back to Study Hub</Link>
      </div>
    )
  }

  // ── Done ──
  return (
    <div className="min-h-full bg-[#0a0a0f] p-6">
      {/* Header */}
      <div className="mb-6">
        <Link href="/study" className="mb-3 flex items-center gap-1 text-[10px] text-[#6b7280] hover:text-white transition-colors">
          <ChevronLeft size={12} /> Back to Study Hub
        </Link>
        <p className="label-upper">Study Pack</p>
        <h1 className="mt-0.5 text-xl font-black uppercase text-white">
          AI <span className="text-[#00e5ff]">GENERATED</span> MATERIALS
        </h1>
        {pack.quickSummary && (
          <p className="mt-2 text-sm text-[#6b7280] max-w-2xl">{pack.quickSummary}</p>
        )}
      </div>

      {/* Stats row */}
      <div className="mb-6 flex gap-3 flex-wrap">
        {[
          { label: 'Questions', value: pack.quiz?.length ?? 0, color: '#a855f7' },
          { label: 'Flashcards', value: pack.flashcards?.length ?? 0, color: '#00e5ff' },
          { label: 'Key Terms', value: pack.keyTerms?.length ?? 0, color: '#22c55e' },
          { label: 'Mind Map Nodes', value: pack.mindMap?.nodes?.length ?? 0, color: '#facc15' },
        ].map(({ label, value, color }) => (
          <div key={label} className="synapto-card px-4 py-2 flex items-center gap-2">
            <p className="text-lg font-black" style={{ color }}>{value}</p>
            <p className="text-[10px] uppercase tracking-widest text-[#6b7280]">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl border border-white/[0.07] bg-[#111118] p-1 w-fit overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
              tab === id ? 'bg-[#00e5ff]/10 text-[#00e5ff]' : 'text-[#6b7280] hover:text-white'
            }`}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Summary ── */}
      {tab === 'summary' && (
        <div className="synapto-card p-6 max-w-3xl">
          <p className="label-upper mb-4">Detailed Summary</p>
          {pack.summary ? (
            pack.summary.split('\n\n').map((para, i) => (
              <p key={i} className="text-sm text-[#c0c0c0] leading-relaxed mb-4">{para}</p>
            ))
          ) : (
            <p className="text-xs text-[#6b7280]">No summary generated.</p>
          )}
        </div>
      )}

      {/* ── Quiz ── */}
      {tab === 'quiz' && (
        <div className="space-y-4 max-w-2xl">
          {!pack.quiz?.length ? (
            <p className="text-xs text-[#6b7280]">No quiz generated.</p>
          ) : (
            <>
              {submitted && (
                <div className="synapto-card p-4 flex items-center gap-4">
                  <div>
                    <p className="text-2xl font-black text-[#00e5ff]">{score}/{pack.quiz.length}</p>
                    <p className="text-[10px] uppercase tracking-widest text-[#6b7280]">Score</p>
                  </div>
                  <div className="h-8 w-px bg-white/10" />
                  <p className="text-sm text-white">
                    {score / pack.quiz.length >= 0.8 ? '🎉 Excellent!' : score / pack.quiz.length >= 0.6 ? '👍 Good effort!' : '📚 Keep studying!'}
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setSelected(new Array(pack.quiz!.length).fill(null)) }}
                    className="ml-auto rounded-lg border border-white/[0.07] px-3 py-1.5 text-xs text-[#6b7280] hover:text-white transition-colors"
                  >
                    Retry
                  </button>
                </div>
              )}

              {pack.quiz.map((q, qi) => {
                const sel = selected[qi]
                return (
                  <div key={qi} className="synapto-card p-5">
                    <p className="mb-3 text-sm font-medium text-white">
                      <span className="mr-2 text-[#00e5ff] font-black">{qi + 1}.</span>
                      {q.question}
                    </p>
                    <div className="space-y-2">
                      {q.options.map((opt, oi) => {
                        let cls = 'border border-white/[0.07] text-[#6b7280] hover:border-white/20'
                        if (sel === oi && !submitted) cls = 'border border-[#00e5ff]/40 bg-[#00e5ff]/10 text-[#00e5ff]'
                        if (submitted && oi === q.correctIndex) cls = 'border border-[#22c55e]/40 bg-[#22c55e]/10 text-[#22c55e]'
                        if (submitted && sel === oi && oi !== q.correctIndex) cls = 'border border-[#ef4444]/40 bg-[#ef4444]/10 text-[#ef4444]'
                        return (
                          <button
                            key={oi}
                            disabled={submitted}
                            onClick={() => setSelected(prev => { const n = [...prev]; n[qi] = oi; return n })}
                            className={`flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-xs transition-colors ${cls}`}
                          >
                            <span className="shrink-0 font-bold">{String.fromCharCode(65 + oi)}.</span>
                            {opt}
                            {submitted && oi === q.correctIndex && <CheckCircle size={12} className="ml-auto text-[#22c55e]" />}
                            {submitted && sel === oi && oi !== q.correctIndex && <XCircle size={12} className="ml-auto text-[#ef4444]" />}
                          </button>
                        )
                      })}
                    </div>
                    {submitted && (
                      <p className="mt-3 text-[11px] text-[#6b7280] border-t border-white/[0.07] pt-3">
                        <span className="font-bold text-white">Explanation: </span>{q.explanation}
                      </p>
                    )}
                  </div>
                )
              })}

              {!submitted && (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={selected.some(s => s === null)}
                  className="w-full rounded-lg bg-[#00e5ff] py-3 text-sm font-black uppercase tracking-widest text-black transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  Submit Quiz
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Flashcards ── */}
      {tab === 'flashcards' && (
        <div className="max-w-md">
          {!pack.flashcards?.length ? (
            <p className="text-xs text-[#6b7280]">No flashcards generated.</p>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <p className="label-upper">Card {fcIndex + 1} of {pack.flashcards.length}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setFcIndex(i => Math.max(0, i - 1)); setFcFlipped(false) }}
                    disabled={fcIndex === 0}
                    className="rounded-lg border border-white/[0.07] px-3 py-1.5 text-xs text-[#6b7280] hover:text-white disabled:opacity-30 transition-colors"
                  >← Prev</button>
                  <button
                    onClick={() => { setFcIndex(i => Math.min(pack.flashcards!.length - 1, i + 1)); setFcFlipped(false) }}
                    disabled={fcIndex === pack.flashcards.length - 1}
                    className="rounded-lg border border-white/[0.07] px-3 py-1.5 text-xs text-[#6b7280] hover:text-white disabled:opacity-30 transition-colors"
                  >Next →</button>
                </div>
              </div>
              <button
                onClick={() => setFcFlipped(f => !f)}
                className="synapto-card w-full min-h-48 p-8 text-center hover:border-[#00e5ff]/20 transition-all"
              >
                <p className="text-[10px] uppercase tracking-widest text-[#6b7280] mb-4">
                  {fcFlipped ? 'Definition · click to flip back' : 'Term · click to reveal'}
                </p>
                <p className="text-lg font-bold text-white">
                  {fcFlipped ? pack.flashcards[fcIndex].back : pack.flashcards[fcIndex].front}
                </p>
              </button>
              <div className="mt-4 flex gap-1">
                {pack.flashcards.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setFcIndex(i); setFcFlipped(false) }}
                    className="h-1 flex-1 rounded-full transition-colors"
                    style={{ backgroundColor: i === fcIndex ? '#00e5ff' : 'rgba(255,255,255,0.08)' }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Key Terms ── */}
      {tab === 'keyterms' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl">
          {pack.keyTerms?.length ? pack.keyTerms.map((kt, i) => (
            <div key={i} className="synapto-card p-4">
              <p className="text-sm font-bold text-[#00e5ff] mb-1">{kt.term}</p>
              <p className="text-xs text-[#6b7280] leading-relaxed">{kt.definition}</p>
            </div>
          )) : <p className="text-xs text-[#6b7280]">No key terms generated.</p>}
        </div>
      )}

      {/* ── Mind Map ── */}
      {tab === 'mindmap' && (
        <div className="max-w-4xl">
          <p className="label-upper mb-3">Mind Map</p>
          {pack.mindMap ? (
            <MindMapView map={pack.mindMap} />
          ) : (
            <p className="text-xs text-[#6b7280]">No mind map generated.</p>
          )}
        </div>
      )}
    </div>
  )
}
