import { http } from '@/lib/http'
import * as mock from '@/lib/mock/handlers/user.handler'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

export const getUserMe = () =>
  USE_MOCK ? mock.getMe() : http.get('/api/user/me')

export const updateProfile = (data: {
  name?: string; college?: string; branch?: string; year?: number; section?: string; bio?: string; semester?: number
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

export const sendCollegeEmailOtp = (collegeEmail: string) =>
  http.post('/api/user/verify-college-email', { collegeEmail })

export const confirmCollegeEmailOtp = (otp: string) =>
  http.post('/api/user/verify-college-email/confirm', { otp })

export const updateCodingProfiles = (data: {
  github?: string; linkedin?: string; leetcode?: string; codeforces?: string; hackerrank?: string
  custom?: { label: string; url: string }[]
}) => USE_MOCK ? Promise.resolve() : http.put('/api/user/profile', { codingProfiles: data })

export const uploadIdCardImage = (file: File, side: 'front' | 'back') => {
  if (USE_MOCK) return Promise.resolve({ url: '' })
  const formData = new FormData()
  formData.append('image', file)
  formData.append('side', side)
  return http.postForm<{ url: string }>('/api/user/id-card', formData)
}

// Alias used by profile page
export const updateUserProfile = updateProfile
