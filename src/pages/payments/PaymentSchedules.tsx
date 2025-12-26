import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectItem, SelectValue, SelectContent } from '@/components/ui/select';
import { Search, AlertCircle, CheckCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPaymentSchedules,
  markPaymentSchedulesOverdue,
  PaymentScheduleDto,
} from '@/api/endpoints/payments';
import { getInvoices } from '@/api/endpoints/payments';
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/errors';
import { formatCurrencyString } from '@/utils/paymentsFormatting';
import { useTranslation } from 'react-i18next'

export default function PaymentSchedules() {
  const { user } = useAuthStore();
  const { t } = useTranslation('common');
  const { toast } = useToast();
  const qc = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<string>('all');

  const { data: paymentSchedules = [], isLoading } = useQuery({
    queryKey: ['paymentSchedules', selectedStatus, selectedInvoice],
    queryFn: () =>
      getPaymentSchedules({
        status: selectedStatus && selectedStatus !== 'all' ? selectedStatus as any : undefined,
        invoice: selectedInvoice && selectedInvoice !== 'all' ? selectedInvoice : undefined,
      }),
    enabled: user?.role === 'ADMIN',
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => getInvoices(),
    enabled: user?.role === 'ADMIN',
  });

  const markOverdueMutation = useMutation({
    mutationFn: markPaymentSchedulesOverdue,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['paymentSchedules'] });
      toast({
        title: 'Success',
        description: `Marked ${data.marked_overdue} payment schedules as overdue`,
      });
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'secondary';
      case 'PAID':
        return 'default';
      case 'OVERDUE':
        return 'destructive';
      case 'SKIPPED':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const filteredSchedules = paymentSchedules.filter((schedule: PaymentScheduleDto) => {
    return (
      searchTerm === '' ||
      schedule.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.invoice?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (user?.role !== 'ADMIN') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('pages.paymentSchedulesTitle')}</h2>
          <p className="text-muted-foreground">{t('pages.noPermissionPaymentSchedules')}</p>
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
          <h2 className="text-3xl font-bold tracking-tight">{t('pages.paymentSchedulesTitle')}</h2>
            <p className="text-muted-foreground">{t('pages.paymentSchedulesDescription')}</p>
        </div>
          <Button
          variant="outline"
            onClick={() => markOverdueMutation.mutate()}
          disabled={markOverdueMutation.isPending}
        >
          <AlertCircle className="mr-2 h-4 w-4" />
            {t('pages.markOverdue')}
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('pages.searchSchedulesPlaceholder')}
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={selectedInvoice} onValueChange={setSelectedInvoice}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t('pages.allInvoices')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('pages.allInvoices')}</SelectItem>
            {invoices.map((invoice: any) => (
              <SelectItem key={invoice.id} value={invoice.id}>
                {invoice.invoice_number || invoice.id.slice(0, 8)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t('pages.allStatuses')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('pages.allStatuses')}</SelectItem>
            <SelectItem value="PENDING">{t('pages.statusPending')}</SelectItem>
            <SelectItem value="PAID">{t('pages.statusPaid')}</SelectItem>
            <SelectItem value="OVERDUE">{t('pages.statusOverdue')}</SelectItem>
            <SelectItem value="SKIPPED">{t('pages.statusSkipped')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('pages.paymentSchedulesTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSchedules.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">{t('pages.paymentSchedulesNoneFound')}</p>
            ) : (
              filteredSchedules.map((schedule: PaymentScheduleDto) => {
                const isOverdue =
                  schedule.status === 'OVERDUE' ||
                  (schedule.status === 'PENDING' &&
                    new Date(schedule.scheduled_date) < new Date());
                return (
                  <div
                    key={schedule.id}
                    className={`flex items-center justify-between p-4 border rounded-lg ${
                      isOverdue ? 'border-destructive bg-destructive/5' : 'border-border'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-medium">
                          {schedule.invoice_number || `Schedule #${schedule.id.slice(0, 8)}`}
                        </p>
                        <Badge variant={getStatusVariant(schedule.status)}>
                          {schedule.status_display || schedule.status}
                        </Badge>
                        {isOverdue && (
                          <Badge variant="destructive">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Overdue
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium">Amount: {formatCurrencyString(schedule.amount, 'USD')}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Scheduled: {new Date(schedule.scheduled_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {schedule.status === 'PAID' && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

