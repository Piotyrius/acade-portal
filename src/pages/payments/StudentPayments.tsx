import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { getMyPayments, InvoiceDto } from '@/api/endpoints/payments';
import { format } from 'date-fns';
import { formatCurrencyString } from '@/utils/paymentsFormatting';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function StudentPayments() {
  const { t } = useTranslation('common');

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['my-payments'],
    queryFn: getMyPayments,
  });

  const getPaymentStatusBadge = (invoice: InvoiceDto) => {
    const status = invoice.payment_status_display || invoice.status;
    const isOverdue = invoice.is_overdue || false;
    
    if (status === 'PAID' || invoice.outstanding_amount === '0.00') {
      return (
        <Badge className="bg-green-600 text-white">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          {t('pages.studentPaymentsStatusPaid')}
        </Badge>
      );
    }
    if (isOverdue) {
      return (
        <Badge variant="destructive">
          <AlertCircle className="h-3 w-3 mr-1" />
          {t('pages.studentPaymentsStatusOverdue')}
        </Badge>
      );
    }
    if (status === 'PARTIAL') {
      return (
        <Badge variant="secondary">
          <Clock className="h-3 w-3 mr-1" />
          {t('pages.studentPaymentsStatusPartial')}
        </Badge>
      );
    }
    return <Badge variant="outline">{t('pages.studentPaymentsStatusUnpaid')}</Badge>;
  };

  const getDaysUntilDue = (invoice: InvoiceDto) => {
    if (invoice.days_until_due !== undefined) {
      const days = invoice.days_until_due;
      if (days < 0) {
        return t('pages.studentPaymentsDaysOverdue', { count: Math.abs(days) });
      } else if (days === 0) {
        return t('pages.studentPaymentsDueToday');
      } else {
        return t('pages.studentPaymentsDaysRemaining', { count: days });
      }
    }
    return null;
  };

  const totalOutstanding = invoices.reduce((sum, inv) => {
    const outstanding = parseFloat(inv.outstanding_amount || '0');
    return sum + outstanding;
  }, 0);

  const totalPaid = invoices.reduce((sum, inv) => {
    const paid = parseFloat(inv.paid_amount || '0');
    return sum + paid;
  }, 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-40 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t('pages.studentPaymentsTitle')}</h2>
        <p className="text-muted-foreground">
          {t('pages.studentPaymentsSubtitle')}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              {t('pages.studentPaymentsCardOutstanding')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-destructive">
              {formatCurrencyString(totalOutstanding.toString())}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              {t('pages.studentPaymentsCardPaid')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrencyString(totalPaid.toString())}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              {t('pages.studentPaymentsCardActive')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {invoices.filter((inv) => inv.outstanding_amount !== '0.00').length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('pages.studentPaymentsListTitle')}</CardTitle>
          <CardDescription>{t('pages.studentPaymentsListDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {t('pages.studentPaymentsNoneFound')}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('pages.studentPaymentsColumnInvoice')}</TableHead>
                  <TableHead>{t('pages.studentPaymentsColumnCohort')}</TableHead>
                  <TableHead>{t('pages.studentPaymentsColumnTotal')}</TableHead>
                  <TableHead>{t('pages.studentPaymentsColumnPaid')}</TableHead>
                  <TableHead>{t('pages.studentPaymentsColumnOutstanding')}</TableHead>
                  <TableHead>{t('pages.studentPaymentsColumnDueDate')}</TableHead>
                  <TableHead>{t('pages.studentPaymentsColumnStatus')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                    <TableCell>
                      {invoice.cohort_name || t('pages.studentPaymentsCohortFallback')}
                    </TableCell>
                    <TableCell>{formatCurrencyString(invoice.total_amount)}</TableCell>
                    <TableCell>{formatCurrencyString(invoice.paid_amount || '0')}</TableCell>
                    <TableCell
                      className={
                        parseFloat(invoice.outstanding_amount || '0') > 0
                          ? 'text-destructive font-medium'
                          : ''
                      }
                    >
                      {formatCurrencyString(invoice.outstanding_amount || '0')}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>{format(new Date(invoice.due_date), 'MMM dd, yyyy')}</div>
                        {getDaysUntilDue(invoice) && (
                          <div className="text-xs text-muted-foreground">
                            {getDaysUntilDue(invoice)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getPaymentStatusBadge(invoice)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}





