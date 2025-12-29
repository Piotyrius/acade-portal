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
import { useTranslation } from 'react-i18next';

const getRouteLabelKey = (path: string): string | null => {
  const routeKeyMap: Record<string, string> = {
    dashboard: 'layout.breadcrumbDashboard',
    'catalog/programs': 'layout.breadcrumbPrograms',
    'catalog/sessions': 'layout.breadcrumbSessions',
    'admissions/applications': 'layout.breadcrumbApplications',
    'admissions/enrollments': 'layout.breadcrumbEnrollments',
    'admissions/recruiting': 'layout.breadcrumbRecruiting',
    'attendance/list': 'layout.breadcrumbAttendance',
    assessment: 'layout.breadcrumbAssessment',
    'assessment/assessments': 'layout.breadcrumbAssessments',
    'assessment/submissions': 'layout.breadcrumbSubmissions',
    'assessment/grades': 'layout.breadcrumbGrades',
    'certificates/list': 'layout.breadcrumbCertificates',
    timekeeping: 'layout.breadcrumbTimekeeping',
    'timekeeping/worklogs': 'layout.breadcrumbWorkLogs',
    'timekeeping/rates': 'layout.breadcrumbRates',
    'timekeeping/timesheets': 'layout.breadcrumbTimesheets',
    'gallery/mine': 'layout.breadcrumbGallery',
    documents: 'layout.breadcrumbDocuments',
    reporting: 'layout.breadcrumbReporting',
    users: 'layout.breadcrumbUsers',
    payments: 'layout.breadcrumbPayments',
    'payments/invoices': 'layout.breadcrumbInvoices',
    'payments/payments': 'layout.breadcrumbPayments',
    'payments/discounts': 'layout.breadcrumbDiscounts',
    'payments/payment-plans': 'layout.breadcrumbPaymentPlans',
    'payments/payment-methods': 'layout.breadcrumbPaymentMethods',
    'payments/payment-schedules': 'layout.breadcrumbPaymentSchedules',
    'payments/pricings': 'layout.breadcrumbPricings',
    archive: 'layout.breadcrumbArchive',
    'lecturer/dashboard': 'layout.breadcrumbLecturerDashboard',
    'lecturer/sessions': 'layout.breadcrumbMySessions',
    profile: 'layout.breadcrumbProfile',
    'student/portal': 'layout.breadcrumbStudentPortal',
  };
  return routeKeyMap[path] || null;
};

export function Breadcrumbs() {
  const { t } = useTranslation('common');
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const getBreadcrumbLabel = (path: string, index: number, paths: string[]): string => {
    // Check for exact match first
    const fullPath = paths.slice(0, index + 1).join('/');
    const fullPathKey = getRouteLabelKey(fullPath);
    if (fullPathKey) {
      return t(fullPathKey);
    }

    // Check for partial match
    const pathKey = getRouteLabelKey(path);
    if (pathKey) {
      return t(pathKey);
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
              <span className="sr-only">{t('layout.breadcrumbHome')}</span>
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



