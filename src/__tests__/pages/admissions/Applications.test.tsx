import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Applications from '@/pages/admissions/Applications';
import { renderWithProviders } from '../../utils/testHelpers';
import * as admissionsApi from '@/api/endpoints/admissions';
import * as catalogApi from '@/api/endpoints/catalog';

vi.mock('@/api/endpoints/admissions', () => ({
  getApplications: vi.fn(),
  updateApplication: vi.fn(),
  acceptApplication: vi.fn(),
}));

vi.mock('@/api/endpoints/catalog', () => ({
  getPrograms: vi.fn(),
  getCohorts: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

describe('Applications Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render applications page', async () => {
      vi.mocked(admissionsApi.getApplications).mockResolvedValue([]);
      vi.mocked(catalogApi.getPrograms).mockResolvedValue([]);
      renderWithProviders(<Applications />);
      expect(screen.getByText(/applications/i)).toBeInTheDocument();
    });
  });

  describe('Operations', () => {
    it('should display applications list', async () => {
      const mockApplications = [
        { id: '1', name: 'John Doe', email: 'john@test.com', status: 'NEW', program: '1' },
        { id: '2', name: 'Jane Smith', email: 'jane@test.com', status: 'ACCEPTED', program: '1' },
      ];
      vi.mocked(admissionsApi.getApplications).mockResolvedValue(mockApplications as any);
      vi.mocked(catalogApi.getPrograms).mockResolvedValue([]);
      renderWithProviders(<Applications />);
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });
    });

    it('should accept application', async () => {
      const user = userEvent.setup();
      const mockApplications = [{ id: '1', name: 'John Doe', email: 'john@test.com', status: 'NEW', program: '1' }];
      vi.mocked(admissionsApi.getApplications).mockResolvedValue(mockApplications as any);
      vi.mocked(catalogApi.getPrograms).mockResolvedValue([]);
      vi.mocked(catalogApi.getCohorts).mockResolvedValue([{ id: '1', name: 'Cohort 1' }] as any);
      vi.mocked(admissionsApi.acceptApplication).mockResolvedValue({} as any);
      renderWithProviders(<Applications />);
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      const acceptBtn = screen.getByTitle(/accept/i);
      await user.click(acceptBtn);
      await waitFor(() => {
        expect(screen.getByText(/accept application/i)).toBeInTheDocument();
      });
    });
  });
});

