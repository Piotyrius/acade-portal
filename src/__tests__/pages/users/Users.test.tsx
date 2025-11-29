import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Users from '@/pages/users/Users';
import { renderWithProviders } from '../../utils/testHelpers';
import * as authApi from '@/api/endpoints/auth';

vi.mock('@/api/endpoints/auth', () => ({
  getUsers: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

describe('Users Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render users page', async () => {
      vi.mocked(authApi.getUsers).mockResolvedValue([]);
      renderWithProviders(<Users />);
      expect(screen.getByText(/users/i)).toBeInTheDocument();
    });

    it('should render create user button', async () => {
      vi.mocked(authApi.getUsers).mockResolvedValue([]);
      renderWithProviders(<Users />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create user/i })).toBeInTheDocument();
      });
    });
  });

  describe('CRUD Operations', () => {
    it('should open create dialog', async () => {
      const user = userEvent.setup();
      vi.mocked(authApi.getUsers).mockResolvedValue([]);
      renderWithProviders(<Users />);
      await waitFor(() => {
        const createBtn = screen.getByRole('button', { name: /create user/i });
        user.click(createBtn);
      });
      await waitFor(() => {
        expect(screen.getByText(/create user/i)).toBeInTheDocument();
      });
    });

    it('should display users list', async () => {
      const mockUsers = [
        { id: '1', email: 'user1@test.com', first_name: 'John', last_name: 'Doe', role: 'STUDENT' },
        { id: '2', email: 'user2@test.com', first_name: 'Jane', last_name: 'Smith', role: 'LECTURER' },
      ];
      vi.mocked(authApi.getUsers).mockResolvedValue(mockUsers as any);
      renderWithProviders(<Users />);
      await waitFor(() => {
        expect(screen.getByText('user1@test.com')).toBeInTheDocument();
        expect(screen.getByText('user2@test.com')).toBeInTheDocument();
      });
    });

    it('should delete user', async () => {
      const user = userEvent.setup();
      const mockUsers = [{ id: '1', email: 'user1@test.com', first_name: 'John', last_name: 'Doe', role: 'STUDENT' }];
      vi.mocked(authApi.getUsers).mockResolvedValue(mockUsers as any);
      vi.mocked(authApi.deleteUser).mockResolvedValue(undefined);
      renderWithProviders(<Users />);
      await waitFor(() => {
        expect(screen.getByText('user1@test.com')).toBeInTheDocument();
      });
      const deleteBtn = screen.getByTitle(/delete/i);
      await user.click(deleteBtn);
      await waitFor(() => {
        expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
      });
    });
  });

  describe('Search and Filter', () => {
    it('should filter users by search', async () => {
      const user = userEvent.setup();
      const mockUsers = [
        { id: '1', email: 'john@test.com', first_name: 'John', last_name: 'Doe', role: 'STUDENT' },
        { id: '2', email: 'jane@test.com', first_name: 'Jane', last_name: 'Smith', role: 'LECTURER' },
      ];
      vi.mocked(authApi.getUsers).mockResolvedValue(mockUsers as any);
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
});

