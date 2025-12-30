import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import {
  LayoutDashboard,
  FileCheck,
  Calendar,
  User,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const mobileNavItems = [
  { nameKey: 'layout.mobileNavDashboard', href: '/dashboard', icon: LayoutDashboard },
  { nameKey: 'layout.mobileNavAssessment', href: '/assessment', icon: FileCheck },
  { nameKey: 'layout.mobileNavSessions', href: '/catalog/sessions', icon: Calendar },
  { nameKey: 'layout.mobileNavProfile', href: '/profile', icon: User },
];

export function BottomNav() {
  const { user } = useAuthStore();
  const { t } = useTranslation('common');

  // Only show on mobile screens
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card md:hidden">
      <div className="flex items-center justify-around h-16">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.nameKey}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center flex-1 h-full transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )
              }
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{t(item.nameKey)}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}




