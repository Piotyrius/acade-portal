import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BookOpen,
  UserPlus,
  ClipboardCheck,
  FileCheck,
  Award,
  Clock,
  Image,
  GraduationCap,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Catalog', href: '/catalog/programs', icon: BookOpen },
  { name: 'Admissions', href: '/admissions/applications', icon: UserPlus },
  { name: 'Attendance', href: '/attendance/list', icon: ClipboardCheck },
  { name: 'Assessment', href: '/assessment/assessments', icon: FileCheck },
  { name: 'Certificates', href: '/certificates/list', icon: Award },
  { name: 'Timekeeping', href: '/timekeeping/worklogs', icon: Clock },
  { name: 'Gallery', href: '/gallery/mine', icon: Image },
];

export function Sidebar() {
  return (
    <div className="flex w-64 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
        <img src="/logo.svg" alt="Cyber Academy" className="h-10 w-auto" />
        <span className="text-lg font-semibold text-sidebar-foreground">Cyber Academy</span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
