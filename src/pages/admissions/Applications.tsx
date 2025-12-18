import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Check, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApplications, updateApplication, acceptApplication } from '@/api/endpoints/admissions';
import { getPrograms, getCohorts, getCourses } from '@/api/endpoints/catalog';
import { getDiscounts, getPaymentPlans } from '@/api/endpoints/payments';
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
  const [selectedCohort, setSelectedCohort] = useState('');
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

  const { data: cohorts = [] } = useQuery({
    queryKey: ['cohorts'],
    queryFn: () => getCohorts(),
    enabled: acceptDialogOpen,
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

  const allowedCourseIds = new Set(coursesForProgram.map((c) => c.id));
  const cohortsForSelectedProgram =
    selectedApp && allowedCourseIds.size > 0
      ? cohorts.filter((c) => allowedCourseIds.has(c.course))
      : cohorts;

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

  // ✅ THIS is the REAL ACCEPT
  const acceptMutation = useMutation({
    mutationFn: ({ id, cohortId }: { id: string; cohortId: string }) =>
      acceptApplication(id, cohortId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['applications'] });
      qc.invalidateQueries({ queryKey: ['enrollments'] });
      toast({ title: 'Accepted', description: 'Enrollment created (PENDING)' });
      setAcceptDialogOpen(false);
      setSelectedApp(null);
      setSelectedCohort('');

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
    if (!selectedApp || !selectedCohort || !selectedPaymentPlan) return;

    setIsSubmittingFlow(true);
    try {
      // 1) Accept application and create enrollment
      const enrollment = await acceptApplication(selectedApp.id, selectedCohort);

      // 2) Create invoice for the new enrollment
      await createInvoiceForEnrollment(enrollment.id, selectedPaymentPlan, selectedDiscountIds);

      qc.invalidateQueries({ queryKey: ['applications'] });
      qc.invalidateQueries({ queryKey: ['enrollments'] });
      qc.invalidateQueries({ queryKey: ['invoices'] });

      toast({
        title: 'Enrollment billed',
        description: 'Enrollment created and invoice generated successfully.',
      });

      setAcceptDialogOpen(false);
      setSelectedApp(null);
      setSelectedCohort('');
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
            setSelectedCohort('');
            setSelectedPaymentPlan('');
            setSelectedDiscountIds([]);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {acceptStep === 1 ? 'Create Enrollment' : 'Enrollment Billing Options'}
            </DialogTitle>
            <DialogDescription>
              {acceptStep === 1
                ? `Step 1 of 2 – Choose a cohort for ${selectedApp?.name}`
                : 'Step 2 of 2 – Choose how this enrollment will be billed.'}
            </DialogDescription>
          </DialogHeader>

          {acceptStep === 1 && (
            <div className="space-y-2 py-4">
              <Label>Cohort *</Label>
              <Select value={selectedCohort} onValueChange={setSelectedCohort}>
                <SelectTrigger>
                  <SelectValue placeholder="Select cohort" />
                </SelectTrigger>
                <SelectContent>
                  {cohortsForSelectedProgram.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {acceptStep === 2 && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Payment plan *</Label>
                <Select value={selectedPaymentPlan} onValueChange={setSelectedPaymentPlan}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentPlans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Optional discounts</Label>
                <div className="max-h-40 space-y-2 overflow-auto rounded-md border p-2">
                  {discounts.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No active discounts configured.
                    </p>
                  )}
                  {discounts.map((d) => (
                    <label
                      key={d.id}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedDiscountIds.includes(d.id)}
                        onCheckedChange={() => handleToggleDiscount(d.id)}
                      />
                      <span>
                        {d.name}{' '}
                        <span className="text-xs text-muted-foreground">({d.type_display})</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                The exact tuition, discounts, and payment schedule will be calculated automatically
                when the invoice is created for this enrollment.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (acceptStep === 1) {
                  setAcceptDialogOpen(false);
                } else {
                  setAcceptStep(1);
                }
              }}
            >
              {acceptStep === 1 ? 'Cancel' : 'Back'}
            </Button>

            {acceptStep === 1 && (
              <Button
                onClick={() => setAcceptStep(2)}
                disabled={!selectedCohort}
              >
                Next: Billing options
              </Button>
            )}

            {acceptStep === 2 && (
              <Button
                onClick={handleAcceptAndBill}
                disabled={!selectedPaymentPlan || isSubmittingFlow}
              >
                {isSubmittingFlow ? 'Creating...' : 'Create enrollment & invoice'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
