// Minimal API types for initial integration (extend as needed)
export type UUID = string;

export type UserRole = 'ADMIN' | 'LECTURER' | 'STUDENT';

export interface UserDto {
  id: UUID;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
}

export interface TokenPair {
  access: string;
  refresh: string;
}

export interface WorkLogDto {
  id: UUID;
  lecturer: UUID;
  session: UUID | null;
  start_at: string;
  end_at: string;
  minutes: number;
  source: 'SESSION' | 'MANUAL';
  notes: string;
}

export interface WorkDto {
  id: UUID;
  owner: UUID;
  title: string;
  description: string;
  media: string;
  status: 'DRAFT' | 'PUBLISHED';
  is_public: boolean;
  published_at: string | null;
}


