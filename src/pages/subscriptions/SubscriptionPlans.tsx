import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Package, DollarSign } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSubscriptionPlans,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  SubscriptionPlanDto,
} from '@/api/endpoints/subscriptions';
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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

// Helper to format price from minor units
const formatPrice = (priceMinor: number, currency: string): string => {
  const price = priceMinor / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(price);
};

export default function SubscriptionPlans() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlanDto | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_minor: '',
    currency: 'USD',
    billing_period: 'MONTHLY' as 'MONTHLY' | 'YEARLY',
    is_active: true,
    features: [] as string[],
  });
  const [newFeature, setNewFeature] = useState('');

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['subscriptionPlans'],
    queryFn: () => getSubscriptionPlans(),
    enabled: user?.role === 'ADMIN',
  });

  const createMutation = useMutation({
    mutationFn: createSubscriptionPlan,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscriptionPlans'] });
      toast({ title: 'Success', description: 'Subscription plan created successfully' });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SubscriptionPlanDto> }) =>
      updateSubscriptionPlan(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscriptionPlans'] });
      toast({ title: 'Success', description: 'Subscription plan updated successfully' });
      setIsDialogOpen(false);
      setEditingPlan(null);
      resetForm();
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSubscriptionPlan,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscriptionPlans'] });
      toast({ title: 'Success', description: 'Subscription plan deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price_minor: '',
      currency: 'USD',
      billing_period: 'MONTHLY',
      is_active: true,
      features: [],
    });
    setNewFeature('');
  };

  const handleOpenDialog = (plan?: SubscriptionPlanDto) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        description: plan.description,
        price_minor: (plan.price_minor / 100).toString(),
        currency: plan.currency,
        billing_period: plan.billing_period,
        is_active: plan.is_active,
        features: plan.features || [],
      });
    } else {
      setEditingPlan(null);
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()],
      });
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price_minor) {
      toast({
        title: 'Error',
        description: 'Name and price are required',
        variant: 'destructive',
      });
      return;
    }

    const priceMinor = Math.round(parseFloat(formData.price_minor) * 100);
    if (isNaN(priceMinor) || priceMinor < 0) {
      toast({
        title: 'Error',
        description: 'Invalid price',
        variant: 'destructive',
      });
      return;
    }

    const payload: Partial<SubscriptionPlanDto> = {
      name: formData.name,
      description: formData.description,
      price_minor: priceMinor,
      currency: formData.currency,
      billing_period: formData.billing_period,
      is_active: formData.is_active,
      features: formData.features,
    };

    if (editingPlan) {
      updateMutation.mutate({ id: editingPlan.id, data: payload });
    } else {
      createMutation.mutate(payload as any);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this subscription plan?')) {
      deleteMutation.mutate(id);
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Subscription Plans</h2>
          <p className="text-muted-foreground">You don't have permission to view subscription plans</p>
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
          <h2 className="text-3xl font-bold tracking-tight">Subscription Plans</h2>
          <p className="text-muted-foreground">Manage subscription plans and pricing</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Create Plan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscription Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {plans.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No subscription plans found</p>
            ) : (
              plans.map((plan) => (
                <div
                  key={plan.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-5 w-5 text-muted-foreground" />
                      <p className="font-medium">{plan.name}</p>
                      <Badge variant={plan.is_active ? 'default' : 'outline'}>
                        {plan.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="secondary">{plan.billing_period}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{plan.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {formatPrice(plan.price_minor, plan.currency)} / {plan.billing_period === 'MONTHLY' ? 'month' : 'year'}
                        </span>
                      </div>
                      {plan.features && plan.features.length > 0 && (
                        <span className="text-muted-foreground">
                          {plan.features.length} feature{plan.features.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(plan)}
                      title="Edit Plan"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(plan.id)}
                      title="Delete Plan"
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPlan ? 'Edit Subscription Plan' : 'Create Subscription Plan'}</DialogTitle>
            <DialogDescription>
              {editingPlan ? 'Update subscription plan details' : 'Create a new subscription plan'}
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
                  placeholder="Plan name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Plan description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price_minor">Price (in major units) *</Label>
                  <Input
                    id="price_minor"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price_minor}
                    onChange={(e) => setFormData({ ...formData, price_minor: e.target.value })}
                    placeholder="e.g., 99.99"
                    required
                  />
                  <p className="text-xs text-muted-foreground">Enter amount in major currency units</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GEL">GEL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="billing_period">Billing Period *</Label>
                <Select
                  value={formData.billing_period}
                  onValueChange={(value) => setFormData({ ...formData, billing_period: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                    <SelectItem value="YEARLY">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Features</Label>
                <div className="flex gap-2">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Add feature"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={handleAddFeature}>
                    Add
                  </Button>
                </div>
                {formData.features.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {feature}
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(index)}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
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
