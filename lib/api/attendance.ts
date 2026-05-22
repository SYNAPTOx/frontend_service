import { http } from '@/lib/http'
import * as mock from '@/lib/mock/handlers/attendance.handler'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

export const getAttendanceStats = async () => {
  if (USE_MOCK) return mock.getStats()
  const raw = await http.get<Record<string, { present: number; absent: number; total: number; percentage: string }>>('/api/attendance/stats')
  return Object.entries(raw).map(([subject, s]) => ({
    subject,
    present: s.present,
    absent: s.absent,
    total: s.total,
    percentage: parseFloat(s.percentage),
    status: parseFloat(s.percentage) >= 75 ? 'safe' : parseFloat(s.percentage) >= 60 ? 'warning' : 'critical',
  }))
}

export const logAttendance = (data: { subject: string; date: string; status: 'present' | 'absent' | 'cancelled' }) =>
  USE_MOCK ? mock.logAttendance(data) : http.post('/api/attendance/self', data)

export const getBunkBudget = () =>
  USE_MOCK ? mock.getBunkBudget() : http.get('/api/attendance/bunk-budget')

export const getAttendancePrediction = () =>
  USE_MOCK ? mock.getPrediction() : http.get('/api/attendance/prediction')

export const getMassBunkPolls = () =>
  USE_MOCK ? mock.getMassBunkPolls() : http.get('/api/mass-bunk/active')

export const getAllMassBunkPolls = () =>
  USE_MOCK ? mock.getAllPolls() : http.get('/api/mass-bunk')

export const createMassBunkPoll = (data: { subject: string; proposedDate: string; reason: string }) =>
  USE_MOCK ? mock.createPoll(data) : http.post('/api/mass-bunk', data)

export const voteMassBunk = (pollId: string, vote: 'yes' | 'no') =>
  USE_MOCK ? mock.vote(pollId, vote) : http.post(`/api/mass-bunk/${pollId}/vote`, { vote })

export const getMassBunkResult = (pollId: string) =>
  USE_MOCK ? mock.getPollResult(pollId) : http.get(`/api/mass-bunk/${pollId}/result`)
