import api from '@/api/client';
import { AssessmentDto, SubmissionDto, GradeDto } from '@/api/types';

// Assessments
export async function getAssessments(cohortId?: string): Promise<AssessmentDto[]> {
  const params = cohortId ? { cohort: cohortId } : {};
  const { data } = await api.get('/api/v1/assessment/assessments/', { params });
  return data.results || data;
}

export async function getAssessment(id: string): Promise<AssessmentDto> {
  const { data } = await api.get(`/api/v1/assessment/assessments/${id}/`);
  return data;
}

export async function createAssessment(payload: Partial<AssessmentDto>): Promise<AssessmentDto> {
  const { data } = await api.post('/api/v1/assessment/assessments/', payload);
  return data;
}

export async function updateAssessment(id: string, payload: Partial<AssessmentDto>): Promise<AssessmentDto> {
  const { data } = await api.patch(`/api/v1/assessment/assessments/${id}/`, payload);
  return data;
}

export async function deleteAssessment(id: string): Promise<void> {
  await api.delete(`/api/v1/assessment/assessments/${id}/`);
}

// Submissions
export async function getSubmissions(assessmentId?: string): Promise<SubmissionDto[]> {
  const params = assessmentId ? { assessment: assessmentId } : {};
  const { data } = await api.get('/api/v1/assessment/submissions/', { params });
  return data.results || data;
}

export async function getSubmission(id: string): Promise<SubmissionDto> {
  const { data } = await api.get(`/api/v1/assessment/submissions/${id}/`);
  return data;
}

export async function createSubmission(payload: Partial<SubmissionDto>): Promise<SubmissionDto> {
  const { data } = await api.post('/api/v1/assessment/submissions/', payload);
  return data;
}

export async function updateSubmission(id: string, payload: Partial<SubmissionDto>): Promise<SubmissionDto> {
  const { data } = await api.patch(`/api/v1/assessment/submissions/${id}/`, payload);
  return data;
}

// Grades
export async function getGrades(assessmentId?: string, studentId?: string): Promise<GradeDto[]> {
  const params: Record<string, string> = {};
  if (assessmentId) params.assessment = assessmentId;
  if (studentId) params.student = studentId;
  const { data } = await api.get('/api/v1/assessment/grades/', { params });
  return data.results || data;
}

export async function getGrade(id: string): Promise<GradeDto> {
  const { data } = await api.get(`/api/v1/assessment/grades/${id}/`);
  return data;
}

export async function createGrade(payload: Partial<GradeDto>): Promise<GradeDto> {
  const { data } = await api.post('/api/v1/assessment/grades/', payload);
  return data;
}

export async function updateGrade(id: string, payload: Partial<GradeDto>): Promise<GradeDto> {
  const { data } = await api.patch(`/api/v1/assessment/grades/${id}/`, payload);
  return data;
}



