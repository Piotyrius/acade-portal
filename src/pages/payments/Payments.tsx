import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectItem, SelectValue, SelectContent } from '@/components/ui/select';
import { Search, Plus, Trash2, RefreshCw } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPayments,
  deletePayment,
  processRefund,
  recordPayment,
  PaymentDto,
  RecordPaymentRequest,
} from '@/api/endpoints/payments';
import { getInvoices } from '@/api/endpoints/payments';
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/errors';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { CardListSkeleton } from '@/components/ui/table-skeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrencyString } from '@/utils/paymentsFormatting';

export default function Payments() {
  const { t } = useTranslation('common');
  const { user } = useAuthStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const DEFAULT_CURRENCY = 'GEL';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [selectedPaymentForRefund, setSelectedPaymentForRefund] = useState<PaymentDto | null>(null);
  const [formData, setFormData] = useState({
    invoice: '',
    amount: '',
    payment_method: 'MANUAL' as RecordPaymentRequest['payment_method'],
    notes: '',
    payment_date: new Date().toISOString().split('T')[0],
  });
  const [refundData, setRefundData] = useState({
    amount: '',
    reason: '',
  });

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['payments', selectedStatus, selectedInvoice],
    queryFn: () =>
      getPayments({
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

  const recordPaymentMutation = useMutation({
    mutationFn: (data: RecordPaymentRequest) => recordPayment(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] });
      qc.invalidateQueries({ queryKey: ['invoices'] });
      toast({ title: t('success'), description: t('pages.paymentRecordedSuccess') });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({ title: t('error'), description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePayment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] });
      qc.invalidateQueries({ queryKey: ['invoices'] });
      toast({ title: t('success'), description: t('pages.paymentDeleteSuccess') });
    },
    onError: (error) => {
      toast({ title: t('error'), description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const refundMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { amount: string; reason?: string } }) =>
      processRefund(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] });
      qc.invalidateQueries({ queryKey: ['invoices'] });
      toast({ title: t('success'), description: t('pages.refundProcessedSuccess') });
      setIsRefundDialogOpen(false);
      setSelectedPaymentForRefund(null);
      setRefundData({ amount: '', reason: '' });
    },
    onError: (error) => {
      toast({ title: t('error'), description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({
      invoice: '',
      payment_method: 'MANUAL',
      amount: '',
      notes: '',
      payment_date: new Date().toISOString().split('T')[0],
    });
  };

  const handleOpenDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.invoice || !formData.amount) {
      toast({
        title: t('error'),
        description: t('pages.invoiceAndAmountRequired'),
        variant: 'destructive',
      });
      return;
    }

    const payload: RecordPaymentRequest = {
      invoice: formData.invoice,
      amount: formData.amount,
      payment_method: formData.payment_method,
      notes: formData.notes || undefined,
      payment_date: new Date(formData.payment_date).toISOString(),
    };

    // Backend record_payment always creates a new completed payment;
    // we only support "record new payment" from this UI.
    recordPaymentMutation.mutate(payload);
  };

  const handleDelete = (id: string) => {
    if (confirm(t('pages.paymentDeleteConfirm'))) {
      deleteMutation.mutate(id);
    }
  };

  const handleOpenRefundDialog = (payment: PaymentDto) => {
    setSelectedPaymentForRefund(payment);
    setRefundData({ amount: payment.amount, reason: '' });
    setIsRefundDialogOpen(true);
  };

  const handleProcessRefund = () => {
    if (!selectedPaymentForRefund || !refundData.amount) {
      toast({
        title: t('error'),
        description: t('pages.refundAmountRequired'),
        variant: 'destructive',
      });
      return;
    }
    refundMutation.mutate({
      id: selectedPaymentForRefund.id,
      data: {
        amount: refundData.amount,
        reason: refundData.reason || undefined,
      },
    });
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'secondary';
      case 'COMPLETED':
        return 'default';
      case 'FAILED':
        return 'destructive';
      case 'REFUNDED':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const formatCurrency = (amount: string, currency: string = DEFAULT_CURRENCY) => {
    return formatCurrencyString(amount, currency);
  };

  const filteredPayments = payments.filter((payment: PaymentDto) => {
    return (
      searchTerm === '' ||
      payment.gateway_transaction_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.invoice?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (user?.role !== 'ADMIN') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {t('pages.paymentsTitle')}
          </h2>
          <p className="text-muted-foreground">
            {t('pages.paymentsNoPermission')}
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <CardListSkeleton count={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {t('pages.paymentsTitle')}
          </h2>
          <p className="text-muted-foreground">
            {t('pages.paymentsSubtitle')}
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          {t('pages.paymentsRecordPayment')}
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('pages.paymentsSearchPlaceholder')}
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={selectedInvoice} onValueChange={setSelectedInvoice}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t('pages.paymentsFilterAllInvoices')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('pages.paymentsFilterAllInvoices')}</SelectItem>
            {invoices.map((invoice: any) => (
              <SelectItem key={invoice.id} value={invoice.id}>
                {invoice.invoice_number || invoice.id.slice(0, 8)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t('pages.paymentsFilterAllStatuses')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('pages.paymentsFilterAllStatuses')}</SelectItem>
            <SelectItem value="PENDING">{t('pages.paymentsFilterStatusPending')}</SelectItem>
            <SelectItem value="COMPLETED">{t('pages.paymentsFilterStatusCompleted')}</SelectItem>
            <SelectItem value="FAILED">{t('pages.paymentsFilterStatusFailed')}</SelectItem>
            <SelectItem value="REFUNDED">{t('pages.paymentsFilterStatusRefunded')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('pages.paymentsCardTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPayments.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  {t('pages.paymentsNoneFound')}
                </p>
            ) : (
              filteredPayments.map((payment: PaymentDto) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-medium">
                        {payment.gateway_transaction_id ||
                          payment.payment_number ||
                          payment.invoice_number ||
                          `Payment #${payment.id.slice(0, 8)}`}
                      </p>
                      <Badge variant={getStatusVariant(payment.status)}>
                        {payment.status}
                      </Badge>
                      <Badge variant="secondary">{payment.payment_method}</Badge>
                    </div>
                    <p className="text-sm font-medium">Amount: {formatCurrency(payment.amount, payment.currency)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Payment date: {new Date(payment.payment_date).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {payment.student_name && payment.cohort_name
                        ? `${payment.student_name} - ${payment.cohort_name}`
                        : 'Enrollment: Unknown'}
                    </p>
                    {payment.notes && (
                      <p className="text-xs text-muted-foreground mt-1">Notes: {payment.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {payment.status === 'COMPLETED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenRefundDialog(payment)}
                        title="Process Refund"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(payment.id)}
                      title="Delete Payment"
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

      {/* Create/Edit Payment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('pages.recordPaymentTitle')}</DialogTitle>
            <DialogDescription>{t('pages.recordPaymentDescription')}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="invoice">{t('pages.invoiceLabel')}</Label>
                <Select
                  value={formData.invoice}
                  onValueChange={(value) => setFormData({ ...formData, invoice: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('pages.selectInvoicePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {invoices.map((invoice: any) => (
                      <SelectItem key={invoice.id} value={invoice.id}>
                        {invoice.invoice_number || invoice.id.slice(0, 8)} -{' '}
                        {formatCurrencyString(invoice.total_amount, invoice.currency || 'USD')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                  <Label htmlFor="amount">{t('pages.amountLabel')}</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder={t('pages.amountPlaceholder')}
                    required
                  />
                </div>
              </div>


              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payment_method">{t('pages.paymentMethodLabel')}</Label>
                  <Select
                    value={formData.payment_method}
                    onValueChange={(value: RecordPaymentRequest['payment_method']) =>
                      setFormData({ ...formData, payment_method: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MANUAL">{t('pages.paymentMethodManual')}</SelectItem>
                      <SelectItem value="CASH">{t('pages.paymentMethodCash')}</SelectItem>
                      <SelectItem value="BANK_TRANSFER">{t('pages.paymentMethodBankTransfer')}</SelectItem>
                      <SelectItem value="CREDIT_CARD">{t('pages.paymentMethodCreditCard')}</SelectItem>
                      <SelectItem value="DEBIT_CARD">{t('pages.paymentMethodDebitCard')}</SelectItem>
                      <SelectItem value="CHECK">{t('pages.paymentMethodCheck')}</SelectItem>
                      <SelectItem value="OTHER">{t('pages.paymentMethodOther')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payment_date">{t('pages.paymentDateLabel')}</Label>
                  <Input
                    id="payment_date"
                    type="date"
                    value={formData.payment_date}
                    onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">{t('pages.notesLabel')}</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={t('pages.notesPlaceholder')}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t('pages.cancel')}
              </Button>
              <Button type="submit" disabled={recordPaymentMutation.isPending}>
                {t('pages.record')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('pages.processRefundTitle')}</DialogTitle>
            <DialogDescription>{t('pages.processRefundDescription')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="refund_amount">{t('pages.refundAmountLabel')}</Label>
              <Input
                id="refund_amount"
                type="number"
                step="0.01"
                value={refundData.amount}
                onChange={(e) => setRefundData({ ...refundData, amount: e.target.value })}
                placeholder={t('pages.amountPlaceholder')}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="refund_reason">{t('pages.reasonLabel')}</Label>
              <Textarea
                id="refund_reason"
                value={refundData.reason}
                onChange={(e) => setRefundData({ ...refundData, reason: e.target.value })}
                placeholder={t('pages.refundReasonPlaceholder')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsRefundDialogOpen(false)}>
              {t('pages.cancel')}
            </Button>
            <Button
              type="button"
              onClick={handleProcessRefund}
              disabled={refundMutation.isPending || !refundData.amount}
            >
              {t('pages.processRefund')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

