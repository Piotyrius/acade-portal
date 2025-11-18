import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useAuthStore } from '@/store/authStore';
import './Layout.css'
import { useState } from 'react';

export function AppShell() {

  const [open, setOpen] = useState(false)

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

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
  )
}
