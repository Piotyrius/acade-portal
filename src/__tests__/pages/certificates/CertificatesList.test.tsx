import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CertificatesList from '@/pages/certificates/CertificatesList';
import { renderWithProviders } from '../../utils/testHelpers';
import * as certificatesApi from '@/api/endpoints/certificates';
import * as catalogApi from '@/api/endpoints/catalog';
import * as authApi from '@/api/endpoints/auth';

vi.mock('@/api/endpoints/certificates', () => ({
  getCertificates: vi.fn(),
  issueCertificate: vi.fn(),
  revokeCertificate: vi.fn(),
  checkEligibility: vi.fn(),
  verifyCertificate: vi.fn(),
}));

vi.mock('@/api/endpoints/catalog', () => ({
  getCohorts: vi.fn(),
}));

vi.mock('@/api/endpoints/auth', () => ({
  getUsers: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

global.confirm = vi.fn(() => true);

describe('CertificatesList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render certificates page', async () => {
      vi.mocked(certificatesApi.getCertificates).mockResolvedValue([]);
      vi.mocked(catalogApi.getCohorts).mockResolvedValue([]);
      renderWithProviders(<CertificatesList />);
      expect(screen.getByText(/certificates/i)).toBeInTheDocument();
    });

    it('should render issue certificate button', async () => {
      vi.mocked(certificatesApi.getCertificates).mockResolvedValue([]);
      vi.mocked(catalogApi.getCohorts).mockResolvedValue([]);
      renderWithProviders(<CertificatesList />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /issue/i })).toBeInTheDocument();
      });
    });
  });

  describe('Operations', () => {
    it('should display certificates list', async () => {
      const mockCertificates = [
        { id: '1', student: 'student-1', serial: 'CERT-001', status: 'ISSUED', issued_at: '2024-03-15T00:00:00Z' },
        { id: '2', student: 'student-2', serial: 'CERT-002', status: 'REVOKED', issued_at: '2024-03-15T00:00:00Z' },
      ];
      vi.mocked(certificatesApi.getCertificates).mockResolvedValue(mockCertificates as any);
      vi.mocked(catalogApi.getCohorts).mockResolvedValue([]);
      renderWithProviders(<CertificatesList />);
      await waitFor(() => {
        expect(screen.getByText('CERT-001')).toBeInTheDocument();
      });
    });

    it('should open issue certificate dialog', async () => {
      const user = userEvent.setup();
      vi.mocked(certificatesApi.getCertificates).mockResolvedValue([]);
      vi.mocked(catalogApi.getCohorts).mockResolvedValue([]);
      renderWithProviders(<CertificatesList />);
      await waitFor(() => {
        const issueBtn = screen.getByRole('button', { name: /issue/i });
        user.click(issueBtn);
      });
      await waitFor(() => {
        expect(screen.getByText(/issue certificate/i)).toBeInTheDocument();
      });
    });

    it('should revoke certificate', async () => {
      const user = userEvent.setup();
      const mockCertificates = [{ id: '1', student: 'student-1', serial: 'CERT-001', status: 'ISSUED', issued_at: '2024-03-15T00:00:00Z' }];
      vi.mocked(certificatesApi.getCertificates).mockResolvedValue(mockCertificates as any);
      vi.mocked(catalogApi.getCohorts).mockResolvedValue([]);
      vi.mocked(certificatesApi.revokeCertificate).mockResolvedValue({} as any);
      renderWithProviders(<CertificatesList />);
      await waitFor(() => {
        expect(screen.getByText('CERT-001')).toBeInTheDocument();
      });
      const revokeBtn = screen.getByTitle(/revoke/i);
      await user.click(revokeBtn);
      await waitFor(() => {
        expect(certificatesApi.revokeCertificate).toHaveBeenCalled();
      });
    });
  });
});

