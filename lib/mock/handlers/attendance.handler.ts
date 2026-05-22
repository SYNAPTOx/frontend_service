import { attendanceData } from '@/lib/mock/data/attendance.data'

const delay = () => new Promise(r => setTimeout(r, 120 + Math.random() * 150))

const logs = [...attendanceData.recentLogs]

export async function getStats() {
  await delay()
  return attendanceData.subjects
}

export async function logAttendance(data: { subject: string; date: string; status: string }) {
  await delay()
  const entry = { _id: `log-${Date.now()}`, ...data }
  logs.unshift(entry)
  return { success: true, record: entry }
}

export async function getBunkBudget() {
  await delay()
  return attendanceData.bunkBudget
}

export async function getPrediction() {
  await delay()
  return attendanceData.prediction
}

export async function getMassBunkPolls() {
  await delay()
  return attendanceData.massBunkPolls.filter(p => p.status === 'active')
}

export async function getAllPolls() {
  await delay()
  return attendanceData.massBunkPolls
}

export async function createPoll(data: { subject: string; proposedDate: string; reason: string }) {
  await delay()
  const poll = {
    _id: `poll-${Date.now()}`,
    ...data,
    status: 'active' as const,
    votes: { yes: 0, no: 0 },
    totalVoters: 0,
    createdBy: 'mock-user-1',
    createdAt: new Date().toISOString(),
    imposters: [],
  }
  attendanceData.massBunkPolls.unshift(poll)
  return poll
}

export async function vote(pollId: string, vote: 'yes' | 'no') {
  await delay()
  const poll = attendanceData.massBunkPolls.find(p => p._id === pollId)
  if (poll) poll.votes[vote]++
  return { success: true }
}

export async function getPollResult(pollId: string) {
  await delay()
  return attendanceData.massBunkPolls.find(p => p._id === pollId) ?? null
}
