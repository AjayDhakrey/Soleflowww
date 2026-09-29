import React from 'react';
import { useAuth } from './AuthProvider';
import { AccessDeniedPage } from '../pages/auth/AccessDeniedPage';
import { UserRole } from '../types';
import { Loader2 } from 'lucide-react';

interface RequireAuthProps {
  children: React.ReactNode;
  onRedirectToLogin: () => void;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ children, onRedirectToLogin }) => {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-sm font-medium text-slate-500">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    onRedirectToLogin();
    return null;
  }

  return <>{children}</>;
};

interface RequireRoleProps {
  role: UserRole;
  children: React.ReactNode;
  onReturnHome: () => void;
}

export const RequireRole: React.FC<RequireRoleProps> = ({ role, children, onReturnHome }) => {
  const { role: userRole, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (userRole !== role) {
    return (
      <AccessDeniedPage
        onReturnHome={onReturnHome}
        requiredRole={role === 'admin' ? 'Trader / Admin' : 'Field Sales Rep'}
      />
    );
  }

  return <>{children}</>;
};
