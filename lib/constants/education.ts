// Canonical education options. Using fixed values (instead of free text) keeps
// section grouping consistent — everyone in the same college/branch picks the
// exact same string, so they land in the same section group chat.

export interface CollegeGroup {
  group: string
  options: string[]
}

export const COLLEGES: CollegeGroup[] = [
  {
    group: 'IITs',
    options: [
      'IIT Kharagpur',
      'IIT Bombay',
      'IIT Madras',
      'IIT Kanpur',
      'IIT Delhi',
      'IIT Guwahati',
      'IIT Roorkee',
      'IIT (BHU) Varanasi',
      'IIT (ISM) Dhanbad',
      'IIT Ropar',
      'IIT Bhubaneswar',
      'IIT Gandhinagar',
      'IIT Hyderabad',
      'IIT Jodhpur',
      'IIT Patna',
      'IIT Indore',
      'IIT Mandi',
      'IIT Palakkad',
      'IIT Tirupati',
      'IIT Bhilai',
      'IIT Goa',
      'IIT Jammu',
      'IIT Dharwad',
    ],
  },
  {
    group: 'NITs',
    options: [
      'NIT Trichy',
      'NIT Surathkal',
      'NIT Rourkela',
      'NIT Warangal',
      'NIT Calicut',
      'NIT Durgapur',
      'MNNIT Allahabad',
      'MANIT Bhopal',
      'VNIT Nagpur',
      'MNIT Jaipur',
      'NIT Kurukshetra',
      'NIT Jamshedpur',
      'NIT Silchar',
      'NIT Hamirpur',
      'NIT Jalandhar',
      'NIT Patna',
      'NIT Raipur',
      'NIT Srinagar',
      'NIT Agartala',
      'SVNIT Surat',
      'NIT Puducherry',
      'NIT Goa',
      'NIT Meghalaya',
      'NIT Arunachal Pradesh',
      'NIT Delhi',
      'NIT Manipur',
      'NIT Mizoram',
      'NIT Nagaland',
      'NIT Sikkim',
      'NIT Uttarakhand',
      'NIT Andhra Pradesh',
    ],
  },
]

// Flat list for quick membership checks / validation.
export const COLLEGE_OPTIONS: string[] = COLLEGES.flatMap((g) => g.options)

export const BRANCHES: string[] = [
  'Computer Science and Engineering',
  'Computer Science and Engineering (AI & ML)',
  'Computer Science and Engineering (Data Science)',
  'Information Technology',
  'Electronics and Communication Engineering',
  'Electronics and Instrumentation Engineering',
  'Electrical Engineering',
  'Electrical and Electronics Engineering',
  'Instrumentation Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Biotechnology',
  'Aerospace Engineering',
  'Aeronautical Engineering',
  'Automobile Engineering',
  'Production and Industrial Engineering',
  'Metallurgical and Materials Engineering',
  'Materials Science and Engineering',
  'Mining Engineering',
  'Engineering Physics',
  'Mathematics and Computing',
  'Architecture',
]

export const YEARS: string[] = ['1', '2', '3', '4', '5']
