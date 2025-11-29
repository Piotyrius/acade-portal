import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Enrollments from '@/pages/admissions/Enrollments';
import { renderWithProviders } from '../../utils/testHelpers';
import * as admissionsApi from '@/api/endpoints/admissions';

vi.mock('@/api/endpoints/admissions', () => ({
  getEnrollments: vi.fn(),
  updateEnrollment: vi.fn(),
  deleteEnrollment: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

global.confirm = vi.fn(() => true);

describe('Enrollments Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render enrollments page', async () => {
      vi.mocked(admissionsApi.getEnrollments).mockResolvedValue([]);
      renderWithProviders(<Enrollments />);
      expect(screen.getByText(/enrollments/i)).toBeInTheDocument();
    });
  });

  describe('CRUD Operations', () => {
    it('should display enrollments list', async () => {
      const mockEnrollments = [
        { id: '1', student_name: 'John Doe', cohort_name: 'Cohort 1', status: 'ACTIVE' },
        { id: '2', student_name: 'Jane Smith', cohort_name: 'Cohort 2', status: 'COMPLETED' },
      ];
      vi.mocked(admissionsApi.getEnrollments).mockResolvedValue(mockEnrollments as any);
      renderWithProviders(<Enrollments />);
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });
    });

    it('should delete enrollment', async () => {
      const user = userEvent.setup();
      const mockEnrollments = [{ id: '1', student_name: 'John Doe', cohort_name: 'Cohort 1', status: 'ACTIVE' }];
      vi.mocked(admissionsApi.getEnrollments).mockResolvedValue(mockEnrollments as any);
      vi.mocked(admissionsApi.deleteEnrollment).mockResolvedValue(undefined);
      renderWithProviders(<Enrollments />);
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      const deleteBtn = screen.getByTitle(/delete/i);
      await user.click(deleteBtn);
      await waitFor(() => {
        expect(admissionsApi.deleteEnrollment).toHaveBeenCalledWith('1');
      });
    });
  });
});

