import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Clock, Download, Eye } from 'lucide-react';
import { exampleWorkLogs } from '@/utils/exampleData';
import { ExampleBanner } from '@/components/ExampleBanner';
import { useAuthStore } from '@/store/authStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWorkLogs, exportPayroll, createWorkLog } from '@/api/endpoints/timekeeping';
import { saveAs } from 'file-saver';
import { useToast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/errors';
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { getUsers } from '@/api/endpoints/auth';

export default function WorkLogs() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    start_at: '',
    end_at: '',
    notes: '',
    lecturer: '',
    minutes: '',
  });

  const [lecturers, setLecturers] = useState<any[]>([]);
  const [lecturersLoading, setLecturersLoading] = useState(false);

  useEffect(() => {
    setLecturersLoading(true);
    getUsers('LECTURER')
      .then((data) => setLecturers(data))
      .catch(() => setLecturers([]))
      .finally(() => setLecturersLoading(false));
  }, []);

  const { data } = useQuery({
    queryKey: ['worklogs'],
    queryFn: async () => {
      // Lecturers should only see their own work logs
      const params = user?.role === 'LECTURER' ? { lecturer: user.id } : {};
      const res = await getWorkLogs(params);
      // API may return either {results:[]} or [] depending on pagination
      const list = Array.isArray(res) ? res : res.results || [];
      return list;
    },
  });
  const workLogs = data || [];
  const displayWorkLogs = workLogs.length === 0 ? exampleWorkLogs.slice(0, 1) : workLogs;

  const createMutation = useMutation({
    mutationFn: createWorkLog,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['worklogs'] });
      toast({ title: 'Success', description: 'Work log created successfully' });
      setIsDialogOpen(false);
      setFormData({ start_at: '', end_at: '', notes: '', lecturer: '', minutes: '' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const totalMinutes = displayWorkLogs.reduce(
    (sum: number, wl: any) => sum + wl.minutes,
    0
  );

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  const formatted = `${hours}h ${minutes}m`;


  const handleExport = async () => {
    try {
      const blob = await exportPayroll();
      saveAs(blob, 'payroll.csv');
    } catch (e) {
      toast({ title: 'Export failed', description: getErrorMessage(e), variant: 'destructive' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Auto-populate lecturer ID for lecturers
    const lecturerId = user?.role === 'LECTURER' ? user.id : formData.lecturer;

    if (!formData.start_at || !formData.end_at || !lecturerId || !formData.minutes) {
      toast({ title: 'Error', description: 'Start, end times, lecturer, and minutes are required', variant: 'destructive' });
      return;
    }
    createMutation.mutate({
      ...formData,
      lecturer: lecturerId,
      minutes: Number(formData.minutes),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between worklogs_header_wrapper">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Work Logs</h2>
          <p className="text-muted-foreground">Track your teaching hours and earnings</p>
        </div>
        <div className="flex gap-2 worklogs_btn_wrapper">
          {user?.role === 'ADMIN' && (
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export Payroll
            </Button>
          )}
          <div className="flex gap-2">
            <Button onClick={() => setIsDialogOpen(true)} className='log_hours_btn'>
              <Plus className="mr-2 h-4 w-4" />
              Log Hours
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatted}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {workLogs.length === 0 && <ExampleBanner />}
      <Card>
        <CardHeader>
          <CardTitle>Recent Work Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {displayWorkLogs.map((log: any) => (
              <div key={log.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 worklogs_icon">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{log.session ?? 'Manual'}</p>
                    <p className="text-sm text-muted-foreground">{new Date(log.start_at).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 worklogs_right_side">
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Hours</DialogTitle>
            <DialogDescription>Record manual work hours</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              {/* Only show lecturer dropdown for admins */}
              {user?.role === 'ADMIN' && (
                <div className="space-y-2">
                  <Label htmlFor="lecturer">Lecturer *</Label>
                  <Select
                    value={formData.lecturer}
                    onValueChange={(value) => setFormData({ ...formData, lecturer: value })}
                    disabled={lecturersLoading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={lecturersLoading ? "Loading..." : "Select a lecturer"} />
                    </SelectTrigger>
                    <SelectContent>
                      {!lecturersLoading && lecturers.length === 0 && (
                        <div className="px-3 py-2 text-sm text-muted-foreground">No lecturers found</div>
                      )}
                      {!lecturersLoading &&
                        lecturers.map((lect: any) => (
                          <SelectItem key={lect.id} value={lect.id}>
                            {lect.first_name} {lect.last_name} ({lect.email})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="minutes">Minutes *</Label>
                <Input
                  id="minutes"
                  type="number"
                  min="1"
                  value={formData.minutes}
                  onChange={(e) => setFormData({ ...formData, minutes: e.target.value })}
                  required
                  placeholder="Enter minutes worked"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="start_at">Start Time *</Label>
                <Input
                  id="start_at"
                  type="datetime-local"
                  value={formData.start_at}
                  onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_at">End Time *</Label>
                <Input
                  id="end_at"
                  type="datetime-local"
                  value={formData.end_at}
                  onChange={(e) => setFormData({ ...formData, end_at: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  placeholder="Optional notes about this work session"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Log Hours'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
