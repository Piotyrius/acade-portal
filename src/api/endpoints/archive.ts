import api from '@/api/client';

// ============================================================================
// Types
// ============================================================================

export interface FileObjectDto {
  id: string;
  owner_type: 'DOCUMENT' | 'GALLERY_WORK' | 'OTHER';
  owner_id: string | null;
  original_name: string;
  mime_type: string;
  size: number | null;
  visibility: 'PRIVATE' | 'ADMIN' | 'PUBLIC';
  is_archived: boolean;
  created_at: string;
  deleted_at: string | null;
}

export interface PaginatedFileObjectList {
  count: number;
  next: string | null;
  previous: string | null;
  results: FileObjectDto[];
}

export interface FileObjectRequest {
  owner_type?: 'DOCUMENT' | 'GALLERY_WORK' | 'OTHER';
  owner_id?: string | null;
  original_name: string;
  mime_type?: string;
  size?: number | null;
  visibility?: 'PRIVATE' | 'ADMIN' | 'PUBLIC';
  is_archived?: boolean;
}

// ============================================================================
// Archive API Functions
// ============================================================================

export async function getArchivedFiles(params?: {
  deleted_by?: string;
  owner_id?: string;
  owner_type?: 'DOCUMENT' | 'GALLERY_WORK' | 'OTHER';
  search?: string;
  ordering?: string;
  page?: number;
}): Promise<FileObjectDto[]> {
  const { data } = await api.get('/api/v1/files/', { params });
  return data.results || data;
}

export async function getArchivedFile(id: string): Promise<FileObjectDto> {
  const { data } = await api.get(`/api/v1/files/${id}/`);
  return data;
}

/**
 * Download an archived file
 */
export async function downloadArchivedFile(id: string): Promise<Blob> {
  const response = await api.get(`/api/v1/files/${id}/download/`, {
    responseType: 'blob',
  });
  return response.data;
}

/**
 * Restore an archived file
 */
export async function restoreArchivedFile(id: string, payload: FileObjectRequest): Promise<FileObjectDto> {
  const { data } = await api.post(`/api/v1/files/${id}/restore/`, payload);
  return data;
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


