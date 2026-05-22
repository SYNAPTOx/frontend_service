const now = Date.now()
const m = (offset: number) => new Date(now - offset * 60000).toISOString()

export const chatData = {
  rooms: [
    {
      _id: 'room-1',
      type: 'direct',
      name: 'Priya Singh',
      participants: ['mock-user-1', 'mock-cr-1'],
      lastMessage: { content: 'Check the updated timetable I sent!', createdAt: m(5) },
      unreadCount: 2,
      presence: { 'mock-cr-1': true },
    },
    {
      _id: 'room-2',
      type: 'group',
      name: 'CS-2B Section',
      participants: ['mock-user-1', 'mock-cr-1', 'mock-user-3', 'mock-user-4', 'mock-user-5'],
      lastMessage: { content: 'Anyone else getting confused by the Banker\'s algo?', createdAt: m(30) },
      unreadCount: 0,
      presence: { 'mock-user-3': true, 'mock-user-4': false, 'mock-cr-1': true },
    },
    {
      _id: 'room-3',
      type: 'study_group',
      name: 'OS Exam Prep',
      participants: ['mock-user-1', 'mock-user-3', 'mock-user-6', 'mock-user-7'],
      lastMessage: { content: '[Synapto AI] The key difference between paging and segmentation is...', createdAt: m(120) },
      unreadCount: 5,
      subject: 'Operating Systems',
      presence: { 'mock-user-3': true, 'mock-user-6': false },
    },
  ],

  messages: {
    'room-1': [
      { _id: 'm1-1', senderId: 'mock-cr-1', senderName: 'Priya Singh', content: 'Hey! Did you see the new assignment for DBMS?', type: 'text', status: 'read', createdAt: m(120) },
      { _id: 'm1-2', senderId: 'mock-user-1', senderName: 'Alex Kumar', content: 'Just saw it. B-Tree implementation right?', type: 'text', status: 'read', createdAt: m(118) },
      { _id: 'm1-3', senderId: 'mock-cr-1', senderName: 'Priya Singh', content: 'Yes! Due March 31. Are you starting today?', type: 'text', status: 'read', createdAt: m(115) },
      { _id: 'm1-4', senderId: 'mock-user-1', senderName: 'Alex Kumar', content: 'Planning to. Also need to sort out CN attendance first 😅', type: 'text', status: 'read', createdAt: m(110) },
      { _id: 'm1-5', senderId: 'mock-cr-1', senderName: 'Priya Singh', content: 'Yeah your CN is at 72%, be careful. I can share my notes if you want', type: 'text', status: 'read', createdAt: m(108) },
      { _id: 'm1-6', senderId: 'mock-user-1', senderName: 'Alex Kumar', content: 'That would be amazing, thanks! Also did you create the mass bunk poll for CN?', type: 'text', status: 'read', createdAt: m(100) },
      { _id: 'm1-7', senderId: 'mock-cr-1', senderName: 'Priya Singh', content: 'Yes! Check the attendance page. 42 yes votes already 😂', type: 'text', status: 'read', createdAt: m(95) },
      { _id: 'm1-8', senderId: 'mock-user-1', senderName: 'Alex Kumar', content: 'Lol classic. Ok thanks for the heads up 🙏', type: 'text', status: 'read', createdAt: m(90) },
      { _id: 'm1-9', senderId: 'mock-cr-1', senderName: 'Priya Singh', content: 'Check the updated timetable I sent!', type: 'text', status: 'delivered', createdAt: m(5) },
      { _id: 'm1-10', senderId: 'mock-cr-1', senderName: 'Priya Singh', content: 'Labs moved to Friday 2pm', type: 'text', status: 'delivered', createdAt: m(4) },
    ],
    'room-2': [
      { _id: 'm2-1', senderId: 'mock-user-3', senderName: 'Rahul Sharma', content: 'Anyone done the OS assignment yet?', type: 'text', status: 'read', createdAt: m(180) },
      { _id: 'm2-2', senderId: 'mock-user-1', senderName: 'Alex Kumar', content: 'Half done. The scheduling part is fine, deadlock is tricky', type: 'text', status: 'read', createdAt: m(175) },
      { _id: 'm2-3', senderId: 'mock-cr-1', senderName: 'Priya Singh', content: 'Reminder: attendance sheet to be submitted by 5pm today', type: 'text', status: 'read', createdAt: m(150) },
      { _id: 'm2-4', senderId: 'mock-user-4', senderName: 'Sneha Joshi', content: 'What about the DBMS lab? Same deadline?', type: 'text', status: 'read', createdAt: m(145) },
      { _id: 'm2-5', senderId: 'mock-cr-1', senderName: 'Priya Singh', content: 'No DBMS lab is March 31. OS is today', type: 'text', status: 'read', createdAt: m(140) },
      { _id: 'm2-6', senderId: 'mock-user-5', senderName: 'Karan Mehta', content: '@synapto what is the Banker\'s algorithm in simple terms?', type: 'text', status: 'read', createdAt: m(60) },
      { _id: 'm2-7', senderId: 'synapto-bot', senderName: 'Synapto AI', content: 'The Banker\'s Algorithm is a deadlock avoidance algorithm. Imagine a bank that only gives loans when it can still serve all other customers. Before granting a resource request, the OS checks if the resulting state is "safe" — meaning all processes can eventually complete. If safe, it grants the request; otherwise, the process waits.', type: 'ai_response', status: 'read', createdAt: m(59) },
      { _id: 'm2-8', senderId: 'mock-user-5', senderName: 'Karan Mehta', content: 'Oh that makes sense! Thanks Synapto', type: 'text', status: 'read', createdAt: m(55) },
      { _id: 'm2-9', senderId: 'mock-user-3', senderName: 'Rahul Sharma', content: 'Anyone else getting confused by the Banker\'s algo?', type: 'text', status: 'read', createdAt: m(30) },
      { _id: 'm2-10', senderId: 'mock-user-1', senderName: 'Alex Kumar', content: 'Just use Synapto to explain it lol it\'s really good', type: 'text', status: 'read', createdAt: m(28) },
    ],
    'room-3': [
      { _id: 'm3-1', senderId: 'mock-user-3', senderName: 'Rahul Sharma', content: 'Guys let\'s start the OS exam prep session', type: 'text', status: 'read', createdAt: m(240) },
      { _id: 'm3-2', senderId: 'mock-user-1', senderName: 'Alex Kumar', content: 'In! What topics first?', type: 'text', status: 'read', createdAt: m(235) },
      { _id: 'm3-3', senderId: 'mock-user-6', senderName: 'Divya Nair', content: 'I\'m weak on memory management and paging', type: 'text', status: 'read', createdAt: m(230) },
      { _id: 'm3-4', senderId: 'mock-user-3', senderName: 'Rahul Sharma', content: '@synapto explain virtual memory and paging', type: 'text', status: 'read', createdAt: m(225) },
      { _id: 'm3-5', senderId: 'synapto-bot', senderName: 'Synapto AI', content: 'Virtual memory creates an illusion of more RAM than physically exists. Programs use virtual addresses; the MMU translates them to physical addresses using page tables. When a page isn\'t in RAM (page fault), the OS loads it from disk. The TLB caches recent translations for speed. Key algorithms: LRU replaces the least recently used page — it\'s optimal in practice.', type: 'ai_response', status: 'read', createdAt: m(224) },
      { _id: 'm3-6', senderId: 'mock-user-6', senderName: 'Divya Nair', content: 'That\'s so clear! Can it also quiz us?', type: 'text', status: 'read', createdAt: m(220) },
      { _id: 'm3-7', senderId: 'mock-user-1', senderName: 'Alex Kumar', content: 'Yes! Go to the study pack for OS notes, there\'s a 10 question quiz there', type: 'text', status: 'read', createdAt: m(215) },
      { _id: 'm3-8', senderId: 'mock-user-7', senderName: 'Arjun Bose', content: 'Added the OS notes file to this room, everyone can access the study pack', type: 'text', status: 'read', createdAt: m(180) },
      { _id: 'm3-9', senderId: 'mock-user-3', senderName: 'Rahul Sharma', content: 'This group study session is actually helping, we should do this before every exam', type: 'text', status: 'read', createdAt: m(150) },
      { _id: 'm3-10', senderId: 'synapto-bot', senderName: 'Synapto AI', content: 'The key difference between paging and segmentation is that paging divides memory into fixed-size pages (transparent to user), while segmentation uses variable-size logical units (code, stack, heap) that match program structure. Modern OS use segmentation with paging for best of both worlds.', type: 'ai_response', status: 'read', createdAt: m(120) },
    ],
  },
}
