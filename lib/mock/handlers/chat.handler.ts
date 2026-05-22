import { chatData } from '@/lib/mock/data/chat.data'

const delay = () => new Promise(r => setTimeout(r, 120 + Math.random() * 150))

const rooms = [...chatData.rooms]
const messages: Record<string, typeof chatData.messages['room-1']> = { ...chatData.messages }

export async function getRooms() {
  await delay()
  return rooms
}

export async function getMessages(roomId: string, _cursor?: string) {
  await delay()
  return { messages: messages[roomId] ?? [], hasMore: false }
}

export async function createRoom(data: { name: string; type: string; participants: string[] }) {
  await delay()
  const room = { _id: `room-${Date.now()}`, ...data, lastMessage: null as any, unreadCount: 0, presence: {} }
  rooms.unshift(room as unknown as typeof rooms[0])
  messages[room._id] = []
  return room
}

export async function shareFile(roomId: string, fileId: string) {
  await delay()
  return { success: true, roomId, fileId }
}

export async function getPresence(userIds: string[]) {
  await delay()
  const presence: Record<string, boolean> = {}
  userIds.forEach(id => { presence[id] = id === 'mock-cr-1' || id === 'mock-user-3' })
  return presence
}
