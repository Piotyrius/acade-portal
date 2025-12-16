import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Enrollments from '@/pages/admissions/Enrollments';
import { renderWithProviders } from '../../utils/testHelpers';
import * as admissionsApi from '@/api/endpoints/admissions';
import * as catalogApi from '@/api/endpoints/catalog';
import { setupAuthStore, clearAuthStore, mockAdminUser } from '../../utils/testHelpers';

vi.mock('@/api/endpoints/admissions', () => ({
  getEnrollmentsPaginated: vi.fn(),
  getWaitlist: vi.fn(),
  activateEnrollment: vi.fn(),
  withdrawEnrollment: vi.fn(),
  completeEnrollment: vi.fn(),
  bulkActivateEnrollments: vi.fn(),
}));

vi.mock('@/api/endpoints/catalog', () => ({
  getCohorts: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

global.confirm = vi.fn(() => true);

describe('Enrollments Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearAuthStore();
    vi.mocked(catalogApi.getCohorts).mockResolvedValue([] as any);
    vi.mocked(admissionsApi.getWaitlist).mockResolvedValue([] as any);
  });

  describe('Rendering', () => {
    it('should render enrollments page', async () => {
      vi.mocked(admissionsApi.getEnrollmentsPaginated).mockResolvedValue({
        count: 0,
        next: null,
        previous: null,
        results: [],
      } as any);
      renderWithProviders(<Enrollments />);
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Enrollments', level: 2 })).toBeInTheDocument();
      });
    });
  });

  describe('CRUD Operations', () => {
    it('should display enrollments list', async () => {
      const mockEnrollments = [
        { id: '1', student_name: 'John Doe', cohort_name: 'Cohort 1', status: 'ACTIVE' },
        { id: '2', student_name: 'Jane Smith', cohort_name: 'Cohort 2', status: 'COMPLETED' },
      ];
      vi.mocked(admissionsApi.getEnrollmentsPaginated).mockResolvedValue({
        count: 2,
        next: null,
        previous: null,
        results: mockEnrollments,
      } as any);
      renderWithProviders(<Enrollments />);
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });
    });
  });

  describe('Bulk Activation', () => {
    it('should bulk activate and update UI status', async () => {
      setupAuthStore(mockAdminUser);
      const user = userEvent.setup();

      const mockEnrollments = [
        {
          id: 'e-1',
          student_name: 'Waitlisted Student',
          cohort_name: 'Cohort A',
          enrolled_at: new Date('2025-01-01').toISOString(),
          status: 'WAITLISTED',
        },
      ];

      vi.mocked(admissionsApi.getEnrollmentsPaginated)
        .mockResolvedValueOnce({
          count: 1,
          next: null,
          previous: null,
          results: mockEnrollments,
        } as any)
        .mockResolvedValueOnce({
          count: 1,
          next: null,
          previous: null,
          results: [
            {
              ...mockEnrollments[0],
              status: 'ACTIVE',
              status_display: 'Active',
            },
          ],
        } as any);
      vi.mocked(admissionsApi.bulkActivateEnrollments).mockResolvedValue({ activated: 1, errors: [] } as any);

      renderWithProviders(<Enrollments />);

      // Wait for initial row
      await waitFor(() => {
        expect(screen.getByText('Waitlisted Student')).toBeInTheDocument();
      });

      // Row should be activatable before bulk activation
      expect(screen.getByTitle('Activate Enrollment')).toBeInTheDocument();

      // Open bulk dialog
      await user.click(screen.getByRole('button', { name: /bulk activate/i }));
      expect(screen.getByText(/bulk activate enrollments/i)).toBeInTheDocument();

      // Select enrollment in dialog (single checkbox)
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]);

      // Perform bulk activate
      await user.click(screen.getByRole('button', { name: /activate 1 enrollment\(s\)/i }));

      await waitFor(() => {
        expect(admissionsApi.bulkActivateEnrollments).toHaveBeenCalledWith(['e-1']);
      });

      // UI should reflect ACTIVE status (no single-row Activate button)
      await waitFor(() => {
        expect(screen.queryByTitle('Activate Enrollment')).not.toBeInTheDocument();
        expect(screen.getByText('Active')).toBeInTheDocument();
      });
    });
  });
});

