import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Search, Building2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getOrganizations,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getOrganizationSubscriptionStatus,
  OrganizationDto,
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

export default function Organizations() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<OrganizationDto | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'TRIAL' | 'SUSPENDED',
  });
  const [subscriptionStatuses, setSubscriptionStatuses] = useState<Record<string, FeatureStatusDto>>({});

  const { data: organizations = [], isLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => getOrganizations(),
    enabled: user?.role === 'ADMIN',
  });

  // Fetch subscription status for each organization
  const fetchSubscriptionStatus = async (orgId: string) => {
    try {
      const status = await getOrganizationSubscriptionStatus(orgId);
      setSubscriptionStatuses((prev) => ({ ...prev, [orgId]: status }));
    } catch (error) {
      // Silently fail - subscription status is optional
    }
  };

  const createMutation = useMutation({
    mutationFn: createOrganization,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['organizations'] });
      toast({ title: 'Success', description: 'Organization created successfully' });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<OrganizationDto> }) =>
      updateOrganization(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['organizations'] });
      toast({ title: 'Success', description: 'Organization updated successfully' });
      setIsDialogOpen(false);
      setEditingOrg(null);
      resetForm();
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOrganization,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['organizations'] });
      toast({ title: 'Success', description: 'Organization deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      domain: '',
      status: 'ACTIVE',
    });
  };

  const handleOpenDialog = (org?: OrganizationDto) => {
    if (org) {
      setEditingOrg(org);
      setFormData({
        name: org.name,
        domain: org.domain || '',
        status: org.status,
      });
    } else {
      setEditingOrg(null);
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

    const payload: Partial<OrganizationDto> = {
      name: formData.name,
      domain: formData.domain || undefined,
      status: formData.status,
    };

    if (editingOrg) {
      updateMutation.mutate({ id: editingOrg.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this organization?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleViewSubscriptionStatus = (orgId: string) => {
    if (!subscriptionStatuses[orgId]) {
      fetchSubscriptionStatus(orgId);
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Organizations</h2>
          <p className="text-muted-foreground">You don't have permission to view organizations</p>
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

  const filteredOrganizations = organizations.filter((org) => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (org.domain && org.domain.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || org.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'TRIAL':
        return 'secondary';
      case 'INACTIVE':
        return 'outline';
      case 'SUSPENDED':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Organizations</h2>
          <p className="text-muted-foreground">Manage organizations and their subscriptions</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Create Organization
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organizations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search organizations..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="TRIAL">Trial</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* List */}
            {filteredOrganizations.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No organizations found</p>
            ) : (
              filteredOrganizations.map((org) => {
                const subStatus = subscriptionStatuses[org.id];
                return (
                  <div
                    key={org.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                        <p className="font-medium">{org.name}</p>
                        <Badge variant={getStatusVariant(org.status)}>
                          {org.status}
                        </Badge>
                        {subStatus && (
                          <Badge variant={subStatus.is_active ? 'default' : 'outline'}>
                            {subStatus.has_subscription ? `Subscribed: ${subStatus.plan_name || 'N/A'}` : 'No Subscription'}
                          </Badge>
                        )}
                      </div>
                      {org.domain && (
                        <p className="text-sm text-muted-foreground">Domain: {org.domain}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Created: {new Date(org.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewSubscriptionStatus(org.id)}
                        title="View Subscription Status"
                      >
                        View Status
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDialog(org)}
                        title="Edit Organization"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(org.id)}
                        title="Delete Organization"
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
            <DialogTitle>{editingOrg ? 'Edit Organization' : 'Create Organization'}</DialogTitle>
            <DialogDescription>
              {editingOrg ? 'Update organization details' : 'Create a new organization'}
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
                  placeholder="Organization name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="domain">Domain</Label>
                <Input
                  id="domain"
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  placeholder="example.com (optional)"
                />
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
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="TRIAL">Trial</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="SUSPENDED">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingOrg ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
