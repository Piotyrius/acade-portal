import api from '@/api/client';
import { WorkDto } from '@/api/types';

export async function getMyWorks(): Promise<WorkDto[]> {
  const { data } = await api.get('/api/v1/gallery/works/');
  return data.results || data;
}

export async function uploadWork(payload: { title: string; description?: string; file: File }): Promise<WorkDto> {
  const form = new FormData();
  form.append('title', payload.title);
  if (payload.description) form.append('description', payload.description);
  form.append('media', payload.file);
  // Don't set Content-Type header - let axios set it automatically with boundary for FormData
  const { data } = await api.post('/api/v1/gallery/works/', form);
  return data;
}

export async function getWork(id: string): Promise<WorkDto> {
  const { data } = await api.get(`/api/v1/gallery/works/${id}/`);
  return data;
}

export async function updateWork(id: string, payload: Partial<WorkDto>): Promise<WorkDto> {
  const { data } = await api.patch(`/api/v1/gallery/works/${id}/`, payload);
  return data;
}

export async function deleteWork(id: string): Promise<void> {
  await api.delete(`/api/v1/gallery/works/${id}/`);
}

export async function publishWork(id: string): Promise<WorkDto> {
  const { data } = await api.patch(`/api/v1/gallery/works/${id}/publish/`);
  return data;
}



