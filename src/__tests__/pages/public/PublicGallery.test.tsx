import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PublicGallery from '@/pages/public/PublicGallery';
import { renderWithProviders } from '../../utils/testHelpers';
import * as galleryApi from '@/api/endpoints/gallery';

vi.mock('@/api/endpoints/gallery', () => ({
  getPublicWorks: vi.fn(),
}));

describe('PublicGallery Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render public gallery page', async () => {
      vi.mocked(galleryApi.getPublicWorks).mockResolvedValue([]);
      renderWithProviders(<PublicGallery />);
      expect(screen.getByText(/gallery/i)).toBeInTheDocument();
    });

    it('should display public works', async () => {
      const mockWorks = [
        { id: '1', title: 'Public Work 1', is_public: true, status: 'PUBLISHED' },
        { id: '2', title: 'Public Work 2', is_public: true, status: 'PUBLISHED' },
      ];
      vi.mocked(galleryApi.getPublicWorks).mockResolvedValue(mockWorks as any);
      renderWithProviders(<PublicGallery />);
      await waitFor(() => {
        expect(screen.getByText('Public Work 1')).toBeInTheDocument();
        expect(screen.getByText('Public Work 2')).toBeInTheDocument();
      });
    });
  });
});

