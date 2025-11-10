import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Clock, Download } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useQuery } from '@tanstack/react-query';
import { getWorkLogs, exportPayroll } from '@/api/endpoints/timekeeping';
import { saveAs } from 'file-saver';
import { useToast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/errors';

export default function WorkLogs() {
  const { user } = useAuthStore();
  const { toast } = useToast();

  const { data } = useQuery({
    queryKey: ['worklogs'],
    queryFn: async () => {
      const res = await getWorkLogs();
      // API may return either {results:[]} or [] depending on pagination
      const list = Array.isArray(res) ? res : res.results || [];
      return list;
    },
  });
  const workLogs = data || [];

  const totalHours = workLogs.reduce((sum: number, wl: any) => sum + wl.minutes / 60, 0);

  const handleExport = async () => {
    try {
      const blob = await exportPayroll();
      saveAs(blob, 'payroll.csv');
    } catch (e) {
      toast({ title: 'Export failed', description: getErrorMessage(e), variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Work Logs</h2>
          <p className="text-muted-foreground">Track your teaching hours and earnings</p>
        </div>
        <div className="flex gap-2">
          {user?.role === 'ADMIN' && (
            <Button variant="outline" onClick={handleExport}>
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Work Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workLogs.map((log: any) => (
              <div key={log.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{log.session ?? 'Manual'}</p>
                    <p className="text-sm text-muted-foreground">{new Date(log.start_at).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-medium">{(log.minutes / 60).toFixed(2)}h</p>
                  </div>
                  <Badge variant="secondary">{log.source}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
