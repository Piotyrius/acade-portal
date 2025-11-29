import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

// Create a test query client
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

// Custom render function with providers
export const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const queryClient = createTestQueryClient();

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{children}</BrowserRouter>
      </QueryClientProvider>
    );
  };

  return render(ui, { wrapper: Wrapper, ...options });
};

// Mock user for testing
export const mockAdminUser = {
  id: 'admin-123',
  email: 'admin@example.com',
  firstName: 'Admin',
  lastName: 'User',
  role: 'ADMIN' as const,
};

export const mockLecturerUser = {
  id: 'lecturer-123',
  email: 'lecturer@example.com',
  firstName: 'Lecturer',
  lastName: 'User',
  role: 'LECTURER' as const,
};

export const mockStudentUser = {
  id: 'student-123',
  email: 'student@example.com',
  firstName: 'Student',
  lastName: 'User',
  role: 'STUDENT' as const,
};

// Setup auth store for tests
export const setupAuthStore = (user: typeof mockAdminUser) => {
  useAuthStore.getState().setAuth(user, 'access-token', 'refresh-token');
};

// Clear auth store
export const clearAuthStore = () => {
  useAuthStore.getState().clearAuth();
};

