import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Submissions from '@/pages/assessment/Submissions';
import { renderWithProviders } from '../../utils/testHelpers';
import * as assessmentApi from '@/api/endpoints/assessment';

vi.mock('@/api/endpoints/assessment', () => ({
  getSubmissions: vi.fn(),
  createSubmission: vi.fn(),
  updateSubmission: vi.fn(),
  getAssessments: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

describe('Submissions Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render submissions page', async () => {
      vi.mocked(assessmentApi.getSubmissions).mockResolvedValue([]);
      vi.mocked(assessmentApi.getAssessments).mockResolvedValue([]);
      renderWithProviders(<Submissions />);
      expect(screen.getByText(/submissions/i)).toBeInTheDocument();
    });

    it('should render create submission button', async () => {
      vi.mocked(assessmentApi.getSubmissions).mockResolvedValue([]);
      vi.mocked(assessmentApi.getAssessments).mockResolvedValue([]);
      renderWithProviders(<Submissions />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create submission/i })).toBeInTheDocument();
      });
    });
  });

  describe('Operations', () => {
    it('should display submissions list', async () => {
      const mockSubmissions = [
        { id: '1', assessment: '1', status: 'SUBMITTED', score: null },
        { id: '2', assessment: '1', status: 'GRADED', score: 85 },
      ];
      vi.mocked(assessmentApi.getSubmissions).mockResolvedValue(mockSubmissions as any);
      vi.mocked(assessmentApi.getAssessments).mockResolvedValue([]);
      renderWithProviders(<Submissions />);
      await waitFor(() => {
        expect(screen.getByText(/submitted/i)).toBeInTheDocument();
      });
    });

    it('should open create submission dialog', async () => {
      const user = userEvent.setup();
      vi.mocked(assessmentApi.getSubmissions).mockResolvedValue([]);
      vi.mocked(assessmentApi.getAssessments).mockResolvedValue([{ id: '1', title: 'Test Assessment' }] as any);
      renderWithProviders(<Submissions />);
      await waitFor(() => {
        const createBtn = screen.getByRole('button', { name: /create submission/i });
        user.click(createBtn);
      });
      await waitFor(() => {
        expect(screen.getByText(/create submission/i)).toBeInTheDocument();
      });
    });
  });
});

