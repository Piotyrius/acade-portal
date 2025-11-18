import api from '@/api/client';
import { ProgramDto, CourseDto, CohortDto, SessionDto } from '@/api/types';

// Programs
export async function getPrograms(): Promise<ProgramDto[]> {
  const { data } = await api.get('/api/v1/catalog/programs/');
  return data.results || data;
}

export async function getProgram(id: string): Promise<ProgramDto> {
  const { data } = await api.get(`/api/v1/catalog/programs/${id}/`);
  return data;
}

export async function createProgram(payload: Partial<ProgramDto>): Promise<ProgramDto> {
  const { data } = await api.post('/api/v1/catalog/programs/', payload);
  return data;
}

export async function updateProgram(id: string, payload: Partial<ProgramDto>): Promise<ProgramDto> {
  const { data } = await api.patch(`/api/v1/catalog/programs/${id}/`, payload);
  return data;
}

export async function deleteProgram(id: string): Promise<void> {
  await api.delete(`/api/v1/catalog/programs/${id}/`);
}

// Courses
export async function getCourses(programId?: string): Promise<CourseDto[]> {
  const params = programId ? { program: programId } : {};
  const { data } = await api.get('/api/v1/catalog/courses/', { params });
  return data.results || data;
}

export async function getCourse(id: string): Promise<CourseDto> {
  const { data } = await api.get(`/api/v1/catalog/courses/${id}/`);
  return data;
}

export async function createCourse(payload: Partial<CourseDto>): Promise<CourseDto> {
  const { data } = await api.post('/api/v1/catalog/courses/', payload);
  return data;
}

export async function updateCourse(id: string, payload: Partial<CourseDto>): Promise<CourseDto> {
  const { data } = await api.patch(`/api/v1/catalog/courses/${id}/`, payload);
  return data;
}

export async function deleteCourse(id: string): Promise<void> {
  await api.delete(`/api/v1/catalog/courses/${id}/`);
}

// Cohorts
export async function getCohorts(courseId?: string): Promise<CohortDto[]> {
  const params = courseId ? { course: courseId } : {};
  const { data } = await api.get('/api/v1/catalog/cohorts/', { params });
  return data.results || data;
}

export async function getCohort(id: string): Promise<CohortDto> {
  const { data } = await api.get(`/api/v1/catalog/cohorts/${id}/`);
  return data;
}

export async function createCohort(payload: Partial<CohortDto>): Promise<CohortDto> {
  const { data } = await api.post('/api/v1/catalog/cohorts/', payload);
  return data;
}

export async function updateCohort(id: string, payload: Partial<CohortDto>): Promise<CohortDto> {
  const { data } = await api.patch(`/api/v1/catalog/cohorts/${id}/`, payload);
  return data;
}

export async function deleteCohort(id: string): Promise<void> {
  await api.delete(`/api/v1/catalog/cohorts/${id}/`);
}

export async function generateSessions(cohortId: string, payload: {
  pattern: string;
  start_time: string;
  end_time: string;
  exclude_holidays?: boolean;
  manual_exclusions?: string[];
}): Promise<{ created: number; sessions: SessionDto[] }> {
  const { data } = await api.post(`/api/v1/catalog/cohorts/${cohortId}/generate_sessions/`, payload);
  return data;
}

// Sessions
export async function getSessions(cohortId?: string): Promise<SessionDto[]> {
  const params = cohortId ? { cohort: cohortId } : {};
  const { data } = await api.get('/api/v1/catalog/sessions/', { params });
  return data.results || data;
}

export async function getSession(id: string): Promise<SessionDto> {
  const { data } = await api.get(`/api/v1/catalog/sessions/${id}/`);
  return data;
}

export async function createSession(payload: Partial<SessionDto>): Promise<SessionDto> {
  const { data } = await api.post('/api/v1/catalog/sessions/', payload);
  return data;
}

export async function updateSession(id: string, payload: Partial<SessionDto>): Promise<SessionDto> {
  const { data } = await api.patch(`/api/v1/catalog/sessions/${id}/`, payload);
  return data;
}

export async function deleteSession(id: string): Promise<void> {
  await api.delete(`/api/v1/catalog/sessions/${id}/`);
}

// Lecturer-specific endpoints
export async function getMyCohorts(): Promise<CohortDto[]> {
  const { data } = await api.get('/api/v1/catalog/cohorts/me/');
  return data.results || data;
}

export async function getMySessions(params?: { date_from?: string; date_to?: string }): Promise<SessionDto[]> {
  const { data } = await api.get('/api/v1/catalog/sessions/me/', { params });
  return data.results || data;
}












