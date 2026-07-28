import React from 'react';
import { Outlet } from 'react-router-dom';
import { DashboardLayout } from './DashboardLayout';

export function DashboardShell({ children }: { children?: React.ReactNode }) {
  return (
    <DashboardLayout>
      {children ?? <Outlet />}
    </DashboardLayout>
  );
}
