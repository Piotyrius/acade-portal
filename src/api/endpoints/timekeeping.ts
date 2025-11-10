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
}): Promise<WorkLogDto> {
  const { data } = await api.post('/api/v1/timekeeping/worklogs/', {
    ...payload,
    source: 'MANUAL',
  });
  return data;
}

export async function exportPayroll(from?: string, to?: string): Promise<Blob> {
  const { data } = await api.get('/api/v1/timekeeping/payroll/export', {
    params: { from, to },
    responseType: 'blob',
  });
  return data;
}



