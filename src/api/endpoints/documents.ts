import api from '@/api/client';

export interface DocumentDto {
  id: string;
  owner: string;
  kind: string;
  description: string;
  file: string;
  visibility: 'PRIVATE' | 'LECTURER' | 'ADMIN';
  created_at: string;
  updated_at: string;
}

export async function getDocuments(kind?: string): Promise<DocumentDto[]> {
  const params = kind ? { kind } : {};
  const { data } = await api.get('/api/v1/documents/documents/', { params });
  return data.results || data;
}

export async function getDocument(id: string): Promise<DocumentDto> {
  const { data } = await api.get(`/api/v1/documents/documents/${id}/`);
  return data;
}

export async function createDocument(payload: {
  kind: string;
  description: string;
  file: File;
  visibility?: 'PRIVATE' | 'LECTURER' | 'ADMIN';
  owner?: string;
}): Promise<DocumentDto> {
  const form = new FormData();
  form.append('kind', payload.kind);
  form.append('description', payload.description);
  form.append('file', payload.file);
  if (payload.visibility) {
    form.append('visibility', payload.visibility);
  }
  if (payload.owner) {
    form.append('owner', payload.owner);
  }
  const { data } = await api.post('/api/v1/documents/documents/', form);
  return data;
}

export async function updateDocument(id: string, payload: Partial<DocumentDto>): Promise<DocumentDto> {
  const { data } = await api.patch(`/api/v1/documents/documents/${id}/`, payload);
  return data;
}

export async function deleteDocument(id: string): Promise<void> {
  await api.delete(`/api/v1/documents/documents/${id}/`);
}

