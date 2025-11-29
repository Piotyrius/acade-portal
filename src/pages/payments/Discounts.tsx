import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, DollarSign } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDiscounts,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  DiscountDto,
  DiscountRequest,
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

export default function Discounts() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<DiscountDto | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED_AMOUNT',
    value: '',
    applicable_to: 'FULL_PAYMENT' as 'FULL_PAYMENT' | 'SIBLING' | 'CUSTOM',
    code: '',
    min_amount: '',
    max_discount: '',
    is_active: true,
    valid_from: '',
    valid_to: '',
  });

  const { data: discounts = [], isLoading } = useQuery({
    queryKey: ['discounts'],
    queryFn: () => getDiscounts(),
    enabled: user?.role === 'ADMIN',
  });

  const createMutation = useMutation({
    mutationFn: createDiscount,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['discounts'] });
      toast({ title: 'Success', description: 'Discount created successfully' });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<DiscountRequest> }) => updateDiscount(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['discounts'] });
      toast({ title: 'Success', description: 'Discount updated successfully' });
      setIsDialogOpen(false);
      setEditingDiscount(null);
      resetForm();
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDiscount,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['discounts'] });
      toast({ title: 'Success', description: 'Discount deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'PERCENTAGE',
      value: '',
      applicable_to: 'FULL_PAYMENT',
      code: '',
      min_amount: '',
      max_discount: '',
      is_active: true,
      valid_from: '',
      valid_to: '',
    });
  };

  const handleOpenDialog = (discount?: DiscountDto) => {
    if (discount) {
      setEditingDiscount(discount);
      setFormData({
        name: discount.name,
        type: discount.type,
        value: discount.value,
        applicable_to: discount.applicable_to,
        code: discount.code || '',
        min_amount: discount.min_amount || '',
        max_discount: discount.max_discount || '',
        is_active: discount.is_active,
        valid_from: discount.valid_from.split('T')[0],
        valid_to: discount.valid_to ? discount.valid_to.split('T')[0] : '',
      });
    } else {
      setEditingDiscount(null);
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.value || !formData.valid_from) {
      toast({
        title: 'Error',
        description: 'Name, value, and valid from date are required',
        variant: 'destructive',
      });
      return;
    }

    const payload: DiscountRequest = {
      name: formData.name,
      type: formData.type,
      value: formData.value,
      applicable_to: formData.applicable_to,
      code: formData.code || undefined,
      min_amount: formData.min_amount || undefined,
      max_discount: formData.max_discount || undefined,
      is_active: formData.is_active,
      valid_from: new Date(formData.valid_from).toISOString(),
      valid_to: formData.valid_to ? new Date(formData.valid_to).toISOString() : undefined,
    };

    if (editingDiscount) {
      updateMutation.mutate({ id: editingDiscount.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this discount?')) {
      deleteMutation.mutate(id);
    }
  };

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount || '0');
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Discounts</h2>
          <p className="text-muted-foreground">You don't have permission to view discounts</p>
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
          <h2 className="text-3xl font-bold tracking-tight">Discounts</h2>
          <p className="text-muted-foreground">Manage discount codes and promotions</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Create Discount
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Discounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {discounts.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No discounts found</p>
            ) : (
              discounts.map((discount: DiscountDto) => (
                <div
                  key={discount.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-medium">{discount.name}</p>
                      <Badge variant={discount.is_active ? 'default' : 'outline'}>
                        {discount.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="secondary">
                        {discount.type === 'PERCENTAGE' ? `${discount.value}%` : formatCurrency(discount.value)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Applicable to: {discount.applicable_to_display || discount.applicable_to}
                    </p>
                    {discount.code && (
                      <p className="text-sm text-muted-foreground">Code: {discount.code}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Valid from: {new Date(discount.valid_from).toLocaleDateString()}
                      {discount.valid_to && ` to ${new Date(discount.valid_to).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(discount)}
                      title="Edit Discount"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(discount.id)}
                      title="Delete Discount"
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingDiscount ? 'Edit Discount' : 'Create Discount'}</DialogTitle>
            <DialogDescription>
              {editingDiscount ? 'Update discount details' : 'Create a new discount code or promotion'}
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
                  placeholder="Discount name"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: 'PERCENTAGE' | 'FIXED_AMOUNT') =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                      <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">Value *</Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder={formData.type === 'PERCENTAGE' ? '0-100' : '0.00'}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="applicable_to">Applicable To *</Label>
                <Select
                  value={formData.applicable_to}
                  onValueChange={(value: 'FULL_PAYMENT' | 'SIBLING' | 'CUSTOM') =>
                    setFormData({ ...formData, applicable_to: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FULL_PAYMENT">Full Payment</SelectItem>
                    <SelectItem value="SIBLING">Sibling Discount</SelectItem>
                    <SelectItem value="CUSTOM">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Discount Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Optional discount code"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min_amount">Minimum Amount</Label>
                  <Input
                    id="min_amount"
                    type="number"
                    step="0.01"
                    value={formData.min_amount}
                    onChange={(e) => setFormData({ ...formData, min_amount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_discount">Maximum Discount</Label>
                  <Input
                    id="max_discount"
                    type="number"
                    step="0.01"
                    value={formData.max_discount}
                    onChange={(e) => setFormData({ ...formData, max_discount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valid_from">Valid From *</Label>
                  <Input
                    id="valid_from"
                    type="date"
                    value={formData.valid_from}
                    onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valid_to">Valid To</Label>
                  <Input
                    id="valid_to"
                    type="date"
                    value={formData.valid_to}
                    onChange={(e) => setFormData({ ...formData, valid_to: e.target.value })}
                  />
                </div>
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
                {editingDiscount ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

