import { http } from '@/lib/http'
import * as mock from '@/lib/mock/handlers/user.handler'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

export const getUserMe = () =>
  USE_MOCK ? mock.getMe() : http.get('/api/user/me')

export const updateProfile = (data: {
  name?: string; college?: string; branch?: string; year?: number; section?: string; bio?: string
}) => USE_MOCK ? mock.updateProfile(data) : http.put('/api/user/profile', data)

export const uploadAvatar = (formData: FormData) =>
  USE_MOCK ? mock.uploadAvatar(formData) : http.postForm('/api/user/avatar', formData)

export const getProfessors = () =>
  USE_MOCK ? mock.getProfessors() : http.get('/api/user/professors')

export const addProfessor = (data: { name: string; subject: string }) =>
  USE_MOCK ? mock.addProfessor(data) : http.post('/api/user/professors', data)

export const deleteProfessor = (professorId: string) =>
  USE_MOCK ? mock.deleteProfessor(professorId) : http.delete(`/api/user/professors/${professorId}`)

export const getSettings = () =>
  USE_MOCK ? mock.getSettings() : http.get('/api/user/settings')

export const updateSettings = (data: Record<string, unknown>) =>
  USE_MOCK ? mock.updateSettings(data) : http.put('/api/user/settings', data)

// Alias used by profile page
export const updateUserProfile = updateProfile
