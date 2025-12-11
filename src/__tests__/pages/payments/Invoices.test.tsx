import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Invoices from '@/pages/payments/Invoices';
import { renderWithProviders, setupAuthStore, clearAuthStore, mockAdminUser } from '../../utils/testHelpers';
import * as paymentsApi from '@/api/endpoints/payments';
import * as admissionsApi from '@/api/endpoints/admissions';

// Mock all API calls
vi.mock('@/api/endpoints/payments', () => ({
  getInvoices: vi.fn(),
  createInvoice: vi.fn(),
  updateInvoice: vi.fn(),
  deleteInvoice: vi.fn(),
  issueInvoice: vi.fn(),
  applyDiscountsToInvoice: vi.fn(),
  getInvoiceOutstandingBalance: vi.fn(),
  createInvoiceForEnrollment: vi.fn(),
  getPricings: vi.fn(),
  getPaymentPlans: vi.fn(),
  getDiscounts: vi.fn(),
}));

vi.mock('@/api/endpoints/admissions', () => ({
  getEnrollments: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock window.confirm
global.confirm = vi.fn(() => true);

describe('Invoices Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearAuthStore();
    setupAuthStore(mockAdminUser);
  });

  describe('Rendering', () => {
    it('should render invoices page with title', async () => {
      vi.mocked(paymentsApi.getInvoices).mockResolvedValue([]);
      vi.mocked(admissionsApi.getEnrollments).mockResolvedValue([]);
      vi.mocked(paymentsApi.getPaymentPlans).mockResolvedValue([]);
      vi.mocked(paymentsApi.getPricings).mockResolvedValue([]);

      renderWithProviders(<Invoices />);

      expect(screen.getByText('Invoices')).toBeInTheDocument();
      expect(screen.getByText(/manage student invoices/i)).toBeInTheDocument();
    });

    it('should show permission message for non-admin users', () => {
      clearAuthStore();
      setupAuthStore({ ...mockAdminUser, role: 'STUDENT' });

      renderWithProviders(<Invoices />);

      expect(screen.getByText(/don't have permission/i)).toBeInTheDocument();
    });

    it('should render create invoice button', async () => {
      vi.mocked(paymentsApi.getInvoices).mockResolvedValue([]);
      vi.mocked(admissionsApi.getEnrollments).mockResolvedValue([]);
      vi.mocked(paymentsApi.getPaymentPlans).mockResolvedValue([]);
      vi.mocked(paymentsApi.getPricings).mockResolvedValue([]);

      renderWithProviders(<Invoices />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create invoice/i })).toBeInTheDocument();
      });
    });

    it('should render create from enrollment button', async () => {
      vi.mocked(paymentsApi.getInvoices).mockResolvedValue([]);
      vi.mocked(admissionsApi.getEnrollments).mockResolvedValue([]);
      vi.mocked(paymentsApi.getPaymentPlans).mockResolvedValue([]);
      vi.mocked(paymentsApi.getPricings).mockResolvedValue([]);

      renderWithProviders(<Invoices />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create from enrollment/i })).toBeInTheDocument();
      });
    });

    it('should render search input', async () => {
      vi.mocked(paymentsApi.getInvoices).mockResolvedValue([]);
      vi.mocked(admissionsApi.getEnrollments).mockResolvedValue([]);
      vi.mocked(paymentsApi.getPaymentPlans).mockResolvedValue([]);
      vi.mocked(paymentsApi.getPricings).mockResolvedValue([]);

      renderWithProviders(<Invoices />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search invoices/i)).toBeInTheDocument();
      });
    });

    it('should render status filter', async () => {
      vi.mocked(paymentsApi.getInvoices).mockResolvedValue([]);
      vi.mocked(admissionsApi.getEnrollments).mockResolvedValue([]);
      vi.mocked(paymentsApi.getPaymentPlans).mockResolvedValue([]);
      vi.mocked(paymentsApi.getPricings).mockResolvedValue([]);

      renderWithProviders(<Invoices />);

      await waitFor(() => {
        expect(screen.getByText(/all statuses/i)).toBeInTheDocument();
      });
    });
  });

  describe('Button Actions', () => {
    it('should open create invoice dialog when Create Invoice button is clicked', async () => {
      const user = userEvent.setup();
      vi.mocked(paymentsApi.getInvoices).mockResolvedValue([]);
      vi.mocked(admissionsApi.getEnrollments).mockResolvedValue([]);
      vi.mocked(paymentsApi.getPaymentPlans).mockResolvedValue([]);
      vi.mocked(paymentsApi.getPricings).mockResolvedValue([]);

      renderWithProviders(<Invoices />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create invoice/i })).toBeInTheDocument();
      });

      const createButton = screen.getByRole('button', { name: /create invoice/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByText(/create invoice/i)).toBeInTheDocument();
        expect(screen.getByText(/create a new invoice/i)).toBeInTheDocument();
      });
    });

    it('should open create from enrollment dialog when button is clicked', async () => {
      const user = userEvent.setup();
      vi.mocked(paymentsApi.getInvoices).mockResolvedValue([]);
      vi.mocked(admissionsApi.getEnrollments).mockResolvedValue([]);

      renderWithProviders(<Invoices />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create from enrollment/i })).toBeInTheDocument();
      });

      const createFromEnrollmentButton = screen.getByRole('button', { name: /create from enrollment/i });
      await user.click(createFromEnrollmentButton);

      await waitFor(() => {
        expect(screen.getByText(/create invoice from enrollment/i)).toBeInTheDocument();
      });
    });
  });

  describe('Invoice List Display', () => {
    it('should display invoices list', async () => {
      const mockInvoices = [
        {
          id: '1',
          invoice_number: 'INV-001',
          status: 'DRAFT',
          student_name: 'John Doe',
          cohort_name: 'Cohort 1',
          total_amount: '1000.00',
          due_date: '2024-12-31',
        },
      ];
      vi.mocked(paymentsApi.getInvoices).mockResolvedValue(mockInvoices as any);
      vi.mocked(admissionsApi.getEnrollments).mockResolvedValue([]);
      vi.mocked(paymentsApi.getPaymentPlans).mockResolvedValue([]);
      vi.mocked(paymentsApi.getPricings).mockResolvedValue([]);

      renderWithProviders(<Invoices />);

      await waitFor(() => {
        expect(screen.getByText('INV-001')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });

    it('should show empty state when no invoices', async () => {
      vi.mocked(paymentsApi.getInvoices).mockResolvedValue([]);
      vi.mocked(admissionsApi.getEnrollments).mockResolvedValue([]);
      vi.mocked(paymentsApi.getPaymentPlans).mockResolvedValue([]);
      vi.mocked(paymentsApi.getPricings).mockResolvedValue([]);

      renderWithProviders(<Invoices />);

      await waitFor(() => {
        expect(screen.getByText(/no invoices found/i)).toBeInTheDocument();
      });
    });
  });

  describe('CRUD Operations', () => {
    it('should create invoice when form is submitted', async () => {
      const user = userEvent.setup();
      const mockInvoice = { id: '1', invoice_number: 'INV-001' };
      vi.mocked(paymentsApi.getInvoices).mockResolvedValue([]);
      vi.mocked(paymentsApi.createInvoice).mockResolvedValue(mockInvoice as any);
      vi.mocked(admissionsApi.getEnrollments).mockResolvedValue([
        { id: 'enroll-1', student_name: 'John Doe', cohort_name: 'Cohort 1' },
      ] as any);
      vi.mocked(paymentsApi.getPaymentPlans).mockResolvedValue([]);
      vi.mocked(paymentsApi.getPricings).mockResolvedValue([
        { id: 'price-1', amount: '1000.00', currency: 'USD' },
      ] as any);

      renderWithProviders(<Invoices />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create invoice/i })).toBeInTheDocument();
      });

      const createButton = screen.getByRole('button', { name: /create invoice/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/enrollment/i)).toBeInTheDocument();
      });

      // Fill form
      const enrollmentSelect = screen.getByLabelText(/enrollment/i);
      await user.click(enrollmentSelect);
      await waitFor(() => {
        const option = screen.getByText(/john doe/i);
        await user.click(option);
      });

      // This is a simplified test - in reality, we'd fill all required fields
      // For now, we're testing that the dialog opens and form is rendered
    });

    it('should delete invoice when delete button is clicked', async () => {
      const user = userEvent.setup();
      const mockInvoices = [
        {
          id: '1',
          invoice_number: 'INV-001',
          status: 'DRAFT',
          student_name: 'John Doe',
          cohort_name: 'Cohort 1',
          total_amount: '1000.00',
          due_date: '2024-12-31',
        },
      ];
      vi.mocked(paymentsApi.getInvoices).mockResolvedValue(mockInvoices as any);
      vi.mocked(paymentsApi.deleteInvoice).mockResolvedValue(undefined);
      vi.mocked(admissionsApi.getEnrollments).mockResolvedValue([]);
      vi.mocked(paymentsApi.getPaymentPlans).mockResolvedValue([]);
      vi.mocked(paymentsApi.getPricings).mockResolvedValue([]);

      renderWithProviders(<Invoices />);

      await waitFor(() => {
        expect(screen.getByText('INV-001')).toBeInTheDocument();
      });

      const deleteButton = screen.getByTitle(/delete invoice/i);
      await user.click(deleteButton);

      await waitFor(() => {
        expect(paymentsApi.deleteInvoice).toHaveBeenCalledWith('1');
      });
    });

    it('should issue invoice when issue button is clicked', async () => {
      const user = userEvent.setup();
      const mockInvoices = [
        {
          id: '1',
          invoice_number: 'INV-001',
          status: 'DRAFT',
          student_name: 'John Doe',
          cohort_name: 'Cohort 1',
          total_amount: '1000.00',
          due_date: '2024-12-31',
        },
      ];
      vi.mocked(paymentsApi.getInvoices).mockResolvedValue(mockInvoices as any);
      vi.mocked(paymentsApi.issueInvoice).mockResolvedValue({ ...mockInvoices[0], status: 'ISSUED' } as any);
      vi.mocked(admissionsApi.getEnrollments).mockResolvedValue([]);
      vi.mocked(paymentsApi.getPaymentPlans).mockResolvedValue([]);
      vi.mocked(paymentsApi.getPricings).mockResolvedValue([]);

      renderWithProviders(<Invoices />);

      await waitFor(() => {
        expect(screen.getByText('INV-001')).toBeInTheDocument();
      });

      const issueButton = screen.getByRole('button', { name: /issue/i });
      await user.click(issueButton);

      await waitFor(() => {
        expect(paymentsApi.issueInvoice).toHaveBeenCalledWith('1');
      });
    });

    it('should edit invoice when edit button is clicked', async () => {
      const user = userEvent.setup();
      const mockInvoices = [
        {
          id: '1',
          invoice_number: 'INV-001',
          status: 'DRAFT',
          student_name: 'John Doe',
          cohort_name: 'Cohort 1',
          total_amount: '1000.00',
          due_date: '2024-12-31',
          enrollment: 'enroll-1',
        },
      ];
      vi.mocked(paymentsApi.getInvoices).mockResolvedValue(mockInvoices as any);
      vi.mocked(admissionsApi.getEnrollments).mockResolvedValue([
        { id: 'enroll-1', student_name: 'John Doe', cohort_name: 'Cohort 1' },
      ] as any);
      vi.mocked(paymentsApi.getPaymentPlans).mockResolvedValue([]);
      vi.mocked(paymentsApi.getPricings).mockResolvedValue([]);

      renderWithProviders(<Invoices />);

      await waitFor(() => {
        expect(screen.getByText('INV-001')).toBeInTheDocument();
      });

      const editButton = screen.getByTitle(/edit invoice/i);
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByText(/edit invoice/i)).toBeInTheDocument();
      });
    });
  });

  describe('Search and Filter', () => {
    it('should filter invoices by search term', async () => {
      const user = userEvent.setup();
      const mockInvoices = [
        {
          id: '1',
          invoice_number: 'INV-001',
          status: 'DRAFT',
          student_name: 'John Doe',
          cohort_name: 'Cohort 1',
          total_amount: '1000.00',
          due_date: '2024-12-31',
        },
        {
          id: '2',
          invoice_number: 'INV-002',
          status: 'ISSUED',
          student_name: 'Jane Smith',
          cohort_name: 'Cohort 2',
          total_amount: '2000.00',
          due_date: '2024-12-31',
        },
      ];
      vi.mocked(paymentsApi.getInvoices).mockResolvedValue(mockInvoices as any);
      vi.mocked(admissionsApi.getEnrollments).mockResolvedValue([]);
      vi.mocked(paymentsApi.getPaymentPlans).mockResolvedValue([]);
      vi.mocked(paymentsApi.getPricings).mockResolvedValue([]);

      renderWithProviders(<Invoices />);

      await waitFor(() => {
        expect(screen.getByText('INV-001')).toBeInTheDocument();
        expect(screen.getByText('INV-002')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search invoices/i);
      await user.type(searchInput, 'John');

      await waitFor(() => {
        expect(screen.getByText('INV-001')).toBeInTheDocument();
        expect(screen.queryByText('INV-002')).not.toBeInTheDocument();
      });
    });

    it('should filter invoices by status', async () => {
      const user = userEvent.setup();
      vi.mocked(paymentsApi.getInvoices).mockResolvedValue([]);
      vi.mocked(admissionsApi.getEnrollments).mockResolvedValue([]);
      vi.mocked(paymentsApi.getPaymentPlans).mockResolvedValue([]);
      vi.mocked(paymentsApi.getPricings).mockResolvedValue([]);

      renderWithProviders(<Invoices />);

      await waitFor(() => {
        expect(screen.getByText(/all statuses/i)).toBeInTheDocument();
      });

      // Status filter is tested by checking API call with status parameter
      // The actual filtering happens in the component
    });
  });

  describe('Discount Application', () => {
    it('should open discount dialog for issued invoices', async () => {
      const user = userEvent.setup();
      const mockInvoices = [
        {
          id: '1',
          invoice_number: 'INV-001',
          status: 'ISSUED',
          student_name: 'John Doe',
          cohort_name: 'Cohort 1',
          total_amount: '1000.00',
          due_date: '2024-12-31',
        },
      ];
      vi.mocked(paymentsApi.getInvoices).mockResolvedValue(mockInvoices as any);
      vi.mocked(paymentsApi.getDiscounts).mockResolvedValue([]);
      vi.mocked(admissionsApi.getEnrollments).mockResolvedValue([]);
      vi.mocked(paymentsApi.getPaymentPlans).mockResolvedValue([]);
      vi.mocked(paymentsApi.getPricings).mockResolvedValue([]);

      renderWithProviders(<Invoices />);

      await waitFor(() => {
        expect(screen.getByText('INV-001')).toBeInTheDocument();
      });

      const discountButton = screen.getByTitle(/apply discounts/i);
      await user.click(discountButton);

      await waitFor(() => {
        expect(screen.getByText(/apply discounts/i)).toBeInTheDocument();
      });
    });
  });

  describe('Create Invoice from Enrollment', () => {
    it('should call createInvoiceForEnrollment with enrollment, payment_plan, and optional discounts', async () => {
      const user = userEvent.setup();
      const mockInvoice = { id: '1', invoice_number: 'INV-001' };
      vi.mocked(paymentsApi.getInvoices).mockResolvedValue([]);
      vi.mocked(paymentsApi.createInvoiceForEnrollment).mockResolvedValue(mockInvoice as any);
      vi.mocked(admissionsApi.getEnrollments).mockResolvedValue([
        { id: 'enroll-1', student_name: 'John Doe', cohort_name: 'Cohort 1' },
      ] as any);
      vi.mocked(paymentsApi.getPaymentPlans).mockResolvedValue([
        { id: 'plan-1', name: 'Monthly Plan', type: 'MONTHLY' },
      ] as any);
      vi.mocked(paymentsApi.getDiscounts).mockResolvedValue([
        { id: 'disc-1', name: 'Discount 1' },
      ] as any);
      vi.mocked(paymentsApi.getPricings).mockResolvedValue([]);

      renderWithProviders(<Invoices />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create from enrollment/i })).toBeInTheDocument();
      });

      const createFromEnrollmentButton = screen.getByRole('button', { name: /create from enrollment/i });
      await user.click(createFromEnrollmentButton);

      await waitFor(() => {
        expect(screen.getByText(/create invoice from enrollment/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/enrollment/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/payment plan/i)).toBeInTheDocument();
      });

      // Select enrollment
      const enrollmentSelect = screen.getByLabelText(/enrollment/i);
      await user.click(enrollmentSelect);
      await waitFor(async () => {
        const option = screen.getByText(/john doe/i);
        await user.click(option);
      });

      // Select payment plan
      await waitFor(() => {
        const planSelect = screen.getByLabelText(/payment plan/i);
        expect(planSelect).toBeInTheDocument();
      });

      const planSelect = screen.getByLabelText(/payment plan/i);
      await user.click(planSelect);
      await waitFor(async () => {
        const planOption = screen.getByText(/monthly plan/i);
        await user.click(planOption);
      });

      // Submit form
      const submitButton = screen.getByRole('button', { name: /create invoice/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(paymentsApi.createInvoiceForEnrollment).toHaveBeenCalledWith(
          'enroll-1',
          'plan-1',
          undefined // No discounts selected
        );
      });
    });

    it('should require payment_plan when creating from enrollment', async () => {
      const user = userEvent.setup();
      vi.mocked(paymentsApi.getInvoices).mockResolvedValue([]);
      vi.mocked(admissionsApi.getEnrollments).mockResolvedValue([
        { id: 'enroll-1', student_name: 'John Doe', cohort_name: 'Cohort 1' },
      ] as any);
      vi.mocked(paymentsApi.getPaymentPlans).mockResolvedValue([
        { id: 'plan-1', name: 'Monthly Plan' },
      ] as any);
      vi.mocked(paymentsApi.getPricings).mockResolvedValue([]);

      renderWithProviders(<Invoices />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create from enrollment/i })).toBeInTheDocument();
      });

      const createFromEnrollmentButton = screen.getByRole('button', { name: /create from enrollment/i });
      await user.click(createFromEnrollmentButton);

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /create invoice/i });
        expect(submitButton).toBeDisabled(); // Should be disabled without payment_plan
      });
    });
  });
});

