import { deadlineData } from '@/lib/mock/data/deadline.data'

const delay = () => new Promise(r => setTimeout(r, 120 + Math.random() * 150))

const deadlines = [...deadlineData.deadlines]

export async function getDeadlines() {
  await delay()
  return deadlines
}

export async function createDeadline(data: { title: string; description?: string; subject: string; dueDate: string; priority?: string; remindBeforeDays?: number }) {
  await delay()
  const dl = {
    _id: `dl-${Date.now()}`,
    title: data.title,
    description: data.description ?? '',
    subject: data.subject,
    dueDate: data.dueDate,
    priority: (data.priority ?? 'medium') as 'low' | 'medium' | 'high',
    remindBeforeDays: data.remindBeforeDays ?? 2,
    status: 'active' as const,
    studyPlan: { days: [{ day: 'Day 1', date: data.dueDate, tasks: ['AI is generating your study plan...'], completed: false }] },
    createdAt: new Date().toISOString(),
  }
  deadlines.unshift(dl as typeof deadlines[0])
  return dl
}

export async function updateDeadline(id: string, data: Partial<{ title: string; dueDate: string; priority: string; status: string }>) {
  await delay()
  const dl = deadlines.find(d => d._id === id)
  if (dl) Object.assign(dl, data)
  return dl
}

export async function markDone(deadlineId: string) {
  await delay()
  const dl = deadlines.find(d => d._id === deadlineId)
  if (dl) dl.status = 'done'
  return { success: true }
}

export async function deleteDeadline(deadlineId: string) {
  await delay()
  const idx = deadlines.findIndex(d => d._id === deadlineId)
  if (idx !== -1) deadlines.splice(idx, 1)
  return { success: true }
}

export async function getStudyPlan(deadlineId: string) {
  await delay()
  const dl = deadlines.find(d => d._id === deadlineId)
  return dl?.studyPlan ?? { days: [] }
}

export async function regeneratePlan(deadlineId: string) {
  await delay()
  const dl = deadlines.find(d => d._id === deadlineId)
  if (!dl) return { days: [] }
  const plan = { days: [{ day: 'Day 1', date: new Date().toISOString(), tasks: ['Regenerated: Review key concepts', 'Practice problems'], completed: false }] }
  dl.studyPlan = plan
  return plan
}
