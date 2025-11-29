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

// ============================================================================
// Analytics DTOs
// ============================================================================

export interface CohortAnalyticsDto {
  cohort_id: string;
  cohort_name: string;
  student_count: number;
  attendance_rate: number;
  average_grade: number;
  financial_total_minor: number;
  currency: string;
}

export interface FinancialAnalyticsDto {
  total_revenue_minor: number;
  total_outstanding_minor: number;
  total_paid_minor: number;
  currency: string;
  breakdown_by_program: Array<{
    program_id: string;
    program_name: string;
    total_minor: number;
  }>;
  breakdown_by_cohort: Array<{
    cohort_id: string;
    cohort_name: string;
    total_minor: number;
  }>;
  breakdown_by_status: Array<{
    status: string;
    total_minor: number;
  }>;
}

export interface OverviewAnalyticsDto {
  total_enrollments: number;
  active_enrollments: number;
  completed_enrollments: number;
  total_revenue_minor: number;
  total_paid_minor: number;
  total_outstanding_minor: number;
  currency: string;
}

export interface StudentFinancialDto {
  enrollment_id: string;
  student_id: string;
  student_name: string;
  cohort_id: string;
  cohort_name: string;
  program_id: string;
  program_name: string;
  total_amount_minor: number;
  paid_amount_minor: number;
  outstanding_balance_minor: number;
  currency: string;
  average_grade?: number;
  attendance_rate?: number;
}

export interface TimeseriesDataDto {
  date: string;
  enrollments: number;
  payments_minor: number;
  currency: string;
}

// ============================================================================
// Analytics API Functions
// ============================================================================

/**
 * Get cohort performance analytics
 */
export async function getCohortAnalytics(params?: {
  date_from?: string;
  date_to?: string;
}): Promise<CohortAnalyticsDto[]> {
  const { data } = await api.get('/api/v1/reporting/analytics/by-cohort/', { params });
  return data.results || data;
}

/**
 * Get financial analytics
 */
export async function getFinancialAnalytics(params?: {
  date_from?: string;
  date_to?: string;
}): Promise<FinancialAnalyticsDto> {
  const { data } = await api.get('/api/v1/reporting/analytics/financial/', { params });
  return data;
}

/**
 * Get analytics overview
 */
export async function getAnalyticsOverview(params?: {
  date_from?: string;
  date_to?: string;
  program_id?: string;
  cohort_id?: string;
  student_id?: string;
  lecturer_id?: string;
}): Promise<OverviewAnalyticsDto> {
  const { data } = await api.get('/api/v1/reporting/analytics/overview/', { params });
  return data;
}

/**
 * Get student financial report
 */
export async function getStudentFinancialReport(params?: {
  date_from?: string;
  date_to?: string;
  program_id?: string;
  cohort_id?: string;
  student_id?: string;
  lecturer_id?: string;
}): Promise<StudentFinancialDto[]> {
  const { data } = await api.get('/api/v1/reporting/analytics/student-financial/', { params });
  return data.results || data;
}

/**
 * Get time-series analytics
 */
export async function getTimeseriesAnalytics(params?: {
  date_from?: string;
  date_to?: string;
  group_by?: 'day' | 'week' | 'month';
}): Promise<TimeseriesDataDto[]> {
  const { data } = await api.get('/api/v1/reporting/analytics/timeseries/', { params });
  return data.results || data;
}