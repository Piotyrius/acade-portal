import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'ADMIN' | 'LECTURER' | 'STUDENT';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setAuth: (user, accessToken, refreshToken) =>
        set({ 
          user, 
          accessToken, 
          refreshToken, 
          isAuthenticated: !!(user && accessToken) 
        }),
      clearAuth: () =>
        set({ 
          user: null, 
          accessToken: null, 
          refreshToken: null, 
          isAuthenticated: false 
        }),
    }),
    {
      name: 'auth-storage',
      // Rehydrate and validate on load
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Recalculate isAuthenticated based on actual data
          state.isAuthenticated = !!(state.user && state.accessToken);
          
          // If we have stale/invalid data, clear it
          if (!state.user || !state.accessToken) {
            state.user = null;
            state.accessToken = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
          }
        }
      },
    }
  )
);
