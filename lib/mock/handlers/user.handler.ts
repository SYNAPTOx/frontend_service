import { MOCK_USERS } from '@/lib/mock/data/auth.data'

const delay = () => new Promise(r => setTimeout(r, 120 + Math.random() * 150))

let profile = { ...MOCK_USERS.student }

const professors = [
  { _id: 'prof-1', name: 'Dr. Rajesh Kumar', subject: 'Operating Systems' },
  { _id: 'prof-2', name: 'Prof. Anita Sharma', subject: 'Data Structures' },
  { _id: 'prof-3', name: 'Dr. Suresh Patel', subject: 'Computer Networks' },
]

const settings = {
  notifications: { whatsapp: true, email: true, push: true },
  attendance_alerts: true,
  deadline_reminders: true,
  study_pack_ready: true,
  theme: 'dark',
}

export async function getMe() {
  await delay()
  return profile
}

export async function updateProfile(data: Partial<typeof profile>) {
  await delay()
  profile = { ...profile, ...data }
  return profile
}

export async function uploadAvatar(_formData: FormData) {
  await delay()
  return { avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' }
}

export async function getProfessors() {
  await delay()
  return professors
}

export async function addProfessor(data: { name: string; subject: string }) {
  await delay()
  const prof = { _id: `prof-${Date.now()}`, ...data }
  professors.push(prof)
  return prof
}

export async function deleteProfessor(professorId: string) {
  await delay()
  const idx = professors.findIndex(p => p._id === professorId)
  if (idx !== -1) professors.splice(idx, 1)
  return { success: true }
}

export async function getSettings() {
  await delay()
  return settings
}

export async function updateSettings(data: Record<string, unknown>) {
  await delay()
  Object.assign(settings, data)
  return settings
}
