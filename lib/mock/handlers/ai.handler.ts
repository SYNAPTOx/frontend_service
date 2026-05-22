import { aiData, createMockStream } from '@/lib/mock/data/ai.data'
import { studyPackData } from '@/lib/mock/data/studypack.data'

const delay = () => new Promise(r => setTimeout(r, 120 + Math.random() * 150))

function pickResponse(message: string): { text: string; tools: string[] } {
  const lower = message.toLowerCase()
  if (lower.includes('attendance') || lower.includes('bunk')) return { text: aiData.streamingResponses.attendance, tools: ['get_attendance_status'] }
  if (lower.includes('quiz') || lower.includes('test me') || lower.includes('question')) return { text: aiData.streamingResponses.quiz, tools: ['generate_quiz', 'search_my_knowledge'] }
  if (lower.includes('deadline') || lower.includes('due') || lower.includes('assignment')) return { text: aiData.streamingResponses.deadline, tools: ['get_upcoming_deadlines'] }
  if (lower.includes('summary') || lower.includes('summarize') || lower.includes('notes')) return { text: aiData.streamingResponses.summary, tools: ['search_my_knowledge', 'summarize_content'] }
  return { text: aiData.streamingResponses.default, tools: ['search_my_knowledge'] }
}

export async function sendMessage(data: { message: string; sessionId?: string }): Promise<Response> {
  // Small delay before stream starts
  await new Promise(r => setTimeout(r, 300))
  const { text, tools } = pickResponse(data.message)
  const sessionId = data.sessionId ?? `session-${Date.now()}`
  const stream = createMockStream(text, sessionId, tools)
  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
  })
}

export async function getChatHistory() {
  await delay()
  return aiData.sessions
}

export async function clearHistory() {
  await delay()
  return { success: true }
}

export async function getStudyPack(fileId: string) {
  await delay()
  if (fileId in studyPackData) return studyPackData[fileId as keyof typeof studyPackData]
  // Return processing status for other files
  return { fileId, status: 'processing', processingStage: 'Generating embeddings' }
}

export async function submitQuiz(fileId: string, answers: { questionIndex: number; selectedOption: number }[]) {
  await delay()
  const pack = studyPackData[fileId as keyof typeof studyPackData]
  if (!pack || !pack.quiz) return { score: 0, total: 0 }
  let score = 0
  const results = answers.map(a => {
    const q = pack.quiz![a.questionIndex]
    const correct = q?.correctIndex === a.selectedOption
    if (correct) score++
    return { questionIndex: a.questionIndex, correct, correctIndex: q?.correctIndex, explanation: q?.explanation }
  })
  return { score, total: pack.quiz.length, percentage: Math.round((score / pack.quiz.length) * 100), results }
}

export async function getFlashcards(fileId: string) {
  await delay()
  const pack = studyPackData[fileId as keyof typeof studyPackData]
  return pack?.flashcards ?? []
}
