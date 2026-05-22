import { MOCK_USERS, MOCK_TOKEN } from '@/lib/mock/data/auth.data'

const delay = () => new Promise(r => setTimeout(r, 120 + Math.random() * 150))

export async function login(_email: string, _password: string) {
  await delay()
  return { success: true, token: MOCK_TOKEN, user: MOCK_USERS.student }
}

export async function signup(_data: unknown) {
  await delay()
  return { success: true, token: MOCK_TOKEN, user: MOCK_USERS.student }
}

export async function getMe() {
  await delay()
  return MOCK_USERS.student
}

export async function googleAuth(_idToken: string) {
  await delay()
  return { success: true, token: MOCK_TOKEN, user: MOCK_USERS.student }
}

export async function forgotPassword(_email: string) {
  await delay()
  return { success: true, message: 'OTP sent to your email' }
}

export async function resetPassword(_token: string, _password: string) {
  await delay()
  return { success: true, message: 'Password reset successfully' }
}

export async function verifyEmail(_token: string) {
  await delay()
  return { success: true, message: 'Email verified successfully' }
}
