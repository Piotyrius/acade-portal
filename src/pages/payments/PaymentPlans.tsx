import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPaymentPlans,
  createPaymentPlan,
  updatePaymentPlan,
  deletePaymentPlan,
  PaymentPlanDto,
  PaymentPlanRequest,
} from '@/api/endpoints/payments';
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
import { Checkbox } from '@/components/ui/checkbox';

export default function PaymentPlans() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PaymentPlanDto | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'MONTHLY' as 'MONTHLY' | 'FULL' | 'CUSTOM',
    installment_count: '',
    is_active: true,
  });

  const { data: paymentPlans = [], isLoading } = useQuery({
    queryKey: ['paymentPlans'],
    queryFn: () => getPaymentPlans(),
    enabled: user?.role === 'ADMIN',
  });

  const createMutation = useMutation({
    mutationFn: createPaymentPlan,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['paymentPlans'] });
      toast({ title: 'Success', description: 'Payment plan created successfully' });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PaymentPlanRequest> }) =>
      updatePaymentPlan(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['paymentPlans'] });
      toast({ title: 'Success', description: 'Payment plan updated successfully' });
      setIsDialogOpen(false);
      setEditingPlan(null);
      resetForm();
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePaymentPlan,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['paymentPlans'] });
      toast({ title: 'Success', description: 'Payment plan deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'MONTHLY',
      installment_count: '',
      is_active: true,
    });
  };

  const handleOpenDialog = (plan?: PaymentPlanDto) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        type: plan.type,
        installment_count: plan.installment_count?.toString() || '',
        is_active: plan.is_active,
      });
    } else {
      setEditingPlan(null);
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast({
        title: 'Error',
        description: 'Name is required',
        variant: 'destructive',
      });
      return;
    }

    const payload: PaymentPlanRequest = {
      name: formData.name,
      type: formData.type,
      installment_count: formData.installment_count ? parseInt(formData.installment_count) : undefined,
      is_active: formData.is_active,
    };

    if (editingPlan) {
      updateMutation.mutate({ id: editingPlan.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this payment plan?')) {
      deleteMutation.mutate(id);
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Payment Plans</h2>
          <p className="text-muted-foreground">You don't have permission to view payment plans</p>
        </div>
      </div>
    );
  }

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Payment Plans</h2>
          <p className="text-muted-foreground">Manage payment plan configurations</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Create Payment Plan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paymentPlans.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No payment plans found</p>
            ) : (
              paymentPlans.map((plan: PaymentPlanDto) => (
                <div
                  key={plan.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-medium">{plan.name}</p>
                      <Badge variant={plan.is_active ? 'default' : 'outline'}>
                        {plan.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="secondary">{plan.type_display || plan.type}</Badge>
                    </div>
                    {plan.installment_count && (
                      <p className="text-sm text-muted-foreground">
                        Installments: {plan.installment_count}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(plan)}
                      title="Edit Payment Plan"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(plan.id)}
                      title="Delete Payment Plan"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPlan ? 'Edit Payment Plan' : 'Create Payment Plan'}</DialogTitle>
            <DialogDescription>
              {editingPlan ? 'Update payment plan details' : 'Create a new payment plan'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Payment plan name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'MONTHLY' | 'FULL' | 'CUSTOM') =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY">Monthly Installments</SelectItem>
                    <SelectItem value="FULL">Full Payment</SelectItem>
                    <SelectItem value="CUSTOM">Custom Plan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(formData.type === 'MONTHLY' || formData.type === 'CUSTOM') && (
                <div className="space-y-2">
                  <Label htmlFor="installment_count">Number of Installments</Label>
                  <Input
                    id="installment_count"
                    type="number"
                    min="1"
                    value={formData.installment_count}
                    onChange={(e) => setFormData({ ...formData, installment_count: e.target.value })}
                    placeholder="e.g., 12"
                  />
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked as boolean })
                  }
                />
                <Label htmlFor="is_active" className="cursor-pointer">
                  Active
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingPlan ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

