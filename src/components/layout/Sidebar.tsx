import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useTranslation } from "react-i18next";
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
  labelKey: string;
  href: string;
  icon: any;
  roles?: string[]; // If undefined, visible to all roles
}

const navigation: NavItem[] = [
  // Home
  { labelKey: "layout.home", href: "/dashboard", icon: LayoutDashboard },

  // Admissions
  {
    labelKey: "layout.admissions",
    href: "/admissions/applications",
    icon: UserPlus,
    roles: ["ADMIN"],
  },

  // Enrollments & Cohorts
  {
    labelKey: "layout.programsAndCohorts",
    href: "/catalog/programs",
    icon: BookOpen,
    roles: ["ADMIN", "LECTURER"],
  },

  // Billing & Payments
  {
    labelKey: "layout.payments",
    href: "/payments",
    icon: CreditCard,
    roles: ["ADMIN"],
  },

  // Teaching
  { labelKey: "layout.teaching", href: "/assessment", icon: FileCheck },
  {
    labelKey: "layout.attendance",
    href: "/attendance/list",
    icon: ClipboardCheck,
    roles: ["ADMIN", "LECTURER"],
  },

  // Reports
  {
    labelKey: "layout.reports",
    href: "/reporting",
    icon: FileSpreadsheet,
    roles: ["ADMIN"],
  },

  // Other resources / Settings
  {
    labelKey: "layout.timekeeping",
    href: "/timekeeping",
    icon: Clock,
    roles: ["ADMIN", "LECTURER"],
  },
  { labelKey: "layout.documents", href: "/documents", icon: FileText },
  {
    labelKey: "layout.certificates",
    href: "/certificates/list",
    icon: Award,
  },
  { labelKey: "layout.gallery", href: "/gallery/mine", icon: Image },
  {
    labelKey: "layout.archive",
    href: "/archive",
    icon: Archive,
    roles: ["ADMIN"],
  },
  { labelKey: "layout.users", href: "/users", icon: UserCog, roles: ["ADMIN"] },
  {
    labelKey: "layout.lecturerPortal",
    href: "/lecturer/dashboard",
    icon: GraduationCap,
    roles: ["LECTURER"],
  },
  {
    labelKey: "layout.mySessions",
    href: "/lecturer/sessions",
    icon: Calendar,
    roles: ["LECTURER"],
  },
];
import "./Layout.css";

export function Sidebar() {
  const { t } = useTranslation("common");
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
        <span className="text-sm font-semibold text-sidebar-foreground">
          {t("app.name")}
        </span>
      </div>
      <nav className="sidebar_link_wrapper">
        {(visibleNavigation || []).map((item) => (
          <NavLink
            key={item.href}
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
            {t(item.labelKey)}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
