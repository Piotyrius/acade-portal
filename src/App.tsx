import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RequireAuth } from "@/components/guards/RequireAuth";
import { AppShell } from "@/components/layout/AppShell";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Programs from "./pages/catalog/Programs";
import Courses from "./pages/catalog/Courses";
import Applications from "./pages/admissions/Applications";
import AttendanceList from "./pages/attendance/AttendanceList";
import Assessments from "./pages/assessment/Assessments";
import CertificatesList from "./pages/certificates/CertificatesList";
import WorkLogs from "./pages/timekeeping/WorkLogs";
import MyWorks from "./pages/gallery/MyWorks";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/catalog/programs" element={<Programs />} />
            <Route path="/catalog/courses" element={<Courses />} />
            <Route path="/admissions/applications" element={<Applications />} />
            <Route path="/attendance/list" element={<AttendanceList />} />
            <Route path="/assessment/assessments" element={<Assessments />} />
            <Route path="/certificates/list" element={<CertificatesList />} />
            <Route path="/timekeeping/worklogs" element={<WorkLogs />} />
            <Route path="/gallery/mine" element={<MyWorks />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
