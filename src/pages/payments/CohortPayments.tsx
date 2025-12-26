import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { getCohortPaymentSummary } from '@/api/endpoints/payments';
import { getCohorts as getCohortsCatalog } from '@/api/endpoints/catalog';
import { formatCurrencyString } from '@/utils/paymentsFormatting';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { Loader2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

export default function CohortPayments() {
  const [selectedCohortId, setSelectedCohortId] = useState<string>('');
  const { t } = useTranslation('common');

  const { data: cohorts = [], isLoading: cohortsLoading } = useQuery({
    queryKey: ['cohorts'],
    queryFn: () => getCohortsCatalog(),
  });

  const { data: paymentSummary, isLoading: summaryLoading } = useQuery({
    queryKey: ['cohort-payment-summary', selectedCohortId],
    queryFn: () => getCohortPaymentSummary(selectedCohortId),
    enabled: !!selectedCohortId,
  });

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge className="bg-green-600 text-white"><CheckCircle2 className="h-3 w-3 mr-1" />Paid</Badge>;
      case 'OVERDUE':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Overdue</Badge>;
      case 'PARTIAL':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Partial</Badge>;
      default:
        return <Badge variant="outline">Unpaid</Badge>;
    }
  };

  if (cohortsLoading) {
    return (
      <div className="space-y-6">
        <div className="h-40 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t('pages.cohortPaymentSummaryTitle')}</h2>
        <p className="text-muted-foreground">{t('pages.cohortPaymentSummaryDescription')}</p>
      </div>

      <Card>
          <CardHeader>
          <CardTitle>{t('pages.cohortSelectTitle')}</CardTitle>
          <CardDescription>{t('pages.cohortSelectDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedCohortId} onValueChange={setSelectedCohortId}>
              <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder={t('pages.selectCohortPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {cohorts.map((cohort) => (
                <SelectItem key={cohort.id} value={cohort.id}>
                  {cohort.name} - {cohort.course_title || t('pages.courseFallback')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedCohortId && (
        <>
          {summaryLoading ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                <p className="text-muted-foreground mt-2">Loading payment summary...</p>
              </CardContent>
            </Card>
          ) : paymentSummary ? (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Total Expected</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">
                      {formatCurrencyString(paymentSummary.total_expected?.toString() || '0')}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-green-600">
                      {formatCurrencyString(paymentSummary.total_paid?.toString() || '0')}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-destructive">
                      {formatCurrencyString(paymentSummary.outstanding?.toString() || '0')}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>{t('pages.studentPaymentsTitle')}</CardTitle>
                  <CardDescription>
                    {t('pages.studentPaymentsForCohort', { cohort: paymentSummary.cohort_name })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {paymentSummary.students && paymentSummary.students.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">{t('pages.noStudentsFound')}</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                              <TableHead>{t('pages.table.studentName')}</TableHead>
                              <TableHead>{t('pages.table.email')}</TableHead>
                              <TableHead>{t('pages.table.invoiceNumber')}</TableHead>
                              <TableHead>{t('pages.table.totalAmount')}</TableHead>
                              <TableHead>{t('pages.table.paid')}</TableHead>
                          <TableHead>Outstanding</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paymentSummary.students?.map((student: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{student.student_name}</TableCell>
                            <TableCell>{student.student_email}</TableCell>
                            <TableCell>{student.invoice_number || 'N/A'}</TableCell>
                            <TableCell>{formatCurrencyString(student.total_amount?.toString() || '0')}</TableCell>
                            <TableCell>{formatCurrencyString(student.total_paid?.toString() || '0')}</TableCell>
                            <TableCell className={parseFloat(student.outstanding?.toString() || '0') > 0 ? 'text-destructive font-medium' : ''}>
                              {formatCurrencyString(student.outstanding?.toString() || '0')}
                            </TableCell>
                            <TableCell>{getPaymentStatusBadge(student.payment_status)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No payment data available for this cohort
              </CardContent>
            </Card>
          )}
        </>
      )}

      {!selectedCohortId && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Please select a cohort to view payment summary
          </CardContent>
        </Card>
      )}
    </div>
  );
}





