import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Programs from '@/pages/catalog/Programs';
import { renderWithProviders } from '../../utils/testHelpers';
import * as catalogApi from '@/api/endpoints/catalog';

vi.mock('@/api/endpoints/catalog', () => ({
  getPrograms: vi.fn(),
  createProgram: vi.fn(),
  updateProgram: vi.fn(),
  deleteProgram: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

global.confirm = vi.fn(() => true);

describe('Programs Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render programs page', async () => {
      vi.mocked(catalogApi.getPrograms).mockResolvedValue([]);
      renderWithProviders(<Programs />);
      expect(screen.getByText(/programs/i)).toBeInTheDocument();
    });

    it('should render create button', async () => {
      vi.mocked(catalogApi.getPrograms).mockResolvedValue([]);
      renderWithProviders(<Programs />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
      });
    });
  });

  describe('CRUD Operations', () => {
    it('should open create dialog', async () => {
      const user = userEvent.setup();
      vi.mocked(catalogApi.getPrograms).mockResolvedValue([]);
      renderWithProviders(<Programs />);
      await waitFor(() => {
        const createBtn = screen.getByRole('button', { name: /create/i });
        user.click(createBtn);
      });
      await waitFor(() => {
        expect(screen.getByText(/create program/i)).toBeInTheDocument();
      });
    });

    it('should display programs list', async () => {
      const mockPrograms = [
        { id: '1', name: 'Cybersecurity Fundamentals', code: 'CS-101', active: true },
        { id: '2', name: 'Advanced Penetration Testing', code: 'CS-301', active: true },
      ];
      vi.mocked(catalogApi.getPrograms).mockResolvedValue(mockPrograms as any);
      renderWithProviders(<Programs />);
      await waitFor(() => {
        expect(screen.getByText('Cybersecurity Fundamentals')).toBeInTheDocument();
        expect(screen.getByText('Advanced Penetration Testing')).toBeInTheDocument();
      });
    });

    it('should delete program', async () => {
      const user = userEvent.setup();
      const mockPrograms = [{ id: '1', name: 'Test Program', code: 'TP-001', active: true }];
      vi.mocked(catalogApi.getPrograms).mockResolvedValue(mockPrograms as any);
      vi.mocked(catalogApi.deleteProgram).mockResolvedValue(undefined);
      renderWithProviders(<Programs />);
      await waitFor(() => {
        expect(screen.getByText('Test Program')).toBeInTheDocument();
      });
      const deleteBtn = screen.getByTitle(/delete/i);
      await user.click(deleteBtn);
      await waitFor(() => {
        expect(catalogApi.deleteProgram).toHaveBeenCalledWith('1');
      });
    });
  });

  describe('Search and Filter', () => {
    it('should filter programs by search term', async () => {
      const user = userEvent.setup();
      const mockPrograms = [
        { id: '1', name: 'Cybersecurity Fundamentals', code: 'CS-101', active: true },
        { id: '2', name: 'Web Development', code: 'WD-101', active: true },
      ];
      vi.mocked(catalogApi.getPrograms).mockResolvedValue(mockPrograms as any);
      renderWithProviders(<Programs />);
      await waitFor(() => {
        expect(screen.getByText('Cybersecurity Fundamentals')).toBeInTheDocument();
      });
      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, 'Cybersecurity');
      await waitFor(() => {
        expect(screen.getByText('Cybersecurity Fundamentals')).toBeInTheDocument();
        expect(screen.queryByText('Web Development')).not.toBeInTheDocument();
      });
    });
  });
});

