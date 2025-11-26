import api from '../client';

/**
 * Export applications data as CSV
 */
export async function exportApplications(params?: { 
  from?: string; 
  to?: string;
  program?: string;
}): Promise<Blob> {
  const response = await api.get('/api/v1/reporting/reports/applications/', {
    params,
    responseType: 'blob',
  });
  return response.data;
}

/**
 * Export enrollments data as CSV
 */
export async function exportEnrollments(params?: { 
  from?: string; 
  to?: string;
  program?: string;
  cohort?: string;
}): Promise<Blob> {
  const response = await api.get('/api/v1/reporting/reports/enrollments/', {
    params,
    responseType: 'blob',
  });
  return response.data;
}

/**
 * Export attendance data as CSV
 */
export async function exportAttendance(params?: { 
  from?: string; 
  to?: string;
  cohort?: string;
  session?: string;
}): Promise<Blob> {
  const response = await api.get('/api/v1/reporting/reports/attendance/', {
    params,
    responseType: 'blob',
  });
  return response.data;
}

/**
 * Export grades data as CSV
 */
export async function exportGrades(params?: { 
  from?: string; 
  to?: string;
  cohort?: string;
  assessment?: string;
}): Promise<Blob> {
  const response = await api.get('/api/v1/reporting/reports/grades/', {
    params,
    responseType: 'blob',
  });
  return response.data;
}

/**
 * Export certificates data as CSV
 */
export async function exportCertificates(params?: { 
  from?: string; 
  to?: string;
  program?: string;
}): Promise<Blob> {
  const response = await api.get('/api/v1/reporting/reports/certificates/', {
    params,
    responseType: 'blob',
  });
  return response.data;
}

/**
 * Export payroll data as CSV
 */
export async function exportPayroll(params?: { 
  from?: string; 
  to?: string;
  lecturer?: string;
}): Promise<Blob> {
  const response = await api.get('/api/v1/reporting/reports/payroll/', {
    params,
    responseType: 'blob',
  });
  return response.data;
}

/**
 * Helper function to download blob as file
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
