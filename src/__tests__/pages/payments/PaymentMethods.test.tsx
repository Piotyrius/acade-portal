import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PaymentMethods from '@/pages/payments/PaymentMethods';
import { renderWithProviders, setupAuthStore, clearAuthStore, mockAdminUser } from '../../utils/testHelpers';
import * as paymentsApi from '@/api/endpoints/payments';

vi.mock('@/api/endpoints/payments', () => ({
  getPaymentMethods: vi.fn(),
  createPaymentMethod: vi.fn(),
  updatePaymentMethod: vi.fn(),
  deletePaymentMethod: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

global.confirm = vi.fn(() => true);

describe('PaymentMethods Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearAuthStore();
    setupAuthStore(mockAdminUser);
  });

  describe('Rendering', () => {
    it('should render payment methods page', async () => {
      vi.mocked(paymentsApi.getPaymentMethods).mockResolvedValue([]);
      renderWithProviders(<PaymentMethods />);
      expect(screen.getByText(/payment methods/i)).toBeInTheDocument();
    });

    it('should render create button', async () => {
      vi.mocked(paymentsApi.getPaymentMethods).mockResolvedValue([]);
      renderWithProviders(<PaymentMethods />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
      });
    });
  });

  describe('CRUD Operations', () => {
    it('should open create dialog', async () => {
      const user = userEvent.setup();
      vi.mocked(paymentsApi.getPaymentMethods).mockResolvedValue([]);
      renderWithProviders(<PaymentMethods />);
      await waitFor(() => {
        const createBtn = screen.getByRole('button', { name: /create/i });
        user.click(createBtn);
      });
      await waitFor(() => {
        expect(screen.getByText(/create payment method/i)).toBeInTheDocument();
      });
    });

    it('should display payment methods list', async () => {
      const mockMethods = [
        { id: '1', name: 'Credit Card', code: 'CC', is_active: true, requires_receipt: false },
        { id: '2', name: 'Bank Transfer', code: 'BT', is_active: true, requires_receipt: true },
      ];
      vi.mocked(paymentsApi.getPaymentMethods).mockResolvedValue(mockMethods as any);
      renderWithProviders(<PaymentMethods />);
      await waitFor(() => {
        expect(screen.getByText('Credit Card')).toBeInTheDocument();
        expect(screen.getByText('Bank Transfer')).toBeInTheDocument();
      });
    });

    it('should delete payment method', async () => {
      const user = userEvent.setup();
      const mockMethods = [{ id: '1', name: 'Test Method', code: 'TM', is_active: true }];
      vi.mocked(paymentsApi.getPaymentMethods).mockResolvedValue(mockMethods as any);
      vi.mocked(paymentsApi.deletePaymentMethod).mockResolvedValue(undefined);
      renderWithProviders(<PaymentMethods />);
      await waitFor(() => {
        expect(screen.getByText('Test Method')).toBeInTheDocument();
      });
      const deleteBtn = screen.getByTitle(/delete/i);
      await user.click(deleteBtn);
      await waitFor(() => {
        expect(paymentsApi.deletePaymentMethod).toHaveBeenCalledWith('1');
      });
    });
  });
});

