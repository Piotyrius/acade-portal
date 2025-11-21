import api from '../client';

// Fetch all users
export async function getUsers() {
  const { data } = await api.get('/api/v1/users/');
  return data.results || data;
}
