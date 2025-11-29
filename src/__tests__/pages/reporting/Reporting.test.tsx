import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Reporting from '@/pages/reporting/Reporting';
import { renderWithProviders, setupAuthStore, clearAuthStore, mockAdminUser } from '../../utils/testHelpers';
import * as reportingApi from '@/api/endpoints/reporting';

vi.mock('@/api/endpoints/reporting', () => ({
  getAnalyticsOverview: vi.fn(),
  getCohortAnalytics: vi.fn(),
  getFinancialAnalytics: vi.fn(),
  getStudentFinancialReport: vi.fn(),
  getTimeseriesAnalytics: vi.fn(),
  exportPayrollReport: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

describe('Reporting Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearAuthStore();
    setupAuthStore(mockAdminUser);
  });

  describe('Rendering', () => {
    it('should render reporting page', async () => {
      vi.mocked(reportingApi.getAnalyticsOverview).mockResolvedValue({
        total_enrollments: 100,
        total_revenue_minor: 100000,
        total_paid_minor: 80000,
        total_outstanding_minor: 20000,
        currency: 'USD',
      } as any);
      vi.mocked(reportingApi.getCohortAnalytics).mockResolvedValue([]);
      vi.mocked(reportingApi.getFinancialAnalytics).mockResolvedValue([]);
      vi.mocked(reportingApi.getStudentFinancialReport).mockResolvedValue([]);
      vi.mocked(reportingApi.getTimeseriesAnalytics).mockResolvedValue([]);
      renderWithProviders(<Reporting />);
      expect(screen.getByText(/analytics dashboard/i)).toBeInTheDocument();
    });

    it('should render analytics tabs', async () => {
      vi.mocked(reportingApi.getAnalyticsOverview).mockResolvedValue({
        total_enrollments: 100,
        total_revenue_minor: 100000,
        total_paid_minor: 80000,
        total_outstanding_minor: 20000,
        currency: 'USD',
      } as any);
      vi.mocked(reportingApi.getCohortAnalytics).mockResolvedValue([]);
      vi.mocked(reportingApi.getFinancialAnalytics).mockResolvedValue([]);
      vi.mocked(reportingApi.getStudentFinancialReport).mockResolvedValue([]);
      vi.mocked(reportingApi.getTimeseriesAnalytics).mockResolvedValue([]);
      renderWithProviders(<Reporting />);
      await waitFor(() => {
        expect(screen.getByText(/analytics dashboard/i)).toBeInTheDocument();
        expect(screen.getByText(/reports & exports/i)).toBeInTheDocument();
      });
    });
  });

  describe('Analytics Display', () => {
    it('should display overview metrics', async () => {
      vi.mocked(reportingApi.getAnalyticsOverview).mockResolvedValue({
        total_enrollments: 100,
        total_revenue_minor: 100000,
        total_paid_minor: 80000,
        total_outstanding_minor: 20000,
        currency: 'USD',
      } as any);
      vi.mocked(reportingApi.getCohortAnalytics).mockResolvedValue([]);
      vi.mocked(reportingApi.getFinancialAnalytics).mockResolvedValue([]);
      vi.mocked(reportingApi.getStudentFinancialReport).mockResolvedValue([]);
      vi.mocked(reportingApi.getTimeseriesAnalytics).mockResolvedValue([]);
      renderWithProviders(<Reporting />);
      await waitFor(() => {
        expect(screen.getByText('100')).toBeInTheDocument(); // Total enrollments
      });
    });
  });
});

