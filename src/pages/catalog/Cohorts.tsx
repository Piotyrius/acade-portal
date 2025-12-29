import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Plus,
  Users,
  Edit,
  Trash2,
  Calendar,
  Eye,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  FileCheck,
} from 'lucide-react';
import { exampleCohorts } from '@/utils/exampleData';
import { ExampleBanner } from '@/components/ExampleBanner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCohorts, createCohort, updateCohort, deleteCohort, generateSessions, getCourses, getCohortsReadyToStart, startCohort } from '@/api/endpoints/catalog';
import { getEnrollments } from '@/api/endpoints/admissions';
import { CohortDto, EnrollmentDto } from '@/api/types';
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
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { getInvoices, getPayments, PaymentDto } from '@/api/endpoints/payments';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function isPaidThisMonth(payments: PaymentDto[] | undefined): boolean {
  if (!payments || payments.length === 0) return false;

  const currentMonth = format(new Date(), 'yyyy-MM');

  return payments.some((p) => {
    if (!p.processed_at) return false;
    const paymentMonth = format(new Date(p.processed_at), 'yyyy-MM');
    return p.status === 'COMPLETED' && paymentMonth === currentMonth;
  })
}


function EnrollmentRow({
    enrollment,
    getEnrollmentStatusColor,
  }: {
    enrollment: EnrollmentDto;
    getEnrollmentStatusColor: (status: EnrollmentDto['status']) =>
      'default' | 'destructive' | 'outline' | 'secondary';
  }) {

  const { data: invoices = [], isLoading: loadingInvoices } = useQuery({
    queryKey: ['invoices', enrollment.id],
    queryFn: () => getInvoices({ enrollment: enrollment.id }),
  });

  const invoice = invoices[0];

  const { data: payments = [], isLoading: loadingPayments } = useQuery({
    queryKey: ['payments', invoice?.id],
    queryFn: () => getPayments({ invoice: invoice.id }),
    enabled: !!invoice,
  });

  const paid = isPaidThisMonth(payments);

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
      <div>
        <p className="font-medium text-sm">{enrollment.student_name}</p>
        <p className="text-xs text-muted-foreground">
          Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}
        </p>
      </div>

      {/* Payment Badge */}
      <div className="flex items-center gap-2">
        {loadingInvoices || loadingPayments ? (
          <Badge variant="outline">{t('pages.catalogCohortsBadgeChecking')}</Badge>
        ) : paid ? (
          <Badge className="bg-green-600 text-white">{t('pages.catalogCohortsBadgePaid')}</Badge>
        ) : (
          <Badge variant="destructive">{t('pages.catalogCohortsBadgeNotPaid')}</Badge>
        )}

        {/* Enrollment Status Badge */}
        <Badge variant={getEnrollmentStatusColor(enrollment.status)}>
          {enrollment.status}
        </Badge>
      </div>
    </div>
  );
}


