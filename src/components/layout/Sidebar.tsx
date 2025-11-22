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
  Upload,
  FileSpreadsheet,
  UserCog,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: any;
  roles?: string[]; // If undefined, visible to all roles
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Programs', href: '/catalog/programs', icon: BookOpen, roles: ['ADMIN'] },
  { name: 'Courses', href: '/catalog/courses', icon: GraduationCap, roles: ['ADMIN', 'LECTURER'] },
  { name: 'Cohorts', href: '/catalog/cohorts', icon: Users, roles: ['ADMIN', 'LECTURER'] },
  { name: 'Sessions', href: '/catalog/sessions', icon: Calendar, roles: ['ADMIN', 'LECTURER'] },
  { name: 'Admissions', href: '/admissions/applications', icon: UserPlus, roles: ['ADMIN'] },
  { name: 'Recruit Students', href: '/admissions/recruiting', icon: UserPlus, roles: ['ADMIN'] },
  { name: 'Enrollments', href: '/admissions/enrollments', icon: Users, roles: ['ADMIN', 'LECTURER'] },
  { name: 'Attendance', href: '/attendance/list', icon: ClipboardCheck, roles: ['ADMIN', 'LECTURER'] },
  { name: 'Assessment', href: '/assessment/assessments', icon: FileCheck, roles: ['ADMIN', 'LECTURER'] },
  { name: 'Submissions', href: '/assessment/submissions', icon: Upload },
  { name: 'Grades', href: '/assessment/grades', icon: GraduationCap },
  { name: 'Certificates', href: '/certificates/list', icon: Award },
  { name: 'Timekeeping', href: '/timekeeping/worklogs', icon: Clock, roles: ['ADMIN', 'LECTURER'] },
  { name: 'Rates', href: '/timekeeping/rates', icon: DollarSign, roles: ['ADMIN'] },
  { name: 'Timesheets', href: '/timekeeping/timesheets', icon: FileText, roles: ['ADMIN'] },
  { name: 'Gallery', href: '/gallery/mine', icon: Image },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Reporting', href: '/reporting', icon: FileSpreadsheet, roles: ['ADMIN'] },
  { name: 'Users', href: '/users', icon: UserCog, roles: ['ADMIN'] },
  { name: 'Lecturer Portal', href: '/lecturer/dashboard', icon: GraduationCap, roles: ['LECTURER'] },
  { name: 'Manual Enrollment', href: '/admissions/manual-enrollment', icon: UserPlus, roles: ['ADMIN'] },
];
import './Layout.css'

export function Sidebar() {
  const { user } = useAuthStore();
  
  // Filter navigation items based on user role
  const visibleNavigation = navigation.filter((item) => {
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
        {visibleNavigation.map((item) => (
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
