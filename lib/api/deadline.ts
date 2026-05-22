import { http } from '@/lib/http'
import * as mock from '@/lib/mock/handlers/deadline.handler'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

export const getDeadlines = () =>
  USE_MOCK ? mock.getDeadlines() : http.get('/api/deadline')

export const createDeadline = (data: {
  title: string; description?: string; subject: string
  dueDate: string; priority?: 'low' | 'medium' | 'high'; remindBeforeDays?: number
}) => USE_MOCK ? mock.createDeadline(data) : http.post('/api/deadline', data)

export const updateDeadline = (id: string, data: Partial<{ title: string; dueDate: string; priority: string; status: string }>) =>
  USE_MOCK ? mock.updateDeadline(id, data) : http.put(`/api/deadline/${id}`, data)

export const markDeadlineDone = (deadlineId: string) =>
  USE_MOCK ? mock.markDone(deadlineId) : http.put(`/api/deadline/${deadlineId}/done`)

export const deleteDeadline = (deadlineId: string) =>
  USE_MOCK ? mock.deleteDeadline(deadlineId) : http.delete(`/api/deadline/${deadlineId}`)

export const getStudyPlan = (deadlineId: string) =>
  USE_MOCK ? mock.getStudyPlan(deadlineId) : http.get(`/api/deadline/${deadlineId}/plan`)

export const regenerateStudyPlan = (deadlineId: string) =>
  USE_MOCK ? mock.regeneratePlan(deadlineId) : http.post(`/api/deadline/${deadlineId}/plan/regenerate`, {})
