import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Clock, Download } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWorkLogs, exportPayroll, createWorkLog } from '@/api/endpoints/timekeeping';
import { saveAs } from 'file-saver';
import { useToast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/errors';
import { useState } from 'react';
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

export default function WorkLogs() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    start_at: '',
    end_at: '',
    notes: '',
  });

  // Mock data for preview
  const mockWorkLogs = [
    { id: '1', lecturer: 'lect-1', session: 'sess-1', start_at: '2024-03-05T19:00:00Z', end_at: '2024-03-05T21:00:00Z', minutes: 120, source: 'SESSION' as const, notes: 'Network Security class' },
    { id: '2', lecturer: 'lect-1', session: 'sess-2', start_at: '2024-03-07T19:00:00Z', end_at: '2024-03-07T21:00:00Z', minutes: 120, source: 'SESSION' as const, notes: 'Network Security class' },
    { id: '3', lecturer: 'lect-1', session: null, start_at: '2024-03-08T14:00:00Z', end_at: '2024-03-08T16:00:00Z', minutes: 120, source: 'MANUAL' as const, notes: 'Grading assignments and preparing materials' },
    { id: '4', lecturer: 'lect-1', session: 'sess-3', start_at: '2024-03-09T18:00:00Z', end_at: '2024-03-09T20:00:00Z', minutes: 120, source: 'SESSION' as const, notes: 'Ethical Hacking class' },
  ];

  const { data } = useQuery({
    queryKey: ['worklogs'],
    queryFn: async () => {
      const res = await getWorkLogs();
      // API may return either {results:[]} or [] depending on pagination
      const list = Array.isArray(res) ? res : res.results || [];
      return list;
    },
  });
  const workLogs = data || mockWorkLogs;

  const createMutation = useMutation({
    mutationFn: createWorkLog,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['worklogs'] });
      toast({ title: 'Success', description: 'Work log created successfully' });
      setIsDialogOpen(false);
      setFormData({ start_at: '', end_at: '', notes: '' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const totalHours = workLogs.reduce((sum: number, wl: any) => sum + wl.minutes / 60, 0);

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
    if (!formData.start_at || !formData.end_at) {
      toast({ title: 'Error', description: 'Start and end times are required', variant: 'destructive' });
      return;
    }
    createMutation.mutate(formData);
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
          <Button onClick={() => setIsDialogOpen(true)}>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Hours</DialogTitle>
            <DialogDescription>Record manual work hours</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
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
