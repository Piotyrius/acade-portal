import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
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
      expect(await screen.findByRole('heading', { name: /^payments$/i })).toBeInTheDocument();
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

      const recordBtn = await screen.findByRole('button', { name: /record payment/i });
      await user.click(recordBtn);

      const dialog = await screen.findByRole('dialog');
      expect(within(dialog).getByText(/record payment/i)).toBeInTheDocument();
    });

    it('should display payments list', async () => {
      const mockPayments = [
        {
          id: '1',
          invoice: 'inv-1',
          student: 'stu-1',
          payment_method: 'MANUAL',
          amount: '1000.00',
          currency: 'USD',
          status: 'COMPLETED',
          processed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          invoice: 'inv-2',
          student: 'stu-2',
          payment_method: 'MANUAL',
          amount: '500.00',
          currency: 'USD',
          status: 'PENDING',
          processed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      vi.mocked(paymentsApi.getPayments).mockResolvedValue(mockPayments as any);
      vi.mocked(paymentsApi.getInvoices).mockResolvedValue([]);
      vi.mocked(authApi.getUsers).mockResolvedValue([]);
      renderWithProviders(<Payments />);

      await screen.findByRole('heading', { name: /^payments$/i });
      await waitFor(() => {
        expect(screen.getByText('$1,000.00')).toBeInTheDocument();
      });
    });

    it('should process refund', async () => {
      const user = userEvent.setup();
      const mockPayments = [
        {
          id: '1',
          invoice: 'inv-1',
          student: 'stu-1',
          payment_method: 'MANUAL',
          amount: '1000.00',
          currency: 'USD',
          status: 'COMPLETED',
          processed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      vi.mocked(paymentsApi.getPayments).mockResolvedValue(mockPayments as any);
      vi.mocked(paymentsApi.getInvoices).mockResolvedValue([]);
      vi.mocked(authApi.getUsers).mockResolvedValue([]);
      vi.mocked(paymentsApi.processRefund).mockResolvedValue({} as any);
      renderWithProviders(<Payments />);

      await screen.findByRole('heading', { name: /^payments$/i });
      await waitFor(() => {
        expect(screen.getByText('$1,000.00')).toBeInTheDocument();
      });
      const refundBtn = screen.getByTitle(/refund/i);
      await user.click(refundBtn);
      await waitFor(() => {
        expect(screen.getByText(/process refund/i)).toBeInTheDocument();
      });
    });

    it('should record payment via recordPayment', async () => {
      const user = userEvent.setup();
      const mockInvoice = {
        id: 'inv-1',
        organization: 'org-123',
        invoice_number: 'INV-001',
        total_amount: '1000.00',
      };
      vi.mocked(paymentsApi.getPayments).mockResolvedValue([]);
      vi.mocked(paymentsApi.getInvoices).mockResolvedValue([mockInvoice] as any);
      vi.mocked(authApi.getUsers).mockResolvedValue([
        { id: 'stu-1', first_name: 'Test', last_name: 'Student', email: 'test@example.com' },
      ] as any);
      vi.mocked(paymentsApi.recordPayment).mockResolvedValue({
        id: 'pay-1',
        invoice: 'inv-1',
        student: 'stu-1',
        payment_method: 'MANUAL',
        amount: '123.45',
        currency: 'USD',
        status: 'COMPLETED',
        processed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any);
      
      renderWithProviders(<Payments />);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /record payment/i })).toBeInTheDocument();
      });
      
      const recordBtn = screen.getByRole('button', { name: /record payment/i });
      await user.click(recordBtn);

      const dialog = await screen.findByRole('dialog');
      expect(within(dialog).getByText(/record payment/i)).toBeInTheDocument();

      const [invoiceTrigger] = within(dialog).getAllByRole('combobox');
      await user.click(invoiceTrigger);
      const invoiceOption = await screen.findByRole('option', { name: /INV-001/i });
      await user.click(invoiceOption);

      const amountInput = within(dialog).getByLabelText(/amount/i);
      await user.clear(amountInput);
      await user.type(amountInput, '123.45');

      const submitBtn = within(dialog).getByRole('button', { name: /^record$/i });
      await user.click(submitBtn);

      await waitFor(() => {
        expect(paymentsApi.recordPayment).toHaveBeenCalled();
        const callArgs = vi.mocked(paymentsApi.recordPayment).mock.calls[0][0];
        expect(callArgs).toMatchObject({ invoice: 'inv-1', amount: '123.45' });
      });
    });
  });
});

