import api from '@/api/client';
import { AttendanceRecordDto } from '@/api/types';

export async function getAttendanceRecords(sessionId?: string, studentId?: string): Promise<AttendanceRecordDto[]> {
  const params: Record<string, string> = {};
  if (sessionId) params.session = sessionId;
  if (studentId) params.student = studentId;
  const { data } = await api.get('/api/v1/attendance/attendance/', { params });
  return data.results || data;
}

export async function getAttendanceRecord(id: string): Promise<AttendanceRecordDto> {
  const { data } = await api.get(`/api/v1/attendance/attendance/${id}/`);
  return data;
}

export async function createAttendanceRecord(payload: Partial<AttendanceRecordDto>): Promise<AttendanceRecordDto> {
  const { data } = await api.post('/api/v1/attendance/attendance/', payload);
  return data;
}

export async function updateAttendanceRecord(id: string, payload: Partial<AttendanceRecordDto>): Promise<AttendanceRecordDto> {
  const { data } = await api.patch(`/api/v1/attendance/attendance/${id}/`, payload);
  return data;
}

export async function bulkMarkAttendance(payload: {
  session_id: string;
  records: Array<{
    student_id: string;
    status: string;
    note?: string;
  }>;
}): Promise<{ created: number; updated: number; errors: string[] }> {
  const { data } = await api.post('/api/v1/attendance/attendance/bulk/', payload);
  return data;
}






