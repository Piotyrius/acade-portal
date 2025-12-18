import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
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
  Users,
  Calendar,
  FileText,
  DollarSign,
  FileSpreadsheet,
  UserCog,
  CreditCard,
  Archive,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: any;
  roles?: string[]; // If undefined, visible to all roles
}

const navigation: NavItem[] = [
  // Home
  { name: 'Home', href: '/dashboard', icon: LayoutDashboard },

  // Admissions
  { name: 'Admissions', href: '/admissions/applications', icon: UserPlus, roles: ['ADMIN'] },

  // Enrollments & Cohorts
  { name: 'Programs & Cohorts', href: '/catalog/programs', icon: BookOpen, roles: ['ADMIN', 'LECTURER'] },

  // Billing & Payments
  { name: 'Billing & Payments', href: '/payments', icon: CreditCard, roles: ['ADMIN'] },

  // Teaching
  { name: 'Teaching', href: '/assessment', icon: FileCheck },
  { name: 'Attendance', href: '/attendance/list', icon: ClipboardCheck, roles: ['ADMIN', 'LECTURER'] },

  // Reports
  { name: 'Reports', href: '/reporting', icon: FileSpreadsheet, roles: ['ADMIN'] },

  // Other resources / Settings
  { name: 'Timekeeping', href: '/timekeeping', icon: Clock, roles: ['ADMIN', 'LECTURER'] },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Certificates', href: '/certificates/list', icon: Award },
  { name: 'Gallery', href: '/gallery/mine', icon: Image },
  { name: 'Archive', href: '/archive', icon: Archive, roles: ['ADMIN'] },
  { name: 'Users', href: '/users', icon: UserCog, roles: ['ADMIN'] },
  { name: 'Lecturer Portal', href: '/lecturer/dashboard', icon: GraduationCap, roles: ['LECTURER'] },
  { name: 'My Sessions', href: '/lecturer/sessions', icon: Calendar, roles: ['LECTURER'] },
];
import './Layout.css'

export function Sidebar() {
  const { user } = useAuthStore();

  // Filter navigation items based on user role
  const visibleNavigation = (navigation || []).filter((item) => {
    if (!item.roles) return true; // No role restriction
    return item.roles.includes(user?.role || '');
  });

  return (
    <div className="sidebar_wrapper">
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
        <img src="/logo.svg" alt="Cyber Academy" className="h-9 w-auto" />
        <span className="text-sm font-semibold text-sidebar-foreground">Cyber Academy</span>
      </div>
      <nav className="sidebar_link_wrapper">
        {(visibleNavigation || []).map((item) => (
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
