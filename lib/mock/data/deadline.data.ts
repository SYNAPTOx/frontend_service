const now = new Date('2026-03-29')

export const deadlineData = {
  deadlines: [
    {
      _id: 'dl-1',
      title: 'OS Mid-Sem Exam',
      description: 'Covers processes, scheduling, memory management, and deadlocks. 50 marks.',
      subject: 'Operating Systems',
      dueDate: new Date('2026-03-22').toISOString(),
      priority: 'high' as const,
      remindBeforeDays: 3,
      status: 'overdue' as const,
      studyPlan: {
        days: [
          { day: 'Day 1', date: '2026-03-18', tasks: ['Read Chapter 3: CPU Scheduling', 'Solve 10 practice problems on FCFS/SJF'], completed: true },
          { day: 'Day 2', date: '2026-03-19', tasks: ['Study memory management and paging', 'Create flashcards for page replacement algorithms'], completed: true },
          { day: 'Day 3', date: '2026-03-20', tasks: ['Deadlock chapter — all 4 conditions', 'Banker\'s algorithm practice problems'], completed: true },
          { day: 'Day 4', date: '2026-03-21', tasks: ['Full revision — 2 practice papers', 'Focus on weak areas: TLB and thrashing'], completed: false },
        ],
      },
      createdAt: new Date('2026-03-15').toISOString(),
    },
    {
      _id: 'dl-2',
      title: 'DBMS Lab Assignment 3',
      description: 'Implement B-Tree indexing in C++ and submit a 5-page analysis report.',
      subject: 'Database Systems',
      dueDate: new Date('2026-03-31').toISOString(),
      priority: 'medium' as const,
      remindBeforeDays: 2,
      status: 'active' as const,
      studyPlan: {
        days: [
          { day: 'Day 1', date: '2026-03-29', tasks: ['Review B-Tree properties and insertion algorithm', 'Set up C++ project structure'], completed: false },
          { day: 'Day 2', date: '2026-03-30', tasks: ['Implement B-Tree insert and search', 'Write test cases for edge cases'], completed: false },
          { day: 'Day 3', date: '2026-03-31', tasks: ['Write analysis report — performance comparison', 'Submit before 11:59 PM'], completed: false },
        ],
      },
      createdAt: new Date('2026-03-25').toISOString(),
    },
    {
      _id: 'dl-3',
      title: 'CN Project Report',
      description: 'Group project on TCP congestion control analysis using Wireshark traces.',
      subject: 'Computer Networks',
      dueDate: new Date('2026-04-11').toISOString(),
      priority: 'medium' as const,
      remindBeforeDays: 5,
      status: 'active' as const,
      studyPlan: {
        days: [
          { day: 'Week 1', date: '2026-03-30', tasks: ['Collect Wireshark traces from lab session', 'Divide work among group members'], completed: false },
          { day: 'Week 2', date: '2026-04-06', tasks: ['Analyze CWND growth patterns', 'Document slow start, congestion avoidance, fast recovery phases'], completed: false },
          { day: 'Final Week', date: '2026-04-09', tasks: ['Write report — 15 pages minimum', 'Prepare 10-minute presentation', 'Submit on portal'], completed: false },
        ],
      },
      createdAt: new Date('2026-03-20').toISOString(),
    },
    {
      _id: 'dl-4',
      title: 'DSA Problem Set 4',
      description: 'Dynamic programming problems: LCS, Knapsack, Edit Distance, Matrix Chain.',
      subject: 'Data Structures',
      dueDate: new Date('2026-03-15').toISOString(),
      priority: 'low' as const,
      remindBeforeDays: 1,
      status: 'done' as const,
      studyPlan: {
        days: [
          { day: 'Day 1', date: '2026-03-13', tasks: ['Solve LCS and Knapsack problems', 'Understand memoization vs tabulation'], completed: true },
          { day: 'Day 2', date: '2026-03-14', tasks: ['Edit Distance and Matrix Chain Multiplication', 'Submit on LMS before midnight'], completed: true },
        ],
      },
      createdAt: new Date('2026-03-10').toISOString(),
    },
  ],
}
