import api from '@/api/client';
import { CertificateDto } from '@/api/types';

export async function getCertificates(cohortId?: string, studentId?: string): Promise<CertificateDto[]> {
  const params: Record<string, string> = {};
  if (cohortId) params.cohort = cohortId;
  if (studentId) params.student = studentId;
  const { data } = await api.get('/api/v1/certificates/certificates/', { params });
  return data.results || data;
}

export async function getCertificate(id: string): Promise<CertificateDto> {
  const { data } = await api.get(`/api/v1/certificates/certificates/${id}/`);
  return data;
}

export async function issueCertificate(payload: {
  student_id?: string;
  cohort_id: string;
  student_ids?: string[];
  force?: boolean;
}): Promise<{ issued: number; certificates: CertificateDto[]; errors: string[] }> {
  const { data } = await api.post('/api/v1/certificates/certificates/issue/', payload);
  return data;
}

export async function revokeCertificate(id: string, reason?: string): Promise<CertificateDto> {
  const { data } = await api.post(`/api/v1/certificates/certificates/${id}/revoke/`, { reason });
  return data;
}

export async function checkEligibility(studentId: string, cohortId: string): Promise<{ eligible: boolean; reason?: string }> {
  const { data } = await api.get(`/api/v1/certificates/certificates/eligibility/${studentId}/${cohortId}/`);
  return data;
}

export async function verifyCertificate(serialOrQr: string): Promise<CertificateDto> {
  const { data } = await api.get(`/api/v1/certificates/certificates/verify/${serialOrQr}/`);
  return data;
}



