import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Check, X, Pencil, Phone, Info, Clock, Sparkles } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApplications, updateApplication, acceptApplication } from '@/api/endpoints/admissions';
import { getPrograms, getCourses } from '@/api/endpoints/catalog';
import { ApplicationDto } from '@/api/types';
import { useMemo, useState } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslation } from 'react-i18next';

export default function Applications() {
  const { t } = useTranslation('common');
  const { toast } = useToast();
  const qc = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [acceptStep, setAcceptStep] = useState<1 | 2>(1);
  const [selectedApp, setSelectedApp] = useState<ApplicationDto | null>(null);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedPaymentPlan, setSelectedPaymentPlan] = useState('');
  const [selectedDiscountIds, setSelectedDiscountIds] = useState<string[]>([]);
  const [isSubmittingFlow, setIsSubmittingFlow] = useState(false);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editApp, setEditApp] = useState<ApplicationDto | null>(null);
  const [editProgramId, setEditProgramId] = useState<string>('');

  /* ===================== QUERIES ===================== */

  // Load the full applications list once from the backend,
  // then paginate client-side so the UI only shows part of it.
  const {
    data: applications = [],
    isLoading,
  } = useQuery({
    queryKey: ['applications'],
    queryFn: () => getApplications(),
  });

  const pageSize = 20;
  const totalCount = applications.length;

  const { data: programs = [] } = useQuery({
    queryKey: ['programs'],
    queryFn: () => getPrograms(),
  });

  const { data: coursesForProgram = [] } = useQuery({
    queryKey: ['courses', selectedApp?.program],
    queryFn: () => (selectedApp?.program ? getCourses(selectedApp.program) : Promise.resolve([])),
    enabled: acceptDialogOpen && !!selectedApp?.program,
  });

  // Payment plans & discounts for the billing step
  const { data: paymentPlans = [] } = useQuery({
    queryKey: ['paymentPlans', { is_active: true }],
    queryFn: () => getPaymentPlans({ is_active: true }),
    enabled: acceptDialogOpen,
  });

  const { data: discounts = [] } = useQuery({
    queryKey: ['discounts', { is_active: true }],
    queryFn: () => getDiscounts({ is_active: true }),
    enabled: acceptDialogOpen,
  });

  // Default to first course if available
  const defaultCourse = coursesForProgram.length > 0 ? coursesForProgram[0].id : '';

  /* ===================== MUTATIONS ===================== */

  // ❌ ONLY used for REJECT / IN_REVIEW (NOT ACCEPT)
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ApplicationDto> }) =>
      updateApplication(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['applications'] });
      toast({ title: 'Updated', description: 'Application updated' });
    },
    onError: (err) =>
      toast({ title: 'Error', description: getErrorMessage(err), variant: 'destructive' }),
  });

  // ✅ THIS is the REAL ACCEPT - Now uses course_id instead of cohort_id
  const acceptMutation = useMutation({
    mutationFn: ({ id, courseId }: { id: string; courseId?: string }) =>
      acceptApplication(id, courseId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['applications'] });
      qc.invalidateQueries({ queryKey: ['enrollments'] });
      qc.invalidateQueries({ queryKey: ['cohorts'] });
      toast({ title: 'Accepted', description: 'Enrollment created and invoice generated automatically' });
      setAcceptDialogOpen(false);
      setSelectedApp(null);
      setSelectedCourse('');
      setSelectedPaymentPlan('');
      setSelectedDiscountIds([]);
    },
    onError: (err) =>
      toast({ title: 'Error', description: getErrorMessage(err), variant: 'destructive' }),
  });

  /* ===================== HANDLERS ===================== */

  const handleOpenAccept = (app: ApplicationDto) => {
    setSelectedApp(app);
    setAcceptStep(1);
    setAcceptDialogOpen(true);
  };

  const handleToggleDiscount = (id: string) => {
    setSelectedDiscountIds((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handleAcceptAndBill = async () => {
    if (!selectedApp || !selectedCourse) return;

    setIsSubmittingFlow(true);
    try {
      // Accept application - invoice is now created automatically
      // Course selection determines which cohort to use (auto-created if needed)
      await acceptApplication(selectedApp.id, selectedCourse);

      qc.invalidateQueries({ queryKey: ['applications'] });
      qc.invalidateQueries({ queryKey: ['enrollments'] });
      qc.invalidateQueries({ queryKey: ['cohorts'] });
      qc.invalidateQueries({ queryKey: ['invoices'] });

      toast({
        title: 'Enrollment created',
        description: 'Enrollment created and invoice generated automatically.',
      });

      setAcceptDialogOpen(false);
      setSelectedApp(null);
      setSelectedCourse('');
      setSelectedPaymentPlan('');
      setSelectedDiscountIds([]);
      setAcceptStep(1);
    } catch (err) {
      toast({
        title: 'Error',
        description: getErrorMessage(err),
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingFlow(false);
    }
  };

  const handleReject = (id: string) => {
    updateMutation.mutate({ id, data: { status: 'REJECTED' } });
  };

  const handleOpenEditProgram = (app: ApplicationDto) => {
    setEditApp(app);
    setEditProgramId(app.program);
    setEditDialogOpen(true);
  };

  const handleSaveEditProgram = () => {
    if (!editApp || !editProgramId || editProgramId === editApp.program) {
      setEditDialogOpen(false);
      return;
    }

    updateMutation.mutate(
      { id: editApp.id, data: { program: editProgramId } },
      {
        onSuccess: () => {
          setEditDialogOpen(false);
          setEditApp(null);
        },
      }
    );
  };

  /* ===================== FILTER & PAGINATION ===================== */

  const filteredApplications = applications.filter((app) => {
    // On this screen we focus on applications that still need a decision
    if (!(app.status === 'NEW' || app.status === 'IN_REVIEW')) {
      return false;
    }

    return (
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalPages = useMemo(
    () =>
      totalCount && pageSize
        ? Math.max(1, Math.ceil(filteredApplications.length / pageSize))
        : 1,
    [filteredApplications.length, pageSize, totalCount]
  );

  const pagedApplications = filteredApplications.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  /* ===================== UI ===================== */

  if (isLoading) {
    return <div className="h-40 bg-muted animate-pulse rounded-lg" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          {t('pages.admissionsTitle')}
        </h2>
        <p className="text-muted-foreground">
          {t('pages.admissionsSubtitle')}
        </p>
      </div>

      {/* Admissions overview / quick actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{t('pages.admissionsApplicationsCardTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{applications.length}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {t('pages.admissionsApplicationsCardSubtitle')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('pages.admissionsPendingReviewTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {applications.filter((a) => a.status === 'NEW' || a.status === 'IN_REVIEW').length}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {t('pages.admissionsPendingReviewSubtitle')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('pages.admissionsAcceptedTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {applications.filter((a) => a.status === 'ACCEPTED').length}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {t('pages.admissionsAcceptedSubtitle')}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t('pages.admissionsSearchPlaceholder')}
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('pages.admissionsApplicationsCardTitle')}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {t('pages.admissionsListSubtitle')}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {pagedApplications.map((app) => {
            const program = programs.find((p) => p.id === app.program);

            return (
              <div
                key={app.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="space-y-1">
                  <p className="font-medium text-base">{app.name}</p>
                  <p className="text-sm text-muted-foreground">{app.email}</p>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-1">
                    {/* Primary phone, but only if it isn't already present in additional phones */}
                    {(!app.phones ||
                      !app.phones.some((p) => p.phone === app.phone)) && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5">
                        <Phone className="h-3 w-3" />
                        {app.phone}
                      </span>
                    )}
                    {app.phones && app.phones.length > 0 && (
                      <span className="inline-flex flex-wrap gap-1">
                        {app.phones.map((p, idx) => (
                          <span
                            key={p.id ?? `${p.phone}-${idx}`}
                            className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5"
                          >
                            <Phone className="h-3 w-3" />
                            {p.name ? `${p.name}: ${p.phone}` : p.phone}
                          </span>
                        ))}
                      </span>
                    )}
                  </div>

                  <div className="mt-2 grid gap-1 text-xs text-muted-foreground md:grid-cols-2">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Applied on {new Date(app.created_at).toLocaleDateString()}</span>
                    </div>
                    {program && (
                      <div className="flex items-center gap-1">
                        <Info className="h-3 w-3" />
                        <span>
                          {program.name}
                          {program.code ? ` • ${program.code}` : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  {(app.schedule_pref || app.experience_level || app.referral_source || app.notes) && (
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-foreground">
                      {app.schedule_pref && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5">
                          <Clock className="h-3 w-3" />
                          {app.schedule_pref}
                        </span>
                      )}
                      {app.experience_level && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5">
                          <Sparkles className="h-3 w-3" />
                          {app.experience_level}
                        </span>
                      )}
                      {app.referral_source && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5">
                          <Info className="h-3 w-3" />
                          {app.referral_source}
                        </span>
                      )}
                      {app.notes && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 max-w-xs truncate">
                          <Info className="h-3 w-3" />
                          {app.notes}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      app.status === 'ACCEPTED'
                        ? 'default'
                        : app.status === 'REJECTED'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {app.status}
                  </Badge>

                  {(app.status === 'NEW' || app.status === 'IN_REVIEW') && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenAccept(app)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        {t('pages.admissionsApplicationsButtonAccept')}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(app.id)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        {t('pages.admissionsApplicationsButtonReject')}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenEditProgram(app)}
                        title={t('pages.admissionsApplicationsButtonChangeProgram')}
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        {t('pages.admissionsApplicationsButtonEditProgram')}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {t('pages.admissionsApplicationsPaginationShowing')}{' '}
            {filteredApplications.length > 0
              ? `${(page - 1) * pageSize + 1}-${Math.min(
                  filteredApplications.length,
                  page * pageSize
                )}`
              : '0'}{' '}
            {t('pages.admissionsApplicationsPaginationOf')} {filteredApplications.length} {t('pages.admissionsApplicationsPaginationApplications')}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              {t('pages.admissionsApplicationsPaginationPrevious')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              {t('pages.admissionsApplicationsPaginationNext')}
            </Button>
          </div>
        </div>
      )}

      {/* ================= ACCEPT DIALOG ================= */}

      <Dialog
        open={acceptDialogOpen}
        onOpenChange={(open) => {
          setAcceptDialogOpen(open);
          if (!open) {
            setAcceptStep(1);
            setSelectedCourse('');
            setSelectedPaymentPlan('');
            setSelectedDiscountIds([]);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('pages.admissionsApplicationsDialogCreateEnrollmentTitle')}</DialogTitle>
            <DialogDescription>
              {t('pages.admissionsApplicationsDialogCreateEnrollmentDescription', { name: selectedApp?.name || '' })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t('pages.admissionsApplicationsDialogCourseLabel')}</Label>
              <Select 
                value={selectedCourse || defaultCourse} 
                onValueChange={(value) => {
                  setSelectedCourse(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('pages.admissionsApplicationsSelectCoursePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {coursesForProgram.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.title} ({c.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-muted-foreground space-y-1">
              <p>• A cohort will be automatically created for this course if needed</p>
              <p>• An invoice will be automatically generated with default payment plan (Full Payment)</p>
              <p>• Payment due date will be set to 2-3 weeks from enrollment</p>
              <p>• You can change the course assignment later if needed (before cohort starts)</p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAcceptDialogOpen(false)}
            >
              Cancel
            </Button>

            <Button
              onClick={handleAcceptAndBill}
              disabled={(!selectedCourse && !defaultCourse) || isSubmittingFlow}
            >
              {isSubmittingFlow ? 'Creating...' : 'Create enrollment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================= EDIT PROGRAM DIALOG ================= */}
      <Dialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) {
            setEditApp(null);
            setEditProgramId('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit program</DialogTitle>
            <DialogDescription>
              Change the program for {editApp?.name}. Use this if the applicant chose a different track.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Program</Label>
              <Select
                value={editProgramId}
                onValueChange={(value) => setEditProgramId(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('pages.admissionsApplicationsSelectProgramPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {programs.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEditProgram}
              disabled={!editProgramId || editProgramId === editApp?.program || updateMutation.isPending}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
