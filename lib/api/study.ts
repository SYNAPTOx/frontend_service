import { http } from '@/lib/http'
import * as mock from '@/lib/mock/handlers/study.handler'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

export const uploadFile = (formData: FormData) =>
  USE_MOCK ? mock.uploadFile(formData) : http.postForm('/api/study/files/upload', formData)

export const getFiles = (subject?: string) =>
  USE_MOCK ? mock.getFiles(subject) : http.get(`/api/study/files${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`)

export const deleteFile = (fileId: string) =>
  USE_MOCK ? mock.deleteFile(fileId) : http.delete(`/api/study/files/${fileId}`)

export const getSubjects = () =>
  USE_MOCK ? mock.getSubjects() : http.get('/api/study/files/subjects')

export const getNotes = (search?: string) =>
  USE_MOCK ? mock.getNotes(search) : http.get(`/api/study/notes${search ? `?search=${encodeURIComponent(search)}` : ''}`)

export const createNote = (data: { title: string; subject: string; content: string; tags: string[] }) =>
  USE_MOCK ? mock.createNote(data) : http.post('/api/study/notes', data)

export const updateNote = (noteId: string, data: { title?: string; content?: string; tags?: string[] }) =>
  USE_MOCK ? mock.updateNote(noteId, data) : http.put(`/api/study/notes/${noteId}`, data)

export const deleteNote = (noteId: string) =>
  USE_MOCK ? mock.deleteNote(noteId) : http.delete(`/api/study/notes/${noteId}`)
