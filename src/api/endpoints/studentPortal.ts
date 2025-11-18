import api from '@/api/client';
import { EnrollmentDto, AttendanceRecordDto, AssessmentDto, GradeDto, CertificateDto } from '@/api/types';

export async function getMyEnrollments(): Promise<EnrollmentDto[]> {
  const { data } = await api.get('/api/v1/me/enrollments/');
  return data;
}

export async function getMyAttendance(): Promise<AttendanceRecordDto[]> {
  const { data } = await api.get('/api/v1/me/attendance/');
  return data;
}

export async function getMyAssessments(): Promise<AssessmentDto[]> {
  const { data } = await api.get('/api/v1/me/assessments/');
  return data;
}

export async function getMyGrades(): Promise<GradeDto[]> {
  const { data } = await api.get('/api/v1/me/grades/');
  return data;
}

export async function getMyCertificates(): Promise<CertificateDto[]> {
  const { data } = await api.get('/api/v1/me/certificates/');
  return data;
}

