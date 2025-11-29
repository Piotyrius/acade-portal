import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Cohorts from '@/pages/catalog/Cohorts';
import { renderWithProviders } from '../../utils/testHelpers';
import * as catalogApi from '@/api/endpoints/catalog';
import * as authApi from '@/api/endpoints/auth';

vi.mock('@/api/endpoints/catalog', () => ({
  getCohorts: vi.fn(),
  createCohort: vi.fn(),
  updateCohort: vi.fn(),
  deleteCohort: vi.fn(),
  getCourses: vi.fn(),
}));

vi.mock('@/api/endpoints/auth', () => ({
  getUsers: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

global.confirm = vi.fn(() => true);

describe('Cohorts Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render cohorts page', async () => {
      vi.mocked(catalogApi.getCohorts).mockResolvedValue([]);
      vi.mocked(catalogApi.getCourses).mockResolvedValue([]);
      vi.mocked(authApi.getUsers).mockResolvedValue([]);
      renderWithProviders(<Cohorts />);
      expect(screen.getByText(/cohorts/i)).toBeInTheDocument();
    });

    it('should render create button', async () => {
      vi.mocked(catalogApi.getCohorts).mockResolvedValue([]);
      vi.mocked(catalogApi.getCourses).mockResolvedValue([]);
      vi.mocked(authApi.getUsers).mockResolvedValue([]);
      renderWithProviders(<Cohorts />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
      });
    });
  });

  describe('CRUD Operations', () => {
    it('should open create dialog', async () => {
      const user = userEvent.setup();
      vi.mocked(catalogApi.getCohorts).mockResolvedValue([]);
      vi.mocked(catalogApi.getCourses).mockResolvedValue([]);
      vi.mocked(authApi.getUsers).mockResolvedValue([]);
      renderWithProviders(<Cohorts />);
      await waitFor(() => {
        const createBtn = screen.getByRole('button', { name: /create/i });
        user.click(createBtn);
      });
      await waitFor(() => {
        expect(screen.getByText(/create cohort/i)).toBeInTheDocument();
      });
    });

    it('should display cohorts list', async () => {
      const mockCohorts = [
        { id: '1', name: 'Spring 2024', course: '1', status: 'ACTIVE' },
        { id: '2', name: 'Summer 2024', course: '1', status: 'ENROLLING' },
      ];
      vi.mocked(catalogApi.getCohorts).mockResolvedValue(mockCohorts as any);
      vi.mocked(catalogApi.getCourses).mockResolvedValue([]);
      vi.mocked(authApi.getUsers).mockResolvedValue([]);
      renderWithProviders(<Cohorts />);
      await waitFor(() => {
        expect(screen.getByText('Spring 2024')).toBeInTheDocument();
        expect(screen.getByText('Summer 2024')).toBeInTheDocument();
      });
    });

    it('should delete cohort', async () => {
      const user = userEvent.setup();
      const mockCohorts = [{ id: '1', name: 'Test Cohort', course: '1', status: 'ACTIVE' }];
      vi.mocked(catalogApi.getCohorts).mockResolvedValue(mockCohorts as any);
      vi.mocked(catalogApi.getCourses).mockResolvedValue([]);
      vi.mocked(authApi.getUsers).mockResolvedValue([]);
      vi.mocked(catalogApi.deleteCohort).mockResolvedValue(undefined);
      renderWithProviders(<Cohorts />);
      await waitFor(() => {
        expect(screen.getByText('Test Cohort')).toBeInTheDocument();
      });
      const deleteBtn = screen.getByTitle(/delete/i);
      await user.click(deleteBtn);
      await waitFor(() => {
        expect(catalogApi.deleteCohort).toHaveBeenCalledWith('1');
      });
    });
  });
});

