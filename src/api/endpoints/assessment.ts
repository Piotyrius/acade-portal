import api from '@/api/client';
import { AssessmentDto, SubmissionDto, GradeDto } from '@/api/types';

export type { SubmissionDto, GradeDto };

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

export async function createSubmission(assessmentId: string, payload: { text?: string; file?: File }): Promise<SubmissionDto> {
  if (payload.file) {
    const form = new FormData();
    form.append('assessment', assessmentId);
    if (payload.text) form.append('text', payload.text);
    form.append('file', payload.file);
    const { data } = await api.post('/api/v1/assessment/submissions/', form);
    return data;
  } else {
    const { data } = await api.post('/api/v1/assessment/submissions/', {
      assessment: assessmentId,
      text: payload.text || '',
    });
    return data;
  }
}

export async function updateSubmission(id: string, payload: Partial<SubmissionDto>): Promise<SubmissionDto> {
  const { data } = await api.patch(`/api/v1/assessment/submissions/${id}/`, payload);
  return data;
}

export async function deleteSubmission(id: string): Promise<void> {
  await api.delete(`/api/v1/assessment/submissions/${id}/`);
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

export async function moderateGrade(id: string, approved: boolean, comment?: string): Promise<GradeDto> {
  const payload: { approved: boolean; comment?: string } = { approved };
  if (comment && comment.trim()) {
    payload.comment = comment.trim();
  }
  const { data } = await api.post(`/api/v1/assessment/grades/${id}/moderate/`, payload);
  return data;
}

export async function deleteGrade(id: string): Promise<void> {
  await api.delete(`/api/v1/assessment/grades/${id}/`);
}




