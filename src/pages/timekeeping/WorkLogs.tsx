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
import { useTranslation } from 'react-i18next';

export default function WorkLogs() {
  const { t } = useTranslation('common');
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
      toast({
        title: t('pages.workLogsCreateSuccessTitle'),
        description: t('pages.workLogsCreateSuccessDescription'),
      });
      setIsDialogOpen(false);
      setFormData({ start_at: '', end_at: '', notes: '', lecturer: '', minutes: '' });
    },
    onError: (error) => {
      toast({
        title: t('pages.workLogsCreateErrorTitle'),
        description: getErrorMessage(error),
        variant: 'destructive',
      });
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
      toast({
        title: t('pages.workLogsExportErrorTitle'),
        description: getErrorMessage(e),
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Auto-populate lecturer ID for lecturers
    const lecturerId = user?.role === 'LECTURER' ? user.id : formData.lecturer;

    if (!formData.start_at || !formData.end_at || !lecturerId || !formData.minutes) {
      toast({
        title: t('pages.workLogsCreateErrorTitle'),
        description: t('pages.workLogsCreateErrorMissing'),
        variant: 'destructive',
      });
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
          <h2 className="text-3xl font-bold tracking-tight">
            {t('pages.workLogsTitle')}
          </h2>
          <p className="text-muted-foreground">
            {t('pages.workLogsSubtitle')}
          </p>
        </div>
        <div className="flex gap-2 worklogs_btn_wrapper">
          {user?.role === 'ADMIN' && (
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              {t('pages.workLogsExportPayroll')}
            </Button>
          )}
          <div className="flex gap-2">
            <Button onClick={() => setIsDialogOpen(true)} className='log_hours_btn'>
              <Plus className="mr-2 h-4 w-4" />
              {t('pages.workLogsLogHours')}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              {t('pages.workLogsTotalHoursTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatted}</div>
            <p className="text-xs text-muted-foreground">
              {t('pages.workLogsTotalHoursThisMonth')}
            </p>
          </CardContent>
        </Card>
      </div>

      {workLogs.length === 0 && <ExampleBanner />}
      <Card>
        <CardHeader>
          <CardTitle>{t('pages.workLogsRecentTitle')}</CardTitle>
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
                    <p className="font-medium">
                      {log.session ?? t('pages.workLogsSessionManual')}
                    </p>
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
            <DialogTitle>{t('pages.workLogsDialogTitle')}</DialogTitle>
            <DialogDescription>{t('pages.workLogsDialogDescription')}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              {/* Only show lecturer dropdown for admins */}
              {user?.role === 'ADMIN' && (
                <div className="space-y-2">
                  <Label htmlFor="lecturer">
                    {t('pages.workLogsLecturerLabel')} *
                  </Label>
                  <Select
                    value={formData.lecturer}
                    onValueChange={(value) => setFormData({ ...formData, lecturer: value })}
                    disabled={lecturersLoading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          lecturersLoading
                            ? t('pages.workLogsLecturerPlaceholderLoading')
                            : t('pages.workLogsLecturerPlaceholderSelect')
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {!lecturersLoading && lecturers.length === 0 && (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          {t('pages.workLogsLecturerNone')}
                        </div>
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
                <Label htmlFor="minutes">
                  {t('pages.workLogsMinutesLabel')} *
                </Label>
                <Input
                  id="minutes"
                  type="number"
                  min="1"
                  value={formData.minutes}
                  onChange={(e) => setFormData({ ...formData, minutes: e.target.value })}
                  required
                  placeholder={t('pages.workLogsMinutesPlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="start_at">
                  {t('pages.workLogsStartTimeLabel')} *
                </Label>
                <Input
                  id="start_at"
                  type="datetime-local"
                  value={formData.start_at}
                  onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_at">
                  {t('pages.workLogsEndTimeLabel')} *
                </Label>
                <Input
                  id="end_at"
                  type="datetime-local"
                  value={formData.end_at}
                  onChange={(e) => setFormData({ ...formData, end_at: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">
                  {t('pages.workLogsNotesLabel')}
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  placeholder={t('pages.workLogsNotesPlaceholder')}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t('pages.workLogsCancel')}
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending
                  ? t('pages.workLogsCreateSubmitting')
                  : t('pages.workLogsCreateCta')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