export default function Cohorts() {
  const { t } = useTranslation('common');

  // Helper function to convert translated day abbreviations to English for backend
  const convertDayAbbreviationsToEnglish = (pattern: string): string => {
    const dayMap: Record<string, string> = {
      [t('pages.catalogCohortsDayMon').toUpperCase()]: 'MON',
      [t('pages.catalogCohortsDayTue').toUpperCase()]: 'TUE',
      [t('pages.catalogCohortsDayWed').toUpperCase()]: 'WED',
      [t('pages.catalogCohortsDayThu').toUpperCase()]: 'THU',
      [t('pages.catalogCohortsDayFri').toUpperCase()]: 'FRI',
      [t('pages.catalogCohortsDaySat').toUpperCase()]: 'SAT',
      [t('pages.catalogCohortsDaySun').toUpperCase()]: 'SUN',
    };

    return pattern
      .split(',')
      .map((day) => day.trim().toUpperCase())
      .map((day) => dayMap[day] || day)
      .join(',');
  };
  const { toast } = useToast();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCohortId, setExpandedCohortId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState<CohortDto | null>(null);
  const [editingCohort, setEditingCohort] = useState<CohortDto | null>(null);
  const [formData, setFormData] = useState({
    course: '',
    name: '',
    lecturer: '',
    capacity: 20,
    start_date: '',
    end_date: '',
    status: 'PLANNED' as CohortDto['status'],
  });  
  const [sessionFormData, setSessionFormData] = useState({
    pattern: '',
    start_time: '19:00',
    end_time: '21:00',
    exclude_holidays: true,
  });

  const mockCourses = [
    { id: '1', program: '1', title: 'Introduction to Network Security', code: 'CS101-01', hours: 40, credits: 3, description: '', created_at: '2024-01-15T00:00:00Z', updated_at: '2024-01-15T00:00:00Z' },
    { id: '2', program: '1', title: 'Ethical Hacking Basics', code: 'CS101-02', hours: 60, credits: 4, description: '', created_at: '2024-01-16T00:00:00Z', updated_at: '2024-01-16T00:00:00Z' },
    { id: '3', program: '2', title: 'Web Application Penetration Testing', code: 'CS301-01', hours: 80, credits: 5, description: '', created_at: '2024-01-17T00:00:00Z', updated_at: '2024-01-17T00:00:00Z' },
  ];

  const { data: cohorts = [], isLoading } = useQuery({
    queryKey: ['cohorts'],
    queryFn: () => getCohorts(),
  });
  const { data: courses = mockCourses } = useQuery({
    queryKey: ['courses'],
    queryFn: () => getCourses(),
  });

  // Fetch enrollments for the expanded cohort
  const { data: cohortEnrollments = [], isLoading: isLoadingEnrollments } = useQuery({
    queryKey: ['enrollments', expandedCohortId],
    queryFn: () => getEnrollments(expandedCohortId!, undefined),
    enabled: !!expandedCohortId,
  });

  const createMutation = useMutation({
    mutationFn: createCohort,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cohorts'] });
      toast({ title: t('pages.catalogCohortsToastCreateTitle'), description: t('pages.catalogCohortsToastCreateDescription') });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({ title: t('pages.catalogCohortsToastErrorTitle'), description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CohortDto> }) => updateCohort(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cohorts'] });
      toast({ title: t('pages.catalogCohortsToastUpdateTitle'), description: t('pages.catalogCohortsToastUpdateDescription') });
      setIsDialogOpen(false);
      setEditingCohort(null);
      resetForm();
    },
    onError: (error) => {
      toast({ title: t('pages.catalogCohortsToastErrorTitle'), description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCohort,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cohorts'] });
      toast({ title: t('pages.catalogCohortsToastDeleteTitle'), description: t('pages.catalogCohortsToastDeleteDescription') });
    },
    onError: (error) => {
      toast({ title: t('pages.catalogCohortsToastErrorTitle'), description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const generateSessionsMutation = useMutation({
    mutationFn: ({ cohortId, payload }: { cohortId: string; payload: any }) =>
      generateSessions(cohortId, payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['sessions'] });
      toast({
        title: t('pages.catalogCohortsToastCreateTitle'),
        description: t('pages.catalogCohortsToastGenerateSessionsDescription', { count: data.created }),
      });
      setIsSessionDialogOpen(false);
      setSelectedCohort(null);
    },
    onError: (error) => {
      toast({ title: t('pages.catalogCohortsToastErrorTitle'), description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({
      course: '',
      name: '',
      lecturer: '',
      capacity: 20,
      start_date: '',
      end_date: '',
      status: 'PLANNED',
    });
  };

  const displayCohorts = cohorts.length === 0 ? exampleCohorts.slice(0, 1) : cohorts;
  const filteredCohorts = displayCohorts.filter((c: any) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ((c as any).course_title || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenCreate = () => {
    setEditingCohort(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (cohort: CohortDto) => {
    setEditingCohort(cohort);
    setFormData({
      course: cohort.course,
      name: cohort.name,
      lecturer: cohort.lecturer || '',
      capacity: cohort.capacity,
      start_date: cohort.start_date,
      end_date: cohort.end_date,
      status: cohort.status,
    });
    setIsDialogOpen(true);
  };

  const handleOpenGenerateSessions = (cohort: CohortDto) => {
    setSelectedCohort(cohort);
    setSessionFormData({
      pattern: '',
      start_time: '19:00',
      end_time: '21:00',
      exclude_holidays: true,
    });
    setIsSessionDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      lecturer: formData.lecturer || null,
    };
    if (editingCohort) {
      updateMutation.mutate({ id: editingCohort.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleGenerateSessions = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCohort) return;
    // Convert translated day abbreviations to English for backend
    const convertedPattern = convertDayAbbreviationsToEnglish(sessionFormData.pattern);
    generateSessionsMutation.mutate({
      cohortId: selectedCohort.id,
      payload: {
        ...sessionFormData,
        pattern: convertedPattern,
      },
    });
  };

  const handleDelete = (id: string) => {
    if (confirm(t('pages.catalogCohortsDeleteConfirm'))) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusColor = (status: CohortDto['status']): "default" | "destructive" | "outline" | "secondary" => {
    const colors: Partial<Record<CohortDto['status'], "default" | "destructive" | "outline" | "secondary">> = {
      PLANNED: 'secondary',
      ENROLLING: 'default',
      ACTIVE: 'default',
      COMPLETED: 'outline',
      CANCELLED: 'destructive',
    };
    return colors[status] ?? 'secondary';
  };

  const getEnrollmentStatusColor = (status: EnrollmentDto['status']): "default" | "destructive" | "outline" | "secondary" => {
    const colors: Partial<Record<EnrollmentDto['status'], "default" | "destructive" | "outline" | "secondary">> = {
      PENDING: 'secondary',
      ACTIVE: 'default',
      COMPLETED: 'outline',
      WITHDRAWN: 'destructive',
    };
    return colors[status] ?? 'secondary';
  };

  const toggleStudentList = (cohortId: string) => {
    setExpandedCohortId(expandedCohortId === cohortId ? null : cohortId);
  };

  
  

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-9 w-40 bg-muted animate-pulse rounded" />
            <div className="h-5 w-56 bg-muted animate-pulse rounded mt-2" />
          </div>
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between cohorts_header_wrapper">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {t('pages.catalogCohortsTitle')}
          </h2>
          <p className="text-muted-foreground">
            {t('pages.catalogCohortsSubtitle')}
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="cohort_add_btn">
          <Plus className="mr-2 h-4 w-4" />
          {t('pages.catalogCohortsAddCohort')}
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm cohort_search_wrapper ">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('pages.catalogCohortsSearchPlaceholder')}
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {cohorts.length === 0 && <ExampleBanner />}
      <div className="space-y-4">
        {filteredCohorts.map((cohort: any) => (
          <Card key={cohort.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex cohort_item_wrapper">


                <div className='cohort_top_side'>

                  <div className="flex gap-4">
                    <div className="rounded-lg bg-primary/10 p-3 cohort_icon">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>{cohort.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {(cohort as any).course_title} •{' '}
                        {(cohort as any).lecturer_name || t('pages.catalogCohortsNoLecturer')}
                      </CardDescription>
                      <div className="flex gap-2 mt-2">
                        <Badge variant={getStatusColor(cohort.status)}>
                          {(cohort as any).status_display || cohort.status}
                        </Badge>
                        <Badge variant="outline">
                          {t('pages.catalogCohortsStudentsCount', {
                            current: cohort.current_enrollment_count || 0,
                            capacity: cohort.capacity,
                          })}
                        </Badge>
                        {cohort.is_ready_to_start && cohort.status !== 'ACTIVE' && (
                          <Badge className="bg-green-600 text-white">
                            {t('pages.catalogCohortsReadyToStart', {
                              min: cohort.min_enrollment || 8,
                            })}
                          </Badge>
                        )}
                        {!cohort.can_accept_enrollment && cohort.status !== 'ACTIVE' && (
                          <Badge variant="destructive">{t('pages.catalogCohortsFull')}</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-medium cohort_date">
                        {format(new Date(cohort.start_date), 'MMM dd, yyyy')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t('pages.catalogCohortsStartDateLabel')}
                      </p>
                    </div>
                  </div>

                </div>


                <div className="flex gap-2 ml-2 cohort_action_btns">
                  {cohort.is_ready_to_start && cohort.status !== 'ACTIVE' && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={async () => {
                        try {
                          await startCohort(cohort.id);
                          qc.invalidateQueries({ queryKey: ['cohorts'] });
                          toast({
                            title: t('pages.catalogCohortsStartCohortSuccessTitle'),
                            description: t('pages.catalogCohortsStartCohortSuccessDescription'),
                          });
                        } catch (error) {
                          toast({
                            title: t('pages.catalogCohortsStartCohortErrorTitle'),
                            description: getErrorMessage(error),
                            variant: 'destructive',
                          });
                        }
                      }}
                      title={t('pages.catalogCohortsStartCohortTitle')}
                    >
                      {t('pages.catalogCohortsStartCohort')}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleStudentList(cohort.id)}
                    title={t('pages.catalogCohortsViewStudentsTitle')}
                  >
                    {expandedCohortId === cohort.id ? <ChevronUp className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/attendance/list?cohort=${cohort.id}`)}
                    title={t('pages.catalogCohortsTakeAttendanceTitle')}
                  >
                    <ClipboardCheck className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/assessment?tab=grades&cohort=${cohort.id}`)}
                    title={t('pages.catalogCohortsViewSessionsTitle')}
                  >
                    <FileCheck className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    className='cohort_delete_btn'
                    size="sm"
                    onClick={() => handleOpenGenerateSessions(cohort)}
                    title={t('pages.catalogCohortsButtonGenerateSessions')}
                  >
                    <Calendar className="h-4 w-4" />
                  </Button>
                  <Button className='cohort_delete_btn' variant="ghost" size="sm" onClick={() => handleOpenEdit(cohort)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button className='cohort_delete_btn' variant="ghost" size="sm" onClick={() => handleDelete(cohort.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>


              </div>
            </CardHeader>
            {expandedCohortId === cohort.id && (
              <CardContent>
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold mb-3">{t('pages.catalogCohortsEnrolledStudentsHeading')}</h4>
                  {isLoadingEnrollments ? (
                    <div className="space-y-2">
                      <div className="h-12 bg-muted animate-pulse rounded" />
                      <div className="h-12 bg-muted animate-pulse rounded" />
                    </div>
                  ) : cohortEnrollments.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">{t('pages.catalogCohortsNoStudentsEnrolled')}</p>
                  ) : (
                    <div className="space-y-2">
                      {cohortEnrollments.map((enrollment: EnrollmentDto) => (
                        <EnrollmentRow
                          key={enrollment.id}
                          enrollment={enrollment}
                          getEnrollmentStatusColor={getEnrollmentStatusColor}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {filteredCohorts.length === 0 && cohorts.length > 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {searchTerm ? t('pages.catalogCohortsNoResultsSearch') : t('pages.catalogCohortsNoResultsDefault')}
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Cohort Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingCohort ? t('pages.catalogCohortsDialogEditTitle') : t('pages.catalogCohortsDialogCreateTitle')}</DialogTitle>
            <DialogDescription>
              {editingCohort ? t('pages.catalogCohortsDialogEditDescription') : t('pages.catalogCohortsDialogCreateDescription')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="course">Course *</Label>
                <Select
                  value={formData.course}
                  onValueChange={(value) => setFormData({ ...formData, course: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('pages.catalogCohortsSelectCoursePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">{t('pages.catalogCohortsFieldCohortName')} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">{t('pages.catalogCohortsFieldStartDate')} *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">{t('pages.catalogCohortsFieldEndDate')} *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">{t('pages.catalogCohortsFieldCapacity')} *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">{t('pages.catalogCohortsFieldStatus')} *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as CohortDto['status'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PLANNED">{t('pages.catalogCohortsStatusPlanned')}</SelectItem>
                      <SelectItem value="ENROLLING">{t('pages.catalogCohortsStatusEnrolling')}</SelectItem>
                      <SelectItem value="ACTIVE">{t('pages.catalogCohortsStatusActive')}</SelectItem>
                      <SelectItem value="COMPLETED">{t('pages.catalogCohortsStatusCompleted')}</SelectItem>
                      <SelectItem value="CANCELLED">{t('pages.catalogCohortsStatusCancelled')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t('pages.catalogCohortsButtonCancel')}
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingCohort ? t('pages.catalogCohortsButtonUpdate') : t('pages.catalogCohortsButtonCreate')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Generate Sessions Dialog */}
      <Dialog open={isSessionDialogOpen} onOpenChange={setIsSessionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('pages.catalogCohortsDialogGenerateSessionsTitle')}</DialogTitle>
            <DialogDescription>
              {t('pages.catalogCohortsDialogGenerateSessionsDescription', { name: selectedCohort?.name || '' })}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleGenerateSessions}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="pattern">
                  {t('pages.catalogCohortsFieldPattern')} * (e.g., {t('pages.catalogCohortsDayMon')},{t('pages.catalogCohortsDayWed')},{t('pages.catalogCohortsDayFri')} or {t('pages.catalogCohortsDayTue')},{t('pages.catalogCohortsDayThu')})
                </Label>
                <Input
                  id="pattern"
                  placeholder={t('pages.catalogCohortsFieldPatternPlaceholder')}
                  value={sessionFormData.pattern}
                  onChange={(e) => setSessionFormData({ ...sessionFormData, pattern: e.target.value })}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {t('pages.catalogCohortsFieldPatternHelper')}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_time">{t('pages.catalogCohortsFieldStartTime')} *</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={sessionFormData.start_time}
                    onChange={(e) => setSessionFormData({ ...sessionFormData, start_time: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_time">{t('pages.catalogCohortsFieldEndTime')} *</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={sessionFormData.end_time}
                    onChange={(e) => setSessionFormData({ ...sessionFormData, end_time: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsSessionDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={generateSessionsMutation.isPending}>
                {t('pages.catalogCohortsDialogGenerateSessionsTitle')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

