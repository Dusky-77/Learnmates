import { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { DashboardShell } from '../layouts/DashboardShell';

interface ConditionalDashboardLayoutProps {
  children: ReactNode;
}

export function ConditionalDashboardLayout({ children }: ConditionalDashboardLayoutProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full animate-pulse mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <DashboardShell>{children}</DashboardShell>;
  }

  return <>{children}</>;
}