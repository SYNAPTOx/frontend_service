import { studyData } from '@/lib/mock/data/study.data'

const delay = () => new Promise(r => setTimeout(r, 120 + Math.random() * 150))

const files = [...studyData.files]
const notes = [...studyData.notes]

export async function uploadFile(_formData: FormData) {
  await delay()
  const newFile = {
    _id: `file-${Date.now()}`,
    fileName: 'Uploaded_File.pdf',
    subject: 'General',
    mimeType: 'application/pdf',
    processingStatus: 'pending' as const,
    fileSize: '1.0 MB',
    cloudinaryUrl: '#',
    createdAt: new Date().toISOString(),
  }
  files.unshift(newFile)
  return { fileId: newFile._id, file: newFile }
}

export async function getFiles(subject?: string) {
  await delay()
  return subject ? files.filter(f => f.subject === subject) : files
}

export async function deleteFile(fileId: string) {
  await delay()
  const idx = files.findIndex(f => f._id === fileId)
  if (idx !== -1) files.splice(idx, 1)
  return { success: true }
}

export async function getSubjects() {
  await delay()
  return studyData.subjects
}

export async function getNotes(search?: string) {
  await delay()
  if (!search) return notes
  const q = search.toLowerCase()
  return notes.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.tags.some(t => t.includes(q)))
}

export async function createNote(data: { title: string; subject: string; content: string; tags: string[] }) {
  await delay()
  const note = { _id: `note-${Date.now()}`, ...data, createdAt: new Date().toISOString() }
  notes.unshift(note)
  return note
}

export async function updateNote(noteId: string, data: Partial<{ title: string; content: string; tags: string[] }>) {
  await delay()
  const note = notes.find(n => n._id === noteId)
  if (note) Object.assign(note, data)
  return note
}

export async function deleteNote(noteId: string) {
  await delay()
  const idx = notes.findIndex(n => n._id === noteId)
  if (idx !== -1) notes.splice(idx, 1)
  return { success: true }
}
