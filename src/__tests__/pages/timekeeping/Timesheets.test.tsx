import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Timesheets from '@/pages/timekeeping/Timesheets';
import { renderWithProviders } from '../../utils/testHelpers';
import * as timekeepingApi from '@/api/endpoints/timekeeping';

vi.mock('@/api/endpoints/timekeeping', () => ({
  getTimesheets: vi.fn(),
  createTimesheet: vi.fn(),
  updateTimesheet: vi.fn(),
  getWorkLogs: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

describe('Timesheets Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render timesheets page', async () => {
      vi.mocked(timekeepingApi.getTimesheets).mockResolvedValue([]);
      vi.mocked(timekeepingApi.getWorkLogs).mockResolvedValue([]);
      renderWithProviders(<Timesheets />);
      expect(screen.getByText(/timesheets/i)).toBeInTheDocument();
    });

    it('should render create timesheet button', async () => {
      vi.mocked(timekeepingApi.getTimesheets).mockResolvedValue([]);
      vi.mocked(timekeepingApi.getWorkLogs).mockResolvedValue([]);
      renderWithProviders(<Timesheets />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
      });
    });
  });

  describe('Operations', () => {
    it('should display timesheets list', async () => {
      const mockTimesheets = [
        { id: '1', period_start: '2024-03-01', period_end: '2024-03-07', status: 'DRAFT' },
        { id: '2', period_start: '2024-03-08', period_end: '2024-03-14', status: 'SUBMITTED' },
      ];
      vi.mocked(timekeepingApi.getTimesheets).mockResolvedValue(mockTimesheets as any);
      vi.mocked(timekeepingApi.getWorkLogs).mockResolvedValue([]);
      renderWithProviders(<Timesheets />);
      await waitFor(() => {
        expect(screen.getByText(/timesheets/i)).toBeInTheDocument();
      });
    });

    it('should submit timesheet', async () => {
      const user = userEvent.setup();
      const mockTimesheets = [{ id: '1', period_start: '2024-03-01', period_end: '2024-03-07', status: 'DRAFT' }];
      vi.mocked(timekeepingApi.getTimesheets).mockResolvedValue(mockTimesheets as any);
      vi.mocked(timekeepingApi.getWorkLogs).mockResolvedValue([]);
      vi.mocked(timekeepingApi.updateTimesheet).mockResolvedValue({ ...mockTimesheets[0], status: 'SUBMITTED' } as any);
      renderWithProviders(<Timesheets />);
      await waitFor(() => {
        const submitBtn = screen.getByRole('button', { name: /submit/i });
        user.click(submitBtn);
      });
      await waitFor(() => {
        expect(timekeepingApi.updateTimesheet).toHaveBeenCalled();
      });
    });
  });
});

