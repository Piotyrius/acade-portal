// Minimal API types for initial integration (extend as needed)
export type UUID = string;

export type UserRole = 'ADMIN' | 'LECTURER' | 'STUDENT';

export interface UserDto {
  id: UUID;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
}

export interface TokenPair {
  access: string;
  refresh: string;
  user?: UserDto;
}

export interface WorkLogDto {
  id: UUID;
  lecturer: UUID;
  session: UUID | null;
  start_at: string;
  end_at: string;
  minutes: number;
  source: 'SESSION' | 'MANUAL';
  notes: string;
}

export interface WorkDto {
  id: UUID;
  owner: UUID;
  title: string;
  description: string;
  media: string;
  status: 'DRAFT' | 'PUBLISHED';
  is_public: boolean;
  published_at: string | null;
}

// Catalog
export interface ProgramDto {
  id: UUID;
  name: string;
  code: string;
  description: string;
  active: boolean;
  version: string;
  created_at: string;
  updated_at: string;
}

export interface CourseDto {
  id: UUID;
  program: UUID;
  title: string;
  code: string;
  hours: number;
  credits: number | null;
  syllabus_version: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface CohortDto {
  id: UUID;
  course: UUID;
  name: string;
  lecturer: UUID | null;
  capacity: number;
  start_date: string;
  end_date: string;
  status: 'PLANNED' | 'ENROLLING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  created_at: string;
  updated_at: string;
}

export interface SessionDto {
  id: UUID;
  cohort: UUID;
  start_at: string;
  end_at: string;
  location: string;
  online_link: string;
  is_cancelled: boolean;
  cancellation_reason: string;
  created_at: string;
  updated_at: string;
}

// Admissions
export interface ApplicationDto {
  id: UUID;
  program: UUID;
  name: string;
  email: string;
  phone: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  created_at: string;
  updated_at: string;
}

export interface EnrollmentDto {
  id: UUID;
  student: UUID;
  cohort: UUID;
  status: 'PENDING' | 'ACTIVE' | 'WITHDRAWN' | 'COMPLETED';
  enrolled_at: string;
  activated_at: string | null;
  completed_at: string | null;
}

// Attendance
export interface AttendanceRecordDto {
  id: UUID;
  session: UUID;
  student: UUID;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  note: string;
  marked_by: UUID;
  marked_at: string;
  student_name?: string;
  session_cohort?: string;
  session_start?: string;
  status_display?: string;
}

// Assessment
export interface AssessmentDto {
  id: UUID;
  cohort: UUID;
  title: string;
  description: string;
  type: 'EXAM' | 'QUIZ' | 'PROJECT' | 'ASSIGNMENT';
  kind?: 'EXAM' | 'QUIZ' | 'PROJECT';
  max_score: number;
  weight: number;
  due_date: string | null;
  due_at?: string;
  published?: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubmissionDto {
  id: UUID;
  assessment: UUID;
  student: UUID;
  submitted_at: string;
  file: string | null;
  text: string;
  notes: string;
  late_flag: boolean;
  student_name?: string;
  assessment_title?: string;
}

export interface GradeDto {
  id: UUID;
  assessment: UUID;
  student: UUID;
  score: number;
  max_score: number;
  percentage: string;
  feedback?: string;
  graded_at: string;
  student_name?: string;
  assessment_title?: string;
  graded_by_name?: string;
}

// Certificates
export interface CertificateDto {
  id: UUID;
  student: UUID;
  cohort: UUID;
  serial: string;
  qr_token: string;
  status: 'ISSUED' | 'REVOKED';
  issued_at: string;
  revoked_at: string | null;
  revocation_reason: string | null;
}



