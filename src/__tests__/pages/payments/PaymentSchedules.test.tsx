import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PaymentSchedules from '@/pages/payments/PaymentSchedules';
import { renderWithProviders, setupAuthStore, clearAuthStore, mockAdminUser } from '../../utils/testHelpers';
import * as paymentsApi from '@/api/endpoints/payments';

vi.mock('@/api/endpoints/payments', () => ({
  getPaymentSchedules: vi.fn(),
  markPaymentSchedulesOverdue: vi.fn(),
  getInvoices: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

global.confirm = vi.fn(() => true);

describe('PaymentSchedules Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearAuthStore();
    setupAuthStore(mockAdminUser);
  });

  describe('Rendering', () => {
    it('should render payment schedules page', async () => {
      vi.mocked(paymentsApi.getPaymentSchedules).mockResolvedValue([]);
      vi.mocked(paymentsApi.getInvoices).mockResolvedValue([]);
      renderWithProviders(<PaymentSchedules />);
      expect(screen.getByText(/payment schedules/i)).toBeInTheDocument();
    });

    it('should render mark overdue button', async () => {
      vi.mocked(paymentsApi.getPaymentSchedules).mockResolvedValue([]);
      vi.mocked(paymentsApi.getInvoices).mockResolvedValue([]);
      renderWithProviders(<PaymentSchedules />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /mark overdue/i })).toBeInTheDocument();
      });
    });
  });

  describe('Operations', () => {
    it('should display payment schedules list', async () => {
      const mockSchedules = [
        { id: '1', invoice: 'inv-1', amount: '500.00', currency: 'USD', status: 'PENDING', due_date: '2024-12-31' },
        { id: '2', invoice: 'inv-2', amount: '300.00', currency: 'USD', status: 'PAID', due_date: '2024-12-30' },
      ];
      vi.mocked(paymentsApi.getPaymentSchedules).mockResolvedValue(mockSchedules as any);
      vi.mocked(paymentsApi.getInvoices).mockResolvedValue([]);
      renderWithProviders(<PaymentSchedules />);
      await waitFor(() => {
        expect(screen.getByText('$500.00')).toBeInTheDocument();
      });
    });

    it('should mark schedules as overdue', async () => {
      const user = userEvent.setup();
      vi.mocked(paymentsApi.getPaymentSchedules).mockResolvedValue([]);
      vi.mocked(paymentsApi.getInvoices).mockResolvedValue([]);
      vi.mocked(paymentsApi.markPaymentSchedulesOverdue).mockResolvedValue({ marked_overdue: 5 } as any);
      renderWithProviders(<PaymentSchedules />);
      await waitFor(() => {
        const markOverdueBtn = screen.getByRole('button', { name: /mark overdue/i });
        user.click(markOverdueBtn);
      });
      await waitFor(() => {
        expect(paymentsApi.markPaymentSchedulesOverdue).toHaveBeenCalled();
      });
    });
  });
});

