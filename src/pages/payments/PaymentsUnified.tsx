import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, FileText, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getInvoices, getPayments, getPaymentPlans, getDiscounts } from '@/api/endpoints/payments';
import { getEnrollments } from '@/api/endpoints/admissions';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DiscountDto } from '@/api/endpoints/payments';
import { usePaymentsAdmin } from '@/hooks/usePaymentsAdmin';
import { useToast } from '@/hooks/use-toast';

export default function PaymentsUnified() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices-dashboard'],
    queryFn: () => getInvoices(),
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['payments-dashboard'],
    queryFn: () => getPayments(),
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments-billing'],
    queryFn: () => getEnrollments(),
  });

  const { data: paymentPlans = [] } = useQuery({
    queryKey: ['paymentPlans-billing'],
    queryFn: () => getPaymentPlans(),
  });

  const { data: discounts = [] } = useQuery({
    queryKey: ['discounts-billing'],
    queryFn: () => getDiscounts({ is_active: true }),
  });

  const outstandingCount = invoices.filter(
    (i: any) => i.status === 'ISSUED' || i.status === 'OVERDUE',
  ).length;

  const totalReceived = payments
    .filter((p: any) => p.status === 'COMPLETED')
    .reduce((sum: number, p: any) => sum + parseFloat(p.amount || '0'), 0);

  const [billDialogOpen, setBillDialogOpen] = useState(false);
  const [billForm, setBillForm] = useState({
    enrollment: '',
    payment_plan: '',
    discounts: [] as string[],
  });

  const { createInvoiceFromEnrollment } = usePaymentsAdmin();

  const handleToggleDiscount = (id: string, checked: boolean) => {
    setBillForm((prev) => ({
      ...prev,
      discounts: checked
        ? [...prev.discounts, id]
        : prev.discounts.filter((d) => d !== id),
    }));
  };

  const handleBillSubmit = () => {
    if (!billForm.enrollment || !billForm.payment_plan) {
      toast({
        title: 'Missing information',
        description: 'Please select an enrollment and payment plan.',
        variant: 'destructive',
      });
      return;
    }

    createInvoiceFromEnrollment.mutate({
      enrollmentId: billForm.enrollment,
      paymentPlanId: billForm.payment_plan,
      discountIds: billForm.discounts.length > 0 ? billForm.discounts : undefined,
    });
  };

  // Close dialog after successful billing
  if (createInvoiceFromEnrollment.isSuccess && billDialogOpen) {
    setBillDialogOpen(false);
    setBillForm({ enrollment: '', payment_plan: '', discounts: [] });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Billing & Payments</h2>
          <p className="text-muted-foreground">
            See your outstanding invoices, recent payments, and manage billing settings.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => setBillDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Bill a Student
          </Button>
          <Button variant="outline" onClick={() => navigate('/payments/payments')}>
            <DollarSign className="mr-2 h-4 w-4" />
            Record Payment
          </Button>
          <Button variant="outline" onClick={() => navigate('/payments/invoices')}>
            <FileText className="mr-2 h-4 w-4" />
            View Invoices
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Outstanding Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{outstandingCount}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Invoices that are issued or overdue.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>All Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{invoices.length}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Total invoices in the system.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Payments Received</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {totalReceived.toLocaleString(undefined, {
                style: 'currency',
                currency: 'USD',
              })}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Total value of completed payments.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bill a Student Wizard */}
      <Dialog open={billDialogOpen} onOpenChange={setBillDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bill a Student</DialogTitle>
            <DialogDescription>
              Select an enrollment and payment plan to automatically create an invoice.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Enrollment *</Label>
              <Select
                value={billForm.enrollment}
                onValueChange={(value) => setBillForm((prev) => ({ ...prev, enrollment: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select enrollment" />
                </SelectTrigger>
                <SelectContent>
                  {enrollments.map((enrollment: any) => (
                    <SelectItem key={enrollment.id} value={enrollment.id}>
                      {enrollment.student_name || enrollment.student_email || enrollment.student}-{' '}
                      {enrollment.cohort_name || enrollment.cohort}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Payment Plan *</Label>
              <Select
                value={billForm.payment_plan}
                onValueChange={(value) =>
                  setBillForm((prev) => ({ ...prev, payment_plan: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment plan" />
                </SelectTrigger>
                <SelectContent>
                  {paymentPlans.map((plan: any) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} ({plan.type_display || plan.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Discounts (Optional)</Label>
              <div className="max-h-40 overflow-y-auto space-y-2 border rounded-md p-2">
                {discounts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    No active discounts available
                  </p>
                ) : (
                  discounts.map((discount: DiscountDto) => (
                    <div key={discount.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`discount-${discount.id}`}
                        checked={billForm.discounts.includes(discount.id)}
                        onCheckedChange={(checked) =>
                          handleToggleDiscount(discount.id, Boolean(checked))
                        }
                      />
                      <Label
                        htmlFor={`discount-${discount.id}`}
                        className="flex-1 cursor-pointer text-sm"
                      >
                        {discount.name} -{' '}
                        {discount.type === 'PERCENTAGE' ? `${discount.value}%` : discount.value}
                      </Label>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setBillDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleBillSubmit}
              disabled={createInvoiceFromEnrollment.isPending}
            >
              Create Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

