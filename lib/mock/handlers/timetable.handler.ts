import { timetableData } from '@/lib/mock/data/timetable.data'

const delay = () => new Promise(r => setTimeout(r, 120 + Math.random() * 150))

export async function getTimetable() {
  await delay()
  return timetableData
}

export async function uploadTimetable(_formData: FormData) {
  await delay()
  return { success: true, message: 'Timetable parsed by AI and updated', timetable: timetableData }
}

export async function updateTimetable(_data: unknown) {
  await delay()
  return { success: true }
}
