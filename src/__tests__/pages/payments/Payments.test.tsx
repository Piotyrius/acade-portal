import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Payments from '@/pages/payments/Payments';
import { renderWithProviders, setupAuthStore, clearAuthStore, mockAdminUser } from '../../utils/testHelpers';
import * as paymentsApi from '@/api/endpoints/payments';
import * as authApi from '@/api/endpoints/auth';

vi.mock('@/api/endpoints/payments', () => ({
  getPayments: vi.fn(),
  createPayment: vi.fn(),
  updatePayment: vi.fn(),
  deletePayment: vi.fn(),
  processRefund: vi.fn(),
  recordPayment: vi.fn(),
  getInvoices: vi.fn(),
}));

vi.mock('@/api/endpoints/auth', () => ({
  getUsers: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

global.confirm = vi.fn(() => true);

describe('Payments Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearAuthStore();
    setupAuthStore(mockAdminUser);
  });

  describe('Rendering', () => {
    it('should render payments page', async () => {
      vi.mocked(paymentsApi.getPayments).mockResolvedValue([]);
      vi.mocked(paymentsApi.getInvoices).mockResolvedValue([]);
      vi.mocked(authApi.getUsers).mockResolvedValue([]);
      renderWithProviders(<Payments />);
      expect(screen.getByText(/payments/i)).toBeInTheDocument();
    });

    it('should render record payment button', async () => {
      vi.mocked(paymentsApi.getPayments).mockResolvedValue([]);
      vi.mocked(paymentsApi.getInvoices).mockResolvedValue([]);
      vi.mocked(authApi.getUsers).mockResolvedValue([]);
      renderWithProviders(<Payments />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /record payment/i })).toBeInTheDocument();
      });
    });
  });

  describe('CRUD Operations', () => {
    it('should open record payment dialog', async () => {
      const user = userEvent.setup();
      vi.mocked(paymentsApi.getPayments).mockResolvedValue([]);
      vi.mocked(paymentsApi.getInvoices).mockResolvedValue([]);
      vi.mocked(authApi.getUsers).mockResolvedValue([]);
      renderWithProviders(<Payments />);
      await waitFor(() => {
        const recordBtn = screen.getByRole('button', { name: /record payment/i });
        user.click(recordBtn);
      });
      await waitFor(() => {
        expect(screen.getByText(/record payment/i)).toBeInTheDocument();
      });
    });

    it('should display payments list', async () => {
      const mockPayments = [
        { id: '1', invoice: 'inv-1', amount: '1000.00', currency: 'USD', status: 'COMPLETED' },
        { id: '2', invoice: 'inv-2', amount: '500.00', currency: 'USD', status: 'PENDING' },
      ];
      vi.mocked(paymentsApi.getPayments).mockResolvedValue(mockPayments as any);
      vi.mocked(paymentsApi.getInvoices).mockResolvedValue([]);
      vi.mocked(authApi.getUsers).mockResolvedValue([]);
      renderWithProviders(<Payments />);
      await waitFor(() => {
        expect(screen.getByText('$1,000.00')).toBeInTheDocument();
      });
    });

    it('should process refund', async () => {
      const user = userEvent.setup();
      const mockPayments = [
        { id: '1', invoice: 'inv-1', amount: '1000.00', currency: 'USD', status: 'COMPLETED' },
      ];
      vi.mocked(paymentsApi.getPayments).mockResolvedValue(mockPayments as any);
      vi.mocked(paymentsApi.getInvoices).mockResolvedValue([]);
      vi.mocked(authApi.getUsers).mockResolvedValue([]);
      vi.mocked(paymentsApi.processRefund).mockResolvedValue({} as any);
      renderWithProviders(<Payments />);
      await waitFor(() => {
        expect(screen.getByText('$1,000.00')).toBeInTheDocument();
      });
      const refundBtn = screen.getByTitle(/refund/i);
      await user.click(refundBtn);
      await waitFor(() => {
        expect(screen.getByText(/process refund/i)).toBeInTheDocument();
      });
    });

    it('should create payment with organization and recorded_by in payload', async () => {
      const user = userEvent.setup();
      const mockInvoice = { id: 'inv-1', organization: 'org-123', invoice_number: 'INV-001' };
      vi.mocked(paymentsApi.getPayments).mockResolvedValue([]);
      vi.mocked(paymentsApi.getInvoices).mockResolvedValue([mockInvoice] as any);
      vi.mocked(authApi.getUsers).mockResolvedValue([]);
      vi.mocked(paymentsApi.createPayment).mockResolvedValue({ id: '1' } as any);
      
      renderWithProviders(<Payments />);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /record payment/i })).toBeInTheDocument();
      });
      
      const recordBtn = screen.getByRole('button', { name: /record payment/i });
      await user.click(recordBtn);
      
      await waitFor(() => {
        expect(screen.getByText(/record payment/i)).toBeInTheDocument();
      });
      
      // Fill form and submit - the payload should include organization and recorded_by
      // This test verifies the component uses the correct payload structure
      const submitBtn = screen.getByRole('button', { name: /save/i });
      await user.click(submitBtn);
      
      await waitFor(() => {
        expect(paymentsApi.createPayment).toHaveBeenCalled();
        const callArgs = vi.mocked(paymentsApi.createPayment).mock.calls[0][0];
        expect(callArgs).toHaveProperty('organization');
        expect(callArgs).toHaveProperty('recorded_by');
      });
    });
  });
});

