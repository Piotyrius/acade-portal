import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WorkLogs from '@/pages/timekeeping/WorkLogs';
import { renderWithProviders } from '../../utils/testHelpers';
import * as timekeepingApi from '@/api/endpoints/timekeeping';
import * as authApi from '@/api/endpoints/auth';

vi.mock('@/api/endpoints/timekeeping', () => ({
  getWorkLogs: vi.fn(),
  createWorkLog: vi.fn(),
  exportPayroll: vi.fn(),
}));

vi.mock('@/api/endpoints/auth', () => ({
  getUsers: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock('file-saver', () => ({
  saveAs: vi.fn(),
}));

describe('WorkLogs Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render work logs page', async () => {
      vi.mocked(timekeepingApi.getWorkLogs).mockResolvedValue([]);
      vi.mocked(authApi.getUsers).mockResolvedValue([]);
      renderWithProviders(<WorkLogs />);
      expect(screen.getByText(/work logs/i)).toBeInTheDocument();
    });

    it('should render create work log button', async () => {
      vi.mocked(timekeepingApi.getWorkLogs).mockResolvedValue([]);
      vi.mocked(authApi.getUsers).mockResolvedValue([]);
      renderWithProviders(<WorkLogs />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
      });
    });

    it('should render export payroll button', async () => {
      vi.mocked(timekeepingApi.getWorkLogs).mockResolvedValue([]);
      vi.mocked(authApi.getUsers).mockResolvedValue([]);
      renderWithProviders(<WorkLogs />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
      });
    });
  });

  describe('Operations', () => {
    it('should display work logs list', async () => {
      const mockWorkLogs = [
        { id: '1', start_at: '2024-03-05T09:00:00Z', end_at: '2024-03-05T17:00:00Z', minutes: 480 },
        { id: '2', start_at: '2024-03-06T09:00:00Z', end_at: '2024-03-06T17:00:00Z', minutes: 480 },
      ];
      vi.mocked(timekeepingApi.getWorkLogs).mockResolvedValue(mockWorkLogs as any);
      vi.mocked(authApi.getUsers).mockResolvedValue([]);
      renderWithProviders(<WorkLogs />);
      await waitFor(() => {
        expect(screen.getByText(/work logs/i)).toBeInTheDocument();
      });
    });

    it('should export payroll', async () => {
      const user = userEvent.setup();
      const mockBlob = new Blob(['test'], { type: 'text/csv' });
      vi.mocked(timekeepingApi.getWorkLogs).mockResolvedValue([]);
      vi.mocked(authApi.getUsers).mockResolvedValue([]);
      vi.mocked(timekeepingApi.exportPayroll).mockResolvedValue(mockBlob);
      renderWithProviders(<WorkLogs />);
      await waitFor(() => {
        const exportBtn = screen.getByRole('button', { name: /export/i });
        user.click(exportBtn);
      });
      await waitFor(() => {
        expect(timekeepingApi.exportPayroll).toHaveBeenCalled();
      });
    });
  });
});

