import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Discounts from '@/pages/payments/Discounts';
import { renderWithProviders, setupAuthStore, clearAuthStore, mockAdminUser } from '../../utils/testHelpers';
import * as paymentsApi from '@/api/endpoints/payments';

vi.mock('@/api/endpoints/payments', () => ({
  getDiscounts: vi.fn(),
  createDiscount: vi.fn(),
  updateDiscount: vi.fn(),
  deleteDiscount: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

global.confirm = vi.fn(() => true);

describe('Discounts Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearAuthStore();
    setupAuthStore(mockAdminUser);
  });

  describe('Rendering', () => {
    it('should render discounts page', async () => {
      vi.mocked(paymentsApi.getDiscounts).mockResolvedValue([]);
      renderWithProviders(<Discounts />);
      expect(screen.getByText(/discounts/i)).toBeInTheDocument();
    });

    it('should render create button', async () => {
      vi.mocked(paymentsApi.getDiscounts).mockResolvedValue([]);
      renderWithProviders(<Discounts />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
      });
    });
  });

  describe('CRUD Operations', () => {
    it('should open create dialog', async () => {
      const user = userEvent.setup();
      vi.mocked(paymentsApi.getDiscounts).mockResolvedValue([]);
      renderWithProviders(<Discounts />);
      await waitFor(() => {
        const createBtn = screen.getByRole('button', { name: /create/i });
        user.click(createBtn);
      });
      await waitFor(() => {
        expect(screen.getByText(/create discount/i)).toBeInTheDocument();
      });
    });

    it('should delete discount', async () => {
      const user = userEvent.setup();
      const mockDiscounts = [{ id: '1', name: 'Test Discount', type: 'PERCENTAGE', value: '10' }];
      vi.mocked(paymentsApi.getDiscounts).mockResolvedValue(mockDiscounts as any);
      vi.mocked(paymentsApi.deleteDiscount).mockResolvedValue(undefined);
      renderWithProviders(<Discounts />);
      await waitFor(() => {
        expect(screen.getByText('Test Discount')).toBeInTheDocument();
      });
      const deleteBtn = screen.getByTitle(/delete/i);
      await user.click(deleteBtn);
      await waitFor(() => {
        expect(paymentsApi.deleteDiscount).toHaveBeenCalledWith('1');
      });
    });
  });
});

