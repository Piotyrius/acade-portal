import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectItem, SelectValue, SelectContent } from '@/components/ui/select';
import { Search, Users, CheckCircle, XCircle, UserX, List, CheckSquare, Eye } from 'lucide-react';
import { exampleEnrollments } from '@/utils/exampleData';
import { ExampleBanner } from '@/components/ExampleBanner';
import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getEnrollmentsPaginated,
  activateEnrollment,
  withdrawEnrollment,
  completeEnrollment,
  getWaitlist,
  bulkActivateEnrollments,
} from '@/api/endpoints/admissions';
import { getCohorts } from '@/api/endpoints/catalog';
import { EnrollmentDto } from '@/api/types';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import ManualEnrollment from './ManualEnrollment';
import { useTranslation } from 'react-i18next';

export default function Enrollments() {
  const { t } = useTranslation('common');
  const { user } = useAuthStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [page, setPage] = useState(1);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [selectedEnrollments, setSelectedEnrollments] = useState<string[]>([]);

  const [manualEnrolPopup, setManualEnrolPopup] = useState(false)
  
  
  const handleOpen = () => {
    setManualEnrolPopup(true)
  }

  // Debounce search so typing doesn't refetch every keystroke.
  useEffect(() => {
    const handle = setTimeout(() => {
      setSearchTerm(searchInput.trim());
    }, 300);
    return () => clearTimeout(handle);
  }, [searchInput]);

  // Reset pagination (and selection) when filters change.
  useEffect(() => {
    setPage(1);
    setSelectedEnrollments([]);
  }, [selectedStatus, searchTerm]);

  // Clear selection when paging.
  useEffect(() => {
    setSelectedEnrollments([]);
  }, [page]);

  const { data: enrollmentsPage, isLoading, isFetching } = useQuery({
    queryKey: ['enrollments', selectedStatus || null, searchTerm || null, page],
    queryFn: () =>
      getEnrollmentsPaginated({
        status: selectedStatus || undefined,
        search: searchTerm || undefined,
        page,
      }),
    placeholderData: keepPreviousData,
  });

  const enrollments: EnrollmentDto[] = enrollmentsPage?.results ?? [];
  const totalEnrollments = enrollmentsPage?.count ?? enrollments.length;
  const canGoPrev = Boolean(enrollmentsPage?.previous) && !isFetching;
  const canGoNext = Boolean(enrollmentsPage?.next) && !isFetching;

  const { data: waitlist = [] } = useQuery({
    queryKey: ['waitlist'],
    queryFn: getWaitlist,
    enabled: user?.role === 'ADMIN' || user?.role === 'LECTURER',
  });

  const { data: cohorts } = useQuery({
    queryKey: ['cohorts'],
    queryFn: () => getCohorts(),
  });

  type ActivatePayload = {
  status: string;
  completed_at: string | null;
  notes: string | null;
  organization: string;
  student: string;
  cohort: string;
};

  const activateMutation = useMutation({
    mutationFn: ({ id, payload }: {
      id: string;
      payload: {
        status?: string;
        completed_at?: string | null;
        notes?: string;
        organization?: string;
        cohort: string;
        student: string;
      }
    }) =>
      activateEnrollment(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['enrollments'] });
      toast({ title: 'Success', description: 'Enrollment activated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },

    
  });

  const withdrawMutation = useMutation({
    mutationFn: ({ id, payload }: {
      id: string;
      payload: {
        status?: string;
        completed_at?: string | null;
        notes?: string;
        organization?: string;
        cohort: string;
        student: string;
      }
    }) =>
      withdrawEnrollment(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['enrollments'] });
      toast({ title: 'Success', description: 'Enrollment withdrawn successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const completeMutation = useMutation({
    mutationFn: ({ id, payload }: {
      id: string;
      payload: {
        status?: string;
        completed_at?: string | null;
        notes?: string;
        organization?: string;
        cohort: string;
        student: string;
      }
    }) =>
      completeEnrollment(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['enrollments'] });
      toast({ title: 'Success', description: 'Enrollment completed successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const bulkActivateMutation = useMutation({
    mutationFn: bulkActivateEnrollments,
    onMutate: async (ids: string[]) => {
      await qc.cancelQueries({ queryKey: ['enrollments'] });

      const previousEnrollments = qc.getQueriesData({ queryKey: ['enrollments'] });

      const updateEnrollment = (enrollment: any) => {
        if (!ids.includes(enrollment.id)) return enrollment;
        return {
          ...enrollment,
          status: 'ACTIVE',
          status_display: enrollment.status_display ?? 'Active',
        };
      };

      qc.setQueriesData({ queryKey: ['enrollments'] }, (old: any) => {
        if (!old) return old;

        // Support both array and paginated shapes.
        if (Array.isArray(old)) {
          return old.map(updateEnrollment);
        }

        if (Array.isArray(old.results)) {
          return {
            ...old,
            results: old.results.map(updateEnrollment),
          };
        }

        return old;
      });

      return { previousEnrollments };
    },
    onSuccess: (data) => {
      console.log('✅ Bulk activation successful:', data);
      toast({
        title: 'Success',
        description: `${data.activated} enrollment(s) activated successfully`,
      });
      setIsBulkDialogOpen(false);
      setSelectedEnrollments([]);
    },
    onError: (error: any, _ids, context) => {
      console.error('❌ Bulk activation failed:', error);
      console.error('Error response:', error.response?.data);

      if (context?.previousEnrollments) {
        for (const [queryKey, data] of context.previousEnrollments) {
          qc.setQueryData(queryKey, data);
        }
      }

      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        'Failed to activate enrollments';

      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['enrollments'] });
      qc.invalidateQueries({ queryKey: ['waitlist'] });
    },
  });

  const handleActivate = (enrollment: any) => {
    activateMutation.mutate({
      id: enrollment.id,
      payload: {
        status: enrollment.status,
        completed_at: enrollment.completed_at || null,
        notes: enrollment.notes || "",
        organization: enrollment.organization,
        student: enrollment.student,
        cohort: enrollment.cohort
      },

    });
  };


  const handleWithdraw = (enrollment: any) => {
    if (confirm('Are you sure you want to withdraw this enrollment?')) {
      withdrawMutation.mutate({
        id: enrollment.id,
        payload: {
          status: enrollment.status,
          completed_at: enrollment.completed_at || null,
          notes: enrollment.notes || "",
          organization: enrollment.organization,
          student: enrollment.student,
          cohort: enrollment.cohort
        },
      });
    }
  };

  const handleComplete = (enrollment: any) => {
    if (confirm('Are you sure you want to mark this enrollment as complete?')) {
      completeMutation.mutate({
        id: enrollment.id,
        payload: {
          status: enrollment.status,
          completed_at: new Date().toISOString(), // Generate current timestamp
          notes: enrollment.notes || "",
          organization: enrollment.organization,
          student: enrollment.student,
          cohort: enrollment.cohort
        },
      });
    }
  };

  const handleBulkActivate = () => {
    if (selectedEnrollments.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one enrollment',
        variant: 'destructive',
      });
      return;
    }

    console.log('🔵 Attempting bulk activate with IDs:', selectedEnrollments);
    console.log('📊 Number of enrollments:', selectedEnrollments.length);

    bulkActivateMutation.mutate(selectedEnrollments);
  };

  const toggleEnrollmentSelection = (id: string) => {
    setSelectedEnrollments((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const isBulkActivatable = (status: string) => {
    const normalized = (status || '').toUpperCase();
    return normalized === 'PENDING' || normalized === 'WAITLISTED';
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'COMPLETED':
        return 'default';
      case 'WITHDRAWN':
        return 'destructive';
      case 'PENDING':
        return 'secondary';
      case 'WAITLISTED':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const showExample = totalEnrollments === 0 && !searchTerm && !selectedStatus;
  const displayEnrollments = showExample ? exampleEnrollments.slice(0, 1) : enrollments;
  const filteredEnrollments = displayEnrollments.filter((enrollment: any) => {
    const cohort = cohorts?.find((c: any) => c.id === enrollment.cohort);
    return (
      searchInput === '' ||
      enrollment.student_name?.toLowerCase().includes(searchInput.toLowerCase()) ||
      cohort?.name?.toLowerCase().includes(searchInput.toLowerCase())
    );
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-9 w-40 bg-muted animate-pulse rounded" />
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between enrollments_header_wrapper">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {t('pages.enrollmentsTitle')}
          </h2>
          <p className="text-muted-foreground">
            {t('pages.enrollmentsSubtitle')}
          </p>
        </div>
        <div className="flex gap-2 enrollments_bulk_active_wrapper">
          {(user?.role === 'ADMIN' || user?.role === 'LECTURER') && (
            <Button
              className="enrollments_bulk_active"
              variant="outline"
              onClick={() => setIsBulkDialogOpen(true)}
            >
              <CheckSquare className="mr-2 h-4 w-4" />
              {t('pages.enrollmentsBulkActivate')}
            </Button>
          )}

          <Button onClick={handleOpen}>{t('pages.enrollmentsManualEnrollment')}</Button>
        </div>
      </div>

      <div className="flex items-center gap-2 enrollements_input_option_wrapper">
        <div className="relative flex-1 w-[200px] enrollments_input_wrapper">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('pages.enrollmentsSearchPlaceholder')}
            className="pl-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[200px] select_wrapper">
            <SelectValue placeholder={t('pages.enrollmentsStatusAll')} />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="PENDING">{t('pages.enrollmentsStatusPending')}</SelectItem>
            <SelectItem value="ACTIVE">{t('pages.enrollmentsStatusActive')}</SelectItem>
            <SelectItem value="COMPLETED">{t('pages.enrollmentsStatusCompleted')}</SelectItem>
            <SelectItem value="WITHDRAWN">{t('pages.enrollmentsStatusWithdrawn')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {showExample && <ExampleBanner />}
      <Card>
        <CardHeader>
          <CardTitle>{t('pages.enrollmentsTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEnrollments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                {t('pages.enrollmentsNoneFound')}
              </p>
            ) : (
              filteredEnrollments.map((enrollment: any) => {
                const cohort = cohorts?.find((c: any) => c.id === enrollment.cohort);
                return (
                  <div
                    key={enrollment.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg enrollments_item"
                  >
                    <div className="flex items-start gap-3">
                      {(user?.role === 'ADMIN' || user?.role === 'LECTURER') && (
                        <Checkbox
                          checked={selectedEnrollments.includes(enrollment.id)}
                          onCheckedChange={() => toggleEnrollmentSelection(enrollment.id)}
                          disabled={!isBulkActivatable(enrollment.status)}
                        />
                      )}
                      <div className="space-y-1">
                        <p className="font-medium">
                          {enrollment.student_name || enrollment.student || 'Unknown Student'}
                        </p>
                        {enrollment.student_email && (
                          <p className="text-sm text-muted-foreground">
                            {enrollment.student_email}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          Cohort: {cohort?.name || enrollment.cohort_name || 'Unknown'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Enrolled on {new Date(enrollment.enrolled_at).toLocaleDateString()}
                        </p>
                        {enrollment.notes && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Notes: {enrollment.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusVariant(enrollment.status)}>
                        {enrollment.status_display || enrollment.status}
                      </Badge>
                      {(user?.role === 'ADMIN' || user?.role === 'LECTURER') && (
                        <div className="flex gap-1">
                          {(enrollment.status === 'PENDING' || enrollment.status === 'WAITLISTED') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleActivate(enrollment)}
                              disabled={activateMutation.isPending}
                              title="Activate Enrollment"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          {enrollment.status === 'ACTIVE' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleComplete(enrollment)}
                                disabled={completeMutation.isPending}
                                title="Complete Enrollment"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleWithdraw(enrollment)}
                                disabled={withdrawMutation.isPending}
                                title="Withdraw Enrollment"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {(enrollment.status === 'COMPLETED' || enrollment.status === 'WITHDRAWN') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleActivate(enrollment)}
                              disabled={activateMutation.isPending}
                              title="Reactivate Enrollment"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {!showExample && totalEnrollments > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} 
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!canGoPrev}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPage((p) => p + 1)}
              disabled={!canGoNext}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {(user?.role === 'ADMIN' || user?.role === 'LECTURER') && waitlist.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Waitlist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {waitlist.map((enrollment: any) => {
                const cohort = cohorts?.find((c: any) => c.id === enrollment.cohort);
                return (
                  <div
                    key={enrollment.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {enrollment.student_name || enrollment.student || 'Unknown Student'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Cohort: {cohort?.name || enrollment.cohort_name || 'Unknown'}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleActivate(enrollment)}
                      disabled={activateMutation.isPending}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Activate
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Activate Enrollments</DialogTitle>
            <DialogDescription>Select enrollments to activate</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-96 overflow-y-auto">
            {filteredEnrollments
              .filter((e: any) => e.status === 'WAITLISTED' || e.status === 'PENDING')
              .map((enrollment: any) => {
                const cohort = cohorts?.find((c: any) => c.id === enrollment.cohort);
                return (
                  <div key={enrollment.id} className="flex items-center gap-2 p-2 border rounded">
                    <Checkbox
                      checked={selectedEnrollments.includes(enrollment.id)}
                      onCheckedChange={() => toggleEnrollmentSelection(enrollment.id)}
                    />
                    <Label className="flex-1 cursor-pointer">
                      {enrollment.student_name || enrollment.student} - {cohort?.name || enrollment.cohort_name}
                    </Label>
                  </div>
                );
              })}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsBulkDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleBulkActivate}
              disabled={bulkActivateMutation.isPending || selectedEnrollments.length === 0}
            >
              {bulkActivateMutation.isPending ? 'Activating...' : `Activate ${selectedEnrollments.length} Enrollment(s)`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {manualEnrolPopup && (
      
        <Dialog open={manualEnrolPopup} onOpenChange={setManualEnrolPopup}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Manual Enrollment</DialogTitle>
              <DialogDescription>Enroll a student into a cohort manually</DialogDescription>
            </DialogHeader>

            <ManualEnrollment
              onSuccess={() => setManualEnrolPopup(false)}
            />

            <DialogFooter>
              <Button variant="outline" onClick={() => setManualEnrolPopup(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      
      )}

    </div>
  );
}

