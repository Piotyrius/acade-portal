import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RequireAuth } from "@/components/guards/RequireAuth";
import { AppShell } from "@/components/layout/AppShell";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Programs from "./pages/catalog/Programs";
import Courses from "./pages/catalog/Courses";
import Cohorts from "./pages/catalog/Cohorts";
import Sessions from "./pages/catalog/Sessions";
import Applications from "./pages/admissions/Applications";
import Enrollments from "./pages/admissions/Enrollments";
import Recruiting from "./pages/admissions/Recruiting";
import AttendanceList from "./pages/attendance/AttendanceList";
import Assessments from "./pages/assessment/Assessments";
import Submissions from "./pages/assessment/Submissions";
import Grades from "./pages/assessment/Grades";
import CertificatesList from "./pages/certificates/CertificatesList";
import WorkLogs from "./pages/timekeeping/WorkLogs";
import MyWorks from "./pages/gallery/MyWorks";
import Profile from "./pages/Profile";
import StudentPortal from "./pages/StudentPortal";
import Documents from "./pages/documents/Documents";
import Rates from "./pages/timekeeping/Rates";
import Timesheets from "./pages/timekeeping/Timesheets";
import Reporting from "./pages/reporting/Reporting";
import Users from "./pages/users/Users";
import VerifyCertificate from "./pages/public/VerifyCertificate";
import ApplyPage from "./pages/public/ApplyPage";
import PublicGallery from "./pages/public/PublicGallery";
import LecturerDashboard from "./pages/lecturer/LecturerDashboard";
import MySessions from "./pages/lecturer/MySessions";
import NotFound from "./pages/NotFound";
import Invoices from "./pages/payments/Invoices";
import Discounts from "./pages/payments/Discounts";
import PaymentPlans from "./pages/payments/PaymentPlans";
import PaymentMethods from "./pages/payments/PaymentMethods";
import PaymentSchedules from "./pages/payments/PaymentSchedules";
import Payments from "./pages/payments/Payments";
import Pricings from "./pages/payments/Pricings";
import ArchiveBrowser from "./pages/archive/ArchiveBrowser";
import Organizations from "./pages/subscriptions/Organizations";
import SubscriptionPlans from "./pages/subscriptions/SubscriptionPlans";
import Subscriptions from "./pages/subscriptions/Subscriptions";
import MySubscription from "./pages/subscriptions/MySubscription";

import PaymentWrapper from "./components/PaymentWrapper";

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
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify" element={<VerifyCertificate />} />
          <Route path="/apply" element={<ApplyPage />} />
          <Route path="/gallery" element={<PublicGallery />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="catalog/programs" element={<Programs />} />
            <Route path="catalog/courses" element={<Courses />} />
            <Route path="catalog/cohorts" element={<Cohorts />} />
            <Route path="catalog/sessions" element={<Sessions />} />
            <Route path="admissions/applications" element={<Applications />} />
            <Route path="admissions/enrollments" element={<Enrollments />} />
            <Route path="admissions/recruiting" element={<Recruiting />} />
            <Route path="attendance/list" element={<AttendanceList />} />
            <Route path="assessment/assessments" element={<Assessments />} />
            <Route path="assessment/submissions" element={<Submissions />} />
            <Route path="assessment/grades" element={<Grades />} />
            <Route path="certificates/list" element={<CertificatesList />} />
            <Route path="timekeeping/worklogs" element={<WorkLogs />} />
            <Route path="timekeeping/rates" element={<Rates />} />
            <Route path="timekeeping/timesheets" element={<Timesheets />} />
            <Route path="gallery/mine" element={<MyWorks />} />
            <Route path="profile" element={<Profile />} />
            <Route path="student/portal" element={<StudentPortal />} />
            <Route path="documents" element={<Documents />} />
            <Route path="reporting" element={<Reporting />} />
            <Route path="users" element={<Users />} />
            <Route path="lecturer/dashboard" element={<LecturerDashboard />} />
            <Route path="lecturer/sessions" element={<MySessions />} />

            <Route path="/payments" element={ <PaymentWrapper /> } >

              <Route path="invoices" element={<Invoices />} />
              <Route path="discounts" element={<Discounts />} />
              <Route path="payment-plans" element={<PaymentPlans />} />
              <Route path="payment-methods" element={<PaymentMethods />} />
              <Route path="payment-schedules" element={<PaymentSchedules />} />
              <Route path="payments" element={<Payments />} />
              <Route path="pricings" element={<Pricings />} />
            
            </Route>

            <Route path="archive" element={<ArchiveBrowser />} />
            <Route path="subscriptions/organizations" element={<Organizations />} />
            <Route path="subscriptions/plans" element={<SubscriptionPlans />} />
            <Route path="subscriptions/subscriptions" element={<Subscriptions />} />
            <Route path="subscriptions/my-subscription" element={<MySubscription />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
