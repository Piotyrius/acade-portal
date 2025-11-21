import api from '../client';

// Create a new enrollment
export async function createEnrollment(data: { student: string; cohort: string; notes?: string }) {
  const res = await api.post('/admissions/enrollments/', data);
  return res.data;
}
