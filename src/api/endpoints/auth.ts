import api from '@/api/client';
import { TokenPair, UserDto } from '@/api/types';

export async function login(email: string, password: string): Promise<TokenPair> {
  const { data } = await api.post('/api/v1/auth/login/', { email, password });
  return data;
}

export async function fetchMe(): Promise<UserDto> {
  const { data } = await api.get('/api/v1/users/me/');
  return data;
}


