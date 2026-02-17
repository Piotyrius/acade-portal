import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Profile from '@/pages/Profile';
import { renderWithProviders, setupAuthStore, clearAuthStore, mockAdminUser } from '../utils/testHelpers';
import * as authApi from '@/api/endpoints/auth';

vi.mock('@/api/endpoints/auth', () => ({
  fetchMe: vi.fn(),
  updateProfile: vi.fn(),
  setupMfa: vi.fn(),
  verifyMfa: vi.fn(),
  disableMfa: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

describe('Profile Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearAuthStore();
    setupAuthStore(mockAdminUser);
  });

  describe('Rendering', () => {
    it('should render profile page', async () => {
      renderWithProviders(<Profile />);
      expect(screen.getByText(/profile/i)).toBeInTheDocument();
    });

    it('should display user information', async () => {
      renderWithProviders(<Profile />);
      await waitFor(() => {
        expect(screen.getByText(mockAdminUser.email)).toBeInTheDocument();
      });
    });
  });

  describe('Profile Update', () => {
    it('should open edit mode when edit button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Profile />);
      await waitFor(() => {
        const editBtn = screen.getByRole('button', { name: /edit/i });
        user.click(editBtn);
      });
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      });
    });

    it('should update profile when form is submitted', async () => {
      const user = userEvent.setup();
      vi.mocked(authApi.updateProfile).mockResolvedValue({
        id: '1',
        email: 'admin@example.com',
        first_name: 'Updated',
        last_name: 'Name',
        role: 'ADMIN',
      } as any);
      renderWithProviders(<Profile />);
      await waitFor(() => {
        const editBtn = screen.getByRole('button', { name: /edit/i });
        user.click(editBtn);
      });
      await waitFor(() => {
        const firstNameInput = screen.getByLabelText(/first name/i);
        user.clear(firstNameInput);
        user.type(firstNameInput, 'Updated');
        const saveBtn = screen.getByRole('button', { name: /save/i });
        user.click(saveBtn);
      });
      await waitFor(() => {
        expect(authApi.updateProfile).toHaveBeenCalled();
      });
    });
  });

  describe('MFA Operations', () => {
    it('should show enable MFA button when MFA is disabled', async () => {
      renderWithProviders(<Profile />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /enable mfa/i })).toBeInTheDocument();
      });
    });

    it('should open MFA setup dialog when enable button is clicked', async () => {
      const user = userEvent.setup();
      vi.mocked(authApi.setupMfa).mockResolvedValue({
        id: '1',
        email: 'admin@example.com',
        mfa_secret: 'TEST_SECRET',
        qr_code_uri: 'otpauth://totp/Test:admin@example.com?secret=TEST_SECRET',
      } as any);
      renderWithProviders(<Profile />);
      await waitFor(() => {
        const enableBtn = screen.getByRole('button', { name: /enable mfa/i });
        user.click(enableBtn);
      });
      await waitFor(() => {
        expect(authApi.setupMfa).toHaveBeenCalled();
      });
    });

    it('should show disable MFA button when MFA is enabled', async () => {
      setupAuthStore({ ...mockAdminUser, mfa_enabled: true });
      renderWithProviders(<Profile />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /disable mfa/i })).toBeInTheDocument();
      });
    });
  });
});

