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

export default function Dashboard() {

  const { user } = useAuthStore();

  const { data: cohorts } = useQuery({
    queryKey: ['cohorts'],
    queryFn: () => getCohorts(),
  });

  const { data: enrollments } = useQuery({
    queryKey: ['enrollments'],
    queryFn: () => getEnrollments(),
  });

  const { data: certificates } = useQuery({
    queryKey: ['certificates'],
    queryFn: () => getCertificates(),
  });

  const { data: mySessions } = useQuery({
    queryKey: ['my-sessions-dashboard'],
    queryFn: () => getMySessions(),
    enabled: user?.role === 'LECTURER',
  });

  const { data: attendanceRecords } = useQuery({
    queryKey: ['attendance'],
    queryFn: () => getAttendanceRecords(),
  });

  let attendanceRate = '0%';

  if (attendanceRecords && attendanceRecords.length > 0) {
    const presentStatuses = ['PRESENT', 'LATE', 'EXCUSED'];

    let relevantRecords = attendanceRecords;

    if (user?.role === 'LECTURER' && mySessions) {
      const lecturerSessionIds = new Set(mySessions.map((s) => s.id));
      relevantRecords = attendanceRecords.filter((r) => lecturerSessionIds.has(r.session));
    }

    if (user?.role === 'STUDENT') {
      relevantRecords = attendanceRecords.filter((r) => r.student === user.id);
    }

    const total = relevantRecords.length;
    const attended = relevantRecords.filter((r) => presentStatuses.includes(r.status)).length;

    const rate = total === 0 ? 0 : Math.round((attended / total) * 100);
    attendanceRate = `${rate}%`;
  }

  const activeStudentsCount = enrollments?.filter((e) => e.status === 'ACTIVE').length || 0;

  const totalStudentsCount = enrollments?.length || 0;

  const activeCohorts =
    cohorts?.filter((c) => c.status === 'ACTIVE').length || 0;

  const certificatesIssued =
    certificates?.filter((c) => c.status === 'ISSUED').length || 0;


  

  // Get upcoming sessions for lecturer
  const upcomingSessions = mySessions
    ?.filter((session) => {
      const sessionDate = parseISO(session.date);
      return isToday(sessionDate) || isTomorrow(sessionDate);
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.start_time}`);
      const dateB = new Date(`${b.date}T${b.start_time}`);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 3) || [];

  const stats = [
    {
      title: user?.role === 'ADMIN' ? 'Total Students' : 'Active Students',
      // FIX: Admin sees total students, others see active students.
      value: (user?.role === 'ADMIN'
        ? totalStudentsCount
        : activeStudentsCount
      ).toString(),
      change: '+12%', // still placeholder
      icon: Users,
      trend: 'up' as const,
    },
    {
      title: 'Active Cohorts',
      value: activeCohorts.toString(),
      change: '+3', // placeholder
      icon: BookOpen,
      trend: 'up' as const,
    },
    {
      title: 'Attendance Rate',
      value: attendanceRate,
      change: '+2%',
      icon: ClipboardCheck,
      trend: 'up',
    },
    {
      title: 'Certificates Issued',
      value: certificatesIssued.toString(),
      // Placeholder: simple "growth" number derived from count
      change: `+${Math.floor(certificatesIssued * 0.08)}`,
      icon: Award,
      trend: 'up' as const,
    },
  ]

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
