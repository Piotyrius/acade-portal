import api from '@/api/client';
import { ApplicationDto, EnrollmentDto } from '@/api/types';

// Applications (Public - no auth required)
export async function submitPublicApplication(payload: Partial<ApplicationDto>): Promise<ApplicationDto> {
  const { data } = await api.post('/api/v1/admissions/applications/', payload);
  return data;
}

// Applications (Authenticated)
export async function getApplications(programId?: string, status?: string): Promise<ApplicationDto[]> {
  const params: Record<string, string> = {};
  if (programId) params.program = programId;
  if (status) params.status = status;
  const { data } = await api.get('/api/v1/admissions/applications/', { params });
  return data.results || data;
}

export async function getApplication(id: string): Promise<ApplicationDto> {
  const { data } = await api.get(`/api/v1/admissions/applications/${id}/`);
  return data;
}

export async function createApplication(payload: Partial<ApplicationDto>): Promise<ApplicationDto> {
  const { data } = await api.post('/api/v1/admissions/applications/', payload);
  return data;
}

export async function updateApplication(id: string, payload: Partial<ApplicationDto>): Promise<ApplicationDto> {
  const { data } = await api.patch(`/api/v1/admissions/applications/${id}/`, payload);
  return data;
}

export async function acceptApplication(id: string, cohortId: string): Promise<EnrollmentDto> {
  const { data } = await api.post(`/api/v1/admissions/applications/${id}/accept/`, { cohort_id: cohortId });
  return data;
}

// Enrollments
export async function getEnrollments(cohortId?: string, status?: string): Promise<EnrollmentDto[]> {
  const params: Record<string, string> = {};
  if (cohortId) params.cohort = cohortId;
  if (status) params.status = status;
  const { data } = await api.get('/api/v1/admissions/enrollments/', { params });
  return data.results || data;
}

export async function getEnrollment(id: string): Promise<EnrollmentDto> {
  const { data } = await api.get(`/api/v1/admissions/enrollments/${id}/`);
  return data;
}

export async function createEnrollment(payload: Partial<EnrollmentDto>): Promise<EnrollmentDto> {
  const { data } = await api.post('/api/v1/admissions/enrollments/', payload);
  return data;
}

export async function updateEnrollment(id: string, payload: Partial<EnrollmentDto>): Promise<EnrollmentDto> {
  const { data } = await api.patch(`/api/v1/admissions/enrollments/${id}/`, payload);
  return data;
}

export async function activateEnrollment(id: string, payload: { cohort: string; student: string }): Promise<EnrollmentDto> {
  const { data } = await api.post(`/api/v1/admissions/enrollments/${id}/activate/`, payload);
  return data;
}

export async function withdrawEnrollment(id: string, payload: { cohort: string; student: string }): Promise<EnrollmentDto> {
  const { data } = await api.post(`/api/v1/admissions/enrollments/${id}/withdraw/`, payload);
  return data;
}

export async function completeEnrollment(id: string, payload: { cohort: string; student: string }): Promise<EnrollmentDto> {
  const { data } = await api.post(`/api/v1/admissions/enrollments/${id}/complete/`, payload);
  return data;
}

export async function getWaitlist(): Promise<EnrollmentDto[]> {
  const { data } = await api.get('/api/v1/admissions/enrollments/waitlist/');
  return data.results || data;
}

export async function bulkActivateEnrollments(ids: string[]): Promise<{ activated: number; errors: string[] }> {
  const { data } = await api.post('/api/v1/admissions/enrollments/bulk_activate/', { enrollments_ids: ids });
  return data;
}









