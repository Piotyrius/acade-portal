import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from '@/pages/Dashboard';
import { renderWithProviders, setupAuthStore, clearAuthStore, mockAdminUser, mockLecturerUser } from '../utils/testHelpers';
import * as catalogApi from '@/api/endpoints/catalog';
import * as admissionsApi from '@/api/endpoints/admissions';
import * as certificatesApi from '@/api/endpoints/certificates';

// Mock all API calls
vi.mock('@/api/endpoints/catalog', () => ({
  getCohorts: vi.fn(),
  getMySessions: vi.fn(),
}));

vi.mock('@/api/endpoints/admissions', () => ({
  getEnrollments: vi.fn(),
}));

vi.mock('@/api/endpoints/certificates', () => ({
  getCertificates: vi.fn(),
}));

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearAuthStore();
  });

  describe('Rendering', () => {
    it('should render dashboard with title', async () => {
      setupAuthStore(mockAdminUser);
      vi.mocked(catalogApi.getCohorts).mockResolvedValue([]);
      vi.mocked(admissionsApi.getEnrollments).mockResolvedValue([]);
      vi.mocked(certificatesApi.getCertificates).mockResolvedValue([]);

      renderWithProviders(<Dashboard />);

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('should render all stat cards for admin', async () => {
      setupAuthStore(mockAdminUser);
      vi.mocked(catalogApi.getCohorts).mockResolvedValue([]);
      vi.mocked(admissionsApi.getEnrollments).mockResolvedValue([]);
      vi.mocked(certificatesApi.getCertificates).mockResolvedValue([]);

      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Total Students')).toBeInTheDocument();
        expect(screen.getByText('Active Cohorts')).toBeInTheDocument();
        expect(screen.getByText('Attendance Rate')).toBeInTheDocument();
        expect(screen.getByText('Certificates Issued')).toBeInTheDocument();
      });
    });

    it('should show correct description for admin', async () => {
      setupAuthStore(mockAdminUser);
      vi.mocked(catalogApi.getCohorts).mockResolvedValue([]);
      vi.mocked(admissionsApi.getEnrollments).mockResolvedValue([]);
      vi.mocked(certificatesApi.getCertificates).mockResolvedValue([]);

      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText(/overview of your academy/i)).toBeInTheDocument();
      });
    });

    it('should show correct description for lecturer', async () => {
      setupAuthStore(mockLecturerUser);
      vi.mocked(catalogApi.getCohorts).mockResolvedValue([]);
      vi.mocked(catalogApi.getMySessions).mockResolvedValue([]);
      vi.mocked(certificatesApi.getCertificates).mockResolvedValue([]);

      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText(/your teaching schedule/i)).toBeInTheDocument();
      });
    });
  });

  describe('Data Display', () => {
    it('should display enrollment count correctly', async () => {
      setupAuthStore(mockAdminUser);
      const mockEnrollments = [
        { id: '1', status: 'ACTIVE', student_name: 'John Doe', cohort_name: 'Cohort 1', enrolled_at: '2024-01-01' },
        { id: '2', status: 'ACTIVE', student_name: 'Jane Doe', cohort_name: 'Cohort 1', enrolled_at: '2024-01-02' },
      ];
      vi.mocked(catalogApi.getCohorts).mockResolvedValue([]);
      vi.mocked(admissionsApi.getEnrollments).mockResolvedValue(mockEnrollments);
      vi.mocked(certificatesApi.getCertificates).mockResolvedValue([]);

      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument(); // Total students count
      });
    });

    it('should display active cohorts count', async () => {
      setupAuthStore(mockAdminUser);
      const mockCohorts = [
        { id: '1', status: 'ACTIVE', name: 'Cohort 1' },
        { id: '2', status: 'ACTIVE', name: 'Cohort 2' },
        { id: '3', status: 'COMPLETED', name: 'Cohort 3' },
      ];
      vi.mocked(catalogApi.getCohorts).mockResolvedValue(mockCohorts as any);
      vi.mocked(admissionsApi.getEnrollments).mockResolvedValue([]);
      vi.mocked(certificatesApi.getCertificates).mockResolvedValue([]);

      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument(); // Active cohorts
      });
    });

    it('should display certificates issued count', async () => {
      setupAuthStore(mockAdminUser);
      const mockCertificates = [
        { id: '1', status: 'ISSUED', student_name: 'John', issued_at: '2024-01-01' },
        { id: '2', status: 'ISSUED', student_name: 'Jane', issued_at: '2024-01-02' },
      ];
      vi.mocked(catalogApi.getCohorts).mockResolvedValue([]);
      vi.mocked(admissionsApi.getEnrollments).mockResolvedValue([]);
      vi.mocked(certificatesApi.getCertificates).mockResolvedValue(mockCertificates as any);

      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument(); // Certificates issued
      });
    });
  });

  describe('Lecturer View', () => {
    it('should show upcoming sessions for lecturer', async () => {
      setupAuthStore(mockLecturerUser);
      const today = new Date().toISOString().split('T')[0];
      const mockSessions = [
        { id: '1', cohort_name: 'Cohort 1', date: today, start_time: '10:00', location: 'Room A' },
      ];
      vi.mocked(catalogApi.getCohorts).mockResolvedValue([]);
      vi.mocked(catalogApi.getMySessions).mockResolvedValue(mockSessions as any);
      vi.mocked(certificatesApi.getCertificates).mockResolvedValue([]);

      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('My Upcoming Sessions')).toBeInTheDocument();
        expect(screen.getByText('Cohort 1')).toBeInTheDocument();
      });
    });
  });

  describe('Empty States', () => {
    it('should show empty state when no enrollments', async () => {
      setupAuthStore(mockAdminUser);
      vi.mocked(catalogApi.getCohorts).mockResolvedValue([]);
      vi.mocked(admissionsApi.getEnrollments).mockResolvedValue([]);
      vi.mocked(certificatesApi.getCertificates).mockResolvedValue([]);

      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText(/no enrollments yet/i)).toBeInTheDocument();
      });
    });

    it('should show empty state when no certificates', async () => {
      setupAuthStore(mockAdminUser);
      vi.mocked(catalogApi.getCohorts).mockResolvedValue([]);
      vi.mocked(admissionsApi.getEnrollments).mockResolvedValue([]);
      vi.mocked(certificatesApi.getCertificates).mockResolvedValue([]);

      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText(/no certificates issued yet/i)).toBeInTheDocument();
      });
    });
  });
});

