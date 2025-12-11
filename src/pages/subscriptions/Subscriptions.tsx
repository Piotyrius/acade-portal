import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Edit, Trash2, CreditCard, Calendar } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  getOrganizations,
  getSubscriptionPlans,
  SubscriptionDto,
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
import { format } from 'date-fns';

export default function Subscriptions() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<SubscriptionDto | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [orgFilter, setOrgFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [formData, setFormData] = useState({
    organization: '',
    plan: '',
    status: 'TRIAL' as 'TRIAL' | 'ACTIVE' | 'CANCELLED' | 'EXPIRED',
    started_at: new Date().toISOString().split('T')[0],
    expires_at: '',
  });

  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ['subscriptions', orgFilter, statusFilter],
    queryFn: () =>
      getSubscriptions({
        organizationId: orgFilter !== 'all' ? orgFilter : undefined,
        status: statusFilter !== 'all' ? (statusFilter as any) : undefined,
      }),
    enabled: user?.role === 'ADMIN',
  });

  const { data: organizations = [] } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => getOrganizations(),
    enabled: user?.role === 'ADMIN',
  });

  const { data: plans = [] } = useQuery({
    queryKey: ['subscriptionPlans'],
    queryFn: () => getSubscriptionPlans(),
    enabled: user?.role === 'ADMIN',
  });

  const createMutation = useMutation({
    mutationFn: createSubscription,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscriptions'] });
      toast({ title: 'Success', description: 'Subscription created successfully' });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SubscriptionDto> }) =>
      updateSubscription(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscriptions'] });
      toast({ title: 'Success', description: 'Subscription updated successfully' });
      setIsDialogOpen(false);
      setEditingSubscription(null);
      resetForm();
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSubscription,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscriptions'] });
      toast({ title: 'Success', description: 'Subscription deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({
      organization: '',
      plan: '',
      status: 'TRIAL',
      started_at: new Date().toISOString().split('T')[0],
      expires_at: '',
    });
  };

  const handleOpenDialog = (subscription?: SubscriptionDto) => {
    if (subscription) {
      setEditingSubscription(subscription);
      setFormData({
        organization: subscription.organization,
        plan: subscription.plan,
        status: subscription.status,
        started_at: subscription.started_at.split('T')[0],
        expires_at: subscription.expires_at ? subscription.expires_at.split('T')[0] : '',
      });
    } else {
      setEditingSubscription(null);
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.organization || !formData.plan) {
      toast({
        title: 'Error',
        description: 'Organization and plan are required',
        variant: 'destructive',
      });
      return;
    }

    const payload: Partial<SubscriptionDto> = {
      organization: formData.organization,
      plan: formData.plan,
      status: formData.status,
      started_at: new Date(formData.started_at).toISOString(),
      expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
    };

    if (editingSubscription) {
      updateMutation.mutate({ id: editingSubscription.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this subscription?')) {
      deleteMutation.mutate(id);
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Subscriptions</h2>
          <p className="text-muted-foreground">You don't have permission to view subscriptions</p>
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

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const org = organizations.find((o) => o.id === sub.organization);
    const plan = plans.find((p) => p.id === sub.plan);
    const matchesSearch =
      (org && org.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (plan && plan.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'TRIAL':
        return 'secondary';
      case 'CANCELLED':
        return 'outline';
      case 'EXPIRED':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Subscriptions</h2>
          <p className="text-muted-foreground">Manage organization subscriptions</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Create Subscription
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search subscriptions..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={orgFilter} onValueChange={setOrgFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by organization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Organizations</SelectItem>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="TRIAL">Trial</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* List */}
            {filteredSubscriptions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No subscriptions found</p>
            ) : (
              filteredSubscriptions.map((subscription) => {
                const org = organizations.find((o) => o.id === subscription.organization);
                const plan = plans.find((p) => p.id === subscription.plan);
                const expired = isExpired(subscription.expires_at);

                return (
                  <div
                    key={subscription.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                        <p className="font-medium">
                          {org?.name || 'Unknown Organization'} - {plan?.name || 'Unknown Plan'}
                        </p>
                        <Badge variant={getStatusVariant(subscription.status)}>
                          {subscription.status}
                        </Badge>
                        {expired && subscription.status !== 'EXPIRED' && (
                          <Badge variant="destructive">Expired</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Started: {format(new Date(subscription.started_at), 'PP')}
                          </span>
                        </div>
                        {subscription.expires_at && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Expires: {format(new Date(subscription.expires_at), 'PP')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDialog(subscription)}
                        title="Edit Subscription"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(subscription.id)}
                        title="Delete Subscription"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSubscription ? 'Edit Subscription' : 'Create Subscription'}
            </DialogTitle>
            <DialogDescription>
              {editingSubscription
                ? 'Update subscription details'
                : 'Create a new subscription for an organization'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="organization">Organization *</Label>
                <Select
                  value={formData.organization}
                  onValueChange={(value) => setFormData({ ...formData, organization: value })}
                  disabled={!!editingSubscription}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan">Plan *</Label>
                <Select
                  value={formData.plan}
                  onValueChange={(value) => setFormData({ ...formData, plan: value })}
                  disabled={!!editingSubscription}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.filter((p) => p.is_active).map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TRIAL">Trial</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="EXPIRED">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="started_at">Started At *</Label>
                <Input
                  id="started_at"
                  type="date"
                  value={formData.started_at}
                  onChange={(e) => setFormData({ ...formData, started_at: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expires_at">Expires At</Label>
                <Input
                  id="expires_at"
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">Leave empty for no expiration</p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingSubscription ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
