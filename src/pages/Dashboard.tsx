import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, ClipboardCheck, Award, TrendingUp, Calendar } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuthStore();

  const stats = [
    {
      title: 'Total Students',
      value: '1,234',
      change: '+12%',
      icon: Users,
      trend: 'up',
    },
    {
      title: 'Active Courses',
      value: '48',
      change: '+3',
      icon: BookOpen,
      trend: 'up',
    },
    {
      title: 'Attendance Rate',
      value: '87%',
      change: '+2%',
      icon: ClipboardCheck,
      trend: 'up',
    },
    {
      title: 'Certificates Issued',
      value: '234',
      change: '+18',
      icon: Award,
      trend: 'up',
    },
  ];

  const upcomingSessions = [
    { course: 'Web Development Basics', time: 'Today, 2:00 PM', students: 24 },
    { course: 'Advanced React', time: 'Tomorrow, 10:00 AM', students: 18 },
    { course: 'Python for Data Science', time: 'Tomorrow, 3:00 PM', students: 32 },
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
            <CardTitle>Upcoming Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingSessions.map((session, i) => (
                <div key={i} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{session.course}</p>
                      <p className="text-sm text-muted-foreground">{session.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{session.students} students</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: 'New enrollment', detail: 'Sarah Johnson enrolled in Web Dev', time: '2 hours ago' },
                { action: 'Certificate issued', detail: 'React Basics completion', time: '5 hours ago' },
                { action: 'Attendance marked', detail: 'Advanced Python class', time: 'Yesterday' },
                { action: 'Grade submitted', detail: 'Final exam results', time: '2 days ago' },
              ].map((activity, i) => (
                <div key={i} className="flex gap-3">
                  <div className="mt-0.5 h-2 w-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.detail}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
