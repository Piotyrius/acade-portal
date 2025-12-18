import { useLocation, Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ChevronRight, Home } from 'lucide-react';

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  'catalog/programs': 'Programs',
  'catalog/sessions': 'Sessions',
  'admissions/applications': 'Applications',
  'admissions/enrollments': 'Enrollments',
  'admissions/recruiting': 'Recruiting',
  'attendance/list': 'Attendance',
  assessment: 'Assessment',
  'assessment/assessments': 'Assessments',
  'assessment/submissions': 'Submissions',
  'assessment/grades': 'Grades',
  'certificates/list': 'Certificates',
  timekeeping: 'Timekeeping',
  'timekeeping/worklogs': 'Work Logs',
  'timekeeping/rates': 'Rates',
  'timekeeping/timesheets': 'Timesheets',
  'gallery/mine': 'Gallery',
  documents: 'Documents',
  reporting: 'Reporting',
  users: 'Users',
  payments: 'Payments',
  'payments/invoices': 'Invoices',
  'payments/payments': 'Payments',
  'payments/discounts': 'Discounts',
  'payments/payment-plans': 'Payment Plans',
  'payments/payment-methods': 'Payment Methods',
  'payments/payment-schedules': 'Payment Schedules',
  'payments/pricings': 'Pricings',
  archive: 'Archive',
  'lecturer/dashboard': 'Lecturer Dashboard',
  'lecturer/sessions': 'My Sessions',
  profile: 'Profile',
  'student/portal': 'Student Portal',
};

export function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const getBreadcrumbLabel = (path: string, index: number, paths: string[]): string => {
    // Check for exact match first
    const fullPath = paths.slice(0, index + 1).join('/');
    if (routeLabels[fullPath]) {
      return routeLabels[fullPath];
    }

    // Check for partial match
    if (routeLabels[path]) {
      return routeLabels[path];
    }

    // Capitalize and format the path
    return path
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (pathnames.length === 0) {
    return null;
  }

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/dashboard" className="flex items-center gap-1">
              <Home className="h-4 w-4" />
              <span className="sr-only">Home</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {pathnames.map((path, index) => {
          const isLast = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const label = getBreadcrumbLabel(path, index, pathnames);

          return (
            <div key={to} className="flex items-center">
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={to}>{label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}



