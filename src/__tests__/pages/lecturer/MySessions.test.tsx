import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MySessions from '@/pages/lecturer/MySessions';
import { renderWithProviders, setupAuthStore, clearAuthStore, mockLecturerUser } from '../../utils/testHelpers';
import * as catalogApi from '@/api/endpoints/catalog';

vi.mock('@/api/endpoints/catalog', () => ({
  getMySessions: vi.fn(),
}));

describe('MySessions Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearAuthStore();
    setupAuthStore(mockLecturerUser);
  });

  describe('Rendering', () => {
    it('should render my sessions page', async () => {
      vi.mocked(catalogApi.getMySessions).mockResolvedValue([]);
      renderWithProviders(<MySessions />);
      expect(screen.getByText(/my sessions/i)).toBeInTheDocument();
    });

    it('should display sessions list', async () => {
      const mockSessions = [
        { id: '1', cohort_name: 'Cohort 1', date: '2024-03-01', start_time: '10:00', end_time: '12:00' },
      ];
      vi.mocked(catalogApi.getMySessions).mockResolvedValue(mockSessions as any);
      renderWithProviders(<MySessions />);
      await waitFor(() => {
        expect(screen.getByText('Cohort 1')).toBeInTheDocument();
      });
    });
  });
});

