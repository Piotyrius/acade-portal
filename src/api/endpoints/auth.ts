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



