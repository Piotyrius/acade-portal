import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Check, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApplications, updateApplication, acceptApplication } from '@/api/endpoints/admissions';
import { getPrograms, getCourses } from '@/api/endpoints/catalog';
import { ApplicationDto } from '@/api/types';
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
import { Checkbox } from '@/components/ui/checkbox';

export default function Applications() {
  const { toast } = useToast();
  const qc = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [acceptStep, setAcceptStep] = useState<1 | 2>(1);
  const [selectedApp, setSelectedApp] = useState<ApplicationDto | null>(null);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedPaymentPlan, setSelectedPaymentPlan] = useState('');
  const [selectedDiscountIds, setSelectedDiscountIds] = useState<string[]>([]);
  const [isSubmittingFlow, setIsSubmittingFlow] = useState(false);

  /* ===================== QUERIES ===================== */

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: () => getApplications(),
  });

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

  /* ===================== FILTER ===================== */

  const filteredApplications = applications.filter(
    (app) =>
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* ===================== UI ===================== */

  if (isLoading) {
    return <div className="h-40 bg-muted animate-pulse rounded-lg" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Admissions</h2>
        <p className="text-muted-foreground">
          Manage leads, applications, and enrollments for your academy.
        </p>
      </div>

      {/* Admissions overview / quick actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{applications.length}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Total applications received.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {applications.filter((a) => a.status === 'NEW' || a.status === 'IN_REVIEW').length}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Applications waiting for a decision.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Accepted</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {applications.filter((a) => a.status === 'ACCEPTED').length}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Students ready to enroll into cohorts.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search applications..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Applications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredApplications.map((app) => {
            const program = programs.find((p) => p.id === app.program);

            return (
              <div
                key={app.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{app.name}</p>
                  <p className="text-sm text-muted-foreground">{app.email}</p>
                  <p className="text-xs text-muted-foreground">{program?.name}</p>
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
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(app.id)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

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
            <DialogTitle>Create Enrollment</DialogTitle>
            <DialogDescription>
              Choose a course for {selectedApp?.name}. A cohort will be automatically created if needed, and an invoice will be generated automatically.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Course *</Label>
              <Select 
                value={selectedCourse || defaultCourse} 
                onValueChange={(value) => {
                  setSelectedCourse(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select course (defaults to first course)" />
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
    </div>
  );
}
