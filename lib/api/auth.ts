import { http } from '@/lib/http'
import * as mock from '@/lib/mock/handlers/auth.handler'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

export const signupUser = (data: {
  name: string; email: string; password: string
  college: string; branch: string; year: number; section: string
}) => USE_MOCK ? mock.signup(data) : http.post('/api/auth/signup', data)

export const loginUser = (email: string, password: string) =>
  USE_MOCK ? mock.login(email, password) : http.post('/api/auth/login', { email, password })

export const getAuthMe = () =>
  USE_MOCK ? mock.getMe() : http.get('/api/auth/me')

export const googleLogin = (idToken: string) =>
  USE_MOCK ? mock.googleAuth(idToken) : http.post('/api/auth/google', { idToken })

export const forgotPassword = (email: string) =>
  USE_MOCK ? mock.forgotPassword(email) : http.post('/api/auth/forgot-password', { email })

export const resetPassword = (token: string, password: string) =>
  USE_MOCK ? mock.resetPassword(token, password) : http.post(`/api/auth/reset-password/${token}`, { password })

export const verifyEmail = (token: string) =>
  USE_MOCK ? mock.verifyEmail(token) : http.get(`/api/auth/verify/${token}`)
