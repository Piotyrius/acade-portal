import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, FileText, Edit, Trash2, Eye, CheckCircle, Send } from 'lucide-react';
import { exampleTimesheets } from '@/utils/exampleData';
import { ExampleBanner } from '@/components/ExampleBanner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTimesheets, createTimesheet, updateTimesheet, deleteTimesheet, TimesheetDto } from '@/api/endpoints/timekeeping';
import { getUsers } from '@/api/endpoints/auth';
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/errors';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Timesheets() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTimesheet, setEditingTimesheet] = useState<TimesheetDto | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [lecturerFilter, setLecturerFilter] = useState<string>('ALL');
  const [formData, setFormData] = useState({
    lecturer: '',
    period_start: '',
    period_end: '',
    status: 'OPEN' as 'OPEN' | 'SUBMITTED' | 'APPROVED' | 'PAID',
  });

  // Mock data for preview
  const mockTimesheets = [
    { id: '1', lecturer: 'lect-1', period_start: '2024-03-01', period_end: '2024-03-15', status: 'SUBMITTED' as const, total_minutes: 2520, amount_minor: 210000, currency: 'USD', submitted_at: '2024-03-16T10:00:00Z', approved_at: null, paid_at: null, created_at: '2024-03-01T00:00:00Z', updated_at: '2024-03-16T10:00:00Z' },
    { id: '2', lecturer: 'lect-2', period_start: '2024-03-01', period_end: '2024-03-15', status: 'APPROVED' as const, total_minutes: 2280, amount_minor: 190000, currency: 'USD', submitted_at: '2024-03-16T09:00:00Z', approved_at: '2024-03-17T14:00:00Z', paid_at: null, created_at: '2024-03-01T00:00:00Z', updated_at: '2024-03-17T14:00:00Z' },
    { id: '3', lecturer: 'lect-1', period_start: '2024-02-15', period_end: '2024-02-29', status: 'PAID' as const, total_minutes: 2400, amount_minor: 200000, currency: 'USD', submitted_at: '2024-03-01T10:00:00Z', approved_at: '2024-03-02T14:00:00Z', paid_at: '2024-03-05T12:00:00Z', created_at: '2024-02-15T00:00:00Z', updated_at: '2024-03-05T12:00:00Z' },
  ];

  const { data: timesheets = mockTimesheets } = useQuery({
    queryKey: ['timesheets', lecturerFilter, statusFilter],
    queryFn: () => {
      const lecturerId = user?.role === 'LECTURER' ? user.id : (lecturerFilter !== 'ALL' ? lecturerFilter : undefined);
      const status = statusFilter !== 'ALL' ? statusFilter : undefined;
      return getTimesheets(lecturerId, status);
    },
  });

  const displayTimesheets = timesheets.length === 0 ? exampleTimesheets.slice(0, 1) : timesheets;

  const { data: lecturers = [] } = useQuery({
    queryKey: ['lecturers'],
    queryFn: () => getUsers('LECTURER'),
    enabled: user?.role === 'ADMIN',
  });

  const createMutation = useMutation({
    mutationFn: createTimesheet,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['timesheets'] });
      toast({ title: 'Success', description: 'Timesheet created successfully' });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TimesheetDto> }) => updateTimesheet(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['timesheets'] });
      toast({ title: 'Success', description: 'Timesheet updated successfully' });
      setIsDialogOpen(false);
      setEditingTimesheet(null);
      resetForm();
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTimesheet,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['timesheets'] });
      toast({ title: 'Success', description: 'Timesheet deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({
      lecturer: user?.role === 'ADMIN' ? '' : user?.id || '',
      period_start: '',
      period_end: '',
      status: 'OPEN',
    });
  };

  const handleOpenDialog = (timesheet?: TimesheetDto) => {
    if (timesheet) {
      setEditingTimesheet(timesheet);
      setFormData({
        lecturer: timesheet.lecturer,
        period_start: timesheet.period_start.split('T')[0],
        period_end: timesheet.period_end.split('T')[0],
        status: timesheet.status,
      });
    } else {
      setEditingTimesheet(null);
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.period_start || !formData.period_end) {
      toast({
        title: 'Error',
        description: 'Period start and end dates are required',
        variant: 'destructive',
      });
      return;
    }

    const payload: any = {
      period_start: formData.period_start,
      period_end: formData.period_end,
      status: formData.status,
    };

    if (user?.role === 'ADMIN' && formData.lecturer) {
      payload.lecturer = formData.lecturer;
    }

    if (editingTimesheet) {
      updateMutation.mutate({ id: editingTimesheet.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this timesheet?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleApprove = (id: string) => {
    updateMutation.mutate({ id, data: { status: 'APPROVED' } });
  };

  const handleSubmit = (id: string) => {
    updateMutation.mutate({ id, data: { status: 'SUBMITTED' } });
  };

  const handleBulkApprove = () => {
    if (selectedIds.length === 0) {
      toast({ title: 'No selection', description: 'Please select timesheets to approve', variant: 'destructive' });
      return;
    }

    Promise.all(selectedIds.map(id => updateTimesheet(id, { status: 'APPROVED' })))
      .then(() => {
        qc.invalidateQueries({ queryKey: ['timesheets'] });
        toast({ title: 'Success', description: `${selectedIds.length} timesheet(s) approved` });
        setSelectedIds([]);
      })
      .catch((error) => {
        toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
      });
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === displayTimesheets.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(displayTimesheets.map((t: TimesheetDto) => t.id));
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'default';
      case 'APPROVED':
        return 'default';
      case 'SUBMITTED':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between timesheets_header_wrapper">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Timesheets</h2>
          <p className="text-muted-foreground">Manage timesheet periods and status</p>
        </div>
        <div className="flex gap-2 timesheet_btn_wrapper">
          {user?.role === 'ADMIN' && selectedIds.length > 0 && (
            <Button onClick={handleBulkApprove} variant="default">
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve Selected ({selectedIds.length})
            </Button>
          )}
          <Button onClick={() => handleOpenDialog()} className='create_timesheet_btn'>
            <Plus className="mr-2 h-4 w-4" />
            Create Timesheet
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            {user?.role === 'ADMIN' && (
              <div className="flex-1 min-w-[200px]">
                <Label>Filter by Lecturer</Label>
                <Select value={lecturerFilter} onValueChange={setLecturerFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Lecturers</SelectItem>
                    {lecturers.map((lect: any) => (
                      <SelectItem key={lect.id} value={lect.id}>
                        {lect.first_name} {lect.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex-1 min-w-[200px]">
              <Label>Filter by Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="SUBMITTED">Submitted</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {timesheets.length === 0 && <ExampleBanner />}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Timesheets</CardTitle>
            {user?.role === 'ADMIN' && displayTimesheets.length > 0 && (
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedIds.length === displayTimesheets.length}
                  onCheckedChange={toggleSelectAll}
                />
                <Label className="text-sm">Select All</Label>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {displayTimesheets.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No timesheets found</p>
            ) : (
              displayTimesheets.map((timesheet: TimesheetDto) => {
                const lecturer = lecturers.find((l: any) => l.id === timesheet.lecturer);
                const hours = (timesheet.total_minutes / 60).toFixed(2);
                const amount = (timesheet.amount_minor / 100).toFixed(2);
                return (
                  <div key={timesheet.id} className="flex items-center justify-between p-4 border border-border rounded-lg  timesheets_item">
                    <div className="flex items-center gap-3">
                      {user?.role === 'ADMIN' && (
                        <Checkbox
                          checked={selectedIds.includes(timesheet.id)}
                          onCheckedChange={() => toggleSelection(timesheet.id)}
                        />
                      )}
                      <div className="rounded-lg bg-primary/10 p-2 timesheets_icon">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {lecturer ? `${lecturer.first_name} ${lecturer.last_name}` : 'Unknown Lecturer'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(timesheet.period_start).toLocaleDateString()} -{' '}
                          {new Date(timesheet.period_end).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {hours}h • {amount} {timesheet.currency}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className='timesheed_icon' variant={getStatusVariant(timesheet.status)}>{timesheet.status}</Badge>

                      {/* Lecturer can submit OPEN timesheets */}
                      {user?.role === 'LECTURER' && timesheet.status === 'OPEN' && (
                        <Button variant="default" size="sm" onClick={() => handleSubmit(timesheet.id)}>
                          <Send className="h-4 w-4 mr-1" />
                          Submit
                        </Button>
                      )}

                      {/* Admin can approve SUBMITTED timesheets */}
                      {user?.role === 'ADMIN' && timesheet.status === 'SUBMITTED' && (
                        <Button variant="default" size="sm" onClick={() => handleApprove(timesheet.id)}>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      )}

                      <Button variant="outline" size="sm" onClick={() => handleOpenDialog(timesheet)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(timesheet.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTimesheet ? 'Edit Timesheet' : 'Create Timesheet'}</DialogTitle>
            <DialogDescription>
              {editingTimesheet ? 'Update the timesheet period and status' : 'Create a new timesheet period'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              {user?.role === 'ADMIN' && (
                <div className="space-y-2">
                  <Label htmlFor="lecturer">Lecturer</Label>
                  <Select
                    value={formData.lecturer}
                    onValueChange={(value) => setFormData({ ...formData, lecturer: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select lecturer" />
                    </SelectTrigger>
                    <SelectContent>
                      {lecturers.map((lecturer: any) => (
                        <SelectItem key={lecturer.id} value={lecturer.id}>
                          {lecturer.first_name} {lecturer.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="period_start">Period Start *</Label>
                <Input
                  id="period_start"
                  type="date"
                  value={formData.period_start}
                  onChange={(e) => setFormData({ ...formData, period_start: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="period_end">Period End *</Label>
                <Input
                  id="period_end"
                  type="date"
                  value={formData.period_end}
                  onChange={(e) => setFormData({ ...formData, period_end: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'OPEN' | 'SUBMITTED' | 'APPROVED' | 'PAID') =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPEN">Open</SelectItem>
                    <SelectItem value="SUBMITTED">Submitted</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingTimesheet
                  ? updateMutation.isPending
                    ? 'Updating...'
                    : 'Update'
                  : createMutation.isPending
                    ? 'Creating...'
                    : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

