import { http } from '@/lib/http'
import * as mock from '@/lib/mock/handlers/analytics.handler'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

export const getOverview = () =>
  USE_MOCK ? mock.getOverview() : http.get('/api/analytics/overview')

export const getActivityHeatmap = () =>
  USE_MOCK ? mock.getActivityHeatmap() : http.get('/api/analytics/activity')

export const getAttendanceAnalytics = () =>
  USE_MOCK ? mock.getAttendanceAnalytics() : http.get('/api/analytics/attendance')

export const getQuizAnalytics = () =>
  USE_MOCK ? mock.getQuizAnalytics() : http.get('/api/analytics/quiz')

export const getStudyFeed = () =>
  USE_MOCK ? mock.getStudyFeed() : http.get('/api/analytics/activity')
