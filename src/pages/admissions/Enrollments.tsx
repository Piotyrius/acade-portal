import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Users, CheckCircle, XCircle, UserX, List, CheckSquare, Eye } from 'lucide-react';
import { exampleEnrollments } from '@/utils/exampleData';
import { ExampleBanner } from '@/components/ExampleBanner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getEnrollments,
  activateEnrollment,
  withdrawEnrollment,
  completeEnrollment,
  getWaitlist,
  bulkActivateEnrollments,
} from '@/api/endpoints/admissions';
import { getCohorts } from '@/api/endpoints/catalog';
import { EnrollmentDto } from '@/api/types';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export default function Enrollments() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [selectedEnrollments, setSelectedEnrollments] = useState<string[]>([]);

  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ['enrollments', selectedStatus],
    queryFn: () => getEnrollments(undefined, selectedStatus || undefined),
  });

  const { data: waitlist = [] } = useQuery({
    queryKey: ['waitlist'],
    queryFn: getWaitlist,
    enabled: user?.role === 'ADMIN' || user?.role === 'LECTURER',
  });

  const { data: cohorts } = useQuery({
    queryKey: ['cohorts'],
    queryFn: () => getCohorts(),
  });

  const activateMutation = useMutation({
    mutationFn: activateEnrollment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['enrollments'] });
      toast({ title: 'Success', description: 'Enrollment activated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: withdrawEnrollment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['enrollments'] });
      toast({ title: 'Success', description: 'Enrollment withdrawn successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const completeMutation = useMutation({
    mutationFn: completeEnrollment,
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['enrollments'] });
      toast({ title: 'Success', description: 'Enrollments activated successfully' });
      setIsBulkDialogOpen(false);
      setSelectedEnrollments([]);
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const handleActivate = (id: string) => {
    if (confirm('Are you sure you want to activate this enrollment?')) {
      activateMutation.mutate(id);
    }
  };

  const handleWithdraw = (id: string) => {
    if (confirm('Are you sure you want to withdraw this enrollment?')) {
      withdrawMutation.mutate(id);
    }
  };

  const handleComplete = (id: string) => {
    if (confirm('Are you sure you want to mark this enrollment as complete?')) {
      completeMutation.mutate(id);
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
    bulkActivateMutation.mutate(selectedEnrollments);
  };

  const toggleEnrollmentSelection = (id: string) => {
    setSelectedEnrollments((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
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

  const displayEnrollments = enrollments.length === 0 ? exampleEnrollments.slice(0, 1) : enrollments;
  const filteredEnrollments = displayEnrollments.filter((enrollment: any) => {
    const cohort = cohorts?.find((c: any) => c.id === enrollment.cohort);
    return (
      searchTerm === '' ||
      enrollment.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cohort?.name?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h2 className="text-3xl font-bold tracking-tight">Enrollments</h2>
          <p className="text-muted-foreground">Manage student enrollments</p>
        </div>
        <div className="flex gap-2">
          {(user?.role === 'ADMIN' || user?.role === 'LECTURER') && (
            <Button className='enrollments_bulk_active' variant="outline" onClick={() => setIsBulkDialogOpen(true)}>
              <CheckSquare className="mr-2 h-4 w-4" />
              Bulk Activate
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 enrollements_input_option_wrapper">
        <div className="relative flex-1 max-w-sm input_wrapper">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search enrollments..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 border border-border rounded-md select_wrapper"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
          <option value="WITHDRAWN">Withdrawn</option>
          <option value="WAITLISTED">Waitlisted</option>
        </select>
      </div>

      {enrollments.length === 0 && <ExampleBanner />}
      <Card>
        <CardHeader>
          <CardTitle>Enrollments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEnrollments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No enrollments found</p>
            ) : (
              filteredEnrollments.map((enrollment: any) => {
                const cohort = cohorts?.find((c: any) => c.id === enrollment.cohort);
                return (
                  <div
                    key={enrollment.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {(user?.role === 'ADMIN' || user?.role === 'LECTURER') && (
                        <Checkbox
                          checked={selectedEnrollments.includes(enrollment.id)}
                          onCheckedChange={() => toggleEnrollmentSelection(enrollment.id)}
                        />
                      )}
                      <div>
                        <p className="font-medium">
                          {enrollment.student_name || enrollment.student || 'Unknown Student'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Cohort: {cohort?.name || enrollment.cohort_name || 'Unknown'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}
                        </p>
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
                              onClick={() => handleActivate(enrollment.id)}
                              disabled={activateMutation.isPending}
                              title="Activate Enrollment"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          {/* {enrollment.status === 'ACTIVE' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleComplete(enrollment.id)}
                                disabled={completeMutation.isPending}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleWithdraw(enrollment.id)}
                                disabled={withdrawMutation.isPending}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )} */}
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
                      onClick={() => handleActivate(enrollment.id)}
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
              .filter((e: any) => e.status === 'WAITLISTED')
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
    </div>
  );
}

