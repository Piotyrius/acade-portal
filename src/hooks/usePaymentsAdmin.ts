import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
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

  const createInvoiceFromEnrollment = useMutation({
    mutationFn: (params: {
      enrollmentId: string;
      paymentPlanId: string;
      discountIds?: string[];
    }) => createInvoiceForEnrollment(params.enrollmentId, params.paymentPlanId, params.discountIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      toast({ title: 'Success', description: 'Invoice created from enrollment successfully' });
    },
    onError: (error: any) => {
      const message = getErrorMessage(error);
      if (message.includes('No pricing found for this enrollment')) {
        toast({
          title: 'Pricing not configured',
          description:
            'No pricing is configured for this enrollment’s program/course/cohort. Please create pricing first in the Pricings admin screen.',
          variant: 'destructive',
        });
      } else {
        toast({ title: 'Error', description: message, variant: 'destructive' });
      }
    },
  });

  const recordPaymentMutation = useMutation({
    mutationFn: (payload: RecordPaymentRequest) => recordPayment(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] });
      qc.invalidateQueries({ queryKey: ['invoices'] });
      toast({ title: 'Success', description: 'Payment recorded successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const applyDiscountsMutation = useMutation({
    mutationFn: ({ id, discountIds }: { id: string; discountIds: string[] }) =>
      applyDiscountsToInvoice(id, discountIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      toast({ title: 'Success', description: 'Discounts applied successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const markOverdueSchedulesMutation = useMutation({
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

  return {
    createInvoiceFromEnrollment,
    recordPaymentMutation,
    applyDiscountsMutation,
    markOverdueSchedulesMutation,
  };
}







