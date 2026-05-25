import { http } from '@/lib/http'
import * as mock from '@/lib/mock/handlers/ai.handler'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

export const sendChatMessage = (data: { message: string; sessionId?: string }): Promise<Response> =>
  USE_MOCK ? mock.sendMessage(data) : http.stream('/api/ai/chat', data)

export const getChatHistory = () =>
  USE_MOCK ? mock.getChatHistory() : http.get('/api/ai/chat/history')

export const getChatSession = (sessionId: string) =>
  USE_MOCK ? mock.getChatHistory() : http.get(`/api/ai/chat/${sessionId}`)

export const deleteChatSession = (sessionId: string) =>
  USE_MOCK ? Promise.resolve() : http.delete(`/api/ai/chat/${sessionId}`)

export const clearChatHistory = () =>
  USE_MOCK ? mock.clearHistory() : http.delete('/api/ai/chat/history')

export const getStudyPack = (fileId: string) =>
  USE_MOCK ? mock.getStudyPack(fileId) : http.get(`/api/ai/study-pack/${fileId}`)

export const submitQuiz = (fileId: string, answers: { questionIndex: number; selectedOption: number }[]) =>
  USE_MOCK ? mock.submitQuiz(fileId, answers) : http.post(`/api/ai/study-pack/${fileId}/quiz/submit`, { answers })

export const getFlashcards = (fileId: string) =>
  USE_MOCK ? mock.getFlashcards(fileId) : http.get(`/api/ai/study-pack/${fileId}/flashcards`)
