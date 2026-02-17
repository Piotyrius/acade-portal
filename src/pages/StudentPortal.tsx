import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { getMyEnrollments, getMyAttendance, getMyAssessments, getMyGrades, getMyCertificates, getMyOutstandingBalance, getMyPayments } from '@/api/endpoints/studentPortal';
import { BookOpen, ClipboardCheck, FileCheck, Award, GraduationCap, DollarSign, AlertCircle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { exampleEnrollments, exampleAttendance, exampleAssessments, exampleGrades, exampleCertificates } from '@/utils/exampleData';
import { ExampleBanner } from '@/components/ExampleBanner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { formatCurrencyMinor, formatCurrencyString } from '@/utils/paymentsFormatting';
import { useTranslation } from 'react-i18next';

export default function StudentPortal() {
  const { t } = useTranslation('common');
  const { data: enrollments = [] } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: getMyEnrollments,
  });

  const { data: attendance = [] } = useQuery({
    queryKey: ['my-attendance'],
    queryFn: getMyAttendance,
  });

  const { data: assessments = [] } = useQuery({
    queryKey: ['my-assessments'],
    queryFn: getMyAssessments,
  });

  const { data: grades = [] } = useQuery({
    queryKey: ['my-grades'],
    queryFn: getMyGrades,
  });

  const { data: certificates = [] } = useQuery({
    queryKey: ['my-certificates'],
    queryFn: getMyCertificates,
  });

  const { data: outstandingBalance, isLoading: balanceLoading } = useQuery({
    queryKey: ['my-outstanding-balance'],
    queryFn: getMyOutstandingBalance,
  });

  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ['my-payments'],
    queryFn: getMyPayments,
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'PRESENT':
      case 'ISSUED':
      case 'PAID':
      case 'COMPLETED':
        return 'default';
      case 'PENDING':
      case 'LATE':
      case 'PARTIAL':
        return 'secondary';
      case 'ABSENT':
      case 'REVOKED':
      case 'OVERDUE':
      case 'FAILED':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Sort payments by date (newest first)
  const sortedPayments = [...payments].sort((a: any, b: any) => {
    const dateA = new Date(a.processed_at || a.created_at || a.issued_at || 0);
    const dateB = new Date(b.processed_at || b.created_at || b.issued_at || 0);
    return dateB.getTime() - dateA.getTime();
  });

  const displayEnrollments = enrollments.length === 0 ? exampleEnrollments.slice(0, 1) : enrollments;
  const displayAttendance = attendance.length === 0 ? exampleAttendance.slice(0, 1) : attendance;
  const displayAssessments = assessments.length === 0 ? exampleAssessments.slice(0, 1) : assessments;
  const displayGrades = grades.length === 0 ? exampleGrades.slice(0, 1) : grades;
  const displayCertificates = certificates.length === 0 ? exampleCertificates.slice(0, 1) : certificates;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('pages.studentPortalTitle')}</h2>
          <p className="text-muted-foreground">{t('pages.studentPortalSubtitle')}</p>
        </div>
      </div>

      <Tabs defaultValue="enrollments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="enrollments">
            <BookOpen className="mr-2 h-4 w-4" />
            {t('pages.studentPortalTabEnrollments')}
          </TabsTrigger>
          <TabsTrigger value="attendance">
            <ClipboardCheck className="mr-2 h-4 w-4" />
            {t('pages.studentPortalTabAttendance')}
          </TabsTrigger>
          <TabsTrigger value="assessments">
            <FileCheck className="mr-2 h-4 w-4" />
            {t('pages.studentPortalTabAssessments')}
          </TabsTrigger>
          <TabsTrigger value="grades">
            <GraduationCap className="mr-2 h-4 w-4" />
            {t('pages.studentPortalTabGrades')}
          </TabsTrigger>
          <TabsTrigger value="certificates">
            <Award className="mr-2 h-4 w-4" />
            {t('pages.studentPortalTabCertificates')}
          </TabsTrigger>
          <TabsTrigger value="financial">
            <DollarSign className="mr-2 h-4 w-4" />
            {t('pages.studentPortalTabFinancial')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="enrollments">
          <Card>
            <CardHeader>
              <CardTitle>{t('pages.studentPortalCardEnrollmentsTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              {enrollments.length === 0 && <ExampleBanner />}
              <div className="space-y-4">
                {displayEnrollments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">{t('pages.studentPortalEnrollmentsNoneFound')}</p>
                ) : (
                  displayEnrollments.map((enrollment: any) => (
                    <div key={enrollment.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <p className="font-medium">{t('pages.studentPortalEnrollmentsCohort', { cohort: enrollment.cohort_name || enrollment.cohort })}</p>
                        <p className="text-sm text-muted-foreground">
                          {t('pages.studentPortalEnrollmentsEnrolled', { date: new Date(enrollment.enrolled_at).toLocaleDateString() })}
                        </p>
                      </div>
                      <Badge variant={getStatusVariant(enrollment.status)}>{enrollment.status}</Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>{t('pages.studentPortalCardAttendanceTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              {attendance.length === 0 && <ExampleBanner />}
              <div className="space-y-4">
                {displayAttendance.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">{t('pages.studentPortalAttendanceNoneFound')}</p>
                ) : (
                  displayAttendance.map((record: any) => (
                    <div key={record.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <p className="font-medium">{record.session_cohort || t('pages.studentPortalAttendanceSession')}</p>
                        <p className="text-sm text-muted-foreground">
                          {record.session_start ? format(new Date(record.session_start), 'PPp') : t('pages.studentPortalAttendanceDateNotAvailable')}
                        </p>
                      </div>
                      <Badge variant={getStatusVariant(record.status)}>{record.status_display || record.status}</Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessments">
          <Card>
            <CardHeader>
              <CardTitle>{t('pages.studentPortalCardAssessmentsTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              {assessments.length === 0 && <ExampleBanner />}
              <div className="space-y-4">
                {displayAssessments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">{t('pages.studentPortalAssessmentsNoneFound')}</p>
                ) : (
                  displayAssessments.map((assessment: any) => (
                    <div key={assessment.id} className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">{assessment.title}</p>
                        <Badge variant="outline">{assessment.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{assessment.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span>{t('pages.studentPortalAssessmentsMaxScore', { score: assessment.max_score })}</span>
                        {assessment.due_date && (
                          <span>{t('pages.studentPortalAssessmentsDue', { date: format(new Date(assessment.due_date), 'PPp') })}</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grades">
          <Card>
            <CardHeader>
              <CardTitle>{t('pages.studentPortalCardGradesTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              {grades.length === 0 && <ExampleBanner />}
              <div className="space-y-4">
                {displayGrades.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">{t('pages.studentPortalGradesNoneFound')}</p>
                ) : (
                  displayGrades.map((grade: any) => (
                    <div key={grade.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <p className="font-medium">{grade.assessment_title || t('pages.studentPortalGradesAssessment')}</p>
                        <p className="text-sm text-muted-foreground">
                          {t('pages.studentPortalGradesScore', { score: grade.score, max: grade.max_score, percentage: grade.percentage })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-lg">{grade.percentage}%</p>
                        <p className="text-xs text-muted-foreground">
                          {grade.graded_at ? format(new Date(grade.graded_at), 'PP') : ''}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates">
          <Card>
            <CardHeader>
              <CardTitle>{t('pages.studentPortalCardCertificatesTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              {certificates.length === 0 && <ExampleBanner />}
              <div className="space-y-4">
                {displayCertificates.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">{t('pages.studentPortalCertificatesNoneFound')}</p>
                ) : (
                  displayCertificates.map((certificate: any) => (
                    <div key={certificate.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <p className="font-medium">{t('pages.studentPortalCertificatesSerial', { serial: certificate.serial })}</p>
                        <p className="text-sm text-muted-foreground">
                          {t('pages.studentPortalCertificatesCohort', { cohort: certificate.cohort_name || certificate.cohort })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t('pages.studentPortalCertificatesIssued', { date: certificate.issued_at ? format(new Date(certificate.issued_at), 'PP') : t('pages.studentPortalNotAvailable') })}
                        </p>
                      </div>
                      <Badge variant={getStatusVariant(certificate.status)}>{certificate.status}</Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial">
          <div className="space-y-6">
            {/* Outstanding Balance Card */}
            <Card>
              <CardHeader>
                <CardTitle>{t('pages.studentPortalCardBalanceTitle')}</CardTitle>
                <CardDescription>{t('pages.studentPortalCardBalanceDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                {balanceLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : outstandingBalance ? (
                  <div className="space-y-4">
                    <div className={`text-4xl font-bold ${outstandingBalance.outstanding_balance_minor > 0 ? 'text-destructive' : 'text-green-600'}`}>
                      {formatCurrency(outstandingBalance.outstanding_balance_minor, outstandingBalance.currency)}
                    </div>
                    {outstandingBalance.outstanding_balance_minor > 0 ? (
                      <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                        <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-destructive">{t('pages.studentPortalBalanceOutstanding')}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {t('pages.studentPortalBalanceOutstandingMessage')}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-green-600">{t('pages.studentPortalBalanceAllPaid')}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {t('pages.studentPortalBalanceAllPaidMessage')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">{t('pages.studentPortalBalanceUnableToLoad')}</p>
                )}
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card>
              <CardHeader>
                <CardTitle>{t('pages.studentPortalCardPaymentHistoryTitle')}</CardTitle>
                <CardDescription>{t('pages.studentPortalCardPaymentHistoryDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                {paymentsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : sortedPayments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">{t('pages.studentPortalPaymentHistoryNone')}</p>
                  </div>
                ) : (
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('pages.studentPortalPaymentHistoryColumnDate')}</TableHead>
                          <TableHead>{t('pages.studentPortalPaymentHistoryColumnType')}</TableHead>
                          <TableHead>{t('pages.studentPortalPaymentHistoryColumnReference')}</TableHead>
                          <TableHead>{t('pages.studentPortalPaymentHistoryColumnAmount')}</TableHead>
                          <TableHead>{t('pages.studentPortalPaymentHistoryColumnStatus')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedPayments.map((item: any) => {
                          // Determine if this is a payment or invoice
                          const isPayment = item.payment_method !== undefined;
                          const isInvoice = item.invoice_number !== undefined || item.status === 'ISSUED' || item.status === 'PARTIAL' || item.status === 'PAID' || item.status === 'OVERDUE';
                          
                          const date = item.processed_at || item.issued_at || item.created_at;
                          const reference = isPayment 
                            ? (item.transaction_id || item.id.slice(0, 8))
                            : (item.invoice_number || item.id.slice(0, 8));
                          const amount = isPayment 
                            ? formatCurrencyString(item.amount, item.currency || 'USD')
                            : formatCurrencyString(item.total_amount || item.amount, item.currency || 'USD');
                          const status = item.status || 'PENDING';
                          const type = isPayment ? t('pages.studentPortalPaymentHistoryTypePayment') : isInvoice ? t('pages.studentPortalPaymentHistoryTypeInvoice') : t('pages.studentPortalPaymentHistoryTypeTransaction');

                          return (
                            <TableRow key={item.id}>
                              <TableCell>
                                {date ? format(new Date(date), 'PPp') : 'N/A'}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{type}</Badge>
                              </TableCell>
                              <TableCell className="font-mono text-sm">
                                {reference}
                              </TableCell>
                              <TableCell className="font-medium">
                                {amount}
                              </TableCell>
                              <TableCell>
                                <Badge variant={getStatusVariant(status)}>
                                  {item.status_display || status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Invoices Section (if payments include invoices) */}
            {sortedPayments.some((item: any) => item.invoice_number !== undefined) && (
              <Card>
                <CardHeader>
                <CardTitle>{t('pages.studentPortalCardInvoicesTitle')}</CardTitle>
                <CardDescription>{t('pages.studentPortalCardInvoicesDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sortedPayments
                      .filter((item: any) => item.invoice_number !== undefined)
                      .map((invoice: any) => (
                        <div key={invoice.id} className="p-4 border border-border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-medium">
                                {t('pages.studentPortalInvoicesNumber', { number: invoice.invoice_number || invoice.id.slice(0, 8) })}
                              </p>
                              {invoice.cohort_name && (
                                <p className="text-sm text-muted-foreground">
                                  {t('pages.studentPortalInvoicesCohort', { cohort: invoice.cohort_name })}
                                </p>
                              )}
                            </div>
                            <Badge variant={getStatusVariant(invoice.status)}>
                              {invoice.status_display || invoice.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">{t('pages.studentPortalInvoicesTotalAmount')}</p>
                              <p className="font-medium">
                                {formatCurrencyString(invoice.total_amount, invoice.currency || 'USD')}
                              </p>
                            </div>
                            {invoice.paid_amount && (
                              <div>
                                <p className="text-muted-foreground">{t('pages.studentPortalInvoicesPaid')}</p>
                                <p className="font-medium text-green-600">
                                  {formatCurrencyString(invoice.paid_amount, invoice.currency || 'USD')}
                                </p>
                              </div>
                            )}
                            {invoice.outstanding_amount && parseFloat(invoice.outstanding_amount) > 0 && (
                              <div>
                                <p className="text-muted-foreground">{t('pages.studentPortalInvoicesOutstanding')}</p>
                                <p className="font-medium text-destructive">
                                  {formatCurrencyString(invoice.outstanding_amount, invoice.currency || 'USD')}
                                </p>
                              </div>
                            )}
                            <div>
                              <p className="text-muted-foreground">{t('pages.studentPortalInvoicesDueDate')}</p>
                              <p className="font-medium">
                                {invoice.due_date ? format(new Date(invoice.due_date), 'PP') : t('pages.studentPortalNotAvailable')}
                              </p>
                              {invoice.due_date && new Date(invoice.due_date) < new Date() && invoice.status !== 'PAID' && (
                                <p className="text-xs text-destructive mt-1">{t('pages.studentPortalInvoicesOverdue')}</p>
                              )}
                            </div>
                          </div>
                          {invoice.notes && (
                            <p className="text-sm text-muted-foreground mt-3">{invoice.notes}</p>
                          )}
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

