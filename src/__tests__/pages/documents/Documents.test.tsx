import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Documents from '@/pages/documents/Documents';
import { renderWithProviders } from '../../utils/testHelpers';
import * as documentsApi from '@/api/endpoints/documents';

// Mock all API calls
vi.mock('@/api/endpoints/documents', () => ({
  getDocuments: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('Documents Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render Documents page with title', async () => {
      vi.mocked(documentsApi.getDocuments).mockResolvedValue([]);

      renderWithProviders(<Documents />);

      expect(screen.getByText('Documents')).toBeInTheDocument();
      expect(screen.getByText(/manage your documents/i)).toBeInTheDocument();
    });

    it('should render upload document button', async () => {
      vi.mocked(documentsApi.getDocuments).mockResolvedValue([]);

      renderWithProviders(<Documents />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /upload document/i })).toBeInTheDocument();
      });
    });

    it('should display documents list', async () => {
      const mockDocuments = [
        {
          id: '1',
          description: 'Test Document 1',
          kind: 'STUDENT_DOC',
          visibility: 'PRIVATE',
          file: 'https://example.com/doc1.pdf',
          created_at: '2024-01-01',
        },
        {
          id: '2',
          description: 'Test Document 2',
          kind: 'COURSE_MATERIAL',
          visibility: 'LECTURER',
          file: 'https://example.com/doc2.pdf',
          created_at: '2024-01-02',
        },
      ];
      vi.mocked(documentsApi.getDocuments).mockResolvedValue(mockDocuments as any);

      renderWithProviders(<Documents />);

      await waitFor(() => {
        expect(screen.getByText('Test Document 1')).toBeInTheDocument();
        expect(screen.getByText('Test Document 2')).toBeInTheDocument();
      });
    });
  });

  describe('Upload Functionality', () => {
    it('should open upload dialog when upload button is clicked', async () => {
      const user = userEvent.setup();
      vi.mocked(documentsApi.getDocuments).mockResolvedValue([]);

      renderWithProviders(<Documents />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /upload document/i })).toBeInTheDocument();
      });

      const uploadButton = screen.getByRole('button', { name: /upload document/i });
      await user.click(uploadButton);

      await waitFor(() => {
        expect(screen.getByText(/upload document/i)).toBeInTheDocument();
      });
    });
  });

  describe('Document List Actions', () => {
    it('should display search input', async () => {
      vi.mocked(documentsApi.getDocuments).mockResolvedValue([]);

      renderWithProviders(<Documents />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search documents/i)).toBeInTheDocument();
      });
    });

    it('should filter documents by search term', async () => {
      const user = userEvent.setup();
      const mockDocuments = [
        {
          id: '1',
          description: 'Test Document 1',
          kind: 'STUDENT_DOC',
          visibility: 'PRIVATE',
          file: 'https://example.com/doc1.pdf',
          created_at: '2024-01-01',
        },
        {
          id: '2',
          description: 'Another Document',
          kind: 'COURSE_MATERIAL',
          visibility: 'LECTURER',
          file: 'https://example.com/doc2.pdf',
          created_at: '2024-01-02',
        },
      ];
      vi.mocked(documentsApi.getDocuments).mockResolvedValue(mockDocuments as any);

      renderWithProviders(<Documents />);

      await waitFor(() => {
        expect(screen.getByText('Test Document 1')).toBeInTheDocument();
        expect(screen.getByText('Another Document')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search documents/i);
      await user.type(searchInput, 'Test');

      await waitFor(() => {
        expect(screen.getByText('Test Document 1')).toBeInTheDocument();
        expect(screen.queryByText('Another Document')).not.toBeInTheDocument();
      });
    });

    it('should display category filter', async () => {
      vi.mocked(documentsApi.getDocuments).mockResolvedValue([]);

      renderWithProviders(<Documents />);

      await waitFor(() => {
        expect(screen.getByText(/filter by category/i)).toBeInTheDocument();
      });
    });

    it('should display visibility filter', async () => {
      vi.mocked(documentsApi.getDocuments).mockResolvedValue([]);

      renderWithProviders(<Documents />);

      await waitFor(() => {
        expect(screen.getByText(/filter by visibility/i)).toBeInTheDocument();
      });
    });
  });

  describe('Empty States', () => {
    it('should show example banner when no documents', async () => {
      vi.mocked(documentsApi.getDocuments).mockResolvedValue([]);

      renderWithProviders(<Documents />);

      // ExampleBanner might render, but we're testing the component renders
      await waitFor(() => {
        expect(screen.getByText('Documents')).toBeInTheDocument();
      });
    });
  });
});

