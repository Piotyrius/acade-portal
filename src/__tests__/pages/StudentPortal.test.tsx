import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StudentPortal from '@/pages/StudentPortal';
import { renderWithProviders, setupAuthStore, clearAuthStore, mockStudentUser } from '../utils/testHelpers';
import * as studentPortalApi from '@/api/endpoints/studentPortal';

vi.mock('@/api/endpoints/studentPortal', () => ({
  getMyEnrollments: vi.fn(),
  getMyAttendance: vi.fn(),
  getMyAssessments: vi.fn(),
  getMyGrades: vi.fn(),
  getMyCertificates: vi.fn(),
  getMyOutstandingBalance: vi.fn(),
  getMyPayments: vi.fn(),
}));

describe('StudentPortal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearAuthStore();
    setupAuthStore(mockStudentUser);
  });

  describe('Rendering', () => {
    it('should render student portal page', async () => {
      vi.mocked(studentPortalApi.getMyEnrollments).mockResolvedValue([]);
      vi.mocked(studentPortalApi.getMyAttendance).mockResolvedValue([]);
      vi.mocked(studentPortalApi.getMyAssessments).mockResolvedValue([]);
      vi.mocked(studentPortalApi.getMyGrades).mockResolvedValue([]);
      vi.mocked(studentPortalApi.getMyCertificates).mockResolvedValue([]);
      vi.mocked(studentPortalApi.getMyOutstandingBalance).mockResolvedValue({ outstanding_balance_minor: 0, currency: 'USD' });
      vi.mocked(studentPortalApi.getMyPayments).mockResolvedValue([]);
      renderWithProviders(<StudentPortal />);
      expect(screen.getByText(/student portal/i)).toBeInTheDocument();
    });

    it('should render all tabs', async () => {
      vi.mocked(studentPortalApi.getMyEnrollments).mockResolvedValue([]);
      vi.mocked(studentPortalApi.getMyAttendance).mockResolvedValue([]);
      vi.mocked(studentPortalApi.getMyAssessments).mockResolvedValue([]);
      vi.mocked(studentPortalApi.getMyGrades).mockResolvedValue([]);
      vi.mocked(studentPortalApi.getMyCertificates).mockResolvedValue([]);
      vi.mocked(studentPortalApi.getMyOutstandingBalance).mockResolvedValue({ outstanding_balance_minor: 0, currency: 'USD' });
      vi.mocked(studentPortalApi.getMyPayments).mockResolvedValue([]);
      renderWithProviders(<StudentPortal />);
      await waitFor(() => {
        expect(screen.getByText(/enrollments/i)).toBeInTheDocument();
        expect(screen.getByText(/attendance/i)).toBeInTheDocument();
        expect(screen.getByText(/assessments/i)).toBeInTheDocument();
        expect(screen.getByText(/grades/i)).toBeInTheDocument();
        expect(screen.getByText(/certificates/i)).toBeInTheDocument();
        expect(screen.getByText(/financial/i)).toBeInTheDocument();
      });
    });
  });

  describe('Tabs Content', () => {
    it('should display enrollments in enrollments tab', async () => {
      const mockEnrollments = [
        { id: '1', cohort_name: 'Cohort 1', status: 'ACTIVE', enrolled_at: '2024-01-01' },
      ];
      vi.mocked(studentPortalApi.getMyEnrollments).mockResolvedValue(mockEnrollments as any);
      vi.mocked(studentPortalApi.getMyAttendance).mockResolvedValue([]);
      vi.mocked(studentPortalApi.getMyAssessments).mockResolvedValue([]);
      vi.mocked(studentPortalApi.getMyGrades).mockResolvedValue([]);
      vi.mocked(studentPortalApi.getMyCertificates).mockResolvedValue([]);
      vi.mocked(studentPortalApi.getMyOutstandingBalance).mockResolvedValue({ outstanding_balance_minor: 0, currency: 'USD' });
      vi.mocked(studentPortalApi.getMyPayments).mockResolvedValue([]);
      renderWithProviders(<StudentPortal />);
      await waitFor(() => {
        expect(screen.getByText('Cohort 1')).toBeInTheDocument();
      });
    });

    it('should display outstanding balance in financial tab', async () => {
      vi.mocked(studentPortalApi.getMyEnrollments).mockResolvedValue([]);
      vi.mocked(studentPortalApi.getMyAttendance).mockResolvedValue([]);
      vi.mocked(studentPortalApi.getMyAssessments).mockResolvedValue([]);
      vi.mocked(studentPortalApi.getMyGrades).mockResolvedValue([]);
      vi.mocked(studentPortalApi.getMyCertificates).mockResolvedValue([]);
      vi.mocked(studentPortalApi.getMyOutstandingBalance).mockResolvedValue({ outstanding_balance_minor: 5000, currency: 'USD' });
      vi.mocked(studentPortalApi.getMyPayments).mockResolvedValue([]);
      renderWithProviders(<StudentPortal />);
      await waitFor(() => {
        const financialTab = screen.getByText(/financial/i);
        fireEvent.click(financialTab);
      });
      await waitFor(() => {
        expect(screen.getByText(/outstanding balance/i)).toBeInTheDocument();
      });
    });
  });
});

