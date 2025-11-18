import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';

import './Layout.css'

export function AppShell() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const [open, setOpen] = useState(false)

  

  return (
    <div className={`layout ${open ? "menu-open" : ""}`}>
      <Sidebar />
      <div className="layout-main">
        <Topbar onMenuClick={() => setOpen(!open)} />
        <main className="layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
