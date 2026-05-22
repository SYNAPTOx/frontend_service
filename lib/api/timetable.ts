import { http } from '@/lib/http'
import * as mock from '@/lib/mock/handlers/timetable.handler'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

export const getTimetable = () =>
  USE_MOCK ? mock.getTimetable() : http.get('/api/timetable/me')

export const uploadTimetable = (formData: FormData) =>
  USE_MOCK ? mock.uploadTimetable(formData) : http.postForm('/api/timetable/upload', formData)

export const updateTimetable = (data: unknown) =>
  USE_MOCK ? mock.updateTimetable(data) : http.put('/api/timetable/me', data)
