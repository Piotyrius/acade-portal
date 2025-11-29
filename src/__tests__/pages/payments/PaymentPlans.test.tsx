import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PaymentPlans from '@/pages/payments/PaymentPlans';
import { renderWithProviders, setupAuthStore, clearAuthStore, mockAdminUser } from '../../utils/testHelpers';
import * as paymentsApi from '@/api/endpoints/payments';

vi.mock('@/api/endpoints/payments', () => ({
  getPaymentPlans: vi.fn(),
  createPaymentPlan: vi.fn(),
  updatePaymentPlan: vi.fn(),
  deletePaymentPlan: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

global.confirm = vi.fn(() => true);

describe('PaymentPlans Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearAuthStore();
    setupAuthStore(mockAdminUser);
  });

  describe('Rendering', () => {
    it('should render payment plans page', async () => {
      vi.mocked(paymentsApi.getPaymentPlans).mockResolvedValue([]);
      renderWithProviders(<PaymentPlans />);
      expect(screen.getByText(/payment plans/i)).toBeInTheDocument();
    });

    it('should render create button', async () => {
      vi.mocked(paymentsApi.getPaymentPlans).mockResolvedValue([]);
      renderWithProviders(<PaymentPlans />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
      });
    });
  });

  describe('CRUD Operations', () => {
    it('should open create dialog', async () => {
      const user = userEvent.setup();
      vi.mocked(paymentsApi.getPaymentPlans).mockResolvedValue([]);
      renderWithProviders(<PaymentPlans />);
      await waitFor(() => {
        const createBtn = screen.getByRole('button', { name: /create/i });
        user.click(createBtn);
      });
      await waitFor(() => {
        expect(screen.getByText(/create payment plan/i)).toBeInTheDocument();
      });
    });

    it('should display payment plans list', async () => {
      const mockPlans = [
        { id: '1', name: 'Monthly Plan', type: 'MONTHLY', installment_count: 12, is_active: true },
        { id: '2', name: 'Full Payment', type: 'FULL', is_active: true },
      ];
      vi.mocked(paymentsApi.getPaymentPlans).mockResolvedValue(mockPlans as any);
      renderWithProviders(<PaymentPlans />);
      await waitFor(() => {
        expect(screen.getByText('Monthly Plan')).toBeInTheDocument();
        expect(screen.getByText('Full Payment')).toBeInTheDocument();
      });
    });

    it('should delete payment plan', async () => {
      const user = userEvent.setup();
      const mockPlans = [{ id: '1', name: 'Test Plan', type: 'MONTHLY', is_active: true }];
      vi.mocked(paymentsApi.getPaymentPlans).mockResolvedValue(mockPlans as any);
      vi.mocked(paymentsApi.deletePaymentPlan).mockResolvedValue(undefined);
      renderWithProviders(<PaymentPlans />);
      await waitFor(() => {
        expect(screen.getByText('Test Plan')).toBeInTheDocument();
      });
      const deleteBtn = screen.getByTitle(/delete/i);
      await user.click(deleteBtn);
      await waitFor(() => {
        expect(paymentsApi.deletePaymentPlan).toHaveBeenCalledWith('1');
      });
    });
  });
});

