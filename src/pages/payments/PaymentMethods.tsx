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
import { useTranslation } from 'react-i18next'

export default function PaymentMethods() {
  const { user } = useAuthStore();
  const { t } = useTranslation('common');
  const { toast } = useToast();
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
      toast({ title: t('success'), description: t('pages.paymentMethodCreateSuccess') });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PaymentMethodRequest> }) =>
      updatePaymentMethod(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['paymentMethods'] });
      toast({ title: t('success'), description: t('pages.paymentMethodUpdateSuccess') });
      setIsDialogOpen(false);
      setEditingMethod(null);
      resetForm();
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePaymentMethod,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['paymentMethods'] });
      toast({ title: t('success'), description: t('pages.paymentMethodDeleteSuccess') });
    },
    onError: (error) => {
      toast({ title: t('error'), description: getErrorMessage(error), variant: 'destructive' });
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
        title: t('error'),
        description: t('pages.nameRequired'),
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
    if (confirm(t('pages.paymentMethodDeleteConfirm'))) {
      deleteMutation.mutate(id);
    }
  };

    if (user?.role !== 'ADMIN') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('pages.paymentMethodsTitle')}</h2>
          <p className="text-muted-foreground">{t('pages.noPermissionPaymentMethods')}</p>
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
          <h2 className="text-3xl font-bold tracking-tight">{t('pages.paymentMethodsTitle')}</h2>
          <p className="text-muted-foreground">{t('pages.paymentMethodsDescription')}</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          {t('pages.createPaymentMethod')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('pages.paymentMethodsTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paymentMethods.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">{t('pages.noPaymentMethodsFound')}</p>
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
                        {method.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      {method.requires_receipt && (
                        <Badge variant="secondary">Requires Receipt</Badge>
                      )}
                    </div>
                    {method.code && (
                      <p className="text-sm text-muted-foreground">Code: {method.code}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(method)}
                      title="Edit Payment Method"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(method.id)}
                      title="Delete Payment Method"
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
              {editingMethod ? t('pages.editPaymentMethod') : t('pages.createPaymentMethod')}
            </DialogTitle>
            <DialogDescription>
              {editingMethod
                ? t('pages.editPaymentMethodDescription')
                : t('pages.createPaymentMethodDescription')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('pages.nameLabel')}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('pages.paymentMethodNamePlaceholder')}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">{t('pages.codeLabel')}</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder={t('pages.paymentMethodCodePlaceholder')}
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
                  {t('pages.activeLabel')}
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
                  {t('pages.requiresReceiptLabel')}
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t('pages.cancel')}
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingMethod ? t('pages.update') : t('pages.create')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

