"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getStudyPack, submitQuiz } from '@/lib/api'
import { Brain, BookOpen, HelpCircle, Zap, ChevronLeft, CheckCircle, XCircle, Loader2 } from 'lucide-react'

interface QuizQuestion {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}
interface Flashcard { front: string; back: string }
interface KeyTerm { term: string; definition: string }
interface StudyPack {
  status: 'pending' | 'processing' | 'done' | 'failed'
  processingStage?: string
  summary?: string
  quickSummary?: string
  quiz?: QuizQuestion[]
  flashcards?: Flashcard[]
  keyTerms?: KeyTerm[]
}

const TABS = [
  { id: 'summary', label: 'Summary', icon: BookOpen },
  { id: 'quiz', label: 'Quiz', icon: HelpCircle },
  { id: 'flashcards', label: 'Flashcards', icon: Brain },
  { id: 'keyterms', label: 'Key Terms', icon: Zap },
] as const

type Tab = typeof TABS[number]['id']

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

  useEffect(() => {
    getStudyPack(fileId).then(data => {
      setPack(data as StudyPack)
      setLoading(false)
    })
  }, [fileId])

  useEffect(() => {
    if (pack?.quiz) setSelected(new Array(pack.quiz.length).fill(null))
  }, [pack])

  const handleSubmitQuiz = async () => {
    if (!pack?.quiz) return
    const answers = selected.map((s, i) => ({ questionIndex: i, selectedOption: s ?? -1 }))
    const result = await submitQuiz(fileId, answers)
    setScore((result as any).score ?? selected.filter((s, i) => s === pack.quiz![i].correctIndex).length)
    setSubmitted(true)
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00e5ff] border-t-transparent" />
      </div>
    )
  }

  if (!pack || pack.status === 'pending' || pack.status === 'processing') {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
        <Loader2 size={32} className="text-[#00e5ff] animate-spin" />
        <p className="text-sm font-medium text-white">
          {pack?.processingStage ?? 'AI is processing your file…'}
        </p>
        <p className="text-xs text-[#6b7280]">This usually takes 10–30 seconds</p>
        <Link href="/study" className="text-xs text-[#00e5ff] hover:underline">← Back to Study Hub</Link>
      </div>
    )
  }

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

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl border border-white/[0.07] bg-[#111118] p-1 w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-colors ${
              tab === id
                ? 'bg-[#00e5ff]/10 text-[#00e5ff]'
                : 'text-[#6b7280] hover:text-white'
            }`}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {/* Summary */}
      {tab === 'summary' && (
        <div className="synapto-card p-6 max-w-3xl">
          <p className="label-upper mb-4">Detailed Summary</p>
          <div className="prose prose-sm prose-invert max-w-none">
            {pack.summary?.split('\n\n').map((para, i) => (
              <p key={i} className="text-sm text-[#c0c0c0] leading-relaxed mb-4">{para}</p>
            ))}
          </div>
        </div>
      )}

      {/* Quiz */}
      {tab === 'quiz' && pack.quiz && (
        <div className="space-y-4 max-w-2xl">
          {submitted && (
            <div className="synapto-card p-4 flex items-center gap-4">
              <div>
                <p className="text-2xl font-black text-[#00e5ff]">{score}/{pack.quiz.length}</p>
                <p className="text-[10px] uppercase tracking-widest text-[#6b7280]">Score</p>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <p className="text-sm text-white">
                {score / pack.quiz.length >= 0.8 ? '🎉 Excellent work!' : score / pack.quiz.length >= 0.6 ? '👍 Good effort!' : '📚 Keep studying!'}
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
            const correct = submitted ? q.correctIndex : null
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
                    if (submitted && oi === correct) cls = 'border border-[#22c55e]/40 bg-[#22c55e]/10 text-[#22c55e]'
                    if (submitted && sel === oi && oi !== correct) cls = 'border border-[#ef4444]/40 bg-[#ef4444]/10 text-[#ef4444]'
                    return (
                      <button
                        key={oi}
                        disabled={submitted}
                        onClick={() => setSelected(prev => { const n = [...prev]; n[qi] = oi; return n })}
                        className={`flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-xs transition-colors ${cls}`}
                      >
                        <span className="shrink-0 font-bold">{String.fromCharCode(65 + oi)}.</span>
                        {opt}
                        {submitted && oi === correct && <CheckCircle size={12} className="ml-auto text-[#22c55e]" />}
                        {submitted && sel === oi && oi !== correct && <XCircle size={12} className="ml-auto text-[#ef4444]" />}
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
        </div>
      )}

      {/* Flashcards */}
      {tab === 'flashcards' && pack.flashcards && (
        <div className="max-w-md">
          <div className="mb-4 flex items-center justify-between">
            <p className="label-upper">Flashcard {fcIndex + 1} of {pack.flashcards.length}</p>
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
              {fcFlipped ? 'Definition (click to flip)' : 'Term (click to reveal)'}
            </p>
            <p className="text-lg font-bold text-white">
              {fcFlipped ? pack.flashcards[fcIndex].back : pack.flashcards[fcIndex].front}
            </p>
          </button>
          <div className="mt-4 flex gap-1">
            {pack.flashcards.map((_, i) => (
              <div key={i} className="h-1 flex-1 rounded-full" style={{ backgroundColor: i === fcIndex ? '#00e5ff' : 'rgba(255,255,255,0.08)' }} />
            ))}
          </div>
        </div>
      )}

      {/* Key Terms */}
      {tab === 'keyterms' && pack.keyTerms && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl">
          {pack.keyTerms.map((kt, i) => (
            <div key={i} className="synapto-card p-4">
              <p className="text-sm font-bold text-[#00e5ff] mb-1">{kt.term}</p>
              <p className="text-xs text-[#6b7280] leading-relaxed">{kt.definition}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
