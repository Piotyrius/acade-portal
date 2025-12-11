import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectItem, SelectValue, SelectContent } from '@/components/ui/select';
import { Search, Plus, Edit, Trash2, Eye, FileText, CheckCircle, XCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  issueInvoice,
  applyDiscountsToInvoice,
  getInvoiceOutstandingBalance,
  createInvoiceForEnrollment,
  InvoiceDto,
  InvoiceRequest,
  getPricings,
} from '@/api/endpoints/payments';
import { getEnrollments } from '@/api/endpoints/admissions';
import { getPaymentPlans } from '@/api/endpoints/payments';
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
import { getDiscounts, DiscountDto } from '@/api/endpoints/payments';
import { CardListSkeleton } from '@/components/ui/table-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function Invoices() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDiscountDialogOpen, setIsDiscountDialogOpen] = useState(false);
  const [isCreateFromEnrollmentOpen, setIsCreateFromEnrollmentOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<InvoiceDto | null>(null);
  const [selectedInvoiceForDiscounts, setSelectedInvoiceForDiscounts] = useState<InvoiceDto | null>(null);
  const [selectedDiscounts, setSelectedDiscounts] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    enrollment: '',
    payment_plan: '',
    pricing: '',
    subtotal: '',
    discount_amount: '',
    total_amount: '',
    due_date: '',
    notes: '',
  });

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices', selectedStatus],
    queryFn: () => getInvoices(selectedStatus && selectedStatus !== 'all' ? { status: selectedStatus as any } : undefined),
    enabled: user?.role === 'ADMIN',
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments'],
    queryFn: () => getEnrollments(),
    enabled: user?.role === 'ADMIN',
  });

  const { data: paymentPlans = [] } = useQuery({
    queryKey: ['paymentPlans'],
    queryFn: () => getPaymentPlans(),
    enabled: user?.role === 'ADMIN',
  });

  const { data: pricings = [] } = useQuery({
    queryKey: ['pricings'],
    queryFn: () => getPricings({ is_active: true }),
    enabled: user?.role === 'ADMIN',
  });

  const { data: discounts = [] } = useQuery({
    queryKey: ['discounts'],
    queryFn: () => getDiscounts({ is_active: true }),
    enabled: user?.role === 'ADMIN' && isDiscountDialogOpen,
  });

  const createMutation = useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      toast({ title: 'Success', description: 'Invoice created successfully' });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InvoiceRequest> }) => updateInvoice(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      toast({ title: 'Success', description: 'Invoice updated successfully' });
      setIsDialogOpen(false);
      setEditingInvoice(null);
      resetForm();
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteInvoice,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      toast({ title: 'Success', description: 'Invoice deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const issueMutation = useMutation({
    mutationFn: issueInvoice,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      toast({ title: 'Success', description: 'Invoice issued successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const applyDiscountsMutation = useMutation({
    mutationFn: ({ id, discountIds }: { id: string; discountIds: string[] }) =>
      applyDiscountsToInvoice(id, discountIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      toast({ title: 'Success', description: 'Discounts applied successfully' });
      setIsDiscountDialogOpen(false);
      setSelectedInvoiceForDiscounts(null);
      setSelectedDiscounts([]);
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const createFromEnrollmentMutation = useMutation({
    mutationFn: ({ enrollmentId, paymentPlanId, discountIds }: { enrollmentId: string; paymentPlanId: string; discountIds?: string[] }) =>
      createInvoiceForEnrollment(enrollmentId, paymentPlanId, discountIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      toast({ title: 'Success', description: 'Invoice created from enrollment successfully' });
      setIsCreateFromEnrollmentOpen(false);
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({
      enrollment: '',
      payment_plan: '',
      pricing: '',
      subtotal: '',
      discount_amount: '',
      total_amount: '',
      due_date: '',
      notes: '',
    });
  };

  const handleOpenDialog = (invoice?: InvoiceDto) => {
    if (invoice && invoice.status === 'DRAFT') {
      setEditingInvoice(invoice);
      setFormData({
        enrollment: invoice.enrollment,
        payment_plan: invoice.payment_plan || '',
        pricing: invoice.pricing || '',
        subtotal: invoice.subtotal,
        discount_amount: invoice.discount_amount || '',
        total_amount: invoice.total_amount,
        due_date: invoice.due_date,
        notes: invoice.notes || '',
      });
    } else {
      setEditingInvoice(null);
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.enrollment || !formData.pricing || !formData.total_amount || !formData.due_date) {
      toast({
        title: 'Error',
        description: 'Enrollment, pricing, total amount, and due date are required',
        variant: 'destructive',
      });
      return;
    }

    const payload: InvoiceRequest = {
      enrollment: formData.enrollment,
      payment_plan: formData.payment_plan || undefined,
      pricing: formData.pricing,
      subtotal: formData.subtotal || formData.total_amount,
      discount_amount: formData.discount_amount || undefined,
      total_amount: formData.total_amount,
      due_date: formData.due_date,
      notes: formData.notes || undefined,
      status: 'DRAFT',
    };

    if (editingInvoice) {
      updateMutation.mutate({ id: editingInvoice.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleIssue = (id: string) => {
    if (confirm('Are you sure you want to issue this invoice? This action cannot be undone.')) {
      issueMutation.mutate(id);
    }
  };

  const handleOpenDiscountDialog = (invoice: InvoiceDto) => {
    setSelectedInvoiceForDiscounts(invoice);
    setSelectedDiscounts([]);
    setIsDiscountDialogOpen(true);
  };

  const handleApplyDiscounts = () => {
    if (!selectedInvoiceForDiscounts || selectedDiscounts.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one discount',
        variant: 'destructive',
      });
      return;
    }
    applyDiscountsMutation.mutate({
      id: selectedInvoiceForDiscounts.id,
      discountIds: selectedDiscounts,
    });
  };

  const handleCreateFromEnrollment = () => {
    if (!formData.enrollment) {
      toast({
        title: 'Error',
        description: 'Please select an enrollment',
        variant: 'destructive',
      });
      return;
    }
    if (!formData.payment_plan) {
      toast({
        title: 'Error',
        description: 'Please select a payment plan',
        variant: 'destructive',
      });
      return;
    }
    createFromEnrollmentMutation.mutate({
      enrollmentId: formData.enrollment,
      paymentPlanId: formData.payment_plan,
      discountIds: selectedDiscounts.length > 0 ? selectedDiscounts : undefined,
    });
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'outline';
      case 'ISSUED':
        return 'default';
      case 'PARTIAL':
        return 'secondary';
      case 'PAID':
        return 'default';
      case 'OVERDUE':
        return 'destructive';
      case 'CANCELLED':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount || '0');
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
  };

  const filteredInvoices = invoices.filter((invoice: InvoiceDto) => {
    return (
      searchTerm === '' ||
      invoice.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.cohort_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (user?.role !== 'ADMIN') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
          <p className="text-muted-foreground">You don't have permission to view invoices</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <CardListSkeleton count={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
          <p className="text-muted-foreground">Manage student invoices and payments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsCreateFromEnrollmentOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create from Enrollment
          </Button>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="ISSUED">Issued</SelectItem>
            <SelectItem value="PARTIAL">Partially Paid</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
            <SelectItem value="OVERDUE">Overdue</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredInvoices.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No invoices found</p>
            ) : (
              filteredInvoices.map((invoice: InvoiceDto) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-medium">
                        {invoice.invoice_number || `Invoice #${invoice.id.slice(0, 8)}`}
                      </p>
                      <Badge variant={getStatusVariant(invoice.status)}>
                        {invoice.status_display || invoice.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Student: {invoice.student_name || 'Unknown'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Cohort: {invoice.cohort_name || 'Unknown'}
                    </p>
                    <p className="text-sm font-medium mt-1">
                      Amount: {formatCurrency(invoice.total_amount)}
                    </p>
                    {invoice.outstanding_amount && parseFloat(invoice.outstanding_amount) > 0 && (
                      <p className="text-sm text-destructive">
                        Outstanding: {formatCurrency(invoice.outstanding_amount)}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Due: {new Date(invoice.due_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {invoice.status === 'DRAFT' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(invoice)}
                          title="Edit Invoice"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(invoice.id)}
                          title="Delete Invoice"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {invoice.status === 'DRAFT' && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleIssue(invoice.id)}
                        title="Issue Invoice"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Issue
                      </Button>
                    )}
                    {invoice.status === 'ISSUED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDiscountDialog(invoice)}
                        title="Apply Discounts"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Invoice Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingInvoice ? 'Edit Invoice' : 'Create Invoice'}</DialogTitle>
            <DialogDescription>
              {editingInvoice
                ? 'Update invoice details. Only DRAFT invoices can be edited.'
                : 'Create a new invoice for a student enrollment.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="enrollment">Enrollment *</Label>
                <Select
                  value={formData.enrollment}
                  onValueChange={(value) => setFormData({ ...formData, enrollment: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select enrollment" />
                  </SelectTrigger>
                  <SelectContent>
                    {enrollments.map((enrollment: any) => (
                      <SelectItem key={enrollment.id} value={enrollment.id}>
                        {enrollment.student_name} - {enrollment.cohort_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_plan">Payment Plan</Label>
                <Select
                  value={formData.payment_plan || 'none'}
                  onValueChange={(value) => setFormData({ ...formData, payment_plan: value === 'none' ? '' : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment plan (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Optional)</SelectItem>
                    {paymentPlans.map((plan: any) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} ({plan.type_display || plan.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pricing">Pricing *</Label>
                <Select
                  value={formData.pricing || undefined}
                  onValueChange={(value) => setFormData({ ...formData, pricing: value })}
                  disabled={pricings.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={pricings.length === 0 ? "No active pricings available" : "Select pricing (required)"} />
                  </SelectTrigger>
                  <SelectContent>
                    {pricings.map((pricing: any) => (
                      <SelectItem key={pricing.id} value={pricing.id}>
                        {pricing.pricing_object_name || `Pricing ${pricing.id.slice(0, 8)}`} - {formatCurrency(pricing.amount)} {pricing.currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {pricings.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No active pricings available. Please create a pricing first.
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subtotal">Subtotal</Label>
                  <Input
                    id="subtotal"
                    type="number"
                    step="0.01"
                    value={formData.subtotal}
                    onChange={(e) => setFormData({ ...formData, subtotal: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount_amount">Discount Amount</Label>
                  <Input
                    id="discount_amount"
                    type="number"
                    step="0.01"
                    value={formData.discount_amount}
                    onChange={(e) => setFormData({ ...formData, discount_amount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="total_amount">Total Amount *</Label>
                <Input
                  id="total_amount"
                  type="number"
                  step="0.01"
                  value={formData.total_amount}
                  onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date *</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingInvoice ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Apply Discounts Dialog */}
      <Dialog open={isDiscountDialogOpen} onOpenChange={setIsDiscountDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply Discounts</DialogTitle>
            <DialogDescription>Select discounts to apply to this invoice</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {discounts.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No active discounts available</p>
            ) : (
              discounts.map((discount: DiscountDto) => (
                <div key={discount.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={discount.id}
                    checked={selectedDiscounts.includes(discount.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedDiscounts([...selectedDiscounts, discount.id]);
                      } else {
                        setSelectedDiscounts(selectedDiscounts.filter((id) => id !== discount.id));
                      }
                    }}
                  />
                  <Label htmlFor={discount.id} className="flex-1 cursor-pointer">
                    <div>
                      <p className="font-medium">{discount.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {discount.type === 'PERCENTAGE' ? `${discount.value}%` : formatCurrency(discount.value)} -{' '}
                        {discount.applicable_to_display || discount.applicable_to}
                      </p>
                    </div>
                  </Label>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDiscountDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleApplyDiscounts}
              disabled={applyDiscountsMutation.isPending || selectedDiscounts.length === 0}
            >
              Apply Discounts
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create from Enrollment Dialog */}
      <Dialog open={isCreateFromEnrollmentOpen} onOpenChange={setIsCreateFromEnrollmentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Invoice from Enrollment</DialogTitle>
            <DialogDescription>Select an enrollment and payment plan to automatically create an invoice</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="enrollment-select">Enrollment *</Label>
              <Select
                value={formData.enrollment}
                onValueChange={(value) => setFormData({ ...formData, enrollment: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select enrollment" />
                </SelectTrigger>
                <SelectContent>
                  {enrollments.map((enrollment: any) => (
                    <SelectItem key={enrollment.id} value={enrollment.id}>
                      {enrollment.student_name} - {enrollment.cohort_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-plan-select">Payment Plan *</Label>
              <Select
                value={formData.payment_plan || ''}
                onValueChange={(value) => setFormData({ ...formData, payment_plan: value })}
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
                  <p className="text-sm text-muted-foreground text-center py-2">No active discounts available</p>
                ) : (
                  discounts.map((discount: DiscountDto) => (
                    <div key={discount.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`discount-${discount.id}`}
                        checked={selectedDiscounts.includes(discount.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedDiscounts([...selectedDiscounts, discount.id]);
                          } else {
                            setSelectedDiscounts(selectedDiscounts.filter((id) => id !== discount.id));
                          }
                        }}
                      />
                      <Label htmlFor={`discount-${discount.id}`} className="flex-1 cursor-pointer text-sm">
                        {discount.name} - {discount.type === 'PERCENTAGE' ? `${discount.value}%` : formatCurrency(discount.value)}
                      </Label>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsCreateFromEnrollmentOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreateFromEnrollment}
              disabled={createFromEnrollmentMutation.isPending || !formData.enrollment || !formData.payment_plan}
            >
              Create Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

