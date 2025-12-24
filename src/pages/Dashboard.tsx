import { useAuthStore } from "@/store/authStore";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  BookOpen,
  ClipboardCheck,
  Award,
  TrendingUp,
  Calendar,
  DollarSign,
  FileText,
  Plus,
  ArrowRight,
  Clock,
  GraduationCap,
  FileCheck,
  Upload,
} from "lucide-react";
import { getCohorts } from "@/api/endpoints/catalog";
import { getEnrollments, getApplications } from "@/api/endpoints/admissions";
import { getCertificates } from "@/api/endpoints/certificates";
import { getMySessions } from "@/api/endpoints/catalog";
import { format, isToday, isTomorrow, parseISO } from "date-fns";
import { getAttendanceRecords } from "@/api/endpoints/attendance";
import { getInvoices, getPayments } from "@/api/endpoints/payments";
import { getWorkLogs, getTimesheets, getRates } from "@/api/endpoints/timekeeping";
import { getAssessments, getSubmissions, getGrades } from "@/api/endpoints/assessment";
import { getAnalyticsOverview } from "@/api/endpoints/reporting";
import { ClickableMetricCard } from "@/components/dashboard/ClickableMetricCard";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { useTranslation } from "react-i18next";
import { WorkLogDto } from '@/api/types';

function getPercentChange(current: number, previous: number) {
  if (previous === 0) return '+0%';
  const change = ((current - previous) / previous) * 100;
  const rounded = Math.round(change);
  return `${rounded > 0 ? '+' : ''}${rounded}%`;
}

