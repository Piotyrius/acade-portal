import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VerifyCertificate from '@/pages/public/VerifyCertificate';
import { renderWithProviders } from '../../utils/testHelpers';
import * as certificatesApi from '@/api/endpoints/certificates';

vi.mock('@/api/endpoints/certificates', () => ({
  verifyCertificate: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

describe('VerifyCertificate Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render verify certificate page', () => {
      renderWithProviders(<VerifyCertificate />);
      expect(screen.getByText(/verify certificate/i)).toBeInTheDocument();
    });

    it('should render verification form', () => {
      renderWithProviders(<VerifyCertificate />);
      expect(screen.getByPlaceholderText(/enter certificate/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /verify/i })).toBeInTheDocument();
    });
  });

  describe('Verification', () => {
    it('should verify certificate when form is submitted', async () => {
      const user = userEvent.setup();
      const mockResult = { valid: true, certificate: { serial: 'CERT-001', student_name: 'John Doe' } };
      vi.mocked(certificatesApi.verifyCertificate).mockResolvedValue(mockResult as any);
      renderWithProviders(<VerifyCertificate />);
      const input = screen.getByPlaceholderText(/enter certificate/i);
      const verifyBtn = screen.getByRole('button', { name: /verify/i });
      await user.type(input, 'CERT-001');
      await user.click(verifyBtn);
      await waitFor(() => {
        expect(certificatesApi.verifyCertificate).toHaveBeenCalledWith('CERT-001');
      });
    });
  });
});

