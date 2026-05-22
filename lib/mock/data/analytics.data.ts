// 30-day heatmap (today = index 29)
function generateHeatmap() {
  const days = []
  for (let i = 0; i < 30; i++) {
    const date = new Date(Date.now() - (29 - i) * 86400000)
    const isWeekend = date.getDay() === 0 || date.getDay() === 6
    const isRecent = i >= 25
    const count = isWeekend ? 0 : isRecent ? Math.floor(Math.random() * 8) + 2 : Math.random() > 0.4 ? Math.floor(Math.random() * 6) : 0
    days.push({ date: date.toISOString().split('T')[0], count })
  }
  return days
}

// Weekly attendance trend (8 weeks, per subject)
const subjects = ['Data Structures', 'Operating Systems', 'Computer Networks', 'Database Systems']
const weeks = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8']

export const analyticsData = {
  overview: {
    avgAttendance: 72.4,
    quizzesTaken: 8,
    deadlinesCompleted: 3,
    deadlinesTotal: 4,
    studyStreak: 5,
    totalFiles: 5,
    chatMessages: 42,
    totalHoursStudied: 124,
  },

  heatmap: generateHeatmap(),

  attendanceTrend: weeks.map((week, i) => ({
    week,
    'Data Structures': Math.min(100, 75 + i * 1.5 + (Math.random() - 0.5) * 4),
    'Operating Systems': Math.min(100, 72 + i * 1 + (Math.random() - 0.5) * 5),
    'Computer Networks': Math.max(55, 78 - i * 0.8 + (Math.random() - 0.5) * 4),
    'Database Systems': Math.max(55, 76 - i * 0.9 + (Math.random() - 0.5) * 4),
  })),

  quizHistory: [
    { date: '2026-03-01', subject: 'Operating Systems', score: 6, total: 10, label: 'OS Quiz 1' },
    { date: '2026-03-05', subject: 'Data Structures', score: 8, total: 10, label: 'DSA Quiz 1' },
    { date: '2026-03-08', subject: 'Operating Systems', score: 7, total: 10, label: 'OS Quiz 2' },
    { date: '2026-03-12', subject: 'Computer Networks', score: 5, total: 10, label: 'CN Quiz 1' },
    { date: '2026-03-15', subject: 'Data Structures', score: 9, total: 10, label: 'DSA Quiz 2' },
    { date: '2026-03-18', subject: 'Operating Systems', score: 8, total: 10, label: 'OS Quiz 3' },
    { date: '2026-03-22', subject: 'Database Systems', score: 7, total: 10, label: 'DBMS Quiz 1' },
    { date: '2026-03-26', subject: 'Operating Systems', score: 10, total: 10, label: 'OS Final Pack' },
  ],

  studyFeed: [
    { type: 'quiz_completed', message: 'Scored 10/10 on OS Final Pack quiz', subject: 'Operating Systems', time: '2 hours ago', icon: '🏆' },
    { type: 'file_uploaded', message: 'Uploaded CN_Chapter5_Slides.pdf', subject: 'Computer Networks', time: '4 hours ago', icon: '📄' },
    { type: 'attendance_logged', message: 'Marked present for Data Structures', subject: 'Data Structures', time: '8 hours ago', icon: '✓' },
    { type: 'deadline_created', message: 'Added deadline: CN Project Report (Apr 11)', subject: 'Computer Networks', time: '1 day ago', icon: '📅' },
    { type: 'note_created', message: 'Created note: TCP vs UDP Comparison', subject: 'Computer Networks', time: '1 day ago', icon: '📝' },
    { type: 'quiz_completed', message: 'Scored 7/10 on DBMS Quiz 1', subject: 'Database Systems', time: '2 days ago', icon: '📊' },
    { type: 'studypack_ready', message: 'Study pack ready for OS Notes', subject: 'Operating Systems', time: '7 days ago', icon: '🤖' },
    { type: 'attendance_alert', message: 'SE attendance dropped to 58%', subject: 'Software Engineering', time: '3 days ago', icon: '⚠️' },
  ],

  studyHeatChartData: Array.from({ length: 14 }, (_, i) => ({
    day: new Date(Date.now() - (13 - i) * 86400000).toLocaleDateString('en', { weekday: 'short' }),
    hours: i >= 10 ? 2 + Math.random() * 4 : Math.random() > 0.5 ? Math.random() * 3 : 0,
  })),
}
