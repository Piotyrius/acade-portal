import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Sessions from '@/pages/catalog/Sessions';
import { renderWithProviders } from '../../utils/testHelpers';
import * as catalogApi from '@/api/endpoints/catalog';

vi.mock('@/api/endpoints/catalog', () => ({
  getSessions: vi.fn(),
  createSession: vi.fn(),
  updateSession: vi.fn(),
  deleteSession: vi.fn(),
  getCohorts: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

global.confirm = vi.fn(() => true);

describe('Sessions Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render sessions page', async () => {
      vi.mocked(catalogApi.getSessions).mockResolvedValue([]);
      vi.mocked(catalogApi.getCohorts).mockResolvedValue([]);
      renderWithProviders(<Sessions />);
      expect(screen.getByText(/sessions/i)).toBeInTheDocument();
    });

    it('should render create button', async () => {
      vi.mocked(catalogApi.getSessions).mockResolvedValue([]);
      vi.mocked(catalogApi.getCohorts).mockResolvedValue([]);
      renderWithProviders(<Sessions />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
      });
    });
  });

  describe('CRUD Operations', () => {
    it('should open create dialog', async () => {
      const user = userEvent.setup();
      vi.mocked(catalogApi.getSessions).mockResolvedValue([]);
      vi.mocked(catalogApi.getCohorts).mockResolvedValue([]);
      renderWithProviders(<Sessions />);
      await waitFor(() => {
        const createBtn = screen.getByRole('button', { name: /create/i });
        user.click(createBtn);
      });
      await waitFor(() => {
        expect(screen.getByText(/create session/i)).toBeInTheDocument();
      });
    });

    it('should display sessions list', async () => {
      const mockSessions = [
        { id: '1', cohort: '1', date: '2024-03-01', start_time: '10:00', end_time: '12:00' },
        { id: '2', cohort: '1', date: '2024-03-02', start_time: '14:00', end_time: '16:00' },
      ];
      vi.mocked(catalogApi.getSessions).mockResolvedValue(mockSessions as any);
      vi.mocked(catalogApi.getCohorts).mockResolvedValue([]);
      renderWithProviders(<Sessions />);
      await waitFor(() => {
        expect(screen.getByText('10:00')).toBeInTheDocument();
      });
    });

    it('should delete session', async () => {
      const user = userEvent.setup();
      const mockSessions = [{ id: '1', cohort: '1', date: '2024-03-01', start_time: '10:00', end_time: '12:00' }];
      vi.mocked(catalogApi.getSessions).mockResolvedValue(mockSessions as any);
      vi.mocked(catalogApi.getCohorts).mockResolvedValue([]);
      vi.mocked(catalogApi.deleteSession).mockResolvedValue(undefined);
      renderWithProviders(<Sessions />);
      await waitFor(() => {
        expect(screen.getByText('10:00')).toBeInTheDocument();
      });
      const deleteBtn = screen.getByTitle(/delete/i);
      await user.click(deleteBtn);
      await waitFor(() => {
        expect(catalogApi.deleteSession).toHaveBeenCalledWith('1');
      });
    });
  });
});

