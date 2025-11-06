import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Clock, Download } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function WorkLogs() {
  const { user } = useAuthStore();

  const workLogs = [
    { id: 1, date: '2024-01-15', course: 'React Basics', hours: 3, rate: 50, status: 'Approved' },
    { id: 2, date: '2024-01-14', course: 'Python Fundamentals', hours: 2.5, rate: 50, status: 'Approved' },
    { id: 3, date: '2024-01-13', course: 'Advanced JavaScript', hours: 4, rate: 50, status: 'Pending' },
    { id: 4, date: '2024-01-12', course: 'React Basics', hours: 3, rate: 50, status: 'Approved' },
  ];

  const totalHours = workLogs.reduce((sum, log) => sum + log.hours, 0);
  const totalEarnings = workLogs
    .filter(log => log.status === 'Approved')
    .reduce((sum, log) => sum + (log.hours * log.rate), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Work Logs</h2>
          <p className="text-muted-foreground">Track your teaching hours and earnings</p>
        </div>
        <div className="flex gap-2">
          {user?.role === 'ADMIN' && (
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Payroll
            </Button>
          )}
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Log Hours
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours}h</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Approved Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalEarnings}</div>
            <p className="text-xs text-muted-foreground">Ready for payment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workLogs.filter(l => l.status === 'Pending').length}
            </div>
            <p className="text-xs text-muted-foreground">Work logs</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Work Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{log.course}</p>
                    <p className="text-sm text-muted-foreground">{log.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-medium">{log.hours}h</p>
                    <p className="text-sm text-muted-foreground">${log.hours * log.rate}</p>
                  </div>
                  <Badge variant={log.status === 'Approved' ? 'default' : 'secondary'}>
                    {log.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
