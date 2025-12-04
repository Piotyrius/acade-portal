import { useAuthStore } from '@/store/authStore';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, ClipboardCheck, Award, TrendingUp, Calendar } from 'lucide-react';
import { getCohorts } from '@/api/endpoints/catalog';
import { getEnrollments } from '@/api/endpoints/admissions';
import { getCertificates } from '@/api/endpoints/certificates';
import { getMySessions } from '@/api/endpoints/catalog';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { getAttendanceRecords } from '@/api/endpoints/attendance';

function getPercentChange(current: number, previous: number) {
  if (previous === 0) return '+0%';
  const change = ((current - previous) / previous) * 100;
  const rounded = Math.round(change);
  return `${rounded > 0 ? '+' : ''}${rounded}%`;
}

export default function Dashboard() {

  const { user } = useAuthStore();

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
    countThisMonth(enrollments, 'enrolled_at'),
    countLastMonth(enrollments, 'enrolled_at')
  );

  const cohortsChange = getPercentChange(
    countThisMonth(cohorts, 'created_at'),
    countLastMonth(cohorts, 'created_at')
  );

  const certificatesChange = getPercentChange(
    countThisMonth(certificates, 'issued_at'),
    countLastMonth(certificates, 'issued_at')
  );


  const presentStatuses = ['PRESENT', 'LATE', 'EXCUSED'];

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


  const stats = [
    {
      title: user?.role === 'ADMIN' ? 'Total Students' : 'Active Students',
      value: (user?.role === 'ADMIN' ? totalStudentsCount : activeStudentsCount).toString(),
      change: studentsChange,
      icon: Users,
      trend: 'up' as const,
    },
    {
      title: 'Active Cohorts',
      value: activeCohorts.toString(),
      change: cohortsChange,
      icon: BookOpen,
      trend: 'up' as const,
    },
    {
      title: 'Attendance Rate',
      value: attendanceRate,
      change: attendanceChange,
      icon: ClipboardCheck,
      trend: 'up' as const,
    },
    {
      title: 'Certificates Issued',
      value: certificatesIssued.toString(),
      change: certificatesChange,
      icon: Award,
      trend: 'up' as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          {user?.role === 'ADMIN' && 'Overview of your academy'}
          {user?.role === 'LECTURER' && 'Your teaching schedule and students'}
          {user?.role === 'STUDENT' && 'Your learning progress'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-success" />
                <span className="text-success">{stat.change}</span> from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>
              {user?.role === 'LECTURER' ? 'My Upcoming Sessions' : 'Recent Enrollments'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user?.role === 'LECTURER' ? (
              <div className="space-y-4">
                {upcomingSessions.length > 0 ? (
                  upcomingSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{session.cohort_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {isToday(parseISO(session.date)) ? 'Today' : 'Tomorrow'},{' '}
                            {session.start_time}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {session.location || 'No location'}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No upcoming sessions
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {enrollments && enrollments.slice(0, 3).map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg"
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
                    <div className="text-right">
                      <p className="text-sm font-medium">{enrollment.status}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(enrollment.enrolled_at), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                ))}
                {(!enrollments || enrollments.length === 0) && (
                  <p className="text-muted-foreground text-center py-8">
                    No enrollments yet
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Certificates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {certificates && certificates.slice(0, 4).map((cert) => (
                <div key={cert.id} className="flex gap-3">
                  <div className="mt-0.5 h-2 w-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Certificate Issued</p>
                    <p className="text-xs text-muted-foreground">{cert.student_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(parseISO(cert.issued_at), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              ))}
              {(!certificates || certificates.length === 0) && (
                <p className="text-muted-foreground text-center py-8">
                  No certificates issued yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
