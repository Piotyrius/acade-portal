import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, BookOpen, Clock, Award, TrendingUp } from 'lucide-react';
import { getMyCohorts, getMySessions } from '@/api/endpoints/catalog';
import { format, isToday, isTomorrow, parseISO, startOfWeek, endOfWeek } from 'date-fns';

export default function LecturerDashboard() {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 }); // Sunday

  // Get lecturer's cohorts
  const { data: cohorts, isLoading: cohortsLoading } = useQuery({
    queryKey: ['my-cohorts'],
    queryFn: getMyCohorts,
  });

  // Get lecturer's sessions
  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['my-sessions'],
    queryFn: () => getMySessions(),
  });

  // Get this week's sessions
  const { data: weekSessions } = useQuery({
    queryKey: ['my-sessions-week', format(weekStart, 'yyyy-MM-dd'), format(weekEnd, 'yyyy-MM-dd')],
    queryFn: () =>
      getMySessions({
        date_from: format(weekStart, 'yyyy-MM-dd'),
        date_to: format(weekEnd, 'yyyy-MM-dd'),
      }),
  });

  // Calculate upcoming sessions (today and tomorrow)
  const upcomingSessions = sessions?.filter((session) => {
    const sessionDate = parseISO(session.date);
    return isToday(sessionDate) || isTomorrow(sessionDate);
  }) || [];

  // Sort upcoming sessions by date and time
  const sortedUpcoming = [...upcomingSessions].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.start_time}`);
    const dateB = new Date(`${b.date}T${b.start_time}`);
    return dateA.getTime() - dateB.getTime();
  });

  // Calculate stats
  const totalCohorts = cohorts?.length || 0;
  const activeCohorts = cohorts?.filter((c) => c.is_active).length || 0;
  const totalStudents = cohorts?.reduce((sum, cohort) => sum + (cohort.enrollment_count || 0), 0) || 0;
  const weekSessionsCount = weekSessions?.length || 0;

  const getSessionTimeLabel = (session: any) => {
    const sessionDate = parseISO(session.date);
    if (isToday(sessionDate)) return 'Today';
    if (isTomorrow(sessionDate)) return 'Tomorrow';
    return format(sessionDate, 'MMM dd');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lecturer Dashboard</h1>
        <p className="text-muted-foreground">Your teaching schedule and cohorts overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Cohorts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCohorts}</div>
            <p className="text-xs text-muted-foreground">{activeCohorts} active cohorts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">Across all cohorts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weekSessionsCount}</div>
            <p className="text-xs text-muted-foreground">Sessions scheduled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingSessions.length}</div>
            <p className="text-xs text-muted-foreground">Today & tomorrow</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Upcoming Sessions
            </CardTitle>
            <CardDescription>Your sessions for today and tomorrow</CardDescription>
          </CardHeader>
          <CardContent>
            {sessionsLoading ? (
              <p className="text-sm text-muted-foreground">Loading sessions...</p>
            ) : sortedUpcoming.length > 0 ? (
              <div className="space-y-4">
                {sortedUpcoming.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-start justify-between rounded-lg border p-3"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{session.cohort_name || 'Unnamed Cohort'}</p>
                      <p className="text-sm text-muted-foreground">
                        {session.start_time} - {session.end_time}
                      </p>
                      {session.location && (
                        <p className="text-xs text-muted-foreground">📍 {session.location}</p>
                      )}
                    </div>
                    <Badge variant={isToday(parseISO(session.date)) ? 'default' : 'secondary'}>
                      {getSessionTimeLabel(session)}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No upcoming sessions</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Cohorts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              My Cohorts
            </CardTitle>
            <CardDescription>Cohorts you are teaching</CardDescription>
          </CardHeader>
          <CardContent>
            {cohortsLoading ? (
              <p className="text-sm text-muted-foreground">Loading cohorts...</p>
            ) : cohorts && cohorts.length > 0 ? (
              <div className="space-y-3">
                {cohorts.map((cohort) => (
                  <div key={cohort.id} className="flex items-start justify-between rounded-lg border p-3">
                    <div className="space-y-1">
                      <p className="font-medium">{cohort.name}</p>
                      <p className="text-sm text-muted-foreground">{cohort.course_name || 'Course name not available'}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {cohort.enrollment_count || 0} students
                      </div>
                    </div>
                    <Badge variant={cohort.is_active ? 'default' : 'secondary'}>
                      {cohort.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <BookOpen className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No cohorts assigned</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* This Week's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            This Week's Schedule
          </CardTitle>
          <CardDescription>
            {format(weekStart, 'MMM dd')} - {format(weekEnd, 'MMM dd, yyyy')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {weekSessions && weekSessions.length > 0 ? (
            <div className="space-y-2">
              {weekSessions
                .sort((a, b) => {
                  const dateA = new Date(`${a.date}T${a.start_time}`);
                  const dateB = new Date(`${b.date}T${b.start_time}`);
                  return dateA.getTime() - dateB.getTime();
                })
                .map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-sm font-medium">
                          {format(parseISO(session.date), 'EEE')}
                        </p>
                        <p className="text-2xl font-bold">
                          {format(parseISO(session.date), 'dd')}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">{session.cohort_name || 'Unnamed Cohort'}</p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {session.start_time} - {session.end_time}
                          </span>
                          {session.location && <span>📍 {session.location}</span>}
                        </div>
                      </div>
                    </div>
                    {session.status && (
                      <Badge
                        variant={
                          session.status === 'COMPLETED'
                            ? 'default'
                            : session.status === 'CANCELLED'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {session.status}
                      </Badge>
                    )}
                  </div>
                ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Calendar className="mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No sessions scheduled this week</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
