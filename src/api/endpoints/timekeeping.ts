import api from '@/api/client';
import { WorkLogDto } from '@/api/types';

export async function getWorkLogs(params?: Record<string, any>): Promise<{ results?: WorkLogDto[] } | WorkLogDto[]> {
  const { data } = await api.get('/api/v1/timekeeping/worklogs/', { params });
  return data;
}

export async function createWorkLog(payload: {
  start_at: string;
  end_at: string;
  notes?: string;
  session?: string;
  lecturer: string;
  minutes: number;
}): Promise<WorkLogDto> {
  const { data } = await api.post('/api/v1/timekeeping/worklogs/', {
    ...payload,
    source: 'MANUAL',
  });
  return data;
}

export async function exportPayroll(from?: string, to?: string): Promise<Blob> {
  const { data } = await api.get('/api/v1/timekeeping/payroll/export/', {
    params: { from, to },
    responseType: 'blob',
  });
  return data;
}

// Rates
export interface RateDto {
  id: string;
  lecturer: string;
  per_hour_minor: number;
  currency: string;
  active: boolean;
  created_at: string;
}

export async function getRates(lecturerId?: string): Promise<RateDto[]> {
  const params = lecturerId ? { lecturer: lecturerId } : {};
  const { data } = await api.get('/api/v1/timekeeping/rates/', { params });
  return data.results || data;
}

export async function createRate(payload: {
  lecturer: string;
  per_hour_minor: number;
  currency?: string;
  active?: boolean;
}): Promise<RateDto> {
  const { data } = await api.post('/api/v1/timekeeping/rates/', payload);
  return data;
}

export async function updateRate(id: string, payload: Partial<RateDto>): Promise<RateDto> {
  const { data } = await api.patch(`/api/v1/timekeeping/rates/${id}/`, payload);
  return data;
}

export async function deleteRate(id: string): Promise<void> {
  await api.delete(`/api/v1/timekeeping/rates/${id}/`);
}

// Timesheets
export interface TimesheetDto {
  id: string;
  lecturer: string;
  period_start: string;
  period_end: string;
  status: 'OPEN' | 'SUBMITTED' | 'APPROVED' | 'PAID';
  total_minutes: number;
  amount_minor: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export async function getTimesheets(lecturerId?: string, status?: string): Promise<TimesheetDto[]> {
  const params: Record<string, string> = {};
  if (lecturerId) params.lecturer = lecturerId;
  if (status) params.status = status;
  const { data } = await api.get('/api/v1/timekeeping/timesheets/', { params });
  return data.results || data;
}

export async function createTimesheet(payload: {
  lecturer?: string;
  period_start: string;
  period_end: string;
  status?: 'OPEN' | 'SUBMITTED' | 'APPROVED' | 'PAID';
}): Promise<TimesheetDto> {
  const { data } = await api.post('/api/v1/timekeeping/timesheets/', payload);
  return data;
}

export async function updateTimesheet(id: string, payload: Partial<TimesheetDto>): Promise<TimesheetDto> {
  const { data } = await api.patch(`/api/v1/timekeeping/timesheets/${id}/`, payload);
  return data;
}

export async function deleteTimesheet(id: string): Promise<void> {
  await api.delete(`/api/v1/timekeeping/timesheets/${id}/`);
}



