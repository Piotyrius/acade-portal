import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AttendanceList from '@/pages/attendance/AttendanceList';
import { renderWithProviders } from '../../utils/testHelpers';
import * as attendanceApi from '@/api/endpoints/attendance';
import * as catalogApi from '@/api/endpoints/catalog';
import * as admissionsApi from '@/api/endpoints/admissions';
import * as authApi from '@/api/endpoints/auth';

vi.mock('@/api/endpoints/attendance', () => ({
  getAttendanceRecords: vi.fn(),
  createAttendanceRecord: vi.fn(),
  updateAttendanceRecord: vi.fn(),
  bulkMarkAttendance: vi.fn(),
}));

vi.mock('@/api/endpoints/catalog', () => ({
  getSessions: vi.fn(),
}));

vi.mock('@/api/endpoints/admissions', () => ({
  getEnrollments: vi.fn(),
}));

vi.mock('@/api/endpoints/auth', () => ({
  getUsers: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

describe('AttendanceList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render attendance list page', async () => {
      vi.mocked(attendanceApi.getAttendanceRecords).mockResolvedValue([]);
      vi.mocked(catalogApi.getSessions).mockResolvedValue([]);
      vi.mocked(authApi.getUsers).mockResolvedValue([]);
      renderWithProviders(<AttendanceList />);
      expect(screen.getByText(/attendance/i)).toBeInTheDocument();
    });

    it('should render create attendance button', async () => {
      vi.mocked(attendanceApi.getAttendanceRecords).mockResolvedValue([]);
      vi.mocked(catalogApi.getSessions).mockResolvedValue([]);
      vi.mocked(authApi.getUsers).mockResolvedValue([]);
      renderWithProviders(<AttendanceList />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
      });
    });

    it('should render bulk mark attendance button', async () => {
      vi.mocked(attendanceApi.getAttendanceRecords).mockResolvedValue([]);
      vi.mocked(catalogApi.getSessions).mockResolvedValue([]);
      vi.mocked(authApi.getUsers).mockResolvedValue([]);
      renderWithProviders(<AttendanceList />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /bulk/i })).toBeInTheDocument();
      });
    });
  });

  describe('Operations', () => {
    it('should display attendance records', async () => {
      const mockRecords = [
        { id: '1', session: 'sess-1', student: 'student-1', status: 'PRESENT', marked_at: '2024-03-05T19:00:00Z' },
        { id: '2', session: 'sess-1', student: 'student-2', status: 'ABSENT', marked_at: '2024-03-05T19:00:00Z' },
      ];
      vi.mocked(attendanceApi.getAttendanceRecords).mockResolvedValue(mockRecords as any);
      vi.mocked(catalogApi.getSessions).mockResolvedValue([]);
      vi.mocked(authApi.getUsers).mockResolvedValue([]);
      renderWithProviders(<AttendanceList />);
      await waitFor(() => {
        expect(screen.getByText(/present/i)).toBeInTheDocument();
      });
    });

    it('should open bulk mark dialog', async () => {
      const user = userEvent.setup();
      vi.mocked(attendanceApi.getAttendanceRecords).mockResolvedValue([]);
      vi.mocked(catalogApi.getSessions).mockResolvedValue([]);
      vi.mocked(authApi.getUsers).mockResolvedValue([]);
      renderWithProviders(<AttendanceList />);
      await waitFor(() => {
        const bulkBtn = screen.getByRole('button', { name: /bulk/i });
        user.click(bulkBtn);
      });
      await waitFor(() => {
        expect(screen.getByText(/bulk mark attendance/i)).toBeInTheDocument();
      });
    });
  });
});

