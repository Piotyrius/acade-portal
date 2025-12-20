import api from '@/api/client';
import { ensureArray } from '@/api/utils';

export interface NotificationDto {
  id: string;
  user: string;
  notification_type: 'COHORT_READY' | 'INVOICE_CREATED' | 'PAYMENT_RECEIVED' | 'PAYMENT_OVERDUE' | 'OTHER';
  notification_type_display: string;
  related_cohort: string | null;
  related_cohort_name?: string;
  message: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  user_email?: string;
}

export async function getNotifications(): Promise<NotificationDto[]> {
  const { data } = await api.get('/api/v1/notifications/');
  return ensureArray(data);
}

export async function getUnreadNotifications(): Promise<NotificationDto[]> {
  const { data } = await api.get('/api/v1/notifications/unread/');
  return ensureArray(data);
}

export async function markNotificationAsRead(id: string): Promise<NotificationDto> {
  const { data } = await api.post(`/api/v1/notifications/${id}/mark_as_read/`);
  return data;
}

export async function markAllNotificationsAsRead(): Promise<{ detail: string }> {
  const { data } = await api.post('/api/v1/notifications/mark_all_read/');
  return data;
}
