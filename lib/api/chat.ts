import { http } from '@/lib/http'
import * as mock from '@/lib/mock/handlers/chat.handler'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

export const getChatRooms = () =>
  USE_MOCK ? mock.getRooms() : http.get('/api/chat/rooms')

export const getChatMessages = (roomId: string, cursor?: string) =>
  USE_MOCK ? mock.getMessages(roomId, cursor) : http.get(`/api/chat/rooms/${roomId}/messages${cursor ? `?cursor=${cursor}` : ''}`)

export const createChatRoom = (data: { name: string; type: 'direct' | 'group' | 'study_group'; participants: string[] }) =>
  USE_MOCK ? mock.createRoom(data) : http.post('/api/chat/rooms', data)

export const shareFileInRoom = (roomId: string, fileId: string) =>
  USE_MOCK ? mock.shareFile(roomId, fileId) : http.post(`/api/chat/rooms/${roomId}/files`, { fileId })

export const getPresence = (userIds: string[]) =>
  USE_MOCK ? mock.getPresence(userIds) : http.get(`/api/chat/presence?users=${userIds.join(',')}`)
