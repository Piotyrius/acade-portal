import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPricings,
  createPricing,
  updatePricing,
  deletePricing,
  PricingDto,
  PricingRequest,
} from '@/api/endpoints/payments';
import { getPrograms, getCourses, getCohorts } from '@/api/endpoints/catalog';
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

export default function Pricings() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const { t } = useTranslation('common');
  const qc = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPricing, setEditingPricing] = useState<PricingDto | null>(null);
  const [formData, setFormData] = useState({
    object_id: '',
    object_type: '' as 'program' | 'course' | 'cohort' | '',
    content_type: 0,
    amount: '',
    currency: 'GEL',
    effective_from: '',
    effective_to: '',
    is_active: true,
  });

  const { data: pricings = [], isLoading } = useQuery({
    queryKey: ['pricings'],
    queryFn: () => getPricings(),
    enabled: user?.role === 'ADMIN',
  });

  const { data: programs = [] } = useQuery({
    queryKey: ['programs'],
    queryFn: () => getPrograms(),
    enabled: user?.role === 'ADMIN',
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => getCourses(),
    enabled: user?.role === 'ADMIN',
  });

  const { data: cohorts = [] } = useQuery({
    queryKey: ['cohorts'],
    queryFn: () => getCohorts(),
    enabled: user?.role === 'ADMIN',
  });

  const getContentTypeIdFromObject = (obj: any): number => {
    const raw = obj?.content_type ?? obj?.content_type_id ?? obj?.contentType ?? obj?.contentTypeId;
    if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
    if (typeof raw === 'string' && raw.trim() !== '') {
      const parsed = Number(raw);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
  };

  const findSelectedObject = (objectType: string, objectId: string) => {
    if (!objectType || !objectId) return null;
    if (objectType === 'program') return programs.find((p: any) => p.id === objectId) ?? null;
    if (objectType === 'course') return courses.find((c: any) => c.id === objectId) ?? null;
    if (objectType === 'cohort') return cohorts.find((ch: any) => ch.id === objectId) ?? null;
    return null;
  };

  const inferContentTypeIdForObjectType = (objectType: 'program' | 'course' | 'cohort' | ''): number => {
    if (!objectType) return 0;

    const ids = new Set<string>();
    if (objectType === 'program') programs.forEach((p: any) => ids.add(String(p.id)));
    if (objectType === 'course') courses.forEach((c: any) => ids.add(String(c.id)));
    if (objectType === 'cohort') cohorts.forEach((ch: any) => ids.add(String(ch.id)));

    const counts = new Map<number, number>();
    for (const pricing of pricings as any[]) {
      const ct = pricing?.content_type;
      if (typeof ct !== 'number' || !Number.isFinite(ct)) continue;
      const objectId = pricing?.object_id != null ? String(pricing.object_id) : '';
      if (!objectId || !ids.has(objectId)) continue;
      counts.set(ct, (counts.get(ct) ?? 0) + 1);
    }

    let bestCt = 0;
    let bestCount = 0;
    for (const [ct, count] of counts.entries()) {
      if (count > bestCount) {
        bestCt = ct;
        bestCount = count;
      }
    }
    return bestCt;
  };

  const createMutation = useMutation({
    mutationFn: createPricing,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pricings'] });
      toast({
        title: t('common:pages.pricingsToastCreateTitle'),
        description: t('common:pages.pricingsToastCreateDescription'),
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: t('common:pages.pricingsToastErrorTitle'),
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PricingRequest> }) => updatePricing(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pricings'] });
      toast({
        title: t('common:pages.pricingsToastUpdateTitle'),
        description: t('common:pages.pricingsToastUpdateDescription'),
      });
      setIsDialogOpen(false);
      setEditingPricing(null);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: t('common:pages.pricingsToastErrorTitle'),
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePricing,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pricings'] });
      toast({
        title: t('common:pages.pricingsToastDeleteTitle'),
        description: t('common:pages.pricingsToastDeleteDescription'),
      });
    },
    onError: (error) => {
      toast({
        title: t('common:pages.pricingsToastErrorTitle'),
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      object_id: '',
      object_type: '',
      content_type: 0,
      amount: '',
      currency: 'GEL',
      effective_from: '',
      effective_to: '',
      is_active: true,
    });
  };

  const handleOpenDialog = (pricing?: PricingDto) => {
    if (pricing) {
      // Determine object_type by checking which list contains the object_id
      const isProgram = programs.some((p: any) => p.id === pricing.object_id);
      const isCourse = courses.some((c: any) => c.id === pricing.object_id);
      const isCohort = cohorts.some((ch: any) => ch.id === pricing.object_id);
      
      let objectType: 'program' | 'course' | 'cohort' | '' = '';
      let contentType = 0;
      
      if (isProgram) {
        objectType = 'program';
      } else if (isCourse) {
        objectType = 'course';
      } else if (isCohort) {
        objectType = 'cohort';
      }

      const selectedObj = findSelectedObject(objectType, pricing.object_id);
      contentType = pricing.content_type ?? getContentTypeIdFromObject(selectedObj);
      
      setEditingPricing(pricing);
      setFormData({
        object_id: pricing.object_id,
        object_type: objectType,
        content_type: contentType,
        amount: pricing.amount,
        currency: pricing.currency,
        effective_from: pricing.effective_from.split('T')[0],
        effective_to: pricing.effective_to ? pricing.effective_to.split('T')[0] : '',
        is_active: pricing.is_active,
      });
    } else {
      setEditingPricing(null);
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.object_id || !formData.content_type || !formData.amount || !formData.effective_from) {
      toast({
        title: t('common:pages.pricingsToastErrorTitle'),
        description: t('common:pages.pricingsErrorRequired'),
        variant: 'destructive',
      });
      return;
    }

    const payload: PricingRequest = {
      object_id: formData.object_id,
      content_type: formData.content_type,
      amount: formData.amount,
      currency: formData.currency,
      effective_from: formData.effective_from,
      effective_to: formData.effective_to || undefined,
      is_active: formData.is_active,
    };

    if (editingPricing) {
      updateMutation.mutate({ id: editingPricing.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm(t('common:pages.pricingsDeleteConfirm'))) {
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
          <h2 className="text-3xl font-bold tracking-tight">{t('common:pages.pricingsTitle')}</h2>
          <p className="text-muted-foreground">{t('common:pages.pricingsNoPermission')}</p>
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
          <h2 className="text-3xl font-bold tracking-tight">{t('common:pages.pricingsTitle')}</h2>
          <p className="text-muted-foreground">{t('common:pages.pricingsSubtitle')}</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          {t('common:pages.pricingsCreate')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('common:pages.pricingsCardTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pricings.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                {t('common:pages.pricingsNoneFound')}
              </p>
            ) : (
              pricings.map((pricing: PricingDto) => (
                <div
                  key={pricing.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-medium">
                        {pricing.pricing_object_name ||
                          t('common:pages.pricingsObjectFallback', {
                            id: pricing.object_id.slice(0, 8),
                          })}
                      </p>
                      <Badge variant={pricing.is_active ? 'default' : 'outline'}>
                        {pricing.is_active
                          ? t('common:pages.pricingsStatusActive')
                          : t('common:pages.pricingsStatusInactive')}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium">
                      {t('common:pages.pricingsPriceLabel')}:{' '}
                      {formatCurrency(pricing.amount)} {pricing.currency}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('common:pages.pricingsEffectiveFromLabel')}:{' '}
                      {new Date(pricing.effective_from).toLocaleDateString()}
                      {pricing.effective_to &&
                        ` ${t('common:pages.pricingsEffectiveToSeparator')} ${new Date(
                          pricing.effective_to,
                        ).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(pricing)}
                      title={t('common:pages.pricingsEditTooltip')}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(pricing.id)}
                      title={t('common:pages.pricingsDeleteTooltip')}
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
              {editingPricing
                ? t('common:pages.pricingsDialogTitleEdit')
                : t('common:pages.pricingsDialogTitleCreate')}
            </DialogTitle>
            <DialogDescription>
              {editingPricing
                ? t('common:pages.pricingsDialogDescriptionEdit')
                : t('common:pages.pricingsDialogDescriptionCreate')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="object_type">{t('common:pages.pricingsFieldObjectType')} *</Label>
                <Select
                  value={formData.object_type || undefined}
                  onValueChange={(value: 'program' | 'course' | 'cohort') => {
                    const inferredCt = inferContentTypeIdForObjectType(value);
                    // Reset object_id when type changes
                    setFormData({ 
                      ...formData, 
                      object_type: value,
                      object_id: '',
                      // Prefer inference from existing pricings (same DB) over hard-coded guesses.
                      // If unavailable, leave 0 and require manual input.
                      content_type: inferredCt || 0,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('common:pages.pricingsFieldObjectTypePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="program">
                      {t('common:pages.pricingsObjectTypeProgram')}
                    </SelectItem>
                    <SelectItem value="course">
                      {t('common:pages.pricingsObjectTypeCourse')}
                    </SelectItem>
                    <SelectItem value="cohort">
                      {t('common:pages.pricingsObjectTypeCohort')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="object_id">{t('common:pages.pricingsFieldObject')} *</Label>
                <Select
                  value={formData.object_id || undefined}
                  onValueChange={(value) => {
                    const selectedObj = findSelectedObject(formData.object_type, value);
                    const inferredCt = getContentTypeIdFromObject(selectedObj);
                    const inferredFromExisting = inferContentTypeIdForObjectType(formData.object_type);
                    setFormData({
                      ...formData,
                      object_id: value,
                      content_type: inferredCt || formData.content_type || inferredFromExisting || 0,
                    });
                  }}
                  disabled={!formData.object_type}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        formData.object_type
                          ? t('common:pages.pricingsFieldObjectPlaceholderTyped', {
                              type: formData.object_type,
                            })
                          : t('common:pages.pricingsFieldObjectPlaceholder')
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.object_type === 'program' && programs.length > 0 && (
                      programs.map((program: any) => (
                        <SelectItem key={program.id} value={program.id}>
                          {program.name} ({program.code})
                        </SelectItem>
                      ))
                    )}
                    {formData.object_type === 'course' && courses.length > 0 && (
                      courses.map((course: any) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title} ({course.code})
                        </SelectItem>
                      ))
                    )}
                    {formData.object_type === 'cohort' && cohorts.length > 0 && (
                      cohorts.map((cohort: any) => (
                        <SelectItem key={cohort.id} value={cohort.id}>
                          {cohort.name}
                        </SelectItem>
                      ))
                    )}
                    {formData.object_type && 
                      ((formData.object_type === 'program' && programs.length === 0) ||
                       (formData.object_type === 'course' && courses.length === 0) ||
                       (formData.object_type === 'cohort' && cohorts.length === 0)) && (
                      <SelectItem value="none" disabled>
                        {t('common:pages.pricingsNoObjectsAvailable')}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="content_type">{t('common:pages.pricingsFieldContentType')} *</Label>
                <Input
                  id="content_type"
                  type="number"
                  value={formData.content_type}
                  onChange={(e) => setFormData({ ...formData, content_type: parseInt(e.target.value) || 0 })}
                  placeholder={t('common:pages.pricingsFieldContentTypePlaceholder')}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {t('common:pages.pricingsFieldContentTypeHelper', {
                    value: formData.content_type || t('common:pages.pricingsFieldContentTypeNotSet'),
                  })}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">{t('common:pages.pricingsFieldAmount')} *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder={t('common:pages.pricingsFieldAmountPlaceholder')}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">{t('common:pages.pricingsFieldCurrency')}</Label>
                  <Input
                    id="currency"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    placeholder={t('common:pages.pricingsFieldCurrencyPlaceholder')}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="effective_from">
                    {t('common:pages.pricingsFieldEffectiveFrom')} *
                  </Label>
                  <Input
                    id="effective_from"
                    type="date"
                    value={formData.effective_from}
                    onChange={(e) => setFormData({ ...formData, effective_from: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="effective_to">
                    {t('common:pages.pricingsFieldEffectiveTo')}
                  </Label>
                  <Input
                    id="effective_to"
                    type="date"
                    value={formData.effective_to}
                    onChange={(e) => setFormData({ ...formData, effective_to: e.target.value })}
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
                  {t('common:pages.pricingsFieldActive')}
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t('common:pages.pricingsCancel')}
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingPricing
                  ? t('common:pages.pricingsButtonUpdate')
                  : t('common:pages.pricingsButtonCreate')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

