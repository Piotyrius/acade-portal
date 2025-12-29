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
import { useTranslation } from 'react-i18next';

export default function Discounts() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const { t } = useTranslation('common');
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
      toast({
        title: t('common:pages.discountsToastCreateTitle'),
        description: t('common:pages.discountsToastCreateDescription'),
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: t('common:pages.discountsToastErrorTitle'),
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<DiscountRequest> }) => updateDiscount(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['discounts'] });
      toast({
        title: t('common:pages.discountsToastUpdateTitle'),
        description: t('common:pages.discountsToastUpdateDescription'),
      });
      setIsDialogOpen(false);
      setEditingDiscount(null);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: t('common:pages.discountsToastErrorTitle'),
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDiscount,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['discounts'] });
      toast({
        title: t('common:pages.discountsToastDeleteTitle'),
        description: t('common:pages.discountsToastDeleteDescription'),
      });
    },
    onError: (error) => {
      toast({
        title: t('common:pages.discountsToastErrorTitle'),
        description: getErrorMessage(error),
        variant: 'destructive',
      });
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
        title: t('common:pages.discountsToastErrorTitle'),
        description: t('common:pages.discountsErrorRequired'),
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
    if (confirm(t('common:pages.discountsDeleteConfirm'))) {
      deleteMutation.mutate(id);
    }
  };

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount || '0');
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'GEL',
    }).format(num);
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('common:pages.discountsTitle')}</h2>
          <p className="text-muted-foreground">{t('common:pages.discountsNoPermission')}</p>
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
          <h2 className="text-3xl font-bold tracking-tight">{t('common:pages.discountsTitle')}</h2>
          <p className="text-muted-foreground">{t('common:pages.discountsSubtitle')}</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          {t('common:pages.discountsCreate')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('common:pages.discountsCardTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {discounts.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                {t('common:pages.discountsNoneFound')}
              </p>
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
                        {discount.is_active
                          ? t('common:pages.discountsStatusActive')
                          : t('common:pages.discountsStatusInactive')}
                      </Badge>
                      <Badge variant="secondary">
                        {discount.type === 'PERCENTAGE'
                          ? t('common:pages.discountsBadgePercentage', { value: discount.value })
                          : t('common:pages.discountsBadgeFixed', {
                              value: formatCurrency(discount.value),
                            })}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t('common:pages.discountsApplicableToLabel')}{' '}
                      {discount.applicable_to_display || discount.applicable_to}
                    </p>
                    {discount.code && (
                      <p className="text-sm text-muted-foreground">
                        {t('common:pages.discountsCodeLabel')}: {discount.code}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('common:pages.discountsValidFromLabel')}:{' '}
                      {new Date(discount.valid_from).toLocaleDateString()}
                      {discount.valid_to &&
                        ` ${t('common:pages.discountsValidToSeparator')} ${new Date(
                          discount.valid_to,
                        ).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(discount)}
                      title={t('common:pages.discountsEditTooltip')}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(discount.id)}
                      title={t('common:pages.discountsDeleteTooltip')}
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
            <DialogTitle>
              {editingDiscount
                ? t('common:pages.discountsDialogTitleEdit')
                : t('common:pages.discountsDialogTitleCreate')}
            </DialogTitle>
            <DialogDescription>
              {editingDiscount
                ? t('common:pages.discountsDialogDescriptionEdit')
                : t('common:pages.discountsDialogDescriptionCreate')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('common:pages.discountsFieldName')} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('common:pages.discountsFieldNamePlaceholder')}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">{t('common:pages.discountsFieldType')} *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: 'PERCENTAGE' | 'FIXED_AMOUNT') =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('common:pages.discountsFieldTypePlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">
                        {t('common:pages.discountsTypePercentage')}
                      </SelectItem>
                      <SelectItem value="FIXED_AMOUNT">
                        {t('common:pages.discountsTypeFixed')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">{t('common:pages.discountsFieldValue')} *</Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder={
                      formData.type === 'PERCENTAGE'
                        ? t('common:pages.discountsFieldValuePlaceholderPercentage')
                        : t('common:pages.discountsFieldValuePlaceholderFixed')
                    }
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="applicable_to">
                  {t('common:pages.discountsFieldApplicableTo')} *
                </Label>
                <Select
                  value={formData.applicable_to}
                  onValueChange={(value: 'FULL_PAYMENT' | 'SIBLING' | 'CUSTOM') =>
                    setFormData({ ...formData, applicable_to: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('common:pages.discountsFieldApplicableToPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FULL_PAYMENT">
                      {t('common:pages.discountsApplicableFullPayment')}
                    </SelectItem>
                    <SelectItem value="SIBLING">
                      {t('common:pages.discountsApplicableSibling')}
                    </SelectItem>
                    <SelectItem value="CUSTOM">
                      {t('common:pages.discountsApplicableCustom')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">{t('common:pages.discountsFieldCode')}</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder={t('common:pages.discountsFieldCodePlaceholder')}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min_amount">
                    {t('common:pages.discountsFieldMinAmount')}
                  </Label>
                  <Input
                    id="min_amount"
                    type="number"
                    step="0.01"
                    value={formData.min_amount}
                    onChange={(e) => setFormData({ ...formData, min_amount: e.target.value })}
                    placeholder={t('common:pages.discountsFieldMinAmountPlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_discount">
                    {t('common:pages.discountsFieldMaxDiscount')}
                  </Label>
                  <Input
                    id="max_discount"
                    type="number"
                    step="0.01"
                    value={formData.max_discount}
                    onChange={(e) => setFormData({ ...formData, max_discount: e.target.value })}
                    placeholder={t('common:pages.discountsFieldMaxDiscountPlaceholder')}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valid_from">
                    {t('common:pages.discountsFieldValidFrom')} *
                  </Label>
                  <Input
                    id="valid_from"
                    type="date"
                    value={formData.valid_from}
                    onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valid_to">{t('common:pages.discountsFieldValidTo')}</Label>
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
                  {t('common:pages.discountsFieldActive')}
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t('common:pages.discountsCancel')}
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingDiscount
                  ? t('common:pages.discountsButtonUpdate')
                  : t('common:pages.discountsButtonCreate')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

