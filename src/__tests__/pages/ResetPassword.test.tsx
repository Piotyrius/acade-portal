import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import ResetPassword from '@/pages/ResetPassword';
import * as authApi from '@/api/endpoints/auth';

// Mock dependencies
vi.mock('@/api/endpoints/auth', () => ({
  confirmPasswordReset: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderResetPassword = (token?: string) => {
  const searchParams = token ? `?token=${token}` : '';
  return render(
    <MemoryRouter initialEntries={[`/reset-password${searchParams}`]}>
      <ResetPassword />
    </MemoryRouter>
  );
};

describe('ResetPassword Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  describe('Rendering', () => {
    it('should render reset password form with all elements when token is present', () => {
      renderResetPassword('valid-token');

      expect(screen.getByText('Reset Password')).toBeInTheDocument();
      expect(screen.getByText(/enter your new password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
    });

    it('should redirect to forgot password if token is missing', () => {
      renderResetPassword();

      expect(mockNavigate).toHaveBeenCalledWith('/forgot-password');
    });

    it('should show logo', () => {
      renderResetPassword('valid-token');
      const logo = screen.getByAltText('Cyber Academy');
      expect(logo).toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    it('should update password input value when user types', () => {
      renderResetPassword('valid-token');

      const passwordInput = screen.getByLabelText(/new password/i) as HTMLInputElement;
      fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });

      expect(passwordInput.value).toBe('newpassword123');
    });

    it('should update confirm password input value when user types', () => {
      renderResetPassword('valid-token');

      const confirmInput = screen.getByLabelText(/confirm password/i) as HTMLInputElement;
      fireEvent.change(confirmInput, { target: { value: 'newpassword123' } });

      expect(confirmInput.value).toBe('newpassword123');
    });

    it('should require password fields', () => {
      renderResetPassword('valid-token');

      const passwordInput = screen.getByLabelText(/new password/i) as HTMLInputElement;
      const confirmInput = screen.getByLabelText(/confirm password/i) as HTMLInputElement;

      expect(passwordInput.required).toBe(true);
      expect(confirmInput.required).toBe(true);
      expect(passwordInput.minLength).toBe(8);
      expect(confirmInput.minLength).toBe(8);
    });
  });

  describe('Form Validation', () => {
    it('should not submit if passwords do not match', async () => {
      renderResetPassword('valid-token');

      const passwordInput = screen.getByLabelText(/new password/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /reset password/i });

      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmInput, { target: { value: 'different123' } });
      fireEvent.click(submitButton);

      // API should not be called when passwords don't match
      await waitFor(() => {
        expect(authApi.confirmPasswordReset).not.toHaveBeenCalled();
      });
    });

    it('should not submit if password is too short', async () => {
      renderResetPassword('valid-token');

      const passwordInput = screen.getByLabelText(/new password/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /reset password/i });

      fireEvent.change(passwordInput, { target: { value: 'short' } });
      fireEvent.change(confirmInput, { target: { value: 'short' } });
      fireEvent.click(submitButton);

      // API should not be called when password is too short
      await waitFor(() => {
        expect(authApi.confirmPasswordReset).not.toHaveBeenCalled();
      });
    });
  });

  describe('Form Submission', () => {
    it('should call confirmPasswordReset API on form submission', async () => {
      vi.mocked(authApi.confirmPasswordReset).mockResolvedValue(undefined);

      renderResetPassword('valid-token');

      const passwordInput = screen.getByLabelText(/new password/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /reset password/i });

      fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
      fireEvent.change(confirmInput, { target: { value: 'newpassword123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(authApi.confirmPasswordReset).toHaveBeenCalledWith('valid-token', 'newpassword123');
      });
    });

    it('should show loading state during submission', async () => {
      vi.mocked(authApi.confirmPasswordReset).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      renderResetPassword('valid-token');

      const passwordInput = screen.getByLabelText(/new password/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /reset password/i });

      fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
      fireEvent.change(confirmInput, { target: { value: 'newpassword123' } });
      fireEvent.click(submitButton);

      expect(screen.getByText(/resetting/i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    it('should show success message after successful reset', async () => {
      vi.mocked(authApi.confirmPasswordReset).mockResolvedValue(undefined);

      renderResetPassword('valid-token');

      const passwordInput = screen.getByLabelText(/new password/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /reset password/i });

      fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
      fireEvent.change(confirmInput, { target: { value: 'newpassword123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password reset successful/i)).toBeInTheDocument();
        expect(screen.getByText(/you can now login/i)).toBeInTheDocument();
      });
    });

    it('should navigate to login after successful reset', async () => {
      vi.mocked(authApi.confirmPasswordReset).mockResolvedValue(undefined);
      vi.useFakeTimers();

      renderResetPassword('valid-token');

      const passwordInput = screen.getByLabelText(/new password/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /reset password/i });

      fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
      fireEvent.change(confirmInput, { target: { value: 'newpassword123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password reset successful/i)).toBeInTheDocument();
      });

      vi.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });

      vi.useRealTimers();
    });

    it('should handle API errors gracefully', async () => {
      vi.mocked(authApi.confirmPasswordReset).mockRejectedValue({
        response: { data: { error: 'Invalid or expired token' } },
      });

      renderResetPassword('invalid-token');

      const passwordInput = screen.getByLabelText(/new password/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /reset password/i });

      fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
      fireEvent.change(confirmInput, { target: { value: 'newpassword123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(authApi.confirmPasswordReset).toHaveBeenCalled();
      });

      // Form should still be visible after error
      expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should have link to login page', () => {
      renderResetPassword('valid-token');

      const loginLink = screen.getByText(/back to login/i);
      expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
    });

    it('should have go to login link after success', async () => {
      vi.mocked(authApi.confirmPasswordReset).mockResolvedValue(undefined);

      renderResetPassword('valid-token');

      const passwordInput = screen.getByLabelText(/new password/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /reset password/i });

      fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
      fireEvent.change(confirmInput, { target: { value: 'newpassword123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const loginLink = screen.getByRole('link', { name: /go to login/i });
        expect(loginLink).toHaveAttribute('href', '/login');
      });
    });
  });
});

