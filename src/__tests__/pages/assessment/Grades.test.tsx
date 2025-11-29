import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Grades from '@/pages/assessment/Grades';
import { renderWithProviders } from '../../utils/testHelpers';
import * as assessmentApi from '@/api/endpoints/assessment';

vi.mock('@/api/endpoints/assessment', () => ({
  getGrades: vi.fn(),
  createGrade: vi.fn(),
  updateGrade: vi.fn(),
  getSubmissions: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

describe('Grades Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render grades page', async () => {
      vi.mocked(assessmentApi.getGrades).mockResolvedValue([]);
      vi.mocked(assessmentApi.getSubmissions).mockResolvedValue([]);
      renderWithProviders(<Grades />);
      expect(screen.getByText(/grades/i)).toBeInTheDocument();
    });
  });

  describe('Operations', () => {
    it('should display grades list', async () => {
      const mockGrades = [
        { id: '1', submission: '1', score: 85, feedback: 'Good work' },
        { id: '2', submission: '2', score: 92, feedback: 'Excellent' },
      ];
      vi.mocked(assessmentApi.getGrades).mockResolvedValue(mockGrades as any);
      vi.mocked(assessmentApi.getSubmissions).mockResolvedValue([]);
      renderWithProviders(<Grades />);
      await waitFor(() => {
        expect(screen.getByText('85')).toBeInTheDocument();
      });
    });
  });
});

