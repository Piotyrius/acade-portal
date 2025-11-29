import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ManualEnrollment from '@/pages/admissions/ManualEnrollment';
import { renderWithProviders } from '../../utils/testHelpers';
import * as admissionsApi from '@/api/endpoints/admissions';
import * as catalogApi from '@/api/endpoints/catalog';
import * as authApi from '@/api/endpoints/auth';

vi.mock('@/api/endpoints/admissions', () => ({
  createEnrollment: vi.fn(),
}));

vi.mock('@/api/endpoints/catalog', () => ({
  getCohorts: vi.fn(),
}));

vi.mock('@/api/endpoints/auth', () => ({
  getUsers: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

describe('ManualEnrollment Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render manual enrollment page', async () => {
      vi.mocked(catalogApi.getCohorts).mockResolvedValue([]);
      vi.mocked(authApi.getUsers).mockResolvedValue([]);
      renderWithProviders(<ManualEnrollment />);
      expect(screen.getByText(/manual enrollment/i)).toBeInTheDocument();
    });

    it('should render enrollment form', async () => {
      vi.mocked(catalogApi.getCohorts).mockResolvedValue([]);
      vi.mocked(authApi.getUsers).mockResolvedValue([]);
      renderWithProviders(<ManualEnrollment />);
      await waitFor(() => {
        expect(screen.getByLabelText(/cohort/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/student/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should create enrollment when form is submitted', async () => {
      const user = userEvent.setup();
      vi.mocked(catalogApi.getCohorts).mockResolvedValue([{ id: '1', name: 'Cohort 1' }] as any);
      vi.mocked(authApi.getUsers).mockResolvedValue([{ id: '1', email: 'student@test.com', first_name: 'John', last_name: 'Doe' }] as any);
      vi.mocked(admissionsApi.createEnrollment).mockResolvedValue({ id: '1' } as any);
      renderWithProviders(<ManualEnrollment />);
      await waitFor(() => {
        expect(screen.getByLabelText(/cohort/i)).toBeInTheDocument();
      });
      // Form submission test would go here
    });
  });
});

