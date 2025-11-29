import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Assessments from '@/pages/assessment/Assessments';
import { renderWithProviders } from '../../utils/testHelpers';
import * as assessmentApi from '@/api/endpoints/assessment';
import * as catalogApi from '@/api/endpoints/catalog';

vi.mock('@/api/endpoints/assessment', () => ({
  getAssessments: vi.fn(),
  createAssessment: vi.fn(),
  updateAssessment: vi.fn(),
  deleteAssessment: vi.fn(),
}));

vi.mock('@/api/endpoints/catalog', () => ({
  getCohorts: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

global.confirm = vi.fn(() => true);

describe('Assessments Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render assessments page', async () => {
      vi.mocked(assessmentApi.getAssessments).mockResolvedValue([]);
      vi.mocked(catalogApi.getCohorts).mockResolvedValue([]);
      renderWithProviders(<Assessments />);
      expect(screen.getByText(/assessments/i)).toBeInTheDocument();
    });

    it('should render create button', async () => {
      vi.mocked(assessmentApi.getAssessments).mockResolvedValue([]);
      vi.mocked(catalogApi.getCohorts).mockResolvedValue([]);
      renderWithProviders(<Assessments />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
      });
    });
  });

  describe('CRUD Operations', () => {
    it('should open create dialog', async () => {
      const user = userEvent.setup();
      vi.mocked(assessmentApi.getAssessments).mockResolvedValue([]);
      vi.mocked(catalogApi.getCohorts).mockResolvedValue([]);
      renderWithProviders(<Assessments />);
      await waitFor(() => {
        const createBtn = screen.getByRole('button', { name: /create/i });
        user.click(createBtn);
      });
      await waitFor(() => {
        expect(screen.getByText(/create assessment/i)).toBeInTheDocument();
      });
    });

    it('should display assessments list', async () => {
      const mockAssessments = [
        { id: '1', title: 'Midterm Exam', cohort: '1', type: 'EXAM', max_score: 100 },
        { id: '2', title: 'Lab Assignment', cohort: '1', type: 'ASSIGNMENT', max_score: 50 },
      ];
      vi.mocked(assessmentApi.getAssessments).mockResolvedValue(mockAssessments as any);
      vi.mocked(catalogApi.getCohorts).mockResolvedValue([]);
      renderWithProviders(<Assessments />);
      await waitFor(() => {
        expect(screen.getByText('Midterm Exam')).toBeInTheDocument();
        expect(screen.getByText('Lab Assignment')).toBeInTheDocument();
      });
    });

    it('should delete assessment', async () => {
      const user = userEvent.setup();
      const mockAssessments = [{ id: '1', title: 'Test Assessment', cohort: '1', type: 'QUIZ', max_score: 30 }];
      vi.mocked(assessmentApi.getAssessments).mockResolvedValue(mockAssessments as any);
      vi.mocked(catalogApi.getCohorts).mockResolvedValue([]);
      vi.mocked(assessmentApi.deleteAssessment).mockResolvedValue(undefined);
      renderWithProviders(<Assessments />);
      await waitFor(() => {
        expect(screen.getByText('Test Assessment')).toBeInTheDocument();
      });
      const deleteBtn = screen.getByTitle(/delete/i);
      await user.click(deleteBtn);
      await waitFor(() => {
        expect(assessmentApi.deleteAssessment).toHaveBeenCalledWith('1');
      });
    });
  });
});

