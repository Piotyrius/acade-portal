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
    dashboard: 'breadcrumbDashboard',
    catalog: 'breadcrumbCatalog',
    'catalog/programs': 'breadcrumbPrograms',
    'catalog/courses': 'breadcrumbCourses',
    'catalog/cohorts': 'breadcrumbCohorts',
    'catalog/sessions': 'breadcrumbSessions',
    'admissions/applications': 'breadcrumbApplications',
    'admissions/enrollments': 'breadcrumbEnrollments',
    'admissions/recruiting': 'breadcrumbRecruiting',
    'attendance/list': 'breadcrumbAttendance',
    assessment: 'breadcrumbAssessment',
    'assessment/assessments': 'breadcrumbAssessments',
    'assessment/submissions': 'breadcrumbSubmissions',
    'assessment/grades': 'breadcrumbGrades',
    'certificates/list': 'breadcrumbCertificates',
    timekeeping: 'breadcrumbTimekeeping',
    'timekeeping/worklogs': 'breadcrumbWorkLogs',
    'timekeeping/rates': 'breadcrumbRates',
    'timekeeping/timesheets': 'breadcrumbTimesheets',
    'gallery/mine': 'breadcrumbGallery',
    documents: 'breadcrumbDocuments',
    reporting: 'breadcrumbReporting',
    users: 'breadcrumbUsers',
    payments: 'breadcrumbPayments',
    'payments/invoices': 'breadcrumbInvoices',
    'payments/payments': 'breadcrumbPayments',
    'payments/discounts': 'breadcrumbDiscounts',
    'payments/payment-plans': 'breadcrumbPaymentPlans',
    'payments/payment-methods': 'breadcrumbPaymentMethods',
    'payments/payment-schedules': 'breadcrumbPaymentSchedules',
    'payments/pricings': 'breadcrumbPricings',
    archive: 'breadcrumbArchive',
    'lecturer/dashboard': 'breadcrumbLecturerDashboard',
    'lecturer/sessions': 'breadcrumbMySessions',
    profile: 'breadcrumbProfile',
    'student/portal': 'breadcrumbStudentPortal',
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
              <span className="sr-only">{t('breadcrumbHome')}</span>
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



