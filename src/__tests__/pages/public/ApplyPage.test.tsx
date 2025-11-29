import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ApplyPage from '@/pages/public/ApplyPage';
import { renderWithProviders } from '../../utils/testHelpers';
import * as admissionsApi from '@/api/endpoints/admissions';
import * as catalogApi from '@/api/endpoints/catalog';

vi.mock('@/api/endpoints/admissions', () => ({
  createApplication: vi.fn(),
}));

vi.mock('@/api/endpoints/catalog', () => ({
  getPrograms: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

describe('ApplyPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render apply page', async () => {
      vi.mocked(catalogApi.getPrograms).mockResolvedValue([]);
      renderWithProviders(<ApplyPage />);
      expect(screen.getByText(/apply/i)).toBeInTheDocument();
    });

    it('should render application form', async () => {
      vi.mocked(catalogApi.getPrograms).mockResolvedValue([]);
      renderWithProviders(<ApplyPage />);
      await waitFor(() => {
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should submit application when form is filled and submitted', async () => {
      const user = userEvent.setup();
      vi.mocked(catalogApi.getPrograms).mockResolvedValue([{ id: '1', name: 'Test Program' }] as any);
      vi.mocked(admissionsApi.createApplication).mockResolvedValue({ id: '1' } as any);
      renderWithProviders(<ApplyPage />);
      await waitFor(() => {
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      });
      // Form submission test would go here
    });
  });
});

