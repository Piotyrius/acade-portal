import api from '@/api/client';
import { FileObjectDto, PaginatedFileObjectList } from './archive';

// ============================================================================
// Files API Functions
// ============================================================================

export async function getFiles(params?: {
  is_archived?: boolean;
  owner_id?: string;
  owner_type?: 'DOCUMENT' | 'GALLERY_WORK' | 'OTHER';
  search?: string;
  ordering?: string;
  page?: number;
}): Promise<FileObjectDto[]> {
  const { data } = await api.get('/api/v1/files/', { params });
  return data.results || data;
}

export async function getFile(id: string): Promise<FileObjectDto> {
  const { data } = await api.get(`/api/v1/files/${id}/`);
  return data;
}

/**
 * Download a file (generic download endpoint for non-archived files)
 */
export async function downloadFile(id: string): Promise<Blob> {
  const response = await api.get(`/api/v1/files/${id}/download/`, {
    responseType: 'blob',
  });
  return response.data;
}

/**
 * Archive a file by moving it to archive folder and marking as archived
 */
export async function archiveFile(id: string, payload?: Partial<FileObjectDto>): Promise<FileObjectDto> {
  const { data } = await api.post(`/api/v1/files/${id}/archive/`, payload || {});
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


