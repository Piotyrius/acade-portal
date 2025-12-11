import api from '@/api/client';
import { WorkDto } from '@/api/types';

export async function getMyWorks(): Promise<WorkDto[]> {
  const { data } = await api.get('/api/v1/gallery/works/');
  return data.results || data;
}

export async function uploadWork(payload: {
  owner: string;
  title: string;
  description?: string;
  file: File;
}): Promise<WorkDto> {
  const form = new FormData();

  // Only append fields that the backend expects
  form.append('owner', payload.owner);
  form.append('title', payload.title);
  if (payload.description) {
    form.append('description', payload.description);
  }
  form.append('media', payload.file);
  form.append('status', 'DRAFT');
  form.append('is_public', 'false');

  try {
    const { data } = await api.post('/api/v1/gallery/works/', form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 seconds for file uploads
    });
    return data;
  } catch (error: any) {
    // Provide more helpful error messages for database schema issues
    const errorDetail = error.response?.data?.detail;
    if (errorDetail) {
      const detailString = typeof errorDetail === 'string' ? errorDetail : JSON.stringify(errorDetail);
      
      // Check for database schema errors
      if (detailString.includes('does not exist') || detailString.includes('column')) {
        const columnMatch = detailString.match(/column\s+"([^"]+)"\s+of\s+relation\s+"([^"]+)"/i);
        if (columnMatch) {
          const [, columnName, tableName] = columnMatch;
          throw new Error(
            `Database Schema Error: The backend database table "${tableName}" is missing the column "${columnName}". ` +
            `This is a backend configuration issue. Please contact the administrator to run database migrations. ` +
            `\n\nTechnical details: ${detailString.substring(0, 200)}...`
          );
        }
      }
      
      // Check for Cloudinary upload errors
      if (detailString.includes('Failed to upload file to Cloudinary')) {
        throw new Error(
          `File Upload Error: ${detailString} ` +
          `\n\nThis appears to be a backend database schema issue. The storage_files table is missing required columns. ` +
          `Please contact the administrator.`
        );
      }
    }
    throw error;
  }
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

export async function unpublishWork(id: string): Promise<WorkDto> {
  const { data } = await api.patch(`/api/v1/gallery/works/${id}/`, { status: 'DRAFT' });
  return data;
}

export async function toggleWorkVisibility(id: string, isPublic: boolean): Promise<WorkDto> {
  const { data } = await api.patch(`/api/v1/gallery/works/${id}/`, { is_public: isPublic });
  return data;
}


export async function uploadProfilePicture(file: File) {
  const form = new FormData();
  form.append('profile_picture', file);

  const { data } = await api.post(
    '/api/v1/users/upload_profile_picture/',
    form,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return data;
}