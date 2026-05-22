import { analyticsData } from '@/lib/mock/data/analytics.data'

const delay = () => new Promise(r => setTimeout(r, 120 + Math.random() * 150))

export async function getOverview() {
  await delay()
  return analyticsData.overview
}

export async function getActivityHeatmap() {
  await delay()
  return analyticsData.heatmap
}

export async function getAttendanceAnalytics() {
  await delay()
  return analyticsData.attendanceTrend
}

export async function getQuizAnalytics() {
  await delay()
  return analyticsData.quizHistory
}

export async function getStudyFeed() {
  await delay()
  return analyticsData.studyFeed
}
