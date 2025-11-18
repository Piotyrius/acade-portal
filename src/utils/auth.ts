import { useAuthStore } from '@/store/authStore';
import { fetchMe } from '@/api/endpoints/auth';
import api from '@/api/client';

/**
 * Validates the stored authentication token by fetching user data
 * If token is invalid, clears auth state
 * Handles token refresh automatically if token is expired
 */
export async function validateAuth(): Promise<boolean> {
  const { accessToken, user, refreshToken, setAuth, clearAuth } = useAuthStore.getState();

  // No token means not authenticated
  if (!accessToken || !user) {
    if (accessToken || user) {
      // Partial state - clear it
      clearAuth();
    }
    return false;
  }

  try {
    // Try to fetch current user to validate token
    // The API client will automatically handle token refresh if needed
    const currentUser = await fetchMe();
    
    // Get the latest tokens (might have been refreshed by the interceptor)
    const latestState = useAuthStore.getState();
    
    // Update user data in case it changed
    setAuth(
      {
        id: currentUser.id,
        email: currentUser.email,
        firstName: currentUser.first_name,
        lastName: currentUser.last_name,
        role: currentUser.role,
      },
      latestState.accessToken || accessToken,
      latestState.refreshToken || refreshToken || ''
    );
    
    return true;
  } catch (error: any) {
    // Handle different error types
    if (error.response) {
      // Server responded with an error
      const status = error.response.status;
      
      if (status === 401) {
        // Unauthorized - token is invalid or expired
        // The API client should have tried to refresh, but if it failed, clear auth
        clearAuth();
        return false;
      } else if (status === 403) {
        // Forbidden - user doesn't have permission (shouldn't happen for /me endpoint)
        // But we just fixed this, so this might be a different issue
        console.warn('403 Forbidden on /me endpoint - this should not happen');
        clearAuth();
        return false;
      } else if (status >= 500) {
        // Server error - don't clear auth, might be temporary
        console.error('Server error during auth validation:', status);
        return false; // Return false but don't clear auth
      } else {
        // Other 4xx errors - might be temporary, don't clear auth
        console.warn('Unexpected error during auth validation:', status);
        return false;
      }
    } else if (error.request) {
      // Network error - request was made but no response received
      // Don't clear auth on network errors - might be temporary
      console.warn('Network error during auth validation - not clearing auth');
      return false; // Return false but don't clear auth
    } else {
      // Request setup error - probably a code issue
      console.error('Error setting up auth validation request:', error.message);
      return false;
    }
  }
}

/**
 * Initialize auth validation on app load
 */
export function initAuth() {
  // Validate auth on app initialization
  validateAuth().catch(() => {
    // Silently fail - auth will be cleared if invalid
  });
}

