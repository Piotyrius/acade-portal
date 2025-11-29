import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyWorks from '@/pages/gallery/MyWorks';
import { renderWithProviders } from '../../utils/testHelpers';
import * as galleryApi from '@/api/endpoints/gallery';
import api from '@/api/client';

// Mock all API calls
vi.mock('@/api/endpoints/gallery', () => ({
  getMyWorks: vi.fn(),
  uploadWork: vi.fn(),
  publishWork: vi.fn(),
  unpublishWork: vi.fn(),
  toggleWorkVisibility: vi.fn(),
}));

vi.mock('@/api/client', () => ({
  default: {
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock window.confirm
global.confirm = vi.fn(() => true);

describe('MyWorks Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render My Works page with title', async () => {
      vi.mocked(galleryApi.getMyWorks).mockResolvedValue([]);

      renderWithProviders(<MyWorks />);

      expect(screen.getByText('My Works')).toBeInTheDocument();
      expect(screen.getByText(/upload and manage your project portfolio/i)).toBeInTheDocument();
    });

    it('should render upload form elements', async () => {
      vi.mocked(galleryApi.getMyWorks).mockResolvedValue([]);

      renderWithProviders(<MyWorks />);

      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/file/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /upload/i })).toBeInTheDocument();
    });

    it('should display works list', async () => {
      const mockWorks = [
        {
          id: '1',
          title: 'Project 1',
          status: 'PUBLISHED',
          is_public: true,
          description: 'Description 1',
        },
        {
          id: '2',
          title: 'Project 2',
          status: 'DRAFT',
          is_public: false,
          description: 'Description 2',
        },
      ];
      vi.mocked(galleryApi.getMyWorks).mockResolvedValue(mockWorks as any);

      renderWithProviders(<MyWorks />);

      await waitFor(() => {
        expect(screen.getByText('Project 1')).toBeInTheDocument();
        expect(screen.getByText('Project 2')).toBeInTheDocument();
      });
    });
  });

  describe('Upload Functionality', () => {
    it('should upload work when form is submitted', async () => {
      const user = userEvent.setup();
      const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const mockWork = { id: '1', title: 'New Project', status: 'DRAFT' };
      
      vi.mocked(galleryApi.getMyWorks).mockResolvedValue([]);
      vi.mocked(galleryApi.uploadWork).mockResolvedValue(mockWork as any);

      renderWithProviders(<MyWorks />);

      const titleInput = screen.getByLabelText(/title/i);
      const fileInput = screen.getByLabelText(/file/i) as HTMLInputElement;
      const uploadButton = screen.getByRole('button', { name: /upload/i });

      await user.type(titleInput, 'New Project');
      await user.upload(fileInput, mockFile);
      await user.click(uploadButton);

      await waitFor(() => {
        expect(galleryApi.uploadWork).toHaveBeenCalledWith({
          title: 'New Project',
          file: mockFile,
        });
      });
    });

    it('should disable upload button when title or file is missing', async () => {
      vi.mocked(galleryApi.getMyWorks).mockResolvedValue([]);

      renderWithProviders(<MyWorks />);

      const uploadButton = screen.getByRole('button', { name: /upload/i });
      expect(uploadButton).toBeDisabled();
    });
  });

  describe('Publish/Unpublish Actions', () => {
    it('should show publish button for draft works', async () => {
      const mockWorks = [
        {
          id: '1',
          title: 'Draft Project',
          status: 'DRAFT',
          is_public: false,
        },
      ];
      vi.mocked(galleryApi.getMyWorks).mockResolvedValue(mockWorks as any);

      renderWithProviders(<MyWorks />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /publish/i })).toBeInTheDocument();
      });
    });

    it('should show unpublish button for published works', async () => {
      const mockWorks = [
        {
          id: '1',
          title: 'Published Project',
          status: 'PUBLISHED',
          is_public: true,
        },
      ];
      vi.mocked(galleryApi.getMyWorks).mockResolvedValue(mockWorks as any);

      renderWithProviders(<MyWorks />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /unpublish/i })).toBeInTheDocument();
      });
    });

    it('should publish work when publish button is clicked', async () => {
      const user = userEvent.setup();
      const mockWorks = [
        {
          id: '1',
          title: 'Draft Project',
          status: 'DRAFT',
          is_public: false,
        },
      ];
      vi.mocked(galleryApi.getMyWorks).mockResolvedValue(mockWorks as any);
      vi.mocked(galleryApi.publishWork).mockResolvedValue({ ...mockWorks[0], status: 'PUBLISHED' } as any);

      renderWithProviders(<MyWorks />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /publish/i })).toBeInTheDocument();
      });

      const publishButton = screen.getByRole('button', { name: /publish/i });
      await user.click(publishButton);

      await waitFor(() => {
        expect(galleryApi.publishWork).toHaveBeenCalledWith('1');
      });
    });

    it('should unpublish work when unpublish button is clicked', async () => {
      const user = userEvent.setup();
      const mockWorks = [
        {
          id: '1',
          title: 'Published Project',
          status: 'PUBLISHED',
          is_public: true,
        },
      ];
      vi.mocked(galleryApi.getMyWorks).mockResolvedValue(mockWorks as any);
      vi.mocked(galleryApi.unpublishWork).mockResolvedValue({ ...mockWorks[0], status: 'DRAFT' } as any);

      renderWithProviders(<MyWorks />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /unpublish/i })).toBeInTheDocument();
      });

      const unpublishButton = screen.getByRole('button', { name: /unpublish/i });
      await user.click(unpublishButton);

      await waitFor(() => {
        expect(galleryApi.unpublishWork).toHaveBeenCalledWith('1');
      });
    });
  });

  describe('Visibility Toggle', () => {
    it('should toggle work visibility when switch is clicked', async () => {
      const user = userEvent.setup();
      const mockWorks = [
        {
          id: '1',
          title: 'Project 1',
          status: 'PUBLISHED',
          is_public: false,
        },
      ];
      vi.mocked(galleryApi.getMyWorks).mockResolvedValue(mockWorks as any);
      vi.mocked(galleryApi.toggleWorkVisibility).mockResolvedValue({ ...mockWorks[0], is_public: true } as any);

      renderWithProviders(<MyWorks />);

      await waitFor(() => {
        expect(screen.getByText('Project 1')).toBeInTheDocument();
      });

      const visibilitySwitch = screen.getByRole('switch');
      await user.click(visibilitySwitch);

      await waitFor(() => {
        expect(galleryApi.toggleWorkVisibility).toHaveBeenCalledWith('1', true);
      });
    });

    it('should disable switch during toggle operation', async () => {
      const user = userEvent.setup();
      const mockWorks = [
        {
          id: '1',
          title: 'Project 1',
          status: 'PUBLISHED',
          is_public: false,
        },
      ];
      vi.mocked(galleryApi.getMyWorks).mockResolvedValue(mockWorks as any);
      vi.mocked(galleryApi.toggleWorkVisibility).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      renderWithProviders(<MyWorks />);

      await waitFor(() => {
        const visibilitySwitch = screen.getByRole('switch');
        expect(visibilitySwitch).not.toBeDisabled();
      });

      const visibilitySwitch = screen.getByRole('switch');
      await user.click(visibilitySwitch);

      await waitFor(() => {
        expect(visibilitySwitch).toBeDisabled();
      });
    });
  });

  describe('Edit Functionality', () => {
    it('should open edit dialog when edit button is clicked', async () => {
      const user = userEvent.setup();
      const mockWorks = [
        {
          id: '1',
          title: 'Project 1',
          status: 'PUBLISHED',
          is_public: true,
          description: 'Original description',
        },
      ];
      vi.mocked(galleryApi.getMyWorks).mockResolvedValue(mockWorks as any);

      renderWithProviders(<MyWorks />);

      await waitFor(() => {
        expect(screen.getByText('Project 1')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByTitle(/edit/i);
      const editButton = editButtons.find(btn => btn.closest('button'));
      if (editButton) {
        await user.click(editButton);
      }

      await waitFor(() => {
        expect(screen.getByText(/edit work/i)).toBeInTheDocument();
      });
    });

    it('should update work when edit form is submitted', async () => {
      const user = userEvent.setup();
      const mockWorks = [
        {
          id: '1',
          title: 'Project 1',
          status: 'PUBLISHED',
          is_public: true,
          description: 'Original description',
        },
      ];
      vi.mocked(galleryApi.getMyWorks).mockResolvedValue(mockWorks as any);
      vi.mocked(api.patch).mockResolvedValue({ data: { ...mockWorks[0], title: 'Updated Title' } });

      renderWithProviders(<MyWorks />);

      await waitFor(() => {
        expect(screen.getByText('Project 1')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByTitle(/edit/i);
      const editButton = editButtons.find(btn => btn.closest('button'));
      if (editButton) {
        await user.click(editButton);
      }

      await waitFor(() => {
        expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText(/title/i);
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Title');

      const updateButton = screen.getByRole('button', { name: /update/i });
      await user.click(updateButton);

      await waitFor(() => {
        expect(api.patch).toHaveBeenCalledWith(
          '/api/v1/gallery/works/1/',
          expect.objectContaining({ title: 'Updated Title' })
        );
      });
    });
  });

  describe('Delete Functionality', () => {
    it('should delete work when delete button is clicked', async () => {
      const user = userEvent.setup();
      const mockWorks = [
        {
          id: '1',
          title: 'Project 1',
          status: 'PUBLISHED',
          is_public: true,
        },
      ];
      vi.mocked(galleryApi.getMyWorks).mockResolvedValue(mockWorks as any);
      vi.mocked(api.delete).mockResolvedValue({ data: {} });

      renderWithProviders(<MyWorks />);

      await waitFor(() => {
        expect(screen.getByText('Project 1')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTitle(/delete/i);
      const deleteButton = deleteButtons.find(btn => btn.closest('button'));
      if (deleteButton) {
        await user.click(deleteButton);
      }

      await waitFor(() => {
        expect(api.delete).toHaveBeenCalledWith('/api/v1/gallery/works/1/');
      });
    });
  });

  describe('Status Badges', () => {
    it('should display correct status badge for published works', async () => {
      const mockWorks = [
        {
          id: '1',
          title: 'Published Project',
          status: 'PUBLISHED',
          is_public: true,
        },
      ];
      vi.mocked(galleryApi.getMyWorks).mockResolvedValue(mockWorks as any);

      renderWithProviders(<MyWorks />);

      await waitFor(() => {
        expect(screen.getByText('PUBLISHED')).toBeInTheDocument();
      });
    });

    it('should display correct status badge for draft works', async () => {
      const mockWorks = [
        {
          id: '1',
          title: 'Draft Project',
          status: 'DRAFT',
          is_public: false,
        },
      ];
      vi.mocked(galleryApi.getMyWorks).mockResolvedValue(mockWorks as any);

      renderWithProviders(<MyWorks />);

      await waitFor(() => {
        expect(screen.getByText('DRAFT')).toBeInTheDocument();
      });
    });

    it('should show public badge when work is public', async () => {
      const mockWorks = [
        {
          id: '1',
          title: 'Public Project',
          status: 'PUBLISHED',
          is_public: true,
        },
      ];
      vi.mocked(galleryApi.getMyWorks).mockResolvedValue(mockWorks as any);

      renderWithProviders(<MyWorks />);

      await waitFor(() => {
        expect(screen.getByText('Public')).toBeInTheDocument();
      });
    });
  });
});

