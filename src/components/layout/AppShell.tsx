import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { BottomNav } from '@/components/mobile/BottomNav';
import { KeyboardShortcuts } from '@/components/keyboard/KeyboardShortcuts';
import { SkipToContent } from '@/components/accessibility/SkipToContent';
import { useAuthStore } from '@/store/authStore';
import './Layout.css'
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export function AppShell() {

  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className={`layout ${open ? "menu-open" : ""}`}>
      <SkipToContent />
      <Sidebar />

      {open && (
        <div
          className='sidebar_overlay'
          onClick={() => setOpen(false)}
        >
        </div>
      )}

      <div className="layout-main">
        <Topbar onMenuClick={() => setOpen(!open)} />
        <main id="main-content" className="layout-content pb-16 md:pb-6" tabIndex={-1}>
          <div className="container mx-auto px-4 py-6">
            <Breadcrumbs />
            <Outlet />
          </div>
        </main>
      </div>
      <BottomNav />
      <KeyboardShortcuts />
    </div>
  )
}
