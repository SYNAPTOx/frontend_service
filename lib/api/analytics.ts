import { http } from '@/lib/http'
import * as mock from '@/lib/mock/handlers/analytics.handler'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

export const getOverview = async () => {
  if (USE_MOCK) return mock.getOverview()
  const data = await http.get<any>('/api/analytics/overview')
  return {
    avgAttendance:       data?.attendance?.averagePercentage          ?? 0,
    quizzesTaken:        data?.quizzes?.takenLast30Days               ?? 0,
    deadlinesCompleted:  data?.deadlines?.onTime                      ?? 0,
    deadlinesTotal:      data?.deadlines?.totalCompleted              ?? 0,
    totalFiles:          data?.activity?.filesUploadedLast30Days      ?? 0,
    chatMessages:        data?.activity?.chatMessagesLast30Days       ?? 0,
    // not yet tracked in backend
    studyStreak:         0,
    totalHoursStudied:   0,
  }
}

export const getActivityHeatmap = async () => {
  if (USE_MOCK) return mock.getActivityHeatmap()
  const data = await http.get<any>('/api/analytics/activity')
  const raw: any[] = data?.heatmap ?? []
  // Page expects [{ date, count }]
  return raw.map((d) => ({ date: d.date as string, count: (d.totalActivity ?? 0) as number }))
}

export const getAttendanceAnalytics = async () => {
  if (USE_MOCK) return mock.getAttendanceAnalytics()
  const data = await http.get<any>('/api/analytics/attendance')
  // Backend: { trend: { "Subject": [{ date, percentage }] } }
  // Page expects: [{ week: "YYYY-MM-DD", "Subject": pct }] for Recharts LineChart
  const trend: Record<string, Array<{ date: string; percentage: number }>> = data?.trend ?? {}

  const dateMap: Record<string, Record<string, number>> = {}
  for (const [subject, points] of Object.entries(trend)) {
    for (const p of points) {
      if (!dateMap[p.date]) dateMap[p.date] = {}
      dateMap[p.date][subject] = Math.round(p.percentage * 10) / 10
    }
  }

  return Object.entries(dateMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, subjects]) => ({ week, ...subjects }))
}

export const getQuizAnalytics = async () => {
  if (USE_MOCK) return mock.getQuizAnalytics()
  const data = await http.get<any>('/api/analytics/quiz')
  // Backend: { trend: { "Subject": [{ date, score, total, percentage }] } }
  // Page expects: [{ date, subject, score, total, label }]
  const trend: Record<string, Array<{ date: string; score: number; total: number }>> = data?.trend ?? {}

  const results: Array<{ date: string; subject: string; score: number; total: number; label: string }> = []
  for (const [subject, points] of Object.entries(trend)) {
    for (const p of points) {
      results.push({
        date:    p.date?.slice(0, 10) ?? '',
        subject,
        score:   p.score,
        total:   p.total,
        label:   `${subject} Quiz`,
      })
    }
  }
  return results.sort((a, b) => a.date.localeCompare(b.date))
}

export const getStudyFeed = () =>
  USE_MOCK ? mock.getStudyFeed() : http.get('/api/analytics/activity')
