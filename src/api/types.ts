// Minimal API types for initial integration (extend as needed)
export type UUID = string;

export type UserRole = 'ADMIN' | 'LECTURER' | 'STUDENT';

export interface UserDto {
  id: UUID;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone?: string;
  is_active?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  mfa_enabled?: boolean;
  profile_picture: string;
  profile_picture_url: string;

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
  media_url: string;
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
  // Computed fields from backend
  course_name?: string;
  lecturer_name?: string;
  enrollment_count?: number;
  is_active?: boolean;
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
  // Computed fields from backend
  cohort_name?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  status?: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
}

// Admissions
export interface ApplicationPhone {
  name: string;
  phone: string;
}

export interface ApplicationDto {
  id: UUID;
  program: UUID;
  name: string;
  email: string;
  
  phone: string;
  phones?: ApplicationPhone[];

  schedule_pref?: string;
  experience_level?: string;
  referral_source?: string;
  notes?: string;
  status: 'NEW' | 'IN_REVIEW' | 'ACCEPTED' | 'REJECTED';
  created_at: string;
  updated_at: string;
  program_name?: string;
  program_code?: string;
  organization?: UUID | null;
  status_display?: string;
}


export interface EnrollmentDto {
  id: UUID;
  student: UUID;
  cohort: UUID;
  status: 'PENDING' | 'WAITLISTED' | 'ACTIVE' | 'WITHDRAWN' | 'COMPLETED';
  enrolled_at: string;
  activated_at: string | null;
  completed_at: string | null;
  // Computed fields from backend
  student_name?: string;
  cohort_name?: string;
  status_display?: string;
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
  // Computed fields from backend
  student_name?: string;
  cohort_name?: string;
  serial_number?: string;
  qr_code?: string;
}



