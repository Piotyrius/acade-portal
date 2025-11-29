import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Recruiting from '@/pages/admissions/Recruiting';
import { renderWithProviders } from '../../utils/testHelpers';

describe('Recruiting Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render recruiting page', () => {
      renderWithProviders(<Recruiting />);
      expect(screen.getByText(/recruiting/i)).toBeInTheDocument();
    });
  });
});

