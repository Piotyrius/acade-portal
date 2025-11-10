import api from '@/api/client';
import { WorkDto } from '@/api/types';

export async function getMyWorks(): Promise<WorkDto[]> {
  const { data } = await api.get('/api/v1/gallery/works/', { params: { owner: 'me' } });
  return data;
}

export async function uploadWork(payload: { title: string; description?: string; file: File }): Promise<WorkDto> {
  const form = new FormData();
  form.append('title', payload.title);
  if (payload.description) form.append('description', payload.description);
  form.append('media', payload.file);
  const { data } = await api.post('/api/v1/gallery/works/', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function publishWork(id: string): Promise<WorkDto> {
  const { data } = await api.patch(`/api/v1/gallery/works/${id}/publish/`);
  return data;
}


