import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, DollarSign, Edit, Trash2, Eye } from 'lucide-react';
import { exampleRates } from '@/utils/exampleData';
import { ExampleBanner } from '@/components/ExampleBanner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRates, createRate, updateRate, deleteRate, RateDto } from '@/api/endpoints/timekeeping';
import { getUsers } from '@/api/endpoints/auth';
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
import './Timekeeping.css';
import { useTranslation } from 'react-i18next';

export default function Rates() {
  const { t } = useTranslation('common');
  const { user } = useAuthStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<RateDto | null>(null);
  const [formData, setFormData] = useState({
    lecturer: '',
    per_hour_minor: '',
    currency: 'USD',
    active: true,
  });

  const { data: rates = [] } = useQuery({
    queryKey: ['rates'],
    queryFn: () => getRates(undefined),
    enabled: user?.role === 'ADMIN', // Only admins can view rates
  });

  const displayRates = rates.length === 0 ? exampleRates.slice(0, 1) : rates;

  const { data: lecturers = [] } = useQuery({
    queryKey: ['lecturers'],
    queryFn: () => getUsers('LECTURER'),
    enabled: user?.role === 'ADMIN',
  });

  const createMutation = useMutation({
    mutationFn: createRate,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rates'] });
      toast({ title: t('success'), description: t('pages.rateCreateSuccess') });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({ title: t('error'), description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RateDto> }) => updateRate(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rates'] });
      toast({ title: t('success'), description: t('pages.rateUpdateSuccess') });
      setIsDialogOpen(false);
      setEditingRate(null);
      resetForm();
    },
    onError: (error) => {
      toast({ title: t('error'), description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRate,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rates'] });
      toast({ title: t('success'), description: t('pages.rateDeleteSuccess') });
    },
    onError: (error) => {
      toast({ title: t('error'), description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({ lecturer: '', per_hour_minor: '', currency: 'USD', active: true });
  };

  const handleOpenDialog = (rate?: RateDto) => {
    if (rate) {
      setEditingRate(rate);
      setFormData({
        lecturer: rate.lecturer,
        per_hour_minor: (rate.per_hour_minor / 100).toString(),
        currency: rate.currency,
        active: rate.active,
      });
    } else {
      setEditingRate(null);
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const perHourMinor = Math.round(parseFloat(formData.per_hour_minor) * 100);
    if (!formData.lecturer || !formData.per_hour_minor || isNaN(perHourMinor)) {
      toast({
        title: 'Error',
        description: t('pages.ratesErrorMissing'),
        variant: 'destructive',
      });
      return;
    }

    const payload = {
      lecturer: formData.lecturer,
      per_hour_minor: perHourMinor,
      currency: formData.currency,
      active: formData.active,
    };

    if (editingRate) {
      updateMutation.mutate({ id: editingRate.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm(t('pages.ratesDeleteConfirm'))) {
      deleteMutation.mutate(id);
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {t('pages.ratesTitle')}
          </h2>
          <p className="text-muted-foreground">
            {t('pages.ratesNoPermission')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rates_header_wrapper">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {t('pages.ratesTitle')}
          </h2>
          <p className="text-muted-foreground">
            {t('pages.ratesSubtitle')}
          </p>
        </div>
        <div className="flex gap-2 rates_add_btn_wrapper">
          <Button onClick={() => handleOpenDialog()} className='rates_add_btn'>
            <Plus className="mr-2 h-4 w-4" />
            {t('pages.ratesCreate')}
          </Button>
        </div>
      </div>

      {rates.length === 0 && <ExampleBanner />}
      <Card>

        <CardHeader>
          <CardTitle>{t('pages.ratesCardTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="gap-2 rates_Card">
            {displayRates.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  {t('pages.ratesNoneFound')}
                </p>
            ) : (
              displayRates.map((rate: RateDto) => {
                const lecturer = lecturers.find((l: any) => l.id === rate.lecturer);
                return (
                  <div key={rate.id} className="flex items-center justify-between p-4 h-[140px] border border-border rounded-lg rate_item">
                    
                    <div className='flex w-[100%] rates_top_side'>
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2 rates_dollar_sign">
                          <DollarSign className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {lecturer
                              ? `${lecturer.first_name} ${lecturer.last_name}`
                              : t('pages.ratesUnknownLecturer')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {(rate.per_hour_minor / 100).toFixed(2)} {rate.currency}/hour
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-2">
                        
                        <p className="text-xs text-muted-foreground">
                          {t('pages.ratesCreatedLabel')}: {new Date(rate.created_at).toLocaleDateString()}
                        </p>

                        <Badge variant={rate.active ? 'default' : 'secondary'} className='rates_active'>
                          {rate.active
                            ? t('pages.ratesStatusActive')
                            : t('pages.ratesStatusInactive')}
                        </Badge>

                      </div>
                    </div>


                    <div className='w-[100%] gap-2 flex justify-center'>
                    
                      <Button className='rates_edit_btn' variant="outline" size="sm" onClick={() => handleOpenDialog(rate)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button className='rates_delete_btn' variant="destructive" size="sm" onClick={() => handleDelete(rate.id)}>
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
              {editingRate ? t('pages.ratesDialogTitleEdit') : t('pages.ratesDialogTitleCreate')}
            </DialogTitle>
            <DialogDescription>
              {editingRate
                ? t('pages.ratesDialogDescriptionEdit')
                : t('pages.ratesDialogDescriptionCreate')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="lecturer">
                  {t('pages.ratesFieldLecturer')} *
                </Label>
                <Select value={formData.lecturer} onValueChange={(value) => setFormData({ ...formData, lecturer: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('pages.ratesFieldLecturerPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {lecturers.map((lecturer: any) => (
                      <SelectItem key={lecturer.id} value={lecturer.id}>
                        {lecturer.first_name} {lecturer.last_name} ({lecturer.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="per_hour_minor">
                  {t('pages.ratesFieldPerHour')} *
                </Label>
                <Input
                  id="per_hour_minor"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.per_hour_minor}
                  onChange={(e) => setFormData({ ...formData, per_hour_minor: e.target.value })}
                  placeholder="e.g., 50.00"
                  required
                />
                <p className="text-xs text-muted-foreground">Enter amount in major currency units (e.g., 50.00 for $50/hour)</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">
                  {t('pages.ratesFieldCurrency')}
                </Label>
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
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="active" className="cursor-pointer">
                  {t('pages.ratesFieldActive')}
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t('pages.ratesCancel')}
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingRate
                  ? updateMutation.isPending
                    ? t('pages.ratesButtonUpdating')
                    : t('pages.ratesButtonUpdate')
                  : createMutation.isPending
                  ? t('pages.ratesButtonCreating')
                  : t('pages.ratesButtonCreate')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

