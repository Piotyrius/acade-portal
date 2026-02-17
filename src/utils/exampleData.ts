// Example data to demonstrate UI functionality
export const examplePrograms = [
  {
    id: 'example-1',
    name: 'Full Stack Web Development',
    code: 'FSWD-2024',
    description: 'Comprehensive program covering frontend and backend development with modern technologies.',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'example-2',
    name: 'Data Science & Machine Learning',
    code: 'DSML-2024',
    description: 'Learn data analysis, visualization, and machine learning algorithms using Python and R.',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'example-3',
    name: 'Cybersecurity Fundamentals',
    code: 'CSEC-2024',
    description: 'Introduction to cybersecurity principles, ethical hacking, and security best practices.',
    active: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const exampleCourses = [
  {
    id: 'example-1',
    program: 'example-1',
    title: 'React Advanced Patterns',
    code: 'REACT-301',
    description: 'Deep dive into React hooks, context API, and performance optimization.',
    credits: 3,
    hours: 40,
    active: true,
    program_name: 'Full Stack Web Development',
  },
  {
    id: 'example-2',
    program: 'example-1',
    title: 'Node.js Backend Development',
    code: 'NODE-201',
    description: 'Build scalable backend applications using Node.js, Express, and MongoDB.',
    credits: 4,
    hours: 50,
    active: true,
    program_name: 'Full Stack Web Development',
  },
];

export const exampleCohorts = [
  {
    id: 'example-1',
    course: 'example-1',
    name: 'React Advanced - Spring 2024',
    lecturer: 'lecturer-1',
    capacity: 30,
    enrolled: 24,
    start_date: '2024-03-01',
    end_date: '2024-06-30',
    status: 'ACTIVE',
    course_title: 'React Advanced Patterns',
    lecturer_name: 'Dr. John Smith',
  },
  {
    id: 'example-2',
    course: 'example-2',
    name: 'Node.js Backend - Spring 2024',
    lecturer: 'lecturer-2',
    capacity: 25,
    enrolled: 20,
    start_date: '2024-03-15',
    end_date: '2024-07-15',
    status: 'ACTIVE',
    course_title: 'Node.js Backend Development',
    lecturer_name: 'Prof. Jane Doe',
  },
];

export const exampleSessions = [
  {
    id: 'example-1',
    cohort: 'example-1',
    start_at: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    end_at: new Date(Date.now() + 86400000 + 7200000).toISOString(), // Tomorrow + 2 hours
    location: 'Room 101',
    cohort_name: 'React Advanced - Spring 2024',
  },
  {
    id: 'example-2',
    cohort: 'example-1',
    start_at: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
    end_at: new Date(Date.now() + 172800000 + 7200000).toISOString(),
    location: 'Room 101',
    cohort_name: 'React Advanced - Spring 2024',
  },
];

export const exampleApplications = [
  {
    id: 'example-1',
    program: 'example-1',
    name: 'Alice Johnson',
    email: 'alice.johnson@example.com',
    phone: '+1-555-0101',
    status: 'PENDING',
    applied_at: new Date(Date.now() - 86400000).toISOString(),
    program_name: 'Full Stack Web Development',
  },
  {
    id: 'example-2',
    program: 'example-1',
    name: 'Bob Williams',
    email: 'bob.williams@example.com',
    phone: '+1-555-0102',
    status: 'ACCEPTED',
    applied_at: new Date(Date.now() - 172800000).toISOString(),
    program_name: 'Full Stack Web Development',
  },
];

export const exampleEnrollments = [
  {
    id: 'example-1',
    cohort: 'example-1',
    student: 'student-1',
    status: 'ACTIVE',
    enrolled_at: new Date(Date.now() - 2592000000).toISOString(),
    student_name: 'Alice Johnson',
    cohort_name: 'React Advanced - Spring 2024',
  },
  {
    id: 'example-2',
    cohort: 'example-1',
    student: 'student-2',
    status: 'WAITLISTED',
    enrolled_at: new Date(Date.now() - 1728000000).toISOString(),
    student_name: 'Bob Williams',
    cohort_name: 'React Advanced - Spring 2024',
  },
];

export const exampleAttendance = [
  {
    id: 'example-1',
    session: 'example-1',
    student: 'student-1',
    status: 'PRESENT',
    note: 'On time',
    marked_at: new Date(Date.now() - 3600000).toISOString(),
    student_name: 'Alice Johnson',
    session_cohort: 'React Advanced - Spring 2024',
    session_start: new Date(Date.now() - 3600000).toISOString(),
    status_display: 'Present',
  },
  {
    id: 'example-2',
    session: 'example-1',
    student: 'student-2',
    status: 'LATE',
    note: 'Arrived 10 minutes late',
    marked_at: new Date(Date.now() - 3600000).toISOString(),
    student_name: 'Bob Williams',
    session_cohort: 'React Advanced - Spring 2024',
    session_start: new Date(Date.now() - 3600000).toISOString(),
    status_display: 'Late',
  },
];

export const exampleAssessments = [
  {
    id: 'example-1',
    cohort: 'example-1',
    title: 'React Hooks Quiz',
    description: 'Test your understanding of React hooks including useState, useEffect, and custom hooks.',
    type: 'QUIZ',
    max_score: 100,
    weight: 10,
    due_date: new Date(Date.now() + 604800000).toISOString(),
    published: true,
  },
  {
    id: 'example-2',
    cohort: 'example-1',
    title: 'Final Project',
    description: 'Build a complete React application demonstrating all concepts learned.',
    type: 'PROJECT',
    max_score: 100,
    weight: 40,
    due_date: new Date(Date.now() + 2592000000).toISOString(),
    published: true,
  },
];

export const exampleSubmissions = [
  {
    id: 'example-1',
    assessment: 'example-1',
    student: 'student-1',
    text: 'I completed the quiz and answered all questions about React hooks.',
    file: null,
    submitted_at: new Date(Date.now() - 86400000).toISOString(),
    late_flag: false,
    student_name: 'Alice Johnson',
    assessment_title: 'React Hooks Quiz',
  },
];

export const exampleGrades = [
  {
    id: 'example-1',
    assessment: 'example-1',
    student: 'student-1',
    score: 85,
    max_score: 100,
    percentage: '85.00',
    feedback: 'Great work! Good understanding of hooks. Consider reviewing useEffect dependencies.',
    graded_at: new Date(Date.now() - 43200000).toISOString(),
    student_name: 'Alice Johnson',
    assessment_title: 'React Hooks Quiz',
    graded_by_name: 'Dr. John Smith',
  },
];

export const exampleCertificates = [
  {
    id: 'example-1',
    student: 'student-1',
    cohort: 'example-1',
    serial: 'CERT-2024-001',
    qr_token: 'qr-token-001',
    status: 'ISSUED',
    issued_at: new Date(Date.now() - 2592000000).toISOString(),
    student_name: 'Alice Johnson',
    cohort_name: 'React Advanced - Spring 2024',
  },
];

export const exampleDocuments = [
  {
    id: 'example-1',
    owner: 'user-1',
    kind: 'CONSENT',
    description: 'Course syllabus for React Advanced Patterns',
    file: '/documents/syllabus-react.pdf',
    visibility: 'LECTURER',
    created_at: new Date(Date.now() - 2592000000).toISOString(),
    updated_at: new Date(Date.now() - 2592000000).toISOString(),
  },
  {
    id: 'example-2',
    owner: 'user-1',
    kind: 'ID',
    description: 'Week 1 assignment instructions',
    file: '/documents/assignment-week1.pdf',
    visibility: 'ADMIN',
    created_at: new Date(Date.now() - 1728000000).toISOString(),
    updated_at: new Date(Date.now() - 1728000000).toISOString(),
  },
];

export const exampleWorkLogs = [
  {
    id: 'example-1',
    lecturer: 'lecturer-1',
    session: 'example-1',
    start_at: new Date(Date.now() - 86400000).toISOString(),
    end_at: new Date(Date.now() - 86400000 + 7200000).toISOString(),
    minutes: 120,
    source: 'SESSION',
    notes: 'Taught React hooks and context API',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'example-2',
    lecturer: 'lecturer-1',
    session: null,
    start_at: new Date(Date.now() - 172800000).toISOString(),
    end_at: new Date(Date.now() - 172800000 + 3600000).toISOString(),
    minutes: 60,
    source: 'MANUAL',
    notes: 'Graded assignments and provided feedback',
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

export const exampleRates = [
  {
    id: 'example-1',
    lecturer: 'lecturer-1',
    per_hour_minor: 5000, // $50.00
    currency: 'USD',
    active: true,
    created_at: new Date(Date.now() - 2592000000).toISOString(),
  },
];

export const exampleTimesheets = [
  {
    id: 'example-1',
    lecturer: 'lecturer-1',
    period_start: '2024-03-01',
    period_end: '2024-03-31',
    status: 'SUBMITTED',
    total_minutes: 2400,
    amount_minor: 200000, // $2000.00
    currency: 'USD',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const exampleWorks = [
  {
    id: 'example-1',
    owner: 'user-1',
    title: 'E-commerce Website',
    description: 'Full-stack e-commerce application built with React and Node.js',
    file: '/gallery/ecommerce-demo.jpg',
    published: true,
    created_at: new Date(Date.now() - 2592000000).toISOString(),
    updated_at: new Date(Date.now() - 2592000000).toISOString(),
  },
  {
    id: 'example-2',
    owner: 'user-1',
    title: 'Mobile App Design',
    description: 'UI/UX design for a fitness tracking mobile application',
    file: '/gallery/mobile-app-design.jpg',
    published: false,
    created_at: new Date(Date.now() - 1728000000).toISOString(),
    updated_at: new Date(Date.now() - 1728000000).toISOString(),
  },
];

