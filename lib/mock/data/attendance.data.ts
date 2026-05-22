export const attendanceData = {
  subjects: [
    { subject: 'Data Structures', code: 'CS-201', present: 28, total: 34, percentage: 82, status: 'safe' as const },
    { subject: 'Operating Systems', code: 'CS-301', present: 32, total: 41, percentage: 78, status: 'safe' as const },
    { subject: 'Computer Networks', code: 'CS-401', present: 21, total: 29, percentage: 72, status: 'borderline' as const },
    { subject: 'Database Systems', code: 'CS-302', present: 14, total: 20, percentage: 70, status: 'borderline' as const },
    { subject: 'Software Engineering', code: 'CS-402', present: 7, total: 12, percentage: 58, status: 'critical' as const },
    { subject: 'Digital Electronics', code: 'EC-201', present: 0, total: 0, percentage: 0, status: 'cancelled' as const },
  ],

  bunkBudget: [
    { subject: 'Data Structures', maxAbsencesAllowed: 3, currentAbsences: 6, safeToSkip: true },
    { subject: 'Operating Systems', maxAbsencesAllowed: 1, currentAbsences: 9, safeToSkip: true },
    { subject: 'Computer Networks', maxAbsencesAllowed: 0, currentAbsences: 8, safeToSkip: false },
    { subject: 'Database Systems', maxAbsencesAllowed: 0, currentAbsences: 6, safeToSkip: false },
    { subject: 'Software Engineering', maxAbsencesAllowed: 0, currentAbsences: 5, safeToSkip: false },
  ],

  prediction: [
    { subject: 'Computer Networks', daysUntilDrop: 6, message: 'Attend next 3 classes to reach 75%' },
    { subject: 'Database Systems', daysUntilDrop: 4, message: 'Critical: attend all remaining classes' },
    { subject: 'Software Engineering', daysUntilDrop: 0, message: 'Already below 75% — contact professor' },
  ],

  globalStats: {
    totalHours: 1240,
    efficiency: 94,
    bunked: 12,
    peerRank: 4,
    globalAttendance: 72.4,
  },

  massBunkPolls: [
    {
      _id: 'poll-1',
      subject: 'Computer Networks',
      proposedDate: new Date(Date.now() + 86400000).toISOString(),
      reason: 'Everyone is heading to the arcade for the gaming fest.',
      status: 'active',
      votes: { yes: 42, no: 8 },
      totalVoters: 50,
      createdBy: 'mock-cr-1',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      imposters: [],
    },
    {
      _id: 'poll-2',
      subject: 'Software Engineering',
      proposedDate: new Date(Date.now() - 172800000).toISOString(),
      reason: 'Seminar clash with IBM workshop.',
      status: 'closed',
      votes: { yes: 38, no: 4 },
      totalVoters: 42,
      createdBy: 'mock-cr-1',
      closedAt: new Date(Date.now() - 86400000).toISOString(),
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      imposters: [
        { userId: 'mock-user-3', name: 'Rahul Sharma', action: 'Voted YES but marked Present in Room 402' },
        { userId: 'mock-user-7', name: 'Ananya Patel', action: 'Voted YES but MAC address matched cafeteria WiFi' },
      ],
    },
  ],

  recentLogs: [
    { _id: 'log-1', subject: 'Data Structures', date: new Date().toISOString(), status: 'present' },
    { _id: 'log-2', subject: 'Operating Systems', date: new Date().toISOString(), status: 'present' },
    { _id: 'log-3', subject: 'Computer Networks', date: new Date(Date.now() - 86400000).toISOString(), status: 'absent' },
    { _id: 'log-4', subject: 'Database Systems', date: new Date(Date.now() - 86400000).toISOString(), status: 'present' },
    { _id: 'log-5', subject: 'Software Engineering', date: new Date(Date.now() - 172800000).toISOString(), status: 'absent' },
  ],
}
