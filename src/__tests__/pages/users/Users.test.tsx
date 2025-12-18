import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Users from '@/pages/users/Users';
import { renderWithProviders } from '../../utils/testHelpers';
import * as authApi from '@/api/endpoints/auth';
import * as admissionsApi from '@/api/endpoints/admissions';

vi.mock('@/api/endpoints/auth', () => ({
  getUsersPaginated: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
}));

vi.mock('@/api/endpoints/admissions', () => ({
  getEnrollmentsPaginated: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

describe('Users Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(admissionsApi.getEnrollmentsPaginated).mockResolvedValue({
      count: 0,
      next: null,
      previous: null,
      results: [],
    } as any);

    vi.mocked(authApi.getUsersPaginated).mockResolvedValue({
      count: 0,
      next: null,
      previous: null,
      results: [],
    } as any);
  });

  describe('Rendering', () => {
    it('should render users page', async () => {
      renderWithProviders(<Users />);
      expect(screen.getByText(/user management/i)).toBeInTheDocument();
    });

    it('should render create user button', async () => {
      renderWithProviders(<Users />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
      });
    });
  });

  describe('CRUD Operations', () => {
    it('should open create dialog', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Users />);
      await waitFor(() => {
        const createBtn = screen.getByRole('button', { name: /add user/i });
        user.click(createBtn);
      });
      await waitFor(() => {
        expect(screen.getByText(/create user/i)).toBeInTheDocument();
      });
    });

    it('should display users list', async () => {
      const mockUsers = [
        { id: '1', email: 'user1@test.com', first_name: 'John', last_name: 'Doe', role: 'STUDENT' },
        { id: '2', email: 'user2@test.com', first_name: 'Jane', last_name: 'Smith', role: 'STUDENT' },
      ];
      vi.mocked(authApi.getUsersPaginated).mockResolvedValue({
        count: mockUsers.length,
        next: null,
        previous: null,
        results: mockUsers,
      } as any);
      renderWithProviders(<Users />);
      await waitFor(() => {
        expect(screen.getByText('user1@test.com')).toBeInTheDocument();
        expect(screen.getByText('user2@test.com')).toBeInTheDocument();
      });
    });

    it('should delete user', async () => {
      const user = userEvent.setup();
      const mockUsers = [{ id: '1', email: 'user1@test.com', first_name: 'John', last_name: 'Doe', role: 'STUDENT' }];
      vi.mocked(authApi.getUsersPaginated).mockResolvedValue({
        count: mockUsers.length,
        next: null,
        previous: null,
        results: mockUsers,
      } as any);
      vi.mocked(authApi.deleteUser).mockResolvedValue(undefined);
      renderWithProviders(<Users />);
      await waitFor(() => {
        expect(screen.getByText('user1@test.com')).toBeInTheDocument();
      });
      const deleteBtn = screen.getByRole('button', { name: /delete user/i });
      await user.click(deleteBtn);
      await waitFor(() => {
        expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
      });
    });
  });

  describe('Search and Filter', () => {
    it('should filter users by search', async () => {
      const user = userEvent.setup();
      const mockUsersAll = [
        { id: '1', email: 'john@test.com', first_name: 'John', last_name: 'Doe', role: 'STUDENT' },
        { id: '2', email: 'jane@test.com', first_name: 'Jane', last_name: 'Smith', role: 'STUDENT' },
      ];

      vi.mocked(authApi.getUsersPaginated).mockImplementation(async (params: any) => {
        const search = String(params?.search ?? '').toLowerCase();
        const results = search.includes('john') ? [mockUsersAll[0]] : mockUsersAll;
        return {
          count: results.length,
          next: null,
          previous: null,
          results,
        } as any;
      });

      renderWithProviders(<Users />);
      await waitFor(() => {
        expect(screen.getByText('john@test.com')).toBeInTheDocument();
      });
      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, 'john');
      await waitFor(() => {
        expect(screen.getByText('john@test.com')).toBeInTheDocument();
        expect(screen.queryByText('jane@test.com')).not.toBeInTheDocument();
      });
    });
  });

  it('should paginate users list', async () => {
    const user = userEvent.setup();
    const page1Users = [
      { id: '1', email: 'page1@test.com', first_name: 'P1', last_name: 'User', role: 'STUDENT', is_active: true },
    ];
    const page2Users = [
      { id: '2', email: 'page2@test.com', first_name: 'P2', last_name: 'User', role: 'STUDENT', is_active: true },
    ];

    vi.mocked(authApi.getUsersPaginated).mockImplementation(async (params: any) => {
      if (params?.page === 2) {
        return { count: 2, next: null, previous: 'prev', results: page2Users } as any;
      }
      return { count: 2, next: 'next', previous: null, results: page1Users } as any;
    });

    renderWithProviders(<Users />);

    await waitFor(() => {
      expect(screen.getByText('page1@test.com')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() => {
      expect(screen.getByText('page2@test.com')).toBeInTheDocument();
    });

    expect(authApi.getUsersPaginated).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'STUDENT', page: 2 })
    );
  });
});

