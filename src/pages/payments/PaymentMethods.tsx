import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  PaymentMethodDto,
  PaymentMethodRequest,
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
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslation } from 'react-i18next';

export default function PaymentMethods() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const { t } = useTranslation('common');
  const qc = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethodDto | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    is_active: true,
    requires_receipt: false,
  });

  const { data: paymentMethods = [], isLoading } = useQuery({
    queryKey: ['paymentMethods'],
    queryFn: () => getPaymentMethods(),
    enabled: user?.role === 'ADMIN',
  });

  const createMutation = useMutation({
    mutationFn: createPaymentMethod,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['paymentMethods'] });
      toast({
        title: t('common:pages.paymentMethodsToastCreateTitle'),
        description: t('common:pages.paymentMethodsToastCreateDescription'),
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: t('common:pages.paymentMethodsToastErrorTitle'),
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PaymentMethodRequest> }) =>
      updatePaymentMethod(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['paymentMethods'] });
      toast({
        title: t('common:pages.paymentMethodsToastUpdateTitle'),
        description: t('common:pages.paymentMethodsToastUpdateDescription'),
      });
      setIsDialogOpen(false);
      setEditingMethod(null);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: t('common:pages.paymentMethodsToastErrorTitle'),
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePaymentMethod,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['paymentMethods'] });
      toast({
        title: t('common:pages.paymentMethodsToastDeleteTitle'),
        description: t('common:pages.paymentMethodsToastDeleteDescription'),
      });
    },
    onError: (error) => {
      toast({
        title: t('common:pages.paymentMethodsToastErrorTitle'),
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      is_active: true,
      requires_receipt: false,
    });
  };

  const handleOpenDialog = (method?: PaymentMethodDto) => {
    if (method) {
      setEditingMethod(method);
      setFormData({
        name: method.name,
        code: method.code || '',
        is_active: method.is_active,
        requires_receipt: method.requires_receipt || false,
      });
    } else {
      setEditingMethod(null);
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast({
        title: t('common:pages.paymentMethodsToastErrorTitle'),
        description: t('common:pages.paymentMethodsErrorNameRequired'),
        variant: 'destructive',
      });
      return;
    }

    const payload: PaymentMethodRequest = {
      name: formData.name,
      code: formData.code || undefined,
      is_active: formData.is_active,
      requires_receipt: formData.requires_receipt,
    };

    if (editingMethod) {
      updateMutation.mutate({ id: editingMethod.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm(t('common:pages.paymentMethodsDeleteConfirm'))) {
      deleteMutation.mutate(id);
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('common:pages.paymentMethodsTitle')}</h2>
          <p className="text-muted-foreground">{t('common:pages.paymentMethodsNoPermission')}</p>
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
          <h2 className="text-3xl font-bold tracking-tight">{t('common:pages.paymentMethodsTitle')}</h2>
          <p className="text-muted-foreground">{t('common:pages.paymentMethodsSubtitle')}</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          {t('common:pages.paymentMethodsCreate')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('common:pages.paymentMethodsCardTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paymentMethods.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                {t('common:pages.paymentMethodsNoneFound')}
              </p>
            ) : (
              paymentMethods.map((method: PaymentMethodDto) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-medium">{method.name}</p>
                      <Badge variant={method.is_active ? 'default' : 'outline'}>
                        {method.is_active
                          ? t('common:pages.paymentMethodsStatusActive')
                          : t('common:pages.paymentMethodsStatusInactive')}
                      </Badge>
                      {method.requires_receipt && (
                        <Badge variant="secondary">
                          {t('common:pages.paymentMethodsRequiresReceiptBadge')}
                        </Badge>
                      )}
                    </div>
                    {method.code && (
                      <p className="text-sm text-muted-foreground">
                        {t('common:pages.paymentMethodsCodeLabel')}: {method.code}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(method)}
                      title={t('common:pages.paymentMethodsEditTooltip')}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(method.id)}
                      title={t('common:pages.paymentMethodsDeleteTooltip')}
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
            <DialogTitle>
              {editingMethod
                ? t('common:pages.paymentMethodsDialogTitleEdit')
                : t('common:pages.paymentMethodsDialogTitleCreate')}
            </DialogTitle>
            <DialogDescription>
              {editingMethod
                ? t('common:pages.paymentMethodsDialogDescriptionEdit')
                : t('common:pages.paymentMethodsDialogDescriptionCreate')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('common:pages.paymentMethodsFieldName')} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('common:pages.paymentMethodsFieldNamePlaceholder')}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">{t('common:pages.paymentMethodsFieldCode')}</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder={t('common:pages.paymentMethodsFieldCodePlaceholder')}
                />
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
                  {t('common:pages.paymentMethodsFieldActive')}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="requires_receipt"
                  checked={formData.requires_receipt}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, requires_receipt: checked as boolean })
                  }
                />
                <Label htmlFor="requires_receipt" className="cursor-pointer">
                  {t('common:pages.paymentMethodsFieldRequiresReceipt')}
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t('common:pages.paymentMethodsCancel')}
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingMethod
                  ? t('common:pages.paymentMethodsButtonUpdate')
                  : t('common:pages.paymentMethodsButtonCreate')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

