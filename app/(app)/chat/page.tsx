"use client"

import { useEffect, useRef, useState } from 'react'
import { getChatRooms, getChatMessages, getSectionRoom } from '@/lib/api'
import { useAuthStore } from '@/lib/store/authStore'
import { MessageSquare, Users, BookOpen, Send, Plus, Circle } from 'lucide-react'

interface ChatMessage {
  _id?: string; senderId: string; senderName?: string; content: string
  type?: 'text' | 'file' | 'ai_response'; status?: string; createdAt: string
}
interface Room {
  _id: string; name?: string; type: 'direct' | 'group' | 'study_group' | 'study'
  participants: string[]; lastMessage?: { content: string; createdAt: string }
  unreadCount?: number; presence?: Record<string, boolean>
}

const roomIcon = (type: string) =>
  type === 'direct' ? MessageSquare : type === 'group' ? Users : BookOpen

const roomColor = (type: string) =>
  type === 'direct' ? '#00e5ff' : type === 'group' ? '#a855f7' : '#22c55e'

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 60000
  if (diff < 1) return 'now'
  if (diff < 60) return `${Math.floor(diff)}m`
  if (diff < 1440) return `${Math.floor(diff / 60)}h`
  return `${Math.floor(diff / 1440)}d`
}

export default function ChatPage() {
  const { user, token } = useAuthStore()
  const [rooms, setRooms] = useState<Room[]>([])
  const [activeRoom, setActiveRoom] = useState<Room | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WebSocket | null>(null)

  // Extract current user id from token
  const currentUserId = useRef('')
  useEffect(() => {
    if (!token) return
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      currentUserId.current = payload.userId || payload.id || payload.sub || 'mock-user-1'
    } catch { currentUserId.current = 'mock-user-1' }

    ;(async () => {
      try {
        // Ensure the user's section group chat exists and they're a member.
        const section = (await getSectionRoom().catch(() => null)) as Room | null
        const list = (await getChatRooms().catch(() => [])) as Room[]
        const loaded = Array.isArray(list) ? list : []
        setRooms(loaded)

        // Auto-open the section room (or the first available room).
        const pick = (section && loaded.find(r => r._id === section._id)) || section || loaded[0]
        if (pick) {
          setActiveRoom(pick)
          const msgs = await getChatMessages(pick._id).catch(() => [])
          setMessages(Array.isArray(msgs) ? msgs : ((msgs as { messages?: ChatMessage[] })?.messages ?? []))
        }
      } finally {
        setLoading(false)
      }
    })()
  }, [token])

  // Open WebSocket when activeRoom changes
  useEffect(() => {
    if (!activeRoom || !token) return

    wsRef.current?.close()

    const wsBase = (() => {
      const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:'
      let base =
        process.env.NEXT_PUBLIC_CHAT_WS_URL ||
        (process.env.NEXT_PUBLIC_GATEWAY_URL
          ? process.env.NEXT_PUBLIC_GATEWAY_URL.replace(/^http/, 'ws') + '/api/chat/ws'
          : '')
      // On a deployed (https) site, never point at localhost or insecure ws://
      // (browsers block mixed content). Fall back to the production backend.
      if (isHttps && (!base || base.includes('localhost') || base.startsWith('ws://'))) {
        base = 'wss://synapto.foo/api/chat/ws'
      }
      // Local dev default.
      if (!base) base = 'ws://localhost:4000/api/chat/ws'
      return base
    })()
    const ws = new WebSocket(`${wsBase}?token=${token}`)
    wsRef.current = ws

    ws.onopen = () => {
      ws.send(JSON.stringify({ event: 'JOIN_ROOM', data: { roomId: activeRoom._id } }))
    }

    ws.onmessage = (e) => {
      try {
        const { event, data } = JSON.parse(e.data)
        if (event === 'NEW_MESSAGE' && data?.roomId === activeRoom._id) {
          setMessages(prev => {
            // deduplicate: drop optimistic local copy if server echo arrives
            const filtered = prev.filter(m => !m._id?.startsWith('local-') || m.content !== data.content)
            return [...filtered, data]
          })
          setRooms(prev => prev.map(r =>
            r._id === data.roomId
              ? { ...r, lastMessage: { content: data.content, createdAt: data.createdAt } }
              : r
          ))
        }
      } catch { /* ignore malformed frames */ }
    }

    return () => {
      ws.close()
      wsRef.current = null
    }
  }, [activeRoom?._id, token])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const openRoom = async (room: Room) => {
    setActiveRoom(room)
    const res = await getChatMessages(room._id) as any
    setMessages(Array.isArray(res) ? res : (res.messages ?? []))
    setRooms(prev => prev.map(r => r._id === room._id ? { ...r, unreadCount: 0 } : r))
  }

  const handleSend = () => {
    const text = input.trim()
    if (!text || !activeRoom) return
    // Optimistic update
    const msg: ChatMessage = {
      _id: `local-${Date.now()}`,
      senderId: currentUserId.current || 'mock-user-1',
      senderName: user?.name ?? 'You',
      content: text,
      type: 'text',
      status: 'sent',
      createdAt: new Date().toISOString(),
    }
    setMessages(prev => [...prev, msg])
    setInput('')
    // Send via WebSocket
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        event: 'SEND_MESSAGE',
        data: { roomId: activeRoom._id, content: text },
      }))
    }
  }

  const isOwn = (msg: ChatMessage) =>
    msg.senderId === currentUserId.current || msg.senderId === 'mock-user-1'

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00e5ff] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex h-full bg-[#0a0a0f]">

      {/* Rooms sidebar */}
      <div className="w-64 shrink-0 flex flex-col border-r border-white/[0.07]">
        <div className="flex items-center justify-between p-4 border-b border-white/[0.07]">
          <p className="label-upper">Conversations</p>
          <button className="flex h-6 w-6 items-center justify-center rounded text-[#6b7280] hover:text-white transition-colors">
            <Plus size={13} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {rooms.map(room => {
            const Icon = roomIcon(room.type)
            const color = roomColor(room.type)
            const isActive = activeRoom?._id === room._id
            return (
              <button
                key={room._id}
                onClick={() => openRoom(room)}
                className={`w-full rounded-lg px-3 py-3 text-left transition-colors mb-1 ${
                  isActive ? 'bg-[#00e5ff]/10 border border-[#00e5ff]/20' : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${color}15` }}>
                    <Icon size={13} style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-white truncate">{room.name ?? 'Chat'}</p>
                      {room.lastMessage && (
                        <span className="text-[9px] text-[#6b7280] ml-2 shrink-0">{timeAgo(room.lastMessage.createdAt)}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-[10px] text-[#6b7280] truncate max-w-[140px]">
                        {room.lastMessage?.content ?? 'No messages yet'}
                      </p>
                      {(room.unreadCount ?? 0) > 0 && (
                        <span className="ml-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#00e5ff] text-[9px] font-black text-black">
                          {room.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Chat area */}
      {activeRoom ? (
        <div className="flex flex-1 flex-col min-w-0">
          {/* Room header */}
          <div className="flex items-center gap-3 border-b border-white/[0.07] px-4 py-3">
            {(() => {
              const Icon = roomIcon(activeRoom.type)
              const color = roomColor(activeRoom.type)
              return (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: `${color}15` }}>
                  <Icon size={14} style={{ color }} />
                </div>
              )
            })()}
            <div>
              <p className="text-sm font-bold text-white">{activeRoom.name}</p>
              <p className="text-[10px] text-[#6b7280]">
                {activeRoom.participants.length} members ·
                {(activeRoom.type === 'study_group' || activeRoom.type === 'study') ? ' section group · @synapto enabled' : ` ${activeRoom.type.replace('_', ' ')}`}
              </p>
            </div>
            {activeRoom.presence && (
              <div className="ml-auto flex items-center gap-1">
                {Object.values(activeRoom.presence).filter(Boolean).length > 0 && (
                  <>
                    <Circle size={6} className="text-[#22c55e] fill-[#22c55e]" />
                    <span className="text-[10px] text-[#6b7280]">{Object.values(activeRoom.presence).filter(Boolean).length} online</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => {
              const own = isOwn(msg)
              const isAI = msg.type === 'ai_response'
              return (
                <div key={msg._id ?? i} className={`flex gap-2 ${own ? 'justify-end' : 'justify-start'}`}>
                  {!own && (
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[9px] font-black mt-0.5 ${isAI ? 'bg-[#00e5ff]/10 text-[#00e5ff]' : 'bg-white/10 text-white'}`}>
                      {isAI ? 'AI' : (msg.senderName?.[0] ?? '?')}
                    </div>
                  )}
                  <div className={`max-w-[70%] ${own ? 'items-end' : 'items-start'} flex flex-col`}>
                    {!own && (
                      <p className="mb-1 text-[9px] text-[#6b7280]">{msg.senderName ?? 'Unknown'}</p>
                    )}
                    <div className={`rounded-xl px-3 py-2 text-xs leading-relaxed ${
                      own
                        ? 'bg-[#00e5ff]/10 text-white border border-[#00e5ff]/20'
                        : isAI
                        ? 'bg-[#a855f7]/10 text-white border border-[#a855f7]/20'
                        : 'bg-[#111118] text-[#c0c0c0] border border-white/[0.07]'
                    }`}>
                      {msg.content}
                    </div>
                    <p className="mt-0.5 text-[9px] text-[#6b7280]">{timeAgo(msg.createdAt)}</p>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-white/[0.07] p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                placeholder={(activeRoom.type === 'study_group' || activeRoom.type === 'study') ? 'Message your section or @synapto to ask AI…' : 'Type a message…'}
                className="flex-1 rounded-xl border border-white/[0.07] bg-[#111118] px-4 py-2.5 text-xs text-white placeholder:text-[#6b7280] outline-none focus:border-[#00e5ff]/40"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00e5ff] text-black transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <MessageSquare size={32} className="text-[#6b7280]" />
          <p className="text-sm text-white font-medium">Select a conversation</p>
          <p className="text-xs text-[#6b7280]">Choose a room from the sidebar to start chatting</p>
        </div>
      )}
    </div>
  )
}
