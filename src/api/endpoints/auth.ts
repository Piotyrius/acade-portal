import api from '@/api/client';
import { TokenPair, UserDto } from '@/api/types';

export interface LoginResponse extends TokenPair {
  user: UserDto;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post('/api/v1/auth/login/', { email, password });
  return data;
}

export async function fetchMe(): Promise<UserDto> {
  const { data } = await api.get('/api/v1/users/me/');
  return data;
}

export async function updateProfile(data: { first_name?: string; last_name?: string }): Promise<UserDto> {
  const { data: responseData } = await api.patch('/api/v1/users/me_update/', data);
  return responseData;
}

export async function getUsers(role?: string): Promise<UserDto[]> {
  const params = role ? { role } : {};
  const { data } = await api.get('/api/v1/users/', { params });
  return data.results || data;
}

export async function createUser(payload: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: 'ADMIN' | 'LECTURER' | 'STUDENT';
}): Promise<UserDto> {
  const { data } = await api.post('/api/v1/users/', payload);
  return data;
}

export async function updateUser(id: string, payload: Partial<{
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: 'ADMIN' | 'LECTURER' | 'STUDENT';
  is_active: boolean;
}>): Promise<UserDto> {
  const { data } = await api.patch(`/api/v1/users/${id}/`, payload);
  return data;
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/api/v1/users/${id}/`);
}

export async function requestPasswordReset(email: string): Promise<void> {
  await api.post('/api/v1/auth/password_reset/', { email });
}