export default function Dashboard() {
  const { t } = useTranslation("common");
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: cohorts = [] } = useQuery({
    queryKey: ['cohorts'],
    queryFn: () => getCohorts(),
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments'],
    queryFn: () => getEnrollments(),
  });

  const { data: certificates = [] } = useQuery({
    queryKey: ['certificates'],
    queryFn: () => getCertificates(),
  });

  const { data: mySessions = [] } = useQuery({
    queryKey: ['my-sessions-dashboard'],
    queryFn: () => getMySessions(),
    enabled: user?.role === 'LECTURER',
  });

  const { data: attendanceRecords = [] } = useQuery({
    queryKey: ['attendance'],
    queryFn: () => getAttendanceRecords(),
  });

  // Admin-specific queries
  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices-dashboard'],
    queryFn: () => getInvoices(),
    enabled: user?.role === 'ADMIN',
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['payments-dashboard'],
    queryFn: () => getPayments(),
    enabled: user?.role === 'ADMIN',
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['applications-dashboard'],
    queryFn: () => getApplications(),
    enabled: user?.role === 'ADMIN',
  });

  const { data: analyticsOverview } = useQuery({
    queryKey: ['analytics-overview-dashboard'],
    queryFn: () => getAnalyticsOverview(),
    enabled: user?.role === 'ADMIN',
    retry: false, // Don't retry on error
    refetchOnWindowFocus: false, // Don't refetch on window focus

  });

  // Lecturer-specific queries
  const { data: workLogs = [] } = useQuery({
    queryKey: ['worklogs-dashboard', user?.id],
    queryFn: () => getWorkLogs({ lecturer: user?.id }),
    enabled: user?.role === 'LECTURER' && !!user?.id,
  });

  const { data: timesheets = [] } = useQuery({
    queryKey: ['timesheets-dashboard', user?.id],
    queryFn: () => getTimesheets(user?.id),
    enabled: user?.role === 'LECTURER' && !!user?.id,
  });

  const { data: rates = [] } = useQuery({
    queryKey: ['rates-dashboard', user?.id],
    queryFn: () => getRates(user?.id),
    enabled: user?.role === 'LECTURER' && !!user?.id,
  });

  const { data: submissions = [] } = useQuery({
    queryKey: ['submissions-dashboard-lecturer'],
    queryFn: () => getSubmissions(),
    enabled: user?.role === 'LECTURER',
  });

  const { data: grades = [] } = useQuery({
    queryKey: ['grades-dashboard-lecturer'],
    queryFn: () => getGrades(),
    enabled: user?.role === 'LECTURER',
  });

  // Student-specific queries
  const { data: studentAssessments = [] } = useQuery({
    queryKey: ['assessments-dashboard-student'],
    queryFn: () => getAssessments(),
    enabled: user?.role === 'STUDENT',
  });

  const { data: studentSubmissions = [] } = useQuery({
    queryKey: ['submissions-dashboard-student', user?.id],
    queryFn: () => getSubmissions(),
    enabled: user?.role === 'STUDENT' && !!user?.id,
  });

  const { data: studentGrades = [] } = useQuery({
    queryKey: ['grades-dashboard-student', user?.id],
    queryFn: () => getGrades(undefined, user?.id),
    enabled: user?.role === 'STUDENT' && !!user?.id,
  });


  const activeStudentsCount = enrollments.filter((e) => e.status === 'ACTIVE').length;
  const totalStudentsCount = enrollments.length;
  const activeCohorts = cohorts.filter((c) => c.status === 'ACTIVE').length;
  const certificatesIssued = certificates.filter((c) => c.status === 'ISSUED').length;


  const upcomingSessions =
    mySessions
      ?.filter((session) => {
        const d = parseISO(session.date);
        return isToday(d) || isTomorrow(d);
      })
      .sort((a, b) => {
        const A = new Date(`${a.date}T${a.start_time}`);
        const B = new Date(`${b.date}T${b.start_time}`);
        return A.getTime() - B.getTime();
      })
      .slice(0, 3) ?? [];


  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());

  const countThisMonth = (items: any[], dateField: string) =>
    items.filter((item) => new Date(item[dateField]) >= lastMonth).length;

  const countLastMonth = (items: any[], dateField: string) =>
    items.filter((item) => {
      const d = new Date(item[dateField]);
      return d < lastMonth && d >= twoMonthsAgo;
    }).length;

  const studentsChange = getPercentChange(
    countThisMonth(enrollments, "enrolled_at"),
    countLastMonth(enrollments, "enrolled_at")
  );

  const cohortsChange = getPercentChange(
    countThisMonth(cohorts, "created_at"),
    countLastMonth(cohorts, "created_at")
  );

  const certificatesChange = getPercentChange(
    countThisMonth(certificates, "issued_at"),
    countLastMonth(certificates, "issued_at")
  );


  const presentStatuses = ["PRESENT", "LATE", "EXCUSED"];

  // Determine which attendance records matter for this user
  let relevantAttendance = attendanceRecords;

  if (user?.role === 'LECTURER' && mySessions?.length > 0) {
    const lecturerSessionIds = new Set(mySessions.map((s) => s.id));
    relevantAttendance = attendanceRecords.filter((r) => lecturerSessionIds.has(r.session));
  }

  if (user?.role === 'STUDENT') {
    relevantAttendance = attendanceRecords.filter((r) => r.student === user.id);
  }

  const totalAttendance = relevantAttendance.length;
  const attendedCount = relevantAttendance.filter((r) =>
    presentStatuses.includes(r.status)
  ).length;

  const attendanceRate =
    totalAttendance === 0 ? '0%' : `${Math.round((attendedCount / totalAttendance) * 100)}%`;

  const attendanceThisMonthRecords = relevantAttendance.filter(
    (r) => new Date(r.marked_at) >= lastMonth
  );
  const attendanceLastMonthRecords = relevantAttendance.filter((r) => {
    const d = new Date(r.marked_at);
    return d < lastMonth && d >= twoMonthsAgo;
  });

  const attendanceThisMonth =
    attendanceThisMonthRecords.length === 0
      ? 0
      : Math.round(
          (attendanceThisMonthRecords.filter((r) =>
            presentStatuses.includes(r.status)
          ).length /
            attendanceThisMonthRecords.length) *
            100
        );

  const attendanceLastMonth =
    attendanceLastMonthRecords.length === 0
      ? 0
      : Math.round(
          (attendanceLastMonthRecords.filter((r) =>
            presentStatuses.includes(r.status)
          ).length /
            attendanceLastMonthRecords.length) *
            100
        );

  const attendanceChange = getPercentChange(attendanceThisMonth, attendanceLastMonth);

  // Calculate additional metrics
  const pendingApplications = applications.filter(
    (a: any) => a.status === "NEW" || a.status === "IN_REVIEW"
  ).length;
  const outstandingInvoices = invoices.filter(
    (i: any) => i.status === "OVERDUE" || i.status === "ISSUED"
  ).length;
  const totalRevenue = payments
    .filter((p: any) => p.status === "COMPLETED")
    .reduce((sum: number, p: any) => sum + parseFloat(p.amount || "0"), 0);
  
  const pendingSubmissions = submissions.filter((s: any) => !s.graded).length;
  const hoursThisMonth = (workLogs as WorkLogDto[])
    .filter((w) => {
      const logDate = new Date(w.start_at);
      return logDate >= lastMonth;
    })
    .reduce((sum: number, w) => sum + (w.minutes ?? 0) / 60, 0);
  
  const pendingAssessments = studentAssessments.filter((a: any) => {
    const dueDate = new Date(a.due_at);
    return dueDate > new Date() && !studentSubmissions.some((s: any) => s.assessment === a.id);
  }).length;

  const averageGrade = studentGrades.length > 0
    ? studentGrades.reduce((sum: number, g: any) => {
        const score = parseFloat(g.score || "0");
        const maxScore = parseFloat(g.max_score || "1");
        return sum + (score / maxScore) * 100;
      }, 0) / studentGrades.length
    : 0;

  // Helper: copy public recruiting link
  const handleCopyRecruitingLink = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/apply`;

    if (navigator && 'clipboard' in navigator) {
      navigator.clipboard
        .writeText(url)
        .then(() => {
          toast({
            title: t("dashboard.recruitingLinkCopiedTitle"),
            description: t("dashboard.recruitingLinkCopiedDescription"),
          });
        })
        .catch(() => {
          toast({
            title: t("dashboard.recruitingLinkReadyTitle"),
            description: url,
          });
        });
    } else {
      toast({
        title: t("dashboard.recruitingLinkReadyTitle"),
        description: url,
      });
    }
  };

  // Admin stats
  const adminStats = [
    {
      title: t("dashboard.totalStudents"),
      value: totalStudentsCount.toString(),
      change: studentsChange,
      icon: Users,
      trend: 'up' as const,
      href: '/admissions/enrollments',
    },
    {
      title: t("dashboard.activeCohorts"),
      value: activeCohorts.toString(),
      change: cohortsChange,
      icon: BookOpen,
      trend: 'up' as const,
      href: '/catalog/cohorts',
    },
    {
      title: t("dashboard.pendingApplications"),
      value: pendingApplications.toString(),
      change: '+0%',
      icon: FileText,
      trend: 'neutral' as const,
      href: '/admissions/applications',
    },
    {
      title: t("dashboard.outstandingInvoices"),
      value: outstandingInvoices.toString(),
      change: '+0%',
      icon: DollarSign,
      trend: outstandingInvoices > 0 ? 'down' as const : 'neutral' as const,
      href: '/payments/invoices',
    },
  ];

  // Lecturer stats
  const lecturerStats = [
    {
      title: t("dashboard.hoursThisMonth"),
      value: hoursThisMonth.toFixed(1),
      change: '+0%',
      icon: Clock,
      trend: 'up' as const,
      href: '/timekeeping/worklogs',
    },
    {
      title: t("dashboard.pendingSubmissions"),
      value: pendingSubmissions.toString(),
      change: '+0%',
      icon: FileCheck,
      trend: 'neutral' as const,
      href: '/assessment/submissions',
    },
    {
      title: t("dashboard.upcomingSessions"),
      value: upcomingSessions.length.toString(),
      change: '+0%',
      icon: Calendar,
      trend: 'neutral' as const,
      href: '/lecturer/sessions',
    },
    {
      title: t("dashboard.activeRate"),
      value: rates.find((r: any) => r.active)
        ? t("dashboard.rateSet")
        : t("dashboard.rateNotSet"),
      change: '',
      icon: DollarSign,
      trend: 'neutral' as const,
      href: '/timekeeping/rates',
    },
  ];

  // Student stats
  const studentStats = [
    {
      title: t("dashboard.pendingAssessments"),
      value: pendingAssessments.toString(),
      change: '+0%',
      icon: FileCheck,
      trend: 'neutral' as const,
      href: '/assessment/assessments',
    },
    {
      title: t("dashboard.averageGrade"),
      value: averageGrade > 0 ? `${averageGrade.toFixed(1)}%` : "N/A",
      change: '+0%',
      icon: GraduationCap,
      trend: 'up' as const,
      href: '/assessment/grades',
    },
    {
      title: t("dashboard.attendanceRate"),
      value: attendanceRate,
      change: attendanceChange,
      icon: ClipboardCheck,
      trend: 'up' as const,
      href: '/attendance/list',
    },
    {
      title: t("dashboard.certificates"),
      value: certificates.filter((c: any) => c.student === user?.id && c.status === 'ISSUED').length.toString(),
      change: '+0%',
      icon: Award,
      trend: 'up' as const,
      href: '/certificates/list',
    },
  ];

  const stats =
    user?.role === "ADMIN"
      ? adminStats
      : user?.role === "LECTURER"
      ? lecturerStats
      : studentStats;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          {t("dashboard.title")}
        </h2>
        <p className="text-muted-foreground">
          {user?.role === "ADMIN" && t("dashboard.subtitleAdmin")}
          {user?.role === "LECTURER" && t("dashboard.subtitleLecturer")}
          {user?.role === "STUDENT" && t("dashboard.subtitleStudent")}
        </p>
      </div>

      {/* Quick Actions */}
      {user?.role === "ADMIN" && (
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => navigate("/admissions/applications")}
            variant="outline"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("dashboard.reviewApplications")}
          </Button>
          <Button
            onClick={() => navigate("/admissions/enrollments")}
            variant="outline"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("dashboard.manageEnrollments")}
          </Button>
          <Button
            onClick={() => navigate("/payments/invoices")}
            variant="outline"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("dashboard.viewInvoices")}
          </Button>
          <Button onClick={() => navigate("/payments")} variant="outline">
            <DollarSign className="mr-2 h-4 w-4" />
            {t("dashboard.billingAndPayments")}
          </Button>
          <Button onClick={handleCopyRecruitingLink} variant="outline">
            <Users className="mr-2 h-4 w-4" />
            {t("dashboard.copyRecruitPageLink")}
          </Button>
        </div>
      )}

      {user?.role === "LECTURER" && (
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => navigate("/timekeeping/worklogs")}
            variant="outline"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("dashboard.logHours")}
          </Button>
          <Button
            onClick={() => navigate("/lecturer/sessions")}
            variant="outline"
          >
            <Calendar className="mr-2 h-4 w-4" />
            {t("dashboard.viewSessions")}
          </Button>
          <Button
            onClick={() => navigate("/assessment/submissions")}
            variant="outline"
          >
            <FileCheck className="mr-2 h-4 w-4" />
            {t("dashboard.gradeSubmissions")}
          </Button>
        </div>
      )}

      {user?.role === "STUDENT" && (
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => navigate("/assessment/assessments")}
            variant="outline"
          >
            <Upload className="mr-2 h-4 w-4" />
            {t("dashboard.submitAssignment")}
          </Button>
          <Button
            onClick={() => navigate("/catalog/sessions")}
            variant="outline"
          >
            <Calendar className="mr-2 h-4 w-4" />
            {t("dashboard.viewSchedule")}
          </Button>
          <Button
            onClick={() => navigate("/certificates/list")}
            variant="outline"
          >
            <Award className="mr-2 h-4 w-4" />
            {t("dashboard.myCertificates")}
          </Button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <ClickableMetricCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            icon={stat.icon}
            trend={stat.trend}
            href={stat.href}
          />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>
              {user?.role === "LECTURER"
                ? t("dashboard.cardUpcomingSessionsTitle")
                : t("dashboard.cardRecentEnrollmentsTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user?.role === "LECTURER" ? (
              <div className="space-y-4">
                {upcomingSessions.length > 0 ? (
                  upcomingSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => navigate('/lecturer/sessions')}
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{session.cohort_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {isToday(parseISO(session.date))
                              ? t("dashboard.today")
                              : t("dashboard.tomorrow")}
                            ,{" "}
                            {session.start_time}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <p className="text-sm font-medium">
                          {session.location || t("dashboard.noLocation")}
                        </p>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No upcoming sessions
                  </p>
                )}
              </div>
            ) : user?.role === "STUDENT" ? (
              <div className="space-y-4">
                {studentAssessments.slice(0, 3).map((assessment: any) => (
                  <div
                    key={assessment.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => navigate('/assessment/assessments')}
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <FileCheck className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{assessment.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {t("dashboard.due")}:{" "}
                          {format(parseISO(assessment.due_at), "MMM dd, yyyy")}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
                {studentAssessments.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">
                    {t("dashboard.noAssessments")}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {enrollments &&
                  enrollments.slice(0, 3).map((enrollment: any) => (
                  <div
                    key={enrollment.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => navigate('/admissions/enrollments')}
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{enrollment.student_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {enrollment.cohort_name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <div>
                        <p className="text-sm font-medium">{enrollment.status}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(
                            parseISO(enrollment.enrolled_at),
                            "MMM dd, yyyy"
                          )}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  ))}
                {(!enrollments || enrollments.length === 0) && (
                  <p className="text-muted-foreground text-center py-8">
                    {t("dashboard.noEnrollments")}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>
              {user?.role === "ADMIN"
                ? t("dashboard.recentCertificates")
                : user?.role === "STUDENT"
                ? t("dashboard.myCertificates")
                : t("dashboard.recentActivity")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {user?.role === "ADMIN" && (
                <>
                  {certificates && certificates.slice(0, 4).map((cert: any) => (
                    <div
                      key={cert.id}
                      className="flex gap-3 cursor-pointer hover:bg-accent p-2 rounded transition-colors"
                      onClick={() => navigate('/certificates/list')}
                    >
                      <div className="mt-0.5 h-2 w-2 rounded-full bg-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {t("dashboard.certificateIssued")}
                        </p>
                        <p className="text-xs text-muted-foreground">{cert.student_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(parseISO(cert.issued_at), "MMM dd, yyyy")}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!certificates || certificates.length === 0) && (
                    <p className="text-muted-foreground text-center py-8">
                      {t("dashboard.noCertificatesIssued")}
                    </p>
                  )}
                </>
              )}
              {user?.role === "LECTURER" && (
                <>
                  {submissions.slice(0, 4).map((submission: any) => (
                    <div
                      key={submission.id}
                      className="flex gap-3 cursor-pointer hover:bg-accent p-2 rounded transition-colors"
                      onClick={() => navigate('/assessment/submissions')}
                    >
                      <div className="mt-0.5 h-2 w-2 rounded-full bg-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {t("dashboard.newSubmission")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t("dashboard.needsGrading")}
                        </p>
                      </div>
                    </div>
                  ))}
                  {submissions.length === 0 && (
                    <p className="text-muted-foreground text-center py-8">
                      {t("dashboard.noPendingSubmissions")}
                    </p>
                  )}
                </>
              )}
              {user?.role === "STUDENT" && (
                <>
                  {certificates.filter((c: any) => c.student === user?.id).slice(0, 4).map((cert: any) => (
                    <div
                      key={cert.id}
                      className="flex gap-3 cursor-pointer hover:bg-accent p-2 rounded transition-colors"
                      onClick={() => navigate('/certificates/list')}
                    >
                      <div className="mt-0.5 h-2 w-2 rounded-full bg-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {t("dashboard.certificateEarned")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(parseISO(cert.issued_at), "MMM dd, yyyy")}
                        </p>
                      </div>
                    </div>
                  ))}
                  {certificates.filter((c: any) => c.student === user?.id)
                    .length === 0 && (
                    <p className="text-muted-foreground text-center py-8">
                      {t("dashboard.noCertificates")}
                    </p>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
