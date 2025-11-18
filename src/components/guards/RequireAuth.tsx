import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useEffect, useState } from 'react';
import { validateAuth } from '@/utils/auth';

interface RequireAuthProps {
  children: React.ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const [isValidating, setIsValidating] = useState(true);

  // Validate auth on mount if we have a token
  useEffect(() => {
    if (accessToken && isAuthenticated) {
      validateAuth()
        .then((isValid) => {
          setIsValidating(false);
          if (!isValid) {
            // Auth validation failed - will be redirected to login
          }
        })
        .catch(() => {
          setIsValidating(false);
        });
    } else {
      setIsValidating(false);
    }
  }, [accessToken, isAuthenticated]);

  // Show loading state while validating
  if (isValidating && accessToken) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Validating authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
