import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LecturerDashboard from '@/pages/lecturer/LecturerDashboard';
import { renderWithProviders, setupAuthStore, clearAuthStore, mockLecturerUser } from '../../utils/testHelpers';

describe('LecturerDashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearAuthStore();
    setupAuthStore(mockLecturerUser);
  });

  describe('Rendering', () => {
    it('should render lecturer dashboard', () => {
      renderWithProviders(<LecturerDashboard />);
      expect(screen.getByText(/lecturer dashboard/i)).toBeInTheDocument();
    });
  });
});

