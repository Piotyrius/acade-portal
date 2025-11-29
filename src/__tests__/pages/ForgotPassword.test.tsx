import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ForgotPassword from '@/pages/ForgotPassword';
import * as authApi from '@/api/endpoints/auth';

// Mock dependencies
vi.mock('@/api/endpoints/auth', () => ({
  requestPasswordReset: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

const renderForgotPassword = () => {
  return render(
    <BrowserRouter>
      <ForgotPassword />
    </BrowserRouter>
  );
};

describe('ForgotPassword Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render forgot password form with all elements', () => {
      renderForgotPassword();

      expect(screen.getByText('Reset Password')).toBeInTheDocument();
      expect(screen.getByText(/enter your email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
      expect(screen.getByText(/back to login/i)).toBeInTheDocument();
    });

    it('should show logo', () => {
      renderForgotPassword();
      const logo = screen.getByAltText('Cyber Academy');
      expect(logo).toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    it('should update email input value when user types', () => {
      renderForgotPassword();

      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      expect(emailInput.value).toBe('test@example.com');
    });

    it('should require email field', () => {
      renderForgotPassword();

      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      expect(emailInput.required).toBe(true);
    });
  });

  describe('Form Submission', () => {
    it('should call requestPasswordReset API on form submission', async () => {
      vi.mocked(authApi.requestPasswordReset).mockResolvedValue(undefined);

      renderForgotPassword();

      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(authApi.requestPasswordReset).toHaveBeenCalledWith('test@example.com');
      });
    });

    it('should show loading state during submission', async () => {
      vi.mocked(authApi.requestPasswordReset).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      renderForgotPassword();

      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      expect(screen.getByText(/sending link/i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    it('should show success message after successful submission', async () => {
      vi.mocked(authApi.requestPasswordReset).mockResolvedValue(undefined);

      renderForgotPassword();

      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/check your email/i)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /return to login/i })).toBeInTheDocument();
      });
    });

    it('should handle API errors gracefully', async () => {
      vi.mocked(authApi.requestPasswordReset).mockRejectedValue({
        response: { data: { detail: 'Email not found' } },
      });

      renderForgotPassword();

      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(authApi.requestPasswordReset).toHaveBeenCalled();
      });

      // Form should still be visible after error
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should have link to login page', () => {
      renderForgotPassword();

      const loginLink = screen.getByText(/back to login/i);
      expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
    });

    it('should have return to login link after submission', async () => {
      vi.mocked(authApi.requestPasswordReset).mockResolvedValue(undefined);

      renderForgotPassword();

      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const returnLink = screen.getByRole('link', { name: /return to login/i });
        expect(returnLink).toHaveAttribute('href', '/login');
      });
    });
  });
});

