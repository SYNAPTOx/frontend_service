export const MOCK_USERS = {
  student: {
    _id: 'mock-user-1',
    name: 'Alex Kumar',
    email: 'alex@test.com',
    college: 'IIT Bombay',
    branch: 'Computer Science',
    year: 2,
    section: 'B',
    isCR: false,
    bio: 'CS sophomore | caffeine-powered coder',
    phone: '+91 98765 43210',
  },
  cr: {
    _id: 'mock-cr-1',
    name: 'Priya Singh',
    email: 'priya@test.com',
    college: 'IIT Bombay',
    branch: 'Computer Science',
    year: 2,
    section: 'B',
    isCR: true,
    bio: 'CR of CS-2B | keeps the class together',
    phone: '+91 91234 56789',
  },
}

// Fake JWT that base64-decodes to a valid-looking payload
// payload: { userId: 'mock-user-1', email: 'alex@test.com', exp: 9999999999 }
export const MOCK_TOKEN =
  'eyJhbGciOiJIUzI1NiJ9.' +
  btoa(JSON.stringify({ userId: 'mock-user-1', email: 'alex@test.com', name: 'Alex Kumar', isCR: false, exp: 9999999999 }))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_') +
  '.mock_signature'
