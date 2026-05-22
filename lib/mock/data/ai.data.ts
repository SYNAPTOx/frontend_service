export const aiData = {
  sessions: [
    {
      _id: 'session-1',
      title: 'Attendance check',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      messages: [
        { role: 'user', content: 'What\'s my worst subject for attendance?', createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
        { role: 'assistant', content: 'Your worst attendance is in **Software Engineering** at **58%** — well below the 75% threshold. You\'ve attended only 7 out of 12 classes. You need to attend every single remaining class to avoid a shortage. I\'d recommend reaching out to the professor about this.', toolsUsed: ['get_attendance_status'], createdAt: new Date(Date.now() - 2 * 86400000 + 5000).toISOString() },
      ],
    },
    {
      _id: 'session-2',
      title: 'OS exam study plan',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      messages: [
        { role: 'user', content: 'Help me plan for my OS exam', createdAt: new Date(Date.now() - 86400000).toISOString() },
        { role: 'assistant', content: 'I found your **OS Mid-Sem Exam** deadline — it was due March 22 and is currently overdue. For future OS exams, based on your uploaded notes, I recommend focusing on: \n\n1. **CPU Scheduling** — practice Gantt charts for FCFS, SJF, RR\n2. **Memory Management** — page table calculations, TLB hits\n3. **Deadlock** — Banker\'s algorithm safety checks\n4. **File Systems** — inode calculations\n\nWould you like me to quiz you on any of these topics?', toolsUsed: ['get_upcoming_deadlines', 'search_my_knowledge'], createdAt: new Date(Date.now() - 86400000 + 8000).toISOString() },
      ],
    },
  ],

  streamingResponses: {
    default: 'Based on your notes and study history, I can help you with that! Let me search through your materials to give you the most relevant answer.',
    attendance: 'Your current attendance status: Data Structures 82% (safe), OS 78% (safe), CN 72% (borderline — careful!), DBMS 70% (borderline), SE 58% (critical — attend all classes). Would you like me to calculate your bunk budget for each subject?',
    quiz: 'Sure! Here\'s a question from your Operating Systems notes: \n\n**Q: What are the four necessary conditions for a deadlock?** \n\nA) Starvation, Aging, Hold and Wait, Circular Wait \nB) Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait \nC) Preemption, Circular Wait, Starvation, No Hold \nD) Mutual Exclusion, Preemption, No Hold, Linear Wait',
    deadline: 'You have 2 active deadlines coming up: \n\n📅 **DBMS Lab Assignment 3** — due in 2 days (March 31) — Priority: Medium \n📅 **CN Project Report** — due in 13 days (April 11) — Priority: Medium \n\nThe DBMS assignment should be your immediate focus. Would you like me to break down a study plan for it?',
    summary: 'I found your Operating Systems Notes file. Here\'s a quick summary: The notes cover process management, CPU scheduling algorithms (FCFS, SJF, Round Robin), memory management with virtual memory and paging, deadlock conditions and Banker\'s Algorithm, and file system concepts. Want me to go deeper on any section or generate a quiz?',
  },
}

/**
 * Creates a mock ReadableStream that emits SSE tokens for a given text.
 * Mirrors the exact format the real AI endpoint produces.
 */
export function createMockStream(text: string, sessionId: string, toolsUsed: string[] = []): ReadableStream<Uint8Array> {
  const words = text.split(' ')
  const encoder = new TextEncoder()

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      for (let i = 0; i < words.length; i++) {
        const token = words[i] + (i < words.length - 1 ? ' ' : '')
        const data = `data: ${JSON.stringify({ token, done: false })}\n\n`
        controller.enqueue(encoder.encode(data))
        await new Promise(r => setTimeout(r, 40))
      }
      const doneData = `data: ${JSON.stringify({ token: null, done: true, sessionId, toolsUsed })}\n\n`
      controller.enqueue(encoder.encode(doneData))
      controller.close()
    },
  })
}
