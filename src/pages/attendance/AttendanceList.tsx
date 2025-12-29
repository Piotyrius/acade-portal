import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, ClipboardCheck, Plus, Edit, Users, Eye } from 'lucide-react';
import { exampleAttendance } from '@/utils/exampleData';
import { ExampleBanner } from '@/components/ExampleBanner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAttendanceRecords,
  createAttendanceRecord,
  updateAttendanceRecord,
  bulkMarkAttendance,
} from '@/api/endpoints/attendance';
import { getSessions } from '@/api/endpoints/catalog';
import { getEnrollments } from '@/api/endpoints/admissions';
import { getUsers } from '@/api/endpoints/auth';
import { useAuthStore } from '@/store/authStore';
import { useEffect, useState } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function AttendanceList() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const { t } = useTranslation('common');
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [formData, setFormData] = useState({
    session: '',
    student: '',
    status: 'PRESENT' as 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED',
    note: '',
  });
  const [bulkFormData, setBulkFormData] = useState({
    session: '',
    records: [] as Array<{ student_id: string; status: string; note?: string }>,
  });

  // Initialize cohort search from URL (?cohort=ID) when coming from Cohorts/Teaching flows
  useEffect(() => {
    const cohortId = searchParams.get('cohort');
    if (cohortId) {
      setSearchTerm(cohortId);
    }
  }, [searchParams]);

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['attendance'],
    queryFn: () => getAttendanceRecords(undefined, undefined),
    staleTime: 2 * 60 * 1000, // 2 minutes for attendance data
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => getSessions(undefined),
    staleTime: 5 * 60 * 1000, // 5 minutes for session data
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => getUsers('STUDENT'),
    enabled: user?.role === 'ADMIN' || user?.role === 'LECTURER',
  });

  const createMutation = useMutation({
    mutationFn: createAttendanceRecord,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attendance'] });
      toast({
        title: t('common:pages.attendanceToastCreateTitle'),
        description: t('common:pages.attendanceToastCreateDescription'),
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: t('common:pages.attendanceToastErrorTitle'),
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateAttendanceRecord(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attendance'] });
      toast({
        title: t('common:pages.attendanceToastUpdateTitle'),
        description: t('common:pages.attendanceToastUpdateDescription'),
      });
      setIsDialogOpen(false);
      setEditingRecord(null);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: t('common:pages.attendanceToastErrorTitle'),
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    },
  });

  const bulkMutation = useMutation({
    mutationFn: bulkMarkAttendance,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['attendance'] });
      toast({
        title: t('common:pages.attendanceBulkToastTitle'),
        description: t('common:pages.attendanceBulkToastDescription', {
          created: data.created,
          updated: data.updated,
        }),
      });
      setIsBulkDialogOpen(false);
      setBulkFormData({ session: '', records: [] });
    },
    onError: (error) => {
      toast({
        title: t('common:pages.attendanceToastErrorTitle'),
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({ session: '', student: '', status: 'PRESENT', note: '' });
  };

  const handleOpenDialog = (record?: any) => {
    if (record) {
      setEditingRecord(record);
      setFormData({
        session: record.session,
        student: record.student,
        status: record.status,
        note: record.note || '',
      });
    } else {
      setEditingRecord(null);
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleOpenBulkDialog = () => {
    setBulkFormData({ session: '', records: [] });
    setIsBulkDialogOpen(true);
  };

  const handleBulkSessionChange = (sessionId: string) => {
    setBulkFormData({ ...bulkFormData, session: sessionId });
    // Get enrollments for the session's cohort
    const session = sessions.find((s: any) => s.id === sessionId);
    if (session) {
      // We'll need to get enrollments for the cohort
      // For now, use all students
      setBulkFormData({
        session: sessionId,
        records: students.map((s: any) => ({
          student_id: s.id,
          status: 'PRESENT',
          note: '',
        })),
      });
    }
  };

  const handleBulkStatusChange = (studentId: string, status: string) => {
    setBulkFormData({
      ...bulkFormData,
      records: bulkFormData.records.map((r) =>
        r.student_id === studentId ? { ...r, status } : r
      ),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.session || !formData.student) {
      toast({
        title: t('common:pages.attendanceToastErrorTitle'),
        description: t('common:pages.attendanceErrorSessionStudentRequired'),
        variant: 'destructive',
      });
      return;
    }

    const payload = {
      session: formData.session,
      student: formData.student,
      status: formData.status,
      note: formData.note || undefined,
    };

    if (editingRecord) {
      updateMutation.mutate({ id: editingRecord.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkFormData.session || bulkFormData.records.length === 0) {
      toast({
        title: t('common:pages.attendanceToastErrorTitle'),
        description: t('common:pages.attendanceErrorBulkRequired'),
        variant: 'destructive',
      });
      return;
    }

    bulkMutation.mutate({
      session_id: bulkFormData.session,
      records: bulkFormData.records,
    });
    
  };

  const displayRecords = records.length === 0 ? exampleAttendance.slice(0, 1) : records;
  const filteredRecords = displayRecords.filter((record: any) => {
    const session = sessions.find((s) => s.id === record.session);
    return searchTerm === '' || session?.cohort?.toString().includes(searchTerm) || record.student_name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return 'default';
      case 'ABSENT':
        return 'destructive';
      case 'LATE':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-9 w-40 bg-muted animate-pulse rounded" />
            <div className="h-5 w-64 bg-muted animate-pulse rounded mt-2" />
          </div>
          <div className="h-10 w-40 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between attendance_header_wrapper">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('common:pages.attendanceTitle')}</h2>
          <p className="text-muted-foreground">{t('common:pages.attendanceSubtitle')}</p>
        </div>
        <div className="flex gap-2 attendance_btn_wrapper">
          {(user?.role === 'ADMIN' || user?.role === 'LECTURER') && (
            <>
              <Button className='attendance_button' variant="outline" onClick={handleOpenBulkDialog}>
                <Users className="mr-2 h-4 w-4" />
                {t('common:pages.attendanceBulkMark')}
              </Button>
              <Button className='attendance_button' onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                {t('common:pages.attendanceMarkSingle')}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm attendance_input_wrapper">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('common:pages.attendanceSearchPlaceholder')}
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {records.length === 0 && <ExampleBanner />}
      <Card>
        <CardHeader>
          <CardTitle>{t('common:pages.attendanceCardTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 attendance_table_wrapper">
            
            <table className='attendance_table'>
                <thead>
                  <tr>

                    <th>{t('common:pages.attendanceColumnStudent')}</th>
                    <th>{t('common:pages.attendanceColumnSession')}</th>
                    <th>{t('common:pages.attendanceColumnStatus')}</th>
                    <th>{t('common:pages.attendanceColumnNote')}</th>
                    <th>{t('common:pages.attendanceColumnAction')}</th>

                  </tr>
                </thead>

                <tbody>


                {filteredRecords.map((record: any) => {
                  const session = sessions.find((s) => s.id === record.session);
                  const student = students.find((s: any) => s.id === record.student);
                  return (
                      <tr key={record.id}>

                        <td>
                          {(record.student || record.student_id) ? (
                            <button
                              onClick={() => navigate(`/users/${record.student || record.student_id}`)}
                              className="font-medium hover:text-primary hover:underline cursor-pointer text-left"
                            >
                              {student ? `${student.first_name} ${student.last_name}` : record.student_name || record.student || record.student_id}
                            </button>
                          ) : (
                            <p className="font-medium"> {student ? `${student.first_name} ${student.last_name}` : record.student_name || record.student} </p>
                          )}
                        </td>

                        <td>
                          <p className="text-sm text-muted-foreground">
                           {t('common:pages.attendanceSessionLabel')}:{' '}
                           {session ? new Date(session.start_at).toLocaleString() : t('common:pages.attendanceSessionUnknown')}{' '}
                           •{' '}
                           {new Date(record.marked_at).toLocaleDateString()}
                          </p>
                        </td>

                        <td>
                          <Badge variant={getStatusVariant(record.status)}>
                            {record.status_display ||
                              t(
                                `common:pages.attendanceStatus_${record.status as 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'}`,
                              )}
                          </Badge>
                        </td>

                        
                        <td>
                            {record.note && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {t('common:pages.attendanceNoteLabel')}: {record.note}
                              </p>
                            )}
                        </td>

                        <td>
                          {(user?.role === 'ADMIN' || user?.role === 'LECTURER') && (
                            <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(record)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </td>

                      </tr>
                  )
                })}
              
              </tbody>

            </table>

          </div>
          {filteredRecords.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              {searchTerm
                ? t('common:pages.attendanceNoneFoundSearch')
                : t('common:pages.attendanceNoneFoundDefault')}
            </div>
          )}
        </CardContent>
      </Card>

      {(user?.role === 'ADMIN' || user?.role === 'LECTURER') && (
        <>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingRecord
                    ? t('common:pages.attendanceDialogTitleEdit')
                    : t('common:pages.attendanceDialogTitleCreate')}
                </DialogTitle>
                <DialogDescription>
                  {editingRecord
                    ? t('common:pages.attendanceDialogDescriptionEdit')
                    : t('common:pages.attendanceDialogDescriptionCreate')}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="session">{t('common:pages.attendanceFieldSession')} *</Label>
                    <Select
                      value={formData.session}
                      onValueChange={(value) => setFormData({ ...formData, session: value })}
                      disabled={!!editingRecord}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('common:pages.attendanceFieldSessionPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {sessions.map((session: any) => (
                          <SelectItem key={session.id} value={session.id}>
                            {new Date(session.start_at).toLocaleString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student">{t('common:pages.attendanceFieldStudent')} *</Label>
                    <Select
                      value={formData.student}
                      onValueChange={(value) => setFormData({ ...formData, student: value })}
                      disabled={!!editingRecord}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('common:pages.attendanceFieldStudentPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((student: any) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.first_name} {student.last_name} ({student.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">{t('common:pages.attendanceFieldStatus')} *</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED') =>
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PRESENT">
                          {t('common:pages.attendanceStatus_PRESENT')}
                        </SelectItem>
                        <SelectItem value="LATE">
                          {t('common:pages.attendanceStatus_LATE')}
                        </SelectItem>
                        <SelectItem value="ABSENT">
                          {t('common:pages.attendanceStatus_ABSENT')}
                        </SelectItem>
                        <SelectItem value="EXCUSED">
                          {t('common:pages.attendanceStatus_EXCUSED')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="note">{t('common:pages.attendanceFieldNote')}</Label>
                    <Textarea
                      id="note"
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      rows={3}
                      placeholder={t('common:pages.attendanceFieldNotePlaceholder')}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    {t('common:pages.attendanceCancel')}
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingRecord
                      ? updateMutation.isPending
                        ? t('common:pages.attendanceButtonUpdating')
                        : t('common:pages.attendanceButtonUpdate')
                      : createMutation.isPending
                        ? t('common:pages.attendanceButtonCreating')
                        : t('common:pages.attendanceButtonCreate')}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{t('common:pages.attendanceBulkDialogTitle')}</DialogTitle>
                <DialogDescription>
                  {t('common:pages.attendanceBulkDialogDescription')}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleBulkSubmit}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="bulk_session">
                      {t('common:pages.attendanceFieldSession')} *
                    </Label>
                    <Select value={bulkFormData.session} onValueChange={handleBulkSessionChange}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('common:pages.attendanceFieldSessionPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {sessions.map((session: any) => (
                          <SelectItem key={session.id} value={session.id}>
                            {new Date(session.start_at).toLocaleString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {bulkFormData.session && (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      <Label>{t('common:pages.attendanceBulkStudentsLabel')}</Label>
                      <div className="space-y-2">
                        {bulkFormData.records.map((record) => {
                          const student = students.find((s: any) => s.id === record.student_id);
                          return (
                            <div key={record.student_id} className="flex items-center justify-between p-2 border rounded">
                              <div className="flex items-center gap-2">
                                <Checkbox checked={true} />
                                <span>
                                  {student ? `${student.first_name} ${student.last_name}` : record.student_id}
                                </span>
                              </div>
                              <Select
                                value={record.status}
                                onValueChange={(value) => handleBulkStatusChange(record.student_id, value)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="PRESENT">
                                    {t('common:pages.attendanceStatus_PRESENT')}
                                  </SelectItem>
                                  <SelectItem value="LATE">
                                    {t('common:pages.attendanceStatus_LATE')}
                                  </SelectItem>
                                  <SelectItem value="ABSENT">
                                    {t('common:pages.attendanceStatus_ABSENT')}
                                  </SelectItem>
                                  <SelectItem value="EXCUSED">
                                    {t('common:pages.attendanceStatus_EXCUSED')}
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsBulkDialogOpen(false)}>
                    {t('common:pages.attendanceCancel')}
                  </Button>
                  <Button type="submit" disabled={bulkMutation.isPending || !bulkFormData.session}>
                    {bulkMutation.isPending
                      ? t('common:pages.attendanceBulkButtonMarking')
                      : t('common:pages.attendanceBulkButtonMark')}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
