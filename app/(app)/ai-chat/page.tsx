"use client"

import { useEffect, useRef, useState } from 'react'
import { getChatHistory, getChatSession, deleteChatSession, sendChatMessage } from '@/lib/api'
import { useAuthStore } from '@/lib/store/authStore'
import { Brain, Send, Plus, Zap, Search, Calendar, HelpCircle, BookOpen, Clock, Trash2 } from 'lucide-react'

interface Message { role: 'user' | 'assistant'; content: string; toolsUsed?: string[]; streaming?: boolean }
interface Session { _id: string; createdAt: string; messages: Message[]; title?: string }

const TOOL_LABELS: Record<string, string> = {
  search_my_knowledge: 'Searching your notes…',
  get_attendance_status: 'Checking attendance…',
  get_upcoming_deadlines: 'Fetching deadlines…',
  generate_quiz: 'Generating quiz…',
  summarize_content: 'Summarizing content…',
  get_timetable: 'Getting timetable…',
}

const SUGGESTIONS = [
  { text: "What's my attendance status?", icon: Zap },
  { text: "Quiz me on Operating Systems", icon: HelpCircle },
  { text: "What deadlines are coming up?", icon: Calendar },
  { text: "Summarize my OS notes", icon: BookOpen },
]

export default function AIChatPage() {
  const { user } = useAuthStore()
  const [sessions, setSessions] = useState<Session[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [activeTools, setActiveTools] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { loadHistory(true) }, [])
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const loadHistory = async (autoResume = false) => {
    try {
      const data = await getChatHistory() as { sessions: Session[] }
      const list = data.sessions || []
      setSessions(list)
      // On first load, automatically resume the most recent session
      if (autoResume && list.length > 0) {
        const recent = list[0]
        setCurrentSessionId(recent._id)
        try {
          const full = await getChatSession(recent._id) as Session
          setMessages(full.messages || [])
        } catch {}
      }
    } catch {}
  }

  const startNewSession = () => {
    setCurrentSessionId(undefined)
    setMessages([])
    setInput('')
    setActiveTools([])
  }

  const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation()
    try {
      await deleteChatSession(sessionId)
      setSessions(prev => prev.filter(s => s._id !== sessionId))
      if (currentSessionId === sessionId) startNewSession()
    } catch {}
  }

  const loadSession = async (s: Session) => {
    setCurrentSessionId(s._id)
    setMessages([])
    setActiveTools([])
    try {
      const full = await getChatSession(s._id) as Session
      setMessages(full.messages || [])
    } catch {}
  }

  const handleSend = async (text?: string) => {
    const msg = (text ?? input).trim()
    if (!msg || streaming) return
    setMessages(prev => [...prev, { role: 'user', content: msg }])
    setInput('')
    setStreaming(true)
    setActiveTools([])
    setMessages(prev => [...prev, { role: 'assistant', content: '', streaming: true }])

    try {
      const response = await sendChatMessage({ message: msg, sessionId: currentSessionId })
      if (!response.body) throw new Error('No body')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let accumulated = ''
      let usedTools: string[] = []

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const jsonStr = line.slice(6).trim()
          if (!jsonStr) continue
          try {
            const payload = JSON.parse(jsonStr)
            if (payload.tool) setActiveTools(prev => prev.includes(payload.tool) ? prev : [...prev, payload.tool])
            if (payload.token) {
              accumulated += payload.token
              setMessages(prev => {
                const updated = [...prev]
                const last = updated[updated.length - 1]
                if (last?.role === 'assistant') updated[updated.length - 1] = { ...last, content: accumulated, streaming: true }
                return updated
              })
            }
            if (payload.done) {
              if (payload.toolsUsed) usedTools = payload.toolsUsed
              if (payload.sessionId) setCurrentSessionId(payload.sessionId)
            }
          } catch {}
        }
      }

      setMessages(prev => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        if (last?.role === 'assistant') updated[updated.length - 1] = { ...last, content: accumulated || '…', streaming: false, toolsUsed: usedTools }
        return updated
      })
      setActiveTools([])
      loadHistory(false)
    } catch {
      setMessages(prev => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        if (last?.role === 'assistant' && last.streaming) updated[updated.length - 1] = { ...last, content: 'Something went wrong. Please try again.', streaming: false }
        return updated
      })
      setActiveTools([])
    } finally {
      setStreaming(false)
    }
  }

  const sessionTitle = (s: Session) => {
    if (s.title) return s.title
    const first = s.messages?.find(m => m.role === 'user')
    if (first) return first.content.slice(0, 38) + (first.content.length > 38 ? '…' : '')
    return new Date(s.createdAt).toLocaleDateString()
  }

  const firstName = user?.name?.split(' ')[0]?.toUpperCase() ?? 'ALEX'

  return (
    <div className="flex h-full bg-[#0a0a0f]">

      {/* Sessions sidebar */}
      <div className="hidden md:flex w-52 shrink-0 flex-col border-r border-white/[0.07]">
        <div className="p-3 border-b border-white/[0.07]">
          <button
            onClick={startNewSession}
            className="flex w-full items-center gap-2 rounded-lg bg-[#00e5ff]/10 px-3 py-2.5 text-xs font-bold text-[#00e5ff] transition-colors hover:bg-[#00e5ff]/20"
          >
            <Plus size={13} /> New Session
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          <p className="label-upper mb-2 px-2">Activity Log</p>
          {sessions.length === 0 ? (
            <p className="px-2 text-[10px] text-[#6b7280]">No past sessions</p>
          ) : (
            sessions.map(s => (
              <div
                key={s._id}
                className={`group mb-1 flex items-center gap-1 rounded-lg transition-colors ${
                  currentSessionId === s._id
                    ? 'bg-[#00e5ff]/10 text-[#00e5ff]'
                    : 'text-[#6b7280] hover:bg-white/5 hover:text-white'
                }`}
              >
                <button
                  onClick={() => loadSession(s)}
                  className="flex-1 min-w-0 px-3 py-2 text-left text-xs"
                >
                  <p className="truncate font-medium">{sessionTitle(s)}</p>
                  <p className="text-[9px] text-[#6b7280] mt-0.5">{new Date(s.createdAt).toLocaleDateString()}</p>
                </button>
                <button
                  onClick={e => handleDeleteSession(e, s._id)}
                  className="shrink-0 pr-2 opacity-0 group-hover:opacity-100 transition-opacity text-[#6b7280] hover:text-red-400"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main chat */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <div className="synapto-card rounded-none border-0 border-b p-4 flex items-center gap-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00e5ff]/10">
            <Brain size={18} className="text-[#00e5ff]" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-white">Neural Hub</h2>
            <p className="text-[10px] text-[#6b7280]">Advanced Neuro-Architecture · {firstName}_SYNTH</p>
          </div>
          <div className="ml-auto flex gap-4">
            {[
              { label: 'ACCURACY', value: '94%', color: '#22c55e' },
              { label: 'SESSIONS', value: sessions.length, color: '#00e5ff' },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center hidden sm:block">
                <p className="text-sm font-black" style={{ color }}>{value}</p>
                <p className="text-[9px] uppercase tracking-widest text-[#6b7280]">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-6 py-12">
              <Brain size={40} className="text-[#00e5ff]/40" />
              <div className="text-center">
                <p className="text-lg font-black text-white">How can I help you today?</p>
                <p className="text-xs text-[#6b7280] mt-1">I have access to your notes, attendance, and deadlines</p>
              </div>
              <div className="grid grid-cols-2 gap-2 w-full max-w-lg">
                {SUGGESTIONS.map(({ text, icon: Icon }) => (
                  <button
                    key={text}
                    onClick={() => handleSend(text)}
                    className="synapto-card flex items-center gap-2 p-3 text-left text-xs text-[#6b7280] hover:border-[#00e5ff]/20 hover:text-white transition-colors"
                  >
                    <Icon size={12} className="text-[#00e5ff] shrink-0" />
                    {text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#00e5ff]/10 mt-0.5">
                  <Brain size={13} className="text-[#00e5ff]" />
                </div>
              )}
              <div className={`max-w-[75%] ${msg.role === 'user' ? 'order-first' : ''}`}>
                {msg.toolsUsed && msg.toolsUsed.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-1">
                    {msg.toolsUsed.map(t => (
                      <span key={t} className="rounded-full bg-[#a855f7]/10 px-2 py-0.5 text-[9px] font-medium text-[#a855f7] border border-[#a855f7]/20">
                        <Search size={8} className="inline mr-1" />
                        {TOOL_LABELS[t] ?? t}
                      </span>
                    ))}
                  </div>
                )}
                <div className={`rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-[#00e5ff]/10 text-white border border-[#00e5ff]/20'
                    : 'bg-[#111118] text-[#c0c0c0] border border-white/[0.07]'
                }`}>
                  {msg.content}
                  {msg.streaming && <span className="ml-1 inline-block h-3.5 w-0.5 animate-pulse bg-[#00e5ff] align-middle" />}
                </div>
              </div>
              {msg.role === 'user' && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 mt-0.5 text-[10px] font-bold text-white">
                  {firstName.slice(0, 2)}
                </div>
              )}
            </div>
          ))}

          {activeTools.length > 0 && (
            <div className="flex items-center gap-2 pl-10">
              {activeTools.map(t => (
                <span key={t} className="flex items-center gap-1 rounded-full bg-[#facc15]/10 px-2 py-0.5 text-[9px] text-[#facc15] border border-[#facc15]/20">
                  <Clock size={8} className="animate-spin" />
                  {TOOL_LABELS[t] ?? t}
                </span>
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-white/[0.07] p-4">
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
              placeholder="Ask anything about your studies…"
              rows={1}
              disabled={streaming}
              className="flex-1 resize-none rounded-xl border border-white/[0.07] bg-[#111118] px-4 py-3 text-sm text-white placeholder:text-[#6b7280] outline-none focus:border-[#00e5ff]/40 disabled:opacity-50 max-h-32"
              style={{ overflowY: 'auto' }}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || streaming}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#00e5ff] text-black transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              <Send size={16} />
            </button>
          </div>
          <p className="mt-2 text-center text-[9px] text-[#6b7280]">Shift+Enter for new line · Enter to send</p>
        </div>
      </div>
    </div>
  )
}
