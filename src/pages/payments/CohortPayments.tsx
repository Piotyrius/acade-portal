import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { getCohortPaymentSummary, getCohorts } from '@/api/endpoints/payments';
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
  const { t } = useTranslation('common');
  const [selectedCohortId, setSelectedCohortId] = useState<string>('');

  const { data: cohorts = [], isLoading: cohortsLoading } = useQuery({
    queryKey: ['cohorts'],
    queryFn: getCohortsCatalog,
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
        <h2 className="text-3xl font-bold tracking-tight">
          {t('pages.cohortPaymentsTitle')}
        </h2>
        <p className="text-muted-foreground">
          {t('pages.cohortPaymentsSubtitle')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('pages.cohortPaymentsSelectTitle')}</CardTitle>
          <CardDescription>{t('pages.cohortPaymentsSelectDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedCohortId} onValueChange={setSelectedCohortId}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder={t('pages.cohortPaymentsSelectPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {cohorts.map((cohort) => (
                <SelectItem key={cohort.id} value={cohort.id}>
                  {cohort.name} - {cohort.course_title || t('pages.cohortPaymentsSelectCourseFallback')}
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
                <p className="text-muted-foreground mt-2">
                  {t('pages.cohortPaymentsLoadingSummary')}
                </p>
              </CardContent>
            </Card>
          ) : paymentSummary ? (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">
                      {t('pages.cohortPaymentsCardTotalExpected')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">
                      {formatCurrencyString(paymentSummary.total_expected?.toString() || '0')}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">
                      {t('pages.cohortPaymentsCardTotalPaid')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-green-600">
                      {formatCurrencyString(paymentSummary.total_paid?.toString() || '0')}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">
                      {t('pages.cohortPaymentsCardOutstanding')}
                    </CardTitle>
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
                  <CardTitle>{t('pages.cohortPaymentsStudentListTitle')}</CardTitle>
                  <CardDescription>
                    {t('pages.cohortPaymentsStudentListDescription', {
                      cohort: paymentSummary.cohort_name,
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {paymentSummary.students && paymentSummary.students.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      {t('pages.cohortPaymentsStudentsNone')}
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('pages.cohortPaymentsStudentColumnName')}</TableHead>
                          <TableHead>{t('pages.cohortPaymentsStudentColumnEmail')}</TableHead>
                          <TableHead>{t('pages.cohortPaymentsStudentColumnInvoice')}</TableHead>
                          <TableHead>{t('pages.cohortPaymentsStudentColumnTotal')}</TableHead>
                          <TableHead>{t('pages.cohortPaymentsStudentColumnPaid')}</TableHead>
                          <TableHead>
                            {t('pages.cohortPaymentsStudentColumnOutstanding')}
                          </TableHead>
                          <TableHead>{t('pages.cohortPaymentsStudentColumnStatus')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paymentSummary.students?.map((student: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{student.student_name}</TableCell>
                            <TableCell>{student.student_email}</TableCell>
                            <TableCell>
                              {student.invoice_number ||
                                t('pages.cohortPaymentsStudentInvoiceFallback')}
                            </TableCell>
                            <TableCell>
                              {formatCurrencyString(student.total_amount?.toString() || '0')}
                            </TableCell>
                            <TableCell>
                              {formatCurrencyString(student.total_paid?.toString() || '0')}
                            </TableCell>
                            <TableCell
                              className={
                                parseFloat(student.outstanding?.toString() || '0') > 0
                                  ? 'text-destructive font-medium'
                                  : ''
                              }
                            >
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
                {t('pages.cohortPaymentsNoData')}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {!selectedCohortId && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {t('pages.cohortPaymentsPromptSelect')}
          </CardContent>
        </Card>
      )}
    </div>
  );
}





