import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import {
  applyDiscountsToInvoice,
  createInvoiceForEnrollment,
  markPaymentSchedulesOverdue,
  recordPayment,
  InvoiceDto,
  RecordPaymentRequest,
} from '@/api/endpoints/payments';
import { getErrorMessage } from '@/lib/errors';

export function usePaymentsAdmin() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();

  const createInvoiceFromEnrollment = useMutation({
    mutationFn: (params: {
      enrollmentId: string;
      paymentPlanId: string;
      discountIds?: string[];
    }) => createInvoiceForEnrollment(params.enrollmentId, params.paymentPlanId, params.discountIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      toast({ title: t('success'), description: t('pages.invoiceCreatedFromEnrollment') });
    },
    onError: (error: any) => {
      const message = getErrorMessage(error);
      if (message.includes('No pricing found for this enrollment')) {
        toast({
          title: t('error'),
          description: t('pages.pricingNotConfigured'),
          variant: 'destructive',
        });
      } else {
        toast({ title: t('error'), description: message, variant: 'destructive' });
      }
    },
  });

  const recordPaymentMutation = useMutation({
    mutationFn: (payload: RecordPaymentRequest) => recordPayment(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] });
      qc.invalidateQueries({ queryKey: ['invoices'] });
      toast({ title: t('success'), description: t('pages.paymentRecordedSuccess') });
    },
    onError: (error) => {
      toast({ title: t('error'), description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const applyDiscountsMutation = useMutation({
    mutationFn: ({ id, discountIds }: { id: string; discountIds: string[] }) =>
      applyDiscountsToInvoice(id, discountIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      toast({ title: t('success'), description: t('pages.discountsAppliedSuccess') });
    },
    onError: (error) => {
      toast({ title: t('error'), description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const markOverdueSchedulesMutation = useMutation({
    mutationFn: markPaymentSchedulesOverdue,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['paymentSchedules'] });
      toast({ title: t('success'), description: t('pages.markedSchedulesOverdue', { count: data.marked_overdue }) });
    },
    onError: (error) => {
      toast({ title: t('error'), description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  return {
    createInvoiceFromEnrollment,
    recordPaymentMutation,
    applyDiscountsMutation,
    markOverdueSchedulesMutation,
  };
}









