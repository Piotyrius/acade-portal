import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RequireAuth } from "@/components/guards/RequireAuth";
import { AppShell } from "@/components/layout/AppShell";
import { lazy, Suspense } from "react";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load pages for code splitting
const Programs = lazy(() => import("./pages/catalog/Programs"));
const Sessions = lazy(() => import("./pages/catalog/Sessions"));
const Applications = lazy(() => import("./pages/admissions/Applications"));
const Enrollments = lazy(() => import("./pages/admissions/Enrollments"));
const Recruiting = lazy(() => import("./pages/admissions/Recruiting"));
const AttendanceList = lazy(() => import("./pages/attendance/AttendanceList"));
const AssessmentUnified = lazy(() => import("./pages/assessment/AssessmentUnified"));
const Assessments = lazy(() => import("./pages/assessment/Assessments"));
const Submissions = lazy(() => import("./pages/assessment/Submissions"));
const Grades = lazy(() => import("./pages/assessment/Grades"));
const CertificatesList = lazy(() => import("./pages/certificates/CertificatesList"));
const TimekeepingUnified = lazy(() => import("./pages/timekeeping/TimekeepingUnified"));
const WorkLogs = lazy(() => import("./pages/timekeeping/WorkLogs"));
const MyWorks = lazy(() => import("./pages/gallery/MyWorks"));
const Profile = lazy(() => import("./pages/Profile"));
const StudentPortal = lazy(() => import("./pages/StudentPortal"));
const Documents = lazy(() => import("./pages/documents/Documents"));
const Rates = lazy(() => import("./pages/timekeeping/Rates"));
const Timesheets = lazy(() => import("./pages/timekeeping/Timesheets"));
const Reporting = lazy(() => import("./pages/reporting/Reporting"));
const Users = lazy(() => import("./pages/users/Users"));
const VerifyCertificate = lazy(() => import("./pages/public/VerifyCertificate"));
const ApplyPage = lazy(() => import("./pages/public/ApplyPage"));
const PublicGallery = lazy(() => import("./pages/public/PublicGallery"));
const LecturerDashboard = lazy(() => import("./pages/lecturer/LecturerDashboard"));
const MySessions = lazy(() => import("./pages/lecturer/MySessions"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PaymentsUnified = lazy(() => import("./pages/payments/PaymentsUnified"));
const Invoices = lazy(() => import("./pages/payments/Invoices"));
const Discounts = lazy(() => import("./pages/payments/Discounts"));
const PaymentPlans = lazy(() => import("./pages/payments/PaymentPlans"));
const PaymentMethods = lazy(() => import("./pages/payments/PaymentMethods"));
const PaymentSchedules = lazy(() => import("./pages/payments/PaymentSchedules"));
const Payments = lazy(() => import("./pages/payments/Payments"));
const Pricings = lazy(() => import("./pages/payments/Pricings"));
const ArchiveBrowser = lazy(() => import("./pages/archive/ArchiveBrowser"));
const Organizations = lazy(() => import("./pages/subscriptions/Organizations"));
const SubscriptionPlans = lazy(() => import("./pages/subscriptions/SubscriptionPlans"));
const Subscriptions = lazy(() => import("./pages/subscriptions/Subscriptions"));
const MySubscription = lazy(() => import("./pages/subscriptions/MySubscription"));

const PageSkeleton = () => (
  <div className="space-y-6 p-6">
    <Skeleton className="h-9 w-40" />
    <Skeleton className="h-96 w-full" />
  </div>
);

import PaymentWrapper from "./components/PaymentWrapper";
import SubscriptionWrapper from "./components/SubscriptionWrapper";
import AdmissionsWrapper from "./components/AdmissionsWrapper";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache for 10 minutes (v5 renamed cacheTime to gcTime)
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnMount: false, // Don't refetch on mount if data is fresh
      retry: 1, // Only retry once on failure
      retryDelay: 1000, // Wait 1 second before retry
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify" element={
            <Suspense fallback={<PageSkeleton />}>
              <VerifyCertificate />
            </Suspense>
          } />
          <Route path="/apply" element={
            <Suspense fallback={<PageSkeleton />}>
              <ApplyPage />
            </Suspense>
          } />
          <Route path="/gallery" element={
            <Suspense fallback={<PageSkeleton />}>
              <PublicGallery />
            </Suspense>
          } />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="catalog/programs" element={
              <Suspense fallback={<PageSkeleton />}>
                <Programs />
              </Suspense>
            } />
            
            {/* <Route path="catalog/courses" element={<Courses />} />
            <Route path="catalog/cohorts" element={<Cohorts />} /> */}

            <Route path="/admissions" element={ <AdmissionsWrapper /> }>
              <Route path="applications" element={
                <Suspense fallback={<PageSkeleton />}>
                  <Applications />
                </Suspense>
              } />
              <Route path="enrollments" element={
                <Suspense fallback={<PageSkeleton />}>
                  <Enrollments />
                </Suspense>
              } />
              <Route path="recruiting" element={
                <Suspense fallback={<PageSkeleton />}>
                  <Recruiting />
                </Suspense>
              } />
            </Route>
            
            <Route path="catalog/sessions" element={
              <Suspense fallback={<PageSkeleton />}>
                <Sessions />
              </Suspense>
            } />
            <Route path="attendance/list" element={
              <Suspense fallback={<PageSkeleton />}>
                <AttendanceList />
              </Suspense>
            } />
            <Route path="assessment" element={
              <Suspense fallback={<PageSkeleton />}>
                <AssessmentUnified />
              </Suspense>
            } />
            <Route path="assessment/assessments" element={
              <Suspense fallback={<PageSkeleton />}>
                <Assessments />
              </Suspense>
            } />
            <Route path="assessment/submissions" element={
              <Suspense fallback={<PageSkeleton />}>
                <Submissions />
              </Suspense>
            } />
            <Route path="assessment/grades" element={
              <Suspense fallback={<PageSkeleton />}>
                <Grades />
              </Suspense>
            } />
            <Route path="certificates/list" element={
              <Suspense fallback={<PageSkeleton />}>
                <CertificatesList />
              </Suspense>
            } />
            <Route path="timekeeping" element={
              <Suspense fallback={<PageSkeleton />}>
                <TimekeepingUnified />
              </Suspense>
            } />
            <Route path="timekeeping/worklogs" element={
              <Suspense fallback={<PageSkeleton />}>
                <WorkLogs />
              </Suspense>
            } />
            <Route path="timekeeping/rates" element={
              <Suspense fallback={<PageSkeleton />}>
                <Rates />
              </Suspense>
            } />
            <Route path="timekeeping/timesheets" element={
              <Suspense fallback={<PageSkeleton />}>
                <Timesheets />
              </Suspense>
            } />
            <Route path="gallery/mine" element={
              <Suspense fallback={<PageSkeleton />}>
                <MyWorks />
              </Suspense>
            } />
            <Route path="profile" element={
              <Suspense fallback={<PageSkeleton />}>
                <Profile />
              </Suspense>
            } />
            <Route path="student/portal" element={
              <Suspense fallback={<PageSkeleton />}>
                <StudentPortal />
              </Suspense>
            } />
            <Route path="documents" element={
              <Suspense fallback={<PageSkeleton />}>
                <Documents />
              </Suspense>
            } />
            <Route path="reporting" element={
              <Suspense fallback={<PageSkeleton />}>
                <Reporting />
              </Suspense>
            } />
            <Route path="users" element={
              <Suspense fallback={<PageSkeleton />}>
                <Users />
              </Suspense>
            } />
            <Route path="lecturer/dashboard" element={
              <Suspense fallback={<PageSkeleton />}>
                <LecturerDashboard />
              </Suspense>
            } />
            <Route path="lecturer/sessions" element={
              <Suspense fallback={<PageSkeleton />}>
                <MySessions />
              </Suspense>
            } />

            <Route path="/payments" element={ <PaymentWrapper /> } >
              <Route index element={<PaymentsUnified />} />
              <Route path="unified" element={<PaymentsUnified />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="discounts" element={<Discounts />} />
              <Route path="payment-plans" element={<PaymentPlans />} />
              <Route path="payment-methods" element={<PaymentMethods />} />
              <Route path="payment-schedules" element={<PaymentSchedules />} />
              <Route path="payments" element={<Payments />} />
              <Route path="pricings" element={<Pricings />} />
            </Route>

            <Route path="/subscriptions" element={ <SubscriptionWrapper /> } >

              <Route path="organizations" element={<Organizations />} />
              <Route path="plans" element={<SubscriptionPlans />} />
              <Route path="subscriptions" element={<Subscriptions />} />
              <Route path="my-subscription" element={<MySubscription />} />
            
            </Route>

            <Route path="archive" element={<ArchiveBrowser />} />
          </Route>
          <Route path="*" element={
            <Suspense fallback={<PageSkeleton />}>
              <NotFound />
            </Suspense>
          } />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
