import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMySubscription,
  getFeatureStatus,
  getAvailablePlans,
  createNewSubscription,
  SubscriptionDto,
  SubscriptionPlanDto,
  FeatureStatusDto,
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
import { Package, CheckCircle2, XCircle, Calendar, DollarSign, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

// Helper to format price from minor units
const formatPrice = (priceMinor: number, currency: string): string => {
  const price = priceMinor / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(price);
};

export default function MySubscription() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('');

  const { data: subscription, isLoading: subscriptionLoading } = useQuery<SubscriptionDto>({
    queryKey: ['my-subscription'],
    queryFn: () => getMySubscription(),
  });

  const { data: featureStatus, isLoading: featureLoading } = useQuery<FeatureStatusDto>({
    queryKey: ['feature-status'],
    queryFn: () => getFeatureStatus(),
  });

  const { data: availablePlans = [], isLoading: plansLoading } = useQuery<SubscriptionPlanDto[]>({
    queryKey: ['available-plans'],
    queryFn: () => getAvailablePlans(),
    enabled: !subscription || !subscription.id,
  });

  const createMutation = useMutation({
    mutationFn: createNewSubscription,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-subscription', 'feature-status'] });
      toast({ title: 'Success', description: 'Subscription created successfully' });
      setIsCreateDialogOpen(false);
      setSelectedPlanId('');
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const handleCreateSubscription = () => {
    if (!selectedPlanId) {
      toast({
        title: 'Error',
        description: 'Please select a plan',
        variant: 'destructive',
      });
      return;
    }

    createMutation.mutate({ plan_id: selectedPlanId });
  };

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

  const isLoading = subscriptionLoading || featureLoading;

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
          <h2 className="text-3xl font-bold tracking-tight">My Subscription</h2>
          <p className="text-muted-foreground">View your subscription and feature access</p>
        </div>
        {!subscription && (
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Package className="mr-2 h-4 w-4" />
            Create Subscription
          </Button>
        )}
      </div>

      {!subscription ? (
        <Card>
          <CardHeader>
            <CardTitle>No Active Subscription</CardTitle>
            <CardDescription>You don't have an active subscription</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                Create a subscription to access premium features
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                Browse Plans
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Subscription Details */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription Details</CardTitle>
              <CardDescription>Your current subscription information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Status</span>
                </div>
                <Badge variant={getStatusVariant(subscription.status)}>
                  {subscription.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Started</span>
                </div>
                <span className="text-muted-foreground">
                  {format(new Date(subscription.started_at), 'PP')}
                </span>
              </div>
              {subscription.expires_at && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">Expires</span>
                  </div>
                  <span className="text-muted-foreground">
                    {format(new Date(subscription.expires_at), 'PP')}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Feature Status */}
          {featureStatus && (
            <Card>
              <CardHeader>
                <CardTitle>Feature Access</CardTitle>
                <CardDescription>Available features for your subscription</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Subscription Active</span>
                  {featureStatus.is_active ? (
                    <Badge variant="default" className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      Inactive
                    </Badge>
                  )}
                </div>
                {featureStatus.plan_name && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Plan</span>
                    <span className="text-muted-foreground">{featureStatus.plan_name}</span>
                  </div>
                )}
                {featureStatus.enabled_modules && featureStatus.enabled_modules.length > 0 && (
                  <div>
                    <span className="font-medium mb-2 block">Enabled Modules</span>
                    <div className="flex flex-wrap gap-2">
                      {featureStatus.enabled_modules.map((module) => (
                        <Badge key={module} variant="secondary">
                          {module}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Create Subscription Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Subscription</DialogTitle>
            <DialogDescription>Select a subscription plan</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {plansLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : availablePlans.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No plans available</p>
            ) : (
              <div className="space-y-2">
                <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePlans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{plan.name}</span>
                          <span className="ml-4 text-muted-foreground">
                            {formatPrice(plan.price_minor, plan.currency)} /{' '}
                            {plan.billing_period === 'MONTHLY' ? 'month' : 'year'}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedPlanId && (
                  <div className="mt-4 p-4 border rounded-lg">
                    {(() => {
                      const plan = availablePlans.find((p) => p.id === selectedPlanId);
                      if (!plan) return null;
                      return (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{plan.name}</span>
                            <span className="text-lg font-bold">
                              {formatPrice(plan.price_minor, plan.currency)} /{' '}
                              {plan.billing_period === 'MONTHLY' ? 'month' : 'year'}
                            </span>
                          </div>
                          {plan.description && (
                            <p className="text-sm text-muted-foreground">{plan.description}</p>
                          )}
                          {plan.features && plan.features.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-medium mb-2">Features:</p>
                              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                {plan.features.map((feature, index) => (
                                  <li key={index}>{feature}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateSubscription}
              disabled={!selectedPlanId || createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Subscription'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

