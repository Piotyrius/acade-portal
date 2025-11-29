import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Pricings from '@/pages/payments/Pricings';
import { renderWithProviders, setupAuthStore, clearAuthStore, mockAdminUser } from '../../utils/testHelpers';
import * as paymentsApi from '@/api/endpoints/payments';
import * as catalogApi from '@/api/endpoints/catalog';

vi.mock('@/api/endpoints/payments', () => ({
  getPricings: vi.fn(),
  createPricing: vi.fn(),
  updatePricing: vi.fn(),
  deletePricing: vi.fn(),
}));

vi.mock('@/api/endpoints/catalog', () => ({
  getPrograms: vi.fn(),
  getCourses: vi.fn(),
  getCohorts: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

global.confirm = vi.fn(() => true);

describe('Pricings Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearAuthStore();
    setupAuthStore(mockAdminUser);
  });

  describe('Rendering', () => {
    it('should render pricings page', async () => {
      vi.mocked(paymentsApi.getPricings).mockResolvedValue([]);
      vi.mocked(catalogApi.getPrograms).mockResolvedValue([]);
      vi.mocked(catalogApi.getCourses).mockResolvedValue([]);
      vi.mocked(catalogApi.getCohorts).mockResolvedValue([]);
      renderWithProviders(<Pricings />);
      expect(screen.getByText(/pricings/i)).toBeInTheDocument();
    });

    it('should render create button', async () => {
      vi.mocked(paymentsApi.getPricings).mockResolvedValue([]);
      vi.mocked(catalogApi.getPrograms).mockResolvedValue([]);
      vi.mocked(catalogApi.getCourses).mockResolvedValue([]);
      vi.mocked(catalogApi.getCohorts).mockResolvedValue([]);
      renderWithProviders(<Pricings />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
      });
    });
  });

  describe('CRUD Operations', () => {
    it('should open create dialog', async () => {
      const user = userEvent.setup();
      vi.mocked(paymentsApi.getPricings).mockResolvedValue([]);
      vi.mocked(catalogApi.getPrograms).mockResolvedValue([]);
      vi.mocked(catalogApi.getCourses).mockResolvedValue([]);
      vi.mocked(catalogApi.getCohorts).mockResolvedValue([]);
      renderWithProviders(<Pricings />);
      await waitFor(() => {
        const createBtn = screen.getByRole('button', { name: /create/i });
        user.click(createBtn);
      });
      await waitFor(() => {
        expect(screen.getByText(/create pricing/i)).toBeInTheDocument();
      });
    });

    it('should display pricings list', async () => {
      const mockPricings = [
        { id: '1', object_id: 'prog-1', amount: '1000.00', currency: 'USD', is_active: true },
        { id: '2', object_id: 'course-1', amount: '500.00', currency: 'USD', is_active: true },
      ];
      vi.mocked(paymentsApi.getPricings).mockResolvedValue(mockPricings as any);
      vi.mocked(catalogApi.getPrograms).mockResolvedValue([]);
      vi.mocked(catalogApi.getCourses).mockResolvedValue([]);
      vi.mocked(catalogApi.getCohorts).mockResolvedValue([]);
      renderWithProviders(<Pricings />);
      await waitFor(() => {
        expect(screen.getByText('$1,000.00')).toBeInTheDocument();
      });
    });

    it('should delete pricing', async () => {
      const user = userEvent.setup();
      const mockPricings = [{ id: '1', object_id: 'prog-1', amount: '1000.00', currency: 'USD', is_active: true }];
      vi.mocked(paymentsApi.getPricings).mockResolvedValue(mockPricings as any);
      vi.mocked(catalogApi.getPrograms).mockResolvedValue([]);
      vi.mocked(catalogApi.getCourses).mockResolvedValue([]);
      vi.mocked(catalogApi.getCohorts).mockResolvedValue([]);
      vi.mocked(paymentsApi.deletePricing).mockResolvedValue(undefined);
      renderWithProviders(<Pricings />);
      await waitFor(() => {
        expect(screen.getByText('$1,000.00')).toBeInTheDocument();
      });
      const deleteBtn = screen.getByTitle(/delete/i);
      await user.click(deleteBtn);
      await waitFor(() => {
        expect(paymentsApi.deletePricing).toHaveBeenCalledWith('1');
      });
    });
  });

  describe('Object Type Selection', () => {
    it('should show object type selector in create dialog', async () => {
      const user = userEvent.setup();
      vi.mocked(paymentsApi.getPricings).mockResolvedValue([]);
      vi.mocked(catalogApi.getPrograms).mockResolvedValue([]);
      vi.mocked(catalogApi.getCourses).mockResolvedValue([]);
      vi.mocked(catalogApi.getCohorts).mockResolvedValue([]);
      renderWithProviders(<Pricings />);
      await waitFor(() => {
        const createBtn = screen.getByRole('button', { name: /create/i });
        user.click(createBtn);
      });
      await waitFor(() => {
        expect(screen.getByText(/object type/i)).toBeInTheDocument();
      });
    });
  });
});

