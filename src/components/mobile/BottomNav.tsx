import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import {
  LayoutDashboard,
  FileCheck,
  Calendar,
  User,
} from 'lucide-react';

const mobileNavItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Assessment', href: '/assessment', icon: FileCheck },
  { name: 'Sessions', href: '/catalog/sessions', icon: Calendar },
  { name: 'Profile', href: '/profile', icon: User },
];

export function BottomNav() {
  const { user } = useAuthStore();

  // Only show on mobile screens
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card md:hidden">
      <div className="flex items-center justify-around h-16">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
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
              <span className="text-xs font-medium">{item.name}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

