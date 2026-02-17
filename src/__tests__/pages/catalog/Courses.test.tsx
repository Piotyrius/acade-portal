import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Courses from '@/pages/catalog/Courses';
import { renderWithProviders } from '../../utils/testHelpers';
import * as catalogApi from '@/api/endpoints/catalog';

vi.mock('@/api/endpoints/catalog', () => ({
  getCourses: vi.fn(),
  createCourse: vi.fn(),
  updateCourse: vi.fn(),
  deleteCourse: vi.fn(),
  getPrograms: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

global.confirm = vi.fn(() => true);

describe('Courses Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render courses page', async () => {
      vi.mocked(catalogApi.getCourses).mockResolvedValue([]);
      vi.mocked(catalogApi.getPrograms).mockResolvedValue([]);
      renderWithProviders(<Courses />);
      expect(screen.getByText(/courses/i)).toBeInTheDocument();
    });

    it('should render create button', async () => {
      vi.mocked(catalogApi.getCourses).mockResolvedValue([]);
      vi.mocked(catalogApi.getPrograms).mockResolvedValue([]);
      renderWithProviders(<Courses />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
      });
    });
  });

  describe('CRUD Operations', () => {
    it('should open create dialog', async () => {
      const user = userEvent.setup();
      vi.mocked(catalogApi.getCourses).mockResolvedValue([]);
      vi.mocked(catalogApi.getPrograms).mockResolvedValue([]);
      renderWithProviders(<Courses />);
      await waitFor(() => {
        const createBtn = screen.getByRole('button', { name: /create/i });
        user.click(createBtn);
      });
      await waitFor(() => {
        expect(screen.getByText(/create course/i)).toBeInTheDocument();
      });
    });

    it('should display courses list', async () => {
      const mockCourses = [
        { id: '1', title: 'Network Security', code: 'NS-101', program: '1' },
        { id: '2', title: 'Ethical Hacking', code: 'EH-201', program: '1' },
      ];
      vi.mocked(catalogApi.getCourses).mockResolvedValue(mockCourses as any);
      vi.mocked(catalogApi.getPrograms).mockResolvedValue([]);
      renderWithProviders(<Courses />);
      await waitFor(() => {
        expect(screen.getByText('Network Security')).toBeInTheDocument();
        expect(screen.getByText('Ethical Hacking')).toBeInTheDocument();
      });
    });

    it('should delete course', async () => {
      const user = userEvent.setup();
      const mockCourses = [{ id: '1', title: 'Test Course', code: 'TC-001', program: '1' }];
      vi.mocked(catalogApi.getCourses).mockResolvedValue(mockCourses as any);
      vi.mocked(catalogApi.getPrograms).mockResolvedValue([]);
      vi.mocked(catalogApi.deleteCourse).mockResolvedValue(undefined);
      renderWithProviders(<Courses />);
      await waitFor(() => {
        expect(screen.getByText('Test Course')).toBeInTheDocument();
      });
      const deleteBtn = screen.getByTitle(/delete/i);
      await user.click(deleteBtn);
      await waitFor(() => {
        expect(catalogApi.deleteCourse).toHaveBeenCalledWith('1');
      });
    });
  });
});

